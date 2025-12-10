import client from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  joinedAt: string;
}

export interface UserListParams {
  search?: string;
  page?: number;
  size?: number;
}

export const usersApi = {
  getUsers: async (params?: UserListParams): Promise<User[]> => {
    const response = await client.get<User[]>('/users', { params });
    return response.data;
  },
  getUser: async (userId: number): Promise<User> => {
    const response = await client.get<User>(`/users/${userId}`);
    return response.data;
  },
  updateUser: async (userId: number, data: Partial<User>): Promise<User> => {
    const response = await client.put<User>(`/users/${userId}`, data);
    return response.data;
  },
};
