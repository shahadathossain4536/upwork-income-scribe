
import axios, { AxiosError, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ msg: string; param: string; location: string }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Error handling utility
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors) {
      return error.response.data.errors.map((err: { msg: string }) => err.msg).join(', ');
    }
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred';
};

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    ME: '/api/auth/me',
    PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
  },
  INCOME: {
    LIST: '/api/income',
    CREATE: '/api/income',
    DETAIL: (id: string) => `/api/income/${id}`,
    UPDATE: (id: string) => `/api/income/${id}`,
    DELETE: (id: string) => `/api/income/${id}`,
    STATS: '/api/income/stats',
    UPLOAD_CSV: '/api/income/upload-csv',
  },
  EXPENSES: {
    LIST: '/api/expenses',
    CREATE: '/api/expenses',
    DETAIL: (id: string) => `/api/expenses/${id}`,
    UPDATE: (id: string) => `/api/expenses/${id}`,
    DELETE: (id: string) => `/api/expenses/${id}`,
    STATS: '/api/expenses/stats',
    UPLOAD_CSV: '/api/expenses/upload-csv',
  },
  REPORTS: {
    DASHBOARD: '/api/reports/dashboard',
    FINANCIAL: '/api/reports/financial',
    TEAM: '/api/reports/team',
  },
} as const;
