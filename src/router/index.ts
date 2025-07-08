import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { authAPI } from '@/services/api'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '首頁 - Orion 個人品牌網站'
      }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: '關於我 - Orion 個人品牌網站'
      }
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: () => import('../views/PortfolioView.vue'),
      meta: {
        title: '作品集 - Orion 個人品牌網站'
      }
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('../views/BlogView.vue'),
      meta: {
        title: '部落格 - Orion 個人品牌網站'
      }
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
      meta: {
        title: '聯絡我 - Orion 個人品牌網站'
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: {
        title: '管理後台 - Orion 個人品牌網站',
        requiresAuth: true
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: {
        title: '頁面不存在 - Orion 個人品牌網站'
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守衛 - 檢查管理員權限
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('adminToken')
    
    if (!token) {
      return { name: 'home' }
    }
    
    // 使用API服務驗證 token 有效性
    try {
      await authAPI.getCurrentUser()
    } catch (error) {
      console.error('Token驗證失敗:', error)
      // Token無效，清除並重定向
      localStorage.removeItem('adminToken')
      localStorage.removeItem('tokenType')
      return { name: 'home' }
    }
  }
  
  // 設定頁面標題
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
})

export default router
