<script setup lang="ts">
interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
  variant?: 'default' | 'gradient' | 'image';
}

withDefaults(defineProps<HeroSectionProps>(), {
  title: 'Welcome to OrionLabs',
  subtitle: '前端開發 • UI/UX 設計 • 系統諮詢',
  description: '致力於創造優質的數位體驗，專注於現代網頁技術與用戶體驗設計。',
  ctaText: '查看作品集',
  ctaLink: '/portfolio',
  variant: 'gradient'
});
</script>

<template>
  <section class="hero-section" :class="`hero-section--${variant}`">
    <div class="hero-section__background">
      <div class="hero-section__overlay"></div>
      <img 
        v-if="variant === 'image' && backgroundImage" 
        :src="backgroundImage" 
        :alt="title"
        class="hero-section__bg-image"
      />
    </div>
    
    <div class="container hero-section__container">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-xl-6 text-center">
          <div class="hero-section__content">
            <!-- 主標題 -->
            <h1 class="hero-section__title">
              {{ title }}
            </h1>
            
            <!-- 副標題 -->
            <p class="hero-section__subtitle" v-if="subtitle">
              {{ subtitle }}
            </p>
            
            <!-- 描述 -->
            <p class="hero-section__description" v-if="description">
              {{ description }}
            </p>
            
            <!-- 行動按鈕 -->
            <div class="hero-section__actions" v-if="ctaText && ctaLink">
              <router-link 
                :to="ctaLink" 
                class="hero-section__cta btn btn-primary btn-lg"
              >
                <span class="hero-section__cta-text">{{ ctaText }}</span>
                <i class="hero-section__cta-icon bi bi-arrow-right ms-2"></i>
              </router-link>
            </div>
            
            <!-- 滾動提示 -->
            <div class="hero-section__scroll-hint">
              <i class="hero-section__scroll-icon bi bi-chevron-down"></i>
              <span class="hero-section__scroll-text">向下探索</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* === Hero Section BEM Styles === */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: var(--color-bg-primary);
}

.hero-section--gradient {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: var(--color-text-light);
}

.hero-section--default {
  background-color: var(--color-bg-secondary);
}

.hero-section--image {
  background-color: var(--color-bg-dark);
  color: var(--color-text-light);
}

.hero-section__background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.hero-section__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2;
}

.hero-section__bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.hero-section__container {
  position: relative;
  z-index: 3;
}

.hero-section__content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  animation: heroFadeInUp 1s ease-out;
}

.hero-section__title {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  margin-bottom: var(--spacing-lg);
  color: inherit;
}

.hero-section--gradient .hero-section__title {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-section__subtitle {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  opacity: 0.9;
  margin-bottom: var(--spacing-lg);
  color: inherit;
}

.hero-section__description {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
  opacity: 0.8;
  margin-bottom: var(--spacing-2xl);
  color: inherit;
}

.hero-section__actions {
  margin-bottom: var(--spacing-3xl);
}

.hero-section__cta {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-2xl);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-lg);
}

.hero-section__cta:hover,
.hero-section__cta:focus {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
  text-decoration: none;
}

.hero-section__cta-text {
  margin-right: var(--spacing-sm);
}

.hero-section__cta-icon {
  transition: transform var(--transition-base);
}

.hero-section__cta:hover .hero-section__cta-icon {
  transform: translateX(4px);
}

.hero-section__scroll-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  opacity: 0.7;
  animation: heroScrollBounce 2s ease-in-out infinite;
}

.hero-section__scroll-icon {
  font-size: var(--font-size-xl);
}

.hero-section__scroll-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* === Animations === */
@keyframes heroFadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes heroScrollBounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* === Responsive Design === */
@media (max-width: 768px) {
  .hero-section {
    min-height: 80vh;
    padding: var(--spacing-xl) 0;
  }
  
  .hero-section__title {
    font-size: var(--font-size-4xl);
  }
  
  .hero-section__subtitle {
    font-size: var(--font-size-lg);
  }
  
  .hero-section__description {
    font-size: var(--font-size-base);
  }
  
  .hero-section__cta {
    padding: var(--spacing-sm) var(--spacing-xl);
    font-size: var(--font-size-base);
  }
}

@media (max-width: 480px) {
  .hero-section__title {
    font-size: var(--font-size-3xl);
  }
  
  .hero-section__cta {
    width: 100%;
    justify-content: center;
  }
}

/* === Dark Mode Support === */
[data-theme="dark"] .hero-section--default {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

[data-theme="dark"] .hero-section--gradient {
  background: linear-gradient(135deg, 
    var(--color-primary-dark) 0%, 
    var(--color-bg-dark) 100%
  );
}

[data-theme="dark"] .hero-section__overlay {
  background: rgba(0, 0, 0, 0.6);
}

[data-theme="dark"] .hero-section__cta {
  background-color: var(--color-primary-light);
  color: var(--color-text-dark);
}

[data-theme="dark"] .hero-section__cta:hover {
  background-color: var(--color-primary);
  color: var(--color-text-light);
}

/* === Reduced Motion === */
@media (prefers-reduced-motion: reduce) {
  .hero-section__content {
    animation: none;
  }
  
  .hero-section__scroll-hint {
    animation: none;
  }
  
  .hero-section__cta:hover {
    transform: none;
  }
}
</style>
