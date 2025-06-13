import { api, ApiResponse, ENDPOINTS, handleApiError } from '../api';

// Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user' | 'collaborator';
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  sharePercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  token: string;
}

// Auth Service
export const authService = {
  // Register user
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(ENDPOINTS.AUTH.REGISTER, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Login user
  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(ENDPOINTS.AUTH.LOGIN, data);
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(handleApiError(error));
    }
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get<ApiResponse<User>>(ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update profile
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    try {
      const response = await api.put<ApiResponse<User>>(ENDPOINTS.AUTH.PROFILE, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Change password
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<null>> {
    try {
      const response = await api.put<ApiResponse<null>>(ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Logout
  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await api.post<ApiResponse<null>>(ENDPOINTS.AUTH.LOGOUT);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};