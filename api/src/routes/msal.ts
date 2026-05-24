import { Router } from "express";
import { env } from "../env.js";
import {
  buildLoginUrl,
  buildLogoutUrl,
  clearLoginTempCookies,
  clearMsalCookies,
  createSessionFromCode,
  readLoginCookies,
  readMsalSession,
  writeLoginCookies,
  writeMsalSession,
} from "../lib/msalAuth.js";
import { asyncHandler } from "../lib/http.js";

const router = Router();

router.get(
  "/login",
  asyncHandler(async (req, res) => {
    const callbackUrl = (req.query.callbackUrl as string | undefined) ?? "/dashboard";
    const { url, state, verifier } = await buildLoginUrl(callbackUrl);
    writeLoginCookies(res, state, verifier);
    res.redirect(url);
  }),
);

router.get(
  "/callback",
  asyncHandler(async (req, res) => {
    const code = req.query.code as string | undefined;
    const returnedState = req.query.state as string | undefined;
    const error = req.query.error as string | undefined;
    const errorDescription = req.query.error_description as string | undefined;
    const base = env.appUrl.replace(/\/$/, "");

    if (error) return res.redirect(`${base}/?error=${encodeURIComponent(errorDescription ?? error)}`);
    if (!code || !returnedState) return res.redirect(`${base}/?error=missing_code`);

    const { state, verifier } = readLoginCookies(req);
    if (!state || !verifier || state !== returnedState) return res.redirect(`${base}/?error=invalid_state`);

    try {
      const { session, callbackUrl } = await createSessionFromCode(code, state, verifier);
      await writeMsalSession(res, session);
      clearLoginTempCookies(res);
      const target = callbackUrl.startsWith("/") ? `${base}${callbackUrl}` : `${base}/dashboard`;
      res.redirect(target);
    } catch (authError) {
      console.error("MSAL callback failed", authError);
      // Distinguish "security service down" from generic auth failure so the
      // landing page can show a useful message instead of "callback_failed".
      const code = (authError as { name?: string }).name === "SecurityServiceUnreachableError"
        ? "security_service_unreachable"
        : "callback_failed";
      res.redirect(`${base}/?error=${code}`);
    }
  }),
);

router.get(
  "/logout",
  asyncHandler(async (req, res) => {
    await clearMsalCookies(req, res);
    res.redirect(buildLogoutUrl());
  }),
);

router.get(
  "/session",
  asyncHandler(async (req, res) => {
    const session = await readMsalSession(req);
    res.json({
      authenticated: Boolean(session),
      user: session
        ? {
            ...session.account,
            permissions: session.permissions ?? [],
            roles: session.roles ?? [],
          }
        : null,
      expiresOn: session?.expiresOn ?? null,
    });
  }),
);

export default router;
