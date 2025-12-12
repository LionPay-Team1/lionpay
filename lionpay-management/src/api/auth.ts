import client from './client';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await client.post<LoginResponse>('/admin/sign-in', { username, password });
      return response.data;
    } catch (error) {
      console.warn('authApi.login(): backend request failed, using mock token', error);
      // Return a mock token for development
      return { 
        accessToken: 'mock-admin-token-standalone',
        refreshToken: 'mock-refresh-token'
      };
    }
  },
};
