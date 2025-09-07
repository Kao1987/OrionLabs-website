<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authAPI } from "@/services/api";
import { useStructuredData } from "@/composables/useSEO";

const router = useRouter();

// SEO 設定
const { addPersonSchema } = useStructuredData();

// 初始化 SEO
onMounted(() => {
  // 頁面 SEO 資料已經在路由中設定，這裡設定結構化資料
  addPersonSchema({
    name: "Orion",
    jobTitle: "前端工程師 & UI/UX 設計師",
    url: "https://orionlabs.dev",
    image: "https://orionlabs.dev/images/profile.jpg",
    email: "hong.yikao@example.com",
    sameAs: [
      "https://linkedin.com/in/yourprofile",
      "https://github.com/yourusername",
      "https://instagram.com/yourprofile",
    ],
    worksFor: {
      name: "OrionLabs",
      url: "https://orionlabs.dev",
    },
  });
});

// 型別定義
interface Service {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  link: string;
}

interface Skill {
  name: string;
  level: number;
}

// 服務項目
const services = ref<Service[]>([
  {
    id: 1,
    icon: "bi bi-code-slash",
    title: "前端開發",
    description: "使用 Vue.js、React 等現代前端框架，打造流暢的使用者介面體驗",
  },
  {
    id: 2,
    icon: "bi bi-server",
    title: "後端開發",
    description: "運用 Node.js、Python FastAPI 建構穩定可靠的 API 服務",
  },
  {
    id: 3,
    icon: "bi bi-phone",
    title: "響應式設計",
    description: "確保網站在各種裝置上都能完美呈現，提供最佳瀏覽體驗",
  },
  {
    id: 4,
    icon: "bi bi-database",
    title: "資料庫設計",
    description: "設計高效的資料結構，確保資料存取的安全性與效能",
  },
  {
    id: 5,
    icon: "bi bi-cloud",
    title: "雲端部署",
    description: "熟悉 Docker、CI/CD 流程，提供專業的雲端部署解決方案",
  },
  {
    id: 6,
    icon: "bi bi-palette",
    title: "UI/UX 設計",
    description: "注重使用者體驗，設計直觀易用的介面與互動流程",
  },
]);

// 精選作品
const featuredProjects = ref<Project[]>([
  {
    id: 1,
    title: "個人品牌網站",
    description: "使用 Vue 3 + FastAPI 打造的全端個人品牌網站，具備部落格與作品集管理功能",
    technologies: ["Vue 3", "TypeScript", "FastAPI", "MySQL"],
    link: "#",
  },
  {
    id: 2,
    title: "天堂W 輔助工具",
    description: "遊戲數據分析與計算工具，提供轉職成本計算、寵物評估等實用功能",
    technologies: ["Vue 3", "TypeScript", "Vite"],
    link: "https://lineagew-labs.orionlabs.pro/",
  },
  {
    id: 3,
    title: "易經占卜系統",
    description: "結合傳統易經智慧與現代網頁技術的線上占卜平台",
    technologies: ["Vue 3", "TypeScript", "PWA"],
    link: "https://divinationlabs.orionlabs.pro/",
  },
]);

// 技能統計
const skills = ref<Skill[]>([
  { name: "Vue.js", level: 85 },
  { name: "JavaScript/TypeScript", level: 80 },
  { name: "HTML/CSS", level: 90 },
  { name: "Node.js", level: 75 },
  { name: "Python", level: 70 },
  { name: "SQL", level: 65 },
  { name: "Docker", level: 60 },
  { name: "Git", level: 85 },
]);

// 圖表相關
const pieChart = ref<HTMLCanvasElement>();
const radarChart = ref<HTMLCanvasElement>();

// 圖表顏色生成 - 使用設計系統變數
const chartColors = [
  "var(--orion-primary-900)",
  "var(--orion-primary-400)",
  "var(--orion-primary-200)",
  "var(--orion-primary-100)",
  "var(--orion-primary-300)",
  "var(--success-500)",
  "var(--info-500)",
  "var(--warning-500)",
  "var(--success-600)",
  "var(--warning-600)",
  "var(--info-600)",
  "var(--error-500)",
];

const getChartColor = (index: number): string => {
  return chartColors[index % chartColors.length];
};

