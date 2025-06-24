'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { transactionService } from '../../services/transactionService';
import { useNotification } from '../Notification';

interface AddTransactionScreenProps {
  onSuccess?: () => void;
}

export function AddTransactionScreen({ onSuccess }: AddTransactionScreenProps) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    description: '',
    reference: '',
    category: 'savings',
  });

  const transactionTypes = [
    { value: 'deposit', label: 'Deposit' },
    { value: 'withdrawal', label: 'Withdrawal' },
    { value: 'contribution', label: 'Contribution' },
    { value: 'share_purchase', label: 'Share Purchase' },
    { value: 'loan_payment', label: 'Loan Payment' },
    { value: 'fee', label: 'Fee Payment' },
  ];

  const categories = [
    { value: 'savings', label: 'Savings' },
    { value: 'shares', label: 'Shares' },
    { value: 'loan', label: 'Loan' },
    { value: 'fee', label: 'Fee' },
    { value: 'other', label: 'Other' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.memberNumber) {
      showNotification('User not found', 'error');
      return;
    }

    if (!formData.type || !formData.amount) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }

    try {
      setLoading(true);
      
      await transactionService.createTransaction({
        memberNumber: user.memberNumber,
        type: formData.type as any,
        amount,
        description: formData.description || undefined,
        reference: formData.reference || undefined,
        category: formData.category as any,
      });

      showNotification('Transaction submitted successfully!', 'success');
      
      // Reset form
      setFormData({
        type: '',
        amount: '',
        description: '',
        reference: '',
        category: 'savings',
      });

      // Call success callback if provided
      onSuccess?.();
    } catch (error: any) {
      showNotification(error.message || 'Failed to submit transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      type: '',
      amount: '',
      description: '',
      reference: '',
      category: 'savings',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">➕</span>
        <h1 className="text-2xl font-bold text-gray-900">Add New Transaction</h1>
      </div>

      {/* Transaction Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="card space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction Type */}
            <div>
              <label htmlFor="type" className="form-label">
                Transaction Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-input"
                required
                disabled={loading}
              >
                <option value="">Select type</option>
                {transactionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="form-label">
                Amount (KSh) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                min="0.01"
                step="0.01"
                className="form-input"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Transaction description"
              rows={3}
              className="form-input resize-none"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reference */}
            <div>
              <label htmlFor="reference" className="form-label">
                Reference (Optional)
              </label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                placeholder="Transaction reference"
                className="form-input"
                disabled={loading}
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-input"
                disabled={loading}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Member Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Member:</strong> {user?.fname} {user?.lname} ({user?.memberNumber})
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="btn-success flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit Transaction'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
              disabled={loading}
            >
              Reset
            </button>
          </div>

          {/* Info Text */}
          <div className="text-xs text-gray-500 pt-2">
            * Required fields. Transaction will be submitted for approval.
          </div>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="max-w-2xl">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => setFormData(prev => ({ ...prev, type: 'deposit', category: 'savings' }))}
              className="btn-secondary text-sm"
              disabled={loading}
            >
              Quick Deposit
            </button>
            <button
              onClick={() => setFormData(prev => ({ ...prev, type: 'contribution', category: 'savings' }))}
              className="btn-secondary text-sm"
              disabled={loading}
            >
              Monthly Contribution
            </button>
            <button
              onClick={() => setFormData(prev => ({ ...prev, type: 'share_purchase', category: 'shares' }))}
              className="btn-secondary text-sm"
              disabled={loading}
            >
              Buy Shares
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}