using System.Net;

namespace LionPay.Wallet.Exceptions;

public class DomainException(
    string errorCode,
    string message,
    HttpStatusCode statusCode = HttpStatusCode.BadRequest)
    : Exception(message)
{
    public string ErrorCode { get; } = errorCode;
    public HttpStatusCode StatusCode { get; } = statusCode;
}

public class InvalidParameterException(string message)
    : DomainException("INVALID_PARAMETER", message);
