using LionPay.Wallet.Models;
using LionPay.Wallet.Repositories;

namespace LionPay.Wallet.Services;

public interface ITransactionService
{
    Task<IEnumerable<PaymentTransaction>> GetHistoryAsync(Guid userId, int limit, int offset);
}

public class TransactionService(ITransactionRepository transactionRepository) : ITransactionService
{
    public async Task<IEnumerable<PaymentTransaction>> GetHistoryAsync(Guid userId, int limit, int offset)
    {
        return await transactionRepository.GetTransactionsAsync(userId, limit, offset);
    }
}
