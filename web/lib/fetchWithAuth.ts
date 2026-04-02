const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

/**
 * Fetch wrapper that attaches a Bearer token for authenticated API calls.
 * Use for write operations (POST, PUT, DELETE) that require auth.
 */
export async function fetchWithAuth(
  path: string,
  getAccessToken: () => Promise<string | null>,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in.');
  }

  const url = path.startsWith('http') ? path : `${API_URL}${path}`;

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}
