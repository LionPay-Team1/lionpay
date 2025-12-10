using LionPay.Wallet.Models;
using LionPay.Wallet.Repositories;

namespace LionPay.Wallet.Services;

public interface IMerchantService
{
    Task<Merchant?> GetMerchantInfoAsync(Guid merchantId);
}

public class MerchantService(IMerchantRepository merchantRepository) : IMerchantService
{
    public async Task<Merchant?> GetMerchantInfoAsync(Guid merchantId)
    {
        var merchant = await merchantRepository.GetMerchantAsync(merchantId);
        return merchant ?? throw new Exceptions.MerchantNotFoundException();
    }
}
