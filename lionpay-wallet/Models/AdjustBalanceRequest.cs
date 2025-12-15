namespace LionPay.Wallet.Models;

public record AdjustBalanceRequest(decimal Amount, string Reason);
