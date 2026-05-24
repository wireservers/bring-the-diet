// Mobile auth via expo-auth-session (PKCE) against the customers CIAM tenant.
//
// The flow:
//   1. App calls signIn() → opens an in-app browser to the CIAM authorize URL.
//   2. CIAM redirects back to `nutri://callback?code=…` (scheme in app.json).
//   3. expo-auth-session exchanges the code for an access token.
//   4. App calls /api/me on the BTD API with `Authorization: Bearer <token>`.
//   5. We store the access token + the response in expo-secure-store.
//
// NOT YET WIRED:
//   - expo-auth-session, expo-secure-store, expo-web-browser packages need
//     to be added to mobile/package.json. They were intentionally left out
//     until the matching app registration ('bring-the-diet-mobile') exists
//     in the customers tenant with a redirect URI of `nutri://callback`.
//
// See docs/SECURITY_INTEGRATION.md for the wiring steps.

export type MobileSession = {
  accessToken: string;
  expiresAt: number;
  user: {
    id?: string;
    email?: string;
    name?: string;
    permissions: string[];
    roles: Array<{ name: string; scope?: string | null }>;
  };
};

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4003').replace(/\/$/, '');

let session: MobileSession | null = null;

export function getSession(): MobileSession | null {
  return session;
}

export function isAuthenticated(): boolean {
  return Boolean(session && session.expiresAt > Date.now());
}

export function hasPermission(key: string): boolean {
  return Boolean(session?.user.permissions.includes(key));
}

export async function signIn(): Promise<MobileSession> {
  throw new Error(
    'mobile auth not yet implemented — add expo-auth-session + register ' +
      "'bring-the-diet-mobile' in the customers CIAM tenant with redirect " +
      "nutri://callback, then wire this function. See docs/SECURITY_INTEGRATION.md.",
  );
}

export async function signOut(): Promise<void> {
  session = null;
}

/**
 * Once signIn() is wired, fetch /api/me with the access token to refresh
 * permissions. Returns null if the API is unreachable or the token is bad.
 */
export async function refreshProfile(): Promise<MobileSession['user'] | null> {
  if (!session) return null;
  try {
    const res = await fetch(`${API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as MobileSession['user'];
    session.user = data;
    return data;
  } catch {
    return null;
  }
}
