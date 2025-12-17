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

public class WalletService(
    IWalletRepository walletRepository,
    ITransactionRepository transactionRepository,
    NpgsqlDataSource dataSource,
    IOccExecutionStrategy executionStrategy)
    : IWalletService
{
    public async Task<WalletModel> GetMyWalletAsync(Guid userId)
    {
        var wallet = await walletRepository.GetWalletAsync(userId, WalletType.Money);
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

        return await executionStrategy.ExecuteAsync(async () =>
        {
            await using var connection = await dataSource.OpenConnectionAsync();
            await using var transaction = await connection.BeginTransactionAsync();

            try
            {
                var currentWallet = await walletRepository.GetWalletAsync(userId, WalletType.Money);
                if (currentWallet == null) throw new WalletNotFoundException();

                // Fetch current wallet state within transaction for OCC
                currentWallet = await walletRepository.GetWalletByIdAsync(currentWallet.WalletId, transaction);
                if (currentWallet == null) throw new WalletNotFoundException();

                var newBalance = currentWallet.Balance + amount;
                var success = await walletRepository.UpdateBalanceAsync(
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
                await transactionRepository.CreateTransactionAsync(tx, transaction);

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

    public async Task<WalletModel> GetWalletByUserIdAsync(Guid userId)
    {
        return await GetMyWalletAsync(userId);
    }

    public async Task<WalletModel> AdjustBalanceAsync(Guid userId, decimal amount, string reason)
    {
        return await executionStrategy.ExecuteAsync(async () =>
        {
            await using var connection = await dataSource.OpenConnectionAsync();
            await using var transaction = await connection.BeginTransactionAsync();

            try
            {
                var currentWallet = await walletRepository.GetWalletAsync(userId, WalletType.Money);
                if (currentWallet == null)
                {
                    currentWallet = await ProvisionWalletAsync(userId);
                }

                // Fetch current wallet state within transaction for OCC
                currentWallet = await walletRepository.GetWalletByIdAsync(currentWallet.WalletId, transaction);
                if (currentWallet == null) throw new WalletNotFoundException();

                var newBalance = currentWallet.Balance + amount;
                if (newBalance < 0)
                {
                    throw new InsufficientBalanceException();
                }

                var success = await walletRepository.UpdateBalanceAsync(
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
                    Amount = Math.Abs(amount),
                    BalanceSnapshot = newBalance,
                    TxStatus = TxStatus.Success,
                    CreatedAt = DateTime.UtcNow
                };
                await transactionRepository.CreateTransactionAsync(tx, transaction);

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
            await walletRepository.CreateWalletAsync(newWallet);
        }
        catch (DuplicateException)
        {
            // Ignore - wallet was created by another concurrent request (Lazy provisioning)
        }

        var createdWallet = await walletRepository.GetWalletAsync(userId, WalletType.Money);
        return createdWallet ?? throw new WalletProvisioningFailedException();
    }
}
