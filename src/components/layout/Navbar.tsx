import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BarChart3, Calculator, FileText, Settings, PlusCircle, Menu, X, LogOut, User, Users, ChevronDown } from "lucide-react";
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
              {user?.role !== 'superadmin' && (
                <span className="text-xl font-bold text-foreground">Sasambo Solusi Digital</span>
              )}
              {user?.role === 'superadmin' && (
                <span className="text-xl font-bold text-foreground">Cash Tracker</span>
              )}
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/dashboard">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-2 hover:scale-105 hover:bg-primary/10 transition-all duration-200 group cursor-pointer"
              >
                <BarChart3 className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <Link to="/transactions">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-2 hover:scale-105 hover:bg-primary/10 transition-all duration-200 group cursor-pointer"
              >
                <Calculator className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                <span>Transaksi</span>
              </Button>
            </Link>
            <Link to="/reports">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-2 hover:scale-105 hover:bg-primary/10 transition-all duration-200 group cursor-pointer"
              >
                <FileText className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                <span>Laporan</span>
              </Button>
            </Link>
            <Link to="/settings">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-2 hover:scale-105 hover:bg-primary/10 transition-all duration-200 group cursor-pointer"
              >
                <Settings className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                <span>Pengaturan</span>
              </Button>
            </Link>
            {user?.role === 'superadmin' && (
              <Link to="/users">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center space-x-2 hover:scale-105 hover:bg-primary/10 transition-all duration-200 group cursor-pointer"
                >
                  <Users className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                  <span>User Management</span>
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            
            {/* User dropdown */}
            <div className="hidden md:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-accent cursor-pointer">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user?.full_name || 'User'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.full_name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'No email'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        Role: {user?.role || 'Unknown'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden cursor-pointer"
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
              <Link to="/dashboard" onClick={closeMobileMenu}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start flex items-center space-x-2 hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Link to="/transactions" onClick={closeMobileMenu}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start flex items-center space-x-2 hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Transaksi</span>
                </Button>
              </Link>
              <Link to="/reports" onClick={closeMobileMenu}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start flex items-center space-x-2 hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  <span>Laporan</span>
                </Button>
              </Link>
              <Link to="/settings" onClick={closeMobileMenu}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start flex items-center space-x-2 hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  <span>Pengaturan</span>
                </Button>
              </Link>
              {user?.role === 'superadmin' && (
                <Link to="/users" onClick={closeMobileMenu}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start flex items-center space-x-2 hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                  >
                    <Users className="h-4 w-4" />
                    <span>User Management</span>
                  </Button>
                </Link>
              )}

              
              {/* Mobile user info and logout */}
              <div className="border-t border-border pt-2 mt-2">
                <div className="px-3 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || 'No email'}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      Role: {user?.role || 'Unknown'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="w-full justify-start flex items-center space-x-2 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 cursor-pointer"
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