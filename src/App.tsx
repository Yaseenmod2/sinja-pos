import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/auth/LoginScreen';
import Dashboard from './components/dashboard/Dashboard';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import POSView from './components/pos/POSView';
import ProductManagement from './components/management/ProductManagement';
import UserManagement from './components/management/UserManagement';
import CustomerManagement from './components/management/CustomerManagement';
import CategoryManagement from './components/management/CategoryManagement';
import { UserRole } from './types';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState(() => 
    user?.role === UserRole.ADMIN ? 'dashboard' : 'pos'
  );

  const renderActiveView = () => {
    const isAdmin = user?.role === UserRole.ADMIN;
    
    switch (activeView) {
      case 'dashboard':
        return isAdmin ? <Dashboard /> : <POSView />;
      case 'pos':
        return <POSView />;
      case 'products':
        return isAdmin ? <ProductManagement /> : <POSView />;
      case 'categories':
        return isAdmin ? <CategoryManagement /> : <POSView />;
      case 'users':
        return isAdmin ? <UserManagement /> : <POSView />;
      case 'customers':
        return isAdmin ? <CustomerManagement /> : <POSView />;
      default:
        return <POSView />;
    }
  };

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default App;