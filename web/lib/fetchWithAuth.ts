const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003').replace(/\/$/, '');

/**
 * Fetch wrapper that talks to the BTD API with the session cookie attached.
 * The cookie carries an opaque session id; the API looks up the access token
 * server-side and forwards calls to downstream services. The browser never
 * sees a bearer.
 *
 * The second positional arg used to be `getAccessToken` — it is now ignored
 * so existing call sites compile while we finish the cookie migration.
 */
export async function fetchWithAuth(
  path: string,
  _legacyGetAccessTokenIgnored?: unknown,
  options: RequestInit = {},
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
}