// 繪製圓餅圖
const drawPieChart = () => {
  const canvas = pieChart.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 40;

  const total = skills.value.reduce((sum, skill) => sum + skill.level, 0);
  let currentAngle = -Math.PI / 2;

  // 清除畫布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 繪製扇形
  skills.value.forEach((skill, index) => {
    const sliceAngle = (skill.level / total) * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.fillStyle = getChartColor(index);
    ctx.fill();
    ctx.strokeStyle = "var(--text-inverse)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 繪製標籤
    const labelAngle = currentAngle + sliceAngle / 2;
    const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
    const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

    ctx.fillStyle = "var(--text-inverse)";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${skill.level}%`, labelX, labelY);

    currentAngle += sliceAngle;
  });
};

// 繪製雷達圖
const drawRadarChart = () => {
  const canvas = radarChart.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 60;
  const sides = skills.value.length;

  // 清除畫布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 繪製網格
  ctx.strokeStyle = "var(--legacy-gray-200)";
  ctx.lineWidth = 1;

  // 繪製同心圓
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, (radius / 5) * i, 0, 2 * Math.PI);
    ctx.stroke();
  }

  // 繪製軸線
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();

    // 繪製標籤
    const labelX = centerX + Math.cos(angle) * (radius + 30);
    const labelY = centerY + Math.sin(angle) * (radius + 30);

    ctx.fillStyle = "var(--legacy-gray-600)";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(skills.value[i].name, labelX, labelY);
  }

  // 繪製數據區域
  ctx.beginPath();
  ctx.fillStyle = "var(--primary-alpha-20)";
  ctx.strokeStyle = "var(--orion-primary-900)";
  ctx.lineWidth = 2;

  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const value = skills.value[i].level / 100;
    const x = centerX + Math.cos(angle) * radius * value;
    const y = centerY + Math.sin(angle) * radius * value;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    // 繪製數據點
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "var(--orion-primary-900)";
    ctx.fill();
    ctx.beginPath();
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

// 統計數字 (已註解，因技能專長區塊被隱藏)
// const stats = ref([
//   { label: '專案經驗', value: '15+', icon: 'bi bi-briefcase' },
//   { label: '程式語言', value: '8+', icon: 'bi bi-code-square' },
//   { label: '開發年資', value: '2+', icon: 'bi bi-calendar-check' },
//   { label: '滿意客戶', value: '100%', icon: 'bi bi-emoji-smile' }
// ])

// 管理員登入相關
const clickCount = ref(0);
const showAdminLogin = ref(false);
const adminCredentials = ref({
  username: "",
  password: "",
});

// 三擊觸發管理員登入
const handleOrionClick = () => {
  clickCount.value++;

  if (clickCount.value === 3) {
    showAdminLogin.value = true;
    clickCount.value = 0;
  }

  // 3秒後重置計數
  setTimeout(() => {
    if (clickCount.value < 3) {
      clickCount.value = 0;
    }
  }, 3000);
};

// 管理員登入
const adminLogin = async () => {
  try {
    // 使用API服務進行認證
    const data = await authAPI.login(
      adminCredentials.value.username,
      adminCredentials.value.password,
    );

    // 儲存真正的JWT token
    localStorage.setItem("adminToken", data.access_token);
    localStorage.setItem("tokenType", data.token_type);
    showAdminLogin.value = false;
    adminCredentials.value = { username: "", password: "" };
    router.push("/admin");
  } catch (error: unknown) {
    console.error("登入錯誤:", error);
    
    // 處理不同類型的錯誤，提供更友善的訊息
    const errorObj = error as { status?: number; message?: string; detail?: string };
    let errorMessage = "登入失敗，請重試";
    
    if (errorObj.status === 401) {
      errorMessage = "帳號或密碼錯誤，請檢查輸入";
    } else if (errorObj.status === 429) {
      errorMessage = "登入嘗試過於頻繁，請稍後再試";
    } else if (errorObj.status === 0 || errorObj.status === 408) {
      errorMessage = "無法連接到伺服器，請檢查網路連線";
    } else if (errorObj.status && errorObj.status >= 500) {
      errorMessage = "伺服器暫時無法使用，請稍後再試";
    } else if (errorObj.detail) {
      errorMessage = errorObj.detail;
    } else if (errorObj.message) {
      errorMessage = errorObj.message;
    }
    
    alert(`🔐 登入失敗\n\n${errorMessage}\n\n請確認您的帳號密碼是否正確。`);
  }
};

// 關閉登入表單
const closeAdminLogin = () => {
  showAdminLogin.value = false;
  adminCredentials.value = { username: "", password: "" };
};

// 技能條動畫
const animateSkills = () => {
  const skillBars = document.querySelectorAll(".skill-progress");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const width = target.style.width;
          target.style.width = "0%";
          setTimeout(() => {
            target.style.width = width;
          }, 200);
        }
      });
    },
    { threshold: 0.5 },
  );

  skillBars.forEach((bar) => observer.observe(bar));
};

// 數字計數動畫
const animateStats = () => {
  const statValues = document.querySelectorAll(".stat-value");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const finalValue = target.textContent || "0";
          const numericValue = parseInt(finalValue.replace(/[^0-9]/g, ""));

          if (numericValue) {
            let current = 0;
            const increment = numericValue / 50;
            const timer = setInterval(() => {
              current += increment;
              if (current >= numericValue) {
                current = numericValue;
                clearInterval(timer);
              }
              target.textContent = finalValue.replace(/[0-9]+/, Math.floor(current).toString());
            }, 40);
          }

          observer.unobserve(target);
        }
      });
    },
    { threshold: 0.5 },
  );

  statValues.forEach((stat) => observer.observe(stat));
};

// 組件掛載後初始化動畫
onMounted(() => {
  setTimeout(() => {
    animateSkills();
    animateStats();
  }, 500);

  // 監聽 tab 切換事件來繪製圖表
  const chartTab = document.getElementById("chart-tab");
  const radarTab = document.getElementById("radar-tab");

  chartTab?.addEventListener("shown.bs.tab", () => {
    setTimeout(drawPieChart, 100);
  });

  radarTab?.addEventListener("shown.bs.tab", () => {
    setTimeout(drawRadarChart, 100);
  });
});
</script>

<template>
  <main class="home-page">
    <!-- Hero Section -->
    <section class="home-page__hero">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <div class="home-page__hero-content">
              <h1 class="home-page__hero-title">
                你好，我是
                <span
                  class="home-page__hero-name home-page__hero-name--interactive"
                  @click="handleOrionClick"
                  tabindex="0"
                  @keydown.enter="handleOrionClick"
                  @keydown.space.prevent="handleOrionClick"
                  role="button"
                  aria-label="點擊三次進入管理模式"
                >
                  Orion
                </span>
              </h1>
              <p class="home-page__hero-subtitle">
                新手全端工程師<br />
                專注於創造優質的數位體驗
              </p>
              <div class="home-page__hero-actions">
                <router-link
                  to="/portfolio"
                  class="btn btn-primary btn-lg me-3"
                >
                  查看作品集
                </router-link>
                <router-link
                  to="/contact"
                  class="btn btn-outline-primary btn-lg"
                >
                  聯絡我
                </router-link>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="home-page__hero-visual">
              <div class="home-page__profile">
                <div class="home-page__profile-avatar">
                  <img src="/images/profile-avatar.png" alt="Orion's Profile Avatar" class="home-page__profile-image" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="home-page__services">
      <div class="container">
        <header class="home-page__section-header">
          <div class="row">
            <div class="col-12 text-center">
              <h2 class="home-page__section-title">我的服務</h2>
              <p class="home-page__section-subtitle">專業的技術服務，滿足您的需求</p>
            </div>
          </div>
        </header>
        <div class="home-page__services-grid">
          <div class="row g-4">
            <div
              v-for="service in services"
              :key="service.id"
              class="col-xl-4 col-lg-6 col-md-6"
            >
              <article class="home-page__service-card">
                <div class="home-page__service-content">
                  <div class="home-page__service-icon">
                    <i
                      :class="service.icon"
                      class="home-page__service-icon-symbol"
                      aria-hidden="true"
                    ></i>
                  </div>
                  <h3 class="home-page__service-title">{{ service.title }}</h3>
                  <p class="home-page__service-description">{{ service.description }}</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Projects Section -->
    <section class="home-page__projects home-page__projects--featured">
      <div class="container">
        <header class="home-page__section-header">
          <div class="row">
            <div class="col-12 text-center">
              <h2 class="home-page__section-title">精選作品</h2>
              <p class="home-page__section-subtitle">展示我最優秀的專案成果</p>
            </div>
          </div>
        </header>
        <div class="home-page__projects-grid">
          <div class="row g-4">
            <div
              v-for="project in featuredProjects"
              :key="project.id"
              class="col-lg-4 col-md-6"
            >
              <article class="home-page__project-card">
                <div class="home-page__project-content">
                  <h3 class="home-page__project-title">{{ project.title }}</h3>
                  <p class="home-page__project-description">{{ project.description }}</p>
                  <div class="home-page__project-technologies">
                    <span
                      v-for="tech in project.technologies"
                      :key="tech"
                      class="home-page__project-tech"
                    >
                      {{ tech }}
                    </span>
                  </div>
                  <div class="home-page__project-actions">
                    <a
                      :href="project.link"
                      class="home-page__project-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      :aria-label="`查看 ${project.title} 專案`"
                    >
                      查看專案
                      <i class="bi bi-arrow-up-right home-page__project-link-icon" aria-hidden="true"></i>
                    </a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
        <footer class="home-page__projects-footer">
          <div class="text-center">
            <router-link
              to="/portfolio"
              class="home-page__projects-cta"
            >
              查看更多作品
              <i class="bi bi-arrow-right home-page__projects-cta-icon" aria-hidden="true"></i>
            </router-link>
          </div>
        </footer>
      </div>
    </section>

    <!-- 技能統計區塊 (已註解)
    <section class="section skills-section">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h2 class="section-title">技能專長</h2>
            <p class="section-subtitle text-muted">多年經驗累積的技術能力</p>
          </div>
        </div>

        <!- 技能選項卡 ->
        <div class="row mb-4">
          <div class="col-12">
            <ul class="nav nav-pills justify-content-center" id="skillsTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link active"
                  id="progress-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#progress-skills"
                  type="button"
                  role="tab"
                >
                  <i class="bi bi-bar-chart me-1"></i>
                  進度條視圖
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  id="chart-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#chart-skills"
                  type="button"
                  role="tab"
                >
                  <i class="bi bi-pie-chart me-1"></i>
                  圓餅圖視圖
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  id="radar-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#radar-skills"
                  type="button"
                  role="tab"
                >
                  <i class="bi bi-diagram-3 me-1"></i>
                  雷達圖視圖
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!- 技能內容 ->
        <div class="tab-content" id="skillsTabContent">
          <!- 進度條視圖 ->
          <div class="tab-pane fade show active" id="progress-skills" role="tabpanel">
            <div class="row justify-content-center">
              <div class="col-lg-10">
                <div class="row">
                  <div
                    v-for="skill in skills"
                    :key="skill.name"
                    class="col-lg-6 col-md-6 mb-4"
                  >
                    <div class="skill-item">
                      <div class="d-flex justify-content-between mb-2">
                        <span class="fw-medium">{{ skill.name }}</span>
                        <span class="text-primary fw-bold">{{ skill.level }}%</span>
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
            </div>
          </div>

          <!- 圓餅圖視圖 ->
          <div class="tab-pane fade" id="chart-skills" role="tabpanel">
            <div class="row justify-content-center">
              <div class="col-lg-8">
                <div class="skills-pie-chart">
                  <!- 這裡將會是技能圓餅圖 ->
                  <div class="chart-container">
                    <canvas ref="pieChart" width="400" height="400"></canvas>
                  </div>
                  <!- 圖例 ->
                  <div class="chart-legend mt-4">
                    <div class="row g-2">
                      <div
                        v-for="(skill, index) in skills"
                        :key="skill.name"
                        class="col-md-4 col-6"
                      >
                        <div class="legend-item d-flex align-items-center">
                          <div
                            class="legend-color me-2"
                            :style="{ backgroundColor: getChartColor(index) }"
                          ></div>
                          <small class="text-muted">{{ skill.name }} ({{ skill.level }}%)</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!- 雷達圖視圖 ->
          <div class="tab-pane fade" id="radar-skills" role="tabpanel">
            <div class="row justify-content-center">
              <div class="col-lg-8">
                <div class="skills-radar-chart">
                  <div class="chart-container">
                    <canvas ref="radarChart" width="400" height="400"></canvas>
                  </div>
                  <div class="text-center mt-3">
                    <small class="text-muted">技能熟練度雷達圖 (滿分100%)</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    -->

    <!-- Call to Action Section -->
    <section class="home-page__cta">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center">
            <div class="home-page__cta-content">
              <h2 class="home-page__cta-title">準備開始您的專案？</h2>
              <p class="home-page__cta-subtitle">讓我們一起創造令人驚艷的數位體驗</p>
              <div class="home-page__cta-actions">
                <router-link
                  to="/contact"
                  class="btn btn-primary btn-lg"
                >
                  立即聯絡
                  <i class="bi bi-arrow-right ms-2" aria-hidden="true"></i>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 管理員登入 Modal -->
    <div
      v-if="showAdminLogin"
      class="modal fade show d-block"
      style="background-color: var(--black-alpha-50)"
      @click.self="closeAdminLogin"
    >
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">管理員登入</h5>
            <button type="button" class="btn-close" @click="closeAdminLogin"></button>
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
                />
              </div>
              <div class="mb-3">
                <label class="form-label">密碼</label>
                <input
                  v-model="adminCredentials.password"
                  type="password"
                  class="form-control"
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary w-100">登入</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <!-- Admin Login Modal -->
    <div
      v-if="showAdminLogin"
      class="home-page__admin-modal"
      @click.self="closeAdminLogin"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <div class="home-page__admin-modal-dialog">
        <div class="home-page__admin-modal-content">
          <header class="home-page__admin-modal-header">
            <h3 id="admin-modal-title" class="home-page__admin-modal-title">管理員登入</h3>
            <button
              type="button"
              class="home-page__admin-modal-close"
              @click="closeAdminLogin"
              aria-label="關閉管理員登入視窗"
            >
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </header>
          <div class="home-page__admin-modal-body">
            <form @submit.prevent="adminLogin" class="home-page__admin-form">
              <div class="home-page__admin-field">
                <label class="home-page__admin-label" for="admin-username">帳號</label>
                <input
                  id="admin-username"
                  v-model="adminCredentials.username"
                  type="text"
                  class="home-page__admin-input"
                  required
                  autocomplete="username"
                />
              </div>
              <div class="home-page__admin-field">
                <label class="home-page__admin-label" for="admin-password">密碼</label>
                <input
                  id="admin-password"
                  v-model="adminCredentials.password"
                  type="password"
                  class="home-page__admin-input"
                  required
                  autocomplete="current-password"
                />
              </div>
              <div class="home-page__admin-actions">
                <button type="submit" class="home-page__admin-submit">
                  登入
                  <i class="bi bi-box-arrow-in-right home-page__admin-submit-icon" aria-hidden="true"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* === Home Page BEM Styles === */
.home-page {
  min-height: 100vh;
}

/* === Hero Section === */
.home-page__hero {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: var(--color-text-light);
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.home-page__hero-content {
  animation: fadeInUp 1s ease-out;
}

.home-page__hero-title {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  margin-bottom: var(--spacing-6); /* 使用新的統一間距 */
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.home-page__hero-name {
  color: var(--color-warning, #ffc107);
  transition: all var(--transition-base);
  display: inline-block;
}

.home-page__hero-name--interactive {
  cursor: pointer;
  user-select: none;
  padding: var(--spacing-1) var(--spacing-2); /* 使用新的統一間距 */
  border-radius: var(--radius-sm);
}

.home-page__hero-name--interactive:hover,
.home-page__hero-name--interactive:focus {
  transform: scale(1.05);
  text-shadow: 0 4px 8px rgba(255, 193, 7, 0.3);
  outline: 2px solid rgba(255, 193, 7, 0.5);
  outline-offset: 2px;
}

.home-page__hero-subtitle {
  font-size: var(--font-size-xl);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-12); /* 使用新的統一間距 */
  opacity: 0.9;
}

.home-page__hero-actions {
  display: flex;
  gap: var(--spacing-4); /* 使用新的統一間距 */
  flex-wrap: wrap;
}

.home-page__hero-btn {
  display: inline-flex;
  align-items: center;
  padding: var(--btn-padding-y) var(--btn-padding-x); /* 使用語義化按鈕間距 */
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  min-height: 48px;
}

.home-page__hero-btn--primary {
  background-color: var(--color-primary);
  color: var(--color-text-light);
  box-shadow: var(--shadow-md);
}

.home-page__hero-btn--primary:hover,
.home-page__hero-btn--primary:focus {
  background-color: var(--color-primary-hover);
  color: var(--color-text-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  text-decoration: none;
}

.home-page__hero-btn--outline {
  background-color: transparent;
  color: var(--color-text-light);
  border: 2px solid var(--color-text-light);
}

.home-page__hero-btn--outline:hover,
.home-page__hero-btn--outline:focus {
  background-color: var(--color-text-light);
  color: var(--color-primary);
  transform: translateY(-2px);
  text-decoration: none;
}

.home-page__hero-visual {
  text-align: center;
}

.home-page__profile {
  position: relative;
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}

.home-page__profile-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
  border-radius: var(--radius-full);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  margin: 0 auto;
}

.home-page__profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-full);
}

/* === Section Styles === */
.home-page__services,
.home-page__projects,
.home-page__cta {
  padding: var(--section-padding) 0; /* 使用語義化節區間距 */
  position: relative;
}

.home-page__projects--featured {
  background-color: var(--color-bg-secondary);
}

.home-page__cta {
  background-color: var(--color-bg-tertiary);
}

.home-page__section-header {
  text-align: center;
  margin-bottom: var(--spacing-20); /* 使用新的統一間距 */
}

.home-page__section-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-4); /* 使用新的統一間距 */
  line-height: var(--line-height-tight);
}

.home-page__section-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  max-width: 600px;
  margin: 0 auto;
}

/* === Services Grid === */
.home-page__services-grid {
  /* Grid styling handled by Bootstrap */
}

.home-page__service-card {
  height: 100%;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-xl);
  transition: all var(--transition-base);
  padding: var(--spacing-2xl);
  text-align: center;
}

.home-page__service-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--color-border-focus);
}

.home-page__service-icon {
  margin-bottom: var(--spacing-lg);
}

.home-page__service-icon-symbol {
  font-size: 4rem;
  color: var(--color-primary);
  transition: all var(--transition-base);
}

.home-page__service-card:hover .home-page__service-icon-symbol {
  color: var(--color-primary-hover);
  transform: scale(1.1);
}

.home-page__service-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  line-height: var(--line-height-tight);
}

.home-page__service-description {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* === Projects Grid === */
.home-page__projects-grid {
  margin-bottom: var(--spacing-4xl);
}

.home-page__project-card {
  height: 100%;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-xl);
  transition: all var(--transition-base);
  overflow: hidden;
}

.home-page__project-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-focus);
}

.home-page__project-content {
  padding: var(--spacing-2xl);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.home-page__project-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  line-height: var(--line-height-tight);
}

.home-page__project-description {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-lg);
  flex: 1;
}

.home-page__project-technologies {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.home-page__project-tech {
  background-color: var(--color-primary-light);
  color: var(--color-primary-dark);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.home-page__project-actions {
  margin-top: auto;
}

.home-page__project-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.home-page__project-link:hover,
.home-page__project-link:focus {
  background-color: var(--color-primary);
  color: var(--color-text-light);
  text-decoration: none;
  transform: translateY(-1px);
}

.home-page__project-link-icon {
  transition: transform var(--transition-fast);
}

.home-page__project-link:hover .home-page__project-link-icon {
  transform: translate(2px, -2px);
}

.home-page__projects-footer {
  text-align: center;
}

.home-page__projects-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background-color: var(--color-primary);
  color: var(--color-text-light);
  text-decoration: none;
  padding: var(--spacing-md) var(--spacing-2xl);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
}

.home-page__projects-cta:hover,
.home-page__projects-cta:focus {
  background-color: var(--color-primary-hover);
  color: var(--color-text-light);
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.home-page__projects-cta-icon {
  transition: transform var(--transition-fast);
}

.home-page__projects-cta:hover .home-page__projects-cta-icon {
  transform: translateX(4px);
}

/* === Call to Action Section === */
.home-page__cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.home-page__cta-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  line-height: var(--line-height-tight);
}

.home-page__cta-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2xl);
  line-height: var(--line-height-relaxed);
}

.home-page__cta-actions {
  /* Actions container */
}

.home-page__cta-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background-color: var(--color-primary);
  color: var(--color-text-light);
  text-decoration: none;
  padding: var(--spacing-lg) var(--spacing-3xl);
  border-radius: var(--radius-xl);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-lg);
  min-height: 56px;
}

.home-page__cta-btn:hover,
.home-page__cta-btn:focus {
  background-color: var(--color-primary-hover);
  color: var(--color-text-light);
  text-decoration: none;
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.home-page__cta-btn-icon {
  font-size: var(--font-size-lg);
  transition: transform var(--transition-fast);
}

.home-page__cta-btn:hover .home-page__cta-btn-icon {
  transform: translateX(6px);
}

/* === Admin Modal === */
.home-page__admin-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  animation: fadeIn 0.3s ease-out;
}

.home-page__admin-modal-dialog {
  width: 90%;
  max-width: 400px;
  animation: slideInUp 0.3s ease-out;
}

.home-page__admin-modal-content {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-2xl);
}

.home-page__admin-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: var(--color-text-light);
}

.home-page__admin-modal-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.home-page__admin-modal-close {
  background: none;
  border: none;
  color: var(--color-text-light);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.home-page__admin-modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.home-page__admin-modal-body {
  padding: var(--spacing-xl);
}

.home-page__admin-form {
  /* Form container */
}

.home-page__admin-field {
  margin-bottom: var(--spacing-lg);
}

.home-page__admin-label {
  display: block;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-sm);
}

.home-page__admin-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
}

.home-page__admin-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-shadow-focus);
}

.home-page__admin-actions {
  /* Actions container */
}

.home-page__admin-submit {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  justify-content: center;
  background-color: var(--color-primary);
  color: var(--color-text-light);
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.home-page__admin-submit:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
}

.home-page__admin-submit-icon {
  transition: transform var(--transition-fast);
}

.home-page__admin-submit:hover .home-page__admin-submit-icon {
  transform: translateX(2px);
}

/* === Animations === */
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === Responsive Design === */
@media (max-width: 992px) {
  .home-page__hero {
    min-height: 80vh;
    text-align: center;
  }

  .home-page__hero-title {
    font-size: var(--font-size-4xl);
  }

  .home-page__section-title,
  .home-page__cta-title {
    font-size: var(--font-size-3xl);
  }
}

@media (max-width: 768px) {
  .home-page__services,
  .home-page__projects,
  .home-page__cta {
    padding: var(--spacing-4xl) 0;
  }

  .home-page__hero-title {
    font-size: var(--font-size-3xl);
  }

  .home-page__hero-actions {
    justify-content: center;
  }

  .home-page__hero-btn {
    padding: var(--spacing-sm) var(--spacing-xl);
    font-size: var(--font-size-base);
  }

  .home-page__service-card,
  .home-page__project-card {
    padding: var(--spacing-xl);
  }

  .home-page__profile-avatar {
    width: 150px;
    height: 150px;
  }


  .home-page__cta-btn {
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: var(--font-size-lg);
  }
}

@media (max-width: 480px) {
  .home-page__hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .home-page__hero-btn {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }

  .home-page__project-technologies {
    justify-content: center;
  }

  .home-page__admin-modal-dialog {
    width: 95%;
    margin: var(--spacing-lg);
  }
}

/* === Dark Mode Support === */
[data-theme="dark"] .home-page__hero {
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-bg-dark) 100%);
}

[data-theme="dark"] .home-page__projects--featured,
[data-theme="dark"] .home-page__cta {
  background-color: var(--color-bg-primary);
}

[data-theme="dark"] .home-page__service-card,
[data-theme="dark"] .home-page__project-card {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-primary);
}

[data-theme="dark"] .home-page__project-tech {
  background-color: rgba(var(--color-primary-rgb), 0.15);
  color: var(--color-primary-light);
}

[data-theme="dark"] .home-page__admin-modal-content {
  background: var(--color-bg-primary);
}

/* === Accessibility === */
@media (prefers-reduced-motion: reduce) {
  .home-page__hero-content,
  .home-page__profile,
  .home-page__service-card,
  .home-page__project-card,
  .home-page__hero-btn,
  .home-page__project-link,
  .home-page__cta-btn,
  .home-page__admin-modal {
    animation: none;
    transition: none;
  }

  .home-page__service-card:hover,
  .home-page__project-card:hover,
  .home-page__hero-btn:hover,
  .home-page__project-link:hover,
  .home-page__cta-btn:hover {
    transform: none;
  }
}

/* === Focus Management === */
.home-page__hero-name--interactive:focus-visible,
.home-page__hero-btn:focus-visible,
.home-page__project-link:focus-visible,
.home-page__projects-cta:focus-visible,
.home-page__cta-btn:focus-visible,
.home-page__admin-modal-close:focus-visible,
.home-page__admin-input:focus-visible,
.home-page__admin-submit:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* === Legacy Compatibility === */
.section {
  padding: 5rem 0;
}

.section-alt {
  background-color: var(--legacy-gray-50);
}

/* Legacy styles preserved for compatibility */
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--legacy-dark-primary);
}

.section-subtitle {
  font-size: 1.125rem;
  margin-bottom: 0;
  line-height: 1.6;
}
</style>
