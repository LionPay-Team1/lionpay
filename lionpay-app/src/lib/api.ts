import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any;

import { AuthControllerApi, UserControllerApi } from '../generated-api/auth';
import { WalletApi, TransactionApi, PaymentApi, MerchantApi } from '../generated-api/wallet';

// Use relative paths - nginx will proxy API requests to backend services
// When running in Docker, nginx proxies /api/v1/auth/* to auth-service and /api/v1/* to wallet-service
// When running locally in dev mode, these URLs should be configured in vite.config.ts proxy
// When running locally in dev mode, these URLs should be configured in vite.config.ts define
const AUTH_BASE_URL = process.env.AUTH_SERVICE_URL || '';
const WALLET_BASE_URL = process.env.WALLET_SERVICE_URL || '';

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Create Axios instances
const authAxios = axios.create({ baseURL: AUTH_BASE_URL });
const walletAxios = axios.create({ baseURL: WALLET_BASE_URL });

// Helper to get token
const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

// Request Interceptor: Attach Token
const attachTokenInterceptor = (config: InternalAxiosRequestConfig) => {
    // Exclude auth endpoints from attaching token
    if (config.url?.endsWith('/sign-in') || config.url?.endsWith('/sign-up')) {
        return config;
    }

    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

authAxios.interceptors.request.use(attachTokenInterceptor);
walletAxios.interceptors.request.use(attachTokenInterceptor);

// Shared Response Interceptor: Handle 401 & Refresh
let isRefreshing = false;
let failedQueue: { resolve: (token: string | null) => void; reject: (error: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const handleErrorInterceptor = async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
        // Prevent infinite loop if refresh endpoint itself returns 401
        if (originalRequest.url?.includes('/refresh-token')) {
            return Promise.reject(error);
        }

        // Don't retry for sign-in failures (wrong password)
        if (originalRequest.url?.endsWith('/sign-in')) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise(function (resolve, reject) {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axios(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = getRefreshToken();

        if (!refreshToken) {
            // No refresh token, logout
            handleLogout();
            return Promise.reject(error);
        }

        try {
            // Call refresh endpoint directly using a clean axios instance to avoid interceptor loops
            const response = await axios.post(`${AUTH_BASE_URL}/api/v1/auth/refresh-token`, {
                refreshToken: refreshToken
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
            if (newRefreshToken) {
                localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
            }

            authAxios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            walletAxios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            processQueue(null, accessToken);

            // Retry original request with the appropriate axios instance
            // We need to use base axios here because originalRequest already has the full URL if we are not careful,
            // but usually axios(originalRequest) works. However, to be safe:
            return axios(originalRequest);
        } catch (err) {
            processQueue(err, null);
            handleLogout();
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }

    return Promise.reject(error);
};

const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.location.href = '/signin';
};

authAxios.interceptors.response.use((response) => response, handleErrorInterceptor);
walletAxios.interceptors.response.use((response) => response, handleErrorInterceptor);

// Export API instances
// We pass empty string as basePath to override the generated BASE_PATH (http://localhost:8080)
// This allows axios instance's baseURL to be used for requests
export const authApi = new AuthControllerApi(undefined, '', authAxios);
export const userApi = new UserControllerApi(undefined, '', authAxios);
export const walletApi = new WalletApi(undefined, '', walletAxios);
export const transactionApi = new TransactionApi(undefined, '', walletAxios);
export const paymentApi = new PaymentApi(undefined, '', walletAxios);
export const merchantApi = new MerchantApi(undefined, '', walletAxios);

export const setAuthToken = (token: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearAuthToken = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const isAuthenticated = () => !!localStorage.getItem(ACCESS_TOKEN_KEY);
