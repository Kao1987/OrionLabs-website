import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { authAPI } from "@/services/api";

// SEO 介面定義
// interface RouteMeta {
//   title?: string
//   description?: string
//   keywords?: string[]
//   image?: string
//   type?: 'website' | 'article' | 'profile'
//   requiresAuth?: boolean
//   noindex?: boolean
// }

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: {
        title: "管理員登入",
        description: "OrionLabs 管理後台登入頁面",
        noindex: true,
      },
    },
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        title: "OrionLabs - 前端開發與 UI/UX 設計",
        description:
          "歡迎來到 OrionLabs！我是一名專注於前端開發與 UI/UX 設計的工程師，致力於創造優質的數位體驗。探索我的作品集、技術文章，以及與我聯絡合作。",
        keywords: [
          "前端開發",
          "Vue.js",
          "React",
          "TypeScript",
          "UI/UX設計",
          "網頁開發",
          "個人品牌",
          "OrionLabs",
        ],
        type: "website",
        image: "/images/og-home.jpg",
      },
    },
    {
      path: "/about",
      name: "about",
      component: () =>
        import("../views/AboutView.vue").catch(() => import("../views/NotFoundView.vue")),
      meta: {
        title: "關於我",
        description:
          "了解 Orion 的專業背景、技能專長和職業經歷。擁有豐富的前端開發經驗，專精於 Vue.js、React 和現代網頁技術。",
        keywords: ["關於我", "個人簡介", "前端工程師", "技能專長", "工作經驗"],
        type: "profile",
        image: "/images/og-about.jpg",
      },
    },
    {
      path: "/portfolio",
      name: "portfolio",
      component: () =>
        import("../views/PortfolioView.vue").catch(() => {
          console.error("Failed to load PortfolioView component");
          return import("../views/NotFoundView.vue");
        }),
      meta: {
        title: "作品集",
        description:
          "探索 Orion 的精選作品集，包含網站開發、工具應用和設計專案。每個專案都展現了技術實力和創意思維。",
        keywords: ["作品集", "專案展示", "網站開發", "前端專案", "設計作品"],
        type: "website",
        image: "/images/og-portfolio.jpg",
      },
    },
    {
      path: "/blog",
      name: "blog",
      component: () =>
        import("../views/BlogView.vue").catch(() => {
          console.error("Failed to load BlogView component");
          return import("../views/NotFoundView.vue");
        }),
      meta: {
        title: "技術部落格",
        description:
          "閱讀 Orion 的技術文章，涵蓋前端開發、Vue.js、React、TypeScript 等主題。分享實用的開發技巧和最佳實踐。",
        keywords: ["技術部落格", "前端開發", "Vue.js", "React", "TypeScript", "開發技巧"],
        type: "website",
        image: "/images/og-blog.jpg",
      },
    },
    {
      path: "/blog/:slug",
      name: "blog-detail",
      component: () =>
        import("../views/BlogDetail.vue").catch(() => import("../views/NotFoundView.vue")),
      meta: {
        title: "文章詳情",
        description: "閱讀詳細的技術文章內容",
        type: "article",
        image: "/images/og-blog-default.jpg",
      },
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("../views/ContactView.vue"),
      meta: {
        title: "聯絡我",
        description:
          "想要合作或有任何問題嗎？透過聯絡表單與 Orion 取得聯繫。我很樂意討論您的專案需求和合作機會。",
        keywords: ["聯絡我", "合作洽談", "專案需求", "聯絡方式"],
        type: "website",
        image: "/images/og-contact.jpg",
      },
    },
    // 法遵頁面
    {
    path: "/privacy",
    name: "privacy",
    component: () => import("../views/PrivacyPolicy.vue"),
    meta: {
      title: "隱私權政策",
      description: "OrionLabs 隱私權政策詳細說明我們如何收集、使用、保護和處理您的個人資料。符合 GDPR 和台灣個資法規範。",
      keywords: ["隱私權政策", "個人資料保護", "資料安全", "GDPR", "個資法"],
      type: "website",
      noindex: false,
    },
  },
  {
    path: "/terms",
    name: "terms",
    component: () => import("../views/TermsOfService.vue"),
    meta: {
      title: "服務條款",
      description: "OrionLabs 服務條款詳細說明使用本網站服務的權利義務、智慧財產權、免責聲明等重要規範。",
      keywords: ["服務條款", "使用條款", "法律聲明", "智慧財產權", "免責聲明"],
      type: "website",
      noindex: false,
    },
  },
    {
      path: "/cookie",
      name: "cookie",
      component: () => import("../views/CookiePolicy.vue"),
      meta: {
        title: "Cookie 使用政策",
        description: "OrionLabs Cookie 政策詳細說明我們如何使用 Cookie 和類似技術，以及您如何管理 Cookie 偏好設定。",
        keywords: ["Cookie 政策", "Cookie 管理", "隱私設定", "網站追蹤"],
        type: "website",
        noindex: false,
      },
    },
    {
      path: "/sitemap",
      name: "sitemap",
      component: () => import("../views/SiteMap.vue"),
      meta: {
        title: "網站地圖",
        description: "OrionLabs 完整網站地圖，包含所有頁面連結、法遵資訊、技術資源和聯絡方式。",
        keywords: ["網站地圖", "頁面導覽", "網站結構", "快速連結"],
        type: "website",
        noindex: false,
      },
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/AdminView.vue"),
      meta: {
        title: "管理後台",
        description: "OrionLabs 網站管理後台",
        requiresAuth: true,
        noindex: true,
      },
    },
    {
      path: "/messages",
      name: "messages",
      component: () => import("../views/MessagesView.vue"),
      meta: {
        title: "留言管理",
        description: "OrionLabs 留言管理系統",
        requiresAuth: true,
        noindex: true,
      },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
      meta: {
        title: "頁面不存在",
        description: "您所尋找的頁面不存在，請檢查網址是否正確。",
        noindex: true,
      },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// 路由守衛 - 檢查管理員權限和自動登入
router.beforeEach(async (to) => {
  try {
    // 如果要去的頁面需要認證
    if (to.meta.requiresAuth) {
      const authStatus = await authAPI.checkAuthStatus();

      if (!authStatus.isAuthenticated) {
        console.log("未認證，導向登入頁面");
        return { name: "login" };
      }

      console.log("已認證，允許訪問:", to.name);
    }

    // 如果已經登入且要去登入頁面，直接導向管理後台
    if (to.name === "login") {
      const authStatus = await authAPI.checkAuthStatus();

      if (authStatus.isAuthenticated) {
        console.log("已登入，從登入頁面導向管理後台");
        return { name: "admin" };
      }
    }

    // 設定頁面標題
    if (to.meta.title) {
      document.title = to.meta.title as string;
    }
  } catch (err) {
    console.error("Router beforeEach error:", err);

    // 如果是認證相關的路由且出錯，導向登入頁面
    if (to.meta.requiresAuth) {
      return { name: "login" };
    }

    // 其他錯誤導向首頁
    return { name: "home" };
  }
});

// 路由錯誤處理
router.onError((error) => {
  console.error("Router navigation error:", error);
  // 可以在這裡添加錯誤追蹤或用戶通知
});

export default router;
