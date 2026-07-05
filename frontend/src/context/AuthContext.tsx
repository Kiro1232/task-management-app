import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';
import { User, ApiResponse } from '../types';

// ─── Context contract ──────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * On mount, attempt to restore the session by calling GET /auth/me.
   * The backend reads the HTTP-Only cookie automatically — no token handling
   * needed in JavaScript.
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
        setUser(res.data.data.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<ApiResponse<{ user: User; message: string }>>('/auth/login', {
      email,
      password,
    });
    setUser(res.data.data.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await apiClient.post<ApiResponse<{ user: User; message: string }>>(
      '/auth/register',
      { email, password, name }
    );
    setUser(res.data.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Clear local state regardless of network result
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
