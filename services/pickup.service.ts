import api from '../lib/api';

export type PickupStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELED';

export interface UserRef {
  id: number;
  name: string;
  email: string;
}

export interface PostRef {
  id: number;
  title: string;
  category: string;
  status: string;
  images: { url: string }[];
}

export interface Pickup {
  id: number;
  post_id: number;
  collector_id: number | null;
  owner_id: number;
  status: PickupStatus;
  scheduled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  collected_weight: number | null;
  post: PostRef;
  owner: UserRef;
  collector: UserRef | null;
}

export interface UpdatePickupDto {
  status?: PickupStatus;
  collected_weight?: number;
  scheduled_at?: string;
}

export const pickupService = {
  getAllPickups: async (): Promise<Pickup[]> => {
    const { data } = await api.get<Pickup[]>('/pickup');
    return data;
  },

  getPickupById: async (id: number): Promise<Pickup> => {
    const { data } = await api.get<Pickup>(`/pickup/${id}`);
    return data;
  },

  updatePickup: async (id: number, data: UpdatePickupDto): Promise<Pickup> => {
    const { data: pickup } = await api.patch<Pickup>(`/pickup/${id}`, data);
    return pickup;
  },

  deletePickup: async (id: number): Promise<void> => {
    await api.delete(`/pickup/${id}`);
  },
};

export default pickupService;
