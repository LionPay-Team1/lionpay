namespace LionPay.Wallet.Models;

public static class ErrorCodes
{
    // Common
    public const string InternalServerError = "INTERNAL_SERVER_ERROR";
    
    // Auth
    public const string Unauthenticated = "UNAUTHENTICATED";
    public const string PermissionDenied = "PERMISSION_DENIED";

    // Wallet
    public const string WalletNotFound = "WALLET_NOT_FOUND";
    public const string InsufficientBalance = "INSUFFICIENT_BALANCE";
    public const string ChargeFailed = "CHARGE_FAILED";

    // Merchant
    public const string MerchantNotFound = "MERCHANT_NOT_FOUND";

    // Payment
    public const string PaymentFailed = "PAYMENT_FAILED";
    public const string IdempotencyConflict = "IDEMPOTENCY_CONFLICT";

    // Transaction
    public const string TransactionNotFound = "TRANSACTION_NOT_FOUND";
}
