import api from '../lib/api';

export type UserRole = 'CITIZEN' | 'COLLECTOR' | 'RECYCLING_CENTER' | 'CHARITY' | 'ADMIN' | 'BUYER';

export type UserStatusValue = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'NOT_VERIFIED' | 'DELETED';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: UserStatusValue;
  role: UserRole;
  photo: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  provider: string | null;
  providerId: string | null;
  kyc_status?: 'PENDING' | 'VERIFIED' | 'REJECTED' | null;
}

export interface GetUsersResponse {
  users: User[];
  roleCounts: Array<{ role: UserRole; _count: { role: number } }>;
}

export const userService = {
  getAllUsers: async (): Promise<GetUsersResponse> => {
    const { data } = await api.get<GetUsersResponse>('/user/all');
    return data;
  },

  getMyProfile: async (): Promise<User> => {
    const { data } = await api.get<User>('/user');
    return data;
  },

  updateMyProfile: async (payload: Partial<User>): Promise<User> => {
    const { data } = await api.patch<User>('/user', payload);
    return data;
  },

  archiveUser: async (id: number): Promise<User> => {
    const { data } = await api.patch<User>(`/user/${id}`, { status: 'SUSPENDED' });
    return data;
  },

  suspendUser: async (id: number): Promise<User> => {
    const { data } = await api.patch<User>(`/user/${id}`, { status: 'SUSPENDED' });
    return data;
  },

  banUser: async (id: number): Promise<User> => {
    const { data } = await api.patch<User>(`/user/${id}`, { status: 'BANNED' });
    return data;
  },

  activateUser: async (id: number): Promise<User> => {
    const { data } = await api.patch<User>(`/user/${id}`, { status: 'ACTIVE' });
    return data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/user/${id}`);
  },
};

export default userService;
