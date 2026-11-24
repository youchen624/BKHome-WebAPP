# Stage 1 : Build
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/core/package.json ./packages/core/

# 1. Install environment & Library
RUN npm ci

# 2. Copy
COPY tsconfig*.json ./
COPY packages/core ./packages/core
COPY apps/api ./apps/api
COPY apps/web ./apps/web

# 3. Compile core -> api -> web
RUN npm run build

# Stage 2 : Production
FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

# 1. Copy all package.json , and only install the packages which is required
COPY package*.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/core/package.json ./packages/core/

RUN npm ci --omit=dev

# 2. Copy from dist that compiled part
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/apps/api/drizzle ./apps/api/drizzle

# Normal User (Un-SUDO)
USER node

EXPOSE 3000
CMD ["node", "apps/api/dist/server.js"]
# CMD ["npm", "start"]

# Health Check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

