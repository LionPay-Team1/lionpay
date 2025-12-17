import axios from 'axios';

declare const process: { env: { [key: string]: string | undefined } };

const WALLET_BASE_URL = process.env.WALLET_SERVICE_URL || 'http://localhost:8081';

const ACCESS_TOKEN_KEY = 'accessToken';

const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

const getAuthHeaders = () => ({
    Authorization: `Bearer ${getAccessToken()}`
});

export interface ExchangeRate {
    id: string;
    sourceCurrency: string;
    targetCurrency: string;
    rate: number;
    rateType: string;
    source: string;
    updatedAt: string;
}

export interface ExchangeRateHistory {
    id: string;
    exchangeRateId: string;
    sourceCurrency: string;
    targetCurrency: string;
    oldRate: number | null;
    newRate: number;
    changedAt: string;
    changedBy: string | null;
}

export interface Currency {
    currencyCode: string;
    currencyName: string;
    symbol: string | null;
    isActive: boolean;
}

export const exchangeRatesApi = {
    getAll: async (): Promise<ExchangeRate[]> => {
        const response = await axios.get(`${WALLET_BASE_URL}/api/v1/admin/exchange-rates`, {
            headers: getAuthHeaders()
        });
        return response.data as ExchangeRate[];
    },

    update: async (sourceCurrency: string, targetCurrency: string, rate: number): Promise<ExchangeRate> => {
        const response = await axios.put(`${WALLET_BASE_URL}/api/v1/admin/exchange-rates`, {
            sourceCurrency,
            targetCurrency,
            rate
        }, {
            headers: getAuthHeaders()
        });
        return response.data as ExchangeRate;
    },

    getHistory: async (sourceCurrency?: string, targetCurrency?: string, limit: number = 50): Promise<ExchangeRateHistory[]> => {
        const params = new URLSearchParams();
        if (sourceCurrency) params.append('sourceCurrency', sourceCurrency);
        if (targetCurrency) params.append('targetCurrency', targetCurrency);
        params.append('limit', limit.toString());

        const response = await axios.get(`${WALLET_BASE_URL}/api/v1/admin/exchange-rates/history?${params.toString()}`, {
            headers: getAuthHeaders()
        });
        return response.data as ExchangeRateHistory[];
    },

    getCurrencies: async (): Promise<Currency[]> => {
        const response = await axios.get(`${WALLET_BASE_URL}/api/v1/admin/exchange-rates/currencies`, {
            headers: getAuthHeaders()
        });
        return response.data as Currency[];
    }
};

export default exchangeRatesApi;
