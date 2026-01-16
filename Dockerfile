# -------- Stage 1: Build --------
FROM node:20-alpine AS builder
RUN npm install -g pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ARG PUSHER_APP_ID
ARG PUSHER_KEY
ARG PUSHER_SECRET
ARG PUSHER_CLUSTER
ARG DATABASE_URL

ENV PUSHER_APP_ID=$PUSHER_APP_ID
ENV PUSHER_KEY=$PUSHER_KEY
ENV PUSHER_SECRET=$PUSHER_SECRET
ENV PUSHER_CLUSTER=$PUSHER_CLUSTER
ENV DATABASE_URL=$DATABASE_URL

RUN pnpm prisma generate
RUN pnpm build
RUN ls -la .next && ls -la .next/standalone


# -------- Stage 2: Migrator (for database migrations) --------
FROM node:20-alpine AS migrator
RUN npm install -g pnpm
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

CMD ["pnpm", "prisma", "migrate", "deploy"]


# -------- Stage 3: Runtime --------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only what standalone needs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["server.js"]

