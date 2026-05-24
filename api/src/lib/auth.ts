import type { NextFunction, Request, Response } from "express";
import { readMsalSession } from "./msalAuth.js";

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

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  const session = await readMsalSession(req);
  if (!session) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  req.user = {
    id: session.accountHomeId,
    email: session.account.username,
    name: session.account.name,
    permissions: session.permissions ?? [],
    roles: session.roles ?? [],
  };
  next();
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
