'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginScreen } from '@/components/LoginScreen';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useNotification } from '@/components/Notification';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { NotificationContainer } = useNotification();

  return (
    <>
      {isAuthenticated ? <DashboardLayout /> : <LoginScreen />}
      <NotificationContainer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}