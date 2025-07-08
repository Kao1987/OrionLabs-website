<template>
  <div class="admin-page">
    <!-- 頂部導航 -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <span class="navbar-brand">
          <i class="bi bi-shield-lock me-2"></i>
          管理後台
        </span>
        <div class="navbar-nav ms-auto">
          <button @click="logout" class="btn btn-outline-light">
            <i class="bi bi-box-arrow-right me-1"></i>
            登出
          </button>
        </div>
      </div>
    </nav>

    <div class="container-fluid">
      <div class="row">
        <!-- 側邊欄 -->
        <nav class="col-md-3 col-lg-2 d-md-block bg-light sidebar">
          <div class="position-sticky pt-3">
            <ul class="nav flex-column">
              <li class="nav-item">
                <a 
                  class="nav-link"
                  :class="{ active: activeTab === 'dashboard' }"
                  @click="activeTab = 'dashboard'"
                  href="#"
                >
                  <i class="bi bi-speedometer2 me-2"></i>
                  儀表板
                </a>
              </li>
              <li class="nav-item">
                <a 
                  class="nav-link"
                  :class="{ active: activeTab === 'blog' }"
                  @click="activeTab = 'blog'"
                  href="#"
                >
                  <i class="bi bi-journal-text me-2"></i>
                  部落格管理
                </a>
              </li>
              <li class="nav-item">
                <a 
                  class="nav-link"
                  :class="{ active: activeTab === 'portfolio' }"
                  @click="activeTab = 'portfolio'"
                  href="#"
                >
                  <i class="bi bi-briefcase me-2"></i>
                  作品集管理
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <!-- 主要內容 -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <!-- 儀表板 -->
          <div v-if="activeTab === 'dashboard'" class="dashboard">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 class="h2">儀表板</h1>
            </div>
            
            <div class="row">
              <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-primary shadow h-100 py-2">
                  <div class="card-body">
                    <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                        <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                          部落格文章
                        </div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800">
                          {{ stats.blogPosts }}
                        </div>
                      </div>
                      <div class="col-auto">
                        <i class="bi bi-journal-text display-6 text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-success shadow h-100 py-2">
                  <div class="card-body">
                    <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                        <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                          作品專案
                        </div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800">
                          {{ stats.portfolioItems }}
                        </div>
                      </div>
                      <div class="col-auto">
                        <i class="bi bi-briefcase display-6 text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 快速操作 -->
            <div class="row">
              <div class="col-12">
                <h3>快速操作</h3>
                <div class="btn-group" role="group">
                  <button 
                    @click="activeTab = 'blog'"
                    class="btn btn-primary"
                  >
                    <i class="bi bi-plus-circle me-1"></i>
                    新增文章
                  </button>
                  <button 
                    @click="activeTab = 'portfolio'"
                    class="btn btn-success"
                  >
                    <i class="bi bi-plus-circle me-1"></i>
                    新增作品
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 部落格管理 -->
          <BlogManagement v-if="activeTab === 'blog'" />

          <!-- 作品集管理 -->
          <PortfolioManagement v-if="activeTab === 'portfolio'" />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BlogManagement from '@/components/admin/BlogManagement.vue'
import PortfolioManagement from '@/components/admin/PortfolioManagement.vue'

const router = useRouter()
const activeTab = ref('dashboard')

// 統計數據
const stats = ref({
  blogPosts: 0,
  portfolioItems: 0
})

// 檢查登入狀態
onMounted(() => {
  const token = localStorage.getItem('adminToken')
  if (!token) {
    router.push('/')
  }
  
  // 載入統計數據
  loadStats()
})

// 載入統計數據
const loadStats = () => {
  // 這裡之後會連接API
  stats.value = {
    blogPosts: 0,
    portfolioItems: 0
  }
}

// 登出
const logout = () => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('tokenType')
  router.push('/')
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 56px;
  bottom: 0;
  left: 0;
  z-index: 100;
  padding: 48px 0 0;
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, .1);
}

.sidebar .nav-link {
  color: #333;
  cursor: pointer;
}

.sidebar .nav-link.active {
  color: #007bff;
  background-color: rgba(0, 123, 255, .1);
}

.sidebar .nav-link:hover {
  color: #007bff;
}

.card {
  border-left: 4px solid;
}

.border-left-primary {
  border-left-color: #4e73df !important;
}

.border-left-success {
  border-left-color: #1cc88a !important;
}

@media (max-width: 767.98px) {
  .sidebar {
    position: relative;
    top: 0;
  }
}
</style> 