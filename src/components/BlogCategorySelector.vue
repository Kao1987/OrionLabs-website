<template>
  <div class="blog-category-selector">
    <div class="form-group">
      <label class="form-label">文章分類</label>
      <div class="category-selection">
        <select
          v-model="selectedCategoryId"
          class="form-select"
          :class="{ 'is-invalid': error }"
          @change="handleCategoryChange"
        >
          <option value="">請選擇分類</option>
          <option
            v-for="category in availableCategories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }} ({{ category.post_count }} 篇文章)
          </option>
        </select>
        <div v-if="error" class="invalid-feedback">{{ error }}</div>
      </div>

      <!-- 快速新增分類 -->
      <div class="mt-2">
        <button
          type="button"
          class="btn btn-link btn-sm p-0"
          @click="showQuickAdd = !showQuickAdd"
        >
          <i class="bi bi-plus-circle me-1"></i>
          快速新增分類
        </button>
      </div>

      <!-- 快速新增表單 -->
      <div v-if="showQuickAdd" class="mt-3 p-3 border rounded bg-light">
        <div class="row">
          <div class="col-md-6">
            <label class="form-label small">分類名稱</label>
            <input
              v-model="newCategoryName"
              type="text"
              class="form-control form-control-sm"
              placeholder="如：前端技術"
              maxlength="50"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label small">顏色</label>
            <div class="d-flex gap-1">
              <button
                v-for="color in quickColors"
                :key="color"
                type="button"
                class="btn btn-sm color-quick-option"
                :class="{ active: newCategoryColor === color }"
                :style="{ backgroundColor: color }"
                @click="newCategoryColor = color"
              ></button>
            </div>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button
              type="button"
              class="btn btn-success btn-sm"
              @click="createQuickCategory"
              :disabled="!newCategoryName.trim() || creating"
            >
              <span v-if="creating" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-check me-1"></i>
              新增
            </button>
          </div>
        </div>
      </div>

      <!-- 已選分類顯示 -->
      <div v-if="selectedCategory" class="mt-3">
        <div class="d-flex align-items-center">
          <span class="text-muted small me-2">已選分類：</span>
          <span
            class="badge category-preview"
            :style="{ backgroundColor: selectedCategory.color }"
          >
            {{ selectedCategory.name }}
          </span>
          <button
            type="button"
            class="btn btn-link btn-sm p-0 ms-2"
            @click="clearSelection"
          >
            <i class="bi bi-x-circle"></i>
          </button>
        </div>
        <div v-if="selectedCategory.description" class="mt-1">
          <small class="text-muted">{{ selectedCategory.description }}</small>
        </div>
      </div>

      <!-- 分類統計（管理員檢視） -->
      <div v-if="showStats && categories.length > 0" class="mt-3">
        <div class="category-stats">
          <h6 class="text-muted small mb-2">分類統計</h6>
          <div class="row">
            <div
              v-for="category in popularCategories"
              :key="category.id"
              class="col-auto mb-1"
            >
              <span
                class="badge category-stat"
                :style="{ backgroundColor: category.color }"
                @click="selectCategory(category.id)"
                role="button"
              >
                {{ category.name }} ({{ category.post_count }})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { blogCategoryAPI, type BlogCategory } from '@/services/api'

// Props
interface Props {
  modelValue?: number | string | null
  error?: string
  showStats?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  error: '',
  showStats: false,
  required: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  'categorySelected': [category: BlogCategory | null]
}>()

// Refs
const categories = ref<BlogCategory[]>([])
const selectedCategoryId = ref<number | null>(null)
const loading = ref(false)
const creating = ref(false)

// 快速新增相關
const showQuickAdd = ref(false)
const newCategoryName = ref('')
const newCategoryColor = ref('#3498db')

// 快速顏色選項
const quickColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c']

// Computed
const availableCategories = computed(() =>
  categories.value.filter(cat => cat.is_active).sort((a, b) => a.name.localeCompare(b.name))
)

const selectedCategory = computed(() =>
  selectedCategoryId.value ? categories.value.find(cat => cat.id === selectedCategoryId.value) || null : null
)

const popularCategories = computed(() =>
  [...categories.value]
    .filter(cat => cat.is_active && cat.post_count > 0)
    .sort((a, b) => b.post_count - a.post_count)
    .slice(0, 8)
)

// Methods
const loadCategories = async () => {
  try {
    loading.value = true
    categories.value = await blogCategoryAPI.getCategories()
  } catch (error) {
    console.error('載入分類失敗:', error)
  } finally {
    loading.value = false
  }
}

const handleCategoryChange = () => {
  const categoryId = selectedCategoryId.value
  emit('update:modelValue', categoryId)
  emit('categorySelected', selectedCategory.value)
}

const selectCategory = (categoryId: number) => {
  selectedCategoryId.value = categoryId
  handleCategoryChange()
}

const clearSelection = () => {
  selectedCategoryId.value = null
  handleCategoryChange()
}

const createQuickCategory = async () => {
  if (!newCategoryName.value.trim()) return

  try {
    creating.value = true
    const newCategory = await blogCategoryAPI.createCategory({
      name: newCategoryName.value.trim(),
      color: newCategoryColor.value,
      description: ''
    })

    // 新增到本地列表
    categories.value.push(newCategory)

    // 自動選中新建的分類
    selectedCategoryId.value = newCategory.id
    handleCategoryChange()

    // 重置表單
    newCategoryName.value = ''
    newCategoryColor.value = '#3498db'
    showQuickAdd.value = false

  } catch (error) {
    console.error('建立分類失敗:', error)
    alert('建立分類失敗，請稍後再試')
  } finally {
    creating.value = false
  }
}

// 監聽 props 變化
watch(() => props.modelValue, (newValue) => {
  if (typeof newValue === 'number') {
    selectedCategoryId.value = newValue
  } else if (typeof newValue === 'string') {
    const numValue = parseInt(newValue)
    selectedCategoryId.value = isNaN(numValue) ? null : numValue
  } else {
    selectedCategoryId.value = null
  }
}, { immediate: true })

// 生命週期
onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.category-selection {
  position: relative;
}

.category-preview {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
}

.color-quick-option {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 2px solid transparent;
  padding: 0;
}

.color-quick-option.active {
  border-color: var(--bs-primary);
  transform: scale(1.1);
}

.category-stat {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.category-stat:hover {
  opacity: 0.8;
}

.category-stats {
  padding: 0.75rem;
  background: var(--bs-light);
  border-radius: 0.375rem;
  border: 1px solid var(--bs-border-color);
}

/* 深色模式支援 */
[data-bs-theme="dark"] .category-stats {
  background: var(--bs-secondary-bg);
  border-color: var(--bs-border-color);
}

[data-bs-theme="dark"] .bg-light {
  background: var(--bs-secondary-bg) !important;
  border-color: var(--bs-border-color) !important;
}
</style>
