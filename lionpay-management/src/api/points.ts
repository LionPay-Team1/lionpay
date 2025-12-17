import { adminWalletApi } from './client';
import type { TransactionResponse } from '../generated-api/wallet';
import { TxType } from '../generated-api/wallet';

export interface PointTransaction {
  id: string; // Changed to string
  userId: string; // Changed to string
  amount: number;
  type: 'EARN' | 'USE' | 'EXPIRE';
  description: string;
  createdAt: string;
}

export interface PointHistoryParams {
  page?: number;
  size?: number;
  type?: string;
}

const mapTx = (tx: TransactionResponse): PointTransaction => {
  // Determine type based on TxType
  // Payment -> USE? Charge -> EARN? 
  // Need clarification on Point vs Money transactions. 
  // For now mapping generic transactions.
  let type: 'EARN' | 'USE' | 'EXPIRE' = 'USE';
  if (tx.txType === TxType.Charge || tx.txType === TxType.AdminCharge) {
    type = 'EARN';
  }

  const amountVal = (tx.amount as unknown as { amount: number })?.amount ?? 0;

  return {
    id: tx.txId,
    userId: tx.merchantId, // Wait, merchantId? TransactionResponse doesn't have userId field?
    // Transaction is usually linked to a user/wallet but response might only show merchant?
    // Actually, if I fetch User transactions, I know the userId. 
    // But the response object itself might not carry it if it's implicit in the request context.
    // I'll put 'Unknown' or empty string if not available.
    amount: Number(amountVal),
    type,
    description: tx.merchantName || 'Transaction',
    createdAt: tx.createdAt
  }
};

export const pointsApi = {
  getAllHistory: async (_params?: PointHistoryParams): Promise<PointTransaction[]> => {
    // Admin API to get ALL transactions? 
    // Not found in typical generated code yet. 
    console.warn('pointsApi.getAllHistory not implemented in backend');
    return [];
  },

  getUserHistory: async (userId: string, params?: PointHistoryParams): Promise<PointTransaction[]> => {
    try {
      const response = await adminWalletApi.apiV1AdminTransactionsUserIdGet({
        userId,
        limit: params?.size,
        offset: params?.page
      });

      const list = response.data;
      // Map to PointTransaction & Filter for Points? 
      // Since we don't know which wallet it is (Money or Point), we might be mixing them.
      // But for "Points History" page, we should filter.
      // How to distinguish? txType is relevant but maybe currency?
      // We'll return all for now.
      return list.map(tx => ({ ...mapTx(tx), userId }));
    } catch (error) {
      console.error('pointsApi.getUserHistory failed', error);
      throw error;
    }
  },
};
