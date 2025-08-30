<template>
  <div class="messages-page">
    <!-- 頁面標題 -->
    <section class="main-header">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h1 class="display-5 fw-bold">留言管理</h1>
                <p class="lead mb-0">管理訪客留言與聯絡表單</p>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button
                  v-if="hasNewMessages"
                  @click="markAllAsRead"
                  class="btn btn-outline-primary"
                  :disabled="updating"
                >
                  <span v-if="updating" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-check2-all me-1"></i>
                  全部標為已讀
                </button>
                <button @click="refreshMessages" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-arrow-clockwise me-1"></i>
                  重新整理
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 統計卡片 -->
    <section class="section pt-4">
      <div class="container">
        <div class="row g-4 mb-4">
          <div class="col-md-3">
            <div class="card stats-card border-primary">
              <div class="card-body text-center">
                <div class="stats-icon text-primary mb-2">
                  <i class="bi bi-envelope display-6"></i>
                </div>
                <h3 class="h4 fw-bold text-primary">{{ stats.total }}</h3>
                <p class="small text-muted mb-0">總留言數</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card stats-card border-warning">
              <div class="card-body text-center">
                <div class="stats-icon text-warning mb-2">
                  <i class="bi bi-bell display-6"></i>
                </div>
                <h3 class="h4 fw-bold text-warning">{{ stats.new }}</h3>
                <p class="small text-muted mb-0">新留言</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card stats-card border-success">
              <div class="card-body text-center">
                <div class="stats-icon text-success mb-2">
                  <i class="bi bi-check-circle display-6"></i>
                </div>
                <h3 class="h4 fw-bold text-success">{{ stats.read }}</h3>
                <p class="small text-muted mb-0">已讀</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card stats-card border-info">
              <div class="card-body text-center">
                <div class="stats-icon text-info mb-2">
                  <i class="bi bi-reply display-6"></i>
                </div>
                <h3 class="h4 fw-bold text-info">{{ stats.replied }}</h3>
                <p class="small text-muted mb-0">已回覆</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 篩選和搜尋 -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="搜尋留言內容、姓名或Email..."
                @input="debouncedSearch"
              />
            </div>
          </div>
          <div class="col-md-3">
            <select v-model="statusFilter" class="form-select" @change="applyFilters">
              <option value="">全部狀態</option>
              <option value="new">新留言</option>
              <option value="read">已讀</option>
              <option value="replied">已回覆</option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="sortOrder" class="form-select" @change="applyFilters">
              <option value="desc">最新優先</option>
              <option value="asc">最舊優先</option>
            </select>
          </div>
        </div>

        <!-- 載入狀態 -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">載入中...</span>
          </div>
          <p class="mt-2 text-muted">載入留言列表...</p>
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="error" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error.message }}
          <button @click="refreshMessages" class="btn btn-sm btn-outline-danger ms-2">重試</button>
        </div>

        <!-- 無留言狀態 -->
        <div v-if="!loading && filteredMessages.length === 0" class="text-center py-5">
          <div class="empty-state">
            <i class="bi bi-inbox display-1 text-muted mb-3"></i>
            <h3>{{ searchQuery || statusFilter ? "無符合條件的留言" : "尚無留言" }}</h3>
            <p class="text-muted">
              {{
                searchQuery || statusFilter
                  ? "請嘗試調整搜尋條件"
                  : "當有訪客透過聯絡表單發送訊息時，會顯示在這裡"
              }}
            </p>
            <button
              v-if="searchQuery || statusFilter"
              @click="clearFilters"
              class="btn btn-primary"
            >
              清除篩選條件
            </button>
          </div>
        </div>

        <!-- 留言列表 -->
        <div v-if="!loading && filteredMessages.length > 0" class="messages-list">
          <div
            v-for="message in paginatedMessages"
            :key="message.id"
            class="card message-card mb-3"
            :class="{
              'border-warning': message.status === 'new',
              'border-success': message.status === 'replied',
            }"
          >
            <div class="card-header d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <div class="status-indicator me-2">
                  <span
                    class="badge"
                    :class="{
                      'bg-warning': message.status === 'new',
                      'bg-primary': message.status === 'read',
                      'bg-success': message.status === 'replied',
                    }"
                  >
                    <i
                      class="bi"
                      :class="{
                        'bi-bell': message.status === 'new',
                        'bi-eye': message.status === 'read',
                        'bi-reply': message.status === 'replied',
                      }"
                    ></i>
                    {{ getStatusText(message.status) }}
                  </span>
                </div>
                <div>
                  <h6 class="mb-0 fw-bold">{{ message.name }}</h6>
                  <small class="text-muted">
                    <i class="bi bi-envelope me-1"></i>
                    {{ message.email }}
                  </small>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <small class="text-muted">
                  <i class="bi bi-clock me-1"></i>
                  {{ formatDate(message.created_at) }}
                </small>
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    type="button"
                    :id="`messageActions${message.id}`"
                    data-bs-toggle="dropdown"
                  >
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <ul class="dropdown-menu" :aria-labelledby="`messageActions${message.id}`">
                    <li>
                      <button
                        v-if="message.status === 'new'"
                        @click="updateMessageStatus(message.id, 'read')"
                        class="dropdown-item"
                        :disabled="updating"
                      >
                        <i class="bi bi-eye me-2"></i>標為已讀
                      </button>
                    </li>
                    <li>
                      <button
                        v-if="message.status !== 'replied'"
                        @click="updateMessageStatus(message.id, 'replied')"
                        class="dropdown-item"
                        :disabled="updating"
                      >
                        <i class="bi bi-reply me-2"></i>標為已回覆
                      </button>
                    </li>
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                      <button
                        @click="deleteMessage(message.id)"
                        class="dropdown-item text-danger"
                        :disabled="updating"
                      >
                        <i class="bi bi-trash me-2"></i>刪除留言
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div v-if="message.subject" class="mb-2">
                <strong>主旨：</strong>{{ message.subject }}
              </div>
              <div class="message-content">
                <p class="mb-0">{{ message.message }}</p>
              </div>
              <div v-if="message.phone" class="mt-2 text-muted small">
                <i class="bi bi-telephone me-1"></i>
                電話：{{ message.phone }}
              </div>
            </div>
          </div>
        </div>

        <!-- 分頁 -->
        <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
          <nav>
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button
                  class="page-link"
                  @click="goToPage(currentPage - 1)"
                  :disabled="currentPage === 1"
                >
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button v-if="typeof page === 'number'" class="page-link" @click="goToPage(page)">
                  {{ page }}
                </button>
                <span v-else class="page-link">{{ page }}</span>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button
                  class="page-link"
                  @click="goToPage(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                >
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { messageAPI } from "@/services/api";
import { useSEO } from "@/composables/useSEO";

