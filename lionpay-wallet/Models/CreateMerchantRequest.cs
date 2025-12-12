namespace LionPay.Wallet.Models;

public record CreateMerchantRequest(
    string MerchantName,
    string CountryCode,
    string MerchantCategory
);
