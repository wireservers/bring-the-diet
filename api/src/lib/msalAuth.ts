import crypto from "node:crypto";
import {
  ConfidentialClientApplication,
  CryptoProvider,
  type AccountInfo,
  type AuthorizationUrlRequest,
  type Configuration,
  type SilentFlowRequest,
} from "@azure/msal-node";
import type { CookieOptions, Request, Response } from "express";
import { env } from "../env.js";
import { connectDb } from "./db.js";
import { Session } from "../models/Session.js";
import { fetchSecurityProfile } from "./security.js";

const sessionCookie = "btd.msal";
const stateCookie = "btd.msal.state";
const verifierCookie = "btd.msal.verifier";
const cookieMaxAgeSeconds = 60 * 60 * 8;

export type MsalSession = {
  accessToken: string;
  expiresOn: number;
  accountHomeId: string;
  account: { name?: string; username?: string; localAccountId?: string };
  tokenCache: string;
  permissions: string[];
  roles: Array<{ name: string; scope?: string | null }>;
};

type StatePayload = { callbackUrl: string; nonce: string };

function getAuthority() {
  return env.entraIssuer.replace(/\/$/, "").replace(/\/v2\.0$/, "");
}

function getRedirectUri() {
  return `${env.apiUrl.replace(/\/$/, "")}/api/msal/callback`;
}

function getScopes() {
  return ["openid", "profile", "email", "offline_access", env.entraApiScope];
}

function createMsalClient(cache?: string) {
  const config: Configuration = {
    auth: {
      clientId: env.entraClientId,
      authority: getAuthority(),
      clientSecret: env.entraClientSecret,
    },
    system: { loggerOptions: { piiLoggingEnabled: false } },
  };
  const client = new ConfidentialClientApplication(config);
  if (cache) client.getTokenCache().deserialize(cache);
  return client;
}

function serializeAccount(account: AccountInfo) {
  return {
    name: account.name,
    username: account.username,
    localAccountId: account.localAccountId,
  };
}

function normalizeCallbackUrl(value: string) {
  if (!value || value.startsWith("http://") || value.startsWith("https://")) return "/";
  return value.startsWith("/") ? value : "/";
}

function cookieKey() {
  return crypto.createHash("sha256").update(env.authSecret).digest();
}

function seal<T>(value: T): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", cookieKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function unseal<T>(value: string): T | null {
  try {
    const payload = Buffer.from(value, "base64url");
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", cookieKey(), iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
    return JSON.parse(plaintext) as T;
  } catch {
    return null;
  }
}

function cookieOpts(maxAgeSeconds: number): CookieOptions {
  // Force Secure in production regardless of apiUrl — a misconfigured APP_URL
  // shouldn't be able to downgrade financial-app session cookies to clear-text.
  const secure = process.env.NODE_ENV === "production" || env.apiUrl.startsWith("https://");
  return {
    httpOnly: true,
    // www.bringthebudget.com -> api.bringthebudget.com is same eTLD+1, so
    // SameSite=lax allows top-level navigation cookies through. Cross-origin
    // fetch with credentials still works because the browser treats
    // same-site = same eTLD+1 + scheme.
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: maxAgeSeconds * 1000,
  };
}

export async function buildLoginUrl(callbackUrl: string) {
  const msal = createMsalClient();
  const cp = new CryptoProvider();
  const { verifier, challenge } = await cp.generatePkceCodes();
  const state = seal<StatePayload>({
    callbackUrl: normalizeCallbackUrl(callbackUrl),
    nonce: crypto.randomBytes(16).toString("base64url"),
  });

  const request: AuthorizationUrlRequest = {
    scopes: getScopes(),
    redirectUri: getRedirectUri(),
    responseMode: "query",
    codeChallenge: challenge,
    codeChallengeMethod: "S256",
    state,
    // No `prompt: "login"` — that would force the CIAM sign-in form even when
    // the user already has an active tenant-level session from another
    // BringThe app, breaking SSO across apps. Microsoft's tenant cookie is
    // exactly the SSO carryover we want.
  };
  return { url: await msal.getAuthCodeUrl(request), state, verifier };
}

