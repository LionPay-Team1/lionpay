using LionPay.Wallet.Exceptions;
using LionPay.Wallet.Models;
using Microsoft.AspNetCore.Diagnostics;
using Npgsql;

namespace LionPay.Wallet;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, errorCode, errorMessage) = exception switch
        {
            DomainException ex => ((int)ex.StatusCode, ex.ErrorCode, ex.Message),
            NpgsqlException => (StatusCodes.Status500InternalServerError, ErrorCodes.InternalServerError,
                "A database error occurred."),
            _ => (StatusCodes.Status400BadRequest, ErrorCodes.BadRequest, exception.Message)
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "An unhandled exception occurred.");
        }
        else
        {
            logger.LogWarning("A handled exception occurred: {Message}", exception.Message);
        }

        httpContext.Response.StatusCode = statusCode;

        var response = new ErrorResponse(errorCode, errorMessage);
        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

        return true;
    }
}
