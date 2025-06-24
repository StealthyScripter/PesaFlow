'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from './Notification';

export function LoginScreen() {
  const [memberNumber, setMemberNumber] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memberNumber.trim()) {
      showNotification('Please enter a member number', 'error');
      return;
    }

    try {
      await login(memberNumber.toUpperCase());
      showNotification(`Welcome back!`, 'success');
    } catch (err:any) {
      showNotification(err.message || 'Login failed', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-green-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <span className="text-3xl">💰</span>
            <h1 className="text-2xl font-bold text-gray-900 ml-2">PesaFlow</h1>
          </div>
          <p className="text-gray-600">SACCO Management Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">Member Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter member number (e.g., MEM001)"
              value={memberNumber}
              onChange={(e) => setMemberNumber(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full btn-primary flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="text-center space-y-2">
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">
              Forgot Password?
            </a>
            <div className="text-xs text-gray-500">
              Demo: Use MEM001, MEM002, MEM003, etc.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}