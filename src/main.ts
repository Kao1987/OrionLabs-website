import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Bootstrap 5 導入
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap'

import App from './App.vue'
import router from './router'

// === Orion 統一 CSS 架構系統 ===
// 遵循 D-style 規範：@layer 管理層級，降低 !important 使用
// 遵循 C-refactor 規範：統一載入順序，避免衝突

// 1. CSS 架構層級系統（最優先）
import './assets/css/orion-architecture.css'        // 🎯 CSS 層級架構與重置

// 2. 色彩適配器（解決 Vue/Bootstrap 衝突）
import './assets/css/color-adapter.css'            // 🔧 色彩系統適配器（向後相容）

// 3. 主題系統（已通過 @layer theme 載入）
import './assets/css/orion-unified-theme.css'      // 統一主題系統 (新) - 優先載入

// 4. 組件系統（已通過 @layer components 載入）
import './assets/css/orion-bem-system.css'         // 🎯 BEM-Lite 統一組件系統 - 替代硬編碼
import './assets/css/bem-components.css'           // 🎯 BEM-Lite 組件庫 - 替代硬編碼顏色

// 5. 工具類（已通過 @layer utilities 載入）
import './assets/utilities.css'                    // 🛠️ 工具類（已移除 !important）

// 6. 舊檔案適配（@deprecated - 將在 v3.0.0 移除）
import './assets/global.css'                       // ⚠️ 向後相容，建議遷移至新系統
import './assets/components.css'                   // ⚠️ 向後相容，建議遷移至 BEM 系統

// 7. 深色模式與對比度增強
import './assets/css/dark-theme-enhancement.css'   // 🌙 深色模式增強
import './assets/css/dark-mode-comprehensive-fix.css' // 🌙 深色模式全面修復
import './assets/css/contrast-enhancements.css'    // 🎯 WCAG 對比度增強

// 8. 頁面特定修復（將逐步移至組件內）
import './assets/color-optimizations.css'          // 🎨 色彩優化（@deprecated）
import './assets/css/page-theme-consistency.css'   // 📄 頁面配色統一（@deprecated）
import './assets/css/page-color-consistency.css'   // 🎨 頁面配色統一（@deprecated）

// 9. Bootstrap 覆蓋層（必要的 !important 使用）
import './assets/css/bootstrap-overrides.css'      // 🎯 Bootstrap 覆蓋（@layer overrides）
import './assets/css/page-theme-consistency.css'  // 📄 頁面配色統一修復
import './assets/css/page-color-consistency.css'  // 🎨 頁面配色統一修復

// === 主題驗證工具 (開發環境) ===
import { runThemeConsistencyCheck } from './utils/themeValidator'

console.log('main.ts loaded with all dependencies')

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 掛載應用
app.mount('#app')

// === 主題一致性檢查 (開發環境限定) ===
if (import.meta.env.DEV) {
  // 確保 DOM 完全載入後才執行檢查
  setTimeout(() => {
    runThemeConsistencyCheck()
  }, 100)
}

console.log('Vue app mounted with full setup')
