'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '../lib/auth';

/**
 * Wraps the app in the BTD AuthProvider — a thin client context that talks
 * to the BTD API's /api/msal/session endpoint. The browser carries only an
 * opaque session cookie; identity + permissions live server-side.
 */
export function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
