using System.Security.Claims;
using LionPay.ServiceDefaults;
using LionPay.Wallet.Models;
using LionPay.Wallet.Services;
using Microsoft.AspNetCore.Mvc;

namespace LionPay.Wallet.Endpoints;

public static class TransactionEndpoints
{
    public static void MapTransactionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/transactions")
            .RequireAuthorization(Policies.UserRole)
            .WithTags("Transaction");

        group.MapGet("/", GetTransactions)
            .WithSummary("Get transaction history")
            .WithDescription("Retrieves a list of past transactions for the authenticated user.")
            .Produces<IEnumerable<TransactionResponse>>()
            .Produces<ErrorResponse>(StatusCodes.Status401Unauthorized);
    }

    public static async Task<IResult> GetTransactions(
        ClaimsPrincipal user,
        ITransactionService transactionService,
        [FromQuery] int limit = 10,
        [FromQuery] int offset = 0)
    {
        var userId = user.GetUserId();
        var transactions = await transactionService.GetHistoryAsync(userId, limit, offset);
        var response = transactions.Select(t => new TransactionResponse(
            t.TxId,
            t.MerchantId,
            t.Amount,
            t.TxType,
            t.TxStatus,
            t.MerchantName,
            t.BalanceSnapshot,
            t.Currency,
            t.OriginalAmount,
            t.CreatedAt
        ));
        return Results.Ok(response);
    }
}

