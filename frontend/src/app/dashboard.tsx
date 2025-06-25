'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import { accountService } from '@/services/accountService';
import { transactionService } from '@/services/transactionService';
import { formatCurrency, formatDate, formatDateTime, downloadData } from '@/services/api';
import { Transaction, AccountSummary } from '@/types';

interface DashboardData {
  totalSavings: number;
  totalAccounts: number;
  totalUsers: number;
  pendingTransactions: number;
  recentTransactions: Transaction[];
  accountSummary: AccountSummary | null;
}

export default function PesaFlowDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSavings: 0,
    totalAccounts: 0,
    totalUsers: 0,
    pendingTransactions: 0,
    recentTransactions: [],
    accountSummary: null,
  });

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [transactionFilters, setTransactionFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    type: 'all',
    status: 'all',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data using existing services
  const loadDashboardData = async () => {
    console.log('🚀 Loading dashboard data...');
    setLoading(true);
    setError(null);

    try {
      // Load all required data in parallel using existing service methods
      const [accountsData, usersData, transactionsData] = await Promise.all([
        accountService.getAllAccounts({ limit: 1 }), // Just get summary
        userService.getAllUsers({ limit: 1 }), // Just get count
        transactionService.getAllTransactions({ limit: 10 }), // Get recent transactions
      ]);

      console.log('📊 Dashboard data loaded:', {
        accountsData,
        usersData,
        transactionsData,
      });

      setDashboardData({
        totalSavings: accountsData.summary?.totalSavings || 0,
        totalAccounts: accountsData.totalAccounts || 0,
        totalUsers: usersData.totalUsers || 0,
        pendingTransactions: transactionsData.summary?.pendingTransactions || 0,
        recentTransactions: transactionsData.transactions || [],
        accountSummary: accountsData.summary || null,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      console.error('❌ Dashboard loading error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load all transactions with filtering using existing services
  const loadAllTransactions = async () => {
    console.log('📋 Loading all transactions with filters:', transactionFilters);

    try {
      // Build filters for existing API
      const filters: any = {
        limit: 1000,
      };

      // Add type filter if not 'all'
      if (transactionFilters.type !== 'all') {
        filters.type = transactionFilters.type;
      }

      // Add status filter if not 'all'
      if (transactionFilters.status !== 'all') {
        filters.status = transactionFilters.status;
      }

      // Add date range for the selected month/year
      if (transactionFilters.month && transactionFilters.year) {
        const startDate = new Date(transactionFilters.year, transactionFilters.month - 1, 1);
        const endDate = new Date(transactionFilters.year, transactionFilters.month, 0);
        filters.startDate = startDate.toISOString().split('T')[0];
        filters.endDate = endDate.toISOString().split('T')[0];
      }

      const response = await transactionService.getAllTransactions(filters);
      setAllTransactions(response.transactions || []);

      console.log('✅ All transactions loaded:', response.transactions?.length || 0, 'transactions');
    } catch (err) {
      console.error('❌ Error loading transactions:', err);
      setAllTransactions([]);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    console.log('🔄 Refreshing all dashboard data...');
    await Promise.all([
      loadDashboardData(),
      loadAllTransactions(),
    ]);
  };

  // Export data function (simplified)
  const exportData = async (type: 'users' | 'accounts' | 'transactions', format: 'json' | 'csv' = 'json') => {
    console.log('📥 Exporting data:', type, 'format:', format);

    try {
      let data: any;
      let filename: string;

      switch (type) {
        case 'users':
          const usersResponse = await userService.getAllUsers({ limit: 1000 });
          data = usersResponse.users || [];
          filename = `users_export_${Date.now()}`;
          break;
        case 'accounts':
          const accountsResponse = await accountService.getAllAccounts({ limit: 1000 });
          data = accountsResponse.accounts || [];
          filename = `accounts_export_${Date.now()}`;
          break;
        case 'transactions':
          data = allTransactions;
          filename = `transactions_export_${Date.now()}`;
          break;
        default:
          throw new Error('Invalid export type');
      }

      // Convert to string format
      let exportString: string;
      if (format === 'json') {
        exportString = JSON.stringify(data, null, 2);
      } else {
        // Simple CSV conversion
        if (data.length > 0) {
          const headers = Object.keys(data[0]).join(',');
          const rows = data.map((item: any) => 
            Object.values(item).map(val => 
              typeof val === 'string' ? `"${val}"` : val
            ).join(',')
          );
          exportString = [headers, ...rows].join('\n');
        } else {
          exportString = 'No data available';
        }
      }

      downloadData(exportString, filename, format);
      console.log('✅ Data exported successfully');
    } catch (err) {
      console.error('❌ Error exporting data:', err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load transactions when filters change
  useEffect(() => {
    loadAllTransactions();
  }, [transactionFilters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PesaFlow Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PesaFlow Dashboard</h1>
          <p className="text-gray-600">Financial Management System</p>
          <button
            onClick={refreshData}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Savings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Savings</h3>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(dashboardData.totalSavings)}
            </div>
            <div className="text-sm text-gray-500">
              Across all accounts
            </div>
          </div>

          {/* Total Accounts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Accounts</h3>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData.totalAccounts}
            </div>
            <div className="text-sm text-gray-500">
              Active: {dashboardData.accountSummary?.activeAccounts || 0}
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData.totalUsers}
            </div>
            <div className="text-sm text-gray-500">
              Registered members
            </div>
          </div>

          {/* Pending Transactions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pending</h3>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData.pendingTransactions}
            </div>
            <div className="text-sm text-gray-500">
              Awaiting approval
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              <button
                onClick={() => loadDashboardData()}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{transaction.type.toUpperCase()}</div>
                      <div className="text-sm text-gray-500">
                        {transaction.memberNumber} • {formatDateTime(transaction.date)}
                      </div>
                      <div className="text-sm text-gray-600">{transaction.description || 'No description'}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        ['deposit', 'contribution'].includes(transaction.type) ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {['deposit', 'contribution'].includes(transaction.type) ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className={`text-sm px-2 py-1 rounded ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent transactions found</p>
            )}
          </div>
        </div>

        {/* All Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">All Transactions</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => exportData('transactions', 'csv')}
                  className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                >
                  📄 Export CSV
                </button>
                <button
                  onClick={() => exportData('transactions', 'json')}
                  className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                >
                  📊 Export JSON
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={transactionFilters.month}
                  onChange={(e) => setTransactionFilters(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                  className="border rounded-md px-3 py-2 w-full"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={transactionFilters.year}
                  onChange={(e) => setTransactionFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="border rounded-md px-3 py-2 w-full"
                >
                  {[2023, 2024, 2025].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={transactionFilters.type}
                  onChange={(e) => setTransactionFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="border rounded-md px-3 py-2 w-full"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="contribution">Contribution</option>
                  <option value="share_purchase">Share Purchase</option>
                  <option value="loan_payment">Loan Payment</option>
                  <option value="dividend">Dividend</option>
                  <option value="fee">Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={transactionFilters.status}
                  onChange={(e) => setTransactionFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="border rounded-md px-3 py-2 w-full"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {allTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.memberNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {transaction.type.replace('_', ' ')}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          ['deposit', 'contribution'].includes(transaction.type) ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {['deposit', 'contribution'].includes(transaction.type) ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transaction.description || 'No description'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No transactions found for the selected filters</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => exportData('users', 'csv')}
              className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600"
            >
              📊 Export Users
            </button>
            <button
              onClick={() => exportData('accounts', 'csv')}
              className="bg-indigo-500 text-white p-4 rounded-lg hover:bg-indigo-600"
            >
              💰 Export Accounts
            </button>
            <button
              onClick={() => exportData('transactions', 'csv')}
              className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600"
            >
              📄 Export Transactions
            </button>
          </div>
        </div>

        {/* Debug Console */}
        <div className="mt-8 bg-gray-900 text-green-400 p-4 rounded-lg">
          <div className="text-sm font-mono">
            <div>🚀 PesaFlow Dashboard Active</div>
            <div>📊 Total Savings: {formatCurrency(dashboardData.totalSavings)}</div>
            <div>👥 Total Users: {dashboardData.totalUsers}</div>
            <div>💰 Total Accounts: {dashboardData.totalAccounts}</div>
            <div>⏳ Pending Transactions: {dashboardData.pendingTransactions}</div>
            <div>📋 Recent Transactions: {dashboardData.recentTransactions.length}</div>
            <div>📄 All Transactions: {allTransactions.length}</div>
            <div className="mt-2 text-yellow-400">
              💡 Check the browser console for detailed API logs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}