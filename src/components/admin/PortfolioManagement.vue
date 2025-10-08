<template>
  <div class="portfolio-management">
    <div
      class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom"
    >
      <h1 class="h2">作品集管理</h1>
      <button @click="showAddModal = true" class="btn btn-success" :disabled="createLoading">
        <span
          v-if="createLoading"
          class="spinner-border spinner-border-sm me-1"
          role="status"
        ></span>
        <i v-else class="bi bi-plus-circle me-1"></i>
        新增作品
      </button>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error.message }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="fetchLoading" class="text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="mt-2 text-secondary">載入作品集...</p>
    </div>

    <!-- 篩選和搜尋 -->
    <div class="row mb-4" v-if="!fetchLoading">
      <div class="col-md-4">
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="搜尋作品標題或描述..."
          />
        </div>
      </div>
      <div class="col-md-3">
        <select v-model="categoryFilter" class="form-select">
          <option value="">全部類別</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ getCategoryText(category) }}
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <select v-model="statusFilter" class="form-select">
          <option value="">全部狀態</option>
          <option value="active">進行中</option>
          <option value="completed">已完成</option>
          <option value="archived">已封存</option>
        </select>
      </div>
      <div class="col-md-2">
        <button @click="clearFilters" class="btn btn-outline-secondary w-100">
          <i class="bi bi-x-circle me-1"></i>
          清除
        </button>
      </div>
    </div>

    <!-- 作品統計 -->
    <div class="row mb-4" v-if="!fetchLoading && projects.length > 0">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title mb-0">總作品數</h6>
                <h3 class="mb-0">{{ projects.length }}</h3>
              </div>
              <div class="align-self-center">
                <i class="bi bi-briefcase fs-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title mb-0">已完成</h6>
                <h3 class="mb-0">{{ completedProjects.length }}</h3>
              </div>
              <div class="align-self-center">
                <i class="bi bi-check-circle fs-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title mb-0">進行中</h6>
                <h3 class="mb-0">{{ activeProjects.length }}</h3>
              </div>
              <div class="align-self-center">
                <i class="bi bi-hourglass-split fs-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title mb-0">精選作品</h6>
                <h3 class="mb-0">{{ featuredProjects.length }}</h3>
              </div>
              <div class="align-self-center">
                <i class="bi bi-star fs-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 作品展示卡片 -->
    <div class="row g-4" v-if="!fetchLoading">
      <div v-for="project in filteredProjects" :key="project.id" class="col-lg-4 col-md-6">
        <div class="card h-100 project-card">
          <div class="position-relative">
            <div
              class="card_img-top portfolio-management_img-placeholder bg-light d-flex align-items-center justify-content-center"
              style="height: 200px"
            >
              <i :class="getCategoryIcon(project.category)" class="display-4 text-secondary"></i>
            </div>
            <div class="position-absolute top-0 end-0 m-2">
              <span v-if="project.featured" class="badge bg-warning text-dark" title="精選作品">
                <i class="bi bi-star-fill"></i>
              </span>
            </div>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0">{{ project.title }}</h5>
              <span
                class="badge"
                :class="{
                  'bg-success': project.status === 'completed',
                  'bg-warning': project.status === 'active',
                  'bg-secondary': project.status === 'archived',
                }"
              >
                {{ getStatusText(project.status) }}
              </span>
            </div>
            <p class="card-text text-secondary">{{ project.description }}</p>
            <div class="mb-3">
              <small class="text-secondary">{{ getCategoryText(project.category) }}</small>
            </div>
            <div class="d-flex flex-wrap gap-1 mb-3">
              <span
                v-for="tech in project.technologies.slice(0, 3)"
                :key="tech"
                class="badge bg-secondary"
              >
                {{ tech }}
              </span>
              <span v-if="project.technologies.length > 3" class="badge bg-light text-dark">
                +{{ project.technologies.length - 3 }}
              </span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-secondary">
                <i class="bi bi-calendar me-1"></i>
                {{ formatDate(project.startDate) }}
              </small>
              <div class="btn-group" role="group">
                <button
                  v-if="project.demoUrl"
                  @click="openLink(project.demoUrl)"
                  class="btn btn-outline-info btn-sm"
                  title="查看專案"
                >
                  <i class="bi bi-eye"></i>
                </button>
                <button
                  v-if="project.githubUrl"
                  @click="openLink(project.githubUrl)"
                  class="btn btn-outline-dark btn-sm"
                  title="查看程式碼"
                >
                  <i class="bi bi-github"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="card-footer bg-transparent">
            <div class="btn-group w-100" role="group">
              <button
                @click="editProject(project)"
                class="btn btn-outline-primary btn-sm"
                :disabled="updateLoading"
              >
                <i class="bi bi-pencil"></i> 編輯
              </button>
              <button
                @click="toggleFeatured(project)"
                class="btn btn-outline-warning btn-sm"
                :disabled="updateLoading"
                :title="project.featured ? '取消精選' : '設為精選'"
              >
                <i class="bi" :class="project.featured ? 'bi-star-fill' : 'bi-star'"></i>
              </button>
              <button
                @click="confirmDelete(project)"
                class="btn btn-outline-danger btn-sm"
                :disabled="deleteLoading"
              >
                <i class="bi bi-trash"></i> 刪除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-if="filteredProjects.length === 0 && !fetchLoading" class="col-12 text-center py-5">
        <i class="bi bi-briefcase display-1 text-secondary mb-3"></i>
        <h4 class="text-secondary">
          {{ searchQuery || categoryFilter || statusFilter ? "找不到符合條件的作品" : "暫無作品" }}
        </h4>
        <p class="text-secondary">
          {{
            searchQuery || categoryFilter || statusFilter
              ? "請調整篩選條件"
              : "點擊上方「新增作品」開始展示您的專案"
          }}
        </p>
      </div>
    </div>

    <!-- 分頁 -->
    <nav v-if="totalPages > 1" aria-label="作品分頁" class="mt-4">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
            class="page-link"
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            上一頁
          </button>
        </li>
        <li
          v-for="page in visiblePages"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
        >
          <button v-if="typeof page === 'number'" class="page-link" @click="changePage(page)">
            {{ page }}
          </button>
          <span v-else class="page-link">{{ page }}</span>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            class="page-link"
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            下一頁
          </button>
        </li>
      </ul>
    </nav>

    <!-- 新增/編輯作品 Modal -->
    <div
      v-if="showAddModal || showEditModal"
      class="modal fade show d-block"
      style="background-color: rgba(0, 0, 0, 0.5)"
      @click.self="closeModal"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ showEditModal ? "編輯作品" : "新增作品" }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProject">
              <div class="row">
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label">作品標題 <span class="text-danger">*</span></label>
                    <input
                      v-model="currentProject.title"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': formErrors.title }"
                      required
                    />
                    <div v-if="formErrors.title" class="invalid-feedback">
                      {{ formErrors.title }}
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">類別 <span class="text-danger">*</span></label>
                    <select v-model="currentProject.category" class="form-select" required>
                      <option value="">選擇類別</option>
                      <option value="web">網站開發</option>
                      <option value="mobile">行動應用</option>
                      <option value="design">UI/UX 設計</option>
                      <option value="backend">後端開發</option>
                      <option value="fullstack">全端開發</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">簡短描述 <span class="text-danger">*</span></label>
                <textarea
                  v-model="currentProject.description"
                  class="form-control"
                  rows="3"
                  placeholder="專案的簡短描述..."
                  :class="{ 'is-invalid': formErrors.description }"
                  required
                ></textarea>
                <div v-if="formErrors.description" class="invalid-feedback">
                  {{ formErrors.description }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">詳細描述 <span class="text-danger">*</span></label>
                <textarea
                  v-model="currentProject.longDescription"
                  class="form-control"
                  rows="6"
                  placeholder="專案的詳細說明、挑戰、解決方案、技術亮點等..."
                  :class="{ 'is-invalid': formErrors.longDescription }"
                  required
                ></textarea>
                <div v-if="formErrors.longDescription" class="invalid-feedback">
                  {{ formErrors.longDescription }}
                </div>
                <div class="form-text">支援 Markdown 格式</div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <!-- 使用新的技術標籤輸入組件 -->
                    <technology-tag-input
                      v-model="selectedTechnologyTags"
                      :max-tags="10"
                      placeholder="選擇或新增技術標籤..."
                    />
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">開始日期</label>
                    <input v-model="startDateInput" type="date" class="form-control" />
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">結束日期</label>
                    <input v-model="endDateInput" type="date" class="form-control" />
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Demo 連結</label>
                    <input
                      v-model="currentProject.demoUrl"
                      type="url"
                      class="form-control"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">GitHub 連結</label>
                    <input
                      v-model="currentProject.githubUrl"
                      type="url"
                      class="form-control"
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">狀態</label>
                    <select v-model="currentProject.status" class="form-select">
                      <option value="active">進行中</option>
                      <option value="completed">已完成</option>
                      <option value="archived">已封存</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3 form-check">
                    <input
                      v-model="currentProject.featured"
                      class="form-check-input"
                      type="checkbox"
                      id="featuredCheck"
                    />
                    <label class="form-check-label" for="featuredCheck"> 設為精選作品 </label>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">專案圖片</label>
                <image-upload
                  :multiple="true"
                  :show-preview="true"
                  :auto-upload="false"
                  @upload-success="handleImageUploadSuccess"
                  @upload-error="handleImageUploadError"
                  @files-added="handleFilesAdded"
                />
                <div class="form-text">上傳專案相關圖片，如截圖、設計稿等。支援拖放操作。</div>
              </div>

              <div class="mb-3">
                <label class="form-label">專案圖片 URL（手動輸入，每行一個）</label>
                <textarea
                  v-model="imagesInput"
                  class="form-control"
                  rows="3"
                  placeholder="https://example.com/image1.jpg
https://example.com/image2.jpg"
                ></textarea>
                <div class="form-text">如果您有現有的圖片 URL，可以在此輸入</div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
            <button
              type="submit"
              class="btn btn-primary"
              @click="saveProject"
              :disabled="createLoading || updateLoading"
            >
              <span
                v-if="createLoading || updateLoading"
                class="spinner-border spinner-border-sm me-1"
                role="status"
              ></span>
              {{ showEditModal ? "更新" : "儲存" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 刪除確認 Modal -->
    <div
      v-if="showDeleteModal"
      class="modal fade show d-block"
      style="background-color: rgba(0, 0, 0, 0.5)"
      @click.self="showDeleteModal = false"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">確認刪除</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>
              確定要刪除作品「<strong>{{ projectToDelete?.title }}</strong
              >」嗎？
            </p>
            <p class="text-danger small">此操作無法復原。</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
              取消
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deleteProject"
              :disabled="deleteLoading"
            >
              <span
                v-if="deleteLoading"
                class="spinner-border spinner-border-sm me-1"
                role="status"
              ></span>
              確定刪除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { usePortfolioStore, type PortfolioProject } from "@/stores/portfolio";
import { useUIStore } from "@/stores/ui";
import ImageUpload from "@/components/ImageUpload.vue";
import TechnologyTagInput from "@/components/TechnologyTagInput.vue";
import type { TechnologyTag } from "@/services/api";

const portfolioStore = usePortfolioStore();
const uiStore = useUIStore();

// Store getters
const {
  projects,
  fetchLoading,
  createLoading,
  updateLoading,
  deleteLoading,
  error,
  activeProjects,
  featuredProjects,
  categories,
} = portfolioStore;

// Modal states
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);

// Form data
const currentProject = ref<Partial<PortfolioProject>>({
  title: "",
  description: "",
  longDescription: "",
  technologies: [],
  category: "",
  images: [],
  featured: false,
  status: "active",
});

const technologiesInput = ref("");
const selectedTechnologyTags = ref<TechnologyTag[]>([]);
const imagesInput = ref("");
const startDateInput = ref("");
const endDateInput = ref("");
const formErrors = ref<Record<string, string>>({});

// Search and filter
const searchQuery = ref("");
const categoryFilter = ref("");
const statusFilter = ref("");

// Pagination
const currentPage = ref(1);
const projectsPerPage = 12;

// Delete modal
const projectToDelete = ref<PortfolioProject | null>(null);

// Computed
const completedProjects = computed(() =>
  projects.filter((project) => project.status === "completed"),
);

const filteredProjects = computed(() => {
  let filtered = [...projects];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (project) =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query),
    );
  }

  if (categoryFilter.value) {
    filtered = filtered.filter((project) => project.category === categoryFilter.value);
  }

  if (statusFilter.value) {
    filtered = filtered.filter((project) => project.status === statusFilter.value);
  }

  return filtered;
});

