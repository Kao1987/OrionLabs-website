<template>
  <div class="technology-tag-input">
    <div class="input-section">
      <div class="form-group">
        <label class="form-label">技術標籤</label>
        <div class="tag-input-container">
          <input
            ref="tagInput"
            v-model="inputValue"
            type="text"
            class="form-control tag-input"
            placeholder="輸入技術名稱（如：Vue.js, React, TypeScript...）"
            @input="handleInput"
            @keydown="handleKeydown"
            @focus="showDropdown = true"
            @blur="handleBlur"
          />
          <div v-if="showDropdown && (filteredSuggestions.length > 0 || inputValue.trim())" class="dropdown-menu show">
            <!-- 建議的現有標籤 -->
            <div v-if="filteredSuggestions.length > 0" class="dropdown-section">
              <div class="dropdown-header">建議標籤</div>
              <button
                v-for="tag in filteredSuggestions"
                :key="tag.id"
                type="button"
                class="dropdown-item d-flex justify-content-between align-items-center"
                @mousedown.prevent="selectTag(tag)"
              >
                <span>
                  <span class="tag-badge me-2" :style="{ backgroundColor: tag.color }">
                    {{ tag.name }}
                  </span>
                  <small class="text-muted">使用 {{ tag.usage_count }} 次</small>
                </span>
              </button>
            </div>

            <!-- 創建新標籤選項 -->
            <div v-if="inputValue.trim() && !isExistingTag" class="dropdown-section">
              <div class="dropdown-header">新建標籤</div>
              <button
                type="button"
                class="dropdown-item"
                @mousedown.prevent="createNewTag"
              >
                <i class="bi bi-plus-circle me-2"></i>
                建立新標籤：<strong>{{ inputValue.trim() }}</strong>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 已選擇的標籤顯示 -->
    <div v-if="selectedTags.length > 0" class="selected-tags mt-3">
      <div class="d-flex flex-wrap gap-2">
        <span
          v-for="tag in selectedTags"
          :key="tag.id"
          class="badge tag-selected d-flex align-items-center"
          :style="{ backgroundColor: tag.color }"
        >
          {{ tag.name }}
          <button
            type="button"
            class="btn-close btn-close-white ms-2"
            aria-label="移除標籤"
            @click="removeTag(tag)"
          ></button>
        </span>
      </div>
    </div>

    <!-- 新標籤建立對話框 -->
    <div v-if="showCreateDialog" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">建立新技術標籤</h5>
            <button type="button" class="btn-close" @click="cancelCreate"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">標籤名稱</label>
              <input
                v-model="newTag.name"
                type="text"
                class="form-control"
                readonly
              />
            </div>
            <div class="mb-3">
              <label class="form-label">分類</label>
              <select v-model="newTag.category" class="form-select">
                <option value="technology">技術</option>
                <option value="general">一般</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">顏色</label>
              <div class="d-flex gap-2 flex-wrap">
                <button
                  v-for="color in predefinedColors"
                  :key="color"
                  type="button"
                  class="btn color-option"
                  :class="{ active: newTag.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="newTag.color = color"
                ></button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cancelCreate">取消</button>
            <button type="button" class="btn btn-primary" @click="confirmCreate" :disabled="creating">
              <span v-if="creating" class="spinner-border spinner-border-sm me-2"></span>
              建立
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showCreateDialog" class="modal-backdrop show"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { technologyTagAPI, type TechnologyTag, type TechnologyTagCreate } from '@/services/api'

// Props
interface Props {
  modelValue: TechnologyTag[]
  placeholder?: string
  maxTags?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '輸入技術名稱...',
  maxTags: 10
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: TechnologyTag[]]
}>()

// Refs
const tagInput = ref<HTMLInputElement>()
const inputValue = ref('')
const showDropdown = ref(false)
const availableTags = ref<TechnologyTag[]>([])
const selectedTags = ref<TechnologyTag[]>([...props.modelValue])
const loading = ref(false)

// 新標籤建立相關
const showCreateDialog = ref(false)
const creating = ref(false)
const newTag = ref<TechnologyTagCreate>({
  name: '',
  color: '#3498db',
  category: 'technology'
})

// 預定義顏色選項
const predefinedColors = [
  '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#34495e', '#e67e22',
  '#95a5a6', '#27ae60', '#8e44ad', '#16a085'
]

// Computed
const filteredSuggestions = computed(() => {
  if (!inputValue.value.trim()) return []

  const query = inputValue.value.toLowerCase().trim()
  const alreadySelected = selectedTags.value.map(tag => tag.id)

  return availableTags.value
    .filter(tag =>
      !alreadySelected.includes(tag.id) &&
      tag.name.toLowerCase().includes(query)
    )
    .slice(0, 8) // 限制顯示數量
})

