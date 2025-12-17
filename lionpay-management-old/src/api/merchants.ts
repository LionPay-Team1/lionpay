import { adminWalletApi } from './client';
import type { MerchantResponse, MerchantModel, CreateMerchantRequest, UpdateMerchantRequest } from '../generated-api/wallet';

export interface Merchant {
    id: string;
    name: string;
    countryCode: string;
    category: string;
    status: string;
    createdAt: string;
}

const mapMerchant = (m: MerchantResponse | MerchantModel): Merchant => ({
    id: m.merchantId || '',
    name: m.merchantName || '',
    countryCode: m.countryCode || '',
    category: m.merchantCategory || '',
    status: m.merchantStatus || '',
    createdAt: m.createdAt || new Date().toISOString()
});

export const merchantsApi = {
    getAll: async (): Promise<Merchant[]> => {
        const response = await adminWalletApi.apiV1AdminMerchantsGet();
        return response.data.map(mapMerchant);
    },

    getById: async (id: string): Promise<Merchant> => {
        const response = await adminWalletApi.apiV1AdminMerchantsIdGet({ id });
        return mapMerchant(response.data);
    },

    create: async (data: CreateMerchantRequest): Promise<Merchant> => {
        const response = await adminWalletApi.apiV1AdminMerchantsPost({
            createMerchantRequest: data
        });
        return mapMerchant(response.data);
    },

    update: async (id: string, data: UpdateMerchantRequest): Promise<Merchant> => {
        const response = await adminWalletApi.apiV1AdminMerchantsIdPut({
            id,
            updateMerchantRequest: data
        });
        return mapMerchant(response.data);
    }
};

export default merchantsApi;
