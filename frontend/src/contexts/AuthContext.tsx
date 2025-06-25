'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState } from '../types';
import { userService } from '../services/userService';

interface AuthContextType extends AuthState {
  login: (memberNumber: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
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

  const login = async (memberNumber: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await userService.getUserByMemberNumber(memberNumber);
      
      // Simple admin check (you can modify this logic)
      const isAdmin = memberNumber.includes('ADMIN') || memberNumber === 'MEM001';
      
      setAuthState({
        isAuthenticated: true,
        user,
        isAdmin,
      });
      
      // Store in localStorage for persistence
      localStorage.setItem('authUser', JSON.stringify({ user, isAdmin }));
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      isAdmin: false,
    });
    localStorage.removeItem('authUser');
  };

  // Check for stored auth on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('authUser');
    if (storedAuth) {
      try {
        const { user, isAdmin } = JSON.parse(storedAuth);
        setAuthState({
          isAuthenticated: true,
          user,
          isAdmin,
        });
      } catch (err) {
        localStorage.removeItem('authUser');
        throw err;
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
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