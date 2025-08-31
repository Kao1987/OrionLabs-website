import { createApp } from "vue";
import { createPinia } from "pinia";

// === PHASE 2 關鍵路徑最佳化 ===
// 1. 內聯關鍵 CSS (< 2KB)
const injectCriticalCSS = () => {
  if (document.querySelector('#critical-css')) return;

  const style = document.createElement('style');
  style.id = 'critical-css';
  style.textContent = `*{box-sizing:border-box;margin:0;padding:0}body{font:400 1rem/1.5 system-ui,sans-serif;color:#1c1917;background:#fff}:root{--primary:#002fa7;--primary-hover:#001a64;--text:#1c1917;--bg:#fff;--border:#e2e8f0}.container{max-width:1200px;margin:0 auto;padding:0 1rem}.btn{display:inline-flex;align-items:center;padding:0.75rem 1.5rem;border:0;border-radius:6px;font:inherit;cursor:pointer;text-decoration:none;transition:all 0.2s}.btn-primary{background:var(--primary);color:#fff}.navbar{display:flex;align-items:center;justify-content:space-between;padding:1rem 0}.nav-link{color:var(--text);text-decoration:none;padding:0.5rem 1rem}.loading{display:flex;justify-content:center;align-items:center;min-height:200px}`;
  document.head.appendChild(style);
};

// 2. 立即注入關鍵 CSS
injectCriticalCSS();

import App from "./App.vue";
import router from "./router";

// 3. 應用建立和掛載 (最高優先級)
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");

// 4. 延遲載入非關鍵資源
const loadNonCriticalCSS = () => {
  // 使用 requestIdleCallback 或 setTimeout
  const defer = (fn: () => void, delay = 0) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fn, { timeout: delay + 50 });
    } else {
      setTimeout(fn, delay);
    }
  };

  // 延遲載入完整 CSS (100ms 後)
  defer(() => {
    import("./assets/css/phase2-ultra-minimal.css").catch(() => {
      console.warn('CSS 載入失敗，使用備用方案');
    });
  }, 100);
};

// 5. 性能監控
const measurePerformance = () => {
  if (import.meta.env.DEV) {
    defer(() => {
      const paint = performance.getEntriesByType('paint');
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      console.log('🚀 Phase 2 性能指標:');
      paint.forEach(entry => {
        console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
      });
      if (navigation) {
        console.log(`DOM 載入: ${(navigation.domContentLoadedEventEnd - navigation.fetchStart).toFixed(2)}ms`);
        console.log(`完整載入: ${(navigation.loadEventEnd - navigation.fetchStart).toFixed(2)}ms`);
      }
    }, 1000);
  }
};

// 6. 啟動載入程序
loadNonCriticalCSS();
measurePerformance();

// 7. 資源提示
const addResourceHints = () => {
  const hints = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://lineagew-labs.orionlabs.pro' },
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    Object.assign(link, hint);
    document.head.appendChild(link);
  });
};

const defer = (fn: () => void, delay = 0) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(fn, { timeout: delay + 50 });
  } else {
    setTimeout(fn, delay);
  }
};

defer(addResourceHints, 200);
