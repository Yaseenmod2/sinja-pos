import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';
import { loginUser as apiLogin } from '../services/dataService';

interface AuthContextType {
  user: User | null;
  login: (accessCode: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
        const storedUser = sessionStorage.getItem('pos_user');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        return null;
    }
  });

  const login = async (accessCode: string): Promise<boolean> => {
    const loggedInUser = await apiLogin(accessCode);
    if (loggedInUser) {
      setUser(loggedInUser);
      sessionStorage.setItem('pos_user', JSON.stringify(loggedInUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('pos_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};