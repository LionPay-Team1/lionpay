using System.Security.Claims;
using LionPay.Wallet.Services;
using Microsoft.AspNetCore.Mvc;

namespace LionPay.Wallet.Endpoints;

public static class TransactionEndpoints
{
    public static void MapTransactionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/transactions")
            .RequireAuthorization();

        group.MapGet("/", GetTransactions);
    }

    public static async Task<IResult> GetTransactions(
        ClaimsPrincipal user,
        ITransactionService transactionService,
        [FromQuery] int limit = 10,
        [FromQuery] int offset = 0)
    {
        var userId = GetUserId(user);
        var transactions = await transactionService.GetHistoryAsync(userId, limit, offset);
        return Results.Ok(transactions);
    }

    private static Guid GetUserId(ClaimsPrincipal user)
    {
        var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)
                      ?? user.FindFirst("sub")
                      ?? throw new InvalidOperationException("User ID claim not found.");

        return Guid.Parse(idClaim.Value);
    }
}
