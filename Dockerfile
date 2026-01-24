# -------- Stage 1: Build --------
FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma
RUN pnpm i --frozen-lockfile

COPY . .

# Environment variables for build
ENV PUSHER_APP_ID=build_placeholder
ENV PUSHER_KEY=build_placeholder
ENV PUSHER_SECRET=build_placeholder
ENV PUSHER_CLUSTER=ap1
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/dummydb"

ARG NEXT_PUBLIC_PUSHER_KEY
ARG NEXT_PUBLIC_PUSHER_CLUSTER
ARG NEXT_PUBLIC_SOKETI_HOST
ARG NEXT_PUBLIC_SOKETI_PORT
ARG NEXT_PUBLIC_SOKETI_TLS

ENV NEXT_PUBLIC_PUSHER_KEY=$NEXT_PUBLIC_PUSHER_KEY
ENV NEXT_PUBLIC_PUSHER_CLUSTER=$NEXT_PUBLIC_PUSHER_CLUSTER
ENV NEXT_PUBLIC_SOKETI_HOST=$NEXT_PUBLIC_SOKETI_HOST
ENV NEXT_PUBLIC_SOKETI_PORT=$NEXT_PUBLIC_SOKETI_PORT
ENV NEXT_PUBLIC_SOKETI_TLS=$NEXT_PUBLIC_SOKETI_TLS

RUN pnpm prisma generate
RUN pnpm build
RUN ls -la .next && ls -la .next/standalone


# -------- Stage 2: Runtime --------
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:/app/node_modules/.bin:$PATH"

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy only what standalone needs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma schema and config (for migration and seeder)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Install CLI tools and regenerate Prisma client for runtime
RUN pnpm add prisma@6.19.2 tsx dotenv @prisma/client@6.19.2 @prisma/adapter-pg pg \
    && pnpm prisma generate

EXPOSE 3000

CMD ["node" , "server.js"]