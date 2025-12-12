namespace LionPay.Wallet.Models;

public record AdjustBalanceRequest(WalletType WalletType, decimal Amount, string Reason);
