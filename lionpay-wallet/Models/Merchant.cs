namespace LionPay.Wallet.Models;

public class Merchant
{
    public Guid MerchantId { get; set; }
    public string MerchantName { get; set; } = string.Empty;
    public string CountryCode { get; set; } = string.Empty;
    public string MerchantCategory { get; set; } = string.Empty;
    public string MerchantStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
