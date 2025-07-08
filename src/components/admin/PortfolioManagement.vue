<template>
  <div class="portfolio-management">
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="h2">作品集管理</h1>
      <button @click="showAddModal = true" class="btn btn-success">
        <i class="bi bi-plus-circle me-1"></i>
        新增作品
      </button>
    </div>

    <!-- 作品展示卡片 -->
    <div class="row g-4">
      <div
        v-for="project in portfolioItems"
        :key="project.id"
        class="col-lg-4 col-md-6"
      >
        <div class="card h-100">
          <div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
            <i 
              :class="getCategoryIcon(project.category)"
              class="display-4 text-muted"
            ></i>
          </div>
          <div class="card-body">
            <h5 class="card-title">{{ project.title }}</h5>
            <p class="card-text text-muted">{{ project.description }}</p>
            <div class="d-flex flex-wrap gap-1 mb-3">
              <span
                v-for="tech in project.technologies"
                :key="tech"
                class="badge bg-secondary"
              >
                {{ tech }}
              </span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge bg-primary">{{ project.category }}</span>
              <span 
                class="badge" 
                :class="project.status === 'completed' ? 'bg-success' : 'bg-warning'"
              >
                {{ getStatusText(project.status) }}
              </span>
            </div>
          </div>
          <div class="card-footer">
            <div class="btn-group w-100" role="group">
              <button 
                @click="editProject(project)" 
                class="btn btn-outline-primary btn-sm"
              >
                <i class="bi bi-pencil"></i> 編輯
              </button>
              <button 
                @click="deleteProject(project.id)" 
                class="btn btn-outline-danger btn-sm"
              >
                <i class="bi bi-trash"></i> 刪除
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空狀態 -->
      <div v-if="portfolioItems.length === 0" class="col-12 text-center py-5">
        <i class="bi bi-briefcase display-1 text-muted mb-3"></i>
        <h4 class="text-muted">暫無作品</h4>
        <p class="text-muted">點擊上方「新增作品」開始展示您的專案</p>
      </div>
    </div>

    <!-- 新增/編輯作品 Modal -->
    <div 
      v-if="showAddModal || showEditModal"
      class="modal fade show d-block" 
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ showEditModal ? '編輯作品' : '新增作品' }}
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeModal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProject">
              <div class="row">
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label">作品標題</label>
                    <input 
                      v-model="currentProject.title"
                      type="text" 
                      class="form-control" 
                      required
                    >
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">類別</label>
                    <select v-model="currentProject.category" class="form-select" required>
                      <option value="">選擇類別</option>
                      <option value="web">網站開發</option>
                      <option value="mobile">行動應用</option>
                      <option value="design">UI/UX 設計</option>
                      <option value="backend">後端開發</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">簡短描述</label>
                <textarea 
                  v-model="currentProject.description"
                  class="form-control" 
                  rows="3"
                  placeholder="專案的簡短描述..."
                  required
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">詳細描述</label>
                <textarea 
                  v-model="currentProject.fullDescription"
                  class="form-control" 
                  rows="5"
                  placeholder="專案的詳細說明、挑戰、解決方案等..."
                  required
                ></textarea>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">使用技術（用逗號分隔）</label>
                    <input 
                      v-model="technologiesInput"
                      type="text" 
                      class="form-control" 
                      placeholder="Vue.js, Node.js, MongoDB"
                      required
                    >
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">完成日期</label>
                    <input 
                      v-model="currentProject.date"
                      type="date" 
                      class="form-control" 
                      required
                    >
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">狀態</label>
                    <select v-model="currentProject.status" class="form-select">
                      <option value="in-progress">進行中</option>
                      <option value="completed">已完成</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">專案網址</label>
                    <input 
                      v-model="currentProject.liveUrl"
                      type="url" 
                      class="form-control" 
                      placeholder="https://example.com"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">GitHub 網址</label>
                    <input 
                      v-model="currentProject.githubUrl"
                      type="url" 
                      class="form-control" 
                      placeholder="https://github.com/username/repo"
                    >
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">專案特色（每行一個）</label>
                <textarea 
                  v-model="featuresInput"
                  class="form-control" 
                  rows="4"
                  placeholder="響應式設計&#10;使用者體驗優化&#10;效能優化&#10;..."
                ></textarea>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeModal">
                  取消
                </button>
                <button type="submit" class="btn btn-success">
                  {{ showEditModal ? '更新' : '儲存' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface PortfolioItem {
  id: number
  title: string
  description: string
  fullDescription: string
  technologies: string[]
  category: 'web' | 'mobile' | 'design' | 'backend'
  date: string
  liveUrl?: string
  githubUrl?: string
  features: string[]
  status: 'in-progress' | 'completed'
}

const portfolioItems = ref<PortfolioItem[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const currentProject = ref<Partial<PortfolioItem>>({
  title: '',
  description: '',
  fullDescription: '',
  technologies: [],
  category: 'web',
  date: '',
  features: [],
  status: 'completed'
})

const technologiesInput = ref('')
const featuresInput = ref('')

// 載入作品列表
onMounted(() => {
  loadPortfolio()
})

const loadPortfolio = () => {
  // 這裡之後會連接API
  // 目前使用 localStorage 模擬
  const saved = localStorage.getItem('portfolioItems')
  if (saved) {
    portfolioItems.value = JSON.parse(saved)
  }
}

const savePortfolio = () => {
  localStorage.setItem('portfolioItems', JSON.stringify(portfolioItems.value))
}

const getCategoryIcon = (category: string) => {
  const icons = {
    web: 'bi bi-code-slash',
    mobile: 'bi bi-phone',
    design: 'bi bi-palette',
    backend: 'bi bi-server'
  }
  return icons[category as keyof typeof icons] || 'bi bi-folder'
}

const getStatusText = (status: string) => {
  return status === 'completed' ? '已完成' : '進行中'
}

const saveProject = () => {
  const technologies = technologiesInput.value.split(',').map(tech => tech.trim()).filter(tech => tech)
  const features = featuresInput.value.split('\n').map(feature => feature.trim()).filter(feature => feature)
  
  const projectData = {
    ...currentProject.value,
    technologies,
    features
  } as PortfolioItem

  if (showEditModal.value) {
    // 更新作品
    const index = portfolioItems.value.findIndex(p => p.id === projectData.id)
    if (index !== -1) {
      portfolioItems.value[index] = projectData
    }
  } else {
    // 新增作品
    projectData.id = Date.now()
    portfolioItems.value.unshift(projectData)
  }

  savePortfolio()
  closeModal()
}

const editProject = (project: PortfolioItem) => {
  currentProject.value = { ...project }
  technologiesInput.value = project.technologies.join(', ')
  featuresInput.value = project.features.join('\n')
  showEditModal.value = true
}

const deleteProject = (id: number) => {
  if (confirm('確定要刪除這個作品嗎？')) {
    portfolioItems.value = portfolioItems.value.filter(p => p.id !== id)
    savePortfolio()
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  currentProject.value = {
    title: '',
    description: '',
    fullDescription: '',
    technologies: [],
    category: 'web',
    date: '',
    features: [],
    status: 'completed'
  }
  technologiesInput.value = ''
  featuresInput.value = ''
}
</script>

<style scoped>
.card {
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.modal {
  z-index: 1055;
}

.badge {
  font-size: 0.75rem;
}

textarea {
  resize: vertical;
}

.card-footer {
  background-color: transparent;
  border-top: 1px solid rgba(0,0,0,.125);
}
</style> 