import { createApp } from "vue";
import { createPinia } from "pinia";

// Bootstrap 5 導入（優化版本）
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./assets/css/bootstrap-custom.css"; // 自定義覆蓋
import "./assets/scss/bootstrap-custom.js"; // 按需載入 JS 組件

import App from "./App.vue";
import router from "./router";

// === Orion 統一 CSS 架構系統 (Phase 5 UI/UX 優化) ===
// Google Material Design 3 標準 + 8px 網格系統
// 遵循 D-style 規範：@layer 管理層級，降低 !important 使用

// 1. 間距系統（新增：統一 8px 網格）
import "./assets/css/spacing-system.css"; // 🎯 統一間距系統

// 2. 響應式系統（新增：Google MD3 斷點）
import "./assets/css/responsive-system.css"; // 📱 RWD 系統

// 3. CSS 層級系統（最優先載入，管理特異性）
import "./assets/css/orion-layer-system.css"; // 🎯 CSS Layer 架構系統

// 4. 主題系統（使用基礎主題文件）
import "./assets/theme.css"; // 🎯 Orion 主題系統

// 5. 關鍵 CSS 檔案（無法合併）
import "./assets/utilities.css"; // 🛠️ 工具類
import "./assets/css/contrast-enhancements.css"; // 🎯 WCAG 對比度增強

// 6. 向後相容支持（逐步深度 Deprecated）
import "./assets/global.css"; // ⚠️ 向後相容，將逐步移除
import "./assets/css/bootstrap-overrides.css"; // 🎯 Bootstrap 覆蓋（@layer overrides）

// 7. 管理後台深色模式修復
import "./assets/css/admin-dark-mode-fix.css"; // 🎯 管理後台深色模式修復

// === 主題驗證工具 (開發環境) ===
import { runThemeConsistencyCheck } from "./utils/themeValidator";

console.log("main.ts loaded with optimized CSS architecture (Phase 4)");

const app = createApp(App);

app.use(createPinia());
app.use(router);

// 掛載應用
app.mount("#app");

// === 主題一致性檢查 (開發環境限定) ===
if (import.meta.env.DEV) {
  // 確保 DOM 完全載入後才執行檢查
  setTimeout(() => {
    runThemeConsistencyCheck();
  }, 100);
}

console.log("Vue app mounted with Phase 4 CSS optimization");
