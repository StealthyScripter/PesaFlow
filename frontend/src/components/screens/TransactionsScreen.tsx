'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { transactionService } from '../../services/transactionService';
import { formatCurrency, formatDate } from '../../services/api';
import { Transaction } from '../../types';
import { useNotification } from '../Notification';

export function TransactionsScreen() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    page: 1,
    limit: 20,
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user?.memberNumber) {
      loadTransactions();
    }
  }, [user, filters]);

  const loadTransactions = async () => {
    if (!user?.memberNumber) return;

    try {
      setLoading(true);
      const response = await transactionService.getTransactionsByMember(
        user.memberNumber,
        {
          page: filters.page,
          limit: filters.limit,
          status: filters.status || undefined,
          type: filters.type || undefined,
        }
      );
      
      setTransactions(response.transactions || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      showNotification('Failed to load transactions', 'error');
      console.log(error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'cancelled':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">💳</span>
        <h1 className="text-2xl font-bold text-gray-900">My Transactions</h1>
      </div>

      {/* Filters and Actions */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="form-input w-auto"
            >
              <option value="">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="contribution">Contributions</option>
              <option value="share_purchase">Share Purchases</option>
              <option value="loan_payment">Loan Payments</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-input w-auto"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button
            onClick={loadTransactions}
            className="btn-primary text-sm"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner"></div>
            <span className="ml-3 text-gray-600">Loading transactions...</span>
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-gray-600">
                        {transaction.transactionId}
                      </td>
                      <td className="py-3 px-4 text-sm capitalize">
                        {transaction.type.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={getStatusBadge(transaction.status)}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {transaction.description || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {transaction.reference || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Page {filters.page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page <= 1}
                    className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page >= totalPages}
                    className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <span className="text-4xl block mb-4">💳</span>
            <h3 className="text-lg font-medium mb-2">No transactions found</h3>
            <p className="text-sm mb-4">
              {filters.status || filters.type 
                ? 'Try adjusting your filters or add a new transaction'
                : 'You haven\'t made any transactions yet'
              }
            </p>
            {(!filters.status && !filters.type) && (
              <button className="btn-primary">
                Add First Transaction
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}