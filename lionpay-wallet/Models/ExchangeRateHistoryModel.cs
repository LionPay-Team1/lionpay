namespace LionPay.Wallet.Models;

public class ExchangeRateHistoryModel
{
    public Guid Id { get; set; }
    public Guid ExchangeRateId { get; set; }
    public string SourceCurrency { get; set; } = string.Empty;
    public string TargetCurrency { get; set; } = string.Empty;
    public decimal? OldRate { get; set; }
    public decimal NewRate { get; set; }
    public DateTime ChangedAt { get; set; }
    public Guid? ChangedBy { get; set; }
}
