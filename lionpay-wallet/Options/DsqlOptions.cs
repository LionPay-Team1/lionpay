namespace LionPay.Wallet.Options;

public class DsqlOptions
{
    public const string SectionName = "Dsql";

    public string Region { get; set; } = string.Empty;
    public int TokenRefreshMinutes { get; set; } = 12;
}
