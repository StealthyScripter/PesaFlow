// src/types/index.ts
export interface User {
  _id?: string;
  memberNumber: string;
  fname: string;
  lname: string;
  email?: string;
  phoneNumber: string;
  dateJoined?: string;
  emergencyContacts?: EmergencyContact[];
  isActive?: boolean;
  fullName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export interface Account {
  _id?: string;
  memberNumber: string;
  savings: number;
  monthlyContribution: number;
  sharesOwned: number;
  accountStatus: 'pending' | 'active' | 'suspended' | 'closed';
  lastTransactionDate?: string;
  accountOpenDate?: string;
  notes?: string;
  totalValue?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  _id?: string;
  transactionId: string;
  memberNumber: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'contribution' | 'share_purchase' | 'loan_payment' | 'dividend' | 'fee' | 'transfer';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
  accountBalance?: number;
  confirmedBy?: string;
  description?: string;
  reference?: string;
  category?: 'savings' | 'shares' | 'loan' | 'fee' | 'other';
  formattedAmount?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string | string[];
}

export interface PaginatedResponse<T> {
  data?: T[];
  page?: number;
  totalPages?: number;
  currentPage?: number;
  total?: number;
  totalUsers?: number;
  totalAccounts?: number;
  totalTransactions?: number;
  summary?: any;
}

export interface TransactionSummary {
  totalAmount: number;
  completedTransactions: number;
  pendingTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

export interface AccountSummary {
  totalSavings: number;
  totalShares: number;
  totalContributions: number;
  activeAccounts: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
}

export interface DashboardData {
  user: User;
  account: Account | null;
  recentTransactions: Transaction[];
  summary: any;
}