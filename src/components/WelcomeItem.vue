<template>
  <article class="feature-card" :class="[
    `feature-card--${variant}`,
    { 'feature-card--connected': showConnector }
  ]">
    <!-- 圖示區域 -->
    <div class="feature-card__icon-container">
      <div class="feature-card__icon">
        <slot name="icon">
          <i class="bi bi-star feature-card__default-icon" aria-hidden="true"></i>
        </slot>
      </div>
    </div>
    
    <!-- 內容區域 -->
    <div class="feature-card__content">
      <!-- 標題 -->
      <h3 class="feature-card__title">
        <slot name="heading">預設標題</slot>
      </h3>
      
      <!-- 描述內容 -->
      <div class="feature-card__description">
        <slot></slot>
      </div>
      
      <!-- 可選的動作連結 -->
      <div class="feature-card__actions" v-if="actionText && actionLink">
        <a :href="actionLink" class="feature-card__action-link">
          <span class="feature-card__action-text">{{ actionText }}</span>
          <i class="feature-card__action-icon bi bi-arrow-right" aria-hidden="true"></i>
        </a>
      </div>
    </div>
    
    <!-- 連接線（針對時間線佈局） -->
    <div class="feature-card__connector" v-if="showConnector">
      <div class="feature-card__connector-line"></div>
    </div>
  </article>
</template>

<script setup lang="ts">
interface FeatureCardProps {
  variant?: 'default' | 'timeline' | 'compact' | 'highlight';
  showConnector?: boolean;
  actionText?: string;
  actionLink?: string;
}

withDefaults(defineProps<FeatureCardProps>(), {
  variant: 'default',
  showConnector: false,
  actionText: '',
  actionLink: ''
});
</script>

<style scoped>
/* === Feature Card BEM Styles === */
.feature-card {
  display: flex;
  position: relative;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  transition: all var(--transition-base);
  background-color: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-secondary);
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-focus);
}

.feature-card--default {
  /* 預設樣式 */
}

.feature-card--timeline {
  border-left: 3px solid var(--color-primary);
  background: linear-gradient(90deg, 
    var(--color-primary-light) 0%, 
    var(--color-bg-card) 10%
  );
}

.feature-card--compact {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.feature-card--highlight {
  background: linear-gradient(135deg, 
    var(--color-bg-card) 0%, 
    var(--color-primary-light) 100%
  );
  border-color: var(--color-primary);
}

.feature-card--connected {
  margin-left: var(--spacing-2xl);
}

/* === Icon Container === */
.feature-card__icon-container {
  flex-shrink: 0;
  margin-right: var(--spacing-lg);
}

.feature-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: var(--color-text-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.feature-card:hover .feature-card__icon {
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.feature-card__default-icon {
  font-size: var(--font-size-xl);
}

/* === Content Area === */
.feature-card__content {
  flex: 1;
  min-width: 0;
}

.feature-card__title {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
  line-height: var(--line-height-tight);
}

.feature-card__description {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-md);
}

/* === Action Link === */
.feature-card__actions {
  margin-top: var(--spacing-md);
}

.feature-card__action-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-primary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.feature-card__action-link:hover,
.feature-card__action-link:focus {
  color: var(--color-primary-hover);
  background-color: var(--color-primary-light);
  text-decoration: none;
}

.feature-card__action-text {
  /* Styling handled by parent */
}

.feature-card__action-icon {
  transition: transform var(--transition-fast);
}

.feature-card__action-link:hover .feature-card__action-icon {
  transform: translateX(2px);
}

/* === Connector Line === */
.feature-card__connector {
  position: absolute;
  left: -24px;
  top: 0;
  bottom: 0;
  width: 2px;
}

.feature-card__connector-line {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    var(--color-primary) 0%,
    var(--color-primary-light) 50%,
    var(--color-primary) 100%
  );
  border-radius: var(--radius-sm);
}

/* === Variant Specific Styles === */
.feature-card--timeline .feature-card__icon {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border: 3px solid var(--color-bg-card);
  width: 56px;
  height: 56px;
}

.feature-card--compact .feature-card__icon {
  width: 40px;
  height: 40px;
}

.feature-card--compact .feature-card__title {
  font-size: var(--font-size-base);
}

.feature-card--highlight .feature-card__icon {
  background: var(--color-bg-card);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

/* === Responsive Design === */
/* Container Queries for component-level responsiveness */
@container (max-width: 600px) {
  .feature-card {
    padding: var(--spacing-md);
  }
  
  .feature-card__icon {
    width: 40px;
    height: 40px;
  }
  
  .feature-card__title {
    font-size: var(--font-size-base);
  }
}

@container (max-width: 400px) {
  .feature-card {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-sm);
  }
  
  .feature-card__icon-container {
    margin-right: 0;
    margin-bottom: var(--spacing-sm);
    align-self: center;
  }
}

/* Fallback media queries for browsers without container query support */
@media (max-width: 768px) {
  .feature-card {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }
  
  .feature-card__icon-container {
    margin-right: var(--spacing-md);
  }
  
  .feature-card__icon {
    width: 40px;
    height: 40px;
  }
  
  .feature-card__title {
    font-size: var(--font-size-base);
  }
  
  .feature-card--connected {
    margin-left: 0;
  }
  
  .feature-card__connector {
    display: none;
  }
}

@media (max-width: 480px) {
  .feature-card {
    flex-direction: column;
    text-align: center;
  }
  
  .feature-card__icon-container {
    margin-right: 0;
    margin-bottom: var(--spacing-md);
    align-self: center;
  }
}

/* === Dark Mode Support === */
[data-theme="dark"] .feature-card {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-primary);
}

[data-theme="dark"] .feature-card:hover {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border-focus);
}

[data-theme="dark"] .feature-card--highlight {
  background: linear-gradient(135deg, 
    var(--color-bg-secondary) 0%, 
    rgba(var(--color-primary-rgb), 0.15) 100%
  );
}

[data-theme="dark"] .feature-card--timeline {
  background: linear-gradient(90deg, 
    rgba(var(--color-primary-rgb), 0.15) 0%, 
    var(--color-bg-secondary) 15%
  );
  border-left-color: var(--color-primary-light);
}

[data-theme="dark"] .feature-card__icon {
  background: linear-gradient(135deg, 
    var(--color-primary-light), 
    var(--color-primary)
  );
}

/* === Accessibility === */
@media (prefers-reduced-motion: reduce) {
  .feature-card {
    transition: none;
  }
  
  .feature-card:hover {
    transform: none;
  }
  
  .feature-card:hover .feature-card__icon {
    transform: none;
  }
  
  .feature-card__action-link:hover .feature-card__action-icon {
    transform: none;
  }
}

/* === Focus Management === */
.feature-card__action-link:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
</style>
