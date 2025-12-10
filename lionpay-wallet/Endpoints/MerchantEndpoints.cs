using LionPay.Wallet.Services;

namespace LionPay.Wallet.Endpoints;

public static class MerchantEndpoints
{
    public static void MapMerchantEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/merchants")
            .RequireAuthorization(); // Assuming merchants also need auth or generic access

        group.MapGet("/{id:guid}", GetMerchant);
    }

    public static async Task<IResult> GetMerchant(Guid id, IMerchantService merchantService)
    {
        var merchant = await merchantService.GetMerchantInfoAsync(id);
        return Results.Ok(merchant);
    }
}
