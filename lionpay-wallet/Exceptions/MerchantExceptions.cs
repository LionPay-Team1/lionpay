using System.Net;

namespace LionPay.Wallet.Exceptions;

public class MerchantNotFoundException()
    : DomainException("MERCHANT_NOT_FOUND", "Merchant not found.", HttpStatusCode.NotFound);
