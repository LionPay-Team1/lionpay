using Dapper;
using LionPay.Wallet.Models;
using Npgsql;

namespace LionPay.Wallet.Repositories;

public interface IMerchantRepository
{
    Task<MerchantModel?> GetMerchantAsync(Guid merchantId);
    Task<IEnumerable<MerchantModel>> GetAllMerchantsAsync();
    Task<IEnumerable<MerchantModel>> GetActiveMerchantsAsync();
    Task<IEnumerable<MerchantModel>> GetActiveMerchantsByCountryAsync(string countryCode);
    Task<MerchantModel> CreateMerchantAsync(MerchantModel merchant);
    Task<MerchantModel?> UpdateMerchantAsync(MerchantModel merchant);
    Task<long> CountMerchantsAsync();
}

public class MerchantRepository(NpgsqlDataSource dataSource) : IMerchantRepository
{
    public async Task<MerchantModel?> GetMerchantAsync(Guid merchantId)
    {
        const string sql =
            """
            SELECT 
                merchant_id AS MerchantId,
                merchant_name AS MerchantName,
                country_code AS CountryCode,
                merchant_category AS MerchantCategory,
                merchant_status AS MerchantStatus,
                created_at AS CreatedAt
            FROM merchants
            WHERE merchant_id = @MerchantId
            """;

        await using var connection = dataSource.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<MerchantModel>(sql, new { MerchantId = merchantId });
    }

    public async Task<IEnumerable<MerchantModel>> GetAllMerchantsAsync()
    {
        const string sql =
            """
            SELECT 
                merchant_id AS MerchantId,
                merchant_name AS MerchantName,
                country_code AS CountryCode,
                merchant_category AS MerchantCategory,
                merchant_status AS MerchantStatus,
                created_at AS CreatedAt
            FROM merchants
            ORDER BY created_at DESC
            """;

        await using var connection = dataSource.CreateConnection();
        return await connection.QueryAsync<MerchantModel>(sql);
    }

    public async Task<IEnumerable<MerchantModel>> GetActiveMerchantsAsync()
    {
        const string sql =
            """
            SELECT 
                merchant_id AS MerchantId,
                merchant_name AS MerchantName,
                country_code AS CountryCode,
                merchant_category AS MerchantCategory,
                merchant_status AS MerchantStatus,
                created_at AS CreatedAt
            FROM merchants
            WHERE merchant_status = 1
            ORDER BY created_at DESC
            """;

        await using var connection = dataSource.CreateConnection();
        return await connection.QueryAsync<MerchantModel>(sql);
    }

    public async Task<IEnumerable<MerchantModel>> GetActiveMerchantsByCountryAsync(string countryCode)
    {
        const string sql =
            """
            SELECT 
                merchant_id AS MerchantId,
                merchant_name AS MerchantName,
                country_code AS CountryCode,
                merchant_category AS MerchantCategory,
                merchant_status AS MerchantStatus,
                created_at AS CreatedAt
            FROM merchants
            WHERE merchant_status = 1 AND country_code = @CountryCode
            ORDER BY created_at DESC
            """;

        await using var connection = dataSource.CreateConnection();
        return await connection.QueryAsync<MerchantModel>(sql, new { CountryCode = countryCode });
    }

    public async Task<MerchantModel> CreateMerchantAsync(MerchantModel merchant)
    {
        const string sql =
            """
            INSERT INTO merchants (
                merchant_id, merchant_name, country_code, merchant_category, merchant_status, created_at
            ) VALUES (
                @MerchantId, @MerchantName, @CountryCode, @MerchantCategory, @MerchantStatus, @CreatedAt
            )
            RETURNING 
                merchant_id AS MerchantId,
                merchant_name AS MerchantName,
                country_code AS CountryCode,
                merchant_category AS MerchantCategory,
                merchant_status AS MerchantStatus,
                created_at AS CreatedAt;
            """;

        try
        {
            await using var connection = dataSource.CreateConnection();
            return await connection.QuerySingleAsync<MerchantModel>(sql, merchant);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            throw new Exceptions.DuplicateException("MerchantModel already exists.");
        }
    }

    public async Task<MerchantModel?> UpdateMerchantAsync(MerchantModel merchant)
    {
        const string sql =
            """
            UPDATE merchants
            SET 
                merchant_name = @MerchantName,
                country_code = @CountryCode, 
                merchant_category = @MerchantCategory,
                merchant_status = @MerchantStatus
            WHERE merchant_id = @MerchantId
            RETURNING *;
            """;

        await using var connection = dataSource.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<MerchantModel>(sql, merchant);
    }

    public async Task<long> CountMerchantsAsync()
    {
        const string sql = "SELECT COUNT(*) FROM merchants";
        await using var connection = dataSource.CreateConnection();
        return await connection.ExecuteScalarAsync<long>(sql);
    }
}


