<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";
import { computed } from "vue";
import { onMounted, onErrorCaptured } from "vue";
// import HelloWorld from './components/HelloWorld.vue'
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
import CookieBanner from "./components/CookieBanner.vue";
import { useStructuredData } from "./composables/useSEO";
import { useUIStore } from "./stores/ui";
import NotificationToast from "./components/NotificationToast.vue";

// 路由
const route = useRoute();

// 檢查是否為管理頁面
const isAdminRoute = computed(() => {
  return route.path.startsWith("/admin");
});

// SEO 設定
// const { updateSEO } = useSEO()
const { addWebsiteSchema } = useStructuredData();

// UI Store 初始化
const uiStore = useUIStore();

// 全局錯誤處理
onErrorCaptured((error, instance, info) => {
  console.error("App Error Captured:", error, info);
  return false; // 讓錯誤繼續向上傳播
});

// 頁面重新載入處理
const handlePageReload = () => {
  window.location.reload();
};

// 初始化全站 SEO 設定
onMounted(() => {
  // 初始化主題
  uiStore.initializeTheme();

  // 設定網站結構化資料
  addWebsiteSchema({
    name: "OrionLabs",
    url: "https://orionlabs.dev",
    description:
      "歡迎來到 OrionLabs！我是一名專注於前端開發與 UI/UX 設計的工程師，致力於創造優質的數位體驗。",
    author: {
      name: "Orion",
      url: "https://orionlabs.dev/about",
    },
    potentialAction: {
      target: "https://orionlabs.dev/search?q={search_term_string}",
      queryInput: "required name=search_term_string",
    },
  });
});

// 社群媒體連結
const socialLinks = [
  // { name: 'LinkedIn', url: 'https://linkedin.com/in/yourprofile', icon: 'bi bi-linkedin' },
  { name: "GitHub", url: "https://github.com/yourusername", icon: "bi bi-github" },
  // { name: 'Instagram', url: 'https://instagram.com/yourprofile', icon: 'bi bi-instagram' },
  { name: "Email", url: "mailto:orionkaolabs@gmail.com", icon: "bi bi-envelope" },
];
</script>

<template>
  <div class="app-container d-flex flex-column min-vh-100">
    <!-- 導航列 -->
    <navbar brand-name="Orion" />

    <!-- Cookie 同意橫幅（僅 EEA/UK） -->
    <cookie-banner />

    <!-- 主要內容區 -->
    <main class="flex-grow-1" style="margin-top: 76px">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in" appear>
          <div v-if="Component" :key="route.fullPath" class="route-container">
            <Suspense>
              <template #default>
                <KeepAlive>
                  <component :is="Component" />
                </KeepAlive>
              </template>
              <template #fallback>
                <div
                  class="loading-container d-flex justify-content-center align-items-center"
                  style="min-height: 400px"
                >
                  <div class="text-center">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">載入中...</span>
                    </div>
                    <p class="mt-3 text-muted">頁面載入中...</p>
                  </div>
                </div>
              </template>
            </Suspense>
          </div>
          <div
            v-else
            class="error-container d-flex justify-content-center align-items-center"
            style="min-height: 400px"
          >
            <div class="text-center">
              <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
              <h3>載入失敗</h3>
              <p class="text-muted">頁面載入時發生錯誤，請重新整理頁面。</p>
              <button @click="handlePageReload" class="btn btn-primary me-2">重新載入</button>
              <button @click="$router.push('/')" class="btn btn-outline-secondary">返回首頁</button>
            </div>
          </div>
        </transition>
      </router-view>
    </main>

    <!-- 底部 -->
    <footer
      v-if="!isAdminRoute"
      brand-name="Orion"
      description="致力於創造優質的數位體驗，專注於前端開發與 UI/UX 設計。"
      email="hong.yikao@example.com"
      phone="+886-912-345-678"
      location="台北市, 台灣"
      :social-links="socialLinks"
    />

    <!-- 通知系統 -->
    <notification-toast />
  </div>
</template>

<style>
/* === 頁面轉場動畫 === */
.fade-enter-active {
  transition: all var(--transition-slow);
}

.fade-leave-active {
  transition: all var(--transition-fast);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.98);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(1.02);
}

/* === 應用程式樣式 === */
#app,
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* === 自定義滾動條 === */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--brand-primary), var(--orion-primary-600));
  border-radius: var(--radius-full);
  border: 2px solid var(--bg-secondary);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, var(--orion-primary-700), var(--orion-primary-800));
}

/* Firefox 滾動條 */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--brand-primary) var(--bg-secondary);
}

/* === 選取文字樣式 === */
::selection {
  background-color: var(--orion-primary-100);
  color: var(--orion-primary-800);
}

::-moz-selection {
  background-color: var(--orion-primary-100);
  color: var(--orion-primary-800);
}

/* === 焦點樣式 === */
*:focus {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}

/* === 無障礙改進 === */
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity var(--transition-fast);
  }

  .fade-enter-from,
  .fade-leave-to {
    transform: none;
  }
}
</style>
