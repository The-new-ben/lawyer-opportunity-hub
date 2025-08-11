import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/apiClient';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'judge' | 'lawyer' | 'plaintiff';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if user data exists in localStorage
      const storedUser = localStorage.getItem('hypercourt_user');
      const accessToken = localStorage.getItem('hypercourt_access_token');

      if (storedUser && accessToken) {
        setUser(JSON.parse(storedUser));
        
        // Verify token is still valid by fetching profile
        const response = await apiClient.getProfile();
        if (response.data) {
          setUser(response.data.user);
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('hypercourt_user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.login({ email, password });

      if (response.data) {
        setUser(response.data.user!);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || 'שגיאה בהתחברות' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'שגיאה בחיבור לשרת' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(userData);

      if (response.data) {
        setUser(response.data.user!);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || 'שגיאה ברישום' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'שגיאה בחיבור לשרת' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await apiClient.getProfile();
      if (response.data) {
        setUser(response.data.user);
        localStorage.setItem('hypercourt_user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;