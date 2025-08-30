<template>
  <div class="loading-spinner" :class="bemContainerClass">
    <div class="loading-spinner__spinner" :class="bemSpinnerClass"></div>
    <div v-if="message" class="loading-spinner__message">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  size?: "sm" | "md" | "lg";
  message?: string;
  inline?: boolean;
  overlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  message: "",
  inline: false,
  overlay: false,
});

const bemContainerClass = computed(() => ({
  "loading-spinner--inline": props.inline,
  "loading-spinner--overlay": props.overlay,
  "loading-spinner--center": !props.inline && !props.overlay,
}));

const bemSpinnerClass = computed(() => ({
  "loading-spinner__spinner--sm": props.size === "sm",
  "loading-spinner__spinner--lg": props.size === "lg",
}));
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.loading-spinner--center {
  justify-content: center;
  min-height: 200px;
}

.loading-spinner--inline {
  display: inline-flex;
  flex-direction: row;
  gap: var(--spacing-sm);
  align-items: center;
}

.loading-spinner--overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  z-index: var(--z-modal);
  justify-content: center;
  min-height: 100vh;
}

.loading-spinner__spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--brand-primary);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
  position: relative;
}

.loading-spinner__spinner::after {
  content: "";
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border: 2px solid transparent;
  border-top: 2px solid var(--orion-info);
  border-radius: var(--radius-full);
  animation: spin 1.5s linear infinite reverse;
}

.loading-spinner__spinner--sm {
  width: 1.25rem;
  height: 1.25rem;
  border-width: 2px;
}

.loading-spinner__spinner--sm::after {
  border-width: 1px;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
}

.loading-spinner__spinner--lg {
  width: 3rem;
  height: 3rem;
  border-width: 4px;
}

.loading-spinner__spinner--lg::after {
  border-width: 3px;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
}

.loading-spinner__message {
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-weight: 500;
  text-align: center;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 暗色模式支援 */
@media (prefers-color-scheme: dark) {
  .loading-spinner--overlay {
    background-color: rgba(28, 25, 23, 0.9);
  }
}

/* 動畫減少模式 */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner__spinner,
  .loading-spinner__spinner::after {
    animation: none;
  }

  .loading-spinner__spinner::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4px;
    height: 4px;
    background: var(--brand-primary);
    border-radius: var(--radius-full);
    transform: translate(-50%, -50%);
    animation: pulse 1s ease-in-out infinite;
  }
}
</style>