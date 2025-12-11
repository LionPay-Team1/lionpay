using LionPay.Wallet.Exceptions;
using LionPay.Wallet.Models;
using LionPay.Wallet.Repositories;
using Npgsql;

namespace LionPay.Wallet.Services;

public interface IPaymentService
{
    Task<PaymentTransaction> ProcessPaymentAsync(Guid userId, PaymentRequest request, string? idempotencyKey);
}

public class PaymentService(
    IWalletRepository walletRepository,
    ITransactionRepository transactionRepository,
    IMerchantRepository merchantRepository,
    NpgsqlDataSource dataSource)
    : IPaymentService
{
    public async Task<PaymentTransaction> ProcessPaymentAsync(Guid userId, PaymentRequest request,
        string? idempotencyKey)
    {
        // 1. Idempotency Check
        if (!string.IsNullOrEmpty(idempotencyKey))
        {
            var existingTx = await transactionRepository.GetTransactionByIdempotencyKeyAsync(idempotencyKey);
            if (existingTx != null)
            {
                return existingTx.UserId != userId ? throw new IdempotencyConflictException() : existingTx;
            }
        }

        // 2. Mock Currency Conversion (1 JPY = 9.12 KRW)
        // Ideally fetch from an external service
        var exchangeRate = 1.0m;
        if (request.Currency == "JPY") exchangeRate = 9.12m;

        var amountPoint = request.AmountCash * exchangeRate;

        // 3. Retry Loop for Optimistic Locking
        var retry = 0;
        const int maxRetry = 3;

        while (retry < maxRetry)
        {
            try
            {
                await using var connection = await dataSource.OpenConnectionAsync();
                await using var transaction = await connection.BeginTransactionAsync();

                try
                {
                    // 4. Wallet & Balance Check
                    var wallet = await walletRepository.GetWalletAsync(userId);

                    wallet = await walletRepository.GetWalletForUpdateAsync(wallet?.WalletId ?? Guid.Empty,
                        transaction);

                    if (wallet == null)
                    {
                        throw new WalletNotFoundException();
                    }

                    if (wallet.Balance < amountPoint)
                    {
                        throw new InsufficientBalanceException();
                    }

                    // 5. Update Balance (Optimistic Lock)
                    var newBalance = wallet.Balance - amountPoint;

                    bool success = await walletRepository.UpdateBalanceAsync(wallet.WalletId, newBalance,
                        wallet.Version, transaction);

                    if (!success)
                    {
                        await transaction.RollbackAsync();
                        retry++;
                        await Task.Delay(50 * retry);
                        continue; // Retry
                    }

                    // 6. Record Transaction
                    var merchant = await merchantRepository.GetMerchantAsync(request.MerchantId);

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

                    await transactionRepository.CreateTransactionAsync(tx, transaction);

                    await transaction.CommitAsync();
                    return tx;
                }
                catch (Exception ex) when (ex is not DomainException)
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

        throw new PaymentFailedException();
    }
}
