import type { App } from 'vue';

// === Phase 3 Vue 應用性能優化 ===

export const optimizeVueApp = (app: App) => {
  // 1. 性能配置
  app.config.performance = import.meta.env.DEV;

  // 2. 錯誤處理優化
  app.config.errorHandler = (err, instance, info) => {
    if (import.meta.env.DEV) {
      console.error('Vue Error:', err, info);
    }
  };

  // 3. 全域屬性優化
  app.config.globalProperties.$performance = {
    mark: (name: string) => {
      if ('performance' in window) {
        performance.mark(name);
      }
    },
    measure: (name: string, startMark: string, endMark?: string) => {
      if ('performance' in window) {
        performance.measure(name, startMark, endMark);
      }
    }
  };

  return app;
};
