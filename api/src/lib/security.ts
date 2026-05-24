import { env } from "../env.js";

export type SecurityProfile = {
  id?: string;
  email?: string;
  displayName?: string;
  roles: Array<{ name: string; scope?: string | null }>;
  permissions: string[];
};

/**
 * Signals to the sign-in path that the security service is *unreachable* —
 * a config / network issue, not a legitimate empty-permission response. We
 * propagate this distinction because letting users into a half-broken session
 * (signed in but unable to do anything) is worse than rejecting sign-in:
 * the latter is debuggable; the former silently masks a config error.
 */
export class SecurityServiceUnreachableError extends Error {
  constructor(public readonly url: string, public readonly cause: string) {
    super(`wireservers-security unreachable at ${url}: ${cause}`);
    this.name = "SecurityServiceUnreachableError";
  }
}

/**
 * Calls wireservers-security /api/me with the user's delegated access token
 * and returns the user's flat permissions list (e.g. ["budget:debts:write"]).
 *
 * Failure modes are split into two categories on purpose:
 *
 * 1. UNREACHABLE — DNS, TCP, TLS, or unexpected 5xx. Throws
 *    SecurityServiceUnreachableError so the caller (the MSAL callback) can
 *    refuse to mint a session. This avoids the silent half-broken-session
 *    failure mode that hides a misconfigured WIRESERVERS_SECURITY_URL.
 *
 * 2. LEGITIMATE 4xx / empty perms — the service answered, the user has no
 *    grants. Return an empty profile so sign-in proceeds with read-only
 *    access. This is the right answer for blocked users / users not yet
 *    onboarded into any role.
 */
export async function fetchSecurityProfile(accessToken: string): Promise<SecurityProfile> {
  const url = `${env.wireserversSecurityUrl}/api/me`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Purpose-Of-Use": "operations",
      },
    });
  } catch (err) {
    const cause = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error(`[security] UNREACHABLE url=${url} cause=${cause}`);
    throw new SecurityServiceUnreachableError(url, cause);
  }

  if (res.status >= 500) {
    console.error(`[security] UNREACHABLE status=${res.status} url=${url}`);
    throw new SecurityServiceUnreachableError(url, `HTTP ${res.status}`);
  }

  if (!res.ok) {
    // 4xx — the service is healthy, the user just has no grants (or their
    // token didn't authenticate). Return empty so sign-in proceeds with
    // read-only access; loud warning so legitimate misconfig surfaces.
    console.warn(
      `[security] FETCH_FAILED status=${res.status} url=${url} ` +
        `— user proceeds with empty permissions.`,
    );
    return { roles: [], permissions: [] };
  }
  const data = (await res.json()) as Partial<SecurityProfile>;
  return {
    id: data.id,
    email: data.email,
    displayName: data.displayName,
    roles: Array.isArray(data.roles) ? data.roles : [],
    permissions: Array.isArray(data.permissions) ? data.permissions : [],
  };
}
