import type { NextFunction, Request, Response } from "express";
import { readMsalSession } from "./msalAuth.js";
import { fetchSecurityProfile } from "./security.js";

export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  permissions: string[];
  roles: Array<{ name: string; scope?: string | null }>;
};

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

// Bearer-only auth path for the mobile client. Trades the access token for
// the profile + perms by calling wireservers-security /api/me directly.
// Sessions for the web client are still cookie-based.
async function authFromBearer(token: string): Promise<AuthUser | null> {
  try {
    const profile = await fetchSecurityProfile(token);
    // /api/me without an `id` means the token didn't authenticate — treat as
    // unauthenticated so we don't synthesize a session.
    if (!profile.id) return null;
    return {
      id: profile.id,
      email: profile.email,
      name: profile.displayName,
      permissions: profile.permissions,
      roles: profile.roles,
    };
  } catch {
    return null;
  }
}

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  // Cookie path (web).
  const session = await readMsalSession(req);
  if (session) {
    req.user = {
      id: session.accountHomeId,
      email: session.account.username,
      name: session.account.name,
      permissions: session.permissions ?? [],
      roles: session.roles ?? [],
    };
    return next();
  }
  // Bearer path (mobile / programmatic).
  const authz = req.headers.authorization ?? "";
  if (authz.startsWith("Bearer ")) {
    const user = await authFromBearer(authz.slice("Bearer ".length).trim());
    if (user) {
      req.user = user;
      return next();
    }
  }
  res.status(401).json({ error: "unauthorized" });
}

/**
 * Composes with requireUser. Returns 403 if the signed-in user is missing the
 * named permission. Permissions come from wireservers-security /api/me at sign-in.
 */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    requireUser(req, res, () => {
      if (!req.user?.permissions.includes(permission)) {
        res.status(403).json({ error: "forbidden", details: `Missing permission ${permission}` });
        return;
      }
      next();
    });
  };
}

export function hasPermission(req: Request, permission: string) {
  return Boolean(req.user?.permissions.includes(permission));
}
