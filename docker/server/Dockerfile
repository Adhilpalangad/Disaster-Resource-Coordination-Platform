# ── Stage 1: Build TypeScript Server ──────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY server/package*.json ./
RUN npm ci || npm install

COPY server .
RUN npm run build

# ── Stage 2: Production Runtime Image ─────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY server/package*.json ./
RUN npm ci --only=production || npm install --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]