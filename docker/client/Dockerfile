# ── Stage 1: Build Vite Client Assets ──────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY client/package*.json ./
RUN npm ci || npm install

COPY client .
ARG VITE_API_URL=/api
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

RUN npm run build

# ── Stage 2: Serve Built Assets via Nginx Production Server ───────────────────
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]