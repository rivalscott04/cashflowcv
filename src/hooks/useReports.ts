import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
}

interface ReportItem {
  id: string;
  title: string;
  description: string;
  period: string;
  status: 'ready' | 'processing';
  type: string;
}

// Hook untuk mengambil ringkasan laporan
export const useReportSummary = () => {
  return useQuery({
    queryKey: ['reportSummary'],
    queryFn: async (): Promise<ReportSummary> => {
      try {
        // Menggunakan API transaksi untuk mendapatkan ringkasan
        const response = await api.transactions.getSummary();
        return {
          totalIncome: response.data.totalIncome || 0,
          totalExpense: response.data.totalExpense || 0,
          netProfit: response.data.netProfit || 0,
          profitMargin: response.data.profitMargin || 0,
        };
      } catch (error) {
        console.error('Error fetching report summary:', error);
        // Return default values if API fails
        return {
          totalIncome: 0,
          totalExpense: 0,
          netProfit: 0,
          profitMargin: 0,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook untuk mengambil daftar laporan yang tersedia
export const useAvailableReports = () => {
  return useQuery({
    queryKey: ['availableReports'],
    queryFn: async (): Promise<ReportItem[]> => {
      try {
        // Untuk sementara, kita gunakan data statis
        // Nantinya bisa diganti dengan API call yang sebenarnya
        const reports: ReportItem[] = [
          {
            id: 'profit-loss',
            title: 'Laporan Laba Rugi',
            description: 'Ringkasan pendapatan dan pengeluaran bulanan',
            period: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
            status: 'ready',
            type: 'profit-loss',
          },
          {
            id: 'balance-sheet',
            title: 'Laporan Neraca',
            description: 'Posisi keuangan dan aset perusahaan',
            period: `Per ${new Date().toLocaleDateString('id-ID')}`,
            status: 'ready',
            type: 'balance-sheet',
          },
          {
            id: 'cash-flow',
            title: 'Laporan Arus Kas',
            description: 'Pergerakan kas masuk dan keluar',
            period: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
            status: 'ready',
            type: 'cash-flow',
          },
          {
            id: 'tax-report',
            title: 'Laporan Pajak PPh Final',
            description: 'Perhitungan PPh Final 0.5% dari omzet',
            period: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
            status: 'processing',
            type: 'tax-report',
          },
        ];
        
        return reports;
      } catch (error) {
        console.error('Error fetching available reports:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook gabungan untuk semua data laporan
export const useReportsData = () => {
  const summary = useReportSummary();
  const reports = useAvailableReports();
  
  return {
    summary,
    reports,
    isLoading: summary.isLoading || reports.isLoading,
    isError: summary.isError || reports.isError,
    error: summary.error || reports.error,
  };
};