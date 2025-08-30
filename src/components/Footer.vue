<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 主要 Footer -->
  <footer class="main-footer">
    <div class="container">
      <div class="row">
        <!-- 品牌資訊 -->
        <div class="col-lg-4 col-md-6 mb-4 main-footer__section">
          <h5 class="main-footer__title fw-bold mb-3">
            <router-link to="/login" class="main-footer__brand">{{ brandName }}</router-link>
          </h5>
          <p class="main-footer__description mb-3">{{ description }}</p>
          <div class="main-footer__social-links d-flex gap-3">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.url"
              class="main-footer__social-link"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="social.name"
            >
              <i :class="social.icon" class="main-footer__social-icon fs-5"></i>
            </a>
          </div>
        </div>

        <!-- 快速連結 -->
        <div class="col-lg-2 col-md-6 mb-4 main-footer__section">
          <h6 class="main-footer__section-title fw-bold mb-3">快速連結</h6>
          <ul class="main-footer__nav-list list-unstyled">
            <li class="main-footer__nav-item mb-2">
              <router-link to="/" class="main-footer__nav-link">首頁</router-link>
            </li>
            <li class="main-footer__nav-item mb-2">
              <router-link to="/about" class="main-footer__nav-link">關於我</router-link>
            </li>
            <li class="main-footer__nav-item mb-2">
              <router-link to="/portfolio" class="main-footer__nav-link">作品集</router-link>
            </li>
            <li class="main-footer__nav-item mb-2">
              <router-link to="/blog" class="main-footer__nav-link">部落格</router-link>
            </li>
          </ul>
        </div>

        <!-- 服務項目 -->
        <div class="col-lg-3 col-md-6 mb-4 main-footer__section">
          <h6 class="main-footer__section-title fw-bold mb-3">服務項目</h6>
          <ul class="main-footer__service-list list-unstyled">
            <li class="main-footer__service-item mb-2">
              <span class="main-footer__service-text">網站開發</span>
            </li>
            <li class="main-footer__service-item mb-2">
              <span class="main-footer__service-text">UI/UX 設計</span>
            </li>
            <li class="main-footer__service-item mb-2">
              <span class="main-footer__service-text">系統諮詢</span>
            </li>
            <li class="main-footer__service-item mb-2">
              <span class="main-footer__service-text">技術支援</span>
            </li>
          </ul>
        </div>

        <!-- 聯絡資訊 -->
        <div class="col-lg-3 col-md-6 mb-4 main-footer__section">
          <h6 class="main-footer__section-title fw-bold mb-3">聯絡資訊</h6>
          <div class="main-footer__contact-item d-flex align-items-center mb-2">
            <i class="main-footer__contact-icon bi bi-envelope me-2"></i>
            <a :href="`mailto:${email}`" class="main-footer__contact-link">{{ email }}</a>
          </div>
        </div>
      </div>

      <!-- 版權宣告 -->
      <hr class="main-footer__divider my-4" style="border-color: rgba(255, 255, 255, 0.2)" />
      <div class="main-footer__copyright row align-items-center">
        <div class="col-md-6">
          <p class="main-footer__copyright-text mb-0">&copy; {{ currentYear }} {{ brandName }}. All rights reserved.</p>
        </div>
        <div class="col-md-6 text-md-end">
          <span class="main-footer__credits">Made with ❤️ in Taiwan</span>
        </div>
      </div>
    </div>
  </footer>

  <!-- 法遵簡易 Footer -->
  <footer class="legal-footer">
    <p class="mb-2">© 2025 OrionLabs</p>
    <nav class="legal-footer__nav">
      <router-link to="/privacy" class="legal-footer__link">隱私政策</router-link>
      <router-link to="/terms" class="legal-footer__link">服務條款</router-link>
      <router-link to="/cookie" class="legal-footer__link">Cookie 政策</router-link>
    </nav>
  </footer>
</template>
<script setup lang="ts">
import { computed } from "vue";

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface FooterProps {
  brandName?: string;
  description?: string;
  email?: string;
  phone?: string;
  location?: string;
  socialLinks?: SocialLink[];
}

withDefaults(defineProps<FooterProps>(), {
  brandName: "Orion",
  description: "致力於創造優質的數位體驗，專注於前端開發與 UI/UX 設計。",
  email: "orionkaolabs@gmail.com",
  socialLinks: () => [
    { name: "GitHub", url: "https://github.com/yourusername", icon: "bi bi-github" },
    { name: "Email", url: "mailto:orionkaolabs@gmail.com", icon: "bi bi-envelope" },
  ],
});

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
/* === Footer 組件特定樣式 === */
/* 主要樣式已移至 orion-bem-core.css */

/* Bootstrap 衝突覆蓋 */
.main-footer {
  background: linear-gradient(135deg, #1c1917 0%, #3f3f46 100%) !important;
  color: #ffffff !important;
}

.main-footer__brand {
  color: var(--color-text-light) !important;
}

.main-footer__nav-link {
  color: var(--color-text-light-secondary) !important;
}

.main-footer__nav-link:hover {
  color: var(--color-text-light) !important;
}

.main-footer__contact-link {
  color: var(--color-text-light-secondary) !important;
}

.main-footer__contact-link:hover {
  color: var(--color-text-light) !important;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .main-footer .text-md-end {
    text-align: center !important;
    margin-top: var(--spacing-lg);
  }
}
</style>