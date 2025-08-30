import { TrendingUp, TrendingDown, DollarSign, Users, Building2, Activity, Loader2, AlertCircle } from "lucide-react";
import SummaryCard from "@/components/dashboard/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";

interface SystemStats {
  totalUsers: number;
  totalCompanies: number;
  totalTransactions: number;
  totalRevenue: number;
  activeUsers: number;
  recentActivity: Array<{
    id: number;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
}

const SuperAdminDashboard = () => {
  const { data: systemStats, isLoading, isError, error } = useQuery<SystemStats>({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const response = await api.dashboard.getSystemStats();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat data sistem...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl text-destructive">Gagal Memuat Data Sistem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Terjadi kesalahan saat memuat data sistem. Silakan coba lagi.
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
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Dashboard Super Admin
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Overview sistem dan manajemen keseluruhan platform
        </p>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Pengguna"
          amount={systemStats?.totalUsers || 0}
          icon={Users}
          variant="info"
          trend={{ value: 12, isPositive: true }}
          isCount={true}
        />
        <SummaryCard
          title="Total Perusahaan"
          amount={systemStats?.totalCompanies || 0}
          icon={Building2}
          variant="info"
          trend={{ value: 3, isPositive: true }}
          isCount={true}
        />
        <SummaryCard
          title="Total Transaksi"
          amount={systemStats?.totalTransactions || 0}
          icon={Activity}
          variant="income"
          trend={{ value: 8.5, isPositive: true }}
          isCount={true}
        />
        <SummaryCard
          title="Total Revenue"
          amount={systemStats?.totalRevenue || 0}
          icon={DollarSign}
          variant="profit"
          trend={{ value: 15.2, isPositive: true }}
        />
      </div>

      {/* System Activity and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent System Activity */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Aktivitas Sistem Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStats?.recentActivity?.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">
                      oleh {activity.user} • {new Date(activity.timestamp).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">Tidak ada aktivitas terbaru</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Status Sistem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                <span className="font-medium">Database</span>
                <span className="text-success font-semibold">Online</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                <span className="font-medium">API Server</span>
                <span className="text-success font-semibold">Online</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                <span className="font-medium">Pengguna Aktif</span>
                <span className="text-success font-semibold">{systemStats?.activeUsers || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-warning/10 rounded-lg">
                <span className="font-medium">Storage Usage</span>
                <span className="text-warning font-semibold">75%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <Users className="h-6 w-6" />
              <span>Kelola Pengguna</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <Building2 className="h-6 w-6" />
              <span>Kelola Perusahaan</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <Activity className="h-6 w-6" />
              <span>Lihat Log Sistem</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;