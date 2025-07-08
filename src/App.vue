<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

// 社群媒體連結
const socialLinks = [
  { name: 'LinkedIn', url: 'https://linkedin.com/in/yourprofile', icon: 'bi bi-linkedin' },
  { name: 'GitHub', url: 'https://github.com/yourusername', icon: 'bi bi-github' },
  { name: 'Instagram', url: 'https://instagram.com/yourprofile', icon: 'bi bi-instagram' },
  { name: 'Email', url: 'mailto:hong.yikao@example.com', icon: 'bi bi-envelope' }
]
</script>

<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <!-- 導航列 -->
    <Navbar brand-name="Orion" />
    
    <!-- 主要內容區 -->
    <main class="flex-grow-1" style="margin-top: 76px;">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 底部 -->
    <Footer 
      brand-name="Orion"
      description="致力於創造優質的數位體驗，專注於前端開發與 UI/UX 設計。"
      email="hong.yikao@example.com"
      phone="+886-912-345-678"
      location="台北市, 台灣"
      :social-links="socialLinks"
    />
  </div>
</template>

<style>
/* 頁面切換動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 確保最小高度 */
#app {
  min-height: 100vh;
}

/* 滾動條樣式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: var(--brand-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--brand-secondary);
}
</style>
