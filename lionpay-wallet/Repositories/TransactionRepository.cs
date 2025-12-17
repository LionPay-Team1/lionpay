using Dapper;
using LionPay.Wallet.Models;
using Npgsql;

namespace LionPay.Wallet.Repositories;

public interface ITransactionRepository
{
    Task CreateTransactionAsync(PaymentTransactionModel transaction, NpgsqlTransaction? dbTx = null);
    Task<IEnumerable<PaymentTransactionModel>> GetTransactionsAsync(Guid userId, int limit = 10, int offset = 0);
    Task<PaymentTransactionModel?> GetTransactionByIdempotencyKeyAsync(string idempotencyKey);
    Task<long> CountTransactionsAsync();
}

public class TransactionRepository(NpgsqlDataSource dataSource) : ITransactionRepository
{
    public async Task CreateTransactionAsync(PaymentTransactionModel transaction, NpgsqlTransaction? dbTx = null)
    {
        const string sql =
            """
            INSERT INTO transactions (
               tx_id, merchant_id, wallet_id, user_id, group_tx_id, tx_type, order_name, 
               amount, balance_snapshot, merchant_name, merchant_category, region_code, 
               tx_status, currency, original_amount, idempotency_key, created_at
            ) VALUES (
               @TxId, @MerchantId, @WalletId, @UserId, @GroupTxId, @TxType, @OrderName, 
               @Amount, @BalanceSnapshot, @MerchantName, @MerchantCategory, @RegionCode, 
               @TxStatus, @Currency, @OriginalAmount, @IdempotencyKey, @CreatedAt
            )
            """;

        try
        {
            var connection = dbTx?.Connection ?? dataSource.CreateConnection();
            await connection.ExecuteAsync(sql, transaction, dbTx);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            throw new Exceptions.DuplicateException("Transaction with this ID or idempotency key already exists.");
        }
    }

    public async Task<IEnumerable<PaymentTransactionModel>> GetTransactionsAsync(Guid userId, int limit = 10, int offset = 0)
    {
        const string sql =
            """
            SELECT 
                tx_id AS TxId,
                merchant_id AS MerchantId,
                wallet_id AS WalletId,
                user_id AS UserId,
                group_tx_id AS GroupTxId,
                tx_type AS TxType,
                order_name AS OrderName,
                amount AS Amount,
                balance_snapshot AS BalanceSnapshot,
                merchant_name AS MerchantName,
                merchant_category AS MerchantCategory,
                region_code AS RegionCode,
                tx_status AS TxStatus,
                currency AS Currency,
                original_amount AS OriginalAmount,
                idempotency_key AS IdempotencyKey,
                created_at AS CreatedAt
            FROM transactions
            WHERE user_id = @UserId
            ORDER BY created_at DESC
            LIMIT @Limit OFFSET @Offset
            """;

        await using var connection = dataSource.CreateConnection();
        return await connection.QueryAsync<PaymentTransactionModel>(sql,
            new { UserId = userId, Limit = limit, Offset = offset });
    }

    public async Task<PaymentTransactionModel?> GetTransactionByIdempotencyKeyAsync(string idempotencyKey)
    {
        const string sql =
            """
            SELECT 
                tx_id AS TxId,
                merchant_id AS MerchantId,
                wallet_id AS WalletId,
                user_id AS UserId,
                group_tx_id AS GroupTxId,
                tx_type AS TxType,
                order_name AS OrderName,
                amount AS Amount,
                balance_snapshot AS BalanceSnapshot,
                merchant_name AS MerchantName,
                merchant_category AS MerchantCategory,
                region_code AS RegionCode,
                tx_status AS TxStatus,
                currency AS Currency,
                original_amount AS OriginalAmount,
                idempotency_key AS IdempotencyKey,
                created_at AS CreatedAt
            FROM transactions
            WHERE idempotency_key = @IdempotencyKey
            """;

        await using var connection = dataSource.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<PaymentTransactionModel>(sql,
            new { IdempotencyKey = idempotencyKey });
    }

    public async Task<long> CountTransactionsAsync()
    {
        const string sql = "SELECT COUNT(*) FROM transactions";
        await using var connection = dataSource.CreateConnection();
        return await connection.ExecuteScalarAsync<long>(sql);
    }
}

