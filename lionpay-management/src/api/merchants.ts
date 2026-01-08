import { adminWalletApi } from './client';
import { type MerchantResponse, type MerchantModel, type CreateMerchantRequest, type UpdateMerchantRequest, MerchantStatus } from '../generated-api/wallet';

export { MerchantStatus };

export interface Merchant {
    id: string;
    name: string;
    countryCode: string;
    category: string;
    status: MerchantStatus;
    createdAt: string;
}

const mapMerchant = (m: MerchantResponse | MerchantModel): Merchant => ({
    id: m.merchantId || '',
    name: m.merchantName || '',
    countryCode: m.countryCode || '',
    category: m.merchantCategory || '',
    status: m.merchantStatus || MerchantStatus.Active,
    createdAt: m.createdAt || new Date().toISOString()
});

export const merchantsApi = {
    getAll: async (): Promise<Merchant[]> => {
        const response = await adminWalletApi.v1WalletAdminMerchantsGet();
        return response.data.map(mapMerchant);
    },

    getById: async (id: string): Promise<Merchant> => {
        const response = await adminWalletApi.v1WalletAdminMerchantsIdGet({ id });
        return mapMerchant(response.data);
    },

    create: async (data: CreateMerchantRequest): Promise<Merchant> => {
        const response = await adminWalletApi.v1WalletAdminMerchantsPost({
            createMerchantRequest: data
        });
        return mapMerchant(response.data);
    },

    update: async (id: string, data: UpdateMerchantRequest): Promise<Merchant> => {
        const response = await adminWalletApi.v1WalletAdminMerchantsIdPut({
            id,
            updateMerchantRequest: data
        });
        return mapMerchant(response.data);
    }
};

export default merchantsApi;
