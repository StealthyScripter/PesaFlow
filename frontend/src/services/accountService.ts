import { apiCall } from './api';
import { Account, User, PaginatedResponse, AccountSummary } from '../types';

export interface CreateAccountData {
  memberNumber: string;
  savings?: number;
  monthlyContribution?: number;
  sharesOwned?: number;
  accountStatus?: 'pending' | 'active' | 'suspended' | 'closed';
  notes?: string;
}

export interface UpdateAccountData {
  savings?: number;
  monthlyContribution?: number;
  sharesOwned?: number;
  accountStatus?: 'pending' | 'active' | 'suspended' | 'closed';
  notes?: string;
}

export interface UpdateBalanceData {
  amount: number;
  type: 'credit' | 'debit';
  description?: string;
}

export interface AccountSummaryResponse {
  account: Account;
  user: User;
  totalValue: number;
  accountAge: number;
  lastActivity: string;
}

export const accountService = {
  async getAllAccounts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Account> & { accounts: Account[]; summary: AccountSummary }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    
    const query = searchParams.toString();
    return apiCall<PaginatedResponse<Account> & { accounts: Account[]; summary: AccountSummary }>(
      `/api/accounts${query ? `?${query}` : ''}`
    );
  },

  async getAccountByMemberNumber(memberNumber: string): Promise<Account> {
    return apiCall<Account>(`/api/accounts/${memberNumber.toUpperCase()}`);
  },

  async createAccount(accountData: CreateAccountData): Promise<Account> {
    return apiCall<Account>('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  },

  async updateAccount(memberNumber: string, accountData: UpdateAccountData): Promise<Account> {
    return apiCall<Account>(`/api/accounts/${memberNumber.toUpperCase()}`, {
      method: 'PUT',
      body: JSON.stringify(accountData),
    });
  },

  async deleteAccount(memberNumber: string): Promise<{ message: string; account: Account }> {
    return apiCall<{ message: string; account: Account }>(
      `/api/accounts/${memberNumber.toUpperCase()}`,
      { method: 'DELETE' }
    );
  },

  async updateBalance(
    memberNumber: string, 
    balanceData: UpdateBalanceData
  ): Promise<{ message: string; account: Account; newBalance: number }> {
    return apiCall<{ message: string; account: Account; newBalance: number }>(
      `/api/accounts/${memberNumber.toUpperCase()}/balance`,
      {
        method: 'PATCH',
        body: JSON.stringify(balanceData),
      }
    );
  },

  async getAccountSummary(memberNumber: string): Promise<AccountSummaryResponse> {
    return apiCall<AccountSummaryResponse>(`/api/accounts/${memberNumber.toUpperCase()}/summary`);
  },
};