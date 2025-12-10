import client from './client';

export interface AdminProfile {
  id: number;
  username: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await client.post<LoginResponse>('/login', { username, password });
    return response.data;
  },
  getProfile: async (): Promise<AdminProfile> => {
    const response = await client.get<AdminProfile>('/profile');
    return response.data;
  },
};
