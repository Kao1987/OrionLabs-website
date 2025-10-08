<template>
  <div class="card h-100 shadow-sm">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h6 class="text-muted mb-1">{{ title }}</h6>
          <div class="d-flex align-items-center">
            <span class="status-indicator" :class="statusClass"></span>
            <span class="ms-2 fw-bold">{{ statusText }}</span>
          </div>
        </div>
        <div>
          <i class="bi" :class="iconClass" style="font-size: 2rem"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'bi-info-circle',
});

const statusClass = computed(() => {
  switch (props.status) {
    case 'healthy':
      return 'bg-success';
    case 'warning':
      return 'bg-warning';
    case 'error':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
});

const statusText = computed(() => {
  switch (props.status) {
    case 'healthy':
      return '正常運作';
    case 'warning':
      return '部分異常';
    case 'error':
      return '錯誤';
    default:
      return '未知';
  }
});

const iconClass = computed(() => {
  return `${props.icon} text-${props.status === 'healthy' ? 'success' : props.status === 'warning' ? 'warning' : props.status === 'error' ? 'danger' : 'secondary'}`;
});
</script>

<style scoped>
.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}
</style>
