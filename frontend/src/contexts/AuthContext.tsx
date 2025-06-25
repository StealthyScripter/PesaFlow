'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState } from '../types';
import { authService } from '../services/authService';
import { tokenManager } from '../services/api';

interface AuthContextType extends AuthState {
  login: (memberNumber: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isAdmin: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (memberNumber: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({ memberNumber, password });
      
      const isAdmin = response.user.role === 'admin';
      
      setAuthState({
        isAuthenticated: true,
        user: response.user,
        isAdmin,
      });
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(userData);
      
      const isAdmin = response.user.role === 'admin';
      
      setAuthState({
        isAuthenticated: true,
        user: response.user,
        isAdmin,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isAdmin: false,
    });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.changePassword({ currentPassword, newPassword });
    } catch (err: any) {
      setError(err.message || 'Password change failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      setAuthState(prev => ({
        ...prev,
        user: response.user,
        isAdmin: response.user.role === 'admin',
      }));
    } catch (err) {
      // If refresh fails, user might need to re-login
      logout();
      console.log(err);
    }
  };

  // Check for stored auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          setLoading(true);
          const response = await authService.getCurrentUser();
          setAuthState({
            isAuthenticated: true,
            user: response.user,
            isAdmin: response.user.role === 'admin',
          });
        } catch (err) {
          // Token might be invalid, remove it
          tokenManager.removeToken();
          console.log(err);
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      logout,
      changePassword,
      refreshUser,
      loading,
      error,
    }}>
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