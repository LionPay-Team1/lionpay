using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace LionPay.Wallet.Endpoints;

public static class WalletEndpoints
{
    public static void MapWalletEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/wallet", () => "Wallet service is running.")
            .WithName("GetWallet");
    }
}