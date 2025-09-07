// === Orion Labs 性能優化主入口 ===
// 簡化版 Phase 3 - 智能載入策略

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// === 關鍵 CSS 內聯注入 ===
const injectCriticalCSS = (): void => {
  if (document.querySelector('#orion-critical-styles')) return

  const style = document.createElement('style')
  style.id = 'orion-critical-styles'
  style.textContent = `
    /* Orion Labs 關鍵樣式 - 首屏渲染優化 */
    body{font:16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0}
    .container{max-width:1200px;margin:0 auto;padding:0 1rem}
    .navbar{display:flex;align-items:center;justify-content:space-between;padding:1rem 0;background:#fff;border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:100}
    .nav-brand{color:#002fa7;font-weight:600;text-decoration:none;font-size:1.25rem}
    .nav-links{display:flex;gap:1.5rem;list-style:none;align-items:center;margin:0;padding:0}
    .nav-link{color:#1c1917;text-decoration:none;padding:0.5rem 1rem;border-radius:6px;transition:background-color 0.2s ease}
    .nav-link:hover{background-color:#f8fafc}
    .btn{display:inline-flex;align-items:center;justify-content:center;padding:0.5rem 1.5rem;border:0;border-radius:6px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s ease;min-height:44px}
    .btn-primary{background:#002fa7;color:#fff}
    .btn-primary:hover{background:#001a64;transform:translateY(-1px)}
    .loading{display:flex;justify-content:center;align-items:center;min-height:200px}
    .loading::after{content:'';width:24px;height:24px;border:2px solid #e2e8f0;border-top:2px solid #002fa7;border-radius:50%;animation:spin 1s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    [data-theme="dark"] body{color:#f8fafc;background:#0f172a}
    [data-theme="dark"] .navbar{background:#0f172a;border-color:#334155}
    [data-theme="dark"] .nav-brand{color:#9cb8ff}
    [data-theme="dark"] .nav-link{color:#f8fafc}
    [data-theme="dark"] .nav-link:hover{background:#1e293b}
    @media(max-width:599px){.navbar{flex-direction:column;gap:0.5rem}.nav-links{gap:0.5rem}}
  `
  document.head.appendChild(style)
}

// === 效能監控 ===
const trackPerformance = (): void => {
  if (!import.meta.env.DEV) return

  // 性能標記
  performance.mark('orion-app-start')

  // DOM 載入完成後測量
  document.addEventListener('DOMContentLoaded', () => {
    performance.mark('orion-dom-ready')
  })

  // 首屏渲染測量
  setTimeout(() => {
    try {
      const paintEntries = performance.getEntriesByType('paint')
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')

      if (fcp) {
        const fcpTime = Math.round(fcp.startTime)
        console.log(`🎯 Orion FCP: ${fcpTime}ms ${fcpTime < 1800 ? '✅' : '⚠️'}`)
      }

      // 測量關鍵 CSS 大小
      const criticalCSS = document.querySelector('#orion-critical-styles')?.textContent?.length || 0
      console.log(`📏 Critical CSS: ${(criticalCSS / 1024).toFixed(2)}KB`)

      performance.mark('orion-app-ready')
      performance.measure('orion-startup-time', 'orion-app-start', 'orion-app-ready')

      const startupTime = performance.getEntriesByName('orion-startup-time')[0]?.duration || 0
      console.log(`⚡ Orion 啟動時間: ${Math.round(startupTime)}ms`)

    } catch (error) {
      console.warn('效能測量失敗:', error)
    }
  }, 1000)
}

// === 智能資源載入 ===
const loadResources = (): void => {
  const scheduleLoad = (callback: () => void, priority: 'high' | 'normal' | 'low' = 'normal'): void => {
    const delay = priority === 'high' ? 0 : priority === 'normal' ? 50 : 200

    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout: delay + 100 })
    } else {
      setTimeout(callback, delay)
    }
  }

  // 高優先級：性能 CSS
  scheduleLoad(() => {
    import('./assets/css/orion-performance.css').catch(() => {
      console.warn('性能 CSS 載入失敗，使用 fallback')
    })
  }, 'high')

  // 正常優先級：現有 CSS 系統
  scheduleLoad(() => {
    Promise.all([
      import('./assets/css/spacing-system.css'),
      import('./assets/css/responsive-system.css')
    ]).catch(() => {
      console.warn('部分 CSS 系統載入失敗')
    })
  }, 'normal')

  // 低優先級：非關鍵組件（當它們存在時）
  scheduleLoad(() => {
    import('./components/Navbar.vue').catch(() => {
      // 組件不存在時忽略
    })
  }, 'low')
}

