using LionPay.Wallet.Exceptions;
using LionPay.Wallet.Models;
using Microsoft.AspNetCore.Diagnostics;

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
            _ => (StatusCodes.Status500InternalServerError, ErrorCodes.InternalServerError,
                "An internal error occurred.")
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "An unhandled exception occurred.");
        }

        httpContext.Response.StatusCode = statusCode;

        var response = new ErrorResponse(errorCode, errorMessage);
        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

        return true;
    }
}