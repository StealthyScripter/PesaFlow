import { apiCall, tokenManager } from './api';
import { User } from '../types';

export interface LoginData {
  memberNumber: string;
  password: string;
}

export interface RegisterData {
  memberNumber: string;
  fname: string;
  lname: string;
  email?: string;
  phoneNumber: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authService = {
  async login(loginData: LoginData): Promise<AuthResponse> {
    const response = await apiCall<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
    
    // Store token
    tokenManager.setToken(response.token);
    
    return response;
  },

  async register(registerData: RegisterData): Promise<AuthResponse> {
    const response = await apiCall<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
    
    // Store token
    tokenManager.setToken(response.token);
    
    return response;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return apiCall<{ user: User }>('/api/auth/me');
  },

  async changePassword(passwordData: ChangePasswordData): Promise<{ message: string }> {
    return apiCall<{ message: string }>('/api/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(passwordData),
    });
  },

  async logout(): Promise<void> {
    try {
      await apiCall('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      tokenManager.removeToken();
    }
  },

  isAuthenticated(): boolean {
    const token = tokenManager.getToken();
    return token !== null && !tokenManager.isTokenExpired(token);
  },

  getUserRole(): string | null {
    const token = tokenManager.getToken();
    if (!token || tokenManager.isTokenExpired(token)) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch {
      return null;
    }
  }
};