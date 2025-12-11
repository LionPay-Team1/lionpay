namespace LionPay.Wallet.Models;

public record ErrorResponse(
    string ErrorCode,
    string ErrorMessage
);

public record ChargeRequest(
    decimal Amount
);

public record PaymentRequest(
    Guid MerchantId,
    decimal AmountCash,
    string Currency, // KRW, USD, etc. (Mocked)
    string AssetType // "MONEY"
);

public record PaymentResponse(
    Guid TxId,
    Guid MerchantId,
    decimal Amount,
    string TxStatus,
    DateTime CreatedAt
);

public record TransactionResponse(
    Guid TxId,
    Guid MerchantId,
    decimal Amount,
    string TxType,
    string TxStatus,
    string MerchantName,
    DateTime CreatedAt
);

public record WalletResponse(
    Guid WalletId,
    decimal Balance,
    string WalletType,
    DateTime UpdatedAt
);

public record MerchantResponse(
    Guid MerchantId,
    string MerchantName,
    string CountryCode,
    string MerchantCategory,
    string MerchantStatus,
    DateTime CreatedAt
);