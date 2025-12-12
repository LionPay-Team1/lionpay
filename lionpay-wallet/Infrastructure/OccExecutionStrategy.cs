using Npgsql;

namespace LionPay.Wallet.Infrastructure;

public class OccExecutionStrategy(ILogger<OccExecutionStrategy> logger) : IOccExecutionStrategy
{
    // Aurora DSQL OC000: Mutation conflicts with another transaction
    private const string AuroraDsqlTransactionConflict = "OC000";

    // Aurora DSQL OC001: Schema has been updated by another transaction
    private const string AuroraDsqlSchemaConflict = "OC001";

    // PostgreSQL 40001: Serialization failure
    private const string SerializationFailure = "40001";

    public async Task<T> ExecuteAsync<T>(Func<Task<T>> operation)
    {
        int retry = 0;
        const int maxRetry = 3;

        while (true)
        {
            try
            {
                return await operation();
            }
            catch (RetryableOperationException ex)
            {
                if (retry >= maxRetry)
                {
                    logger.LogError(ex, "Max retries ({MaxRetry}) reached for explicit retryable operation.", maxRetry);
                    throw;
                }

                retry++;
                logger.LogWarning("Explicit retry requested. Retry {Retry}/{MaxRetry}", retry, maxRetry);
                await Task.Delay(CalculateBackoff(retry));
            }
            catch (PostgresException ex) when (IsTransactionConflict(ex))
            {
                if (retry >= maxRetry)
                {
                    logger.LogError(ex, "Max retries ({MaxRetry}) reached for transaction conflict (SqlState: {SqlState}).", maxRetry,
                        ex.SqlState);
                    throw;
                }

                retry++;
                logger.LogWarning(
                    "Transaction conflict detected (SqlState: {SqlState}). Retry {Retry}/{MaxRetry}",
                    ex.SqlState, retry, maxRetry);
                await Task.Delay(CalculateBackoff(retry));
            }
        }
    }

    public async Task ExecuteAsync(Func<Task> operation)
    {
        await ExecuteAsync(async () =>
        {
            await operation();
            return true;
        });
    }

    private static bool IsTransactionConflict(PostgresException ex)
    {
        return ex.SqlState == AuroraDsqlTransactionConflict ||
               ex.SqlState == AuroraDsqlSchemaConflict ||
               ex.SqlState == SerializationFailure;
    }

    private static int CalculateBackoff(int retry)
    {
        // Exponential backoff with jitter: base * 2^retry + random jitter
        const int baseDelay = 50;
        var exponentialDelay = baseDelay * (1 << retry); // 50, 100, 200, 400...
        var jitter = Random.Shared.Next(0, 50);
        return Math.Min(exponentialDelay + jitter, 2000); // Cap at 2 seconds
    }
}
