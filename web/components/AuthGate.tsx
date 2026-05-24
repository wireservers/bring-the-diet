'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';

// Paths the public can reach without signing in. Everything else triggers a
// redirect to the BTD API's /api/msal/login (handled by useAuth().login()).
//
// We allowlist by prefix so /blog/<slug> stays public. Auth callback URLs
// live on the API host, not this web app, so they don't need entries here.
const PUBLIC_PREFIXES = ['/about', '/blog'];

function isPublicPath(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/**
 * Wrap the whole app. When the current path is non-public AND the user is
 * not authenticated, redirect to the API login URL (which redirects back to
 * the original path after sign-in). While the auth context is still loading,
 * render a minimal placeholder so we don't briefly flash private content.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, login } = useAuth();
  const requiresAuth = !isPublicPath(pathname);

  useEffect(() => {
    if (requiresAuth && !isLoading && !isAuthenticated) {
      login(pathname); // hits <API_URL>/api/msal/login?callbackUrl=<pathname>
    }
  }, [requiresAuth, isLoading, isAuthenticated, login, pathname]);

  if (requiresAuth && (isLoading || !isAuthenticated)) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--page-bg)',
        color: 'var(--text-muted)',
        fontSize: 14,
      }}>
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
