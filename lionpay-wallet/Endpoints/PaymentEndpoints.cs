using System.Security.Claims;
using LionPay.Wallet.Models;
using LionPay.Wallet.Services;
using Microsoft.AspNetCore.Mvc;

namespace LionPay.Wallet.Endpoints;

public static class PaymentEndpoints
{
    public static void MapPaymentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/payments")
            .RequireAuthorization();

        group.MapPost("/", ProcessPayment);
    }

    public static async Task<IResult> ProcessPayment(
        ClaimsPrincipal user,
        [FromBody] PaymentRequest request,
        [FromHeader(Name = "X-Idempotency-Key")]
        string? idempotencyKey,
        IPaymentService paymentService)
    {
        var userId = GetUserId(user);
        var transaction = await paymentService.ProcessPaymentAsync(userId, request, idempotencyKey);
        return Results.Ok(transaction);
    }

    private static Guid GetUserId(ClaimsPrincipal user)
    {
        var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)
                      ?? user.FindFirst("sub")
                      ?? throw new InvalidOperationException("User ID claim not found.");

        return Guid.Parse(idClaim.Value);
    }
}
