'use client';

import { AuthProvider } from '@wsws/auth/react';
import type { ReactNode } from 'react';
import { getAuthConfig } from '../lib/authConfig';

/**
 * Renders the real Entra-backed AuthProvider when NEXT_PUBLIC_AZURE_CLIENT_ID is set,
 * otherwise renders children unwrapped (mock-mode). Letting `useAuth` throw in mock-mode
 * is intentional — pages that depend on auth should use the dedicated <AuthGuard> or
 * gate themselves on `process.env.NEXT_PUBLIC_AZURE_CLIENT_ID`.
 */
export function AuthProviderWrapper({ children }: { children: ReactNode }) {
  const config = getAuthConfig();
  if (!config) return <>{children}</>;
  return <AuthProvider config={config}>{children}</AuthProvider>;
}
