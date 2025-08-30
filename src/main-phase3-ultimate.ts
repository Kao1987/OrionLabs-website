import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

// Phase 3 Ultimate: <1KB CSS, 零 !important, 最小複雜度
import '@/assets/css/phase3-ultimate.css'

// 極簡路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'Orion Labs - 首頁' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '關於我們 - Orion Labs' }
  },
  {
    path: '/portfolio',
    name: 'Portfolio',
    component: () => import('@/views/PortfolioView.vue'),
    meta: { title: '作品集 - Orion Labs' }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/ContactView.vue'),
    meta: { title: '聯絡我們 - Orion Labs' }
  }
]

// 建立路由器
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由標題更新
router.beforeEach((to) => {
  document.title = to.meta?.title as string || 'Orion Labs'
})

// 性能最佳化的 Vue 應用程式載入
async function loadUltimateApp() {
  const startTime = performance.now()

  try {
    // 建立應用程式
    const app = createApp(App)

    // 極簡 Vue 配置
    app.config.performance = true

    // 掛載路由
    app.use(router)

    // 掛載應用程式
    app.mount('#app')

    // 性能測量
    const loadTime = performance.now() - startTime
    console.log(`🚀 Phase 3 Ultimate 載入完成: ${loadTime.toFixed(2)}ms`)

    return app
  } catch (error) {
    console.error('❌ 應用程式載入失敗:', error)
    throw error
  }
}

// 啟動應用程式
loadUltimateApp().catch(console.error)
