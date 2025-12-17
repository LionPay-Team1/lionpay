import { adminAuthApi } from './client';

export interface User {
    id: string;
    phone: string;
    name: string;
    status: string;
    createdAt: string;
}

export interface UserListParams {
    search?: string;
    page?: number;
    size?: number;
}

export interface UserListResponse {
    users: User[];
    totalElements?: number;
    totalPages?: number;
}

/**
 * Convert phone number to E.164 format
 * 01012345678 → +821012345678
 * +821012345678 → +821012345678 (no change)
 */
export const formatPhoneToE164 = (phone: string): string => {
    if (!phone) return phone;

    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Already in E.164 format
    if (cleaned.startsWith('+82')) {
        return cleaned;
    }

    // Korean local format: 010xxxxxxxx → +8210xxxxxxxx
    if (cleaned.startsWith('0')) {
        return '+82' + cleaned.substring(1);
    }

    // Already without leading 0 (e.g., 1012345678)
    if (/^\d{9,11}$/.test(cleaned)) {
        return '+82' + cleaned;
    }

    return cleaned;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapUser = (u: any): User => {
    return {
        id: u.userId || '',
        phone: u.phone || '',
        name: u.name || u.phone || 'Unknown',
        status: u.status || 'ACTIVE',
        createdAt: u.createdAt || new Date().toISOString()
    };
};

export const usersApi = {
    getUsers: async (params?: UserListParams): Promise<UserListResponse> => {
        try {
            // Convert phone number to E.164 format for search
            const searchPhone = params?.search ? formatPhoneToE164(params.search) : undefined;

            const response = await adminAuthApi.getUsers({
                phone: searchPhone,
                page: params?.page || 0,
                size: params?.size || 20
            });

            // Response can be Page object { content: [], totalElements, totalPages } or just array
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = response.data as any;

            if (Array.isArray(data)) {
                return { users: data.map(mapUser) };
            }

            if (data.content) {
                return {
                    users: data.content.map(mapUser),
                    totalElements: data.totalElements,
                    totalPages: data.totalPages
                };
            }

            // Single user response
            if (data.userId) {
                return { users: [mapUser(data)] };
            }

            return { users: [] };
        } catch (error) {
            console.error('usersApi.getUsers() failed', error);
            throw error;
        }
    },

    getUser: async (userId: string): Promise<User | null> => {
        try {
            const response = await adminAuthApi.getUsers({ userId });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = response.data as any;

            if (data.userId) {
                return mapUser(data);
            }

            const list = Array.isArray(data) ? data : (data.content || []);
            if (list.length > 0) {
                return mapUser(list[0]);
            }

            return null;
        } catch (error) {
            console.error(`usersApi.getUser(${userId}) failed`, error);
            throw error;
        }
    }
};
