import api from '../lib/api';

export type NotificationType = 'PICKUP' | 'WALLET' | 'BADGE' | 'CHALLENGE' | 'MARKETPLACE' | 'CHARITY' | 'SYSTEM' | 'ADMIN';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl: string | null;
  read: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface NotificationsResponse {
  notification: Notification[];
  count: number;
}

export const notificationService = {
  getNotifications: async (page: number = 1): Promise<NotificationsResponse> => {
    const { data } = await api.get<NotificationsResponse>('/notification', {
      params: { page },
    });
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get<number>('/notification/unread-count');
    return Number(data) || 0;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const { data } = await api.patch<Notification>(`/notification/${id}/read`);
    return data;
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const { data } = await api.patch<{ success: boolean }>('/notification/read-all');
    return data;
  },

  deleteNotification: async (id: number): Promise<Notification> => {
    const { data } = await api.delete<Notification>(`/notification/${id}`);
    return data;
  },

  broadcast: async (payload: {
    title: string;
    body: string;
    actionUrl?: string;
  }): Promise<{ success: boolean }> => {
    const { data } = await api.post<{ success: boolean }>(
      '/admin/notifications/broadcast',
      payload
    );
    return data;
  },
};
