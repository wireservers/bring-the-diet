# Security integration — bring-the-diet

How bring-the-diet (BTD) authenticates users, gets permissions, and enforces
authorization. BTD has **no users table** of its own — identity, roles, and
permissions live in `wireservers-security`.

This document mirrors [bring-the-budget/docs/SECURITY_INTEGRATION.md](../../bring-the-budget/docs/SECURITY_INTEGRATION.md);
the only deltas are the diet permission catalog and the cookie name.

## The five moving parts

```
┌────────────────┐    1. /api/msal/login      ┌─────────────────────┐
│  BTD Web/Mobile│ ────────────────────────►  │ Microsoft Entra CIAM│
└────────────────┘                            │ tenant: "customers" │
        │                                     └─────────────────────┘
        │ 2. /api/msal/callback                          │
        │ ◄────────────────────────────────── auth-code  │
        ▼
┌────────────────┐    3. /api/me              ┌─────────────────────┐
│ BTD API        │ ────────────────────────►  │ wireservers-security│
│ (Node Express) │ ◄──── roles + perms ────── │ API (.NET)          │
└────────────────┘                            └─────────────────────┘
        │
        │ 4. requirePermission("diet:upload")
        ▼
┌────────────────┐
│ Route handler  │ → 200 OK or 403 forbidden
└────────────────┘
```

1. **Sign-in** — user clicks "Sign in"; web redirects to `/api/msal/login`.
   The API does PKCE auth-code with Entra CIAM (`customers` tenant,
   `36c719fe-…`).
2. **Callback** — Entra redirects to `/api/msal/callback?code=…`. The API
   exchanges the code, fetches the user's perms from `wireservers-security`,
   stores the session payload (access token + perms) server-side in Mongo,
   sealed with AUTH_SECRET, and sets the opaque `btd.msal` cookie.
3. **Profile fetch** — happens inside the callback, before the cookie is
   set. If the security service is unreachable, sign-in is rejected (no
   half-broken sessions).
4. **Per-route enforcement** — Express routes wrap handlers in
   `requirePermission("diet:<key>")`. Missing perm → 403.

## Permissions catalog

Defined in [`api/Migrations/20260524134951_AddDietPermissions.cs`](../../../wireservers-security/api/Migrations/20260524134951_AddDietPermissions.cs)
on the security service:

