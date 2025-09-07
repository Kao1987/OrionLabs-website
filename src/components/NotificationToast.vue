<template>
  <Teleport to="body">
    <div class="notification-area">
      <TransitionGroup name="notification-toast" tag="div" class="notification-area__list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-toast"
          :class="[
            `notification-toast--${notification.type}`,
            notification.persistent ? 'notification-toast--persistent' : '',
          ]"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-toast__content">
            <div class="notification-toast__icon">
              <i
                :class="getIconClass(notification.type)"
                :style="{ color: getIconColor(notification.type) }"
              ></i>
            </div>
            <div class="notification-toast__text">
              <div v-if="notification.title" class="notification-toast__title">
                {{ notification.title }}
              </div>
              <div class="notification-toast__message">
                {{ notification.message }}
              </div>
            </div>
            <button
              v-if="!notification.persistent"
              class="notification-toast__close"
              @click.stop="removeNotification(notification.id)"
              aria-label="關閉通知"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUIStore, type Notification } from "../stores/ui";

const uiStore = useUIStore();

const notifications = computed(() => uiStore.notifications);

const iconMap = {
  success: "bi bi-check-circle-fill",
  error: "bi bi-exclamation-circle-fill",
  warning: "bi bi-exclamation-triangle-fill",
  info: "bi bi-info-circle-fill",
};

const colorMap = {
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

const getIconClass = (type: string) => {
  return iconMap[type as keyof typeof iconMap] || iconMap.info;
};

const getIconColor = (type: string) => {
  return colorMap[type as keyof typeof colorMap] || colorMap.info;
};

const handleNotificationClick = (notification: Notification) => {
  if (!notification.persistent) {
    removeNotification(notification.id);
  }
};

const removeNotification = (id: string) => {
  uiStore.removeNotification(id);
};
</script>

<style scoped>
.notification-area {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  pointer-events: none;
}

.notification-area__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-toast {
  pointer-events: all;
  background: var(--bs-body-bg, #ffffff);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--bs-border-color, #dee2e6);
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 100%;
  overflow: hidden;
}

.notification-toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.notification-toast--success {
  border-left: 4px solid #10b981;
}

.notification-toast--error {
  border-left: 4px solid #ef4444;
}

.notification-toast--warning {
  border-left: 4px solid #f59e0b;
}

.notification-toast--info {
  border-left: 4px solid #3b82f6;
}

.notification-toast__content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
}

.notification-toast__icon {
  flex-shrink: 0;
  font-size: 18px;
  margin-top: 2px;
}

.notification-toast__text {
  flex: 1;
  min-width: 0;
}

.notification-toast__title {
  font-weight: 600;
  font-size: 14px;
  color: var(--bs-body-color, #212529);
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-toast__message {
  font-size: 13px;
  color: var(--bs-secondary, #6c757d);
  line-height: 1.4;
  word-wrap: break-word;
}

.notification-toast__close {
  flex-shrink: 0;
  background: none;
  border: none;
  font-size: 16px;
  color: var(--bs-secondary, #6c757d);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin-top: -2px;
}

.notification-toast__close:hover {
  background-color: var(--bs-light, #f8f9fa);
  color: var(--bs-body-color, #212529);
}

.notification-toast__close:focus {
  outline: 2px solid var(--bs-primary, #0d6efd);
  outline-offset: 2px;
}

/* 進入和離開動畫 */
.notification-toast-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.notification-toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-toast-move {
  transition: transform 0.3s ease;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .notification-area {
    left: 20px;
    right: 20px;
    max-width: none;
  }

  .notification-toast__content {
    padding: 14px;
    gap: 10px;
  }

  .notification-toast__icon {
    font-size: 16px;
  }

  .notification-toast__title {
    font-size: 13px;
  }

  .notification-toast__message {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .notification-area {
    top: 10px;
    left: 10px;
    right: 10px;
  }

  .notification-toast__content {
    padding: 12px;
  }
}

/* 深色模式支持 */
[data-theme="dark"] .notification-toast {
  background: var(--color-bg-card);
  border-color: var(--color-border-primary);
  color: var(--color-text-primary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .notification-toast__close:hover {
  background-color: var(--color-bg-tertiary);
}

[data-theme="dark"] .notification-toast__title {
  color: var(--color-text-primary);
}

[data-theme="dark"] .notification-toast__message {
  color: var(--color-text-secondary);
}

/* 減少動畫偏好設定 */
@media (prefers-reduced-motion: reduce) {
  .notification-toast-enter-active,
  .notification-toast-leave-active,
  .notification-toast-move,
  .notification-toast {
    transition: none;
  }

  .notification-toast:hover {
    transform: none;
  }
}
</style>