// SEO 設定
const { updateSEO } = useSEO();

onMounted(() => {
  updateSEO({
    title: "留言管理 - OrionLabs 管理後台",
    description: "管理訪客留言與聯絡表單訊息",
  });
});

// 型別定義
interface Message {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
  updated_at?: string;
}

interface MessageStats {
  total: number;
  new: number;
  read: number;
  replied: number;
}

// 響應式資料
const messages = ref<Message[]>([]);
const loading = ref(false);
const updating = ref(false);
const error = ref<Error | null>(null);

// 篩選和搜尋
const searchQuery = ref("");
const statusFilter = ref("");
const sortOrder = ref<"asc" | "desc">("desc");

// 分頁
const currentPage = ref(1);
const itemsPerPage = 10;

// 統計數據
const stats = computed<MessageStats>(() => {
  const total = messages.value.length;
  const new_count = messages.value.filter((m) => m.status === "new").length;
  const read_count = messages.value.filter((m) => m.status === "read").length;
  const replied_count = messages.value.filter((m) => m.status === "replied").length;

  return {
    total,
    new: new_count,
    read: read_count,
    replied: replied_count,
  };
});

// 是否有新留言
const hasNewMessages = computed(() => stats.value.new > 0);

// 篩選後的留言
const filteredMessages = computed(() => {
  let filtered = [...messages.value];

  // 狀態篩選
  if (statusFilter.value) {
    filtered = filtered.filter((message) => message.status === statusFilter.value);
  }

  // 搜尋篩選
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(
      (message) =>
        message.name.toLowerCase().includes(query) ||
        message.email.toLowerCase().includes(query) ||
        message.message.toLowerCase().includes(query) ||
        (message.subject && message.subject.toLowerCase().includes(query)),
    );
  }

  // 排序
  filtered.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder.value === "desc" ? dateB - dateA : dateA - dateB;
  });

  return filtered;
});

// 分頁相關計算
const totalPages = computed(() => Math.ceil(filteredMessages.value.length / itemsPerPage));

const paginatedMessages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredMessages.value.slice(start, end);
});

