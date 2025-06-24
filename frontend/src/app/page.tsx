'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { accountService } from '@/services/accountService';
import { transactionService } from '@/services/transactionService';
import { Account, Transaction } from '@/types';

interface DashboardStats {
  totalMembers: number;
  totalSavings: number;
  totalTransactions: number;
  pendingTransactions: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    totalSavings: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        
        // Load accounts and transactions data
        const [accountsData, transactionsData] = await Promise.all([
          accountService.getAccounts({ limit: 1 }),
          transactionService.getTransactions({ limit: 5 }),
        ]);

        setStats({
          totalMembers: accountsData.totalAccounts,
          totalSavings: accountsData.summary.totalSavings,
          totalTransactions: transactionsData.totalTransactions,
          pendingTransactions: transactionsData.summary.pendingTransactions,
        });

        setRecentTransactions(transactionsData.transactions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="container py-8">
          <div className="flex justify-center items-center py-12">
            <div className="spinner"></div>
            <span style={{ marginLeft: '1rem' }} className="text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navigation />
        <div className="container py-8">
          <div className="bg-red-50 border-red-200 rounded-lg p-4" style={{ border: '1px solid' }}>
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">📊 Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div style={{ 
                padding: '0.5rem', 
                backgroundColor: '#dbeafe', 
                borderRadius: '0.5rem',
                marginRight: '1rem'
              }}>
                <span className="text-blue-800" style={{ fontSize: '1.25rem' }}>👥</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div style={{ 
                padding: '0.5rem', 
                backgroundColor: '#dcfce7', 
                borderRadius: '0.5rem',
                marginRight: '1rem'
              }}>
                <span className="text-green-800" style={{ fontSize: '1.25rem' }}>💰</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSavings)}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div style={{ 
                padding: '0.5rem', 
                backgroundColor: '#e0e7ff', 
                borderRadius: '0.5rem',
                marginRight: '1rem'
              }}>
                <span className="text-blue-800" style={{ fontSize: '1.25rem' }}>💳</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div style={{ 
                padding: '0.5rem', 
                backgroundColor: '#fef3c7', 
                borderRadius: '0.5rem',
                marginRight: '1rem'
              }}>
                <span className="text-yellow-800" style={{ fontSize: '1.25rem' }}>⏳</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTransactions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions found</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Member</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.transactionId}>
                      <td>{formatDate(transaction.date)}</td>
                      <td>{transaction.memberNumber}</td>
                      <td className="capitalize">
                        {transaction.type.replace('_', ' ')}
                      </td>
                      <td>{formatCurrency(transaction.amount)}</td>
                      <td>
                        <span className={`status status-${transaction.status}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}