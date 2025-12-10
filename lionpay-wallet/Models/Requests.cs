namespace LionPay.Wallet.Models;

public record PaymentRequest(
    Guid MerchantId,
    decimal AmountCash,
    string Currency, // KRW, USD, etc. (Mocked)
    string AssetType // "MONEY"
);

public record ChargeRequest(
    decimal Amount
);
