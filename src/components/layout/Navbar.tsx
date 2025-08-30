import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Calculator, FileText, Settings, PlusCircle, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-card border-b border-border shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Sasambo Solusi Digital</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-2 hover:scale-105 hover:bg-primary/10 transition-all duration-200 group"
              >
                <BarChart3 className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <Link to="/transactions">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-2 hover:scale-105 hover:bg-primary/10 transition-all duration-200 group"
              >
                <Calculator className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                <span>Transaksi</span>
              </Button>
            </Link>
            <Link to="/reports">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-2 hover:scale-105 hover:bg-primary/10 transition-all duration-200 group"
              >
                <FileText className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                <span>Laporan</span>
              </Button>
            </Link>
            <Link to="/settings">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-2 hover:scale-105 hover:bg-primary/10 transition-all duration-200 group"
              >
                <Settings className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                <span>Pengaturan</span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/transactions/new" className="hidden sm:block">
              <Button className="flex items-center space-x-2 hover:scale-105 active:scale-95 transition-all duration-200 bg-gradient-primary shadow-lg hover:shadow-primary/25 group">
                <PlusCircle className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                <span>Tambah Transaksi</span>
              </Button>
            </Link>
            
            {/* User info and logout */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user?.full_name || 'User'}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border">
              <Link to="/" onClick={closeMobileMenu}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start flex items-center space-x-2 hover:bg-primary/10 transition-all duration-200"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Link to="/transactions" onClick={closeMobileMenu}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start flex items-center space-x-2 hover:bg-primary/10 transition-all duration-200"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Transaksi</span>
                </Button>
              </Link>
              <Link to="/reports" onClick={closeMobileMenu}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start flex items-center space-x-2 hover:bg-primary/10 transition-all duration-200"
                >
                  <FileText className="h-4 w-4" />
                  <span>Laporan</span>
                </Button>
              </Link>
              <Link to="/settings" onClick={closeMobileMenu}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start flex items-center space-x-2 hover:bg-primary/10 transition-all duration-200"
                >
                  <Settings className="h-4 w-4" />
                  <span>Pengaturan</span>
                </Button>
              </Link>
              <Link to="/transactions/new" onClick={closeMobileMenu}>
                <Button className="w-full justify-start flex items-center space-x-2 bg-gradient-primary shadow-lg hover:shadow-primary/25 mt-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Tambah Transaksi</span>
                </Button>
              </Link>
              
              {/* Mobile user info and logout */}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{user?.full_name || 'User'}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="w-full justify-start flex items-center space-x-2 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;