'use client';

import React, { useState, useEffect } from 'react';
import { accountService } from '../../services/accountService';
import { transactionService } from '../../services/transactionService';
import { userService } from '../../services/userService';
import { formatCurrency } from '../../services/api';
import { useNotification } from '../Notification';

interface AdminStats {
  totalMembers: number;
  totalSavings: number;
  pendingTransactions: number;
  activeAccounts: number;
}

export function AdminScreen() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalMembers: 0,
    totalSavings: 0,
    pendingTransactions: 0,
    activeAccounts: 0,
  });
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Load basic stats
      const [usersData, accountsData, transactionsData] = await Promise.all([
        userService.getAllUsers({ limit: 1 }),
        accountService.getAllAccounts({ limit: 1 }),
        transactionService.getAllTransactions({ status: 'pending', limit: 10 }),
      ]);

      setStats({
        totalMembers: usersData.totalUsers || 0,
        totalSavings: accountsData.summary?.totalSavings || 0,
        pendingTransactions: transactionsData.summary?.pendingTransactions || 0,
        activeAccounts: accountsData.summary?.activeAccounts || 0,
      });

      setPendingTransactions(transactionsData.transactions || []);
    } catch (error: any) {
      showNotification('Failed to load admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const approveTransaction = async (transactionId: string) => {
    try {
      await transactionService.completeTransaction(transactionId, 'admin');
      showNotification('Transaction approved successfully!', 'success');
      loadAdminData(); // Refresh data
    } catch (error: any) {
      showNotification(error.message || 'Failed to approve transaction', 'error');
    }
  };

  const rejectTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to reject this transaction?')) return;

    try {
      await transactionService.updateTransaction(transactionId, { status: 'failed' });
      showNotification('Transaction rejected', 'success');
      loadAdminData(); // Refresh data
    } catch (error: any) {
      showNotification(error.message || 'Failed to reject transaction', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading admin data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚙️</span>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-green-600 text-white rounded-xl p-6 text-center">
          <div className="text-3xl font-bold mb-2">{stats.totalMembers}</div>
          <div className="text-sm font-medium opacity-90">Total Members</div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-blue-600 text-white rounded-xl p-6 text-center">
          <div className="text-3xl font-bold mb-2">{formatCurrency(stats.totalSavings)}</div>
          <div className="text-sm font-medium opacity-90">Total Savings</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-orange-600 text-white rounded-xl p-6 text-center">
          <div className="text-3xl font-bold mb-2">{stats.pendingTransactions}</div>
          <div className="text-sm font-medium opacity-90">Pending Transactions</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl p-6 text-center">
          <div className="text-3xl font-bold mb-2">{stats.activeAccounts}</div>
          <div className="text-sm font-medium opacity-90">Active Accounts</div>
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Pending Transactions</h3>
          <button onClick={loadAdminData} className="btn-primary text-sm">
            Refresh
          </button>
        </div>

        {pendingTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Member</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTransactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium">
                      {transaction.memberNumber}
                    </td>
                    <td className="py-3 px-4 text-sm capitalize">
                      {transaction.type.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.description || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveTransaction(transaction.transactionId)}
                          className="btn-success text-xs px-3 py-1"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectTransaction(transaction.transactionId)}
                          className="btn-danger text-xs px-3 py-1"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl block mb-4">✅</span>
            <p>No pending transactions</p>
          </div>
        )}
      </div>

      {/* Admin Tools */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-secondary p-4 text-left">
            <div className="font-medium">Manage Users</div>
            <div className="text-sm text-gray-600">Add, edit, or deactivate users</div>
          </button>
          <button className="btn-secondary p-4 text-left">
            <div className="font-medium">Generate Reports</div>
            <div className="text-sm text-gray-600">Create financial reports</div>
          </button>
          <button className="btn-secondary p-4 text-left">
            <div className="font-medium">System Settings</div>
            <div className="text-sm text-gray-600">Configure system parameters</div>
          </button>
        </div>
      </div>
    </div>
  );
}