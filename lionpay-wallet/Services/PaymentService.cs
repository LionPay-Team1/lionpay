using LionPay.Wallet.Models;
using LionPay.Wallet.Repositories;
using Npgsql;

namespace LionPay.Wallet.Services;

public interface IPaymentService
{
    Task<PaymentTransaction> ProcessPaymentAsync(Guid userId, PaymentRequest request,
        string? idempotencyKey);
}

public class PaymentService : IPaymentService
{
    private readonly IWalletRepository _walletRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IMerchantRepository _merchantRepository;
    private readonly NpgsqlDataSource _dataSource;

    public PaymentService(
        IWalletRepository walletRepository,
        ITransactionRepository transactionRepository,
        IMerchantRepository merchantRepository,
        NpgsqlDataSource dataSource)
    {
        _walletRepository = walletRepository;
        _transactionRepository = transactionRepository;
        _merchantRepository = merchantRepository;
        _dataSource = dataSource;
    }

    public async Task<PaymentTransaction> ProcessPaymentAsync(Guid userId, PaymentRequest request,
        string? idempotencyKey)
    {
        // 1. Idempotency Check
        if (!string.IsNullOrEmpty(idempotencyKey))
        {
            var existingTx = await _transactionRepository.GetTransactionByIdempotencyKeyAsync(idempotencyKey);
            if (existingTx != null)
            {
                if (existingTx.UserId != userId) throw new Exceptions.IdempotencyConflictException();
                return existingTx;
            }
        }

        // 2. Mock Currency Conversion (1 JPY = 9.12 KRW)
        // Ideally fetch from an external service
        decimal exchangeRate = 1.0m;
        if (request.Currency == "JPY") exchangeRate = 9.12m;

        decimal amountPoint = request.AmountCash * exchangeRate;

        // 3. Retry Loop for Optimistic Locking
        int retry = 0;
        const int maxRetry = 3;

        while (retry < maxRetry)
        {
            try
            {
                await using var connection = await _dataSource.OpenConnectionAsync();
                await using var transaction = await connection.BeginTransactionAsync();

                try
                {
                    // 4. Wallet & Balance Check
                    var wallet = await _walletRepository.GetWalletAsync(userId);

                    wallet = await _walletRepository.GetWalletForUpdateAsync(wallet?.WalletId ?? Guid.Empty,
                        transaction);

                    if (wallet == null)
                    {
                        throw new Exceptions.WalletNotFoundException();
                    }

                    if (wallet.Balance < amountPoint)
                    {
                        throw new Exceptions.InsufficientBalanceException();
                    }

                    // 5. Update Balance (Optimistic Lock)
                    var newBalance = wallet.Balance - amountPoint;

                    bool success = await _walletRepository.UpdateBalanceAsync(wallet.WalletId, newBalance,
                        wallet.Version, transaction);

                    if (!success)
                    {
                        await transaction.RollbackAsync();
                        retry++;
                        await Task.Delay(50 * retry);
                        continue; // Retry
                    }

                    // 6. Record Transaction
                    var merchant = await _merchantRepository.GetMerchantAsync(request.MerchantId);

                    var tx = new PaymentTransaction
                    {
                        TxId = Guid.NewGuid(),
                        MerchantId = request.MerchantId,
                        WalletId = wallet.WalletId,
                        UserId = userId,
                        TxType = "PAYMENT",
                        Amount = -amountPoint, // Signed Number Strategy
                        BalanceSnapshot = newBalance,
                        MerchantName = merchant?.MerchantName ?? "Unknown",
                        MerchantCategory = merchant?.MerchantCategory ?? "Unknown",
                        RegionCode = merchant?.CountryCode ?? "KR", // Default
                        TxStatus = "SUCCESS",
                        IdempotencyKey = idempotencyKey,
                        CreatedAt = DateTime.UtcNow,
                        OrderName = $"Payment to {merchant?.MerchantName ?? "Merchant"}"
                    };

                    await _transactionRepository.CreateTransactionAsync(tx, transaction);

                    await transaction.CommitAsync();
                    return tx;
                }
                catch (Exception ex) when (ex is not Exceptions.DomainException)
                {
                    await transaction.RollbackAsync();
                    retry++;
                    await Task.Delay(100 * retry);
                    // continue; // Implicit
                }
            }
            catch (Exception)
            {
                // Connection error etc
                retry++;
                if (retry >= maxRetry) throw;
                await Task.Delay(100 * retry);
            }
        }

        throw new Exceptions.PaymentFailedException();
    }
}
