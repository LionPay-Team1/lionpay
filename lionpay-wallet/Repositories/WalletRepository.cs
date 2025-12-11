using Dapper;
using Npgsql;

namespace LionPay.Wallet.Repositories;

public interface IWalletRepository
{
    Task<LionPay.Wallet.Models.Wallet?> GetWalletAsync(Guid userId);
    Task<LionPay.Wallet.Models.Wallet?> GetWalletForUpdateAsync(Guid walletId, NpgsqlTransaction? transaction = null);
    Task CreateWalletAsync(LionPay.Wallet.Models.Wallet wallet);

    Task<bool> UpdateBalanceAsync(Guid walletId, decimal newBalance, int currentVersion,
        NpgsqlTransaction? transaction = null);
}

public class WalletRepository(NpgsqlDataSource dataSource) : IWalletRepository
{
    public async Task<LionPay.Wallet.Models.Wallet?> GetWalletAsync(Guid userId)
    {
        const string sql =
            """
            SELECT 
                wallet_id AS WalletId,
                user_id AS UserId,
                wallet_type AS WalletType,
                balance AS Balance,
                version AS Version,
                created_at AS CreatedAt,
                updated_at AS UpdatedAt
            FROM wallets
            WHERE user_id = @UserId
            """;

        await using var connection = dataSource.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<LionPay.Wallet.Models.Wallet>(sql, new { UserId = userId });
    }

    public async Task<LionPay.Wallet.Models.Wallet?> GetWalletForUpdateAsync(Guid walletId,
        NpgsqlTransaction? transaction = null)
    {
        const string sql =
            """
            SELECT 
                wallet_id AS WalletId,
                user_id AS UserId,
                wallet_type AS WalletType,
                balance AS Balance,
                version AS Version,
                created_at AS CreatedAt,
                updated_at AS UpdatedAt
            FROM wallets
            WHERE wallet_id = @WalletId
            """;

        var connection = transaction?.Connection ?? dataSource.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<LionPay.Wallet.Models.Wallet>(sql,
            new { WalletId = walletId }, transaction);
    }

    public async Task CreateWalletAsync(LionPay.Wallet.Models.Wallet wallet)
    {
        const string sql =
            """
            INSERT INTO wallets (wallet_id, user_id, wallet_type, balance, version, created_at, updated_at)
            VALUES (@WalletId, @UserId, @WalletType, @Balance, @Version, @CreatedAt, @UpdatedAt)
            ON CONFLICT (wallet_id, user_id) DO NOTHING
            """; // Lazy provisioning can accept getting existing

        await using var connection = dataSource.CreateConnection();
        await connection.ExecuteAsync(sql, wallet);
    }

    public async Task<bool> UpdateBalanceAsync(Guid walletId, decimal newBalance, int currentVersion,
        NpgsqlTransaction? transaction = null)
    {
        const string sql =
            """
            UPDATE wallets
            SET balance = @NewBalance, 
                version = version + 1,
                updated_at = NOW()
            WHERE wallet_id = @WalletId AND version = @CurrentVersion
            """;

        var connection = transaction?.Connection ?? dataSource.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, new
        {
            NewBalance = newBalance,
            WalletId = walletId,
            CurrentVersion = currentVersion
        }, transaction);

        return affected > 0;
    }
}