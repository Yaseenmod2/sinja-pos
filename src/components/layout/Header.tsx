import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOnlineStatus } from '../../context/OnlineStatusContext';
import { LogOut, User as UserIcon, Wifi, WifiOff } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isOnline, offlineOrderCount } = useOnlineStatus();

  return (
    <header className="flex items-center justify-end h-16 bg-white dark:bg-gray-800 shadow-md px-6">
      <div className="flex items-center">
        <div className="flex items-center mr-6">
          {isOnline ? (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <Wifi className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Online</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-500 dark:text-yellow-400">
              <WifiOff className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">
                Offline ({offlineOrderCount} unsynced)
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center mr-4">
          <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
          <span className="text-gray-700 dark:text-gray-300 font-medium">{user?.name}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center px-4 py-2 text-sm font-medium text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900 transition"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
