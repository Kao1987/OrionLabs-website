<template>
  <div class="portfolio-page">
    <!-- 頁面標題 -->
    <section class="page-header">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center">
            <h1 class="page-header__title display-4 fw-bold">作品集</h1>
            <p class="page-header__lead lead">展示我的設計與開發專案</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 篩選選單 -->
    <section class="section">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <!-- 搜尋與篩選區塊 -->
            <div class="portfolio-filter mb-4">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                    <input
                      :value="searchQuery"
                      @input="setSearchQuery(($event.target as HTMLInputElement).value)"
                      type="text"
                      class="form-control"
                      placeholder="搜尋專案名稱、描述或技術..."
                    />
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <button
                    @click="clearFilters"
                    class="btn btn-outline-secondary"
                    v-if="
                      searchQuery || selectedCategory !== 'all' || selectedTechnologies.length > 0
                    "
                  >
                    <i class="bi bi-x-circle me-1"></i>
                    清除篩選
                  </button>
                </div>
              </div>
            </div>

            <!-- 分類篩選 -->
            <div class="portfolio-filter__categories text-center mb-4">
              <button
                v-for="category in categoryOptions"
                :key="category.id"
                @click="filterProjects(category.id)"
                class="portfolio-filter__category-btn"
                :class="{ 'portfolio-filter__category-btn--active': selectedCategory === category.id }"
              >
                {{ category.name }}
              </button>
            </div>

            <!-- 技術標籤篩選 -->
            <div class="portfolio-filter__technology mb-4" v-if="technologies && technologies.length > 0">
              <h6 class="text-muted mb-3">
                <i class="bi bi-gear me-1"></i>
                技術篩選：
              </h6>
              <div class="d-flex flex-wrap gap-2">
                <span
                  v-for="tech in (technologies || []).slice(0, 10)"
                  :key="tech"
                  @click="toggleTechnology(tech)"
                  class="portfolio-filter__tech-badge"
                  :class="{ 'portfolio-filter__tech-badge--active': selectedTechnologies.includes(tech) }"
                >
                  {{ tech }}
                  <span v-if="selectedTechnologies.includes(tech)" class="ms-1">
                    <i class="bi bi-check"></i>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 篩選結果統計 -->
        <div
          class="row mb-4"
          v-if="searchQuery || selectedCategory !== 'all' || selectedTechnologies.length > 0"
        >
          <div class="col-12">
            <div class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              找到 {{ filteredProjects ? filteredProjects.length : 0 }} 個專案
              <span v-if="searchQuery">，搜尋：「{{ searchQuery }}」</span>
              <span v-if="selectedCategory !== 'all'"
                >，分類：{{
                  categoryNameMap[selectedCategory as keyof typeof categoryNameMap]
                }}</span
              >
              <span v-if="selectedTechnologies.length > 0"
                >，技術：{{ selectedTechnologies.join(", ") }}</span
              >
            </div>
          </div>
        </div>

        <!-- 作品展示 -->
        <div class="row g-4" v-if="paginatedProjects && paginatedProjects.length > 0">
          <div v-for="project in paginatedProjects" :key="project.id" class="col-lg-4 col-md-6">
            <div class="portfolio-card card h-100">
              <div class="position-relative">
                <div
                  class="portfolio-card__image card-img-top d-flex align-items-center justify-content-center"
                  style="height: 200px"
                >
                  <i :class="getProjectIcon(project.category)" class="portfolio-card__icon display-3"></i>
                </div>
                <div class="portfolio-card__overlay">
                  <div class="portfolio-card__overlay-content">
                    <button @click="openModal(project)" class="btn btn-light btn-sm me-2">
                      <i class="bi bi-eye"></i> 預覽
                    </button>
                    <a
                      :href="project.demoUrl"
                      target="_blank"
                      class="btn btn-primary btn-sm"
                      v-if="project.demoUrl"
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
                    v-for="tech in project.technologies || []"
                    :key="tech"
                    class="badge bg-secondary"
                  >
                    {{ tech }}
                  </span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">
                    <i class="bi bi-calendar3 me-1"></i>{{ formatDate(project.startDate) }}
                  </small>
                  <span :class="getCategoryBadgeClass(project.category)" class="badge">
                    {{ getCategoryName(project.category) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分頁 -->
        <nav aria-label="Portfolio pagination" class="mt-5" v-if="totalPages > 1" style="margin-top: var(--spacing-12) !important;">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage <= 1 }">
              <button
                class="page-link"
                @click="setPage(currentPage - 1)"
                :disabled="currentPage <= 1"
                aria-label="Previous"
              >
                <span aria-hidden="true">&laquo;</span>
              </button>
            </li>

            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: currentPage === page }"
            >
              <button v-if="typeof page === 'number'" class="page-link" @click="setPage(page)">
                {{ page }}
              </button>
              <span v-else class="page-link">
                {{ page }}
              </span>
            </li>

            <li class="page-item" :class="{ disabled: currentPage >= totalPages }">
              <button
                class="page-link"
                @click="setPage(currentPage + 1)"
                :disabled="currentPage >= totalPages"
                aria-label="Next"
              >
                <span aria-hidden="true">&raquo;</span>
              </button>
            </li>
          </ul>
        </nav>

        <!-- 空狀態顯示 -->
        <div class="row" v-else>
          <div class="col-12">
            <!-- 篩選結果為空 -->
            <div
              v-if="searchQuery || selectedCategory !== 'all' || selectedTechnologies.length > 0"
              class="text-center py-5"
            >
              <i class="bi bi-search display-1 text-muted mb-3"></i>
              <h4 class="text-muted">沒有找到符合條件的專案</h4>
              <p class="text-muted">請嘗試修改篩選條件或搜尋關鍵字</p>
              <button @click="clearFilters" class="btn btn-primary">清除篩選</button>
            </div>

            <!-- 預設內容 -->
            <div v-else class="portfolio-empty-state">
              <div class="text-center py-5 mb-5">
                <i class="bi bi-briefcase display-1 text-primary mb-3"></i>
                <h4>作品集即將上線</h4>
                <p class="text-muted lead">我將在這裡展示精心打造的開發專案與設計作品</p>
              </div>

              <!-- 預計展示的專案類型 -->
              <div class="row g-4 mb-5">
                <div class="col-md-6 col-lg-3">
                  <div class="preview-card card h-100">
                    <div class="card-body text-center">
                      <i class="bi bi-globe display-4 text-primary mb-3"></i>
                      <h5 class="card-title">網站開發</h5>
                      <p class="card-text text-muted">響應式網站、SPA 應用程式、電商平台</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 col-lg-3">
                  <div class="preview-card card h-100">
                    <div class="card-body text-center">
                      <i class="bi bi-tools display-4 text-primary mb-3"></i>
                      <h5 class="card-title">工具應用</h5>
                      <p class="card-text text-muted">開發工具、生產力應用、自動化腳本</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 col-lg-3">
                  <div class="preview-card card h-100">
                    <div class="card-body text-center">
                      <i class="bi bi-phone display-4 text-primary mb-3"></i>
                      <h5 class="card-title">移動應用</h5>
                      <p class="card-text text-muted">PWA、混合應用、原生應用開發</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 col-lg-3">
                  <div class="preview-card card h-100">
                    <div class="card-body text-center">
                      <i class="bi bi-palette display-4 text-primary mb-3"></i>
                      <h5 class="card-title">UI/UX 設計</h5>
                      <p class="card-text text-muted">介面設計、使用者體驗優化、原型設計</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 技術棧預覽 -->
              <div class="text-center mb-5">
                <h5 class="mb-4">主要技術棧</h5>
                <div class="d-flex flex-wrap justify-content-center gap-2">
                  <span class="badge bg-primary">Vue.js</span>
                  <span class="badge bg-secondary">React</span>
                  <span class="badge bg-success">TypeScript</span>
                  <span class="badge bg-warning">JavaScript</span>
                  <span class="badge bg-info">Node.js</span>
                  <span class="badge bg-dark">MongoDB</span>
                  <span class="badge bg-danger">Redis</span>
                  <span class="badge bg-primary">Docker</span>
                </div>
              </div>

              <!-- 聯絡區塊 -->
              <div class="text-center">
                <div class="contact-prompt card">
                  <div class="card-body">
                    <h5 class="card-title">
                      <i class="bi bi-envelope me-2"></i>
                      有專案需求嗎？
                    </h5>
                    <p class="card-text">歡迎與我討論您的專案構想，一起創造優質的數位體驗！</p>
                    <router-link to="/contact" class="btn btn-primary">
                      <i class="bi bi-chat-dots me-2"></i>
                      聯絡合作
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
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
                <div
                  class="project-modal__image d-flex align-items-center justify-content-center"
                  style="height: 300px; border-radius: 15px"
                >
                  <i
                    :class="getProjectIcon(selectedProject?.category || '')"
                    class="project-modal__icon display-1"
                  ></i>
                </div>
              </div>
              <div class="col-md-6">
                <p>{{ selectedProject.longDescription }}</p>
                <h6>使用技術：</h6>
                <div class="d-flex flex-wrap gap-1 mb-3">
                  <span
                    v-for="tech in selectedProject.technologies || []"
                    :key="tech"
                    class="badge bg-primary"
                  >
                    {{ tech }}
                  </span>
                </div>
                <h6>使用技術：</h6>
                <ul>
                  <li v-for="tech in selectedProject.technologies || []" :key="tech">
                    {{ tech }}
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
              v-if="selectedProject.demoUrl"
              :href="selectedProject.demoUrl"
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
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { usePortfolioStore, type PortfolioProject } from "@/stores/portfolio";

