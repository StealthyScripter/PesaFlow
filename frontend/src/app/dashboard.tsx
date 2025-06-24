'use client';

import { useEffect, useState } from 'react';
import * as userService from '@/services/userService';
import * as accountService from '@/services/accountService';
import * as transactionService from '@/services/transactionService';
import { formatCurrency, formatDate, formatDateTime, downloadData } from '@/services/api';

interface DashboardData {
  totalSavings: number;
  growthPercentage: number;
  monthlyContribution: number;
  lastUpdated: string;
  nextUser: userService.User | null;
  recentTransactions: transactionService.Transaction[];
  accountSummary: accountService.AccountSummary | null;
}

export default function PesaFlowDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSavings: 0,
    growthPercentage: 0,
    monthlyContribution: 0,
    lastUpdated: '',
    nextUser: null,
    recentTransactions: [],
    accountSummary: null,
  });

  const [allTransactions, setAllTransactions] = useState<transactionService.Transaction[]>([]);
  const [transactionFilters, setTransactionFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    type: 'all',
    sortBy: 'date' as 'date' | 'amount' | 'type' | 'status',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  const loadDashboardData = async () => {
    console.log('🚀 Loading dashboard data...');
    setLoading(true);
    setError(null);

    try {
      // Load all required data in parallel
      const [
        accountsData,
        growthMetrics,
        contributionSummary,
        randomUser,
        recentTransactions,
      ] = await Promise.all([
        accountService.getAccounts(),
        accountService.calculateSavingsGrowth(1),
        accountService.getContributionSummary(),
        userService.getRandomUser(),
        transactionService.getRecentTransactions(5),
      ]);

      console.log('📊 Dashboard data loaded:', {
        accountsData,
        growthMetrics,
        contributionSummary,
        randomUser,
        recentTransactions,
      });

      setDashboardData({
        totalSavings: accountsData.summary.totalSavings,
        growthPercentage: growthMetrics.growthPercentage,
        monthlyContribution: contributionSummary.totalMonthlyContributions,
        lastUpdated: contributionSummary.lastUpdated,
        nextUser: randomUser,
        recentTransactions,
        accountSummary: accountsData.summary,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      console.error('❌ Dashboard loading error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load all transactions with filtering
  const loadAllTransactions = async () => {
    console.log('📋 Loading all transactions with filters:', transactionFilters);

    try {
      const params: transactionService.GetTransactionsParams = {
        limit: 1000,
        sortBy: transactionFilters.sortBy,
        sortOrder: transactionFilters.sortOrder,
      };

      // Add date filter for specific month
      if (transactionFilters.month && transactionFilters.year) {
        const startDate = new Date(transactionFilters.year, transactionFilters.month - 1, 1);
        const endDate = new Date(transactionFilters.year, transactionFilters.month, 0);
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
      }

      // Add type filter
      if (transactionFilters.type !== 'all') {
        params.type = transactionFilters.type;
      }

      const response = await transactionService.getTransactions(params);
      setAllTransactions(response.transactions);

      console.log('✅ All transactions loaded:', response.transactions.length, 'transactions');
    } catch (err) {
      console.error('❌ Error loading transactions:', err);
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

  // Add new transaction
  const addTransaction = async (transactionData: transactionService.CreateTransactionData) => {
    console.log('➕ Adding new transaction:', transactionData);

    try {
      const newTransaction = await transactionService.createTransaction(transactionData);
      console.log('✅ Transaction added successfully:', newTransaction);
      
      // Refresh data to show the new transaction
      await refreshData();
      
      return newTransaction;
    } catch (err) {
      console.error('❌ Error adding transaction:', err);
      throw err;
    }
  };

  // Download statement
  const downloadStatement = async (memberNumber: string, format: 'json' | 'csv' = 'json') => {
    console.log('📄 Downloading statement for:', memberNumber, 'format:', format);

    try {
      const statement = await accountService.downloadAccountStatement(memberNumber, format);
      downloadData(statement, `statement_${memberNumber}_${Date.now()}`, format);
      console.log('✅ Statement downloaded successfully');
    } catch (err) {
      console.error('❌ Error downloading statement:', err);
    }
  };

  // Export data
  const exportData = async (type: 'users' | 'accounts' | 'transactions', format: 'json' | 'csv' = 'json') => {
    console.log('📥 Exporting data:', type, 'format:', format);

    try {
      let data: string;
      let filename: string;

      switch (type) {
        case 'users':
          data = await userService.exportUserData(format);
          filename = `users_export_${Date.now()}`;
          break;
        case 'accounts':
          data = await accountService.exportAccountData(format);
          filename = `accounts_export_${Date.now()}`;
          break;
        case 'transactions':
          data = await transactionService.exportTransactionData(transactionFilters, format);
          filename = `transactions_export_${Date.now()}`;
          break;
        default:
          throw new Error('Invalid export type');
      }

      downloadData(data, filename, format);
      console.log('✅ Data exported successfully');
    } catch (err) {
      console.error('❌ Error exporting data:', err);
    }
  };

  // Quick transaction helpers
  const quickDeposit = async (memberNumber: string, amount: number) => {
    return addTransaction({
      memberNumber,
      type: 'deposit',
      amount,
      description: `Quick deposit - ${formatCurrency(amount)}`,
      status: 'completed',
    });
  };

  const quickWithdrawal = async (memberNumber: string, amount: number) => {
    return addTransaction({
      memberNumber,
      type: 'withdrawal',
      amount,
      description: `Quick withdrawal - ${formatCurrency(amount)}`,
      status: 'pending',
    });
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
            <div className={`text-sm ${dashboardData.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dashboardData.growthPercentage >= 0 ? '↗' : '↘'} {Math.abs(dashboardData.growthPercentage)}% this month
            </div>
          </div>

          {/* Monthly Contribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Monthly Contributions</h3>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(dashboardData.monthlyContribution)}
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {formatDate(dashboardData.lastUpdated)}
            </div>
          </div>

          {/* Active Accounts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Accounts</h3>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData.accountSummary?.activeAccounts || 0}
            </div>
            <div className="text-sm text-gray-500">
              Total Shares: {dashboardData.accountSummary?.totalShares || 0}
            </div>
          </div>

          {/* Next User */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Featured Member</h3>
            {dashboardData.nextUser ? (
              <div>
                <div className="font-semibold text-gray-900">
                  {dashboardData.nextUser.fname} {dashboardData.nextUser.lname}
                </div>
                <div className="text-sm text-gray-500">
                  {dashboardData.nextUser.memberNumber}
                </div>
                <div className="text-sm text-gray-500">
                  Joined: {formatDate(dashboardData.nextUser.dateJoined)}
                </div>
                <div className="text-sm text-gray-500">
                  {dashboardData.nextUser.phoneNumber}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No members found</div>
            )}
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
                      <div className="text-sm text-gray-600">{transaction.description}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={transactionFilters.sortBy}
                  onChange={(e) => setTransactionFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="border rounded-md px-3 py-2 w-full"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="type">Type</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select
                  value={transactionFilters.sortOrder}
                  onChange={(e) => setTransactionFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                  className="border rounded-md px-3 py-2 w-full"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.type}
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
              onClick={() => {
                if (dashboardData.nextUser) {
                  downloadStatement(dashboardData.nextUser.memberNumber, 'csv');
                }
              }}
              className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600"
              disabled={!dashboardData.nextUser}
            >
              📄 Download Statement
            </button>
          </div>
        </div>

        {/* Debug Console */}
        <div className="mt-8 bg-gray-900 text-green-400 p-4 rounded-lg">
          <div className="text-sm font-mono">
            <div>🚀 PesaFlow Dashboard Active</div>
            <div>📊 Total Savings: {formatCurrency(dashboardData.totalSavings)}</div>
            <div>📈 Growth: {dashboardData.growthPercentage}%</div>
            <div>💰 Monthly Contributions: {formatCurrency(dashboardData.monthlyContribution)}</div>
            <div>👥 Active Accounts: {dashboardData.accountSummary?.activeAccounts || 0}</div>
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