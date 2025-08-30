<!-- 用戶登入狀態組件 -->
<template>
  <div class="user-status-widget">
    <!-- 登入狀態指示器 -->
    <div v-if="isAuthenticated" class="status-indicator">
      <div class="d-flex align-items-center">
        <div class="status-dot bg-success me-2"></div>
        <small class="text-muted">
          已登入
          <span v-if="remainingTime > 0" class="ms-1"> ({{ formatRemainingTime }} 後到期) </span>
        </small>
      </div>

      <!-- 記住我狀態 -->
      <div v-if="isRemembered" class="mt-1">
        <small class="text-success">
          <i class="bi bi-shield-check me-1"></i>
          已記住登入狀態
        </small>
      </div>

      <!-- 到期提醒 -->
      <div v-if="isExpiringSoon" class="mt-1">
        <small class="text-warning">
          <i class="bi bi-exclamation-triangle me-1"></i>
          即將到期，請重新登入
        </small>
      </div>
    </div>

    <div v-else class="status-indicator">
      <div class="d-flex align-items-center">
        <div class="status-dot bg-secondary me-2"></div>
        <small class="text-muted">未登入</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { TokenManager } from "@/services/api";

// 響應式狀態
const isAuthenticated = ref(false);
const isRemembered = ref(false);
const remainingTime = ref(0);
let intervalId: number | null = null;

// 計算屬性
const formatRemainingTime = computed(() => {
  if (remainingTime.value <= 0) return "";

  const hours = Math.floor(remainingTime.value / 60);
  const minutes = remainingTime.value % 60;

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}天`;
  } else if (hours > 0) {
    return `${hours}小時${minutes}分鐘`;
  } else {
    return `${minutes}分鐘`;
  }
});

const isExpiringSoon = computed(() => {
  return isAuthenticated.value && remainingTime.value > 0 && remainingTime.value <= 30; // 30分鐘內到期
});

// 更新狀態
const updateStatus = () => {
  isAuthenticated.value = TokenManager.hasValidToken();
  isRemembered.value = TokenManager.isRemembered();
  remainingTime.value = TokenManager.getRemainingTime();
};

// 生命週期
onMounted(() => {
  updateStatus();

  // 每分鐘更新一次狀態
  intervalId = window.setInterval(updateStatus, 60000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

// 導出更新方法供外部調用
defineExpose({
  updateStatus,
});
</script>

<style scoped>
.user-status-widget {
  padding: 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--bs-success-rgb), 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--bs-success-rgb), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--bs-success-rgb), 0);
  }
}

.status-indicator small {
  font-size: 0.75rem;
  line-height: 1.2;
}
</style>
