using LionPay.Wallet.Models;
using LionPay.Wallet.Services;
using Microsoft.AspNetCore.Mvc;

namespace LionPay.Wallet.Endpoints;

public static class MerchantEndpoints
{
    public static void MapMerchantEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/wallet/merchants")
            .RequireAuthorization(Policies.UserRole)
            .WithTags("Merchant");

        group.MapGet("/", GetMerchants)
            .WithSummary("Get active merchants")
            .WithDescription("Retrieves a list of active merchants.")
            .Produces<IEnumerable<MerchantResponse>>();

        group.MapGet("/{id:guid}", GetMerchant)
            .WithSummary("Get merchant details")
            .WithDescription("Retrieves details of a specific merchant by ID.")
            .Produces<MerchantResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ErrorResponse>(StatusCodes.Status401Unauthorized);
    }

    public static async Task<IResult> GetMerchants(
        IMerchantService merchantService,
        [FromQuery] string? countryCode = null)
    {
        var merchants = await merchantService.GetMerchantsAsync(countryCode);
        var response = merchants.Select(m => new MerchantResponse(
            m.MerchantId,
            m.MerchantName,
            m.CountryCode,
            m.MerchantCategory,
            m.MerchantStatus,
            m.CreatedAt
        ));
        return Results.Ok(response);
    }

    public static async Task<IResult> GetMerchant(Guid id, IMerchantService merchantService)
    {
        var merchant = await merchantService.GetMerchantInfoAsync(id);
        var response = new MerchantResponse(
            merchant.MerchantId,
            merchant.MerchantName,
            merchant.CountryCode,
            merchant.MerchantCategory,
            merchant.MerchantStatus,
            merchant.CreatedAt
        );
        return Results.Ok(response);
    }
}

