namespace LionPay.Wallet.Models;

public record AdminSummaryModel(
    long TotalWallets,
    long TotalMerchants,
    long TotalTransactions,
    int ActiveCurrencies
);