const visiblePages = computed(() => {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (
    let i = Math.max(2, currentPage.value - delta);
    i <= Math.min(totalPages.value - 1, currentPage.value + delta);
    i++
  ) {
    range.push(i);
  }

  if (currentPage.value - delta > 2) {
    rangeWithDots.push(1, "...");
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (currentPage.value + delta < totalPages.value - 1) {
    rangeWithDots.push("...", totalPages.value);
  } else {
    rangeWithDots.push(totalPages.value);
  }

  return rangeWithDots.filter((v, i, a) => a.indexOf(v) === i && totalPages.value > 1);
});

// 方法
const loadMessages = async () => {
  loading.value = true;
  error.value = null;

  try {
    messages.value = await messageAPI.getMessages();
  } catch (err) {
    error.value = err as Error;
    console.error("載入留言失敗:", err);
  } finally {
    loading.value = false;
  }
};

const updateMessageStatus = async (id: number, status: "read" | "replied") => {
  updating.value = true;

  try {
    await messageAPI.updateMessageStatus(id, status);
    const messageIndex = messages.value.findIndex((m) => m.id === id);
    if (messageIndex !== -1) {
      messages.value[messageIndex].status = status;
      messages.value[messageIndex].updated_at = new Date().toISOString();
    }
  } catch (err) {
    console.error("更新留言狀態失敗:", err);
    alert("更新失敗，請稍後再試");
  } finally {
    updating.value = false;
  }
};

const deleteMessage = async (id: number) => {
  if (!confirm("確定要刪除這則留言嗎？此操作無法復原。")) {
    return;
  }

  updating.value = true;

  try {
    await messageAPI.deleteMessage(id);
    messages.value = messages.value.filter((m) => m.id !== id);
  } catch (err) {
    console.error("刪除留言失敗:", err);
    alert("刪除失敗，請稍後再試");
  } finally {
    updating.value = false;
  }
};

const markAllAsRead = async () => {
  if (!confirm("確定要將所有新留言標為已讀嗎？")) {
    return;
  }

  updating.value = true;

  try {
    const newMessageIds = messages.value
      .filter((message) => message.status === "new")
      .map((message) => message.id);

    if (newMessageIds.length > 0) {
      await messageAPI.markAsRead(newMessageIds);
      messages.value.forEach((message) => {
        if (message.status === "new") {
          message.status = "read";
          message.updated_at = new Date().toISOString();
        }
      });
    }
  } catch (err) {
    console.error("標記全部已讀失敗:", err);
    alert("操作失敗，請稍後再試");
  } finally {
    updating.value = false;
  }
};

const refreshMessages = () => {
  loadMessages();
};

const applyFilters = () => {
  currentPage.value = 1;
};

const clearFilters = () => {
  searchQuery.value = "";
  statusFilter.value = "";
  currentPage.value = 1;
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// 防抖搜尋
let searchTimeout: ReturnType<typeof setTimeout>;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
  }, 300);
};

// 工具函數
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return `昨天 ${date.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}`;
  } else if (diffDays < 7) {
    return `${diffDays} 天前`;
  } else {
    return date.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "new":
      return "新留言";
    case "read":
      return "已讀";
    case "replied":
      return "已回覆";
    default:
      return status;
  }
};

// 初始化
onMounted(() => {
  loadMessages();
});
</script>

<style scoped>
.main-header {
  background: linear-gradient(135deg, var(--orion-primary) 0%, var(--orion-primary-700) 100%);
  color: white;
  padding: 2rem 0;
  margin-bottom: 0;
}

.stats-card {
  border-width: 2px;
  transition: all var(--transition-base);
  background: white;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stats-icon {
  opacity: 0.8;
}

.message-card {
  transition: all var(--transition-base);
  border-width: 1px;
}

.message-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.message-card.border-warning {
  border-left-width: 4px;
}

.message-card.border-success {
  border-left-width: 4px;
}

.message-content {
  max-height: 150px;
  overflow-y: auto;
  line-height: 1.6;
}

.empty-state {
  padding: 3rem 1rem;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--orion-primary);
  box-shadow: 0 0 0 0.2rem rgba(0, 47, 167, 0.1);
}

.pagination .page-link {
  color: var(--orion-primary);
  border-color: var(--orion-neutral-300);
}

.pagination .page-item.active .page-link {
  background-color: var(--orion-primary);
  border-color: var(--orion-primary);
}

.pagination .page-link:hover {
  color: var(--orion-primary-700);
  background-color: var(--orion-primary-50);
}

.dropdown-menu {
  border: none;
  box-shadow: var(--shadow-lg);
}

.dropdown-item:hover {
  background-color: var(--orion-primary-50);
  color: var(--orion-primary);
}

.section {
  padding: 2rem 0;
}

.section.pt-4 {
  padding-top: 1rem;
}

@media (max-width: 768px) {
  .main-header {
    padding: 1.5rem 0;
  }

  .stats-card {
    margin-bottom: 1rem;
  }

  .message-card .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
