'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { accountService } from '../../services/accountService';
import { transactionService } from '../../services/transactionService';
import { formatCurrency, formatDate } from '../../services/api';
import { Account, Transaction } from '../../types';
import { useNotification } from '../Notification';

export function DashboardScreen() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [account, setAccount] = useState<Account | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.memberNumber) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.memberNumber) return;

    try {
      setLoading(true);

      // Load account data
      try {
        const accountData = await accountService.getAccountByMemberNumber(user.memberNumber);
        setAccount(accountData);
      } catch (err) {
        console.log('No account found for user', err);
        setAccount(null);
      }

      // Load recent transactions
      try {
        const transactionsData = await transactionService.getTransactionsByMember(
          user.memberNumber,
          { limit: 5 }
        );
        setRecentTransactions(transactionsData.transactions || []);
      } catch (err) {
        console.log('Error loading transactions', err);
        setRecentTransactions([]);
      }
    } catch (error: any) {
      showNotification('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">📊</span>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-green-600 text-white rounded-xl p-6">
              <div className="text-sm font-medium opacity-90 uppercase tracking-wide mb-2">
                Total Savings
              </div>
              <div className="text-3xl font-bold mb-2">
                {account ? formatCurrency(account.savings) : formatCurrency(0)}
              </div>
              <div className="text-sm opacity-80">
                Status: {account?.accountStatus || 'No account'}
              </div>
            </div>

            <div className="card">
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
                Monthly Contribution
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {account ? formatCurrency(account.monthlyContribution) : formatCurrency(0)}
              </div>
              <div className="text-sm text-gray-600">
                {account?.lastTransactionDate 
                  ? `Last: ${formatDate(account.lastTransactionDate)}`
                  : 'No transactions yet'
                }
              </div>
            </div>
          </div>

          {/* Transactions Chart Placeholder */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction History Overview
            </h3>
            <div className="h-64 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <span className="text-2xl block mb-2">📈</span>
                <span className="text-sm">Chart visualization coming soon</span>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <button
                onClick={loadDashboardData}
                className="btn-secondary text-sm"
              >
                Refresh
              </button>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="py-3 px-4 text-sm capitalize">
                          {transaction.type.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`status-${transaction.status}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {transaction.description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No transactions found</p>
                <button className="btn-primary mt-4 text-sm">
                  Add First Transaction
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status Card */}
          <div className="card text-center">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-4">
              Account Status
            </h3>
            
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              AS
            </div>
            
            <div className="text-lg font-semibold text-gray-900 mb-2">
              {account?.accountStatus ? 
                account.accountStatus.charAt(0).toUpperCase() + account.accountStatus.slice(1) + ' Member' 
                : 'No Account'
              }
            </div>
            
            <div className="text-sm text-gray-600 italic mb-4">
              &#34;Member since {user?.dateJoined ? formatDate(user.dateJoined) : 'N/A'}&#34;
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <button className="btn-primary text-sm flex-1">
                  Quick Deposit
                </button>
                <button className="btn-secondary text-sm flex-1">
                  Statement
                </button>
              </div>
              <div className="text-xs text-gray-600">
                Member #: {user?.memberNumber}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {account && (
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Shares Owned:</span>
                  <span className="text-sm font-medium">{account.sharesOwned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Value:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(account.savings + (account.sharesOwned * 100))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Age:</span>
                  <span className="text-sm font-medium">
                    {account.accountOpenDate ? 
                      Math.floor((new Date().getTime() - new Date(account.accountOpenDate).getTime()) / (1000 * 60 * 60 * 24)) + ' days'
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}