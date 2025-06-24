import { apiCall } from './api';
import { User, PaginatedResponse } from '../types';

export interface CreateUserData {
  memberNumber: string;
  fname: string;
  lname: string;
  email?: string;
  phoneNumber: string;
  dateJoined?: string;
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
  }>;
}

export interface UpdateUserData {
  fname?: string;
  lname?: string;
  email?: string;
  phoneNumber?: string;
  dateJoined?: string;
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
  }>;
  isActive?: boolean;
}

export const userService = {
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: boolean;
  }): Promise<PaginatedResponse<User> & { users: User[] }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status !== undefined) searchParams.append('status', params.status.toString());
    
    const query = searchParams.toString();
    return apiCall<PaginatedResponse<User> & { users: User[] }>(
      `/api/users${query ? `?${query}` : ''}`
    );
  },

  async getUserByMemberNumber(memberNumber: string): Promise<User> {
    return apiCall<User>(`/api/users/${memberNumber.toUpperCase()}`);
  },

  async createUser(userData: CreateUserData): Promise<User> {
    return apiCall<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async updateUser(memberNumber: string, userData: UpdateUserData): Promise<User> {
    return apiCall<User>(`/api/users/${memberNumber.toUpperCase()}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  async deleteUser(memberNumber: string): Promise<{ message: string; user: User }> {
    return apiCall<{ message: string; user: User }>(
      `/api/users/${memberNumber.toUpperCase()}`,
      { method: 'DELETE' }
    );
  },

  async restoreUser(memberNumber: string): Promise<{ message: string; user: User }> {
    return apiCall<{ message: string; user: User }>(
      `/api/users/${memberNumber.toUpperCase()}/restore`,
      { method: 'PATCH' }
    );
  },
};