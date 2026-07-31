import api from '../lib/api';

export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type DocumentType = 'ID' | 'PASSPORT';

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

interface AdminKycApiResponse {
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  user_role: string;
  kyc: KycDocument | null;
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
