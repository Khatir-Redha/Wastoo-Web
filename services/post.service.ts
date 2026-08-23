import api from '../lib/api';

export type WasteCategory = 'PLASTIC' | 'GLASS' | 'PAPER' | 'METAL' | 'ORGANIC' | 'TEXTILE' | 'HAZARDOUS' | 'MIXED';

export type PostStatus = 'OPEN' | 'CLAIMED' | 'DELETED' | 'COMPLETED';

export interface WasteImage {
  id: number;
  post_id: number;
  url: string;
  order: number;
  createAt: string;
}

export interface Post {
  id: number;
  title: string;
  description: string | null;
  author_id: number;
  category: WasteCategory;
  status: PostStatus;
  quantity: number | null;
  avail_start: string | null;
  avail_end: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number | null;
  images: WasteImage[];
  pickup?: {
    id: number;
    post_id: number;
    owner_id: number;
    collector_id: number | null;
    status: string;
    scheduled_at: string | null;
    completed_at: string | null;
    collected_weight: number | null;
  };
}

export interface PostsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PostsResponse {
  data: Post[];
  meta: PostsMeta;
}

export interface CreatePostDto {
  title: string;
  description?: string;
  category: WasteCategory;
  status?: PostStatus;
  quantity?: number;
  price?: number;
  avail_start?: string;
  avail_end?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface UpdatePostDto {
  title?: string;
  description?: string;
  category?: WasteCategory;
  status?: PostStatus;
  quantity?: number;
  price?: number;
  avail_start?: string;
  avail_end?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
}

export const postService = {
  getAllPosts: async (params?: { category?: string; status?: string; page?: number; limit?: number }): Promise<PostsResponse> => {
    const { data } = await api.get<PostsResponse>('/post', { params });
    return data;
  },

  getPostById: async (id: number): Promise<Post> => {
    const { data } = await api.get<Post>(`/post/${id}`);
    return data;
  },

  updatePost: async (id: number, data: UpdatePostDto): Promise<Post> => {
    const { data: post } = await api.patch<Post>(`/post/${id}`, data);
    return post;
  },

  deletePost: async (id: number): Promise<void> => {
    await api.delete(`/post/${id}`);
  },
};

export default postService;
