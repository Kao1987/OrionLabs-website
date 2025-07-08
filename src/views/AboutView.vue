<template>
  <div class="about-page">
    <!-- Hero 區塊 -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-5">
            <div class="about-image text-center">
              <div class="about-icon-container">
                <i class="bi bi-person-workspace display-1 text-primary"></i>
              </div>
            </div>
          </div>
          <div class="col-lg-7">
            <div class="hero-content">
              <h1 class="hero-title text-white">
                關於我
              </h1>
              <p class="hero-subtitle text-white-50">
                新手全端工程師<br>
                熱愛創造優質的數位體驗
              </p>
              <div class="hero-stats row g-4 mt-4">
                <div class="col-4">
                  <div class="text-center">
                    <h3 class="text-warning mb-0">0+</h3>
                    <small class="text-white-50">年經驗</small>
                  </div>
                </div>
                <div class="col-4">
                  <div class="text-center">
                    <h3 class="text-warning mb-0">0+</h3>
                    <small class="text-white-50">完成專案</small>
                  </div>
                </div>
                <div class="col-4">
                  <div class="text-center">
                    <h3 class="text-warning mb-0">0+</h3>
                    <small class="text-white-50">客戶</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 個人簡介 -->
    <section class="section">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="text-center mb-5">
              <h2 class="section-title">我的故事</h2>
              <div class="section-divider mx-auto"></div>
            </div>
            <div class="content-text">
              <p class="lead">
                你好！我是Orion。
              </p>
              <p>
                一位正在轉職中的網頁開發者，專注於前端技術與全端網站架構設計。<br>
                我喜歡打造清晰、實用且有良好使用者體驗的網頁，並相信每一段程式碼都是解決問題的橋樑。<br>
                目前正在開發自己的專案，記錄學習歷程，也歡迎你瀏覽我的作品，一起見證我的成長！
              </p>
              <p>
                目前使用 Vue.js、Node.js、Bootstrap 5 與 Vite 開發響應式網站，並持續學習提升程式實力。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 專業技能 -->
    <section class="section section-alt">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h2 class="section-title">專業技能</h2>
            <p class="section-subtitle text-muted">努力累積的技術專長</p>
          </div>
        </div>
        <div class="row g-4">
          <div
            v-for="skillCategory in skillCategories"
            :key="skillCategory.category"
            class="col-lg-4 col-md-6"
          >
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="skill-icon mb-3">
                  <i :class="skillCategory.icon" class="display-4 text-primary"></i>
                </div>
                <h5 class="card-title">{{ skillCategory.category }}</h5>
                <div class="skill-list">
                  <span
                    v-for="skill in skillCategory.skills"
                    :key="skill"
                    class="badge bg-light text-dark me-1 mb-1"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 工作經歷 -->
    <!-- <section class="section">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h2 class="section-title">工作經歷</h2>
            <p class="section-subtitle text-muted">職業發展歷程</p>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="timeline">
              <div
                v-for="experience in experiences"
                :key="experience.id"
                class="timeline-item"
              >
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <div class="timeline-period">{{ experience.period }}</div>
                  <h5 class="timeline-title">{{ experience.position }}</h5>
                  <h6 class="timeline-company text-muted">{{ experience.company }}</h6>
                  <p class="timeline-description">{{ experience.description }}</p>
                  <div class="timeline-achievements">
                    <ul class="list-unstyled">
                      <li
                        v-for="achievement in experience.achievements"
                        :key="achievement"
                        class="mb-1"
                      >
                        <i class="bi bi-check-circle text-success me-2"></i>
                        {{ achievement }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section> -->


    <!-- 興趣愛好 -->
    <section class="section" v-if="hobbies.length > 0">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h2 class="section-title">興趣愛好</h2>
            <p class="section-subtitle text-muted">工作之外的我</p>
          </div>
        </div>
        <div class="row g-4">
          <div
            v-for="hobby in hobbies"
            :key="hobby.id"
            class="col-lg-3 col-md-6"
          >
            <div class="hobby-card text-center">
              <div class="hobby-icon mb-3">
                <i :class="hobby.icon" class="display-4 text-primary"></i>
              </div>
              <h6>{{ hobby.name }}</h6>
              <p class="text-muted small">{{ hobby.description }}</p>
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
            <h2 class="section-title">想要合作嗎？</h2>
            <p class="section-subtitle text-muted mb-4">
              讓我們一起創造令人驚艷的數位體驗
            </p>
            <router-link to="/contact" class="btn btn-primary btn-lg">
              開始對話
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 型別定義
interface SkillCategory {
  category: string
  icon: string
  skills: string[]
}

interface Experience {
  id: number
  period: string
  position: string
  company: string
  description: string
  achievements: string[]
}

interface Hobby {
  id: number
  name: string
  icon: string
  description: string
}

// 技能分類 - 基本框架
const skillCategories = ref<SkillCategory[]>([
  {
    category: '前端開發',
    icon: 'bi bi-code-slash',
    skills: ['Vue.js', 'Node.js', 'Bootstrap 5', 'Vite']
  },
  {
    category: 'UI/UX 設計',
    icon: 'bi bi-palette',
    skills: ['Figma']
  },
  {
    category: '開發工具',
    icon: 'bi bi-gear',
    skills: ['Git', 'GitHub', 'VS Code', 'Terminal']
  }
])

// 工作經歷 - 空陣列，等待真實內容
const experiences = ref<Experience[]>([])

// 興趣愛好 - 空陣列，等待真實內容
const hobbies = ref<Hobby[]>([])
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
  padding: 6rem 0;
}

.section-divider {
  width: 60px;
  height: 3px;
  background: var(--brand-primary);
  margin: 1rem auto 2rem;
}

.content-text {
  font-size: 1.1rem;
  line-height: 1.8;
}

.skill-icon {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--brand-light);
}

.timeline-item {
  position: relative;
  margin-bottom: 3rem;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 8px;
  width: 12px;
  height: 12px;
  background: var(--brand-primary);
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 3px var(--brand-light);
}

.timeline-content {
  padding-left: 1rem;
}

.timeline-period {
  display: inline-block;
  background: var(--brand-primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.timeline-title {
  color: var(--brand-primary);
  margin-bottom: 0.25rem;
}

.timeline-company {
  margin-bottom: 0.75rem;
}

.timeline-description {
  margin-bottom: 1rem;
}

.hobby-card {
  padding: 1.5rem;
  transition: transform 0.3s ease;
}

.hobby-card:hover {
  transform: translateY(-5px);
}

.hobby-icon {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 4rem 0;
  }
  
  .timeline {
    padding-left: 1.5rem;
  }
  
  .timeline-marker {
    left: -1.5rem;
  }
}
</style>
