<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 主導航列 -->
  <nav class="main-nav navbar navbar-expand-lg fixed-top shadow-sm">
    <div class="container">
      <!-- 品牌標誌 -->
      <router-link to="/" class="main-nav__brand navbar-brand text-primary">
        {{ brandName }}
      </router-link>

      <!-- 手機版選單切換按鈕 -->
      <button
        class="main-nav__toggler navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="main-nav__toggler-icon navbar-toggler-icon"></span>
      </button>

      <!-- 導航選單 -->
      <div class="main-nav__collapse collapse navbar-collapse" id="navbarNav">
        <ul class="main-nav__list navbar-nav ms-auto">
          <li class="main-nav__item nav-item">
            <router-link to="/" class="main-nav__link nav-link" active-class="main-nav__link--active"> 首頁 </router-link>
          </li>
          <li class="main-nav__item nav-item">
            <router-link to="/about" class="main-nav__link nav-link" active-class="main-nav__link--active"> 關於我 </router-link>
          </li>
          <li class="main-nav__item nav-item">
            <router-link to="/portfolio" class="main-nav__link nav-link" active-class="main-nav__link--active">
              作品集
            </router-link>
          </li>
          <li class="main-nav__item nav-item">
            <router-link to="/blog" class="main-nav__link nav-link" active-class="main-nav__link--active"> 部落格 </router-link>
          </li>
          <li class="main-nav__item nav-item">
            <router-link to="/contact" class="main-nav__link nav-link" active-class="main-nav__link--active"> 聯絡我 </router-link>
          </li>
          <!-- 日夜模式切換按鈕 -->
          <li class="main-nav__item nav-item">
            <button
              class="main-nav__theme-toggle nav-link"
              @click="toggleTheme"
              :aria-label="isDarkMode ? '切換到淺色模式' : '切換到深色模式'"
              type="button"
              :title="
                isDarkMode
                  ? '目前為深色模式，點擊切換到淺色模式'
                  : '目前為淺色模式，點擊切換到深色模式'
              "
            >
              <span class="main-nav__theme-toggle-icon" aria-hidden="true">{{
                isDarkMode ? "☀️" : "🌙"
              }}</span>
              <span class="main-nav__theme-toggle-text">{{ isDarkMode ? "淺色" : "深色" }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useUIStore } from "@/stores/ui";

interface Props {
  brandName?: string;
}

withDefaults(defineProps<Props>(), {
  brandName: "Your Brand",
});

const uiStore = useUIStore();
const { isDarkMode, toggleTheme } = uiStore;
</script>

<style scoped>
/* === Navbar 組件特定樣式 === */
/* 主要樣式已移至 orion-bem-core.css */

/* 重要提示覆蓋（避免 Bootstrap 衝突） */
.main-nav {
  background-color: var(--color-bg-primary) !important;
}

.main-nav__brand {
  color: var(--color-text-primary) !important;
}

.main-nav__brand:hover {
  color: var(--color-primary) !important;
}

.main-nav__link {
  color: var(--color-text-secondary) !important;
}

.main-nav__link:hover {
  color: var(--color-primary) !important;
}

.main-nav__link--active {
  color: var(--color-primary) !important;
}

/* 組件特定的細節調整 */
@media (max-width: 991px) {
  .main-nav__list {
    padding-top: 1rem; /* Bootstrap 特定間距 */
  }
}
</style>