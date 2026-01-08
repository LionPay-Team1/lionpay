import { adminWalletApi } from './client';

export interface WalletBalance {
    balance: number;
    currency: string;
}

export const walletApi = {
    getUserBalance: async (userId: string): Promise<WalletBalance | null> => {
        try {
            const response = await adminWalletApi.v1WalletAdminWalletsUserIdGet({ userId });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = response.data as any;

            // Handle the balance response which may have nested amount object
            const balanceVal = data?.balance?.amount ?? data?.balance ?? 0;

            return {
                balance: Number(balanceVal),
                currency: data?.currency || 'KRW'
            };
        } catch (error) {
            console.error(`walletApi.getUserBalance(${userId}) failed`, error);
            return null;
        }
    }
};
