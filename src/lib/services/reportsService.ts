import { api, ApiResponse, ENDPOINTS, handleApiError } from '../api';

// Types
export interface DashboardOverview {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeCount: number;
  expenseCount: number;
  collaboratorCount: number;
}

export interface RecentTransaction {
  _id: string;
  date: string;
  amount: number;
  title?: string;
  jobTitle?: string;
  clientName?: string;
  vendor?: string;
  category: string;
  type: 'income' | 'expense';
}

export interface MonthlyData {
  _id: number;
  total: number;
  count: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  recentTransactions: {
    income: RecentTransaction[];
    expenses: RecentTransaction[];
  };
  charts: {
    monthlyIncome: MonthlyData[];
    monthlyExpenses: MonthlyData[];
  };
}

export interface FinancialReportData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    totalTransactions: number;
  };
  income: {
    totalIncome: number;
    totalNetIncome: number;
    totalTax: number;
    count: number;
    averageAmount: number;
    paidIncome: number;
    pendingIncome: number;
    overdueIncome: number;
    byCategory: Array<{
      _id: string;
      total: number;
      count: number;
      average: number;
    }>;
  };
  expenses: {
    totalExpenses: number;
    count: number;
    averageAmount: number;
    taxDeductibleExpenses: number;
    nonTaxDeductibleExpenses: number;
    byCategory: Array<{
      _id: string;
      total: number;
      count: number;
      average: number;
    }>;
  };
  monthly: {
    income: MonthlyData[];
    expenses: MonthlyData[];
  };
  breakdowns: {
    paymentStatus: Array<{
      _id: string;
      total: number;
      count: number;
    }>;
    taxDeductible: Array<{
      _id: boolean;
      total: number;
      count: number;
    }>;
  };
}

export interface ReportsFilters {
  startDate?: string;
  endDate?: string;
  year?: number;
}

// Reports Service
export const reportsService = {
  // Get dashboard overview
  async getDashboard(filters: ReportsFilters = {}): Promise<ApiResponse<DashboardData>> {
    try {
      const response = await api.get<ApiResponse<DashboardData>>(
        ENDPOINTS.REPORTS.DASHBOARD
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get comprehensive financial report
  async getFinancialReport(filters: ReportsFilters = {}): Promise<ApiResponse<FinancialReportData>> {
    try {
      const response = await api.get<ApiResponse<FinancialReportData>>(
        ENDPOINTS.REPORTS.FINANCIAL
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get team report (Admin only)
  async getTeamReport(filters: ReportsFilters = {}): Promise<ApiResponse<any>> {
    try {
      const response = await api.get<ApiResponse<any>>(
        ENDPOINTS.REPORTS.TEAM
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};