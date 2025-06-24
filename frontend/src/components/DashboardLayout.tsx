'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getInitials } from '../services/api';
import { DashboardScreen } from './screens/DashboardScreen';
import { TransactionsScreen } from './screens/TransactionsScreen';
import { AddTransactionScreen } from './screens/AddTransactionScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AdminScreen } from './screens/AdminScreen';

type ScreenType = 'dashboard' | 'transactions' | 'addTransaction' | 'profile' | 'settings' | 'admin';

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'transactions', label: 'Transactions', icon: '💳' },
  { id: 'addTransaction', label: 'Add Transaction', icon: '➕' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export function DashboardLayout() {
  const { user, isAdmin, logout } = useAuth();
  const [activeScreen, setActiveScreen] = useState<ScreenType>('dashboard');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'transactions':
        return <TransactionsScreen />;
      case 'addTransaction':
        return <AddTransactionScreen onSuccess={() => setActiveScreen('transactions')} />;
      case 'profile':
        return <ProfileScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'admin':
        return <AdminScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <h1 className="text-xl font-bold text-blue-600">PesaFlow</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {getInitials(user.fname, user.lname)}
              </div>
              <span className="text-sm font-medium text-gray-700">
                Welcome, <strong>{user.fname}</strong>
              </span>
            </div>
            <button
              onClick={logout}
              className="btn-secondary text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id as ScreenType)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all ${
                  activeScreen === item.id
                    ? 'text-blue-600 bg-gray-50 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => setActiveScreen('admin')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all ${
                  activeScreen === 'admin'
                    ? 'text-blue-600 bg-gray-50 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>⚙️</span>
                Admin
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderScreen()}
      </main>
    </div>
  );
}