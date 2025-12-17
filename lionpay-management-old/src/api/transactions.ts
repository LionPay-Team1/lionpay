import { adminWalletApi } from './client';
import type { TransactionResponse } from '../generated-api/wallet';

export interface Transaction {
    id: string;
    userId: string;
    merchantId: string;
    merchantName: string;
    amount: number;
    txType: string;
    txStatus: string;
    balanceAfter: number;
    currency: string;
    originalAmount: number;
    createdAt: string;
}

const mapTransaction = (tx: TransactionResponse, userId: string): Transaction => {
    const amountVal = (tx.amount as unknown as { amount: number })?.amount ??
        (typeof tx.amount === 'number' ? tx.amount : 0);
    const balanceVal = (tx.balanceAfter as unknown as { amount: number })?.amount ??
        (typeof tx.balanceAfter === 'number' ? tx.balanceAfter : 0);
    const originalVal = (tx.originalAmount as unknown as { amount: number })?.amount ??
        (typeof tx.originalAmount === 'number' ? tx.originalAmount : 0);

    return {
        id: tx.txId,
        userId,
        merchantId: tx.merchantId,
        merchantName: tx.merchantName || '',
        amount: Number(amountVal),
        txType: tx.txType,
        txStatus: tx.txStatus,
        balanceAfter: Number(balanceVal),
        currency: tx.currency || 'KRW',
        originalAmount: Number(originalVal),
        createdAt: tx.createdAt
    };
};

export interface TransactionParams {
    limit?: number;
    offset?: number;
}

export const transactionsApi = {
    getUserTransactions: async (userId: string, params?: TransactionParams): Promise<Transaction[]> => {
        const response = await adminWalletApi.apiV1AdminTransactionsUserIdGet({
            userId,
            limit: params?.limit,
            offset: params?.offset
        });
        return response.data.map(tx => mapTransaction(tx, userId));
    }
};

export default transactionsApi;