const portfolioStore = usePortfolioStore();

// 從 store 獲取響應式資料
const {
  paginatedProjects,
  filteredProjects,
  searchQuery,
  selectedCategory,
  selectedTechnologies,
  currentPage,
  totalPages,
  categories,
  technologies,
} = storeToRefs(portfolioStore);

// 從 store 獲取方法
const { setSearchQuery, setCategory, toggleTechnology, setPage, clearFilters } = portfolioStore;

// 選中的專案 (用於 modal)
const selectedProject = ref<PortfolioProject | null>(null);

// 映射分類名稱
const categoryNameMap = computed(() => ({
  all: "全部",
  web: "網站開發",
  tool: "工具應用",
  game: "遊戲相關",
  other: "其他專案",
}));

// 格式化分類選項
const categoryOptions = computed(() => {
  if (!categories.value || !Array.isArray(categories.value)) {
    return [];
  }
  return categories.value.map((cat) => ({
    id: cat,
    name: categoryNameMap.value[cat as keyof typeof categoryNameMap.value] || cat,
  }));
});

// 事件處理函數
const filterProjects = (categoryId: string) => {
  setCategory(categoryId);
};

const openModal = (project: PortfolioProject) => {
  selectedProject.value = project;
  const modalElement = document.getElementById("projectModal");
  if (modalElement) {
    // @ts-expect-error Bootstrap modal not typed
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
};

// 獲取類別對應的圖標
const getProjectIcon = (category: string): string => {
  const iconMap: { [key: string]: string } = {
    web: "bi bi-globe",
    tool: "bi bi-tools",
    game: "bi bi-controller",
    other: "bi bi-star",
  };
  return iconMap[category] || "bi bi-file-code";
};

// 獲取類別名稱
const getCategoryName = (category: string): string => {
  const nameMap: { [key: string]: string } = {
    web: "網站開發",
    tool: "工具應用",
    game: "遊戲相關",
    other: "其他專案",
  };
  return nameMap[category] || category;
};

// 獲取類別標籤樣式
const getCategoryBadgeClass = (category: string): string => {
  const classMap: { [key: string]: string } = {
    web: "badge-primary",
    tool: "badge-secondary",
    game: "badge-outline",
    other: "badge-secondary",
  };
  return `badge ${classMap[category] || "badge-outline"}`;
};

// 格式化日期
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
  });
};