| Key | Granted to | What it gates |
|-----|------------|---------------|
| `diet:recipes:read` | diet-user (default) | GET /api/recipes/* |
| `diet:recipes:write` | diet-user (default) | POST/PUT/DELETE /api/recipes/*, /publish |
| `diet:foods:read` | diet-user (default) | GET /api/foods/* (and nutrition facts) |
| `diet:foods:write` | diet-user (default) | POST/PUT/DELETE /api/foods/* |
| `diet:mealplans:read` | diet-user (default) | GET /api/mealplans/* |
| `diet:mealplans:write` | diet-user (default) | POST/PUT/DELETE /api/mealplans/* |
| `diet:diets:read` | diet-user (default) | GET /api/diets/* |
| `diet:diets:write` | diet-user (default) | POST/PUT/DELETE /api/diets/* |
| `diet:blog:read` | diet-user (default) | GET /api/blog/* |
| `diet:blog:write` | diet-user (default) | POST/PUT/DELETE /api/blog/* (incl. comment moderation) |
| `diet:favorites:read` | diet-user (default) | GET /api/favorites/* |
| `diet:favorites:write` | diet-user (default) | POST/DELETE /api/favorites/* |
| `diet:progress:read` | diet-user (default) | GET /api/progress/* |
| `diet:progress:write` | diet-user (default) | POST/PUT/DELETE /api/progress/* |
| `diet:upload` | diet-user (default) | POST /api/upload (image/PDF/CSV → LLM) |
| `diet:admin` | diet-admin (explicit) | Privacy erase, audit-integrity, content moderation |

Two roles:

- **`diet-user`** — `IsDefault=true`. Every authenticated user gets the full
  non-privileged set automatically. No manual grant required.
- **`diet-admin`** — `IsDefault=false`. Holds `diet:admin` only. Grant via
  the security admin console at `admin.wireservers.com/security/users`.

## `IsDefault` gotcha (same one BTB hit)

The security service's `/api/me` must union default-role perms into the
response. If it doesn't, signed-in users get back `permissions: []` and
every route returns `403 forbidden — Missing permission diet:*`.

This was fixed in `wireservers-security` on `2026-05-24` — see
[`MeController.cs`](../../../wireservers-security/api/Controllers/MeController.cs)
and the matching commit. If you ever see "Missing permission diet:upload"
for a normal authenticated user, the regression is back there, not in BTD.

## Web sign-in flow (Next.js)

`web/components/AuthProviderWrapper.tsx` wraps the app in `AuthProvider`
from `web/lib/auth.tsx`. The hook:

```ts
const { isAuthenticated, user, login, logout, hasPermission } = useAuth();
```

`login()` redirects to `<API_URL>/api/msal/login?callbackUrl=…`; `logout()`
hits `/api/msal/logout` which clears the cookie + invalidates the server
session row + redirects to the Entra `end_session` URL.

The hook fetches `/api/msal/session` on mount and on `focus` — so a redirect
back from sign-in repopulates state without a manual refresh.

For client fetches that need credentials:

```ts
import { fetchWithAuth } from '../lib/fetchWithAuth';
const res = await fetchWithAuth('/api/recipes');  // sends btd.msal cookie
```

`fetchWithAuth` sends `credentials: 'include'`; CORS on the API side is
configured with `Access-Control-Allow-Credentials: true` and `origin: APP_URL`
so the cookie rides along on cross-origin requests.

## Mobile sign-in flow (Expo)

`mobile/lib/auth.ts` is the stub. The wiring still pending — see comments at
top of the file. Plan:

1. Add a `bring-the-diet-mobile` app registration in the customers CIAM
   tenant with redirect URI `nutri://callback` (the scheme is set in
   `mobile/app.json`).
2. Add `expo-auth-session`, `expo-web-browser`, and `expo-secure-store` to
   `mobile/package.json`.
3. Implement `signIn()` using `AuthSession.useAuthRequest` against the
   tenant authorize endpoint with PKCE; persist the access token in
   `expo-secure-store`.
4. Call `/api/me` with `Authorization: Bearer <token>` to populate
   `session.user.permissions`. The BTD API's `requireUser` middleware
   already accepts bearer tokens for this exact use case (and falls back to
   the cookie path for web).

Permission checks share the same key set as web (`hasPermission("diet:upload")`).

## Where the session lives

| Surface | Where the session is | What's in it |
|---------|---------------------|--------------|
| Web | Mongo `sessions` collection, sealed with AUTH_SECRET (AES-256-GCM) | Access token + token cache + perms + roles |
| Web cookie | `btd.msal` (HttpOnly, Secure, SameSite=lax, Path=/) | Opaque 24-byte session id only |
| Mobile | `expo-secure-store` (keychain / EncryptedSharedPrefs) | Access token only; perms fetched from `/api/me` on launch |

Rotating `AUTH_SECRET` invalidates every active web session (the seal becomes
un-decryptable). Pair rotation with user notice.

## Rotating permissions or roles

1. Add a new EF migration in `wireservers-security` modifying
   `RolePermissions` (never edit an existing migration).
2. Deploy the security service.
3. Users see new perms on next sign-in. To force an immediate refresh,
   rotate `AUTH_SECRET` (invalidates every session globally).

Grant `diet:admin` to a specific user:

```sql
INSERT INTO UserRoles (UserId, RoleId, Scope, GrantedUtc)
VALUES ('<user-guid>', '11111111-2222-3333-4444-555555550004', NULL, GETUTCDATE());
```

Or use `admin.wireservers.com/security/users`.

## Verifying after deploy

```bash
# 1. Sign in via the web; copy the access token (Network panel → Authorization header on any /api/* call from the API)
# 2. Hit /api/me directly:
curl -sS https://secure.wireservers.com/api/me -H "Authorization: Bearer $TOKEN" | jq .permissions
```

Expected output:

```json
[
  "diet:recipes:read", "diet:recipes:write",
  "diet:foods:read",   "diet:foods:write",
  "diet:mealplans:read","diet:mealplans:write",
  "diet:diets:read",   "diet:diets:write",
  "diet:blog:read",    "diet:blog:write",
  "diet:favorites:read","diet:favorites:write",
  "diet:progress:read","diet:progress:write",
  "diet:upload"
]
```

If the array is empty, check the same three things called out in
`bring-the-budget/docs/SECURITY_INTEGRATION.md`:

- security service deploy stale,
- `AddDietPermissions` migration not applied (look for it in
  `__EFMigrationsHistory`),
- `diet-user.IsDefault` got flipped to false.

## Token + cookie reference

| Surface | Cookie / header | Source | Notes |
|---------|----------------|--------|-------|
| BTD web/API | `btd.msal` cookie | set on `/api/msal/callback` | Opaque id; payload in Mongo |
| BTD mobile | `Authorization: Bearer <token>` | expo-auth-session PKCE | Token from CIAM tenant directly |
| BTD API → Security | `Authorization: Bearer <token>` | access token from session | Calls `/api/me` |

## Files to know

| Concern | File |
|---------|------|
| Permission middleware | [api/src/lib/auth.ts](../api/src/lib/auth.ts) — `requirePermission`, `requireUser` |
| Session read/write | [api/src/lib/msalAuth.ts](../api/src/lib/msalAuth.ts) |
| /api/me + perms fetch | [api/src/lib/security.ts](../api/src/lib/security.ts) |
| Field encryption helper | [api/src/lib/fieldCrypto.ts](../api/src/lib/fieldCrypto.ts) |
| Web auth context | [web/lib/auth.tsx](../web/lib/auth.tsx) |
| Mobile auth stub | [mobile/lib/auth.ts](../mobile/lib/auth.ts) |
| Permission catalog (source of truth) | [wireservers-security/api/Migrations/20260524134951_AddDietPermissions.cs](../../../wireservers-security/api/Migrations/20260524134951_AddDietPermissions.cs) |
| /api/me endpoint | [wireservers-security/api/Controllers/MeController.cs](../../../wireservers-security/api/Controllers/MeController.cs) |
| Default-role union (server-side authz) | [wireservers-security/api/Authorization/CurrentUser.cs](../../../wireservers-security/api/Authorization/CurrentUser.cs) |
| Sub-processors | [docs/SUB_PROCESSORS.md](SUB_PROCESSORS.md) |
| Network firewalls (Wave C) | [scripts/provision-network-firewalls.sh](../scripts/provision-network-firewalls.sh) |
| Incident response | [docs/INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) |
| DPIA | [docs/DPIA.md](DPIA.md) |
