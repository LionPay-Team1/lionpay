using System.Net;
using LionPay.Wallet.Models;

namespace LionPay.Wallet.Exceptions;

public class WalletNotFoundException()
    : DomainException(ErrorCodes.WalletNotFound, "Wallet not found.", HttpStatusCode.NotFound);

public class InsufficientBalanceException()
    : DomainException(ErrorCodes.InsufficientBalance, "Insufficient balance.");

public class ChargeFailedException(string message = "Charge failed due to high concurrency. Please try again.")
    : DomainException(ErrorCodes.ChargeFailed, message, HttpStatusCode.Conflict);
