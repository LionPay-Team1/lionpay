import client from './client';

export interface PointTransaction {
  id: number;
  userId: number;
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

export const pointsApi = {
  getAllHistory: async (params?: PointHistoryParams): Promise<PointTransaction[]> => {
    const response = await client.get<PointTransaction[]>('/points/history', { params });
    return response.data;
  },
  getUserHistory: async (userId: number, params?: PointHistoryParams): Promise<PointTransaction[]> => {
    const response = await client.get<PointTransaction[]>(`/users/${userId}/points`, { params });
    return response.data;
  },
};