// 顯示的分頁號碼
const visiblePages = computed(() => {
  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];

  for (
    let i = Math.max(2, currentPage.value - delta);
    i <= Math.min(totalPages.value - 1, currentPage.value + delta);
    i++
  ) {
    range.push(i);
  }

  if (currentPage.value - delta > 2) {
    rangeWithDots.push(1, "...");
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (currentPage.value + delta < totalPages.value - 1) {
    rangeWithDots.push("...", totalPages.value);
  } else {
    rangeWithDots.push(totalPages.value);
  }

  return rangeWithDots.filter(
    (v, i, a) => a.indexOf(v) === i && (typeof v === "number" ? v <= totalPages.value : true),
  );
});

// 生命週期
onMounted(async () => {
  try {
    await portfolioStore.fetchProjects();
  } catch (err) {
    console.error("Failed to fetch portfolio projects:", err);
    // 即使失敗也不阻止組件渲染，因為有預設內容
  }
});
</script>

<style scoped>
/* 全局設定 */
.portfolio-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.section {
  padding: var(--section-padding) 0; /* 使用語義化節區間距 */
}

/* 頁面標題 */
.page-header {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: var(--color-text-light);
  padding: var(--section-padding-sm) 0; /* 使用語義化節區間距 */
  margin-bottom: 0;
}

