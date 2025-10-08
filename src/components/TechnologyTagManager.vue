<template>
  <div class="technology-tag-manager">
    <!-- 頁面標題 -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">技術標籤管理</h4>
        <p class="text-muted mb-0">管理作品集中使用的技術標籤</p>
      </div>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <i class="bi bi-plus-circle me-2"></i>新增標籤
      </button>
    </div>

    <!-- 搜尋與篩選 -->
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
            placeholder="搜尋標籤..."
          />
        </div>
      </div>
      <div class="col-md-3">
        <select v-model="categoryFilter" class="form-select">
          <option value="">所有分類</option>
          <option value="technology">技術</option>
          <option value="general">一般</option>
          <option value="blog">部落格</option>
        </select>
      </div>
      <div class="col-md-3">
        <select v-model="sortBy" class="form-select">
          <option value="name">名稱排序</option>
          <option value="usage_count">使用次數</option>
          <option value="created_at">建立時間</option>
        </select>
      </div>
    </div>

    <!-- 標籤統計 -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-primary">{{ totalTags }}</h5>
            <p class="card-text">總標籤數</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-success">{{ technologyTagsCount }}</h5>
            <p class="card-text">技術標籤</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-info">{{ mostUsedTag?.name || '-' }}</h5>
            <p class="card-text">最常用標籤</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-warning">{{ unusedTagsCount }}</h5>
            <p class="card-text">未使用標籤</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="mt-2 text-muted">載入標籤資料中...</p>
    </div>

    <!-- 標籤列表 -->
    <div v-else class="tag-list">
      <div v-if="filteredTags.length === 0" class="text-center py-5">
        <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
        <p class="mt-3 text-muted">沒有找到符合條件的標籤</p>
      </div>

      <div v-else class="row">
        <div
          v-for="tag in paginatedTags"
          :key="tag.id"
          class="col-md-6 col-lg-4 mb-3"
        >
          <div class="card tag-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span
                  class="badge tag-badge"
                  :style="{ backgroundColor: tag.color }"
                >
                  {{ tag.name }}
                </span>
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    type="button"
                    :id="`dropdown-${tag.id}`"
                    data-bs-toggle="dropdown"
                  >
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <button class="dropdown-item" @click="editTag(tag)">
                        <i class="bi bi-pencil me-2"></i>編輯
                      </button>
                    </li>
                    <li>
                      <button
                        class="dropdown-item text-danger"
                        @click="confirmDeleteTag(tag)"
                        :disabled="tag.usage_count > 0"
                      >
                        <i class="bi bi-trash me-2"></i>刪除
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="tag-info">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <small class="text-muted">分類</small>
                  <span class="badge bg-secondary">{{ getCategoryLabel(tag.category) }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <small class="text-muted">使用次數</small>
                  <span class="fw-bold">{{ tag.usage_count }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">建立時間</small>
                  <small>{{ formatDate(tag.created_at) }}</small>
                </div>
                <div v-if="tag.description" class="mt-2">
                  <small class="text-muted">{{ tag.description }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分頁 -->
    <nav v-if="totalPages > 1" class="mt-4">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
            <i class="bi bi-chevron-double-left"></i>
          </button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
            <i class="bi bi-chevron-left"></i>
          </button>
        </li>
        <li
          v-for="page in visiblePages"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
        >
          <button class="page-link" @click="currentPage = page">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">
            <i class="bi bi-chevron-double-right"></i>
          </button>
        </li>
      </ul>
    </nav>

    <!-- 新增/編輯標籤 Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ showCreateModal ? '新增技術標籤' : '編輯技術標籤' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModals"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveTag">
              <div class="mb-3">
                <label class="form-label">標籤名稱 <span class="text-danger">*</span></label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  required
                />
                <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label">分類 <span class="text-danger">*</span></label>
                <select
                  v-model="formData.category"
                  class="form-select"
                  :class="{ 'is-invalid': errors.category }"
                  required
                >
                  <option value="technology">技術</option>
                  <option value="general">一般</option>
                  <option value="blog">部落格</option>
                </select>
                <div v-if="errors.category" class="invalid-feedback">{{ errors.category }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label">顏色 <span class="text-danger">*</span></label>
                <div class="d-flex gap-2 flex-wrap mb-2">
                  <button
                    v-for="color in predefinedColors"
                    :key="color"
                    type="button"
                    class="btn color-option"
                    :class="{ active: formData.color === color }"
                    :style="{ backgroundColor: color }"
                    @click="formData.color = color"
                  ></button>
                </div>
                <input
                  v-model="formData.color"
                  type="color"
                  class="form-control form-control-color"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">描述</label>
                <textarea
                  v-model="formData.description"
                  class="form-control"
                  rows="3"
                  placeholder="選填：標籤的簡短描述"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModals">取消</button>
            <button type="button" class="btn btn-primary" @click="saveTag" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ showCreateModal ? '新增' : '更新' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showCreateModal || showEditModal" class="modal-backdrop show"></div>

    <!-- 刪除確認 Modal -->
    <div v-if="showDeleteModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">確認刪除</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>確定要刪除標籤 <strong>{{ tagToDelete?.name }}</strong> 嗎？</p>
            <p class="text-muted small">此操作無法復原。</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">取消</button>
            <button type="button" class="btn btn-danger" @click="deleteTag" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              刪除
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDeleteModal" class="modal-backdrop show"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { technologyTagAPI, type TechnologyTag, type TechnologyTagCreate } from '@/services/api'

// Refs
const tags = ref<TechnologyTag[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)

// 搜尋與篩選
const searchQuery = ref('')
const categoryFilter = ref('')
const sortBy = ref('name')

// 分頁
const currentPage = ref(1)
const pageSize = ref(12)

// Modal 狀態
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// 表單資料
const formData = ref<TechnologyTagCreate>({
  name: '',
  color: '#3498db',
  category: 'technology',
  description: ''
})

const editingTag = ref<TechnologyTag | null>(null)
const tagToDelete = ref<TechnologyTag | null>(null)

// 表單驗證
const errors = ref<Record<string, string>>({})

// 預定義顏色
const predefinedColors = [
  '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#34495e', '#e67e22',
  '#95a5a6', '#27ae60', '#8e44ad', '#16a085'
]

// Computed
const filteredTags = computed(() => {
  let filtered = [...tags.value]

  // 搜尋篩選
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(tag =>
      tag.name.toLowerCase().includes(query) ||
      (tag.description && tag.description.toLowerCase().includes(query))
    )
  }

  // 分類篩選
  if (categoryFilter.value) {
    filtered = filtered.filter(tag => tag.category === categoryFilter.value)
  }

  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'usage_count':
        return b.usage_count - a.usage_count
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      default:
        return a.name.localeCompare(b.name)
    }
  })

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredTags.value.length / pageSize.value))

