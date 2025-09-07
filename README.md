# Orion Labs Website

This is the official repository for the Orion Labs personal brand website, a modern, responsive web application built with Vue 3 and Vite.

## Tech Stack

### Frontend

- **Framework**: Vue 3
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Framework**: Bootstrap 5
- **Routing**: Vue Router
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Markdown Rendering**: Marked, DOMPurify, highlight.js

### Backend Integration

- **API Ready**: 可整合任何後端服務
- **Mock Support**: 內建 MSW 模擬 API 支援

### Testing

- **Unit/Integration**: Vitest
- **E2E**: Playwright
- **Mocking**: Mock Service Worker (MSW)

### Linting & Formatting

- **Linting**: ESLint
- **Type Checking**: vue-tsc

### DevOps & Deployment

- **Containerization**: Docker
- **Web Server/Proxy**: Nginx
- **CI/CD**: GitHub Actions

## Project Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v22.x or later)
- [Yarn](https://yarnpkg.com/) (v1.22.x or later) **← 本專案統一使用 Yarn**

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/your-username/orionlabs-website.git
    cd orionlabs-website
    ```

2.  Install dependencies using Yarn:
    ```sh
    yarn install
    ```

3.  設置環境配置（可選）:
    ```sh
    # 複製並編輯環境配置
    cp .env.example .env.local
    # 根據需要修改 .env.local 中的配置
    ```

### 🔧 環境配置說明

本專案使用不同的環境配置文件來支援多種開發模式：

- **`.env.development`**: 預設開發模式配置（純前端開發）
- **`.env.local`**: 本地全端開發配置（前端+本地後端）
- **`.env.remote`**: 遠程後端開發配置（前端+線上後端）
- **`.env.example`**: 配置範本文件
- **`.env.production`**: 生產環境配置

#### 配置特點
- **自動代理切換**：根據模式自動配置API代理
- **智能端口檢測**：自動尋找可用端口避免衝突
- **環境隔離**：每種模式使用獨立的配置避免干擾

> **⚠️ 重要提醒：本專案統一使用 Yarn 包管理工具**
> 
> - ✅ 請使用：`yarn install`、`yarn add package-name`、`yarn remove package-name`
> - ❌ 請勿使用：`npm install`、`npm add`、`pnpm install` 等其他包管理工具
> - 📝 原因：避免不同鎖定檔案（yarn.lock vs package-lock.json）衝突，保持依賴版本一致性

## Available Scripts

### Development Modes

OrionLabs 提供三種不同的開發模式，滿足不同的開發需求：

#### 🎯 模式 1：純前端開發 (預設)
```bash
yarn dev
```
- **用途**：純前端 UI/UX 開發
- **後端**：使用已部署的線上後端 API
- **適合**：前端界面開發、樣式調整、組件開發
- **配置**：使用 `.env.development`

#### 🔧 模式 2：本地全端開發
```bash
yarn dev:local
```
- **用途**：全端功能開發和調試
- **後端**：自動啟動本地後端服務
- **適合**：API 開發、全端功能測試、後端調試
- **配置**：使用 `.env.local`
- **要求**：需要後端專案位於 `../Orionlabs-backend`
- **特點**：自動檢測並啟動後端，包含健康檢查和日誌輸出

#### 🌐 模式 3：前端 + 遠程後端
```bash
yarn dev:remote
```
- **用途**：前端開發但使用線上後端
- **後端**：連接到部署的生產後端
- **適合**：前端功能驗證、生產環境測試
- **配置**：使用 `.env.remote`

#### 🚀 性能優化模式
```bash
yarn dev:performance
```
- **用途**：性能測試和優化
- **特點**：啟用性能監控和優化功能

### 🎉 快速開始

選擇適合你的開發模式：

```bash
# 純前端開發（使用線上API）- 推薦新手
yarn dev

# 本地全端開發（自動啟動後端）- 推薦API開發
yarn dev:local

# 前端+遠程API開發 - 推薦功能驗證
yarn dev:remote
```

### 📋 模式詳細說明

| 模式 | 命令 | 用途 | 後端來源 | 適合場景 |
|------|------|------|----------|----------|
| 🎯 純前端 | `yarn dev` | UI/UX開發 | 線上API | 界面開發、樣式調整 |
| 🔧 本地全端 | `yarn dev:local` | 全端開發 | 本地啟動 | API開發、後端調試 |
| 🌐 遠程後端 | `yarn dev:remote` | 前端驗證 | 線上API | 功能驗證、測試 |
| 🚀 性能模式 | `yarn dev:performance` | 性能測試 | 線上API | 性能優化、監控 |

### Other Development Scripts

-   **`yarn preview`**: Builds the project and serves it locally for previewing the production build.

### Building

-   **`yarn build`**: Type-checks and builds the application for production.

### Testing

-   **`yarn test`**: Runs all unit and integration tests using Vitest.
-   **`yarn test:coverage`**: Runs tests and generates a coverage report.
-   **`yarn test:e2e`**: Runs all end-to-end tests using Playwright.
-   **`yarn test:e2e:ui`**: Runs end-to-end tests with the Playwright UI.

### Linting

-   **`yarn lint`**: Lints and automatically fixes code style issues.
-   **`yarn lint:bem`**: Validates BEM naming conventions in the CSS.

### Performance

-   **`yarn performance:test`**: Runs performance analysis and optimization checks.
-   **`yarn performance:audit`**: Builds the project and runs a comprehensive performance audit.

## Project Structure

```
/
├─── .github/         # GitHub Actions workflows
├─── scripts/         # Various build and utility scripts
├─── src/             # Main application source code
│   ├─── assets/      # Static assets (images, styles)
│   ├─── components/   # Reusable Vue components
│   ├─── composables/  # Vue 3 composables
│   ├─── router/       # Vue Router configuration
│   ├─── stores/       # Pinia state management stores
│   ├─── views/        # Page components
│   └─── main.ts       # Application entry point
├─── tests/           # Test files
│   ├─── e2e/          # Playwright E2E tests
│   └─── unit/         # Vitest unit tests
├─── Dockerfile       # Container definition for the application
├─── vite.config.ts   # Vite configuration
└─── package.json     # Project dependencies and scripts
```

## IDE Setup

-   [VSCode](https://code.visualstudio.com/)
-   [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (formerly Volar)
-   Disable the built-in TypeScript extension in favor of the Vue plugin for better performance with `.vue` files.
