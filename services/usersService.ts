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
  address: string | null;
  kyc_status?: 'PENDING' | 'VERIFIED' | 'REJECTED' | null;
}

export interface GetUsersResponse {
  users: User[];
  roleCounts: Array<{ role: UserRole; _count: { role: number } }>;
}

export const userService = {
  getAllUsers: async (): Promise<GetUsersResponse> => {
    const { data } = await api.get('/admin/users');
    if (Array.isArray(data)) {
      return { users: data, roleCounts: [] };
    }
    return data;
  },

  getUserDetail: async (id: number): Promise<User> => {
    try {
      const { data } = await api.get<User>(`/admin/users/${id}`);
      return data;
    } catch {
      const { users } = await userService.getAllUsers();
      const found = users.find((u) => u.id === id);
      if (!found) throw new Error("User not found");
      return found;
    }
  },

  getMyProfile: async (): Promise<User> => {
    const { data } = await api.get<User>('/user');
    return data;
  },

  updateMyProfile: async (payload: Partial<User>): Promise<User> => {
    const { data } = await api.patch<User>('/user', payload);
    return data;
  },

  updateUserStatus: async (
    id: number,
    status: UserStatusValue
  ): Promise<User> => {
    const { data } = await api.patch<User>(`/admin/users/${id}/status`, {
      status,
    });
    return data;
  },

  suspendUser: async (id: number): Promise<User> => {
    return userService.updateUserStatus(id, 'SUSPENDED');
  },

  activateUser: async (id: number): Promise<User> => {
    return userService.updateUserStatus(id, 'ACTIVE');
  },

  banUser: async (id: number): Promise<User> => {
    return userService.updateUserStatus(id, 'BANNED');
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/user/${id}`);
  },
};

export default userService;
