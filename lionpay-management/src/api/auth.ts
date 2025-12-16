import { adminAuthApi } from './client';
import type { TokenResponse } from '../generated-api/auth';

export type LoginResponse = TokenResponse;

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      // Use signIn1 for Admin login based on generated code checks
      const response = await adminAuthApi.signIn1({ adminSignInRequest: { username, password } });
      return response.data;
    } catch (error) {
      console.error('authApi.login(): backend request failed', error);
      throw error;
    }
  },
};
