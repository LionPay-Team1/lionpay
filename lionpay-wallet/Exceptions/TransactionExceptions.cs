using System.Net;
using LionPay.Wallet.Models;

namespace LionPay.Wallet.Exceptions;

public class TransactionNotFoundException()
    : DomainException(ErrorCodes.TransactionNotFound, "Transaction not found.", HttpStatusCode.NotFound);
