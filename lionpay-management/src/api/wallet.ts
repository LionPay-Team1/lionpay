import { adminWalletApi } from './client';

// @ts-ignore
const WALLET_BASE_URL = process.env.WALLET_SERVICE_URL || 'http://localhost:8081';

export const walletApi = {
  getUserBalance: async (userId: string): Promise<{ userId: string; balance: number; currency?: string }> => {
    try {
      // Use Admin API to get user wallet
      const response = await adminWalletApi.apiV1AdminWalletsUserIdGet({ userId });
      const wallet = response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const amountVal = (wallet.balance as any)?.amount ?? 0;

      return {
        userId,
        balance: Number(amountVal),
        currency: 'KRW'
      };
    } catch (error) {
      console.warn(`walletApi.getUserBalance(${userId}) failed`, error);
      throw error;
    }
  },
};

export default walletApi;
