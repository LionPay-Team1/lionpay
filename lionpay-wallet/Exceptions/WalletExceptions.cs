using System.Net;

namespace LionPay.Wallet.Exceptions;

public class WalletNotFoundException() 
    : DomainException("WALLET_NOT_FOUND", "Wallet not found.", HttpStatusCode.NotFound);

public class InsufficientBalanceException() 
    : DomainException("INSUFFICIENT_BALANCE", "Insufficient balance.");

public class ChargeFailedException(string message = "Charge failed due to high concurrency. Please try again.") 
    : DomainException("CHARGE_FAILED", message, HttpStatusCode.Conflict);
