import { create } from 'zustand';
import { authApi, walletApi, transactionApi, userApi, exchangeRatesApi, setAuthToken, clearAuthToken, isAuthenticated } from './api';
import type { TransactionResponse } from '../generated-api/wallet';
import { TxType } from '../generated-api/wallet';

export type Country = {
    id: string;
    name: string;
    currency: string;
    rate: number;
    precision?: number;
};

// Default countries without rates - rates will be fetched from API
export const COUNTRIES: Country[] = [
    { id: 'kr', name: '대한민국', currency: 'KRW', rate: 1, precision: 0 },
    { id: 'jp', name: '일본', currency: 'JPY', rate: 0.1, precision: 0 }, // Initial fallback
];

export type Transaction = {
    id: string;
    type: 'charge' | 'use' | 'earn';
    title: string;
    date: string;
    time: string;
    amount: number;
    balanceAfter: number;
    earned?: number;
    currency?: string;
    originalAmount?: number;
};

interface AppState {
    country: Country;
    setCountry: (country: Country) => void;

    countries: Country[];
    money: number;
    transactions: Transaction[];
    userName: string;

    // Global Error State
    isGlobalErrorOpen: boolean;
    globalErrorMessage: string;
    openGlobalError: (message: string) => void;
    closeGlobalError: () => void;

    isAuthenticated: boolean;
    login: (phone: string, pin: string) => Promise<void>;
    logout: () => Promise<void>;

    fetchWallet: () => Promise<void>;
    fetchTransactions: () => Promise<void>;
    fetchUserInfo: () => Promise<void>;
    fetchExchangeRates: () => Promise<void>;

    initializeData: () => Promise<void>;

    // Optimistic updates or internal state helpers
    setMoney: (amount: number) => void;
    addMoney: (amount: number) => void;
    deductMoney: (amount: number) => void;
    addTransaction: (tx: Transaction) => void;
}

const mapTxType = (type: string): 'charge' | 'use' | 'earn' => {
    switch (type) {
        case TxType.Charge: return 'charge';
        case TxType.Payment: return 'use';
        case TxType.AdminCharge: return 'earn'; // Assuming admin charge is roughly equivalent to earn/points for now
        default: return 'use';
    }
};

const mapTransaction = (tx: TransactionResponse): Transaction => {
    const dateObj = new Date(tx.createdAt);
    const amountVal = (typeof tx.amount === 'number') ? tx.amount : ((tx.amount as unknown as { amount: number })?.amount ?? 0);
    const balanceAfter = (typeof tx.balanceAfter === 'number') ? tx.balanceAfter : ((tx.balanceAfter as unknown as { amount: number })?.amount ?? 0);
    const originalAmountVal = (typeof tx.originalAmount === 'number') ? tx.originalAmount : ((tx.originalAmount as unknown as { amount: number })?.amount ?? 0);

    return {
        id: tx.txId,
        type: mapTxType(tx.txType),
        title: tx.merchantName,
        date: dateObj.toLocaleDateString(),
        time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: Number(amountVal),
        balanceAfter: Number(balanceAfter),
        earned: 0,
        currency: tx.currency,
        originalAmount: Number(originalAmountVal)
    };
};

