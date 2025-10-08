<template>
  <div class="blog-category-manager">
    <!-- 頁面標題 -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">部落格分類管理</h4>
        <p class="text-muted mb-0">管理部落格文章的分類標籤</p>
      </div>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <i class="bi bi-plus-circle me-2"></i>新增分類
      </button>
    </div>

    <!-- 搜尋與排序 -->
    <div class="row mb-4">
      <div class="col-md-8">
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="搜尋分類..."
          />
        </div>
      </div>
      <div class="col-md-4">
        <select v-model="sortBy" class="form-select">
          <option value="name">名稱排序</option>
          <option value="post_count">文章數量</option>
          <option value="created_at">建立時間</option>
        </select>
      </div>
    </div>

    <!-- 分類統計 -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-primary">{{ totalCategories }}</h5>
            <p class="card-text">總分類數</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-success">{{ activeCategoriesCount }}</h5>
            <p class="card-text">活躍分類</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-info">{{ mostUsedCategory?.name || '-' }}</h5>
            <p class="card-text">最多文章分類</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-warning">{{ totalPosts }}</h5>
            <p class="card-text">總文章數</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="mt-2 text-muted">載入分類資料中...</p>
    </div>

    <!-- 分類列表 -->
    <div v-else class="category-list">
      <div v-if="filteredCategories.length === 0" class="text-center py-5">
        <i class="bi bi-folder text-muted" style="font-size: 3rem;"></i>
        <p class="mt-3 text-muted">沒有找到符合條件的分類</p>
      </div>

      <div v-else class="row">
        <div
          v-for="category in paginatedCategories"
          :key="category.id"
          class="col-md-6 col-lg-4 mb-3"
        >
          <div class="card category-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span
                  class="badge category-badge"
                  :style="{ backgroundColor: category.color }"
                >
                  {{ category.name }}
                </span>
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    type="button"
                    :id="`dropdown-${category.id}`"
                    data-bs-toggle="dropdown"
                  >
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <button class="dropdown-item" @click="editCategory(category)">
                        <i class="bi bi-pencil me-2"></i>編輯
                      </button>
                    </li>
                    <li>
                      <button
                        class="dropdown-item text-danger"
                        @click="confirmDeleteCategory(category)"
                        :disabled="category.post_count > 0"
                      >
                        <i class="bi bi-trash me-2"></i>刪除
                      </button>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <button
                        class="dropdown-item"
                        @click="toggleCategoryStatus(category)"
                      >
                        <i :class="category.is_active ? 'bi bi-eye-slash' : 'bi bi-eye'" class="me-2"></i>
                        {{ category.is_active ? '停用' : '啟用' }}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="category-info">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <small class="text-muted">文章數量</small>
                  <span class="fw-bold">{{ category.post_count }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <small class="text-muted">狀態</small>
                  <span class="badge" :class="category.is_active ? 'bg-success' : 'bg-secondary'">
                    {{ category.is_active ? '啟用' : '停用' }}
                  </span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">建立時間</small>
                  <small>{{ formatDate(category.created_at) }}</small>
                </div>
                <div v-if="category.description" class="mt-2">
                  <small class="text-muted">{{ category.description }}</small>
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

    <!-- 新增/編輯分類 Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ showCreateModal ? '新增部落格分類' : '編輯部落格分類' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModals"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCategory">
              <div class="mb-3">
                <label class="form-label">分類名稱 <span class="text-danger">*</span></label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  placeholder="如：前端技術、桃園美食"
                  required
                />
                <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
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
                  placeholder="選填：分類的簡短描述"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModals">取消</button>
            <button type="button" class="btn btn-primary" @click="saveCategory" :disabled="saving">
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
            <p>確定要刪除分類 <strong>{{ categoryToDelete?.name }}</strong> 嗎？</p>
            <p v-if="categoryToDelete?.post_count && categoryToDelete.post_count > 0" class="text-warning small">
              <i class="bi bi-exclamation-triangle me-1"></i>
              此分類有 {{ categoryToDelete.post_count }} 篇文章，無法刪除。
            </p>
            <p v-else class="text-muted small">此操作無法復原。</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">取消</button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deleteCategory"
              :disabled="deleting || (categoryToDelete?.post_count ? categoryToDelete.post_count > 0 : false)"
            >
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
import { blogCategoryAPI, type BlogCategory, type BlogCategoryCreate } from '@/services/api'

// Refs
const categories = ref<BlogCategory[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)

// 搜尋與排序
const searchQuery = ref('')
const sortBy = ref('name')

// 分頁
const currentPage = ref(1)
const pageSize = ref(12)

// Modal 狀態
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// 表單資料
const formData = ref<BlogCategoryCreate>({
  name: '',
  color: '#3498db',
  description: ''
})

const editingCategory = ref<BlogCategory | null>(null)
const categoryToDelete = ref<BlogCategory | null>(null)

// 表單驗證
const errors = ref<Record<string, string>>({})

// 預定義顏色
const predefinedColors = [
  '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#34495e', '#e67e22',
  '#95a5a6', '#27ae60', '#8e44ad', '#16a085'
]

// Computed
const filteredCategories = computed(() => {
  let filtered = [...categories.value]

  // 搜尋篩選
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(category =>
      category.name.toLowerCase().includes(query) ||
      (category.description && category.description.toLowerCase().includes(query))
    )
  }

  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'post_count':
        return b.post_count - a.post_count
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      default:
        return a.name.localeCompare(b.name)
    }
  })

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredCategories.value.length / pageSize.value))

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCategories.value.slice(start, end)
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
const totalCategories = computed(() => categories.value.length)
const activeCategoriesCount = computed(() => categories.value.filter(cat => cat.is_active).length)
const mostUsedCategory = computed(() =>
  categories.value.reduce((prev, current) =>
    (prev.post_count > current.post_count) ? prev : current,
    categories.value[0]
  )
)
const totalPosts = computed(() => categories.value.reduce((sum, cat) => sum + cat.post_count, 0))

