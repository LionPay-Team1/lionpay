namespace LionPay.Wallet.Options;

public class DsqlOptions
{
    public const string SectionName = "Dsql";

    public string Region { get; set; } = "ap-northeast-2";
    public int TokenRefreshMinutes { get; set; } = 12;
}
