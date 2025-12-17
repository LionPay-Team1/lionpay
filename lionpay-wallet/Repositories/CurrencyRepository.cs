using Dapper;
using LionPay.Wallet.Models;
using Npgsql;

namespace LionPay.Wallet.Repositories;

public interface ICurrencyRepository
{
    Task<IEnumerable<CurrencyModel>> GetAllAsync();
    Task<CurrencyModel?> GetByCodeAsync(string currencyCode);
    Task<int> CountActiveCurrenciesAsync();
}

public class CurrencyRepository(NpgsqlDataSource dataSource) : ICurrencyRepository
{
    public async Task<IEnumerable<CurrencyModel>> GetAllAsync()
    {
        await using var connection = await dataSource.OpenConnectionAsync();

        const string sql = """
                           SELECT 
                               currency_code as CurrencyCode,
                               currency_name as CurrencyName,
                               symbol as Symbol,
                               is_active as IsActive
                           FROM currencies
                           WHERE is_active = TRUE
                           ORDER BY currency_code
                           """;

        return await connection.QueryAsync<CurrencyModel>(sql);
    }

    public async Task<CurrencyModel?> GetByCodeAsync(string currencyCode)
    {
        await using var connection = await dataSource.OpenConnectionAsync();

        const string sql = """
                           SELECT 
                               currency_code as CurrencyCode,
                               currency_name as CurrencyName,
                               symbol as Symbol,
                               is_active as IsActive
                           FROM currencies
                           WHERE currency_code = @CurrencyCode
                           """;

        return await connection.QueryFirstOrDefaultAsync<CurrencyModel>(sql, new { CurrencyCode = currencyCode });
    }

    public async Task<int> CountActiveCurrenciesAsync()
    {
        const string sql = "SELECT COUNT(*) FROM currencies WHERE is_active = TRUE";
        await using var connection = dataSource.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql);
    }
}

