namespace LionPay.Wallet.Models;

public class ExchangeRateModel
{
    public Guid Id { get; set; }
    public string SourceCurrency { get; set; } = string.Empty;
    public string TargetCurrency { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public RateType RateType { get; set; } = RateType.Close;
    public ExchangeRateSource Source { get; set; } = ExchangeRateSource.Manual;
    public DateTime UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
}

