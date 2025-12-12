namespace LionPay.Wallet.Models;

public class PaymentTransactionModel
{
    public Guid TxId { get; set; }
    public Guid MerchantId { get; set; }
    public Guid WalletId { get; set; }
    public Guid? UserId { get; set; }
    public Guid? GroupTxId { get; set; }
    public TxType TxType { get; set; }
    public string OrderName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal BalanceSnapshot { get; set; }
    public string MerchantName { get; set; } = string.Empty;
    public string MerchantCategory { get; set; } = string.Empty;
    public string RegionCode { get; set; } = string.Empty;
    public TxStatus TxStatus { get; set; }
    public string? IdempotencyKey { get; set; }
    public DateTime CreatedAt { get; set; }
}
