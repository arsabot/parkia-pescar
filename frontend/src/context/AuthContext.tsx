import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthResponse } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDriver: boolean;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<AuthResponse>;
  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role?: UserRole;
    phone?: string;
  }) => Promise<AuthResponse>;
  demoLogin: (role: UserRole) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
        } catch {
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await authService.login(credentials);
    setUser(res.user);
    return res;
  };

  const register = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role?: UserRole;
    phone?: string;
  }) => {
    const res = await authService.register(data);
    setUser(res.user);
    return res;
  };

  const demoLogin = async (role: UserRole) => {
    const res = await authService.demoLogin(role);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    if (authService.isAuthenticated()) {
      const u = await authService.getMe();
      setUser(u);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isDriver = user?.role === 'driver';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isDriver,
        loading,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
