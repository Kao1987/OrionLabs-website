<template>
  <div class="system-monitor">
    <!-- 頁面標題 -->
    <div class="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="h2">
        <i class="bi bi-cpu me-2"></i>
        系統監控
      </h1>
    </div>

    <!-- 錯誤提示 -->
    <div v-if="systemStore.error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <strong>錯誤：</strong> {{ systemStore.error }}
      <button type="button" class="btn-close" @click="systemStore.clearError()"></button>
    </div>

    <!-- 總覽卡片區 -->
    <div class="row mb-4">
      <div class="col-lg-4 mb-3">
        <StatusCard
          title="系統健康"
          :status="systemHealthStatus"
          icon="bi-heart-pulse-fill"
        />
      </div>
      <div class="col-lg-4 mb-3">
        <StatusCard
          title="API 連接"
          :status="apiHealthStatus"
          icon="bi-wifi"
        />
      </div>
      <div class="col-lg-4 mb-3">
        <RefreshControl
          :auto-refresh-enabled="systemStore.autoRefreshEnabled"
          :refresh-interval="systemStore.refreshInterval"
          :last-update="systemStore.lastUpdate"
          :is-refreshing="systemStore.isLoading"
          @refresh="handleManualRefresh"
          @toggle-auto-refresh="handleToggleAutoRefresh"
          @update-interval="handleUpdateInterval"
        />
      </div>
    </div>

    <!-- 載入中指示器 -->
    <div v-if="systemStore.isLoading && !systemStore.systemStatus" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="text-muted mt-3">正在載入系統資訊...</p>
    </div>

    <!-- 詳細資訊區 -->
    <template v-else>
      <div class="row mb-4">
        <!-- 後端資訊 -->
        <div class="col-lg-6 mb-3">
          <BackendInfo
            :backend-info="systemStore.systemStatus?.backend || null"
            :health-info="systemStore.systemStatus?.health || null"
          />
        </div>

        <!-- 前端資訊 -->
        <div class="col-lg-6 mb-3">
          <FrontendInfo />
        </div>
      </div>

      <!-- API 端點測試區 -->
      <div class="row">
        <div class="col-12">
          <ApiEndpointTests :endpoints="systemStore.apiEndpoints" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useSystemStore } from '@/stores/system';
import StatusCard from './system/StatusCard.vue';
import BackendInfo from './system/BackendInfo.vue';
import FrontendInfo from './system/FrontendInfo.vue';
import ApiEndpointTests from './system/ApiEndpointTests.vue';
import RefreshControl from './system/RefreshControl.vue';

const systemStore = useSystemStore();

// Computed
const systemHealthStatus = computed(() => {
  if (!systemStore.systemStatus) return 'unknown';
  return systemStore.isHealthy ? 'healthy' : 'error';
});

const apiHealthStatus = computed(() => {
  if (systemStore.apiEndpoints.length === 0) return 'unknown';
  return systemStore.allEndpointsHealthy ? 'healthy' : 'warning';
});

// Methods
async function handleManualRefresh() {
  await systemStore.refreshAll();
}

function handleToggleAutoRefresh() {
  if (systemStore.autoRefreshEnabled) {
    systemStore.stopAutoRefresh();
  } else {
    systemStore.startAutoRefresh();
  }
}

function handleUpdateInterval(interval: number) {
  systemStore.setRefreshInterval(interval);
}

// Lifecycle
onMounted(async () => {
  // 初始載入
  await systemStore.refreshAll();
});

onUnmounted(() => {
  // 清理：停止自動刷新
  systemStore.stopAutoRefresh();
});
</script>

<style scoped>
.system-monitor {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
