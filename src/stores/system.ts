import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { systemAPI } from '@/services/api';
import type {
  SystemStatus,
  SystemStatusData,
  EndpointTest,
} from '@/services/api';

export const useSystemStore = defineStore('system', () => {
  // State
  const systemStatus = ref<SystemStatusData | null>(null);
  const apiEndpoints = ref<EndpointTest[]>([]);
  const lastUpdate = ref<Date | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const autoRefreshEnabled = ref(false);
  const refreshInterval = ref(30); // 預設 30 秒
  const autoRefreshTimer = ref<number | null>(null);

  // Computed
  const isHealthy = computed(() => {
    return systemStatus.value?.health.status === 'healthy';
  });

  const allEndpointsHealthy = computed(() => {
    return apiEndpoints.value.every(ep => ep.status === 'success');
  });

  const systemEnvironment = computed(() => {
    return systemStatus.value?.backend.environment || 'unknown';
  });

  // Actions
  async function fetchSystemStatus() {
    isLoading.value = true;
    error.value = null;

    try {
      const response: SystemStatus = await systemAPI.getStatus();
      systemStatus.value = response.data;
      lastUpdate.value = new Date();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '無法獲取系統狀態';
      error.value = errorMessage;
      console.error('Failed to fetch system status:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function testAllEndpoints() {
    const endpoints = [
      '/auth/me',
      '/blog/public',
      '/system/status',
      '/health',
    ];

    apiEndpoints.value = endpoints.map(ep => ({
      endpoint: ep,
      status: 'pending',
    }));

    try {
      const results = await systemAPI.testEndpoints(endpoints);
      apiEndpoints.value = results;
    } catch (err: unknown) {
      console.error('Failed to test endpoints:', err);
    }
  }

  async function refreshAll() {
    await Promise.all([
      fetchSystemStatus(),
      testAllEndpoints(),
    ]);
  }

  function startAutoRefresh() {
    if (autoRefreshTimer.value) {
      stopAutoRefresh();
    }

    autoRefreshEnabled.value = true;

    // 立即執行一次
    refreshAll();

    // 設定定時器
    autoRefreshTimer.value = window.setInterval(() => {
      refreshAll();
    }, refreshInterval.value * 1000);
  }

  function stopAutoRefresh() {
    autoRefreshEnabled.value = false;
    if (autoRefreshTimer.value) {
      clearInterval(autoRefreshTimer.value);
      autoRefreshTimer.value = null;
    }
  }

  function setRefreshInterval(seconds: number) {
    refreshInterval.value = seconds;

    // 如果自動刷新正在運行，重新啟動以應用新的間隔
    if (autoRefreshEnabled.value) {
      startAutoRefresh();
    }
  }

  function clearError() {
    error.value = null;
  }

  // 清理函數
  function $reset() {
    systemStatus.value = null;
    apiEndpoints.value = [];
    lastUpdate.value = null;
    isLoading.value = false;
    error.value = null;
    stopAutoRefresh();
  }

  return {
    // State
    systemStatus,
    apiEndpoints,
    lastUpdate,
    isLoading,
    error,
    autoRefreshEnabled,
    refreshInterval,

    // Computed
    isHealthy,
    allEndpointsHealthy,
    systemEnvironment,

    // Actions
    fetchSystemStatus,
    testAllEndpoints,
    refreshAll,
    startAutoRefresh,
    stopAutoRefresh,
    setRefreshInterval,
    clearError,
    $reset,
  };
});
