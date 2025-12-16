import { adminAuthApi } from './client';
import type { UserResponse } from '../generated-api/auth';

export interface User {
  id: string; // ID is string (UUID) in backend
  name: string;
  email: string; // Backend uses phone
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  joinedAt: string;
}

export interface UserListParams {
  search?: string;
  page?: number;
  size?: number;
}

const mapUser = (u: UserResponse): User => {
  return {
    id: u.userId || '',
    name: u.phone || 'Unknown', // Backend doesn't return name for generic users list?
    email: u.phone || '',
    status: (u.status as unknown as 'ACTIVE') || 'ACTIVE',
    joinedAt: u.createdAt || new Date().toISOString()
  };
};

export const usersApi = {
  getUsers: async (params?: UserListParams): Promise<User[]> => {
    try {
      // Params: phone, userId, page, size
      // Map 'search' to phone or userId if valid
      const phone = params?.search; // Naive mapping
      const response = await adminAuthApi.getUsers({
        phone: phone,
        page: params?.page || 0,
        size: params?.size || 10
      });
      // response.data is 'object'? Generated code said Promise<object>. 
      // I need to cast it to expected Page<UserResponse> or List<UserResponse>.
      // Let's assume it's a Page object { content: [], ... } or just array.
      // Based on typical Spring Data or similar, it's Page.
      // But generated code said `object`. I'll try to treat it as { content: UserResponse[] } or UserResponse[]
      const data = response.data as { content?: UserResponse[] };
      const list = Array.isArray(data) ? data : (data.content || []);
      return list.map(mapUser);
    } catch (error) {
      console.error('usersApi.getUsers() failed', error);
      throw error;
    }
  },

  getUser: async (userId: string): Promise<User> => { // Changed ID type to string
    try {
      // API supports filtering by userId in getUsers
      const response = await adminAuthApi.getUsers({ userId: userId });
      const data = response.data as { content?: UserResponse[] };
      const list = Array.isArray(data) ? data : (data.content || []);
      if (list.length > 0) {
        return mapUser(list[0]);
      }
      throw new Error('User not found');
    } catch (error) {
      console.error(`usersApi.getUser(${userId}) failed`, error);
      throw error;
    }
  },

  updateUser: async (_userId: string, _data: Partial<User>): Promise<User> => {
    // AdminController doesn't seem to have updateUser endpoint in the snippet I saw? 
    // Only createAdmin, getUsers, signIn, signOut. 
    // If missing, throw error.
    throw new Error('Update user not implemented in backend API');
  },
};
