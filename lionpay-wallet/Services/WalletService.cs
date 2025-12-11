using LionPay.Wallet.Repositories;
using WalletModel = LionPay.Wallet.Models.Wallet;

namespace LionPay.Wallet.Services;

public interface IWalletService
{
    Task<WalletModel> GetMyWalletAsync(Guid userId);
    Task<WalletModel> ChargeAsync(Guid userId, decimal amount);
}

public class WalletService(IWalletRepository walletRepository, ITransactionRepository transactionRepository)
    : IWalletService
{
    public async Task<WalletModel> GetMyWalletAsync(Guid userId)
    {
        var wallet = await walletRepository.GetWalletAsync(userId);
        if (wallet != null)
        {
            return wallet;
        }

        // Lazy Provisioning
        var newWallet = new WalletModel
        {
            WalletId = Guid.NewGuid(),
            UserId = userId,
            WalletType = "POINT",
            Balance = 0,
            Version = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        try
        {
            await walletRepository.CreateWalletAsync(newWallet);
        }
        catch (Exception)
        {
            // Ignore (Concurrent creation)
        }

        var createdWallet = await walletRepository.GetWalletAsync(userId);
        return createdWallet ?? throw new InvalidOperationException("Failed to provision wallet.");
    }

    public async Task<WalletModel> ChargeAsync(Guid userId, decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Amount must be positive.");

        // Ensure wallet exists (Lazy provisioning)
        await GetMyWalletAsync(userId);

        // Simple charge doesn't require complex retry/transaction for this specific requirement in this basic scope,
        // BUT for consistency and safety, we should really use the optimistic lock pattern here too.
        // However, the prompt specifically emphasized it for PAYMENT. 
        // For Charge, we will do a simple update loop as well.

        int retry = 0;
        const int maxRetry = 3;

        while (retry < maxRetry)
        {
            var currentWallet = await walletRepository.GetWalletAsync(userId);
            if (currentWallet == null) throw new InvalidOperationException("Wallet not found.");

            var newBalance = currentWallet.Balance + amount;
            var success =
                await walletRepository.UpdateBalanceAsync(currentWallet.WalletId, newBalance, currentWallet.Version);

            if (success)
            {
                // Log transaction (ideally inside a DB transaction scope, but kept ensuring update succeeded first here)
                // For strict consistency, we should use NpgsqlTransaction.
                // Let's keep it simple for now as requested.
                var tx = new LionPay.Wallet.Models.PaymentTransaction
                {
                    TxId = Guid.NewGuid(),
                    WalletId = currentWallet.WalletId,
                    UserId = userId,
                    TxType = "CHARGE",
                    Amount = amount,
                    BalanceSnapshot = newBalance,
                    TxStatus = "SUCCESS",
                    CreatedAt = DateTime.UtcNow
                };
                await transactionRepository.CreateTransactionAsync(tx);

                currentWallet.Balance = newBalance;
                currentWallet.Version++;
                return currentWallet;
            }

            retry++;
            await Task.Delay(50 * retry);
        }

        throw new Exceptions.ChargeFailedException();
    }
}
