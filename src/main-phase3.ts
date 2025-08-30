// === PHASE 3 終極性能優化 ===
// 目標: 渲染時間 < 0.5s, BEM複雜度 < 0.1

// 1. 預載入關鍵模組
const preloadModules = () => {
  const modules = [
    () => import("./App.vue"),
    () => import("./router/phase3"),
    () => import("pinia"),
    () => import("./views/HomeView.vue") // 預載入首頁
  ];

  modules.forEach((loader, index) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loader().catch(() => {}), { timeout: index * 10 });
    }
  });
};

// 2. 最小關鍵 CSS (極致壓縮)
const injectCSS = () => {
  if (document.querySelector('#c')) return;
  const s = document.createElement('style');
  s.id = 'c';
  s.textContent = `*{box-sizing:border-box;margin:0;padding:0}body{font:400 1rem/1.5 system-ui,sans-serif;color:#1c1917;background:#fff}:root{--p:#002fa7}.container{max-width:1200px;margin:0 auto;padding:0 1rem}.btn{display:inline-flex;padding:.75rem 1.5rem;border:0;border-radius:6px;cursor:pointer;text-decoration:none}.btn-primary{background:var(--p);color:#fff}.navbar{display:flex;align-items:center;justify-content:space-between;padding:1rem 0}.nav-link{color:inherit;text-decoration:none;padding:.5rem 1rem}.loading{display:flex;justify-content:center;align-items:center;min-height:200px}`;
  document.head.appendChild(s);
};

// 3. 立即執行關鍵路徑
injectCSS();
preloadModules();

// 4. 異步載入應用核心
const loadApp = async () => {
  try {
    const [{ createApp }, { createPinia }, App, router, { optimizeVueApp }] = await Promise.all([
      import("vue"),
      import("pinia"),
      import("./App.vue"),
      import("./router/phase3"),
      import("./utils/phase3-optimize")
    ]);

    const app = createApp(App.default);

    // 應用性能優化
    optimizeVueApp(app);

    app.use(createPinia());
    app.use(router.default);

    // 性能監控
    const startTime = performance.now();

    app.mount("#app");

    if (import.meta.env.DEV) {
      const mountTime = performance.now() - startTime;
      console.log(`🚀 Phase 3 App 掛載: ${mountTime.toFixed(2)}ms`);
    }

  } catch (error) {
    console.error('App 載入失敗:', error);
    document.body.innerHTML = '<div style="padding:2rem;text-align:center"><h3>載入失敗</h3><p>請重新整理頁面</p></div>';
  }
};

// 5. 延遲載入完整樣式
const loadStyles = () => {
  requestAnimationFrame(() => {
    import("./assets/css/phase3-minimal.css").catch(() => {});
  });
};

// 6. 啟動序列
Promise.resolve()
  .then(() => loadApp())
  .then(() => {
    // 延遲載入樣式
    setTimeout(loadStyles, 100);

    // 性能監控
    if (import.meta.env.DEV) {
      setTimeout(() => {
        const paint = performance.getEntriesByType('paint');
        paint.forEach(entry => {
          console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
        });
      }, 1000);
    }
  });
