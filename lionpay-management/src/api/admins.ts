import { adminAuthApi } from './client';
import axios from 'axios';

// Get auth service URL from environment
declare const process: { env: { [key: string]: string | undefined } };
const AUTH_BASE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8080';

export interface Admin {
    id: string;
    username: string;
    name: string;
    role: string;
    createdAt: string;
}

export interface AdminCreateParams {
    username: string;
    password: string;
    name: string;
}

export interface AdminUpdateParams {
    name?: string;
    password?: string;
    role?: 'ADMIN' | 'SUPER_ADMIN';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapAdmin = (a: any): Admin => ({
    id: a.adminId || '',
    username: a.username || '',
    name: a.name || '',
    role: a.role || 'ADMIN',
    createdAt: a.createdAt || new Date().toISOString()
});

export const adminsApi = {
    getAll: async (): Promise<Admin[]> => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${AUTH_BASE_URL}/api/v1/admin/admins`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.map(mapAdmin);
    },

    create: async (params: AdminCreateParams): Promise<Admin> => {
        const response = await adminAuthApi.createAdmin({
            adminCreateRequest: {
                username: params.username,
                password: params.password,
                name: params.name
            }
        });
        return mapAdmin(response.data);
    },

    update: async (adminId: string, params: AdminUpdateParams): Promise<Admin> => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.put(`${AUTH_BASE_URL}/api/v1/admin/admins/${adminId}`, params, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return mapAdmin(response.data);
    }
};

export default adminsApi;

