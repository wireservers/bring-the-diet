'use client';

// Client auth context backed by the BTD API's server-side session.
//
// The browser carries only the opaque `btd.msal` cookie; identity + perms
// live in Mongo, sealed with AUTH_SECRET. The web never sees the access
// token — fetches to the API just include credentials and the API uses
// the cookie to look up the session and acquire a fresh token silently.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003').replace(/\/$/, '');

export type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  localAccountId?: string;
  permissions: string[];
  roles: Array<{ name: string; scope?: string | null }>;
};

export type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;
  login: (callbackUrl?: string) => void;
  logout: () => void;
  refresh: () => Promise<void>;
  hasPermission: (key: string) => boolean;
};

const AuthContext = createContext<AuthState | null>(null);

async function fetchSession(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_URL}/api/msal/session`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = (await res.json()) as { authenticated: boolean; user: AuthUser | null };
    return data.authenticated && data.user ? data.user : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const u = await fetchSession();
    setUser(u);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    // Also refresh when the tab regains focus — covers sign-in completion
    // happening in a redirect from the API.
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  const login = useCallback((callbackUrl = '/') => {
    const url = new URL(`${API_URL}/api/msal/login`);
    url.searchParams.set('callbackUrl', callbackUrl);
    window.location.href = url.toString();
  }, []);

  const logout = useCallback(() => {
    window.location.href = `${API_URL}/api/msal/logout`;
  }, []);

  const value = useMemo<AuthState>(() => ({
    isAuthenticated: Boolean(user),
    isLoading,
    user,
    error,
    login,
    logout,
    refresh,
    hasPermission: (key: string) => Boolean(user?.permissions?.includes(key)),
  }), [user, isLoading, error, login, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // No provider — return a safe disconnected state so page renders.
    return {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      login: () => { console.warn('[auth] no AuthProvider; login no-op'); },
      logout: () => {},
      refresh: async () => {},
      hasPermission: () => false,
    };
  }
  return ctx;
}
