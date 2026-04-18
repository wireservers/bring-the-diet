# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **pnpm monorepo** for a food/nutrition/diet platform called "Bring the Diet" (package scope: `@bringthediet/*`). Includes a Next.js web app, Expo mobile app, and shared packages. The API server (Express + MongoDB) is referenced but lives outside this repo.

## Commands

```bash
pnpm i                      # Install all workspace dependencies
pnpm dev                    # Run all apps in parallel (web on :3001)
pnpm build                  # Build all packages
pnpm lint                   # Lint all packages (ESLint via Next.js)
pnpm typecheck              # TypeScript check across monorepo

# Per-workspace commands
pnpm -C web dev             # Web only
pnpm -C mobile dev          # Mobile only (Expo)
pnpm -C web lint            # Lint web only
pnpm -C web typecheck       # Typecheck web only
```

## Architecture

### Monorepo Layout

- **`web/`** — Next.js 15 (App Router), React 19, port 3001, standalone output for Azure deployment
- **`mobile/`** — Expo 52, React Native 0.76, expo-router with tab navigation
- **`packages/shared/`** (`@bringthediet/shared`) — TypeScript types (`ApiUser`, `UserRole`, `ID`), constants (`DIET_TYPES`), Zod validation schemas
- **`packages/ui/`** (`@bringthediet/ui`) — Minimal React primitives (`Shell`, `Pill`)

### Web App Routing (`web/app/`)

Uses Next.js App Router with route groups:

- **`(public)/`** — User-facing pages with `TabNav` layout. Routes: home, recipes (CRUD), diets, meal-plans, foods, blog (with `[slug]`), favorites, progress, profile, about
- **`admin/`** — Admin console with `AdminSideNav`. CRUD shells for recipes, foods, nutrition-facts, diets, blog-posts, comments, users, roles (not yet wired to API)

### Key Web Modules (`web/`)

- **`components/ClientProviders.tsx`** — Wraps app with Redux Provider + ThemeSync + MsalAuthProvider (lazy, SSR-disabled)
- **`lib/msalConfig.ts` / `lib/useAuth.ts`** — Azure AD MSAL authentication. Dev escape hatch: `ALLOW_DEV_USER_HEADER=true` with `X-Dev-User` header
- **`lib/store.ts` / `lib/themeSlice.ts`** — Redux store (currently just theme: light/dark)
- **`lib/fetchWithAuth.ts`** — Fetch wrapper that attaches bearer token
- **`app/globals.css`** — CSS custom properties for theming (`var(--page-bg)`, `var(--card-bg)`, etc.)

### Styling Approach

Components use **inline styles** with `React.CSSProperties` objects + **CSS custom properties** for theme-aware colors. Some components embed `<style>` tags for complex layouts (carousels, responsive). No Tailwind classes in components despite Tailwind being available.

### Data Fetching

Client-side fetch to API at `NEXT_PUBLIC_API_URL` (default `http://localhost:5050`). Uses raw `fetch` with `AbortController` timeouts — no React Query or SWR.

### API Endpoints (external server)

All under `/api`: foods, nutrition-facts, recipes, recipes/:id/publish, diets, blog-posts, blog-posts/:id/publish, meal-plans. Each supports list/get/create/update/soft-delete.

## Environment Variables

See `.env.example`. Key vars: `MONGO_URI`, `DB_NAME`, collection names, `OIDC_AUTHORITY`, `OIDC_AUDIENCE`, `ALLOW_DEV_USER_HEADER`, `NEXT_PUBLIC_API_URL`.

## Deployment

Azure Web App via GitHub Actions (`.github/workflows/dev_bring-the-diet-dev.yml`). Builds with pnpm, dereferences symlinks with `cp -rL`, deploys `.next/standalone`. Startup command: `node web/server.js`. Targets Node 24.x.

## Package Manager

**pnpm 10.28.0** is required (`packageManager` field in root `package.json`). Workspace config in `pnpm-workspace.yaml`.
