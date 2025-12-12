import client from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  joinedAt: string;
}

export interface UserListParams {
  search?: string;
  page?: number;
  size?: number;
}

// Local mock data used as a fallback when backend is unavailable.
const mockUsers: User[] = [
  { id: 1, name: '김관리', email: 'admin1@example.com', status: 'ACTIVE', joinedAt: new Date('2023-01-10').toISOString() },
  { id: 2, name: '박사용자', email: 'user2@example.com', status: 'ACTIVE', joinedAt: new Date('2023-02-15').toISOString() },
  { id: 3, name: '이테스트', email: 'user3@example.com', status: 'SUSPENDED', joinedAt: new Date('2023-03-20').toISOString() },
  { id: 4, name: '최준형', email: 'user4@example.com', status: 'INACTIVE', joinedAt: new Date('2024-01-05').toISOString() },
  { id: 5, name: '홍길동', email: 'user5@example.com', status: 'ACTIVE', joinedAt: new Date('2024-05-02').toISOString() },
];

export const usersApi = {
  getUsers: async (params?: UserListParams): Promise<User[]> => {
    try {
      const response = await client.get<{ users: User[], totalCount: number }>('/admin/users', { params });
      return response.data.users || [];
    } catch (error) {
      // Fallback to mock data for local testing
      console.warn('usersApi.getUsers(): backend request failed, using mock users', error);
      const q = (params?.search || '').toLowerCase();
      let results = mockUsers;
      if (q) {
        results = results.filter(u =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || String(u.id) === q
        );
      }
      const size = params?.size ?? results.length;
      const page = Math.max(0, (params?.page ?? 0));
      const start = page * size;
      return results.slice(start, start + size);
    }
  },

  getUser: async (userId: number): Promise<User> => {
    try {
      // Per spec: GET /api/v1/admin/users?userId=... returns the single user object
      const response = await client.get<User>('/admin/users', { params: { userId } });
      return response.data;
    } catch (error) {
      console.warn(`usersApi.getUser(${userId}): backend request failed, using mock user`, error);
      const found = mockUsers.find(u => u.id === userId);
      if (!found) throw error;
      return found;
    }
  },

  updateUser: async (userId: number, data: Partial<User>): Promise<User> => {
    try {
      const response = await client.put<User>(`/users/${userId}`, data);
      return response.data;
    } catch (error) {
      console.warn(`usersApi.updateUser(${userId}): backend request failed, applying to mock`, error);
      const idx = mockUsers.findIndex(u => u.id === userId);
      if (idx === -1) throw error;
      mockUsers[idx] = { ...mockUsers[idx], ...data } as User;
      return mockUsers[idx];
    }
  },
};