const totalPages = computed(() => Math.ceil(filteredProjects.value.length / projectsPerPage));

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2;

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const range = [];
  const rangeWithDots: (number | string)[] = [];

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, "...");
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (current + delta < total - 1) {
    rangeWithDots.push("...", total);
  } else if (total > 1) {
    rangeWithDots.push(total);
  }

  return rangeWithDots;
});

// Methods
const clearError = () => {
  portfolioStore.clearError();
};

const clearFilters = () => {
  searchQuery.value = "";
  categoryFilter.value = "";
  statusFilter.value = "";
};

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString("zh-TW");
};

const openLink = (url: string) => {
  window.open(url, "_blank");
};

const getCategoryIcon = (category: string) => {
  const iconMap = {
    web: "bi-globe",
    mobile: "bi-phone",
    design: "bi-palette",
    backend: "bi-server",
    fullstack: "bi-stack",
    other: "bi-question-circle",
  };
  return iconMap[category as keyof typeof iconMap] || "bi-question-circle";
};

const getCategoryText = (category: string) => {
  const categoryMap = {
    web: "網站開發",
    mobile: "行動應用",
    design: "UI/UX 設計",
    backend: "後端開發",
    fullstack: "全端開發",
    other: "其他",
  };
  return categoryMap[category as keyof typeof categoryMap] || category;
};

