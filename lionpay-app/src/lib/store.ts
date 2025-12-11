import { create } from 'zustand';

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
    id: number;
    type: 'charge' | 'use' | 'earn';
    title: string;
    date: string;
    time: string;
    amount: number;
    earned?: number;
};

interface AppState {
    country: Country;
    setCountry: (country: Country) => void;
    money: number;
    points: number;
    transactions: Transaction[];
    paymentPriority: 'money' | 'points';
    setPaymentPriority: (priority: 'money' | 'points') => void;

    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;

    setMoney: (amount: number) => void;
    addMoney: (amount: number) => void;
    deductMoney: (amount: number) => void;
    addPoints: (amount: number) => void;
    deductPoints: (amount: number) => void;
    addTransaction: (tx: Transaction) => void;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
    { id: 1, type: 'use', title: '스타벅스 강남점', date: '2023.12.08', time: '12:30', amount: -4500, earned: 45 },
    { id: 11, type: 'earn', title: '스타벅스 강남점 적립', date: '2023.12.08', time: '12:30', amount: 45 },
    { id: 2, type: 'charge', title: '포인트 충전', date: '2023.12.07', time: '18:20', amount: 50000 },
    { id: 3, type: 'use', title: 'GS25 편의점', date: '2023.12.06', time: '09:15', amount: -3200, earned: 32 },
    { id: 31, type: 'earn', title: 'GS25 편의점 적립', date: '2023.12.06', time: '09:15', amount: 32 },
    { id: 4, type: 'use', title: '택시비', date: '2023.12.05', time: '23:40', amount: -12500, earned: 125 },
];

export const useAppStore = create<AppState>((set) => ({
    country: COUNTRIES[0],
    setCountry: (country) => set({ country }),

    money: 1250000,
    points: 1540,
    transactions: INITIAL_TRANSACTIONS,
    paymentPriority: 'money', // Default
    setPaymentPriority: (priority) => set({ paymentPriority: priority }),

    isAuthenticated: false,
    login: () => set({ isAuthenticated: true }),
    logout: () => set({ isAuthenticated: false }),

    setMoney: (money) => set({ money }),
    addMoney: (amount) => set((state) => ({ money: state.money + amount })),
    deductMoney: (amount) => set((state) => ({ money: state.money - amount })),
    addPoints: (amount) => set((state) => ({ points: state.points + amount })),
    deductPoints: (amount) => set((state) => ({ points: state.points - amount })),
    addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
}));
