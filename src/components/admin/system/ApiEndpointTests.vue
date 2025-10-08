<template>
  <div class="card shadow-sm">
    <div class="card-header bg-info text-white">
      <h5 class="card-title mb-0">
        <i class="bi bi-wifi me-2"></i>
        API 端點測試
      </h5>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead>
            <tr>
              <th>端點</th>
              <th>狀態</th>
              <th>延遲</th>
              <th>狀態碼</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="endpoint in endpoints" :key="endpoint.endpoint">
              <td>
                <code>{{ endpoint.endpoint }}</code>
              </td>
              <td>
                <span
                  class="badge"
                  :class="getStatusBadgeClass(endpoint.status)"
                >
                  <i class="bi" :class="getStatusIcon(endpoint.status)"></i>
                  {{ getStatusText(endpoint.status) }}
                </span>
              </td>
              <td>
                <span v-if="endpoint.latency !== undefined" :class="getLatencyClass(endpoint.latency)">
                  {{ endpoint.latency }}ms
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <span v-if="endpoint.statusCode" class="badge bg-secondary">
                  {{ endpoint.statusCode }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
            </tr>
            <tr v-if="endpoints.length === 0">
              <td colspan="4" class="text-center text-muted">
                尚未執行測試
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="hasErrors" class="alert alert-warning mb-0 mt-3">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        部分端點連接異常，請檢查網路連線或後端服務狀態
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { EndpointTest } from '@/services/api';

interface Props {
  endpoints: EndpointTest[];
}

const props = defineProps<Props>();

const hasErrors = computed(() => {
  return props.endpoints.some(ep => ep.status === 'error');
});

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'success':
      return 'bg-success';
    case 'error':
      return 'bg-danger';
    case 'pending':
      return 'bg-warning';
    default:
      return 'bg-secondary';
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'success':
      return 'bi-check-circle-fill';
    case 'error':
      return 'bi-x-circle-fill';
    case 'pending':
      return 'bi-hourglass-split';
    default:
      return 'bi-question-circle';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'success':
      return '成功';
    case 'error':
      return '失敗';
    case 'pending':
      return '測試中';
    default:
      return '未知';
  }
}

function getLatencyClass(latency: number): string {
  if (latency < 100) return 'text-success fw-bold';
  if (latency < 500) return 'text-warning fw-bold';
  return 'text-danger fw-bold';
}
</script>

<style scoped>
.table {
  margin-bottom: 0;
}

code {
  font-size: 0.875rem;
  background-color: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
}
</style>
