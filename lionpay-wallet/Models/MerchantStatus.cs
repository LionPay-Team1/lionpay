namespace LionPay.Wallet.Models;

/// <summary>
/// Merchant status enum corresponding to SMALLINT values in database
/// </summary>
public enum MerchantStatus
{
    /// <summary>Inactive merchant (0)</summary>
    Inactive = 0,

    /// <summary>Active merchant (1)</summary>
    Active = 1,

    /// <summary>Suspended merchant (2)</summary>
    Suspended = 2
}
