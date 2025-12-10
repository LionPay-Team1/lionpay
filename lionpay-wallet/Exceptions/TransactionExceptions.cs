using System.Net;

namespace LionPay.Wallet.Exceptions;

public class TransactionNotFoundException()
    : DomainException("TRANSACTION_NOT_FOUND", "Transaction not found.", HttpStatusCode.NotFound);
