using System.Security.Claims;
using LionPay.ServiceDefaults;
using LionPay.Wallet.Models;
using LionPay.Wallet.Services;
using Microsoft.AspNetCore.Mvc;

namespace LionPay.Wallet.Endpoints;

public static class PaymentEndpoints
{
    public static void MapPaymentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/wallet/payments")
            .RequireAuthorization(Policies.UserRole)
            .WithTags("Payment");

        group.MapPost("/", ProcessPayment)
            .WithSummary("Process a payment")
            .WithDescription("Processes a payment transaction for a user.")
            .Produces<PaymentResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces<ErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ErrorResponse>(StatusCodes.Status500InternalServerError);
    }

    public static async Task<IResult> ProcessPayment(
        ClaimsPrincipal user,
        [FromBody] PaymentRequest request,
        [FromHeader(Name = "X-Idempotency-Key")]
        string? idempotencyKey,
        IPaymentService paymentService)
    {
        var userId = user.GetUserId();
        var transaction = await paymentService.ProcessPaymentAsync(userId, request, idempotencyKey);
        var response = new PaymentResponse(
            transaction.TxId,
            transaction.MerchantId,
            transaction.Amount,
            transaction.TxStatus,
            transaction.CreatedAt
        );
        return Results.Ok(response);
    }
}

