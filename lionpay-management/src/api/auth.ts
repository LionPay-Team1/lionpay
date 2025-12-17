import { adminAuthApi } from './client';
import type { TokenResponse } from '../generated-api/auth';

export type LoginResponse = TokenResponse;

export const authApi = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await adminAuthApi.signIn1({ adminSignInRequest: { username, password } });
            return response.data;
        } catch (error) {
            console.error('authApi.login(): backend request failed', error);
            throw error;
        }
    },

    logout: async (refreshToken: string): Promise<void> => {
        try {
            await adminAuthApi.signOut1({ signOutRequest: { refreshToken } });
        } catch (error) {
            console.error('authApi.logout(): backend request failed', error);
            // Don't throw - logout should always succeed locally
        }
    },

    refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
        const response = await adminAuthApi.refreshAdminToken({ refreshTokenRequest: { refreshToken } });
        return response.data;
    }
};
