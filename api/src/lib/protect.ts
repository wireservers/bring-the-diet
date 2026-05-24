import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../env.js";

// 200 mutating requests / 15 min per IP. Reads (GET) bypass via skip.
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: (req) => req.method === "GET" || req.method === "HEAD",
  message: { error: "rate_limited", details: "Too many requests, slow down." },
});

// LLM-backed parse endpoints are expensive. 20 calls / hour per IP.
export const llmLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "rate_limited", details: "Document parse quota exceeded. Try again later." },
});

const allowedOrigins = new Set(
  [env.appUrl]
    .filter((s): s is string => Boolean(s))
    .map((s) => s.replace(/\/$/, "")),
);

/**
 * Defense-in-depth against CSRF: state-changing requests must come from an
 * allow-listed Origin (or Referer when Origin is absent — e.g. some older
 * browsers / form posts). MSAL callback POSTs are excluded by path.
 */
export function requireSameOrigin(req: Request, res: Response, next: NextFunction) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return next();
  // MSAL redirect-mode callback is a top-level navigation from login.microsoftonline.com.
  if (req.path.startsWith("/api/msal/")) return next();

  const origin = req.get("origin");
  const referer = req.get("referer");
  const source = origin ?? (referer ? new URL(referer).origin : null);
  if (!source || !allowedOrigins.has(source.replace(/\/$/, ""))) {
    res.status(403).json({ error: "forbidden", details: "Origin not allowed." });
    return;
  }
  next();
}
