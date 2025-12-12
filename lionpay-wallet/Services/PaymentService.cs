using LionPay.Wallet.Exceptions;
using LionPay.Wallet.Infrastructure;
using LionPay.Wallet.Models;
using LionPay.Wallet.Repositories;
using Npgsql;

namespace LionPay.Wallet.Services;

public interface IPaymentService
{
    Task<PaymentTransactionModel> ProcessPaymentAsync(Guid userId, PaymentRequest request, string? idempotencyKey);
}

public class PaymentService(
    IWalletRepository walletRepository,
    ITransactionRepository transactionRepository,
    IMerchantRepository merchantRepository,
    NpgsqlDataSource dataSource,
    IOccExecutionStrategy executionStrategy)
    : IPaymentService
{
    public async Task<PaymentTransactionModel> ProcessPaymentAsync(Guid userId, PaymentRequest request,
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

        // 3. Execution Strategy (Retry Loop for Optimistic Locking / Aurora DSQL OCC)
        return await executionStrategy.ExecuteAsync(async () =>
        {
            await using var connection = await dataSource.OpenConnectionAsync();
            await using var transaction = await connection.BeginTransactionAsync();

            try
            {
                // 4. WalletModel & Balance Check
                var wallet = await walletRepository.GetWalletAsync(userId, WalletType.Money);

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
                    throw new RetryableOperationException();
                }

                // 6. Record Transaction
                var merchant = await merchantRepository.GetMerchantAsync(request.MerchantId);

                var tx = new PaymentTransactionModel
                {
                    TxId = Guid.NewGuid(),
                    MerchantId = request.MerchantId,
                    WalletId = wallet.WalletId,
                    UserId = userId,
                    TxType = TxType.Payment,
                    Amount = -amountPoint, // Signed Number Strategy
                    BalanceSnapshot = newBalance,
                    MerchantName = merchant?.MerchantName ?? "Unknown",
                    MerchantCategory = merchant?.MerchantCategory ?? "Unknown",
                    RegionCode = merchant?.CountryCode ?? "KR", // Default
                    TxStatus = TxStatus.Success,
                    IdempotencyKey = idempotencyKey,
                    CreatedAt = DateTime.UtcNow,
                    OrderName = $"Payment to {merchant?.MerchantName ?? "Unknown"}"
                };

                await transactionRepository.CreateTransactionAsync(tx, transaction);

                await transaction.CommitAsync();
                return tx;
            }
            catch (Exception ex) when (ex is not DomainException)
            {
                // Let the strategy handle retries for system errors
                // Transaction rollback is automatic via 'await using'
                throw;
            }
        });
    }
}



