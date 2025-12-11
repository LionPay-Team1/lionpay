using System.Net;
using LionPay.Wallet.Models;

namespace LionPay.Wallet.Exceptions;

public class UnauthenticatedException(string message = "Authentication failed.")
    : DomainException(ErrorCodes.Unauthenticated, message, HttpStatusCode.Unauthorized);

public class PermissionDeniedException(string message = "Access is denied.")
    : DomainException(ErrorCodes.PermissionDenied, message, HttpStatusCode.Forbidden);
