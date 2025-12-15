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
    string Currency // KRW, USD, etc. (Mocked)
);

public record PaymentResponse(
    Guid TxId,
    Guid MerchantId,
    decimal Amount,
    TxStatus TxStatus,
    DateTime CreatedAt
);

public record TransactionResponse(
    Guid TxId,
    Guid MerchantId,
    decimal Amount,
    TxType TxType,
    TxStatus TxStatus,
    string MerchantName,
    DateTime CreatedAt
);

public record WalletResponse(
    Guid WalletId,
    decimal Balance,
    WalletType WalletType,
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
