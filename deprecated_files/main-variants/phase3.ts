import { createRouter, createWebHistory } from "vue-router";

// === Phase 3 路由優化 ===
// 使用懶載入和代碼分割

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: {
        title: "OrionLabs - 前端開發與 UI/UX 設計",
        preload: true // 首頁預載入
      }
    },
    {
      path: "/about",
      name: "about",
      component: () => import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
      meta: {
        title: "關於我 - OrionLabs"
      }
    },
    {
      path: "/portfolio",
      name: "portfolio",
      component: () => import(/* webpackChunkName: "portfolio" */ "../views/PortfolioView.vue"),
      meta: {
        title: "作品集 - OrionLabs"
      }
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import(/* webpackChunkName: "contact" */ "../views/ContactView.vue"),
      meta: {
        title: "聯絡我 - OrionLabs"
      }
    },
    {
      path: "/blog",
      name: "blog",
      component: () => import(/* webpackChunkName: "blog" */ "../views/BlogView.vue"),
      meta: {
        title: "部落格 - OrionLabs"
      }
    }
  ]
});

// Phase 3 路由優化
router.beforeEach((to, from, next) => {
  // 更新頁面標題
  if (to.meta?.title) {
    document.title = to.meta.title as string;
  }

  // 預載入下一個可能的頁面
  if (to.meta?.preload && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import("../views/AboutView.vue").catch(() => {});
      import("../views/PortfolioView.vue").catch(() => {});
    });
  }

  next();
});

export default router;
