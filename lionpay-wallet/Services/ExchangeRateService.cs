using LionPay.Wallet.Models;
using LionPay.Wallet.Repositories;

namespace LionPay.Wallet.Services;

public interface IExchangeRateService
{
    Task<IEnumerable<ExchangeRateModel>> GetAllRatesAsync();
    Task<decimal> GetRateAsync(string sourceCurrency, string targetCurrency);
    Task<ExchangeRateModel> UpdateRateAsync(UpdateExchangeRateRequest request, Guid? adminId);

    Task<IEnumerable<ExchangeRateHistoryModel>> GetHistoryAsync(string? sourceCurrency = null, string? targetCurrency = null,
        int limit = 50);
}

public class ExchangeRateService(IExchangeRateRepository exchangeRateRepository) : IExchangeRateService
{
    public async Task<IEnumerable<ExchangeRateModel>> GetAllRatesAsync()
    {
        return await exchangeRateRepository.GetAllAsync();
    }

    public async Task<decimal> GetRateAsync(string sourceCurrency, string targetCurrency)
    {
        // Same currency = 1.0
        if (string.Equals(sourceCurrency, targetCurrency, StringComparison.OrdinalIgnoreCase))
        {
            return 1.0m;
        }

        var rate = await exchangeRateRepository.GetRateAsync(sourceCurrency, targetCurrency);

        // Default to 1.0 if no rate found (for safety)
        return rate?.Rate ?? 1.0m;
    }

    public async Task<ExchangeRateModel> UpdateRateAsync(UpdateExchangeRateRequest request, Guid? adminId)
    {
        var existing = await exchangeRateRepository.GetRateAsync(request.SourceCurrency, request.TargetCurrency);
        var oldRate = existing?.Rate;

        var model = new ExchangeRateModel
        {
            Id = existing?.Id ?? Guid.NewGuid(),
            SourceCurrency = request.SourceCurrency.ToUpperInvariant(),
            TargetCurrency = request.TargetCurrency.ToUpperInvariant(),
            Rate = request.Rate,
            UpdatedAt = DateTime.UtcNow,
            UpdatedBy = adminId
        };

        var result = await exchangeRateRepository.UpsertAsync(model);

        // Record history
        var history = new ExchangeRateHistoryModel
        {
            Id = Guid.NewGuid(),
            ExchangeRateId = result.Id,
            SourceCurrency = result.SourceCurrency,
            TargetCurrency = result.TargetCurrency,
            OldRate = oldRate,
            NewRate = result.Rate,
            ChangedAt = DateTime.UtcNow,
            ChangedBy = adminId
        };
        await exchangeRateRepository.AddHistoryAsync(history);

        return result;
    }

    public async Task<IEnumerable<ExchangeRateHistoryModel>> GetHistoryAsync(string? sourceCurrency = null, string? targetCurrency = null,
        int limit = 50)
    {
        return await exchangeRateRepository.GetHistoryAsync(sourceCurrency, targetCurrency, limit);
    }
}
