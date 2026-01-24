# -------- Stage 1: Build --------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma
RUN pnpm i --frozen-lockfile

# Stage for running migrations/seeds
FROM node:20-alpine AS migrator
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build
ENV PUSHER_APP_ID=build_placeholder
ENV PUSHER_KEY=build_placeholder
ENV PUSHER_SECRET=build_placeholder
ENV PUSHER_CLUSTER=ap1
ENV NEXT_TELEMETRY_DISABLED=1

# Capture build args
ARG NEXT_PUBLIC_PUSHER_KEY
ARG NEXT_PUBLIC_PUSHER_CLUSTER
ARG NEXT_PUBLIC_SOKETI_HOST
ARG NEXT_PUBLIC_SOKETI_PORT
ARG NEXT_PUBLIC_SOKETI_TLS

# Persist args as env vars for the build process
ENV NEXT_PUBLIC_PUSHER_KEY=$NEXT_PUBLIC_PUSHER_KEY
ENV NEXT_PUBLIC_PUSHER_CLUSTER=$NEXT_PUBLIC_PUSHER_CLUSTER
ENV NEXT_PUBLIC_SOKETI_HOST=$NEXT_PUBLIC_SOKETI_HOST
ENV NEXT_PUBLIC_SOKETI_PORT=$NEXT_PUBLIC_SOKETI_PORT
ENV NEXT_PUBLIC_SOKETI_TLS=$NEXT_PUBLIC_SOKETI_TLS

# Generate prisma client and build nextjs
RUN pnpm prisma generate
RUN pnpm build

# -------- Stage 3: Runtime --------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy necessary files from builder
# Copy public folder
COPY --from=builder /app/public ./public
# Copy standalone output (includes node_modules and server.js)
COPY --from=builder /app/.next/standalone ./
# Copy static files to the correct location
COPY --from=builder /app/.next/static ./.next/static
# Copy prisma schema in case it's needed for runtime verification or migrations
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "server.js"]