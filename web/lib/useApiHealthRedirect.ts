'use client';

import { useCallback, useRef } from 'react';

/**
 * Returns a helper that checks whether an error indicates the API is unreachable
 * (network failure, timeout, DNS, CORS preflight, etc.) and redirects to /service-unavailable.
 *
 * Usage:
 *   const { handleApiError } = useApiHealthRedirect();
 *   catch (err) { handleApiError(err); }
 */
export function useApiHealthRedirect() {
  const redirected = useRef(false);

  const handleApiError = useCallback((err: unknown) => {
    if (redirected.current) return true;
    if (isNetworkError(err)) {
      redirected.current = true;
      window.location.replace('/service-unavailable');
      return true;
    }
    return false;
  }, []);

  return { handleApiError };
}

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('network request failed') ||
      msg.includes('load failed') ||
      msg.includes('fetch failed')
    );
  }
  if (err instanceof DOMException && err.name === 'AbortError') {
    return true;
  }
  return false;
}
