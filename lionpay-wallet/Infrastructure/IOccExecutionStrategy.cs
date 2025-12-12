namespace LionPay.Wallet.Infrastructure;

public interface IOccExecutionStrategy
{
    Task<T> ExecuteAsync<T>(Func<Task<T>> operation);
    Task ExecuteAsync(Func<Task> operation);
}
