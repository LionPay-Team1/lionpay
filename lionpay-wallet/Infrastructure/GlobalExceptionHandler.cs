using LionPay.Wallet.Exceptions;
using LionPay.Wallet.Models;
using Microsoft.AspNetCore.Diagnostics;

namespace LionPay.Wallet.Infrastructure;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, errorCode, errorMessage) = exception switch
        {
            DomainException ex => ((int)ex.StatusCode, ex.ErrorCode, ex.Message),
            ArgumentException ex => (StatusCodes.Status400BadRequest, "INVALID_ARGUMENT", ex.Message),
            InvalidOperationException ex => (StatusCodes.Status409Conflict, "INVALID_OPERATION", ex.Message),
            KeyNotFoundException ex => (StatusCodes.Status404NotFound, "NOT_FOUND", ex.Message),
            AuthenticationException ex => (StatusCodes.Status401Unauthorized, "UNAUTHORIZED", ex.Message),
            _ => (StatusCodes.Status500InternalServerError, "INTERNAL_SERVER_ERROR", "An internal error occurred.")
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "An unhandled exception occurred.");
        }

        httpContext.Response.StatusCode = statusCode;

        var response = new ErrorResponse(errorCode, errorMessage);
        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

        return true;
    }
}

// Keeping it simple with standard exceptions mapping first.
// Future: Introduce dedicated DomainExceptions.
public class AuthenticationException(string message) : Exception(message);
