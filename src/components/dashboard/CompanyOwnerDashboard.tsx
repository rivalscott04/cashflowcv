import { TrendingUp, TrendingDown, DollarSign, PieChart, Loader2, Plus, BarChart3, FileText, AlertCircle, Building2 } from "lucide-react";
import SummaryCard from "@/components/dashboard/SummaryCard";
import RevenueChart from "@/components/charts/RevenueChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboard";
import { useAuth } from "@/contexts/AuthContext";

const CompanyOwnerDashboard = () => {
  const { user } = useAuth();
  const { summary, recentTransactions, chartData, isLoading, isError, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat data dashboard perusahaan...</p>
        </div>
      </div>
    );
  }

  // Check if there's no data (empty state)
  const hasNoData = !isLoading && !isError && 
    (!summary.data || (summary.data.totalIncome === 0 && summary.data.totalExpense === 0)) &&
    (!recentTransactions.data || recentTransactions.data.length === 0);

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl text-destructive">Gagal Memuat Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Terjadi kesalahan saat memuat data dashboard. Silakan coba lagi.
            </p>
            <p className="text-sm text-muted-foreground">{error?.message}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Muat Ulang
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Building2 className="h-12 w-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Dashboard Perusahaan
          </h1>
        </div>
        <p className="text-xl text-muted-foreground mb-4">
          Selamat datang, {user?.full_name || user?.username}
        </p>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Kelola keuangan perusahaan Anda dengan mudah dan profesional
        </p>
      </div>

      {/* Company Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hasNoData ? (
          <>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Grafik Pendapatan Perusahaan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 p-3 bg-muted/50 rounded-full">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Belum Ada Data Grafik</h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    Grafik akan muncul setelah Anda menambahkan transaksi perusahaan pertama
                  </p>
                  <Link to="/transactions/new">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Transaksi
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transaksi Perusahaan Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 p-3 bg-muted/50 rounded-full">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Belum Ada Transaksi</h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    Mulai kelola keuangan perusahaan Anda dengan menambahkan transaksi pertama
                  </p>
                  <Link to="/transactions/new">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Transaksi
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <RevenueChart data={chartData.data} />
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Transaksi Perusahaan Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
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
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="mb-4 p-3 bg-muted/50 rounded-full">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-4">Belum ada transaksi perusahaan</p>
                      <Link to="/transactions/new">
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Transaksi
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Company Management Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Manajemen Perusahaan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/transactions">
              <Button className="h-20 w-full flex flex-col gap-2" variant="outline">
                <FileText className="h-6 w-6" />
                <span>Kelola Transaksi</span>
              </Button>
            </Link>
            <Link to="/reports">
              <Button className="h-20 w-full flex flex-col gap-2" variant="outline">
                <BarChart3 className="h-6 w-6" />
                <span>Laporan Keuangan</span>
              </Button>
            </Link>
            <Link to="/settings">
              <Button className="h-20 w-full flex flex-col gap-2" variant="outline">
                <Building2 className="h-6 w-6" />
                <span>Pengaturan Perusahaan</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Empty State Call to Action */}
      {hasNoData && (
        <Card className="shadow-card">
          <CardContent className="py-12">
            <div className="text-center max-w-2xl mx-auto">
              <div className="mb-6 p-4 bg-primary/10 rounded-full w-fit mx-auto">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Selamat Datang di Dashboard Perusahaan!</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Mulai kelola keuangan perusahaan Anda dengan menambahkan transaksi pertama. 
                Dashboard akan menampilkan ringkasan, grafik, dan analisis keuangan perusahaan secara otomatis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/transactions/new">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Plus className="h-5 w-5 mr-2" />
                    Tambah Transaksi Pertama
                  </Button>
                </Link>
                <Link to="/transactions">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <FileText className="h-5 w-5 mr-2" />
                    Lihat Semua Transaksi
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompanyOwnerDashboard;