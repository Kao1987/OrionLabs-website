<template>
  <div class="about-page">
    <!-- Hero 區塊 -->
    <section class="about-hero">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-5">
            <div class="about-hero__image text-center">
              <div class="about-hero__icon-container">
                <i class="bi bi-person-workspace display-1 text_primary"></i>
              </div>
            </div>
          </div>
          <div class="col-lg-7">
            <div class="about-hero__content">
              <h1 class="about-hero__title">關於我</h1>
              <p class="about-hero__subtitle">
                新手全端工程師<br />
                熱愛創造優質的數位體驗
              </p>
              <div class="about-hero__stats row g-4 mt-4">
                <div class="col-4">
                  <div class="text-center">
                    <h3 class="text_warning mb-0">2+</h3>
                    <small class="text_light">年經驗</small>
                  </div>
                </div>
                <div class="col-4">
                  <div class="text-center">
                    <h3 class="text-warning mb-0">15+</h3>
                    <small class="text-white-50">完成專案</small>
                  </div>
                </div>
                <div class="col-4">
                  <div class="text-center">
                    <h3 class="text-warning mb-0">100%</h3>
                    <small class="text-white-50">滿意度</small>
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
              <h2 class="section__title">我的故事</h2>
              <div class="section__divider mx-auto"></div>
            </div>
            <div class="section__content-text">
              <p class="lead">你好！我是Orion。</p>
              <p>
                一位正在轉職中的網頁開發者，專注於前端技術與全端網站架構設計。<br />
                我喜歡打造清晰、實用且有良好使用者體驗的網頁，並相信每一段程式碼都是解決問題的橋樑。<br />
                目前正在開發自己的專案，記錄學習歷程，也歡迎你瀏覽我的作品，一起見證我的成長！
              </p>
              <p>
                目前使用 Vue.js、Node.js、Bootstrap 5 與 Vite
                開發響應式網站，並持續學習提升程式實力。
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
            <h2 class="section__title">專業技能</h2>
            <p class="section__subtitle text_secondary">努力累積的技術專長</p>
          </div>
        </div>
        <div class="row g-4">
          <div
            v-for="skillCategory in skillCategories"
            :key="skillCategory.category"
            class="col-lg-4 col-md-6"
          >
            <div class="skill-card card h-100">
              <div class="card-body text-center">
                <div class="skill-card__icon mb-3">
                  <i :class="skillCategory.icon" class="display-4 text-primary"></i>
                </div>
                <h5 class="card-title">{{ skillCategory.category }}</h5>
                <div class="skill-card__list">
                  <span
                    v-for="skill in skillCategory.skills"
                    :key="skill"
                    class="badge bg-primary text-white me-1 mb-2"
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

    <!-- 學習與成長時線 -->
    <section class="section timeline-section">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h2 class="section__title">學習與成長時線</h2>
            <p class="section__subtitle text-muted">技術學習與專案開發歷程</p>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-10 mx-auto">
            <div class="timeline">
              <div v-for="experience in experiences" :key="experience.id" class="timeline__item">
                <div class="timeline__marker"></div>
                <div class="timeline__content">
                  <div class="timeline__period">{{ experience.period }}</div>
                  <h5 class="timeline__title">{{ experience.position }}</h5>
                  <h6 class="timeline__company text-muted">{{ experience.company }}</h6>
                  <p class="timeline__description">{{ experience.description }}</p>
                  <div class="timeline__achievements">
                    <ul class="list-unstyled">
                      <li
                        v-for="achievement in experience.achievements"
                        :key="achievement"
                        class="mb-2"
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
    </section>

    <!-- 興趣愛好 -->
    <section class="section hobbies-section">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h2 class="section__title">興趣愛好</h2>
            <p class="section__subtitle text-muted">工作之外的我</p>
          </div>
        </div>
        <div class="row g-4">
          <div v-for="hobby in hobbies" :key="hobby.id" class="col-lg-3 col-md-6">
            <div class="hobby-card text-center">
              <div class="hobby-card__icon mb-3">
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
            <h2 class="section__title">想要合作嗎？</h2>
            <p class="section__subtitle text-muted mb-4">讓我們一起創造令人驚艷的數位體驗</p>
            <router-link to="/contact" class="btn btn-primary btn-lg"> 開始對話 </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// 型別定義
interface SkillCategory {
  category: string;
  icon: string;
  skills: string[];
}

interface Experience {
  id: number;
  period: string;
  position: string;
  company: string;
  description: string;
  achievements: string[];
}

interface Hobby {
  id: number;
  name: string;
  icon: string;
  description: string;
}

// 技能分類
const skillCategories = ref<SkillCategory[]>([
  {
    category: "前端開發",
    icon: "bi bi-code-slash",
    skills: [
      "Vue.js 3",
      "React",
      "TypeScript",
      "JavaScript (ES6+)",
      "HTML5",
      "CSS3",
      "Bootstrap 5",
      "Tailwind CSS",
    ],
  },
  {
    category: "後端開發",
    icon: "bi bi-server",
    skills: [
      "Python",
      "FastAPI",
      "Node.js",
      "Express.js",
      "MySQL",
      "PostgreSQL",
      "RESTful API",
      "JWT 認證",
    ],
  },
  {
    category: "開發工具",
    icon: "bi bi-gear",
    skills: ["Git", "GitHub", "VS Code", "Docker", "Vite", "Webpack", "NPM/Yarn", "Linux Terminal"],
  },
  {
    category: "設計技能",
    icon: "bi bi-palette",
    skills: ["Figma", "UI/UX 設計", "響應式設計", "用戶體驗", "網站原型設計"],
  },
  {
    category: "云端部署",
    icon: "bi bi-cloud",
    skills: ["Docker", "Nginx", "CI/CD", "Linux", "Cloudflare", "VPS 管理"],
  },
  {
    category: "其他技能",
    icon: "bi bi-lightbulb",
    skills: ["問題解決", "團隊合作", "專案管理", "技術文件", "測試與除錯"],
  },
]);

// 學習與成長時線
const experiences = ref<Experience[]>([
  {
    id: 1,
    period: "2023 - 現在",
    position: "全端網頁開發者",
    company: "自學轉職中",
    description: "從零開始學習網頁開發，專注於前後端技術整合與實務專案開發",
    achievements: [
      "學習 Vue.js 3 + TypeScript 現代前端框架",
      "掌握 Python FastAPI 後端 API 開發",
      "獨立完成 3+ 個人專案作品",
      "學習 Docker 容器化與雲端部署",
      "建立完整的開發流程與版本控制",
    ],
  },
  {
    id: 2,
    period: "2024",
    position: "個人品牌網站開發",
    company: "自主專案",
    description: "設計並開發個人品牌網站，包含部落格、作品集和後台管理系統",
    achievements: [
      "使用 Vue 3 + FastAPI 打造全端應用",
      "實作 JWT 認證與權限管理",
      "整合 MySQL 資料庫設計",
      "應用 RESTful API 設計原則",
      "實現響應式設計與 SEO 優化",
    ],
  },
  {
    id: 3,
    period: "2023 - 2024",
    position: "天堂W 輔助工具開發",
    company: "開源專案",
    description: "開發遊戲數據分析工具，提供轉職成本計算和寵物評估功能",
    achievements: [
      "使用 Vue 3 + TypeScript 開發 SPA",
      "實作複雜數學運算與模擬系統",
      "應用組件化開發與狀態管理",
      "整合第三方 API 與數據處理",
      "實現用戶友善的交互設計",
    ],
  },
  {
    id: 4,
    period: "2023",
    position: "易經占卜系統",
    company: "特色專案",
    description: "結合傳統易經智慧與現代網頁技術的線上占卜平台",
    achievements: [
      "深入研究易經八卦理論與實作",
      "設計直觀的占卜流程與結果展示",
      "應用動畫效果增強使用者體驗",
      "實現 PWA 功能支援離線使用",
      "整合響應式設計與輕量化開發",
    ],
  },
]);

// 興趣愛好
const hobbies = ref<Hobby[]>([
  {
    id: 1,
    name: "程式開發",
    icon: "bi bi-code-slash",
    description: "熱愛探索新技術與實作創意想法",
  },
  {
    id: 2,
    name: "技術學習",
    icon: "bi bi-book",
    description: "持續關注前端新框架與開發趨勢",
  },
  {
    id: 3,
    name: "開源貢獻",
    icon: "bi bi-github",
    description: "參與開源社群，分享學習成果",
  },
  {
    id: 4,
    name: "想法實現",
    icon: "bi bi-lightbulb",
    description: "將創意想法轉化為實用的數位作品",
  },
]);
</script>

<style scoped>
/* 全局設定 */
.section {
  padding: 5rem 0;
}

.section-alt {
  background-color: var(--color-background-soft);
}

.section__title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.section__subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
}

.section__divider {
  width: 60px;
  height: 3px;
  background: var(--brand-primary);
  margin: 1rem auto 2rem;
  border-radius: 2px;
}

.section__content-text {
  font-size: 1.1rem;
  line-height: 1.8;
}

.section__content-text .lead {
  font-size: 1.3rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

/* Hero 區塊 */
.about-hero {
  padding: 5rem 0;
}

.about-hero__content {
  position: relative;
  z-index: 1;
}

.about-hero__title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}

.about-hero__subtitle {
  font-size: 1.25rem;
  margin-bottom: 0;
  text-align: center;
  opacity: 0.9;
}

.about-hero__icon-container {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.about-hero__icon-container:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.15);
}

/* 技能卡片 */
.skill-card {
  border: none;
  border-radius: 15px;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.skill-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--brand-primary);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.skill-card:hover {
  transform: translateY(-10px);
}

.skill-card:hover::before {
  transform: scaleX(1);
}

.skill-card__icon {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.skill-card:hover .skill-card__icon i {
  transform: scale(1.1);
}

.skill-card__list .badge {
  font-size: 0.75rem;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-weight: 500;
}

/* 時線設計 */
.timeline-section {
  background-color: var(--color-background-soft);
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 2px;
  background: var(--color-border);
}

.timeline__item {
  position: relative;
  margin-bottom: 3rem;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
}

.timeline__item:nth-child(1) { animation-delay: 0.1s; }
.timeline__item:nth-child(2) { animation-delay: 0.2s; }
.timeline__item:nth-child(3) { animation-delay: 0.3s; }
.timeline__item:nth-child(4) { animation-delay: 0.4s; }

.timeline__marker {
  position: absolute;
  left: -2rem; /* Adjusted for new padding */
  top: 8px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--brand-primary);
  transition: all 0.3s ease;
}

.timeline__item:hover .timeline__marker {
  transform: scale(1.3);
}

.timeline__content {
  padding: 1.5rem;
  border-radius: 10px;
  background: var(--color-background);
  transition: all 0.3s ease;
}

.timeline__item:hover .timeline__content {
  transform: translateX(5px);
  box-shadow: var(--shadow-md);
}

.timeline__period {
  display: inline-block;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.timeline__title {
  color: var(--color-heading);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.timeline__company {
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.timeline__description {
  margin-bottom: 1rem;
  color: var(--color-text);
  line-height: 1.6;
}

.timeline__achievements ul li {
  color: var(--color-text);
  line-height: 1.6;
  transition: all 0.2s ease;
}

.timeline__achievements ul li:hover {
  color: var(--color-heading);
  transform: translateX(5px);
}

/* 興趣愛好 */
.hobbies-section {
  background: var(--color-background-soft);
}

.hobby-card {
  padding: 2rem 1.5rem;
  border-radius: 15px;
  background: var(--color-background);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  height: 100%;
}

.hobby-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-lg);
}

.hobby-card__icon {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.hobby-card:hover .hobby-card__icon i {
  transform: scale(1.2);
  color: var(--brand-primary) !important;
}

/* 動畫效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .about-hero__title {
    font-size: 2.5rem;
  }
}

@media (max-width: 992px) {
  .section {
    padding: 4rem 0;
  }

  .about-hero {
    padding: 4rem 0;
  }

  .about-hero__title {
    font-size: 2rem;
  }

  .section__title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .about-hero {
    padding: 3rem 0;
    text-align: center;
  }

  .about-hero__title {
    font-size: 1.75rem;
  }

  .about-hero__icon-container {
    width: 200px;
    height: 200px;
    margin-bottom: 2rem;
  }

  .timeline {
    padding-left: 1.5rem;
  }

  .timeline__marker {
    left: -1.5rem;
  }

  .timeline__content {
    padding: 1rem;
  }

  .section__title {
    font-size: 1.75rem;
  }
}

@media (max-width: 576px) {
  .section {
    padding: 3rem 0;
  }

  .about-hero__title {
    font-size: 1.5rem;
  }

  .about-hero__icon-container {
    width: 150px;
    height: 150px;
  }
}

/* === 深色模式修復（組件層級） === */
[data-theme="dark"] .about-page .section {
  background: var(--orion-silver-950) !important;
  color: var(--orion-silver-50) !important;
}

[data-theme="dark"] .about-page .section-alt {
  background: var(--orion-silver-900) !important;
}

[data-theme="dark"] .about-page .section__title {
  color: var(--orion-silver-50) !important;
}

[data-theme="dark"] .about-page .section__subtitle {
  color: var(--orion-silver-300) !important;
}

[data-theme="dark"] .about-page .timeline-section {
  background: var(--orion-silver-900) !important;
}

[data-theme="dark"] .about-page .timeline::before {
  background: linear-gradient(to bottom, var(--orion-blue-400), var(--orion-blue-500)) !important;
}

[data-theme="dark"] .about-page .timeline__marker {
  background: var(--orion-blue-400) !important;
  border-color: var(--orion-silver-900) !important;
  box-shadow: 0 0 0 3px rgba(79, 111, 255, 0.3) !important;
}

[data-theme="dark"] .about-page .timeline__content {
  background: var(--orion-silver-800) !important;
  border: 1px solid var(--orion-silver-700) !important;
  color: var(--orion-silver-50) !important;
}

[data-theme="dark"] .about-page .timeline__period {
  background: linear-gradient(135deg, var(--orion-blue-400), var(--orion-blue-500)) !important;
  color: var(--orion-silver-50) !important;
}

[data-theme="dark"] .about-page .timeline__title {
  color: var(--orion-silver-50) !important;
}

[data-theme="dark"] .about-page .timeline__company {
  color: var(--orion-silver-300) !important;
}

[data-theme="dark"] .about-page .timeline__description {
  color: var(--orion-silver-200) !important;
}

[data-theme="dark"] .about-page .timeline__achievements ul li {
  color: var(--orion-silver-200) !important;
}

[data-theme="dark"] .about-page .timeline__achievements ul li:hover {
  color: var(--orion-silver-50) !important;
}

[data-theme="dark"] .about-page .hobbies-section {
  background: var(--orion-silver-900) !important;
}

[data-theme="dark"] .about-page .hobby-card {
  background: var(--orion-silver-800) !important;
  border: 1px solid var(--orion-silver-700) !important;
  color: var(--orion-silver-50) !important;
}

[data-theme="dark"] .about-page .hobby-card h5 {
  color: var(--orion-silver-50) !important;
}

[data-theme="dark"] .about-page .hobby-card p {
  color: var(--orion-silver-200) !important;
}

[data-theme="dark"] .about-page .hobby-card:hover .hobby-card__icon i {
  color: var(--orion-blue-400) !important;
}
</style>