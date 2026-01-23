# -------- Stage 1: Build --------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma
RUN pnpm i --frozen-lockfile

COPY . .

# Environment variables for build
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/dummydb"
ENV PUSHER_APP_ID=build_placeholder
ENV PUSHER_KEY=build_placeholder
ENV PUSHER_SECRET=build_placeholder
ENV PUSHER_CLUSTER=ap1
ENV NEXT_TELEMETRY_DISABLED=1

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


# -------- Stage 2: Migrator (for database migrations) --------
FROM node:20-alpine AS migrator
RUN npm install -g pnpm
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
# COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/tsconfig.json ./tsconfig.json

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
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["server.js"]

