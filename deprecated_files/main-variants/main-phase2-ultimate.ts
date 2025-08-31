import { createApp } from "vue";
import { createPinia } from "pinia";

// === PHASE 2.1 終極關鍵路徑優化 ===
// 內聯最小關鍵 CSS (< 1KB)
const injectCriticalCSS = () => {
  if (document.querySelector('#critical')) return;

  const s = document.createElement('style');
  s.id = 'critical';
  s.textContent = `*{box-sizing:border-box;margin:0;padding:0}body{font:400 1rem/1.5 system-ui,sans-serif;color:#1c1917;background:#fff}:root{--p:#002fa7;--t:#1c1917;--b:#fff;--g:#e2e8f0}.container{max-width:1200px;margin:0 auto;padding:0 1rem}.btn{display:inline-flex;align-items:center;padding:.75rem 1.5rem;border:0;border-radius:6px;font:inherit;cursor:pointer;text-decoration:none}.btn-primary{background:var(--p);color:#fff}.navbar{display:flex;align-items:center;justify-content:space-between;padding:1rem 0}.nav-link{color:var(--t);text-decoration:none;padding:.5rem 1rem}.loading{display:flex;justify-content:center;align-items:center;min-height:200px}`;
  document.head.appendChild(s);
};

// 立即注入
injectCriticalCSS();

import App from "./App.vue";
import router from "./router";

// 應用建立 (最高優先級)
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");

// 延遲載入非關鍵資源
const defer = (fn: () => void, delay = 0) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(fn, { timeout: delay + 50 });
  } else {
    setTimeout(fn, delay);
  }
};

// 極晚載入完整 CSS (200ms 後)
defer(() => {
  import("./assets/css/phase2-ultimate.css").catch(() => {});
}, 200);
