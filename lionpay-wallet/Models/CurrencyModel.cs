namespace LionPay.Wallet.Models;

public class CurrencyModel
{
    public string CurrencyCode { get; set; } = string.Empty;
    public string CurrencyName { get; set; } = string.Empty;
    public string? Symbol { get; set; }
    public bool IsActive { get; set; } = true;
}
