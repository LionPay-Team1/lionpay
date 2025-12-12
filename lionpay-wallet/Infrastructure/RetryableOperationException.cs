using LionPay.Wallet.Exceptions;

namespace LionPay.Wallet.Infrastructure;

public class RetryableOperationException(string message = "Operation needs to be retried due to concurrency.")
    : DomainException("RETRY_NEEDED", message, System.Net.HttpStatusCode.Conflict);
