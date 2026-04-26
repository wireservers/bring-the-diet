'use client';

import { AuthContext, type AuthContextValue } from '@wsws/auth/react';
import { useContext } from 'react';

const MOCK: AuthContextValue = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  login: async () => {
    console.warn('[auth] mock-mode: login no-op (set NEXT_PUBLIC_AZURE_CLIENT_ID to enable)');
  },
  logout: async () => {},
  getAccessToken: async () => null,
};

/**
 * Returns the real Entra-backed auth state when wrapped in <AuthProvider>;
 * returns a mock object otherwise so the app renders without Entra configured.
 */
export function useAuth(): AuthContextValue {
  return useContext(AuthContext) ?? MOCK;
}
