'use client';

import { useCallback } from 'react';

/**
 * Mock auth hook — returns a stub "dev user" so the app runs without MSAL / Azure AD.
 * Replace with the real MSAL-based hook when auth is wired up.
 */
interface AuthUser {
  name: string;
  email: string;
}

export function useAuth(): {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
} {
  const login = useCallback(async () => {
    console.log('[mock] login called — no-op');
  }, []);

  const logout = useCallback(async () => {
    console.log('[mock] logout called — no-op');
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    return 'mock-dev-token';
  }, []);

  return {
    isAuthenticated: false,
    user: null,
    login,
    logout,
    getAccessToken,
  };
}
