namespace LionPay.Wallet.Models;

public record UpdateMerchantRequest(
    string MerchantName,
    string MerchantCategory,
    MerchantStatus MerchantStatus
);

