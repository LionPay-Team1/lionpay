namespace LionPay.Wallet.Models;

public class MerchantModel
{
    public Guid MerchantId { get; set; }
    public string MerchantName { get; set; } = string.Empty;
    public string CountryCode { get; set; } = string.Empty;
    public string MerchantCategory { get; set; } = string.Empty;
    public MerchantStatus MerchantStatus { get; set; } = MerchantStatus.Active;
    public DateTime CreatedAt { get; set; }
}

