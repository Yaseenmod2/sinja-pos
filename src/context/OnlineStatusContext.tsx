import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { syncOfflineOrders } from '../services/dataService';

interface OnlineStatusContextType {
  isOnline: boolean;
  offlineOrderCount: number;
  refreshOfflineCount: () => void;
}

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined);

export const OnlineStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineOrderCount, setOfflineOrderCount] = useState(0);

  const refreshOfflineCount = useCallback(() => {
    try {
      const queue = JSON.parse(localStorage.getItem('pos_offline_orders') || '[]');
      setOfflineOrderCount(queue.length);
    } catch {
      setOfflineOrderCount(0);
    }
  }, []);
  
  const handleSync = useCallback(async () => {
    if (!navigator.onLine) return;
    
    console.log('Attempting to sync offline orders...');
    try {
      const syncedCount = await syncOfflineOrders();
      if (syncedCount > 0) {
        console.log(`Successfully synced ${syncedCount} orders.`);
      }
    } catch (error) {
        console.error("Failed to sync offline orders:", error);
    } finally {
      refreshOfflineCount();
    }
  }, [refreshOfflineCount]);

  useEffect(() => {
    refreshOfflineCount();

    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (navigator.onLine) {
      handleSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleSync, refreshOfflineCount]);

  const value = { isOnline, offlineOrderCount, refreshOfflineCount };

  return (
    <OnlineStatusContext.Provider value={value}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

export const useOnlineStatus = (): OnlineStatusContextType => {
  const context = useContext(OnlineStatusContext);
  if (!context) {
    throw new Error('useOnlineStatus must be used within an OnlineStatusProvider');
  }
  return context;
};
