using Dapper;
using LionPay.Wallet.Models;
using Npgsql;

namespace LionPay.Wallet.Repositories;

public interface IExchangeRateRepository
{
    Task<IEnumerable<ExchangeRateModel>> GetAllAsync();
    Task<ExchangeRateModel?> GetRateAsync(string sourceCurrency, string targetCurrency);
    Task<ExchangeRateModel> UpsertAsync(ExchangeRateModel model);

    Task<IEnumerable<ExchangeRateHistoryModel>> GetHistoryAsync(string? sourceCurrency = null, string? targetCurrency = null,
        int limit = 50);

    Task AddHistoryAsync(ExchangeRateHistoryModel history);
}

public class ExchangeRateRepository(NpgsqlDataSource dataSource) : IExchangeRateRepository
{
    public async Task<IEnumerable<ExchangeRateModel>> GetAllAsync()
    {
        await using var connection = await dataSource.OpenConnectionAsync();

        const string sql = """
                           SELECT 
                               id as Id,
                               source_currency as SourceCurrency,
                               target_currency as TargetCurrency,
                               rate as Rate,
                               rate_type as RateType,
                               source as Source,
                               updated_at as UpdatedAt,
                               updated_by as UpdatedBy
                           FROM exchange_rates
                           ORDER BY source_currency, target_currency
                           """;

        return await connection.QueryAsync<ExchangeRateModel>(sql);
    }

    public async Task<ExchangeRateModel?> GetRateAsync(string sourceCurrency, string targetCurrency)
    {
        await using var connection = await dataSource.OpenConnectionAsync();

        const string sql = """
                           SELECT 
                               id as Id,
                               source_currency as SourceCurrency,
                               target_currency as TargetCurrency,
                               rate as Rate,
                               rate_type as RateType,
                               source as Source,
                               updated_at as UpdatedAt,
                               updated_by as UpdatedBy
                           FROM exchange_rates
                           WHERE source_currency = @SourceCurrency AND target_currency = @TargetCurrency
                           """;

        return await connection.QueryFirstOrDefaultAsync<ExchangeRateModel>(sql,
            new { SourceCurrency = sourceCurrency, TargetCurrency = targetCurrency });
    }

    public async Task<ExchangeRateModel> UpsertAsync(ExchangeRateModel model)
    {
        await using var connection = await dataSource.OpenConnectionAsync();

        const string sql = """
                           INSERT INTO exchange_rates (id, source_currency, target_currency, rate, rate_type, source, updated_at, updated_by)
                           VALUES (@Id, @SourceCurrency, @TargetCurrency, @Rate, @RateType, @Source, @UpdatedAt, @UpdatedBy)
                           ON CONFLICT (source_currency, target_currency) 
                           DO UPDATE SET 
                               rate = @Rate,
                               rate_type = @RateType,
                               source = @Source,
                               updated_at = @UpdatedAt,
                               updated_by = @UpdatedBy
                           RETURNING 
                               id as Id,
                               source_currency as SourceCurrency,
                               target_currency as TargetCurrency,
                               rate as Rate,
                               rate_type as RateType,
                               source as Source,
                               updated_at as UpdatedAt,
                               updated_by as UpdatedBy
                           """;

        return await connection.QuerySingleAsync<ExchangeRateModel>(sql, model);
    }

    public async Task<IEnumerable<ExchangeRateHistoryModel>> GetHistoryAsync(string? sourceCurrency = null, string? targetCurrency = null,
        int limit = 50)
    {
        await using var connection = await dataSource.OpenConnectionAsync();

        var sql = """
                  SELECT 
                      id as Id,
                      exchange_rate_id as ExchangeRateId,
                      source_currency as SourceCurrency,
                      target_currency as TargetCurrency,
                      old_rate as OldRate,
                      new_rate as NewRate,
                      changed_at as ChangedAt,
                      changed_by as ChangedBy
                  FROM exchange_rate_history
                  WHERE 1=1
                  """;

        if (!string.IsNullOrEmpty(sourceCurrency))
            sql += " AND source_currency = @SourceCurrency";
        if (!string.IsNullOrEmpty(targetCurrency))
            sql += " AND target_currency = @TargetCurrency";

        sql += " ORDER BY changed_at DESC LIMIT @Limit";

        return await connection.QueryAsync<ExchangeRateHistoryModel>(sql,
            new { SourceCurrency = sourceCurrency, TargetCurrency = targetCurrency, Limit = limit });
    }

    public async Task AddHistoryAsync(ExchangeRateHistoryModel history)
    {
        await using var connection = await dataSource.OpenConnectionAsync();

        const string sql = """
                           INSERT INTO exchange_rate_history (id, exchange_rate_id, source_currency, target_currency, old_rate, new_rate, changed_at, changed_by)
                           VALUES (@Id, @ExchangeRateId, @SourceCurrency, @TargetCurrency, @OldRate, @NewRate, @ChangedAt, @ChangedBy)
                           """;

        await connection.ExecuteAsync(sql, history);
    }
}