export async function createSessionFromCode(code: string, state: string, verifier: string) {
  const statePayload = unseal<StatePayload>(state);
  if (!statePayload) throw new Error("Invalid MSAL state.");

  const msal = createMsalClient();
  const result = await msal.acquireTokenByCode({
    code,
    scopes: getScopes(),
    redirectUri: getRedirectUri(),
    codeVerifier: verifier,
  });
  if (!result?.accessToken || !result.account) throw new Error("MSAL did not return an API access token.");

  // Fetch roles/permissions from wireservers-security using the freshly minted token.
  const profile = await fetchSecurityProfile(result.accessToken);

  const session: MsalSession = {
    accessToken: result.accessToken,
    expiresOn: result.expiresOn?.getTime() ?? Date.now() + 3600_000,
    accountHomeId: result.account.homeAccountId,
    account: serializeAccount(result.account),
    tokenCache: msal.getTokenCache().serialize(),
    permissions: profile.permissions,
    roles: profile.roles,
  };
  return { session, callbackUrl: statePayload.callbackUrl };
}

export async function readMsalSession(req: Request): Promise<MsalSession | null> {
  const sid = (req.cookies?.[sessionCookie] as string | undefined) ?? undefined;
  if (!sid) return null;
  await connectDb();
  const row = await Session.findById(sid).lean();
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await Session.deleteOne({ _id: sid });
    return null;
  }
  return unseal<MsalSession>(row.payload);
}

export async function getMsalAccessToken(req: Request): Promise<string | null> {
  const session = await readMsalSession(req);
  if (!session) return null;
  if (Date.now() < session.expiresOn - 60_000) return session.accessToken;

  const msal = createMsalClient(session.tokenCache);
  const account = await msal.getTokenCache().getAccountByHomeId(session.accountHomeId);
  if (!account) return session.accessToken;
  const request: SilentFlowRequest = { account, scopes: [env.entraApiScope] };
  const result = await msal.acquireTokenSilent(request);
  return result?.accessToken ?? session.accessToken;
}

export async function writeMsalSession(res: Response, session: MsalSession) {
  const payload = seal(session);
  const sid = crypto.randomBytes(24).toString("base64url");
  await connectDb();
  await Session.create({
    _id: sid,
    userId: session.accountHomeId,
    payload,
    expiresAt: new Date(Date.now() + cookieMaxAgeSeconds * 1000),
  });
  res.cookie(sessionCookie, sid, cookieOpts(cookieMaxAgeSeconds));
}

export async function clearMsalCookies(req: Request, res: Response) {
  const sid = req.cookies?.[sessionCookie] as string | undefined;
  if (sid) {
    try {
      await connectDb();
      await Session.deleteOne({ _id: sid });
    } catch (err) {
      console.error("Failed to delete session row", err);
    }
  }
  res.clearCookie(sessionCookie, cookieOpts(0));
  res.clearCookie(stateCookie, cookieOpts(0));
  res.clearCookie(verifierCookie, cookieOpts(0));
}

export function clearLoginTempCookies(res: Response) {
  res.clearCookie(stateCookie, cookieOpts(0));
  res.clearCookie(verifierCookie, cookieOpts(0));
}

export function writeLoginCookies(res: Response, state: string, verifier: string) {
  res.cookie(stateCookie, state, cookieOpts(900));
  res.cookie(verifierCookie, verifier, cookieOpts(900));
}

export function readLoginCookies(req: Request) {
  return {
    state: req.cookies?.[stateCookie] as string | undefined,
    verifier: req.cookies?.[verifierCookie] as string | undefined,
  };
}

export function buildLogoutUrl() {
  return `${getAuthority()}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(env.appUrl)}`;
}
