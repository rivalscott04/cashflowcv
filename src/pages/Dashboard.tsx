import Navbar from "@/components/layout/Navbar";
import SuperAdminDashboard from "@/components/dashboard/SuperAdminDashboard";
import CompanyOwnerDashboard from "@/components/dashboard/CompanyOwnerDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Memuat dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboardContent = () => {
    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Silakan login untuk mengakses dashboard.</p>
        </div>
      );
    }

    switch (user.role) {
      case 'superadmin':
        return <SuperAdminDashboard />;
      case 'company_owner':
      case 'admin':
      case 'user':
      default:
        return <CompanyOwnerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default Dashboard;