import { api, ApiResponse, ENDPOINTS, handleApiError } from '../api';

// Types
export interface CollaborationMember {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  role: 'admin' | 'member' | 'viewer';
  sharePercentage: number;
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface CollaborationSettings {
  allowIncomeSharing: boolean;
  allowExpenseSharing: boolean;
  allowMemberInvites: boolean;
  requireApproval: boolean;
  visibility: 'public' | 'private' | 'invite-only';
}

export interface Collaboration {
  _id: string;
  name: string;
  description?: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  members: CollaborationMember[];
  settings: CollaborationSettings;
  status: 'active' | 'inactive' | 'archived';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  activeMemberCount: number;
}

export interface CollaborationStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  memberCount: number;
  activeMemberCount: number;
}

export interface CreateCollaborationData {
  name: string;
  description?: string;
  members?: Array<{
    user: string;
    role?: 'admin' | 'member' | 'viewer';
    sharePercentage?: number;
  }>;
  settings?: Partial<CollaborationSettings>;
  tags?: string[];
}

export interface UpdateCollaborationData extends Partial<CreateCollaborationData> {}

export interface AddMemberData {
  user: string;
  role?: 'admin' | 'member' | 'viewer';
  sharePercentage?: number;
}

export interface CollaborationFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CollaborationListResponse {
  data: Collaboration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Collaboration Service
export const collaborationService = {
  // Get all collaborations
  async getCollaborations(filters: CollaborationFilters = {}): Promise<ApiResponse<CollaborationListResponse>> {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get<ApiResponse<CollaborationListResponse>>(
        `/collaborations?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get single collaboration
  async getCollaboration(id: string): Promise<ApiResponse<Collaboration & { stats: CollaborationStats }>> {
    try {
      const response = await api.get<ApiResponse<Collaboration & { stats: CollaborationStats }>>(
        `/collaborations/${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create collaboration
  async createCollaboration(data: CreateCollaborationData): Promise<ApiResponse<Collaboration>> {
    try {
      const response = await api.post<ApiResponse<Collaboration>>('/collaborations', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update collaboration
  async updateCollaboration(id: string, data: UpdateCollaborationData): Promise<ApiResponse<Collaboration>> {
    try {
      const response = await api.put<ApiResponse<Collaboration>>(`/collaborations/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Add member to collaboration
  async addMember(collaborationId: string, data: AddMemberData): Promise<ApiResponse<Collaboration>> {
    try {
      const response = await api.post<ApiResponse<Collaboration>>(
        `/collaborations/${collaborationId}/members`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Remove member from collaboration
  async removeMember(collaborationId: string, userId: string): Promise<ApiResponse<Collaboration>> {
    try {
      const response = await api.delete<ApiResponse<Collaboration>>(
        `/collaborations/${collaborationId}/members/${userId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete collaboration
  async deleteCollaboration(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/collaborations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};