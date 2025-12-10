using LionPay.Wallet.Models;
using LionPay.Wallet.Repositories;

namespace LionPay.Wallet.Services;

public interface ITransactionService
{
    Task<IEnumerable<PaymentTransaction>> GetHistoryAsync(Guid userId, int limit, int offset);
}

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _transactionRepository;

    public TransactionService(ITransactionRepository transactionRepository)
    {
        _transactionRepository = transactionRepository;
    }

    public async Task<IEnumerable<PaymentTransaction>> GetHistoryAsync(Guid userId, int limit, int offset)
    {
        return await _transactionRepository.GetTransactionsAsync(userId, limit, offset);
    }
}
