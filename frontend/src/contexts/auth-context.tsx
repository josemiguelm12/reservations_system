'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAccessToken, getAccessToken } from '@/lib/api';
import type { User, AuthResponse } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; role?: 'CLIENT' | 'PARTNER'; businessName?: string; businessDescription?: string; phone?: string; address?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.post('/api/auth/refresh');
      const { accessToken, user: userData } = response.data;
      setAccessToken(accessToken);
      setUser(userData);
    } catch (error) {
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    setAccessToken(response.data.accessToken);
    setUser(response.data.user);
  };

  const register = async (data: { email: string; password: string; fullName: string; role?: 'CLIENT' | 'PARTNER'; businessName?: string; businessDescription?: string; phone?: string; address?: string }) => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    setAccessToken(response.data.accessToken);
    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignore errors
    }
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}