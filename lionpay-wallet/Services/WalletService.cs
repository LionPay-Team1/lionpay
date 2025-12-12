using LionPay.Wallet.Exceptions;
using LionPay.Wallet.Repositories;
using LionPay.Wallet.Models;
using LionPay.Wallet.Infrastructure;


namespace LionPay.Wallet.Services;

public interface IWalletService
{
    Task<IEnumerable<WalletModel>> GetMyWalletsAsync(Guid userId);
    Task<WalletModel> GetMyWalletAsync(Guid userId, WalletType walletType);
    Task<WalletModel> ChargeAsync(Guid userId, decimal amount);
    Task<WalletModel> GetWalletByUserIdAsync(Guid userId, WalletType walletType);
    Task<WalletModel> AdjustBalanceAsync(Guid userId, WalletType walletType, decimal amount, string reason);
}

public class WalletService(
    IWalletRepository walletRepository,
    ITransactionRepository transactionRepository,
    IOccExecutionStrategy executionStrategy)
    : IWalletService
{
    public async Task<IEnumerable<WalletModel>> GetMyWalletsAsync(Guid userId)
    {
        var wallets = await walletRepository.GetWalletsAsync(userId);
        var walletList = wallets.ToList();

        // Lazy Provisioning: Create Money wallet if none exist
        if (walletList.Count == 0)
        {
            var moneyWallet = await ProvisionWalletAsync(userId, WalletType.Money);
            walletList.Add(moneyWallet);
        }

        return walletList;
    }

    public async Task<WalletModel> GetMyWalletAsync(Guid userId, WalletType walletType)
    {
        var wallet = await walletRepository.GetWalletAsync(userId, walletType);
        if (wallet != null)
        {
            return wallet;
        }

        // Lazy Provisioning for requested wallet type
        return await ProvisionWalletAsync(userId, walletType);
    }

    public async Task<WalletModel> ChargeAsync(Guid userId, decimal amount)
    {
        if (amount <= 0) throw new ValidationException("Amount must be positive.");

        // Charge is Money-only
        const WalletType walletType = WalletType.Money;

        // Ensure wallet exists (Lazy provisioning)
        await GetMyWalletAsync(userId, walletType);

        return await executionStrategy.ExecuteAsync(async () =>
        {
            var currentWallet = await walletRepository.GetWalletAsync(userId, walletType);
            if (currentWallet == null) throw new WalletNotFoundException();

            var newBalance = currentWallet.Balance + amount;
            var success =
                await walletRepository.UpdateBalanceAsync(currentWallet.WalletId, newBalance,
                    currentWallet.Version);

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
            await transactionRepository.CreateTransactionAsync(tx);

            currentWallet.Balance = newBalance;
            currentWallet.Version++;
            return currentWallet;
        });
    }

    public async Task<WalletModel> GetWalletByUserIdAsync(Guid userId, WalletType walletType)
    {
        return await GetMyWalletAsync(userId, walletType);
    }

    public async Task<WalletModel> AdjustBalanceAsync(Guid userId, WalletType walletType, decimal amount, string reason)
    {
        return await executionStrategy.ExecuteAsync(async () =>
        {
            var currentWallet = await walletRepository.GetWalletAsync(userId, walletType);
            if (currentWallet == null)
            {
                currentWallet = await ProvisionWalletAsync(userId, walletType);
            }

            var newBalance = currentWallet.Balance + amount;
            if (newBalance < 0)
            {
                throw new InsufficientBalanceException();
            }

            var success =
                await walletRepository.UpdateBalanceAsync(currentWallet.WalletId, newBalance,
                    currentWallet.Version);

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
            await transactionRepository.CreateTransactionAsync(tx);

            currentWallet.Balance = newBalance;
            currentWallet.Version++;
            return currentWallet;
        });
    }

    private async Task<WalletModel> ProvisionWalletAsync(Guid userId, WalletType walletType)
    {
        var newWallet = new WalletModel
        {
            WalletId = Guid.NewGuid(),
            UserId = userId,
            WalletType = walletType,
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

        var createdWallet = await walletRepository.GetWalletAsync(userId, walletType);
        return createdWallet ?? throw new WalletProvisioningFailedException();
    }
}



