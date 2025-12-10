using System.Security.Claims;
using LionPay.Wallet.Models;
using LionPay.Wallet.Services;
using Microsoft.AspNetCore.Mvc;

namespace LionPay.Wallet.Endpoints;

public static class WalletEndpoints
{
    public static void MapWalletEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/wallets")
            .RequireAuthorization();

        group.MapGet("/me", GetMyWallet);
        group.MapPost("/charge", ChargeWallet);
    }

    public static async Task<IResult> GetMyWallet(ClaimsPrincipal user, IWalletService walletService)
    {
        var userId = GetUserId(user);
        var wallet = await walletService.GetMyWalletAsync(userId);
        return Results.Ok(wallet);
    }

    public static async Task<IResult> ChargeWallet(
        ClaimsPrincipal user,
        [FromBody] ChargeRequest request,
        IWalletService walletService)
    {
        var userId = GetUserId(user);
        var wallet = await walletService.ChargeAsync(userId, request.Amount);
        return Results.Ok(wallet);
    }


    private static Guid GetUserId(ClaimsPrincipal user)
    {
        var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)
                      ?? user.FindFirst("sub")
                      ?? throw new InvalidOperationException("User ID claim not found.");

        return Guid.Parse(idClaim.Value);
    }
}