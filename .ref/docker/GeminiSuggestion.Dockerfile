# Wrote By Gemini 4 Hydrogen
# --- 階段 1：編譯階段 (Builder) ---
FROM node:22-alpine AS builder

WORKDIR /app

# 先複製 package.json 利用 Docker Layer 快取機制
COPY package*.json ./
RUN npm ci

# 複製原始碼並編譯 TypeScript -> JavaScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- 階段 2：正式運行階段 (Production) ---
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# 僅安裝 production 相依套件
COPY package*.json ./
RUN npm ci --omit=dev

# 從編譯階段複製產出的 dist 目錄
COPY --from=builder /app/dist ./dist

# 切換為非 root 使用者提升安全性
USER node

EXPOSE 3000
CMD ["npm", "start"]
