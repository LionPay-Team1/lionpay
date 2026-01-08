using System.Security.Claims;
using LionPay.Wallet.Models;
using LionPay.Wallet.Repositories;
using LionPay.Wallet.Services;
using Microsoft.AspNetCore.Mvc;

namespace LionPay.Wallet.Endpoints;

public static class ExchangeRateEndpoints
{
    public static void MapExchangeRateEndpoints(this IEndpointRouteBuilder app)
    {
        // User endpoints - authenticated users can view exchange rates and currencies
        var userGroup = app.MapGroup("/v1/wallet/exchange-rates")
            .RequireAuthorization(Policies.UserRole)
            .WithTags("ExchangeRates");

        userGroup.MapGet("/", GetExchangeRates)
            .WithSummary("Get applied exchange rates")
            .Produces<IEnumerable<ExchangeRateResponse>>();

        // Admin endpoints - admins can manage exchange rates
        var adminGroup = app.MapGroup("/v1/wallet/admin/exchange-rates")
            .RequireAuthorization(Policies.AdminRole)
            .WithTags("Admin");

        adminGroup.MapGet("/", GetAllRatesAdmin)
            .WithSummary("Get all exchange rates (admin)")
            .Produces<IEnumerable<ExchangeRateResponse>>();

        adminGroup.MapPut("/", UpdateRate)
            .WithSummary("Update exchange rate")
            .WithDescription("Create or update an exchange rate between two currencies.")
            .Produces<ExchangeRateResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest);

        adminGroup.MapGet("/history", GetHistory)
            .WithSummary("Get exchange rate history")
            .WithDescription("Returns the history of exchange rate changes.")
            .Produces<IEnumerable<ExchangeRateHistoryResponse>>();

        adminGroup.MapGet("/currencies", GetAllCurrenciesAdmin)
            .WithSummary("Get all currencies (admin)")
            .Produces<IEnumerable<CurrencyResponse>>();
    }


    private static async Task<IResult> GetExchangeRates(IExchangeRateService exchangeRateService)
    {
        var rates = await exchangeRateService.GetAllRatesAsync();
        var response = rates.Select(r => new ExchangeRateResponse(
            r.Id,
            r.SourceCurrency,
            r.TargetCurrency,
            r.Rate,
            r.RateType,
            r.Source,
            r.UpdatedAt
        ));
        return Results.Ok(response);
    }


    private static async Task<IResult> GetAllRatesAdmin(IExchangeRateService exchangeRateService)
    {
        var rates = await exchangeRateService.GetAllRatesAsync();
        var response = rates.Select(r => new ExchangeRateResponse(
            r.Id,
            r.SourceCurrency,
            r.TargetCurrency,
            r.Rate,
            r.RateType,
            r.Source,
            r.UpdatedAt
        ));
        return Results.Ok(response);
    }

    private static async Task<IResult> GetAllCurrenciesAdmin(ICurrencyRepository currencyRepository)
    {
        var currencies = await currencyRepository.GetAllAsync();
        var response = currencies.Select(c => new CurrencyResponse(
            c.CurrencyCode,
            c.CurrencyName,
            c.Symbol,
            c.IsActive
        ));
        return Results.Ok(response);
    }

    private static async Task<IResult> UpdateRate(
        [FromBody] UpdateExchangeRateRequest request,
        ClaimsPrincipal user,
        IExchangeRateService exchangeRateService)
    {
        if (string.IsNullOrWhiteSpace(request.SourceCurrency) || string.IsNullOrWhiteSpace(request.TargetCurrency))
        {
            return Results.BadRequest(new ErrorResponse("INVALID_CURRENCY", "Source and target currencies are required."));
        }

        if (request.Rate <= 0)
        {
            return Results.BadRequest(new ErrorResponse("INVALID_RATE", "Exchange rate must be greater than zero."));
        }

        var adminIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Guid? adminId = Guid.TryParse(adminIdClaim, out var parsed) ? parsed : null;

        var rate = await exchangeRateService.UpdateRateAsync(request, adminId);
        var response = new ExchangeRateResponse(
            rate.Id,
            rate.SourceCurrency,
            rate.TargetCurrency,
            rate.Rate,
            rate.RateType,
            rate.Source,
            rate.UpdatedAt
        );
        return Results.Ok(response);
    }

    private static async Task<IResult> GetHistory(
        [FromQuery] string? sourceCurrency,
        [FromQuery] string? targetCurrency,
        [FromQuery] int limit,
        IExchangeRateService exchangeRateService)
    {
        var effectiveLimit = limit <= 0 ? 50 : Math.Min(limit, 100);
        var history = await exchangeRateService.GetHistoryAsync(sourceCurrency, targetCurrency, effectiveLimit);
        var response = history.Select(h => new ExchangeRateHistoryResponse(
            h.Id,
            h.ExchangeRateId,
            h.SourceCurrency,
            h.TargetCurrency,
            h.OldRate,
            h.NewRate,
            h.ChangedAt,
            h.ChangedBy
        ));
        return Results.Ok(response);
    }
}
