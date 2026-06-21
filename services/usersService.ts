// services/userService.ts
import api  from '../lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'CITIZEN' | 'COLLECTOR' | 'CHARITY'; // Map to your ENUM
  phone?: string;
  photo?: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
}

export const userService = {
  // GET /user/all (Admin Only)
  getAllUsers: async () => {
    const { data } = await api.get<User[]>('/user/all');
    return data;
  },

  // GET /user (Current User Profile)
  getMyProfile: async () => {
    const { data } = await api.get<User>('/user');
    return data;
  },

  // PATCH /user (Update Current Profile)
  updateMyProfile: async (payload: Partial<User>) => {
    const { data } = await api.patch<User>('/user', payload);
    return data;
  },

  // PATCH /user/:id (Archive user - Admin Only)
  archiveUser: async (id: number) => {
    const { data } = await api.patch(`/user/${id}`);
    return data;
  },

  // DELETE /user/:id (Delete user - Admin Only)
  deleteUser: async (id: number) => {
    const { data } = await api.delete(`/user/${id}`);
    return data;
  }
};