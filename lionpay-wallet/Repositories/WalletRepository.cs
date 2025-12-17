using Dapper;
using LionPay.Wallet.Models;
using Npgsql;

namespace LionPay.Wallet.Repositories;

public interface IWalletRepository
{
    Task<IEnumerable<WalletModel>> GetWalletsAsync(Guid userId);
    Task<WalletModel?> GetWalletAsync(Guid userId, WalletType walletType);
    Task<WalletModel?> GetWalletByIdAsync(Guid walletId, NpgsqlTransaction? transaction = null);
    Task CreateWalletAsync(WalletModel wallet);

    Task<bool> UpdateBalanceAsync(Guid walletId, decimal newBalance, int currentVersion,
        NpgsqlTransaction? transaction = null);
}

public class WalletRepository(NpgsqlDataSource dataSource) : IWalletRepository
{
    public async Task<IEnumerable<WalletModel>> GetWalletsAsync(Guid userId)
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
        return await connection.QueryAsync<WalletModel>(sql, new { UserId = userId });
    }

    public async Task<WalletModel?> GetWalletAsync(Guid userId, WalletType walletType)
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
            WHERE user_id = @UserId AND wallet_type = @WalletType
            """;

        await using var connection = dataSource.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<WalletModel>(sql, new { UserId = userId, WalletType = (int)walletType });
    }

    public async Task<WalletModel?> GetWalletByIdAsync(Guid walletId,
        NpgsqlTransaction? transaction = null)
    {
        // Note: FOR UPDATE is not used because Aurora DSQL uses lock-free OCC.
        // Conflicts are detected at commit time and handled by OccExecutionStrategy.
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
        return await connection.QuerySingleOrDefaultAsync<WalletModel>(sql,
            new { WalletId = walletId }, transaction);
    }

    public async Task CreateWalletAsync(WalletModel wallet)
    {
        const string sql =
            """
            INSERT INTO wallets (wallet_id, user_id, wallet_type, balance, version, created_at, updated_at)
            VALUES (@WalletId, @UserId, @WalletType, @Balance, @Version, @CreatedAt, @UpdatedAt)
            """;

        try
        {
            await using var connection = dataSource.CreateConnection();
            await connection.ExecuteAsync(sql, wallet);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            throw new Exceptions.DuplicateException("Wallet already exists for this user.");
        }
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