// === 主應用程式載入 ===
const initializeApp = async (): Promise<void> => {
  try {
    // 載入核心模組
    const App = (await import('./App.vue')).default
    const router = (await import('./router')).default

    // 建立應用
    const app = createApp(App)

    // 性能配置
    if (import.meta.env.DEV) {
      app.config.performance = true
    }

    // 註冊插件
    app.use(createPinia())
    app.use(router)

    // 掛載應用
    const startTime = performance.now()
    app.mount('#app')
    const mountTime = performance.now() - startTime

    if (import.meta.env.DEV) {
      console.log(`🚀 Orion App 掛載完成: ${mountTime.toFixed(2)}ms`)
    }

    // 載入非關鍵資源
    loadResources()

  } catch (error) {
    console.error('❌ Orion App 載入失敗:', error)

    // Fallback UI
    const app = document.getElementById('app')
    if (app) {
      app.innerHTML = `
        <div style="padding:2rem;text-align:center;font-family:system-ui">
          <h2 style="color:#002fa7;margin-bottom:1rem">🔧 Orion Labs</h2>
          <p style="color:#666;margin-bottom:1rem">正在初始化應用程式...</p>
          <button onclick="location.reload()" style="padding:0.5rem 1rem;border:0;background:#002fa7;color:white;border-radius:6px;cursor:pointer">
            重新載入
          </button>
        </div>
      `
    }
  }
}

// === 啟動序列 ===
const startOrionApp = (): void => {
  // 1. 注入關鍵樣式
  injectCriticalCSS()

  // 2. 啟動效能監控
  trackPerformance()

  // 3. 初始化應用
  initializeApp()
}

// === 主題初始化 ===
const initializeTheme = (): void => {
  try {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = savedTheme || (prefersDark ? 'dark' : 'light')

    document.documentElement.setAttribute('data-theme', theme)
  } catch {
    // 忽略主題初始化錯誤
  }
}

// === 執行啟動 ===
// 立即初始化主題（避免閃爍）
initializeTheme()

// 啟動應用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startOrionApp)
} else {
  startOrionApp()
}

// === 全域錯誤處理 ===
window.addEventListener('error', (event) => {
  console.error('Orion App 全域錯誤:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Orion App 未處理的 Promise 拒絕:', event.reason)
  event.preventDefault()
})

// === 開發環境輔助 ===
if (import.meta.env.DEV) {
  // 定義效能工具介面
  interface OrionPerfTools {
    measureFCP: () => PerformanceEntry | undefined
    measureLCP: () => PerformanceEntry | undefined
    getCriticalCSSSize: () => string
  }

  // 全域變數供開發使用
  const perfTools: OrionPerfTools = {
    measureFCP: () => {
      const paintEntries = performance.getEntriesByType('paint')
      return paintEntries.find(entry => entry.name === 'first-contentful-paint')
    },
    measureLCP: () => {
      const paintEntries = performance.getEntriesByType('paint')
      return paintEntries.find(entry => entry.name === 'largest-contentful-paint')
    },
    getCriticalCSSSize: () => {
      const criticalCSS = document.querySelector('#orion-critical-styles')?.textContent?.length || 0
      return `${(criticalCSS / 1024).toFixed(2)}KB`
    }
  }

  // 掛載到 window（僅開發環境）
  ;(window as unknown as Window & { OrionPerf: OrionPerfTools }).OrionPerf = perfTools

  console.log('🛠️ Orion 開發模式啟動')
  console.log('💡 使用 window.OrionPerf 查看效能指標')
}