export const useAppStore = create<AppState>((set, get) => ({
    country: COUNTRIES[0],
    setCountry: (country) => set({ country }),

    countries: COUNTRIES,

    money: 0,
    transactions: [],
    userName: '',

    isGlobalErrorOpen: false,
    globalErrorMessage: '',
    openGlobalError: (message) => set((state) => {
        // Prevent opening if already open to avoid stacking or re-rendering unnecessarily
        if (state.isGlobalErrorOpen) return {};
        return { isGlobalErrorOpen: true, globalErrorMessage: message };
    }),
    closeGlobalError: () => set({ isGlobalErrorOpen: false, globalErrorMessage: '' }),

    isAuthenticated: isAuthenticated(),

    login: async (phone, pin) => {
        try {
            const response = await authApi.signIn({ signInRequest: { phone, password: pin } });
            if (response.data.accessToken && response.data.refreshToken) {
                setAuthToken(response.data.accessToken, response.data.refreshToken);
                set({ isAuthenticated: true });
                // Fetch initial data
                await useAppStore.getState().initializeData();
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            await authApi.signOut();
        } catch (e) {
            console.warn('Logout failed', e);
        } finally {
            clearAuthToken();
            set({ isAuthenticated: false, money: 0, transactions: [] });
        }
    },

    fetchWallet: async () => {
        try {
            const response = await walletApi.v1WalletMeGet();
            const wallet = response.data;

            const balanceVal = (typeof wallet.balance === 'number') ? wallet.balance : ((wallet.balance as unknown as { amount: number })?.amount ?? 0);
            // Also handling wallet type check carefully if enum
            if (wallet.walletType === 'Money') {
                set({ money: Number(balanceVal) });
            }
        } catch (error) {
            console.error('Fetch wallet failed:', error);
        }
    },

    fetchTransactions: async () => {
        try {
            const response = await transactionApi.v1WalletTransactionsGet();
            const transactions = response.data.map(mapTransaction);
            set({ transactions });
        } catch (error) {
            console.error('Fetch transactions failed:', error);
        }
    },

    fetchUserInfo: async () => {
        try {
            const response = await userApi.getCurrentUser();
            set({ userName: response.data.name || '' });
        } catch (error) {
            console.error('Fetch user info failed:', error);
            // Handle cases where token exists but user is invalid (e.g. DB reset, user deleted)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const status = (error as any)?.response?.status;
            if (status === 401 || status === 403 || status === 404) {
                get().logout();
            }
        }
    },

    fetchExchangeRates: async () => {
        try {
            const response = await exchangeRatesApi.v1WalletExchangeRatesGet();
            const rates = response.data;

            const newCountries = get().countries.map(c => {
                if (c.currency === 'KRW') return c;

                // 1. Try direct rate: KRW -> Target
                let rateObj = rates.find(r =>
                    r.sourceCurrency === 'KRW' && r.targetCurrency === c.currency
                );

                if (rateObj) {
                    const rateVal = (typeof rateObj.rate === 'number') ? rateObj.rate : ((rateObj.rate as unknown as { amount: number })?.amount ?? 0);
                    return { ...c, rate: Number(rateVal) };
                }

                // 2. Try inverse rate: Target -> KRW
                rateObj = rates.find(r =>
                    r.sourceCurrency === c.currency && r.targetCurrency === 'KRW'
                );

                if (rateObj) {
                    const rateVal = (typeof rateObj.rate === 'number') ? rateObj.rate : ((rateObj.rate as unknown as { amount: number })?.amount ?? 0);
                    const val = Number(rateVal);
                    if (val > 0) {
                        return { ...c, rate: 1 / val };
                    }
                }

                return c;
            });

            set({ countries: newCountries });

            // Update current country if it was updated
            const currentCountryId = get().country.id;
            const updatedCountry = newCountries.find(c => c.id === currentCountryId);
            if (updatedCountry) {
                set({ country: updatedCountry });
            }

        } catch (error) {
            console.error('Fetch exchange rates failed:', error);
        }
    },

    initializeData: async () => {
        const state = useAppStore.getState();

        if (state.isAuthenticated) {
            await Promise.all([
                state.fetchUserInfo(),
                state.fetchWallet(),
                state.fetchTransactions(),
                state.fetchExchangeRates()
            ]);
        }
    },

    setMoney: (money) => set({ money }),
    // Optimistic / Helper actions
    addMoney: (amount: number) => set((state) => ({ money: state.money + amount })),
    deductMoney: (amount: number) => set((state) => ({ money: state.money - amount })),
    addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
}));
