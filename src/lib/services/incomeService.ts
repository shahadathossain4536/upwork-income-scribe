import { api, ApiResponse, ENDPOINTS, handleApiError } from '../api';

// Types
export interface Income {
  _id: string;
  user: string;
  jobTitle: string;
  clientName: string;
  amount: number;
  category: IncomeCategory;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  date: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR';
  description?: string;
  hours?: number;
  hourlyRate?: number;
  taxAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export type IncomeCategory =
  | 'Web Development'
  | 'Mobile Development'
  | 'Design'
  | 'Backend Development'
  | 'Consulting'
  | 'Content Writing'
  | 'SEO'
  | 'Marketing'
  | 'Data Analysis'
  | 'Other';

export interface CreateIncomeData {
  jobTitle: string;
  clientName: string;
  amount: number;
  category: IncomeCategory;
  paymentStatus?: 'paid' | 'pending' | 'overdue';
  date?: string;
  currency?: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR';
  description?: string;
  hours?: number;
  hourlyRate?: number;
  taxAmount?: number;
  workDate: string;
}

export interface UpdateIncomeData extends Partial<CreateIncomeData> {}

export interface IncomeFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: IncomeCategory;
  paymentStatus?: 'paid' | 'pending' | 'overdue';
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
}

export interface IncomeStats {
  totalIncome: number;
  count: number;
  averageIncome: number;
  highestIncome: number;
  lowestIncome: number;
}

export interface IncomeByCategory {
  category: IncomeCategory;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyIncome {
  month: number;
  year: number;
  total: number;
  count: number;
}

export interface IncomeListResponse {
  data: Income[];
  stats: {
    _id: null;
    totalIncome: number;
    totalNetIncome: number;
    totalTax: number;
    count: number;
    averageAmount: number;
    paidIncome: number;
    pendingIncome: number;
    overdueIncome: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IncomeStatsResponse {
  data: {
    totalIncome: number;
    count: number;
    averageIncome: number;
    highestIncome: number;
    lowestIncome: number;
    categoryStats: IncomeByCategory[];
    monthlyIncome: MonthlyIncome[];
  };
}

// Income Service
export const incomeService = {
  // Get all income entries
  async getIncome(filters: IncomeFilters = {}): Promise<ApiResponse<IncomeListResponse>> {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.month) params.append('month', filters.month.toString());
      if (filters.year) params.append('year', filters.year.toString());

      const response = await api.get<ApiResponse<IncomeListResponse>>(
        `${ENDPOINTS.INCOME.LIST}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get income statistics
  async getIncomeStats(startDate?: string, endDate?: string): Promise<ApiResponse<IncomeStatsResponse>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get<ApiResponse<IncomeStatsResponse>>(
        `${ENDPOINTS.INCOME.STATS}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get single income entry
  async getIncomeById(id: string): Promise<ApiResponse<Income>> {
    try {
      const response = await api.get<ApiResponse<Income>>(ENDPOINTS.INCOME.DETAIL(id));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create income entry
  async createIncome(data: CreateIncomeData): Promise<ApiResponse<Income>> {
    try {
      const response = await api.post<ApiResponse<Income>>(ENDPOINTS.INCOME.CREATE, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update income entry
  async updateIncome(id: string, data: UpdateIncomeData): Promise<ApiResponse<Income>> {
    try {
      const response = await api.put<ApiResponse<Income>>(ENDPOINTS.INCOME.UPDATE(id), data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete income entry
  async deleteIncome(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete<ApiResponse<null>>(ENDPOINTS.INCOME.DELETE(id));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Upload CSV file
  async uploadCSV(file: File): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await api.post<ApiResponse<any>>(
        `${ENDPOINTS.INCOME.UPLOAD_CSV}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};