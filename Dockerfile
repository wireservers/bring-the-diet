FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json web/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile

FROM base AS build
ARG NEXT_PUBLIC_API_URL=http://food-api:5000
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3001
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/web/node_modules ./web/node_modules
COPY --from=deps /app/packages ./packages
COPY . .
RUN mkdir -p web && rm -f web/.env && printf "NEXT_PUBLIC_API_URL=%s\nNEXT_PUBLIC_SITE_URL=%s\n" "$NEXT_PUBLIC_API_URL" "$NEXT_PUBLIC_SITE_URL" > web/.env
RUN pnpm build

FROM node:24-alpine AS runtime
WORKDIR /app
COPY --from=build /app/web/.next/standalone ./
COPY --from=build /app/web/.next/static ./web/.next/static
COPY --from=build /app/web/public ./web/public
EXPOSE 3001
ENV PORT=3001
CMD ["node", "web/server.js"]
