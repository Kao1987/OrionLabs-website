# 🤖 AI 助理專案規則 (AI Assistant Project Rules)

**首要指令：** 在開始任何任務之前，你**必須**先閱讀並理解根目錄下的 `index.instructions.md` 檔案中的核心規範。本檔案 (`AI-README.md`) 提供技術細節，而 `index.instructions.md` 提供更高層次的指導原則。

---

## 1. 專案概述 (Project Overview)

*   **專案名稱：** `OrionLabs 個人品牌網站`
*   **專案目標：** `建立專業的個人品牌網站，展示前端開發與UI/UX設計作品集、技術部落格和專業聯絡方式`
*   **技術棧 (Tech Stack):**
    *   **前端 (Frontend):**
        *   框架/函式庫: `Vue 3.3.4 (Composition API)`
        *   語言: `TypeScript 5.8, JavaScript ES2023`
        *   路由: `Vue Router 4.2.5`
        *   狀態管理: `Pinia 3.0.1`
    *   **樣式系統 (Styling):**
        *   CSS 框架: `Bootstrap 5 + Bootstrap Icons`
        *   CSS 架構: `BEM + @layer 系統 + CSS Variables`
        *   主題系統: `深色/淺色模式 + WCAG 2.1 AA`
        *   響應式: `Mobile-First + Container Queries`
    *   **開發工具 (Development):**
        *   建構工具: `Vite 6.2.4`
        *   測試框架: `Vitest + Playwright (E2E)`
        *   代碼檢查: `ESLint 9 + TypeScript`
        *   CSS工具: `PostCSS + Autoprefixer + CSSnano`
    *   **部署 (Deployment):**
        *   容器化: `Docker + Nginx`
        *   CI/CD: `GitHub Actions v4`
        *   監控: `性能監控 + BEM驗證`

---

## 2. 環境設定 (Environment Setup)

*   **環境變數檔案：**
    *   範本檔案：`.env.example`
    *   開發設定檔：`.env.development`
    *   本地設定檔：`.env.local`
    *   **必要環境變數：**
        *   `VITE_PROXY_API_TARGET` - 開發環境API代理目標 (預設: http://localhost:8000)
        *   `VITE_PROXY_CONTACT_TARGET` - 聯絡表單API代理 (預設: http://localhost:3002)
        *   `VITE_API_URL` - 生產環境API端點
        *   `VITE_CONTACT_API_URL` - 生產環境聯絡API端點
    *   **可選環境變數：**
        *   `VITE_ENABLE_ANALYTICS` - Google Analytics開關
        *   `VITE_GOOGLE_ANALYTICS_ID` - GA追蹤ID
        *   `VITE_SENTRY_DSN` - 錯誤追蹤
*   **本地啟動指令：**
    *   前端開發：`yarn dev` 或 `npm run dev`
    *   完整棧開發：`yarn dev:fullstack`
    *   Docker部署：`docker-compose up --build`
*   **相依服務：** 無強制外部依賴，API代理為可選配置

---

## 3. 核心指令與禁止事項 (Core Directives & Prohibitions)

### ✅ **必須遵守 (Golden Rules)**

1.  **套件管理器 (Package Manager):**
    *   **本專案統一使用：** `yarn` (已有 yarn.lock)
    *   **安裝依賴指令：** `yarn install`
    *   **新增依賴指令：** `yarn add package-name`
    *   **新增開發依賴指令：** `yarn add -D package-name`
    *   **移除依賴指令：** `yarn remove package-name`
    *   **禁止使用：** npm、pnpm (避免鎖定檔案衝突)

2.  **程式碼風格與檢查 (Linting & Formatting):**
    *   **ESLint檢查：** `yarn lint` (自動修復)
    *   **TypeScript檢查：** `yarn type-check`
    *   **BEM驗證：** `yarn validate:bem`
    *   **主題驗證：** `yarn validate:theme`
    *   **重要：** 在提交前必須通過所有檢查，包括型別檢查和BEM規範驗證

3.  **測試 (Testing):**
    *   **單元測試：** `yarn test` 或 `yarn test:run`
    *   **E2E測試：** `yarn test:e2e`
    *   **覆蓋率測試：** `yarn test:coverage`
    *   **API測試：** `yarn test:api`
    *   **深色模式測試：** `yarn test:dark-mode`
    *   **三輪穩定性測試：** `yarn test:tri-run`
    *   **重要：** 新功能必須包含單元測試和E2E測試，並達到85%以上覆蓋率

### ❌ **絕對禁止 (Strict Prohibitions)**

1.  **禁止混用套件管理器。**
2.  **禁止直接安裝未經許可的第三方庫。**
3.  **禁止提交任何包含 API Keys、密碼或敏感資訊的程式碼。**
4.  **禁止直接推送 (push) 到 `main` 或 `master` 分支。**
5.  **禁止忽略測試失敗或 Linter 報錯。**

---

## 4. 架構與設計原則 (Architecture & Design Principles)

*   **核心設計模式：** `SOLID + DRY + KISS 原則，組件化設計，單一職責`
*   **架構風格：** 
    *   前端：`Composition API + Pinia Store + Vue Router`
    *   CSS：`BEM命名 + @layer層級管理 + CSS Variables主題系統`
    *   測試：`單元測試 + E2E測試 + 性能監控`
*   **技術選型理念：** 
    *   `Vue 3` - 優秀的TypeScript支援和Composition API
    *   `Pinia` - 簡潔的狀態管理，優於Vuex
    *   `Vite` - 極速開發體驗和優化的生產構建
    *   `Bootstrap 5` - 成熟的響應式框架，結合自定義BEM系統
    *   `Playwright` - 可靠的跨瀏覽器E2E測試

---

## 5. 開發與交付流程 (Development & Delivery Workflow)

*   **分支命名規則：** `feature/功能描述`, `fix/錯誤修復`, `refactor/重構描述`
*   **Commit 訊息格式：** 
    *   `feat: 新增功能描述`
    *   `fix: 修復問題描述`
    *   `refactor: 重構描述`
    *   `style: CSS/UI調整`
    *   `test: 測試相關`
    *   `docs: 文件更新`
*   **代碼審查要求：**
    *   所有TypeScript編譯必須通過
    *   ESLint和BEM驗證必須通過
    *   測試覆蓋率不得低於當前水準
    *   性能指標不得退化
*   **CI/CD 流程：** GitHub Actions自動執行 `lint → type-check → test → build → e2e`，全部通過才可部署

---

## 6. 安全規範 (Security)

*   **依賴掃描指令：** `yarn audit`
*   **漏洞處理流程：** 發現High等級以上漏洞立即修復，Critical漏洞阻止部署
*   **資料處理原則：** 
    *   禁止在前端日誌記錄任何PII或敏感資訊
    *   所有API請求使用HTTPS
    *   環境變數不得包含生產環境密鑰
    *   使用DOMPurify防護XSS攻擊

---

## 7. 其他注意事項 (Other Notes)

*   **檔案管理：** 廢棄檔案移至 `deprecated_files/` 資料夾，不直接刪除
*   **CSS架構：** 必須遵循BEM命名規範和@layer層級管理系統
*   **TypeScript規範：** 禁止使用 `any` 型別，優先使用嚴格型別定義
*   **性能要求：** 首屏渲染 < 1s，Lighthouse分數 > 90分
*   **可訪問性：** 必須符合WCAG 2.1 AA標準

---
*本文件最後更新於：`2025-08-30`*
*由Google資深PM Claude分析整理，基於專案當前架構狀態*
2025年 8月31日 週日 08時58分21秒 CST: Trigger deployment test