.page-header__title {
  font-weight: 700;
  margin-bottom: var(--spacing-4); /* 使用統一間距系統 */
}

.page-header__lead {
  font-size: 1.25rem;
  opacity: 0.9;
}

/* 篩選按鈕 */
.portfolio-filter__categories {
  margin-bottom: var(--spacing-12); /* 使用統一間距系統 */
}

.portfolio-filter__category-btn {
  border-radius: 25px;
  padding: var(--btn-padding-y) var(--spacing-6); /* 使用統一間距系統 */
  font-weight: 500;
  margin: var(--spacing-1); /* 使用統一間距系統 */
  transition: all 0.3s ease;
  border: 2px solid var(--color-border-primary);
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
}

.portfolio-filter__category-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--color-shadow-medium);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.portfolio-filter__category-btn--active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  border-color: var(--color-primary);
  color: var(--color-text-light);
  transform: translateY(-2px);
  box-shadow: var(--color-shadow-focus);
}

/* 作品卡片 */
.portfolio-card {
  border: none;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.4s ease;
  background: var(--color-bg-card);
  position: relative;
}

.portfolio-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-hover));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.portfolio-card:hover {
  transform: translateY(-15px);
  box-shadow: var(--shadow-lg);
}

.portfolio-card:hover::before {
  transform: scaleX(1);
}

/* 專案圖片區域 */
.portfolio-card__image {
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.portfolio-card__image::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, var(--white-alpha-10) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.portfolio-card:hover .portfolio-card__image::before {
  transform: translateX(100%);
}

.portfolio-card__icon {
  color: var(--color-text-muted);
  transition: all 0.3s ease;
}

.portfolio-card:hover .portfolio-card__icon {
  color: var(--color-primary);
  transform: scale(1.1);
}

/* Overlay 效果 */
.portfolio-card__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--color-bg-overlay), var(--color-primary-dark));
  opacity: 0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.portfolio-card:hover .portfolio-card__overlay {
  opacity: 1;
}

