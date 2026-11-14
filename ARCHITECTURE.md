# bkhome 專案架構與目錄規範 (ARCHITECTURE.md)

本專案採用 **模組化單體 (Modular Monolith)** 與 **Polyglot Monorepo** 混合架構設計：

- **邏輯與程式結構嚴格分離**：透過 Workspace 隔離核心邏輯、後端介面、前端表現與跨語言服務。
- **部署依需求彈性組裝**：開發與初期自架合併為單一應用容器，未來隨規模無痛拆分為獨立容器。

---

## 1. 完整專案目錄樹 (空白骨架)

```text
bkhome/
├── apps/                           # 【主要應用層】(TypeScript / Node.js 生態，獨立運行單位)
│   ├── api/                        # 後端伺服器 (API Gateway + 資料庫存取 + 認證)
│   │   ├── src/
│   │   │   ├── modules/            # 依「業務功能」垂直切分 (每個新功能建一個資料夾)
│   │   │   │   └── <feature>/      # 例如: auth/, chat/, drive/
│   │   │   │       ├── <feature>.route.ts       # 路由層：接收 HTTP/WS、參數驗證、呼叫邏輯
│   │   │   │       └── <feature>.repository.ts  # 倉儲層：專責該功能的資料庫 SQL 讀寫
│   │   │   ├── shared/             # 跨功能共用的底層基礎設施
│   │   │   │   ├── db.ts           # 資料庫連線池實例
│   │   │   │   └── middleware/     # 認證攔截、錯誤處理、日誌中介軟體
│   │   │   └── server.ts           # 伺服器啟動入口 (組裝所有模組路由並監聽 Port)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                        # 前端網頁介面 (SPA / WebOS 桌面環境)
│       ├── src/
│       │   ├── features/           # 對應後端的功能 UI 模組
│       │   │   └── <feature>/      # 該功能的畫面元件、狀態管理
│       │   ├── shared/             # 共用 UI 元件、視窗框架、樣式
│       │   └── lib/
│       │       └── api-client.ts   # 統一封裝對 apps/api 的 HTTP / WS 請求
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                       # 【TS 共用套件層】(僅供 apps/* 引用，不獨立啟動)
│   ├── core/                       # 純邏輯核心：業務規則、狀態機、演算法、資料結構
│   │   ├── src/
│   │   │   ├── <feature>/          # 對應各功能的純邏輯與 Schema 定義
│   │   │   └── index.ts            # 統一匯出入口
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── contracts/                  # (擴充預留) 跨語言共用的資料契約 (JSON Schema / Protobuf)
│
├── services/                       # 【多語言獨立服務層】(非 TS 模組，各自擁有獨立編譯環境)
│   └── <service-name>/             # 例如: media-engine (C++), worker (Python)
│       ├── src/
│       └── Dockerfile              # 獨立服務專屬的建置檔
│
├── database/                       # 資料庫結構定義 (純文字版本控制)
│   └── init.sql                    # 初始建表與索引腳本
│
├── data/                           # 【本機資料掛載區】(務必加入 .gitignore)
│   └── db/                         # 映射資料庫容器內部的實際儲存檔案
│
├── package.json                    # 根目錄 Workspace 定義 (管理 apps/* 與 packages/*)
├── tsconfig.base.json              # 全域共用的 TypeScript 編譯基礎設定
├── Dockerfile                      # TS 生態系統一建置檔 (涵蓋 core, api, web)
├── docker-compose.yml              # 系統總編排 (組裝程式容器、資料庫容器與網路)
└── ARCHITECTURE.md                 # 本架構說明檔
```

---

## 2. 層級職責與依賴紅線

寫程式時，請嚴格遵守以下「單向依賴」原則，避免架構腐化：

| 層級目錄 | 核心職責 | 允許依賴 (Import) | 絕對禁止事項 |
| :--- | :--- | :--- | :--- |
| **`packages/core`** | 業務規則、資料驗證 Schema (Zod)、型別定義、純演算法。 | 純 TS 語法、無環境依賴的工具庫。 | **禁止**引入 Express/Fastify、資料庫驅動、DOM 或任何 Node.js 系統底層 API。 |
| **`apps/api`** | 接收網路請求、權限驗證、資料庫交易、呼叫 `services/`。 | `packages/core`、Web 框架、DB 驅動。 | **禁止**在 `*.route.ts` 寫 SQL；**禁止**在 `*.repository.ts` 寫 HTTP 狀態碼判斷。 |
| **`apps/web`** | 畫面渲染、使用者互動、本地視窗與狀態管理。 | `packages/core` (僅限型別與 Schema)、前端框架。 | **禁止**直接連線資料庫；**禁止**包含機密金鑰。 |
| **`services/*`** | 高效能運算、硬體控制、AI 推論等獨立語言任務。 | 該語言自身生態系、`packages/contracts`。 | **禁止**直接被 `apps/web` 呼叫（一律透過 `apps/api` 轉發或經由佇列溝通）。 |

---

## 3. 新增一個功能的標準 SOP

當你要為平台開發第 $N$ 個新功能 `<feature>` 時，依序在三個地方建立檔案即可：

1. **定義規格 (`packages/core/src/<feature>/`)**
   - 撰寫資料結構型別、Zod 驗證規則與核心計算邏輯並匯出。
2. **實作後端 (`apps/api/src/modules/<feature>/`)**
   - 建立 `<feature>.repository.ts` 處理資料庫讀寫。
   - 建立 `<feature>.route.ts` 處理 API 路由與驗證，最後在 `server.ts` 掛載路由。
3. **實作前端 (`apps/web/src/features/<feature>/`)**
   - 引用 `core` 的型別，透過 `api-client.ts` 對接後端 API 並完成畫面。

---

## 4. 容器與部署命名規範

- **根目錄 `package.json` 關鍵設定：**

  ```json
  {
    "name": "bkhome",
    "private": true,
    "workspaces": ["apps/*", "packages/*"]
  }
  ```

- **Docker Container 命名標準（統一加上 `bkhome-` 前綴）：**
  - `bkhome-app`：初期合併打包的單一主應用容器（由 `api` 同時託管 `web` 靜態檔）。
  - `bkhome-api` / `bkhome-web`：未來高負載拆分後的獨立前後端容器。
  - `bkhome-db`：主資料庫容器（使用官方 Image，不寫進 Dockerfile）。
  - `bkhome-redis`：快取與跨語言任務佇列容器。
  - `bkhome-<service>`：位於 `services/` 底下的獨立語言微服務容器。

---

Suggested by AI(Gemini 4 Hydrogen)

Created at 2026 11/13
