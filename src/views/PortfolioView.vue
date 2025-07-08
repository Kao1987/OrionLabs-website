<template>
  <div class="portfolio-page">
    <!-- 頁面標題 -->
    <section class="main-header">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center">
            <h1 class="display-4 fw-bold">作品集</h1>
            <p class="lead">展示我的設計與開發專案</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 篩選選單 -->
    <section class="section">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="filter-buttons text-center mb-5">
              <button
                v-for="category in categories"
                :key="category.id"
                @click="filterProjects(category.id)"
                :class="['btn', 'btn-outline-primary', 'me-2', 'mb-2', { active: activeFilter === category.id }]"
              >
                {{ category.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- 作品展示 -->
        <div class="row g-4" v-if="projects.length > 0">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="col-lg-4 col-md-6"
          >
            <div class="card card-portfolio h-100">
              <div class="position-relative">
                <div class="card-img-top d-flex align-items-center justify-content-center bg-light" style="height: 200px;">
                  <i 
                    :class="project.category === 'web' ? 'bi bi-code-slash' : 
                            project.category === 'design' ? 'bi bi-palette' : 
                            'bi bi-server'"
                    class="display-4 text-muted"
                  ></i>
                </div>
                <div class="portfolio-overlay">
                  <div class="overlay-content">
                    <button
                      @click="openModal(project)"
                      class="btn btn-light btn-sm me-2"
                    >
                      <i class="bi bi-eye"></i> 預覽
                    </button>
                    <a
                      :href="project.liveUrl"
                      target="_blank"
                      class="btn btn-primary btn-sm"
                      v-if="project.liveUrl"
                    >
                      <i class="bi bi-box-arrow-up-right"></i> 查看
                    </a>
                  </div>
                </div>
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
                  <small class="text-muted">{{ project.date }}</small>
                  <span class="badge bg-primary">{{ project.category }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空狀態顯示 -->
        <div class="row" v-else>
          <div class="col-12 text-center py-5">
            <i class="bi bi-folder2-open display-1 text-muted mb-3"></i>
            <h4 class="text-muted">尚無作品展示</h4>
            <p class="text-muted">請稍後再來查看我的最新作品</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 專案詳情 Modal -->
    <div
      class="modal fade"
      id="projectModal"
      tabindex="-1"
      aria-labelledby="projectModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content" v-if="selectedProject">
          <div class="modal-header">
            <h5 class="modal-title" id="projectModalLabel">
              {{ selectedProject.title }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <div class="d-flex align-items-center justify-content-center bg-light" style="height: 300px; border-radius: 8px;">
                  <i 
                    :class="selectedProject?.category === 'web' ? 'bi bi-code-slash' : 
                            selectedProject?.category === 'design' ? 'bi bi-palette' : 
                            'bi bi-server'"
                    class="display-1 text-muted"
                  ></i>
                </div>
              </div>
              <div class="col-md-6">
                <p>{{ selectedProject.fullDescription }}</p>
                <h6>使用技術：</h6>
                <div class="d-flex flex-wrap gap-1 mb-3">
                  <span
                    v-for="tech in selectedProject.technologies"
                    :key="tech"
                    class="badge bg-primary"
                  >
                    {{ tech }}
                  </span>
                </div>
                <h6>專案特色：</h6>
                <ul>
                  <li v-for="feature in selectedProject.features" :key="feature">
                    {{ feature }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <a
              v-if="selectedProject.githubUrl"
              :href="selectedProject.githubUrl"
              target="_blank"
              class="btn btn-outline-primary"
            >
              <i class="bi bi-github"></i> GitHub
            </a>
            <a
              v-if="selectedProject.liveUrl"
              :href="selectedProject.liveUrl"
              target="_blank"
              class="btn btn-primary"
            >
              <i class="bi bi-box-arrow-up-right"></i> 查看專案
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Project {
  id: number
  title: string
  description: string
  fullDescription: string
  image: string
  technologies: string[]
  category: string
  date: string
  liveUrl?: string
  githubUrl?: string
  features: string[]
}

interface Category {
  id: string
  name: string
}

// 篩選類別
const categories = ref<Category[]>([
  { id: 'all', name: '全部' },
  { id: 'web', name: '網站開發' },
  { id: 'mobile', name: '行動應用' },
  { id: 'design', name: 'UI/UX 設計' }
])

// 當前篩選
const activeFilter = ref('all')

// 選中的專案
const selectedProject = ref<Project | null>(null)

// 專案資料 - 空陣列，等待真實內容
const projects = ref<Project[]>([])

// 篩選後的專案
const filteredProjects = computed(() => {
  if (activeFilter.value === 'all') {
    return projects.value
  }
  return projects.value.filter(project => {
    const categoryMap: { [key: string]: string } = {
      'web': '網站開發',
      'mobile': '行動應用',
      'design': 'UI/UX 設計'
    }
    return project.category === categoryMap[activeFilter.value]
  })
})

// 篩選專案
const filterProjects = (categoryId: string) => {
  activeFilter.value = categoryId
}

// 開啟專案詳情
const openModal = (project: Project) => {
  selectedProject.value = project
  // 使用 Bootstrap Modal API
  const modalElement = document.getElementById('projectModal')
  if (modalElement) {
    // @ts-ignore
    const modal = new bootstrap.Modal(modalElement)
    modal.show()
  }
}

onMounted(() => {
  // 確保 Bootstrap JS 已載入
})
</script>

<style scoped>
.portfolio-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-portfolio:hover .portfolio-overlay {
  opacity: 1;
}

.overlay-content {
  text-align: center;
}

.filter-buttons .btn.active {
  background-color: var(--brand-primary);
  border-color: var(--brand-primary);
  color: white;
}

@media (max-width: 768px) {
  .filter-buttons .btn {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
}
</style> 