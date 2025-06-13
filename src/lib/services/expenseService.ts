import { api, ApiResponse, ENDPOINTS, handleApiError } from '../api';

// Types
export interface Expense {
  _id: string;
  user: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  vendor?: string;
  date: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR';
  description?: string;
  paymentMethod?: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'other';
  isTaxDeductible?: boolean;
  status?: 'paid' | 'pending' | 'overdue';
  createdAt: string;
  updatedAt: string;
  workDate: string;
}

export type ExpenseCategory =
  | 'Software & Tools'
  | 'Hardware & Equipment'
  | 'Marketing & Advertising'
  | 'Office & Supplies'
  | 'Travel & Transportation'
  | 'Professional Services'
  | 'Training & Education'
  | 'Insurance'
  | 'Taxes'
  | 'Utilities'
  | 'Rent'
  | 'Internet & Phone'
  | 'Other';

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  isTaxDeductible?: boolean;
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
}

export interface CreateExpenseData {
  title: string;
  amount: number;
  category: ExpenseCategory;
  vendor?: string;
  date?: string;
  currency?: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR';
  description?: string;
  paymentMethod?: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'other';
  isTaxDeductible?: boolean;
  status?: 'paid' | 'pending' | 'overdue';
  workDate: string;
}

export type UpdateExpenseData = Partial<CreateExpenseData>;

export interface ExpenseListResponse {
  data: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ExpenseStatsResponse {
  totalExpenses: number;
  count: number;
  averageAmount: number;
  taxDeductibleExpenses: number;
  nonTaxDeductibleExpenses: number;
  categoryStats: Array<{
    category: string;
    total: number;
    count: number;
    average: number;
  }>;
  monthlyExpenses: Array<{
    month: number;
    total: number;
    count: number;
  }>;
}

// Expense Service
export const expenseService = {
  // Get all expense entries
  async getExpenses(filters: ExpenseFilters = {}): Promise<ApiResponse<ExpenseListResponse>> {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.isTaxDeductible !== undefined) params.append('isTaxDeductible', filters.isTaxDeductible.toString());
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.month) params.append('month', filters.month.toString());
      if (filters.year) params.append('year', filters.year.toString());

      const response = await api.get<ApiResponse<ExpenseListResponse>>(
        `${ENDPOINTS.EXPENSES.LIST}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get expense statistics
  async getExpenseStats(startDate?: string, endDate?: string): Promise<ApiResponse<ExpenseStatsResponse>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get<ApiResponse<ExpenseStatsResponse>>(
        `${ENDPOINTS.EXPENSES.STATS}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get single expense entry
  async getExpense(id: string): Promise<ApiResponse<Expense>> {
    try {
      const response = await api.get<ApiResponse<Expense>>(ENDPOINTS.EXPENSES.DETAIL(id));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create expense entry
  async createExpense(data: CreateExpenseData): Promise<ApiResponse<Expense>> {
    try {
      const response = await api.post<ApiResponse<Expense>>(ENDPOINTS.EXPENSES.CREATE, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update expense entry
  async updateExpense(id: string, data: UpdateExpenseData): Promise<ApiResponse<Expense>> {
    try {
      const response = await api.put<ApiResponse<Expense>>(ENDPOINTS.EXPENSES.UPDATE(id), data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete expense entry
  async deleteExpense(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete<ApiResponse<null>>(ENDPOINTS.EXPENSES.DELETE(id));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Bulk delete expense entries
  async bulkDeleteExpenses(ids: string[]): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete<ApiResponse<null>>(ENDPOINTS.EXPENSES.DELETE('bulk'), {
        data: { ids }
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};