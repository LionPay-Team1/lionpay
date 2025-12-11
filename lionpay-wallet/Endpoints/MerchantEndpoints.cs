using LionPay.Wallet.Models;
using LionPay.Wallet.Services;

namespace LionPay.Wallet.Endpoints;

public static class MerchantEndpoints
{
    public static void MapMerchantEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/merchants")
            .RequireAuthorization()
            .WithTags("Merchant");

        group.MapGet("/{id:guid}", GetMerchant)
            .WithSummary("Get merchant details")
            .WithDescription("Retrieves details of a specific merchant by ID.")
            .Produces<MerchantResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ErrorResponse>(StatusCodes.Status401Unauthorized);
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
