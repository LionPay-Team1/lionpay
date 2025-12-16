import { create } from 'zustand';
import { authApi, walletApi, transactionApi, userApi, setAuthToken, clearAuthToken, isAuthenticated } from './api';
import type { TransactionResponse } from '../generated-api/wallet';
import { TxType } from '../generated-api/wallet';

export type Country = {
    id: string;
    name: string;
    currency: string;
    rate: number;
};

export const COUNTRIES: Country[] = [
    { id: 'kr', name: '대한민국', currency: 'KRW', rate: 1 },
    { id: 'jp', name: '일본', currency: 'JPY', rate: 0.11 },
    { id: 'us', name: '미국', currency: 'USD', rate: 0.00076 },
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
    money: number;
    transactions: Transaction[];
    userName: string;

    isAuthenticated: boolean;
    login: (phone: string, pin: string) => Promise<void>;
    logout: () => Promise<void>;

    fetchWallet: () => Promise<void>;
    fetchTransactions: () => Promise<void>;
    fetchUserInfo: () => Promise<void>;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const amountVal = (typeof tx.amount === 'number') ? tx.amount : ((tx.amount as any)?.amount ?? 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const balanceAfter = (typeof tx.balanceAfter === 'number') ? tx.balanceAfter : ((tx.balanceAfter as any)?.amount ?? 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalAmountVal = (typeof tx.originalAmount === 'number') ? tx.originalAmount : ((tx.originalAmount as any)?.amount ?? 0);

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

export const useAppStore = create<AppState>((set) => ({
    country: COUNTRIES[0],
    setCountry: (country) => set({ country }),

    money: 0,
    transactions: [],
    userName: '',

    isAuthenticated: isAuthenticated(),

    login: async (phone, pin) => {
        try {
            const response = await authApi.signIn({ signInRequest: { phone, password: pin } });
            if (response.data.accessToken && response.data.refreshToken) {
                setAuthToken(response.data.accessToken, response.data.refreshToken);
                set({ isAuthenticated: true });
                // Fetch initial data
                await useAppStore.getState().fetchWallet();
                await useAppStore.getState().fetchTransactions();
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
            const response = await walletApi.apiV1WalletsMeGet();
            const wallet = response.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const balanceVal = (typeof wallet.balance === 'number') ? wallet.balance : ((wallet.balance as any)?.amount ?? 0);
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
            const response = await transactionApi.apiV1TransactionsGet();
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
        }
    },

    initializeData: async () => {
        const state = useAppStore.getState();
        if (state.isAuthenticated) {
            await state.fetchUserInfo();
            await state.fetchWallet();
            await state.fetchTransactions();
        }
    },

    setMoney: (money) => set({ money }),
    // Optimistic / Helper actions
    addMoney: (amount: number) => set((state) => ({ money: state.money + amount })),
    deductMoney: (amount: number) => set((state) => ({ money: state.money - amount })),
    addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
}));
