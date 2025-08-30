import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
  incomeGrowth: number;
  expenseGrowth: number;
  profitGrowth: number;
}

interface RecentTransaction {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

// Hook untuk mengambil summary data dashboard
export const useDashboardSummary = (dateRange?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['dashboard-summary', dateRange],
    queryFn: async (): Promise<DashboardSummary> => {
      const response = await api.transactions.getSummary(dateRange);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook untuk mengambil transaksi terbaru
export const useRecentTransactions = (limit: number = 4) => {
  return useQuery({
    queryKey: ['recent-transactions', limit],
    queryFn: async (): Promise<RecentTransaction[]> => {
      const response = await api.transactions.getAll({ 
        limit, 
        sortBy: 'date', 
        sortOrder: 'desc' 
      });
      return response.data.transactions;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook untuk mengambil data chart bulanan
export const useMonthlyChartData = (year?: number) => {
  const currentYear = year || new Date().getFullYear();
  
  return useQuery({
    queryKey: ['monthly-chart-data', currentYear],
    queryFn: async (): Promise<MonthlyData[]> => {
      const response = await api.transactions.getSummary({
        startDate: `${currentYear}-01-01`,
        endDate: `${currentYear}-12-31`,
        groupBy: 'month'
      });
      return response.data.monthlyData || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook untuk mengambil semua data dashboard sekaligus
export const useDashboardData = (dateRange?: { startDate?: string; endDate?: string }) => {
  const summaryQuery = useDashboardSummary(dateRange);
  const recentTransactionsQuery = useRecentTransactions();
  const chartDataQuery = useMonthlyChartData();

  return {
    summary: summaryQuery,
    recentTransactions: recentTransactionsQuery,
    chartData: chartDataQuery,
    isLoading: summaryQuery.isLoading || recentTransactionsQuery.isLoading || chartDataQuery.isLoading,
    isError: summaryQuery.isError || recentTransactionsQuery.isError || chartDataQuery.isError,
    error: summaryQuery.error || recentTransactionsQuery.error || chartDataQuery.error,
  };
};