import { apiCall } from './api';
import { Transaction, PaginatedResponse, TransactionSummary } from '../types';

export interface CreateTransactionData {
  transactionId?: string;
  memberNumber: string;
  date?: string;
  type: 'deposit' | 'withdrawal' | 'contribution' | 'share_purchase' | 'loan_payment' | 'dividend' | 'fee' | 'transfer';
  amount: number;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
  accountBalance?: number;
  confirmedBy?: string;
  description?: string;
  reference?: string;
  category?: 'savings' | 'shares' | 'loan' | 'fee' | 'other';
}

export interface UpdateTransactionData {
  memberNumber?: string;
  date?: string;
  type?: 'deposit' | 'withdrawal' | 'contribution' | 'share_purchase' | 'loan_payment' | 'dividend' | 'fee' | 'transfer';
  amount?: number;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
  accountBalance?: number;
  confirmedBy?: string;
  description?: string;
  reference?: string;
  category?: 'savings' | 'shares' | 'loan' | 'fee' | 'other';
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  memberNumber?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export const transactionService = {
  async getAllTransactions(
    filters?: TransactionFilters
  ): Promise<PaginatedResponse<Transaction> & { transactions: Transaction[]; summary: TransactionSummary }> {
    const searchParams = new URLSearchParams();
    
    if (filters?.page) searchParams.append('page', filters.page.toString());
    if (filters?.limit) searchParams.append('limit', filters.limit.toString());
    if (filters?.memberNumber) searchParams.append('memberNumber', filters.memberNumber);
    if (filters?.status) searchParams.append('status', filters.status);
    if (filters?.type) searchParams.append('type', filters.type);
    if (filters?.startDate) searchParams.append('startDate', filters.startDate);
    if (filters?.endDate) searchParams.append('endDate', filters.endDate);
    if (filters?.minAmount) searchParams.append('minAmount', filters.minAmount.toString());
    if (filters?.maxAmount) searchParams.append('maxAmount', filters.maxAmount.toString());
    
    const query = searchParams.toString();
    return apiCall<PaginatedResponse<Transaction> & { transactions: Transaction[]; summary: TransactionSummary }>(
      `/api/transactions${query ? `?${query}` : ''}`
    );
  },

  async getTransactionById(transactionId: string): Promise<Transaction> {
    return apiCall<Transaction>(`/api/transactions/${transactionId.toUpperCase()}`);
  },

  async createTransaction(transactionData: CreateTransactionData): Promise<Transaction> {
    return apiCall<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },

  async updateTransaction(
    transactionId: string, 
    transactionData: UpdateTransactionData
  ): Promise<Transaction> {
    return apiCall<Transaction>(`/api/transactions/${transactionId.toUpperCase()}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  },

  async deleteTransaction(transactionId: string): Promise<{ message: string; transaction: Transaction }> {
    return apiCall<{ message: string; transaction: Transaction }>(
      `/api/transactions/${transactionId.toUpperCase()}`,
      { method: 'DELETE' }
    );
  },

  async completeTransaction(
    transactionId: string, 
    confirmedBy: string
  ): Promise<{ message: string; transaction: Transaction; newAccountBalance: number }> {
    return apiCall<{ message: string; transaction: Transaction; newAccountBalance: number }>(
      `/api/transactions/${transactionId.toUpperCase()}/complete`,
      {
        method: 'PATCH',
        body: JSON.stringify({ confirmedBy }),
      }
    );
  },

  async getTransactionsByMember(
    memberNumber: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      type?: string;
    }
  ): Promise<PaginatedResponse<Transaction> & { transactions: Transaction[] }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    
    const query = searchParams.toString();
    return apiCall<PaginatedResponse<Transaction> & { transactions: Transaction[] }>(
      `/api/transactions/member/${memberNumber.toUpperCase()}${query ? `?${query}` : ''}`
    );
  },
};