import { adminWalletApi } from './client';



export const walletApi = {
  getUserBalance: async (userId: string): Promise<{ userId: string; balance: number; currency?: string }> => {
    try {
      // Use Admin API to get user wallet
      const response = await adminWalletApi.apiV1AdminWalletsUserIdGet({ userId });
      const wallet = response.data;
      const amountVal = (wallet.balance as unknown as { amount: number })?.amount ?? 0;

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
