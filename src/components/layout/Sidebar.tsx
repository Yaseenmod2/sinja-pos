import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { BarChart2, ShoppingCart, Box, Users, Star, LogOut, Coffee, Tag } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    view: string;
    activeView: string;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, view, activeView, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 transform rounded-md ${
      activeView === view
        ? 'bg-primary-500 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    <span className="mx-4 font-medium">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { user, logout } = useAuth();

  const commonNavs = [
    { view: 'pos', label: 'Point of Sale', icon: <ShoppingCart className="h-5 w-5" /> },
  ];

  const adminNavs = [
    { view: 'dashboard', label: 'Dashboard', icon: <BarChart2 className="h-5 w-5" /> },
    { view: 'products', label: 'Products', icon: <Box className="h-5 w-5" /> },
    { view: 'categories', label: 'Categories', icon: <Tag className="h-5 w-5" /> },
    { view: 'customers', label: 'Customers', icon: <Star className="h-5 w-5" /> },
    { view: 'users', label: 'Users', icon: <Users className="h-5 w-5" /> },
  ];

  const navs = user?.role === UserRole.ADMIN ? [...adminNavs, ...commonNavs] : commonNavs;
  
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex items-center justify-center h-16 border-b dark:border-gray-700">
        <Coffee className="h-8 w-8 text-primary-600 dark:text-primary-300" />
        <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">Sinja Coffee</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {navs.map((nav) => (
            <NavItem
              key={nav.view}
              icon={nav.icon}
              label={nav.label}
              view={nav.view}
              activeView={activeView}
              onClick={() => setActiveView(nav.view)}
            />
          ))}
        </nav>
      </div>
      <div className="p-4 border-t dark:border-gray-700">
        <button onClick={logout} className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
            <LogOut className="w-5 h-5"/>
            <span className="mx-4 font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;