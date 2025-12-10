namespace LionPay.Wallet.Models;

public class PaymentTransaction
{
    public Guid TxId { get; set; }
    public Guid MerchantId { get; set; }
    public Guid WalletId { get; set; }
    public Guid? UserId { get; set; }
    public Guid? GroupTxId { get; set; }
    public string TxType { get; set; } = string.Empty; // PAYMENT, CHARGE
    public string OrderName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal BalanceSnapshot { get; set; }
    public string MerchantName { get; set; } = string.Empty;
    public string MerchantCategory { get; set; } = string.Empty;
    public string RegionCode { get; set; } = string.Empty;
    public string TxStatus { get; set; } = string.Empty; // SUCCESS, FAILED
    public string? IdempotencyKey { get; set; }
    public DateTime CreatedAt { get; set; }
}
