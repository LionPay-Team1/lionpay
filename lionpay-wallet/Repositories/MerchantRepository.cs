using Dapper;
using LionPay.Wallet.Models;
using Npgsql;

namespace LionPay.Wallet.Repositories;

public interface IMerchantRepository
{
    Task<Merchant?> GetMerchantAsync(Guid merchantId);
}

public class MerchantRepository(NpgsqlDataSource dataSource) : IMerchantRepository
{
    public async Task<Merchant?> GetMerchantAsync(Guid merchantId)
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
        return await connection.QuerySingleOrDefaultAsync<Merchant>(sql, new { MerchantId = merchantId });
    }
}