// Methods
const loadCategories = async () => {
  try {
    loading.value = true
    categories.value = await blogCategoryAPI.getCategories()
  } catch (error) {
    console.error('載入分類失敗:', error)
    alert('載入分類失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = '分類名稱為必填'
  } else if (formData.value.name.length > 50) {
    errors.value.name = '分類名稱不能超過 50 個字元'
  }

  // 檢查名稱是否重複（編輯時排除自己）
  const existingCategory = categories.value.find(cat =>
    cat.name.toLowerCase() === formData.value.name.toLowerCase() &&
    (!editingCategory.value || cat.id !== editingCategory.value.id)
  )
  if (existingCategory) {
    errors.value.name = '分類名稱已存在'
  }

  return Object.keys(errors.value).length === 0
}

const saveCategory = async () => {
  if (!validateForm()) return

  try {
    saving.value = true

    if (showCreateModal.value) {
      // 新增分類
      const newCategory = await blogCategoryAPI.createCategory(formData.value)
      categories.value.push(newCategory)
    } else if (editingCategory.value) {
      // 更新分類
      const updatedCategory = await blogCategoryAPI.updateCategory(editingCategory.value.id, formData.value)
      const index = categories.value.findIndex(cat => cat.id === editingCategory.value!.id)
      if (index > -1) {
        categories.value[index] = updatedCategory
      }
    }

    closeModals()
  } catch (error) {
    console.error('儲存分類失敗:', error)
    alert('儲存分類失敗，請稍後再試')
  } finally {
    saving.value = false
  }
}

const editCategory = (category: BlogCategory) => {
  editingCategory.value = category
  formData.value = {
    name: category.name,
    color: category.color,
    description: category.description || ''
  }
  showEditModal.value = true
}

const confirmDeleteCategory = (category: BlogCategory) => {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

const deleteCategory = async () => {
  if (!categoryToDelete.value) return

  try {
    deleting.value = true
    await blogCategoryAPI.deleteCategory(categoryToDelete.value.id)
    const index = categories.value.findIndex(cat => cat.id === categoryToDelete.value!.id)
    if (index > -1) {
      categories.value.splice(index, 1)
    }
    showDeleteModal.value = false
    categoryToDelete.value = null
  } catch (error) {
    console.error('刪除分類失敗:', error)
    alert('刪除分類失敗，請稍後再試')
  } finally {
    deleting.value = false
  }
}

const toggleCategoryStatus = async (category: BlogCategory) => {
  try {
    const updatedCategory = await blogCategoryAPI.updateCategory(category.id, {
      is_active: !category.is_active
    })
    const index = categories.value.findIndex(cat => cat.id === category.id)
    if (index > -1) {
      categories.value[index] = updatedCategory
    }
  } catch (error) {
    console.error('更新分類狀態失敗:', error)
    alert('更新分類狀態失敗，請稍後再試')
  }
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingCategory.value = null
  formData.value = {
    name: '',
    color: '#3498db',
    description: ''
  }
  errors.value = {}
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

// 監聽搜尋變化，重置分頁
watch(searchQuery, () => {
  currentPage.value = 1
})

// 生命週期
onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.category-card {
  border: 1px solid var(--bs-border-color);
  transition: transform 0.2s, box-shadow 0.2s;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.category-badge {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
}

.category-info {
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
[data-bs-theme="dark"] .category-card {
  border-color: var(--bs-border-color);
  background: var(--bs-body-bg);
}

[data-bs-theme="dark"] .category-card:hover {
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
}
</style>
