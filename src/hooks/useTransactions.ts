import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  notes?: string;
  invoice_file_id?: string;
  tax_invoice_file_id?: string;
  created_at: string;
  updated_at: string;
}

interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface CreateTransactionData {
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  notes?: string;
  invoice_file_id?: string;
  tax_invoice_file_id?: string;
}

// Hook untuk mengambil semua transaksi dengan filter
export const useTransactions = (filters: TransactionFilters = {}) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const response = await api.transactions.getAll(filters);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook untuk mengambil transaksi berdasarkan ID
export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const response = await api.transactions.getById(id);
      return response.data.transaction;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook untuk mengambil kategori transaksi
export const useTransactionCategories = () => {
  return useQuery({
    queryKey: ['transaction-categories'],
    queryFn: async () => {
      const response = await api.transactions.getCategories();
      return response.data.categories;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook untuk membuat transaksi baru
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      const response = await api.transactions.create(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate dan refetch queries terkait
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-chart-data'] });
      
      toast({
        title: "Berhasil!",
        description: "Transaksi berhasil disimpan",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan transaksi",
        variant: "destructive",
      });
    },
  });
};

// Hook untuk mengupdate transaksi
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTransactionData> }) => {
      const response = await api.transactions.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate dan refetch queries terkait
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-chart-data'] });
      
      toast({
        title: "Berhasil!",
        description: "Transaksi berhasil diperbarui",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui transaksi",
        variant: "destructive",
      });
    },
  });
};

// Hook untuk menghapus transaksi
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.transactions.delete(id);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate dan refetch queries terkait
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-chart-data'] });
      
      toast({
        title: "Berhasil!",
        description: "Transaksi berhasil dihapus",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus transaksi",
        variant: "destructive",
      });
    },
  });
};