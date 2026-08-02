import api from '../lib/api';

export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type DocumentType = 'ID' | 'PASSPORT';
export type DocumentKind = 'ID' | 'SELFIE' | 'SUPPORTING';

export interface KycDocument {
  id: number;
  user_id: number;
  document_type: DocumentType;
  document_url: string;
  status: KycStatus;
  review_comment?: string | null;
  created_at: string;
  updated_at: string | null;
  reviewed_at: string | null;
  deleted_at: string | null;
}

export interface KycDocumentFile {
  id: number;
  type: DocumentKind;
  url: string;
  uploaded_at: string;
}

export interface KycApplicationDetail {
  id: number;
  user_id: number;
  user_name?: string;
  user_phone?: string | null;
  user_email?: string;
  document_type: DocumentType;
  document_url?: string;
  documents?: KycDocumentFile[];
  status: KycStatus;
  created_at: string;
  reviewed_at?: string | null;
  review_comment?: string | null;
  updated_at?: string | null;
}

interface AdminKycApiResponse {
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  user_role: string;
  kyc: KycDocument | null;
}

export interface KycQueueItem {
  id: number;
  user_id: number;
  user_name?: string;
  user_phone?: string | null;
  user_email?: string;
  document_type: DocumentType;
  document_url: string;
  status: KycStatus;
  created_at: string;
  reviewed_at: string | null;
  review_comment: string | null;
}

export const kycService = {
  getMyKyc: async (): Promise<KycDocument[]> => {
    const { data } = await api.get<KycDocument[]>('/kyc/my');
    return data;
  },

  getAllKycApplications: async (): Promise<AdminKycApiResponse[]> => {
    const { data } = await api.get<AdminKycApiResponse[]>('/kyc/all');
    return data;
  },

  getKycQueue: async (): Promise<KycQueueItem[]> => {
    const { data } = await api.get<KycQueueItem[]>('/admin/kyc');
    return data;
  },

  getKycApplication: async (id: number): Promise<KycApplicationDetail> => {
    const { data } = await api.get<KycApplicationDetail>(`/admin/kyc/${id}`);
    return data;
  },

  approveKyc: async (id: number): Promise<void> => {
    await api.patch(`/admin/kyc/${id}/approve`);
  },

  rejectKyc: async (
    id: number,
    reason: string
  ): Promise<KycApplicationDetail> => {
    const { data } = await api.patch<KycApplicationDetail>(
      `/admin/kyc/${id}/reject`,
      reason
    );
    return data;
  },

  getUserKyc: async (userId: number): Promise<KycDocument | null> => {
    try {
      const { data } = await api.get<KycDocument>(`/kyc/user/${userId}`);
      return data;
    } catch (error: unknown) {
      if (
        error !== null &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        return null;
      }
      throw error;
    }
  },

  updateKycStatus: async (
    userId: number,
    status: KycStatus,
    comment?: string
  ): Promise<KycDocument> => {
    const { data } = await api.patch<KycDocument>(
      `/kyc/user/${userId}/status`,
      { status, review_comment: comment }
    );
    return data;
  },
};

export default kycService;
