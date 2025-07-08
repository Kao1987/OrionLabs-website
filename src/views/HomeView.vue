<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/services/api'

const router = useRouter()

// 型別定義
interface Service {
  id: number
  icon: string
  title: string
  description: string
}

interface Project {
  id: number
  title: string
  description: string
  technologies: string[]
  link: string
}

interface Skill {
  name: string
  level: number
}

// 服務項目 - 基本框架
const services = ref<Service[]>([
  {
    id: 1,
    icon: 'bi bi-code-slash',
    title: '前端開發',
    description: '請在此填入您的服務描述'
  },
  {
    id: 2,
    icon: 'bi bi-palette',
    title: 'UI/UX 設計',
    description: '請在此填入您的服務描述'
  },
  {
    id: 3,
    icon: 'bi bi-phone',
    title: '響應式設計',
    description: '請在此填入您的服務描述'
  }
])

// 精選作品 - 空陣列，等待真實內容
const featuredProjects = ref<Project[]>([])

// 技能統計 - 空陣列，等待真實內容
const skills = ref<Skill[]>([])

// 管理員登入相關
const clickCount = ref(0)
const showAdminLogin = ref(false)
const adminCredentials = ref({
  username: '',
  password: ''
})

// 三擊觸發管理員登入
const handleOrionClick = () => {
  clickCount.value++
  
  if (clickCount.value === 3) {
    showAdminLogin.value = true
    clickCount.value = 0
  }
  
  // 3秒後重置計數
  setTimeout(() => {
    if (clickCount.value < 3) {
      clickCount.value = 0
    }
  }, 3000)
}

// 管理員登入
const adminLogin = async () => {
  try {
    // 使用API服務進行認證
    const data = await authAPI.login(
      adminCredentials.value.username,
      adminCredentials.value.password
    )

    // 儲存真正的JWT token
    localStorage.setItem('adminToken', data.access_token)
    localStorage.setItem('tokenType', data.token_type)
    showAdminLogin.value = false
    adminCredentials.value = { username: '', password: '' }
    router.push('/admin')
  } catch (error: any) {
    console.error('登入錯誤:', error)
    alert(error.message || '登入失敗')
  }
}

// 關閉登入表單
const closeAdminLogin = () => {
  showAdminLogin.value = false
  adminCredentials.value = { username: '', password: '' }
}
</script>

<template>
  <div class="home-page">
    <!-- Hero 區塊 -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <div class="hero-content fade-in">
              <h1 class="hero-title">
                你好，我是
                <span 
                  class="text-warning admin-trigger" 
                  @click="handleOrionClick"
                  style="cursor: pointer; user-select: none;"
                >
                  Orion
                </span>
              </h1>
              <p class="hero-subtitle">
                新手全端工程師<br>
                專注於創造優質的數位體驗
              </p>
              <div class="hero-buttons">
                <router-link to="/portfolio" class="btn btn-primary btn-lg me-3">
                  查看作品集
                </router-link>
                <router-link to="/contact" class="btn btn-outline-light btn-lg">
                  聯絡我
                </router-link>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-image text-center">
              <div class="profile-container">
                <div class="profile-icon-container">
                  <i class="bi bi-person-circle display-1 text-light"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 服務項目 -->
    <section class="section">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h2 class="section-title">我的服務</h2>
            <p class="section-subtitle text-muted">專業的技術服務，滿足您的需求</p>
          </div>
        </div>
        <div class="row g-4">
          <div 
            v-for="service in services" 
            :key="service.id"
            class="col-lg-4 col-md-6"
          >
            <div class="card h-100 text-center">
              <div class="card-body p-4">
                <div class="service-icon mb-3">
                  <i :class="service.icon" class="display-4 text-primary"></i>
                </div>
                <h5 class="card-title">{{ service.title }}</h5>
                <p class="card-text text-muted">{{ service.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 精選作品 -->
    <section class="section section-alt" v-if="featuredProjects.length > 0">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h2 class="section-title">精選作品</h2>
            <p class="section-subtitle text-muted">展示我最優秀的專案成果</p>
          </div>
        </div>
        <div class="row g-4">
          <div 
            v-for="project in featuredProjects" 
            :key="project.id"
            class="col-lg-4 col-md-6"
          >
            <div class="card card-portfolio h-100">
              <div class="card-img-top d-flex align-items-center justify-content-center bg-light" style="height: 200px;">
                <i class="bi bi-image display-4 text-muted"></i>
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
                <a :href="project.link" class="btn btn-outline-primary btn-sm" target="_blank">
                  查看專案
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center mt-5">
          <router-link to="/portfolio" class="btn btn-primary">
            查看更多作品
          </router-link>
        </div>
      </div>
    </section>

    <!-- 技能統計 -->
    <section class="section" v-if="skills.length > 0">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h2 class="section-title">技能專長</h2>
            <p class="section-subtitle text-muted">多年經驗累積的技術能力</p>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-6">
            <div 
              v-for="skill in skills" 
              :key="skill.name"
              class="mb-4"
            >
              <div class="d-flex justify-content-between mb-2">
                <span class="fw-medium">{{ skill.name }}</span>
                <span class="text-muted">{{ skill.level }}%</span>
              </div>
              <div class="skill-bar">
                <div 
                  class="skill-progress" 
                  :style="{ width: skill.level + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA 區塊 -->
    <section class="section section-alt">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center">
            <h2 class="section-title">準備開始您的專案？</h2>
            <p class="section-subtitle text-muted mb-4">
              讓我們一起創造令人驚艷的數位體驗
            </p>
            <router-link to="/contact" class="btn btn-primary btn-lg">
              立即聯絡
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 管理員登入 Modal -->
    <div 
      v-if="showAdminLogin"
      class="modal fade show d-block" 
      style="background-color: rgba(0,0,0,0.5);"
      @click.self="closeAdminLogin"
    >
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">管理員登入</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeAdminLogin"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="adminLogin">
              <div class="mb-3">
                <label class="form-label">帳號</label>
                <input 
                  v-model="adminCredentials.username"
                  type="text" 
                  class="form-control" 
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">密碼</label>
                <input 
                  v-model="adminCredentials.password"
                  type="password" 
                  class="form-control" 
                  required
                >
              </div>
              <button type="submit" class="btn btn-primary w-100">
                登入
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-section {
  padding: 6rem 0;
}

.profile-container {
  position: relative;
  display: inline-block;
}

.profile-icon-container {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-buttons {
  margin-top: 2rem;
}

.service-icon {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.125rem;
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 4rem 0;
  }
  
  .profile-icon-container {
    width: 250px;
    height: 250px;
  }
  
  .hero-buttons {
    margin-top: 1.5rem;
  }
  
  .hero-buttons .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .hero-buttons .me-3 {
    margin-right: 0 !important;
  }
}

.admin-trigger:hover {
  text-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
}
</style>
