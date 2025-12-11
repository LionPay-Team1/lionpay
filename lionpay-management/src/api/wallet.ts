import axios from 'axios';

// Wallet service base URL (separate from auth/users API)
// Use Vite env var `VITE_WALLET_BASE_URL` when available
const WALLET_BASE_URL = import.meta.env?.VITE_WALLET_BASE_URL ?? 'http://localhost:8081/api/v1';

export const walletApi = {
  getUserBalance: async (userId: number): Promise<{ userId: number; balance: number; currency?: string }> => {
    try {
      const url = `${WALLET_BASE_URL}/users/${userId}/balance`;
      const response = await axios.get(url, { timeout: 3000 });
      return response.data;
    } catch (error) {
      console.warn(`walletApi.getUserBalance(${userId}): backend request failed, using mock balance`, error);
      // Deterministic mock balance based on userId
      return {
        userId,
        balance: userId * 15000 + 5000,
        currency: 'KRW'
      };
    }
  },
};

export default walletApi;
