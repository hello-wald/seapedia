# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@9
WORKDIR /app

FROM base AS builder
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @seapedia/shared build \
	&& pnpm --filter api exec prisma generate \
	&& pnpm --filter api build

FROM node:24-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@9
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app /app

CMD ["node", "apps/api/dist/main.js"]
