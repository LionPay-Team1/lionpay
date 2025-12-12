namespace LionPay.Wallet.Models;

public class WalletModel
{
    public Guid WalletId { get; set; }
    public Guid UserId { get; set; }
    public WalletType WalletType { get; set; } = WalletType.Point;
    public decimal Balance { get; set; }
    public int Version { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
