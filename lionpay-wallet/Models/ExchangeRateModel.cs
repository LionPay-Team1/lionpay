namespace LionPay.Wallet.Models;

public class ExchangeRateModel
{
    public Guid Id { get; set; }
    public string SourceCurrency { get; set; } = string.Empty;
    public string TargetCurrency { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public string RateType { get; set; } = "CLOSE";
    public string Source { get; set; } = "MANUAL";
    public DateTime UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
}

