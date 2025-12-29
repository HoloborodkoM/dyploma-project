'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { isTokenExpired } from '@/utils/auth';

export interface AuthUser {
  id: number;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        setUser(null);
        return;
      }
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        });
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const login = useCallback((token: string) => {
    if (isTokenExpired(token)) {
      localStorage.removeItem('token');
      setUser(null);
      return;
    }
    localStorage.setItem('token', token);
    const decoded: any = jwtDecode(token);
    setUser({
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('coursesActiveTab');
    localStorage.removeItem('simulationsActiveTab');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}