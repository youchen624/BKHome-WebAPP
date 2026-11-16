# --- 階段 1：編譯所有 Workspace (Builder) ---
FROM node:22-slim AS builder

# 啟用 corepack 以支援 pnpm (若使用 npm workspaces 可移除此行)
RUN corepack enable

WORKDIR /app

# 1. 先複製所有設定檔以最大化 Docker Layer 快取
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/core/package.json ./packages/core/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

# 2. 複製原始碼並依相依順序編譯
COPY packages/core ./packages/core
COPY apps/api ./apps/api
COPY apps/web ./apps/web

RUN pnpm --filter @bkhome/core build
RUN pnpm --filter @bkhome/web build
RUN pnpm --filter @bkhome/api build

# --- 階段 2：正式運行階段 (Runner) ---
FROM node:22-slim AS runner

RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production

# 僅複製正式運行所需的 package 設定並安裝 production 套件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --prod --frozen-lockfile

# 從 builder 階段複製編譯產物 (core 的 dist、api 的 dist、web 的靜態網頁 dist)
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/dist ./apps/web/dist

USER node
EXPOSE 3000

CMD ["node", "apps/api/dist/server.js"]