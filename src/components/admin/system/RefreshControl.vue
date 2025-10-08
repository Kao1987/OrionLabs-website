<template>
  <div class="card shadow-sm h-100">
    <div class="card-body">
      <h6 class="text-muted mb-3">刷新控制</h6>

      <div class="mb-3">
        <button
          @click="$emit('refresh')"
          class="btn btn-primary w-100"
          :disabled="isRefreshing"
        >
          <i class="bi bi-arrow-clockwise me-2" :class="{ 'spin': isRefreshing }"></i>
          {{ isRefreshing ? '刷新中...' : '手動刷新' }}
        </button>
      </div>

      <hr />

      <div class="mb-3">
        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            id="autoRefreshSwitch"
            :checked="autoRefreshEnabled"
            @change="toggleAutoRefresh"
          />
          <label class="form-check-label" for="autoRefreshSwitch">
            自動刷新
          </label>
        </div>
      </div>

      <div v-if="autoRefreshEnabled" class="mb-3">
        <label class="form-label small">刷新間隔（秒）</label>
        <select
          class="form-select form-select-sm"
          :value="refreshInterval"
          @change="onIntervalChange"
        >
          <option :value="10">10 秒</option>
          <option :value="30">30 秒</option>
          <option :value="60">60 秒</option>
        </select>
      </div>

      <div v-if="lastUpdate" class="text-muted small">
        <i class="bi bi-clock me-1"></i>
        最後更新：{{ formattedLastUpdate }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  autoRefreshEnabled: boolean;
  refreshInterval: number;
  lastUpdate: Date | null;
  isRefreshing?: boolean;
}

interface Emits {
  (e: 'refresh'): void;
  (e: 'toggle-auto-refresh'): void;
  (e: 'update-interval', interval: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  isRefreshing: false,
});

const emit = defineEmits<Emits>();

const formattedLastUpdate = computed(() => {
  if (!props.lastUpdate) return 'N/A';

  return props.lastUpdate.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
});

function toggleAutoRefresh() {
  emit('toggle-auto-refresh');
}

function onIntervalChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const interval = parseInt(target.value);
  emit('update-interval', interval);
}
</script>

<style scoped>
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.btn:disabled {
  cursor: not-allowed;
}
</style>
