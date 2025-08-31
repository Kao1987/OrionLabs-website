import { createApp } from "vue";
import { createPinia } from "pinia";

// === Critical CSS (內聯) ===
// 關鍵樣式直接內聯，確保首屏快速渲染
import "./assets/css/critical.css";

// === Orion CSS 架構系統 (Phase 4 + Critical CSS 優化) ===
import "./assets/css/orion-layer-system.css"; // CSS Layer 架構
import "./assets/css/orion-consolidated-theme.css"; // 統一主題系統

import App from "./App.vue";
import router from "./router";

// === 主題驗證工具 (開發環境) ===
import { runThemeConsistencyCheck } from "./utils/themeValidator";

console.log("main.ts loaded with Critical CSS optimization");

const app = createApp(App);

app.use(createPinia());
app.use(router);

// === 延遲載入非關鍵 CSS ===
// 使用動態匯入延遲載入非關鍵樣式，避免阻塞首屏
function loadNonCriticalCSS() {
  // Bootstrap (延遲載入)
  const bootstrapLink = document.createElement('link');
  bootstrapLink.rel = 'stylesheet';
  bootstrapLink.href = '/node_modules/bootstrap/dist/css/bootstrap.min.css';
  bootstrapLink.media = 'print';
  bootstrapLink.onload = () => {
    bootstrapLink.media = 'all';
  };
  document.head.appendChild(bootstrapLink);
  
  // Bootstrap Icons (延遲載入)
  const iconsLink = document.createElement('link');
  iconsLink.rel = 'stylesheet'; 
  iconsLink.href = '/node_modules/bootstrap-icons/font/bootstrap-icons.css';
  iconsLink.media = 'print';
  iconsLink.onload = () => {
    iconsLink.media = 'all';
  };
  document.head.appendChild(iconsLink);
  
  // Bootstrap 自定義覆蓋
  import("./assets/css/bootstrap-custom.css");
  
  // 其他非關鍵 CSS
  import("./assets/utilities.css");
  import("./assets/css/contrast-enhancements.css");
  import("./assets/global.css");
}

// === Bootstrap JavaScript 按需載入 ===
async function loadBootstrapJS() {
  const { default: bootstrapModule } = await import("./assets/scss/bootstrap-custom");
}

// 掛載應用
app.mount("#app");

// === 優化載入序列 ===
// 1. 首屏關鍵內容已通過 Critical CSS 優化
// 2. 延遲載入非關鍵資源
requestIdleCallback(() => {
  loadNonCriticalCSS();
  loadBootstrapJS();
}, { timeout: 100 });

// === 主題一致性檢查 (開發環境限定) ===
if (import.meta.env.DEV) {
  setTimeout(() => {
    runThemeConsistencyCheck();
  }, 200);
}

console.log("Vue app mounted with Critical CSS and performance optimization");
