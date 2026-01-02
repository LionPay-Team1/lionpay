using System.Data;
using System.Diagnostics.Metrics;
using LionPay.Wallet.Exceptions;
using LionPay.Wallet.Infrastructure;
using LionPay.Wallet.Models;
using LionPay.Wallet.Repositories;
using Npgsql;


namespace LionPay.Wallet.Services;

public interface IWalletService
{
    Task<WalletModel> GetMyWalletAsync(Guid userId);
    Task<WalletModel> ChargeAsync(Guid userId, decimal amount);
    Task<WalletModel> GetWalletByUserIdAsync(Guid userId);
    Task<WalletModel> AdjustBalanceAsync(Guid userId, decimal amount, string reason);
}

public class WalletService : IWalletService
{
    private readonly IWalletRepository _walletRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly NpgsqlDataSource _dataSource;
    private readonly IOccExecutionStrategy _executionStrategy;

    // OpenTelemetry 커스텀 메트릭
    private static readonly Meter Meter = new("lionpay.wallet", "1.0.0");

    private static readonly Histogram<double> ChargeAmountHistogram = Meter.CreateHistogram<double>(
        "wallet.charge.amount",
        unit: "KRW",
        description: "충전 금액 분포");

    private static readonly Counter<long> ChargeCounter = Meter.CreateCounter<long>(
        "wallet.charge.count",
        unit: "1",
        description: "충전 횟수");

    public WalletService(
        IWalletRepository walletRepository,
        ITransactionRepository transactionRepository,
        NpgsqlDataSource dataSource,
        IOccExecutionStrategy executionStrategy)
    {
        _walletRepository = walletRepository;
        _transactionRepository = transactionRepository;
        _dataSource = dataSource;
        _executionStrategy = executionStrategy;
    }

    public async Task<WalletModel> GetMyWalletAsync(Guid userId)
    {
        var wallet = await _walletRepository.GetWalletAsync(userId, WalletType.Money);
        if (wallet != null)
        {
            return wallet;
        }

        // Lazy Provisioning for Money wallet
        return await ProvisionWalletAsync(userId);
    }

    public async Task<WalletModel> ChargeAsync(Guid userId, decimal amount)
    {
        if (amount <= 0) throw new ValidationException("Amount must be positive.");

        // Ensure wallet exists (Lazy provisioning)
        await GetMyWalletAsync(userId);

        return await _executionStrategy.ExecuteAsync(async () =>
        {
            await using var connection = await _dataSource.OpenConnectionAsync();
            // DSQL only supports SNAPSHOT isolation level (which maps to RepeatableRead or Snapshot in ADO.NET)
            // Postgres RepeatableRead is close to Snapshot isolation.
            await using var transaction = await connection.BeginTransactionAsync(System.Data.IsolationLevel.Snapshot);

            try
            {
                var currentWallet = await _walletRepository.GetWalletAsync(userId, WalletType.Money);
                if (currentWallet == null) throw new WalletNotFoundException();

                // Fetch current wallet state within transaction for OCC
                currentWallet = await _walletRepository.GetWalletByIdAsync(currentWallet.WalletId, transaction);
                if (currentWallet == null) throw new WalletNotFoundException();

                var newBalance = currentWallet.Balance + amount;
                var success = await _walletRepository.UpdateBalanceAsync(
                    currentWallet.WalletId,
                    newBalance,
                    currentWallet.Version,
                    transaction);

                if (!success)
                {
                    // Optimistic lock failed - retry via strategy
                    throw new RetryableOperationException();
                }

                var tx = new PaymentTransactionModel
                {
                    TxId = Guid.NewGuid(),
                    WalletId = currentWallet.WalletId,
                    UserId = userId,
                    TxType = TxType.Charge,
                    Amount = amount,
                    BalanceSnapshot = newBalance,
                    TxStatus = TxStatus.Success,
                    CreatedAt = DateTime.UtcNow
                };
                await _transactionRepository.CreateTransactionAsync(tx, transaction);

                await transaction.CommitAsync();

                // 커스텀 메트릭 기록
                ChargeAmountHistogram.Record((double)amount);
                ChargeCounter.Add(1);

                currentWallet.Balance = newBalance;
                currentWallet.Version++;
                return currentWallet;
            }
            catch (Exception ex) when (ex is not DomainException)
            {
                // Transaction rollback is automatic via 'await using'
                throw;
            }
        });
    }

    public async Task<WalletModel> GetWalletByUserIdAsync(Guid userId)
    {
        return await GetMyWalletAsync(userId);
    }

    public async Task<WalletModel> AdjustBalanceAsync(Guid userId, decimal amount, string reason)
    {
        return await _executionStrategy.ExecuteAsync(async () =>
        {
            await using var connection = await _dataSource.OpenConnectionAsync();
            // DSQL only supports SNAPSHOT isolation level (which maps to RepeatableRead or Snapshot in ADO.NET)
            // Postgres RepeatableRead is close to Snapshot isolation.
            await using var transaction = await connection.BeginTransactionAsync(IsolationLevel.Snapshot);

            try
            {
                var currentWallet = await _walletRepository.GetWalletAsync(userId, WalletType.Money);
                if (currentWallet == null)
                {
                    currentWallet = await ProvisionWalletAsync(userId);
                }

                // Fetch current wallet state within transaction for OCC
                currentWallet = await _walletRepository.GetWalletByIdAsync(currentWallet.WalletId, transaction);
                if (currentWallet == null) throw new WalletNotFoundException();

                var newBalance = currentWallet.Balance + amount;
                if (newBalance < 0)
                {
                    throw new InsufficientBalanceException();
                }

                var success = await _walletRepository.UpdateBalanceAsync(
                    currentWallet.WalletId,
                    newBalance,
                    currentWallet.Version,
                    transaction);

                if (!success)
                {
                    throw new RetryableOperationException();
                }

                var tx = new PaymentTransactionModel
                {
                    TxId = Guid.NewGuid(),
                    WalletId = currentWallet.WalletId,
                    UserId = userId,
                    TxType = amount > 0 ? TxType.AdminCharge : TxType.AdminDeduct,
                    OrderName = reason,
                    Amount = amount,
                    BalanceSnapshot = newBalance,
                    TxStatus = TxStatus.Success,
                    CreatedAt = DateTime.UtcNow
                };
                await _transactionRepository.CreateTransactionAsync(tx, transaction);

                await transaction.CommitAsync();

                currentWallet.Balance = newBalance;
                currentWallet.Version++;
                return currentWallet;
            }
            catch (Exception ex) when (ex is not DomainException)
            {
                // Transaction rollback is automatic via 'await using'
                throw;
            }
        });
    }

    private async Task<WalletModel> ProvisionWalletAsync(Guid userId)
    {
        var newWallet = new WalletModel
        {
            WalletId = Guid.NewGuid(),
            UserId = userId,
            WalletType = WalletType.Money,
            Balance = 0,
            Version = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        try
        {
            await _walletRepository.CreateWalletAsync(newWallet);
        }
        catch (DuplicateException)
        {
            // Ignore - wallet was created by another concurrent request (Lazy provisioning)
        }

        var createdWallet = await _walletRepository.GetWalletAsync(userId, WalletType.Money);
        return createdWallet ?? throw new WalletProvisioningFailedException();
    }
}
