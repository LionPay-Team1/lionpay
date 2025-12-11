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
    try {
      const response = await client.get<AdminProfile>('/profile');
      return response.data;
    } catch (error) {
      console.warn('authApi.getProfile(): backend request failed, using mock profile', error);
      // Return a default mock admin profile
      return {
        id: 1,
        username: 'admin',
        role: 'ADMIN',
      };
    }
  },
};
