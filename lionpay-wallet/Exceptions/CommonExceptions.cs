using System.Net;
using LionPay.Wallet.Models;

namespace LionPay.Wallet.Exceptions;

public class ValidationException(string message = "Validation failed.")
    : DomainException(ErrorCodes.ValidationFailed, message);

public class DuplicateException(string message = "Duplicate entry.")
    : DomainException(ErrorCodes.DuplicateEntry, message, HttpStatusCode.Conflict);
