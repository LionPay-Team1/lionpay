import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { AdminControllerApi, AuthControllerApi } from '../generated-api/auth';
import { WalletApi, TransactionApi, PaymentApi, AdminApi as AdminWalletApi } from '../generated-api/wallet';

// Environment variables exposed by Vite define
declare const process: { env: { [key: string]: string | undefined } };

const AUTH_BASE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8080';
const WALLET_BASE_URL = process.env.WALLET_SERVICE_URL || 'http://localhost:8081';

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

    // Handle Network Errors (Connection Refused)
    if (error.code === 'ERR_NETWORK') {
        alert("서버 연결에 실패했습니다. 관리자에게 문의하세요.");
        return Promise.reject(error);
    }

    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
        // Prevent infinite loop if refresh endpoint itself returns 401
        if (originalRequest.url?.includes('/refresh-token')) {
            return Promise.reject(error);
        }

        // Don't attempt token refresh for sign-in requests (login failures)
        if (originalRequest.url?.includes('/sign-in')) {
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
            handleLogout();
            return Promise.reject(error);
        }

        try {
            const response = await axios.post(`${AUTH_BASE_URL}/api/v1/admin/refresh-token`, {
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
    window.location.href = '/login';
};

authAxios.interceptors.response.use((response) => response, handleErrorInterceptor);
walletAxios.interceptors.response.use((response) => response, handleErrorInterceptor);

// Export API instances
export const adminAuthApi = new AdminControllerApi(undefined, undefined, authAxios);
export const adminWalletApi = new AdminWalletApi(undefined, undefined, walletAxios);
export const authApi = new AuthControllerApi(undefined, undefined, authAxios);
export const walletApi = new WalletApi(undefined, undefined, walletAxios);
export const transactionApi = new TransactionApi(undefined, undefined, walletAxios);
export const paymentApi = new PaymentApi(undefined, undefined, walletAxios);

export const setAuthToken = (token: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearAuthToken = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const isAuthenticated = () => !!localStorage.getItem(ACCESS_TOKEN_KEY);
