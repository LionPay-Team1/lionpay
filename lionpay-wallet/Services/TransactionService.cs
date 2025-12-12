using LionPay.Wallet.Models;
using LionPay.Wallet.Repositories;

namespace LionPay.Wallet.Services;

public interface ITransactionService
{
    Task<IEnumerable<PaymentTransactionModel>> GetHistoryAsync(Guid userId, int limit, int offset);

    // Admin method for specific user
    Task<IEnumerable<PaymentTransactionModel>> GetUserHistoryAsync(Guid userId, int limit, int offset);
}

public class TransactionService(ITransactionRepository transactionRepository) : ITransactionService
{
    public async Task<IEnumerable<PaymentTransactionModel>> GetHistoryAsync(Guid userId, int limit, int offset)
    {
        return await transactionRepository.GetTransactionsAsync(userId, limit, offset);
    }

    public async Task<IEnumerable<PaymentTransactionModel>> GetUserHistoryAsync(Guid userId, int limit, int offset)
    {
        return await GetHistoryAsync(userId, limit, offset);
    }
}