.portfolio-card__overlay-content {
  text-align: center;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.portfolio-card:hover .portfolio-card__overlay-content {
  transform: translateY(0);
}

.portfolio-card__overlay-content .btn {
  border-radius: 25px;
  padding: 0.5rem 1.2rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.portfolio-card__overlay-content .btn:hover {
  transform: scale(1.05);
}

/* 卡片內容 */
.card-body {
  padding: var(--card-padding); /* 使用語義化卡片間距 */
}

.card-title {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-4); /* 使用統一間距系統 */
}

.card-text {
  line-height: 1.6;
  margin-bottom: var(--spacing-4); /* 使用統一間距系統 */
}

/* 技術標籤 */
.badge {
  font-size: 0.75rem;
  padding: var(--spacing-1) var(--spacing-3); /* 使用統一間距系統 */
  border-radius: 12px;
  font-weight: 500;
}

.portfolio-filter__tech-badge {
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  padding: var(--spacing-2) var(--spacing-4); /* 使用統一間距系統 */
  background-color: var(--color-bg-tertiary);
  border-radius: 20px;
}

.portfolio-filter__tech-badge:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.portfolio-filter__tech-badge--active {
  background-color: var(--brand-primary);
  color: white;
}

/* 搜尋與篩選區域 */
.portfolio-filter {
  background: var(--color-bg-card);
  padding: var(--spacing-8); /* 使用統一間距系統 */
  border-radius: 15px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-primary);
}

.portfolio-filter__technology {
  background: var(--color-bg-secondary);
  padding: var(--spacing-6); /* 使用統一間距系統 */
  border-radius: 12px;
  border: 1px solid var(--color-border-primary);
}

.bg-primary {
  background-color: var(--color-primary) !important;
}
.bg-success {
  background-color: var(--color-success) !important;
}
.bg-warning {
  background-color: var(--color-warning) !important;
}
.bg-info {
  background-color: var(--color-info) !important;
}

/* Modal 樣式 */
.project-modal__image {
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%);
  border: 2px dashed var(--color-border-primary);
}

.project-modal__icon {
  color: var(--color-text-muted);
}

.modal-content {
  border-radius: 20px;
  border: none;
  box-shadow: var(--shadow-xl);
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
}

.modal-header {
  border-bottom: 1px solid var(--color-border-primary);
  padding: var(--spacing-4) var(--spacing-6); /* 使用統一間距系統 */
  background-color: var(--color-bg-secondary);
}

.modal-body {
  padding: var(--spacing-6); /* 使用統一間距系統 */
}

.modal-footer {
  border-top: 1px solid var(--color-border-primary);
  padding: var(--spacing-4) var(--spacing-6); /* 使用統一間距系統 */
  gap: var(--spacing-3); /* 使用統一間距系統 */
}

/* 空狀態 */
.portfolio-page .py-5 {
  padding: 5rem 0 !important;
}

/* 響應式設計 */
@media (max-width: 992px) {
  .section {
    padding: 4rem 0;
  }

  .page-header {
    padding: 3rem 0;
  }

  .page-header__title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .section {
    padding: 3rem 0;
  }

  .page-header {
    padding: 2.5rem 0;
  }

  .page-header__title {
    font-size: 2rem;
  }

  .portfolio-filter__category-btn {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    margin: 0.2rem;
  }

  .portfolio-card {
    margin-bottom: 2rem;
  }

  .modal-dialog {
    margin: 1rem;
  }

  .modal-body {
    padding: 1.5rem;
  }
}

/* 響應式設計 - Google Material Design 3 Breakpoints */
@media (max-width: 599px) { /* Compact */
  .page-header__title {
    font-size: 1.75rem;
  }

  .page-header__lead {
    font-size: 1rem;
  }

  .portfolio-filter {
    padding: var(--spacing-6);
    margin-bottom: var(--spacing-8);
  }

  .portfolio-filter__categories {
    margin-bottom: var(--spacing-8);
  }

  .portfolio-filter__category-btn {
    font-size: 0.8rem;
    padding: var(--spacing-2) var(--spacing-4);
    margin: var(--spacing-1);
  }

  .portfolio-filter__technology {
    padding: var(--spacing-4);
  }

  .card-body {
    padding: var(--card-padding-sm);
  }

  .portfolio-card__overlay-content .btn {
    padding: var(--spacing-2) var(--spacing-4);
    font-size: 0.8rem;
  }

  .modal-dialog {
    margin: var(--spacing-4);
  }

  .modal-header,
  .modal-footer {
    padding: var(--spacing-3) var(--spacing-4);
  }

  .modal-body {
    padding: var(--spacing-4);
  }
}

