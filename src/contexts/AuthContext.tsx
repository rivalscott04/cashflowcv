import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  last_login: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  const isAuthenticated = !!user;

  // Check if current page is login or landing page
  const isPublicPage = () => {
    const path = window.location.pathname;
    return path === '/login' || path === '/';
  };

  // Check if user is authenticated on app load
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        // Only show modal if not on public pages
        if (!isPublicPage()) {
          setShowSessionExpiredModal(true);
        }
        return;
      }

      // Verify token with backend
      const response = await api.auth.verifyToken();
      
      if (response.success && response.data.user) {
        setUser(response.data.user);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // Only show modal if not on public pages
        if (!isPublicPage()) {
          setShowSessionExpiredModal(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token is invalid, remove it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      // Only show modal if not on public pages
      if (!isPublicPage()) {
        setShowSessionExpiredModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await api.auth.login(credentials);
      
      if (response.success && response.data.user) {
        setUser(response.data.user);
        setShowSessionExpiredModal(false);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const handleGoToLogin = () => {
    setShowSessionExpiredModal(false);
    window.location.href = '/login';
  };

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Session Expired Modal */}
      <Dialog open={showSessionExpiredModal} onOpenChange={setShowSessionExpiredModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Sesi Berakhir</DialogTitle>
            <DialogDescription>
              Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleGoToLogin} className="w-full">
              Login Kembali
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
};

export default AuthContext;