const paginatedTags = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTags.value.slice(start, end)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages: number[] = []

  // 總是顯示當前頁面
  pages.push(current)

  // 添加前後頁面
  for (let i = 1; i <= 2; i++) {
    if (current - i >= 1) pages.unshift(current - i)
    if (current + i <= total) pages.push(current + i)
  }

  return pages.sort((a, b) => a - b)
})

// 統計資料
const totalTags = computed(() => tags.value.length)
const technologyTagsCount = computed(() => tags.value.filter(tag => tag.category === 'technology').length)
const mostUsedTag = computed(() =>
  tags.value.reduce((prev, current) =>
    (prev.usage_count > current.usage_count) ? prev : current,
    tags.value[0]
  )
)
const unusedTagsCount = computed(() => tags.value.filter(tag => tag.usage_count === 0).length)

// Methods
const loadTags = async () => {
  try {
    loading.value = true
    tags.value = await technologyTagAPI.getTechnologyTags()
  } catch (error) {
    console.error('載入標籤失敗:', error)
    alert('載入標籤失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = '標籤名稱為必填'
  } else if (formData.value.name.length > 50) {
    errors.value.name = '標籤名稱不能超過 50 個字元'
  }

  if (!formData.value.category) {
    errors.value.category = '分類為必填'
  }

  // 檢查名稱是否重複（編輯時排除自己）
  const existingTag = tags.value.find(tag =>
    tag.name.toLowerCase() === formData.value.name.toLowerCase() &&
    (!editingTag.value || tag.id !== editingTag.value.id)
  )
  if (existingTag) {
    errors.value.name = '標籤名稱已存在'
  }

  return Object.keys(errors.value).length === 0
}

const saveTag = async () => {
  if (!validateForm()) return

  try {
    saving.value = true

    if (showCreateModal.value) {
      // 新增標籤
      const newTag = await technologyTagAPI.createTechnologyTag(formData.value)
      tags.value.push(newTag)
    } else if (editingTag.value) {
      // 更新標籤
      const updatedTag = await technologyTagAPI.updateTechnologyTag(editingTag.value.id, formData.value)
      const index = tags.value.findIndex(tag => tag.id === editingTag.value!.id)
      if (index > -1) {
        tags.value[index] = updatedTag
      }
    }

    closeModals()
  } catch (error) {
    console.error('儲存標籤失敗:', error)
    alert('儲存標籤失敗，請稍後再試')
  } finally {
    saving.value = false
  }
}

const editTag = (tag: TechnologyTag) => {
  editingTag.value = tag
  formData.value = {
    name: tag.name,
    color: tag.color,
    category: tag.category,
    description: tag.description || ''
  }
  showEditModal.value = true
}

const confirmDeleteTag = (tag: TechnologyTag) => {
  tagToDelete.value = tag
  showDeleteModal.value = true
}

const deleteTag = async () => {
  if (!tagToDelete.value) return

  try {
    deleting.value = true
    await technologyTagAPI.deleteTechnologyTag(tagToDelete.value.id)
    const index = tags.value.findIndex(tag => tag.id === tagToDelete.value!.id)
    if (index > -1) {
      tags.value.splice(index, 1)
    }
    showDeleteModal.value = false
    tagToDelete.value = null
  } catch (error) {
    console.error('刪除標籤失敗:', error)
    alert('刪除標籤失敗，請稍後再試')
  } finally {
    deleting.value = false
  }
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingTag.value = null
  formData.value = {
    name: '',
    color: '#3498db',
    category: 'technology',
    description: ''
  }
  errors.value = {}
}

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    technology: '技術',
    general: '一般',
    blog: '部落格'
  }
  return labels[category] || category
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

// 監聽篩選變化，重置分頁
watch([searchQuery, categoryFilter], () => {
  currentPage.value = 1
})

// 生命週期
onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.tag-card {
  border: 1px solid var(--bs-border-color);
  transition: transform 0.2s, box-shadow 0.2s;
}

.tag-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tag-badge {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
}

.tag-info {
  font-size: 0.875rem;
}

.color-option {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 2px solid transparent;
  padding: 0;
  margin: 0.125rem;
}

.color-option.active {
  border-color: var(--bs-primary);
  transform: scale(1.1);
}

.form-control-color {
  width: 100%;
  height: 3rem;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

/* 深色模式支援 */
[data-bs-theme="dark"] .tag-card {
  border-color: var(--bs-border-color);
  background: var(--bs-body-bg);
}

[data-bs-theme="dark"] .tag-card:hover {
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
}
</style>
