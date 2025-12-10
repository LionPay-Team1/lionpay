namespace LionPay.Wallet.Models;

public class Wallet
{
    public Guid WalletId { get; set; }
    public Guid UserId { get; set; }
    public string WalletType { get; set; } = "POINT";
    public decimal Balance { get; set; }
    public int Version { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
