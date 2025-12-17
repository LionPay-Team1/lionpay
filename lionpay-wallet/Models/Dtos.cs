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
    string Currency // KRW, JPY, etc. (Mocked)
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
    decimal BalanceAfter,
    string Currency,
    decimal OriginalAmount,
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
    MerchantStatus MerchantStatus,
    DateTime CreatedAt
);

public record ExchangeRateResponse(
    Guid Id,
    string SourceCurrency,
    string TargetCurrency,
    decimal Rate,
    RateType RateType,
    ExchangeRateSource Source,
    DateTime UpdatedAt
);

public record UpdateExchangeRateRequest(
    string SourceCurrency,
    string TargetCurrency,
    decimal Rate
);

public record ExchangeRateHistoryResponse(
    Guid Id,
    Guid ExchangeRateId,
    string SourceCurrency,
    string TargetCurrency,
    decimal? OldRate,
    decimal NewRate,
    DateTime ChangedAt,
    Guid? ChangedBy
);

public record CurrencyResponse(
    string CurrencyCode,
    string CurrencyName,
    string? Symbol,
    bool IsActive
);

