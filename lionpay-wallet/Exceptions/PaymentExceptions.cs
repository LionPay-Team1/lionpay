using System.Net;
using LionPay.Wallet.Models;

namespace LionPay.Wallet.Exceptions;

public class PaymentFailedException(string message = "Payment failed after retries. Please try again.")
    : DomainException(ErrorCodes.PaymentFailed, message, HttpStatusCode.Conflict);

public class IdempotencyConflictException(string message = "Idempotency key conflict.")
    : DomainException(ErrorCodes.IdempotencyConflict, message, HttpStatusCode.Conflict);
