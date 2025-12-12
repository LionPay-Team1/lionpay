import client from './client';

export interface AdminProfile {
  id: number;
  username: string;
  role: string;
}

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
  getProfile: async (): Promise<AdminProfile> => {
    // Note: The Admin API spec does not explicitly provide a 'get profile' endpoint.
    // We are retaining this for now to support the frontend logic.
    // If needed, this should likely call a specific admin info endpoint.
    return {
      id: 1,
      username: 'admin',
      role: 'ADMIN',
    };
  },
};
