<template>
  <!-- 主要 Footer -->
  <footer class="main-footer">
    <div class="container">
      <div class="row">
        <!-- 品牌資訊 -->
        <div class="col-lg-4 col-md-6 mb-4">
          <h5 class="fw-bold mb-3">{{ brandName }}</h5>
          <p class="mb-3">{{ description }}</p>
          <div class="d-flex gap-3">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.url"
              class="footer-link"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="social.name"
            >
              <i :class="social.icon" class="fs-5"></i>
            </a>
          </div>
        </div>

        <!-- 快速連結 -->
        <div class="col-lg-2 col-md-6 mb-4">
          <h6 class="fw-bold mb-3">快速連結</h6>
          <ul class="list-unstyled">
            <li class="mb-2">
              <router-link to="/" class="footer-link">首頁</router-link>
            </li>
            <li class="mb-2">
              <router-link to="/about" class="footer-link">關於我</router-link>
            </li>
            <li class="mb-2">
              <router-link to="/portfolio" class="footer-link">作品集</router-link>
            </li>
            <li class="mb-2">
              <router-link to="/blog" class="footer-link">部落格</router-link>
            </li>
          </ul>
        </div>

        <!-- 服務項目 -->
        <div class="col-lg-3 col-md-6 mb-4">
          <h6 class="fw-bold mb-3">服務項目</h6>
          <ul class="list-unstyled">
            <li class="mb-2">
              <span class="footer-link">網站開發</span>
            </li>
            <li class="mb-2">
              <span class="footer-link">UI/UX 設計</span>
            </li>
            <li class="mb-2">
              <span class="footer-link">系統諮詢</span>
            </li>
            <li class="mb-2">
              <span class="footer-link">技術支援</span>
            </li>
          </ul>
        </div>

        <!-- 聯絡資訊 -->
        <div class="col-lg-3 col-md-6 mb-4">
          <h6 class="fw-bold mb-3">聯絡資訊</h6>
          <div class="d-flex align-items-center mb-2">
            <i class="bi bi-envelope me-2"></i>
            <a :href="`mailto:${email}`" class="footer-link">{{ email }}</a>
          </div>
          <div class="d-flex align-items-center mb-2">
            <i class="bi bi-phone me-2"></i>
            <span class="footer-link">{{ phone }}</span>
          </div>
          <div class="d-flex align-items-center">
            <i class="bi bi-geo-alt me-2"></i>
            <span class="footer-link">{{ location }}</span>
          </div>
        </div>
      </div>

      <!-- 版權宣告 -->
      <hr class="my-4" style="border-color: rgba(255, 255, 255, 0.2)">
      <div class="row align-items-center">
        <div class="col-md-6">
          <p class="mb-0">&copy; {{ currentYear }} {{ brandName }}. All rights reserved.</p>
        </div>
        <div class="col-md-6 text-md-end">
          <span class="footer-link">Made with ❤️ in Taiwan</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SocialLink {
  name: string
  url: string
  icon: string
}

interface Props {
  brandName?: string
  description?: string
  email?: string
  phone?: string
  location?: string
  socialLinks?: SocialLink[]
}

const props = withDefaults(defineProps<Props>(), {
  brandName: 'Your Brand',
  description: '致力於創造優質的數位體驗，專注於網站開發與設計。',
  email: 'hello@yourbrand.com',
  phone: '+886-912-345-678',
  location: '台北市, 台灣',
  socialLinks: () => [
    { name: 'LinkedIn', url: '#', icon: 'bi bi-linkedin' },
    { name: 'GitHub', url: '#', icon: 'bi bi-github' },
    { name: 'Twitter', url: '#', icon: 'bi bi-twitter' },
    { name: 'Instagram', url: '#', icon: 'bi bi-instagram' }
  ]
})

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.main-footer {
  margin-top: auto;
}

.footer-link {
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: white !important;
  text-decoration: none;
}

@media (max-width: 768px) {
  .text-md-end {
    text-align: center !important;
    margin-top: 1rem;
  }
}
</style> 