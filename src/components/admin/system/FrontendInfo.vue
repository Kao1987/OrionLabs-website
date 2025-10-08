<template>
  <div class="card shadow-sm">
    <div class="card-header bg-success text-white">
      <h5 class="card-title mb-0">
        <i class="bi bi-display me-2"></i>
        前端資訊
      </h5>
    </div>
    <div class="card-body">
      <div class="info-item">
        <span class="info-label">版本</span>
        <span class="info-value">{{ frontendVersion }}</span>
      </div>

      <div class="info-item">
        <span class="info-label">環境</span>
        <span class="badge" :class="environmentBadgeClass">
          {{ environment }}
        </span>
      </div>

      <hr />

      <h6 class="text-muted mb-3">API 配置</h6>

      <div class="info-item">
        <span class="info-label">API Base URL</span>
        <code class="info-value">{{ apiBaseUrl }}</code>
      </div>

      <div class="info-item">
        <span class="info-label">模式</span>
        <span class="info-value">{{ apiMode }}</span>
      </div>

      <div class="info-item">
        <span class="info-label">後端連接</span>
        <span class="badge" :class="backendConnectionBadgeClass">
          <i class="bi" :class="backendConnectionIcon"></i>
          {{ backendConnectionText }}
        </span>
      </div>

      <hr />

      <h6 class="text-muted mb-3">瀏覽器資訊</h6>

      <div class="info-item">
        <span class="info-label">User Agent</span>
        <span class="info-value text-truncate" :title="userAgent">
          {{ browserName }}
        </span>
      </div>

      <div class="info-item">
        <span class="info-label">視窗大小</span>
        <span class="info-value">{{ windowSize }}</span>
      </div>

      <hr />

      <h6 class="text-muted mb-3">技術棧</h6>

      <div class="tech-badges">
        <span class="badge bg-secondary me-2 mb-2">Vue 3</span>
        <span class="badge bg-secondary me-2 mb-2">TypeScript</span>
        <span class="badge bg-secondary me-2 mb-2">Pinia</span>
        <span class="badge bg-secondary me-2 mb-2">Bootstrap 5</span>
        <span class="badge bg-secondary me-2 mb-2">Vite</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { config } from '@/services/api';

const frontendVersion = config.version;
const environment = config.isProduction ? 'Production' : 'Development';
const apiBaseUrl = config.API_BASE_URL;
const userAgent = navigator.userAgent;

const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);

const environmentBadgeClass = computed(() => {
  return config.isProduction ? 'bg-success' : 'bg-warning';
});

const apiMode = computed(() => {
  return config.isDevelopment ? '開發模式（代理）' : '生產模式（直連）';
});

// 後端連接資訊
const backendConnection = config.backendConnection;

const backendConnectionText = computed(() => {
  switch (backendConnection.type) {
    case 'local':
      return '本地後端';
    case 'docker':
      return 'Docker 後端';
    case 'remote':
      return '線上後端';
    default:
      return '未知';
  }
});

const backendConnectionBadgeClass = computed(() => {
  switch (backendConnection.type) {
    case 'remote':
      return 'bg-primary';
    case 'local':
      return 'bg-info';
    case 'docker':
      return 'bg-info';
    default:
      return 'bg-secondary';
  }
});

const backendConnectionIcon = computed(() => {
  return backendConnection.type === 'remote' ? 'bi-cloud-fill' : 'bi-pc-display';
});

const browserName = computed(() => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('edge')) return 'Edge';
  return '其他';
});

const windowSize = computed(() => {
  return `${windowWidth.value} × ${windowHeight.value}`;
});

function updateWindowSize() {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
}

onMounted(() => {
  window.addEventListener('resize', updateWindowSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowSize);
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
  max-width: 60%;
  text-align: right;
}

code.info-value {
  background-color: #f8f9fa;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.tech-badges {
  display: flex;
  flex-wrap: wrap;
}
</style>
