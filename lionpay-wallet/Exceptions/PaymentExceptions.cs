using System.Net;

namespace LionPay.Wallet.Exceptions;

public class PaymentFailedException(string message = "Payment failed after retries. Please try again.")
    : DomainException("PAYMENT_FAILED", message, HttpStatusCode.Conflict);

public class IdempotencyConflictException(string message = "Idempotency key conflict.")
    : DomainException("IDEMPOTENCY_CONFLICT", message, HttpStatusCode.Conflict);
