using System.Net;
using LionPay.Wallet.Models;

namespace LionPay.Wallet.Exceptions;

public class MerchantNotFoundException()
    : DomainException(ErrorCodes.MerchantNotFound, "Merchant not found.", HttpStatusCode.NotFound);

public class MerchantUpdateFailedException()
    : DomainException(ErrorCodes.MerchantUpdateFailed, "Failed to update merchant.");
