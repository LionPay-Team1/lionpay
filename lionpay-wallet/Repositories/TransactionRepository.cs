using Dapper;
using LionPay.Wallet.Models;
using Npgsql;

namespace LionPay.Wallet.Repositories;

public interface ITransactionRepository
{
    Task CreateTransactionAsync(PaymentTransaction transaction, NpgsqlTransaction? dbTx = null);
    Task<IEnumerable<PaymentTransaction>> GetTransactionsAsync(Guid userId, int limit = 10, int offset = 0);
    Task<PaymentTransaction?> GetTransactionByIdempotencyKeyAsync(string idempotencyKey);
}

public class TransactionRepository(NpgsqlDataSource dataSource) : ITransactionRepository
{
    public async Task CreateTransactionAsync(PaymentTransaction transaction, NpgsqlTransaction? dbTx = null)
    {
        const string sql =
            """
            INSERT INTO transactions (
               tx_id, merchant_id, wallet_id, user_id, group_tx_id, tx_type, order_name, 
               amount, balance_snapshot, merchant_name, merchant_category, region_code, 
               tx_status, idempotency_key, created_at
            ) VALUES (
               @TxId, @MerchantId, @WalletId, @UserId, @GroupTxId, @TxType, @OrderName, 
               @Amount, @BalanceSnapshot, @MerchantName, @MerchantCategory, @RegionCode, 
               @TxStatus, @IdempotencyKey, @CreatedAt
            )
            """;

        var connection = dbTx?.Connection ?? dataSource.CreateConnection();
        await connection.ExecuteAsync(sql, transaction, dbTx);
    }

    public async Task<IEnumerable<PaymentTransaction>> GetTransactionsAsync(Guid userId, int limit = 10, int offset = 0)
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
                idempotency_key AS IdempotencyKey,
                created_at AS CreatedAt
            FROM transactions
            WHERE user_id = @UserId
            ORDER BY created_at DESC
            LIMIT @Limit OFFSET @Offset
            """;

        await using var connection = dataSource.CreateConnection();
        return await connection.QueryAsync<PaymentTransaction>(sql,
            new { UserId = userId, Limit = limit, Offset = offset });
    }

    public async Task<PaymentTransaction?> GetTransactionByIdempotencyKeyAsync(string idempotencyKey)
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
                idempotency_key AS IdempotencyKey,
                created_at AS CreatedAt
            FROM transactions
            WHERE idempotency_key = @IdempotencyKey
            """;

        await using var connection = dataSource.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<PaymentTransaction>(sql,
            new { IdempotencyKey = idempotencyKey });
    }
}
