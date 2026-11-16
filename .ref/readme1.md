<div align="center">
  <!-- 若 repo 內有 Logo，可將下方路徑替換為實際圖片位置 -->
  <img src="https://raw.githubusercontent.com/youchen624/BKHome-WebAPP/main/public/logo.svg" alt="BunkerHome Logo" width="110" />

  <h1>BunkerHome (BKHome-WebAPP)</h1>
  <p><strong>成員專屬整合型 Web 工作空間與中樞平台</strong></p>

  <!-- 狀態、權限與內嵌瀏覽人次 -->
  <p>
    <img src="https://img.shields.io/badge/Version-v0.1_Alpha-f59e0b?style=for-the-badge" alt="Version v0.1" />
    <img src="https://img.shields.io/badge/Access-Members_Only-dc2626?style=for-the-badge" alt="Members Only" />
    <img src="https://komarev.com/ghpvc/?username=youchen624-BKHome-WebAPP&label=VISITS&color=00acc1&style=for-the-badge" alt="Visits" />
    <img src="https://img.shields.io/github/last-commit/youchen624/BKHome-WebAPP?style=for-the-badge&color=334155" alt="Last Commit" />
  </p>

  <!-- 技術棧徽章 -->
  <p>
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white" alt="pnpm" />
  </p>
</div>

---

## 專案定位與存取說明

**BunkerHome** 為一整合型線上應用平台，目前採**封閉式運作（Members Only）**，僅供內部團隊與受邀成員使用，暫不對外公開註冊或提供免費開源部署。

* **服務入口**：`https://bkhome.cc`（需具備成員授權帳號方可登入）
* **技術架構**：採集中式前後端分離架構（React + Express），全棧使用 TypeScript 開發並透過 Zod 進行資料格式驗證，確保前後端通訊的準確性。

---

## v0.1 開發階段規劃

目前專案正處於 **v0.1 基礎建設期**，現階段不追求複雜的離線同步或高階架構，核心目標只有一個：**確保各項基礎功能「正常、穩定運作」**。

* [x] 專案基礎架構建立（Monorepo / TypeScript / Docker 部署流程）
* [ ] 成員身分驗證與權限控管（Authentication & Authorization）
* [ ] 核心互動與基礎模組功能實作（確保主要操作流程無致命錯誤）
* [ ] 伺服器端資料持久化與基本錯誤處理

> **系統預覽**
> （此處可放置目前 v0.1 開發版的登入頁或主介面截圖，例如 `![Preview](./docs/preview.png)`）

---

## 系統目錄結構

```text
BKHome-WebAPP/
├── apps/
│   ├── web/          # React + Vite 前端介面
│   └── api/          # Node.js + Express 後端 API 服務
├── packages/
│   └── shared/       # 前後端共用的 Zod Schemas 與 TypeScript 型別
├── docker-compose.yml
└── pnpm-workspace.yaml
```

---

## 開發者環境建置（僅限專案維護成員）

Building

<details>
<summary><strong>點擊展開：常用維護指令</strong></summary>

Building

</details>

---

## 版權聲明

Copyright © 2026 BunkerHome. All Rights Reserved.
本專案原始碼與相關資產僅供授權成員檢視與維護，未經許可禁止任意複製、散布或用於商業及公開用途。
