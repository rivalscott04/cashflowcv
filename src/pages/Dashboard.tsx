import { TrendingUp, TrendingDown, DollarSign, PieChart, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import SummaryCard from "@/components/dashboard/SummaryCard";
import RevenueChart from "@/components/charts/RevenueChart";
import heroImage from "@/assets/financial-hero.jpg";
import { useDashboardData } from "@/hooks/useDashboard";

const Dashboard = () => {
  const { summary, recentTransactions, chartData, isLoading, isError, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Memuat data dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-error mb-2">Gagal memuat data dashboard</p>
            <p className="text-muted-foreground text-sm">{error?.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-primary overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Financial Dashboard" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Sistem Laporan Keuangan
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Kelola keuangan Sasambo Solusi Digital dengan mudah dan profesional
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Pendapatan"
            amount={summary.data?.totalIncome || 0}
            icon={TrendingUp}
            variant="income"
            trend={{ value: summary.data?.incomeGrowth || 0, isPositive: (summary.data?.incomeGrowth || 0) >= 0 }}
          />
          <SummaryCard
            title="Total Pengeluaran"
            amount={summary.data?.totalExpense || 0}
            icon={TrendingDown}
            variant="expense"
            trend={{ value: summary.data?.expenseGrowth || 0, isPositive: (summary.data?.expenseGrowth || 0) >= 0 }}
          />
          <SummaryCard
            title="Laba Bersih"
            amount={summary.data?.netProfit || 0}
            icon={DollarSign}
            variant="profit"
            trend={{ value: summary.data?.profitGrowth || 0, isPositive: (summary.data?.profitGrowth || 0) >= 0 }}
          />
          <SummaryCard
            title="Margin Keuntungan"
            amount={summary.data?.profitMargin || 0}
            icon={PieChart}
            variant="profit"
            trend={{ value: 2.1, isPositive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart data={chartData.data} />
          <div className="bg-card rounded-lg shadow-card p-6">
            <h3 className="text-lg font-semibold mb-4">Transaksi Terbaru</h3>
            <div className="space-y-3">
              {recentTransactions.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : recentTransactions.data && recentTransactions.data.length > 0 ? (
                recentTransactions.data.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`font-semibold ${
                      transaction.type === "income" ? "text-success" : "text-error"
                    }`}>
                      {transaction.type === "income" ? "+" : ""}
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(Math.abs(transaction.amount))}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Belum ada transaksi</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;