@media (min-width: 600px) and (max-width: 839px) { /* Medium */
  .portfolio-filter {
    padding: var(--spacing-7);
  }

  .card-body {
    padding: var(--card-padding);
  }
}

@media (min-width: 840px) and (max-width: 1199px) { /* Expanded */
  .portfolio-filter {
    padding: var(--spacing-8);
  }

  .section {
    padding: var(--section-padding) 0;
  }
}

@media (min-width: 1200px) { /* Large & Extra Large */
  .container {
    max-width: var(--container-large);
  }

  .section {
    padding: var(--section-padding-lg) 0;
  }

  .portfolio-filter {
    padding: var(--spacing-10);
  }
}

/* 動畫效果 */
.portfolio-card {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(30px);
}

.portfolio-card:nth-child(1) { animation-delay: 0.1s; }
.portfolio-card:nth-child(2) { animation-delay: 0.2s; }
.portfolio-card:nth-child(3) { animation-delay: 0.3s; }
.portfolio-card:nth-child(4) { animation-delay: 0.4s; }
.portfolio-card:nth-child(5) { animation-delay: 0.5s; }
.portfolio-card:nth-child(6) { animation-delay: 0.6s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 預設內容樣式 */
.portfolio-empty-state {
  padding: var(--spacing-8) 0;
}

.preview-card {
  border: none;
  border-radius: 15px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  background: var(--color-bg-card);
}

.preview-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.preview-card .card-body {
  padding: var(--card-padding);
}

.contact-prompt {
  border: none;
  border-radius: 15px;
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%);
  box-shadow: var(--shadow-sm);
  max-width: 500px;
  margin: 0 auto;
}

.contact-prompt .card-body {
  padding: var(--card-padding-lg);
}

.contact-prompt .btn {
  border-radius: 25px;
  padding: var(--btn-padding-y) var(--spacing-6);
  font-weight: 500;
}

/* 分頁樣式 */
.pagination {
  margin-bottom: 0;
}

.page-link {
  padding: var(--spacing-3) var(--spacing-4);
  margin: 0 var(--spacing-1);
  border-radius: 8px;
  border: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
  background-color: var(--color-bg-card);
  transition: all 0.3s ease;
}

.page-link:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-2px);
}

.page-item.active .page-link {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-light);
}

.page-item.disabled .page-link {
  color: var(--color-text-muted);
  background-color: var(--color-bg-muted);
  border-color: var(--color-border-muted);
  cursor: not-allowed;
}

.page-item.disabled .page-link:hover {
  transform: none;
}

/* === Dark Mode Support === */
[data-theme="dark"] .portfolio-page {
  background: var(--color-bg-primary);
}

[data-theme="dark"] .page-header {
  background: var(--color-bg-secondary);
}

[data-theme="dark"] .text-muted {
  color: var(--color-text-secondary) !important;
}

[data-theme="dark"] .portfolio-card {
  background: var(--color-bg-card);
  border-color: var(--color-border-primary);
}

[data-theme="dark"] .portfolio-filter {
  background: var(--color-bg-card);
  border-color: var(--color-border-primary);
}

[data-theme="dark"] .card {
  background: var(--color-bg-card);
  border-color: var(--color-border-primary);
  color: var(--color-text-primary);
}

[data-theme="dark"] .card-title {
  color: var(--color-text-primary);
}

[data-theme="dark"] .card-text {
  color: var(--color-text-secondary);
}

[data-theme="dark"] .btn-outline-secondary {
  border-color: var(--color-border-primary);
  color: var(--color-text-secondary);
}

[data-theme="dark"] .btn-outline-secondary:hover {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border-primary);
  color: var(--color-text-primary);
}
</style>
