using LionPay.Wallet.Models;
using LionPay.Wallet.Repositories;

namespace LionPay.Wallet.Services;

public interface IMerchantService
{
    Task<MerchantModel> GetMerchantInfoAsync(Guid merchantId);
    Task<IEnumerable<MerchantModel>> GetMerchantsAsync(string? countryCode = null);
    Task<IEnumerable<MerchantModel>> GetAllMerchantsAsync();
    Task<MerchantModel> CreateMerchantAsync(CreateMerchantRequest request);
    Task<MerchantModel> UpdateMerchantAsync(Guid merchantId, UpdateMerchantRequest request);
    Task<MerchantModel> GetMerchantFullInfoAsync(Guid merchantId);
}

public class MerchantService(IMerchantRepository merchantRepository) : IMerchantService
{
    public async Task<MerchantModel> GetMerchantInfoAsync(Guid merchantId)
    {
        var MerchantModel = await merchantRepository.GetMerchantAsync(merchantId);
        return MerchantModel ?? throw new Exceptions.MerchantNotFoundException();
    }

    public async Task<IEnumerable<MerchantModel>> GetMerchantsAsync(string? countryCode = null)
    {
        if (string.IsNullOrEmpty(countryCode))
        {
            return await merchantRepository.GetActiveMerchantsAsync();
        }

        return await merchantRepository.GetActiveMerchantsByCountryAsync(countryCode);
    }

    public async Task<IEnumerable<MerchantModel>> GetAllMerchantsAsync()
    {
        return await merchantRepository.GetAllMerchantsAsync();
    }

    public async Task<MerchantModel> CreateMerchantAsync(CreateMerchantRequest request)
    {
        var MerchantModel = new MerchantModel
        {
            MerchantId = Guid.NewGuid(),
            MerchantName = request.MerchantName,
            CountryCode = request.CountryCode,
            MerchantCategory = request.MerchantCategory,
            MerchantStatus = MerchantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        return await merchantRepository.CreateMerchantAsync(MerchantModel);
    }

    public async Task<MerchantModel> UpdateMerchantAsync(Guid merchantId, UpdateMerchantRequest request)
    {
        var MerchantModel = await merchantRepository.GetMerchantAsync(merchantId)
                            ?? throw new Exceptions.MerchantNotFoundException();

        MerchantModel.MerchantName = request.MerchantName;
        MerchantModel.MerchantCategory = request.MerchantCategory;
        MerchantModel.MerchantStatus = request.MerchantStatus;

        // CountryCode usually doesn't change easily or requires re-verification, 
        // but let's assume it's keeping the old one or strictly not updatable via this API as per request DTO.

        var updated = await merchantRepository.UpdateMerchantAsync(MerchantModel);
        return updated ?? throw new Exceptions.MerchantUpdateFailedException();
    }

    public async Task<MerchantModel> GetMerchantFullInfoAsync(Guid merchantId)
    {
        // For now same as GetMerchantInfoAsync but conceptually distinct for admin
        return await GetMerchantInfoAsync(merchantId);
    }
}



