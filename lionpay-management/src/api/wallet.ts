import axios from 'axios';

// Wallet service base URL (separate from auth/users API)
// Use Vite env var `VITE_WALLET_BASE_URL` when available
const WALLET_BASE_URL = (import.meta as any).env?.VITE_WALLET_BASE_URL ?? 'http://localhost:8081/api/v1';

export const walletApi = {
  getUserBalance: async (userId: number): Promise<{ userId: number; balance: number; currency?: string }> => {
    const url = `${WALLET_BASE_URL}/users/${userId}/balance`;
    const response = await axios.get(url, { timeout: 3000 });
    return response.data;
  },
};

export default walletApi;
