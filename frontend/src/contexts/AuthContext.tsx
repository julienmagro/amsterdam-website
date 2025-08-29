'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, setAuthToken, removeAuthToken, getAuthToken } from '@/lib/api';

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_age?: number;
  is_admin: boolean;
  google_id?: string;
  profile_picture?: string;
  email_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    age: number;
  }) => Promise<{ success: boolean; user?: User; access_token?: string }>;
  verifyEmail: (user_id: number, verification_code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token and validate it on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const response = await authAPI.profile();
          setUser(response.data.user);
        } catch {
          // Token is invalid
          removeAuthToken();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access_token, user: userData } = response.data;
      
      setAuthToken(access_token);
      setUser(userData);
    } catch (error: unknown) {
      throw new Error((error as ApiError)?.response?.data?.error || 'Login failed');
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    // Optionally call the API logout endpoint
    authAPI.logout().catch(() => {
      // Ignore errors on logout
    });
  };

  const register = async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    age: number;
  }) => {
    try {
      const response = await authAPI.register(userData);
      
      // For local development, the API now returns access_token and user immediately
      if (response.data.access_token && response.data.user) {
        setAuthToken(response.data.access_token);
        setUser(response.data.user);
        return { success: true, user: response.data.user, access_token: response.data.access_token };
      }
      
      // Fallback for production (verification required)
      return { success: false, user_id: response.data.user?.id };
    } catch (error: unknown) {
      throw new Error((error as ApiError)?.response?.data?.error || 'Registration failed');
    }
  };

  const verifyEmail = async (user_id: number, verification_code: string) => {
    try {
      const response = await authAPI.verifyEmail({ user_id, verification_code });
      const { access_token, user: userData } = response.data;
      
      setAuthToken(access_token);
      setUser(userData);
    } catch (error: unknown) {
      throw new Error((error as ApiError)?.response?.data?.error || 'Email verification failed');
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