const getStatusText = (status: string) => {
  const statusMap = {
    active: "進行中",
    completed: "已完成",
    archived: "已封存",
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const validateForm = () => {
  formErrors.value = {};

  if (!currentProject.value.title?.trim()) {
    formErrors.value.title = "請輸入作品標題";
  }

  if (!currentProject.value.description?.trim()) {
    formErrors.value.description = "請輸入簡短描述";
  }

  if (!currentProject.value.longDescription?.trim()) {
    formErrors.value.longDescription = "請輸入詳細描述";
  }

  return Object.keys(formErrors.value).length === 0;
};

const saveProject = async () => {
  if (!validateForm()) return;

  // 從技術標籤中提取名稱
  const technologies = selectedTechnologyTags.value.map(tag => tag.name);
  const images = imagesInput.value
    .split("\n")
    .map((img) => img.trim())
    .filter((img) => img);

  const projectData = {
    ...currentProject.value,
    technologies,
    images,
    startDate: startDateInput.value ? new Date(startDateInput.value) : new Date(),
    endDate: endDateInput.value ? new Date(endDateInput.value) : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Omit<PortfolioProject, "id">;

  try {
    let result;
    if (showEditModal.value && currentProject.value.id) {
      result = await portfolioStore.updateProject(currentProject.value.id, projectData);
    } else {
      result = await portfolioStore.createProject(projectData);
    }

    if (result) {
      uiStore.showSuccess(
        showEditModal.value ? "作品更新成功" : "作品創建成功",
        `${projectData.title} 已${showEditModal.value ? "更新" : "創建"}完成`,
      );
      closeModal();
    }
  } catch (error: unknown) {
    console.error("保存作品時發生錯誤:", error);
    uiStore.showError(
      "保存失敗",
      error instanceof Error ? error.message : "保存作品時發生未知錯誤",
    );
  }
};

const editProject = async (project: PortfolioProject) => {
  currentProject.value = { ...project };
  technologiesInput.value = project.technologies.join(", ");

  // 根據技術名稱載入對應的技術標籤
  try {
    await portfolioStore.fetchTechnologyTags();
    selectedTechnologyTags.value = portfolioStore.getTechnologyTagsByNames(project.technologies);
  } catch (error) {
    console.error('載入技術標籤失敗:', error);
    // 如果載入失敗，至少保持舊的輸入方式作為後備
    selectedTechnologyTags.value = [];
  }

  imagesInput.value = project.images.join("\n");
  startDateInput.value = project.startDate
    ? new Date(project.startDate).toISOString().split("T")[0]
    : "";
  endDateInput.value = project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "";
  showEditModal.value = true;
};

const confirmDelete = (project: PortfolioProject) => {
  projectToDelete.value = project;
  showDeleteModal.value = true;
};

const deleteProject = async () => {
  if (!projectToDelete.value) return;

  try {
    await portfolioStore.deleteProject(projectToDelete.value.id);
    uiStore.showSuccess("刪除成功", `作品「${projectToDelete.value.title}」已成功刪除`);
    showDeleteModal.value = false;
    projectToDelete.value = null;
  } catch (error: unknown) {
    console.error("刪除作品時發生錯誤:", error);
    uiStore.showError(
      "刪除失敗",
      error instanceof Error ? error.message : "刪除作品時發生未知錯誤",
    );
  }
};

const toggleFeatured = async (project: PortfolioProject) => {
  try {
    await portfolioStore.updateProject(project.id, {
      ...project,
      featured: !project.featured,
    });
    uiStore.showSuccess(
      "更新成功",
      `${project.title} 已${project.featured ? "取消" : "設為"}精選作品`,
    );
  } catch (error: unknown) {
    console.error("更新精選狀態時發生錯誤:", error);
    uiStore.showError(
      "更新失敗",
      error instanceof Error ? error.message : "更新精選狀態時發生未知錯誤",
    );
  }
};

const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  currentProject.value = {
    title: "",
    description: "",
    longDescription: "",
    technologies: [],
    category: "",
    images: [],
    featured: false,
    status: "active",
  };
  technologiesInput.value = "";
  selectedTechnologyTags.value = [];
  imagesInput.value = "";
  startDateInput.value = "";
  endDateInput.value = "";
  formErrors.value = {};
};

// Upload handlers
const handleImageUploadSuccess = (urls: string[]) => {
  const existingUrls = imagesInput.value.split("\n").filter((url) => url.trim());
  const allUrls = [...existingUrls, ...urls];
  imagesInput.value = allUrls.join("\n");
};

const handleImageUploadError = (error: Error) => {
  uiStore.showError("上傳失敗", error.message || "圖片上傳失敗");
};

const handleFilesAdded = (files: File[]) => {
  uiStore.showInfo("檔案已選擇", `已選擇 ${files.length} 個檔案，請點擊上傳按鈕開始上傳`);
};

// Lifecycle
onMounted(() => {
  portfolioStore.fetchProjects({ forAdmin: true });
  portfolioStore.fetchTechnologyTags(); // 載入技術標籤
});

// Watchers
watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(categoryFilter, () => {
  currentPage.value = 1;
});

watch(statusFilter, () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.btn-outline-success:hover {
  background-color: var(--orion-success);
  border-color: var(--orion-success);
}

/* PortfolioManagement 元件特有樣式 - Orion-BEM-Lite */
.portfolio_img-placeholder {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
}

.portfolio_badge {
  box-shadow: var(--shadow-sm);
}

/* 移除重複樣式，使用全域 card_footer */
.display-1 {
  font-size: var(--text-6xl);
}

.fs-2 {
  font-size: var(--text-xl);
}

/* 提高文字對比度 */
.text-secondary {
  color: #495057 !important;
  opacity: 0.8;
}

/* 改善卡片可讀性 */
.card {
  border: 1px solid #dee2e6;
  transition: all 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
