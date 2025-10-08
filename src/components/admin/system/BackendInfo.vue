<template>
  <div class="card shadow-sm">
    <div class="card-header bg-primary text-white">
      <h5 class="card-title mb-0">
        <i class="bi bi-server me-2"></i>
        後端資訊
      </h5>
    </div>
    <div class="card-body">
      <template v-if="backendInfo">
        <div class="info-item">
          <span class="info-label">版本</span>
          <span class="info-value">{{ backendInfo.version }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">環境</span>
          <span class="badge" :class="environmentBadgeClass">
            {{ backendInfo.environment }}
          </span>
        </div>

        <hr />

        <h6 class="text-muted mb-3">建置資訊</h6>

        <div class="info-item">
          <span class="info-label">分支</span>
          <span class="info-value">
            <i class="bi bi-git me-1"></i>
            {{ backendInfo.buildInfo.branch }}
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">Commit</span>
          <code class="info-value">{{ backendInfo.buildInfo.commitHash }}</code>
        </div>

        <div class="info-item">
          <span class="info-label">建置時間</span>
          <span class="info-value">{{ formattedBuildTime }}</span>
        </div>

        <hr />

        <h6 class="text-muted mb-3">服務狀態</h6>

        <div class="info-item">
          <span class="info-label">資料庫</span>
          <span :class="healthInfo?.database ? 'text-success' : 'text-danger'">
            <i class="bi" :class="healthInfo?.database ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
            {{ healthInfo?.database ? '已連接' : '連接失敗' }}
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">認證系統</span>
          <span :class="healthInfo?.authSystem ? 'text-success' : 'text-danger'">
            <i class="bi" :class="healthInfo?.authSystem ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
            {{ healthInfo?.authSystem ? '正常運作' : '異常' }}
          </span>
        </div>
      </template>

      <template v-else>
        <div class="text-center text-muted py-3">
          <i class="bi bi-hourglass-split"></i>
          載入中...
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BackendInfo, HealthInfo } from '@/services/api';

interface Props {
  backendInfo: BackendInfo | null;
  healthInfo: HealthInfo | null;
}

const props = defineProps<Props>();

const environmentBadgeClass = computed(() => {
  return props.backendInfo?.environment === 'production'
    ? 'bg-success'
    : 'bg-warning';
});

const formattedBuildTime = computed(() => {
  if (!props.backendInfo?.buildInfo.buildTime) return 'N/A';

  try {
    const date = new Date(props.backendInfo.buildInfo.buildTime);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return props.backendInfo.buildInfo.buildTime;
  }
});
</script>

<style scoped>
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.info-label {
  font-weight: 500;
  color: #6c757d;
}

.info-value {
  color: #212529;
  font-weight: 500;
}

code.info-value {
  background-color: #f8f9fa;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