const isExistingTag = computed(() => {
  const query = inputValue.value.trim().toLowerCase()
  return availableTags.value.some(tag => tag.name.toLowerCase() === query)
})

// Methods
const loadTags = async () => {
  try {
    loading.value = true
    // 優先載入技術標籤，其次是一般標籤
    const [techTags, generalTags] = await Promise.all([
      technologyTagAPI.getTechnologyTags('technology'),
      technologyTagAPI.getTechnologyTags('general')
    ])
    availableTags.value = [...techTags, ...generalTags]
  } catch (error) {
    console.error('載入標籤失敗:', error)
  } finally {
    loading.value = false
  }
}

const handleInput = () => {
  showDropdown.value = true
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    if (filteredSuggestions.value.length > 0) {
      selectTag(filteredSuggestions.value[0])
    } else if (inputValue.value.trim() && !isExistingTag.value) {
      createNewTag()
    }
  } else if (event.key === 'Escape') {
    showDropdown.value = false
  }
}

const handleBlur = () => {
  // 延遲隱藏下拉選單，讓點擊事件能正常執行
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const selectTag = (tag: TechnologyTag) => {
  if (selectedTags.value.length >= props.maxTags) {
    alert(`最多只能選擇 ${props.maxTags} 個標籤`)
    return
  }

  if (!selectedTags.value.find(selected => selected.id === tag.id)) {
    selectedTags.value.push(tag)
    inputValue.value = ''
    showDropdown.value = false
    emit('update:modelValue', selectedTags.value)
  }
}

const removeTag = (tag: TechnologyTag) => {
  const index = selectedTags.value.findIndex(selected => selected.id === tag.id)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
    emit('update:modelValue', selectedTags.value)
  }
}

const createNewTag = () => {
  newTag.value.name = inputValue.value.trim()
  showCreateDialog.value = true
  showDropdown.value = false
}

const confirmCreate = async () => {
  try {
    creating.value = true
    const createdTag = await technologyTagAPI.createTechnologyTag(newTag.value)
    availableTags.value.push(createdTag)
    selectTag(createdTag)
    showCreateDialog.value = false
    resetCreateDialog()
  } catch (error) {
    console.error('建立標籤失敗:', error)
    alert('建立標籤失敗，請稍後再試')
  } finally {
    creating.value = false
  }
}

const cancelCreate = () => {
  showCreateDialog.value = false
  resetCreateDialog()
}

const resetCreateDialog = () => {
  newTag.value = {
    name: '',
    color: '#3498db',
    category: 'technology'
  }
}

// 監聽 props 變化
watch(() => props.modelValue, (newValue) => {
  selectedTags.value = [...newValue]
}, { deep: true })

// 生命週期
onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.technology-tag-input {
  position: relative;
}

.tag-input-container {
  position: relative;
}

.tag-input {
  padding-right: 2.5rem;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
  background: var(--bs-body-bg);
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.dropdown-section {
  padding: 0.5rem 0;
}

.dropdown-section:not(:last-child) {
  border-bottom: 1px solid var(--bs-border-color);
}

.dropdown-header {
  padding: 0.25rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--bs-secondary);
  background: var(--bs-light);
}

.dropdown-item {
  border: none;
  text-align: left;
  width: 100%;
  padding: 0.5rem 1rem;
  background: transparent;
  color: var(--bs-body-color);
}

.dropdown-item:hover {
  background: var(--bs-primary-bg-subtle);
  color: var(--bs-primary);
}

.tag-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.selected-tags {
  min-height: 2rem;
}

.tag-selected {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: white !important;
  border-radius: 0.5rem;
}

.tag-selected .btn-close {
  font-size: 0.75rem;
  opacity: 0.8;
}

.tag-selected .btn-close:hover {
  opacity: 1;
}

.color-option {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid transparent;
  padding: 0;
}

.color-option.active {
  border-color: var(--bs-primary);
  transform: scale(1.1);
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

/* 深色模式支援 */
[data-bs-theme="dark"] .dropdown-menu {
  background: var(--bs-dark);
  border-color: var(--bs-border-color);
}

[data-bs-theme="dark"] .dropdown-header {
  background: var(--bs-secondary-bg);
  color: var(--bs-secondary-color);
}

[data-bs-theme="dark"] .dropdown-item:hover {
  background: var(--bs-primary-bg-subtle);
}
</style>
