using System.Security.Claims;
using LionPay.ServiceDefaults;
using LionPay.Wallet.Models;
using LionPay.Wallet.Services;
using Microsoft.AspNetCore.Mvc;

namespace LionPay.Wallet.Endpoints;

public static class WalletEndpoints
{
    public static void MapWalletEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/wallets")
            .RequireAuthorization(Policies.UserRole)
            .WithTags("Wallet");

        group.MapGet("/me", GetMyWallet)
            .WithSummary("Get my wallet(s)")
            .WithDescription(
                "Retrieves the current user's wallet information. If type is specified, returns a single wallet. Otherwise, returns all wallets.")
            .Produces<IEnumerable<WalletResponse>>()
            .Produces<WalletResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status401Unauthorized);
        group.MapPost("/charge", ChargeWallet)
            .WithSummary("Charge wallet")
            .WithDescription("Charges the user's Money wallet with the specified amount.")
            .Produces<WalletResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces<ErrorResponse>(StatusCodes.Status401Unauthorized);
    }

    public static async Task<IResult> GetMyWallet(
        ClaimsPrincipal user,
        IWalletService walletService,
        [FromQuery] WalletType? type = null)
    {
        var userId = user.GetUserId();

        if (type.HasValue)
        {
            var wallet = await walletService.GetMyWalletAsync(userId, type.Value);
            var response = new WalletResponse(
                wallet.WalletId,
                wallet.Balance,
                wallet.WalletType,
                wallet.UpdatedAt
            );
            return Results.Ok(response);
        }
        else
        {
            var wallets = await walletService.GetMyWalletsAsync(userId);
            var response = wallets.Select(w => new WalletResponse(
                w.WalletId,
                w.Balance,
                w.WalletType,
                w.UpdatedAt
            ));
            return Results.Ok(response);
        }
    }

    public static async Task<IResult> ChargeWallet(
        ClaimsPrincipal user,
        [FromBody] ChargeRequest request,
        IWalletService walletService)
    {
        var userId = user.GetUserId();
        var wallet = await walletService.ChargeAsync(userId, request.Amount);
        var response = new WalletResponse(
            wallet.WalletId,
            wallet.Balance,
            wallet.WalletType,
            wallet.UpdatedAt
        );
        return Results.Ok(response);
    }
}
