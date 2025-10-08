<template>
  <div class="blog-management">
    <div
      class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom"
    >
      <h1 class="h2">部落格管理</h1>
      <button @click="showAddModal = true" class="btn btn-primary" :disabled="createLoading">
        <span
          v-if="createLoading"
          class="spinner-border spinner-border-sm me-1"
          role="status"
        ></span>
        <i v-else class="bi bi-plus-circle me-1"></i>
        新增文章
      </button>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error.message }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="fetchLoading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="mt-2 text-secondary">載入文章列表...</p>
    </div>

    <!-- 搜尋和篩選 -->
    <div class="row mb-3" v-if="!fetchLoading">
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="搜尋文章標題或內容..."
          />
        </div>
      </div>
      <div class="col-md-3">
        <select v-model="statusFilter" class="form-select">
          <option value="">全部狀態</option>
          <option value="published">已發布</option>
          <option value="draft">草稿</option>
          <option value="archived">已封存</option>
        </select>
      </div>
      <div class="col-md-3">
        <button @click="clearFilters" class="btn btn-outline-secondary w-100">
          <i class="bi bi-x-circle me-1"></i>
          清除篩選
        </button>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="row" v-if="!fetchLoading">
      <div class="col-12">
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>標題</th>
                <th>標籤</th>
                <th>狀態</th>
                <th>作者</th>
                <th>發布日期</th>
                <th>更新日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="post in filteredPosts" :key="post.id">
                <td>
                  <div class="fw-bold">{{ post.title }}</div>
                  <small class="text-secondary">{{ post.excerpt }}</small>
                </td>
                <td>
                  <span
                    v-for="tag in post.tags.slice(0, 2)"
                    :key="tag"
                    class="badge bg-primary me-1"
                  >
                    {{ tag }}
                  </span>
                  <span v-if="post.tags.length > 2" class="text-secondary small">
                    +{{ post.tags.length - 2 }}
                  </span>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="{
                      'bg-success': post.status === 'published',
                      'bg-warning': post.status === 'draft',
                    }"
                  >
                    {{ getStatusText(post.status) }}
                  </span>
                  <i
                    v-if="post.featured"
                    class="bi bi-star-fill text-warning ms-1"
                    title="精選文章"
                  ></i>
                </td>
                <td>{{ post.author }}</td>
                <td>{{ formatDate(post.publishedAt) }}</td>
                <td>{{ formatDate(post.updatedAt) }}</td>
                <td>
                  <div class="btn-group" role="group">
                    <button
                      @click="editPost(post)"
                      class="btn btn-sm btn-outline-primary"
                      :disabled="updateLoading"
                      title="編輯"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      @click="toggleFeatured(post)"
                      class="btn btn-sm btn-outline-warning"
                      :disabled="updateLoading"
                      :title="post.featured ? '取消精選' : '設為精選'"
                    >
                      <i class="bi" :class="post.featured ? 'bi-star-fill' : 'bi-star'"></i>
                    </button>
                    <button
                      @click="confirmDelete(post)"
                      class="btn btn-sm btn-outline-danger"
                      :disabled="deleteLoading"
                      title="刪除"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredPosts.length === 0 && !fetchLoading">
                <td colspan="7" class="text-center text-secondary py-4">
                  <i class="bi bi-journal-x display-6 d-block mb-2"></i>
                  <div v-if="searchQuery || statusFilter">找不到符合條件的文章</div>
                  <div v-else>暫無文章，點擊上方「新增文章」開始撰寫</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分頁 -->
        <nav v-if="totalPages > 1" aria-label="文章分頁">
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
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
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
      </div>
    </div>

    <!-- 新增/編輯文章 Modal -->
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
              {{ showEditModal ? "編輯文章" : "新增文章" }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="savePost">
              <div class="row">
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label">文章標題 <span class="text-danger">*</span></label>
                    <input
                      v-model="currentPost.title"
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
                    <label class="form-label">作者 <span class="text-danger">*</span></label>
                    <input v-model="currentPost.author" type="text" class="form-control" required />
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">摘要 <span class="text-danger">*</span></label>
                <textarea
                  v-model="currentPost.excerpt"
                  class="form-control"
                  rows="3"
                  placeholder="文章摘要，建議 150 字以內..."
                  :class="{ 'is-invalid': formErrors.excerpt }"
                  required
                ></textarea>
                <div v-if="formErrors.excerpt" class="invalid-feedback">
                  {{ formErrors.excerpt }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">內容 <span class="text-danger">*</span></label>
                <textarea
                  v-model="currentPost.content"
                  class="form-control"
                  rows="12"
                  placeholder="在此撰寫文章內容，支援 Markdown 格式..."
                  :class="{ 'is-invalid': formErrors.content }"
                  required
                ></textarea>
                <div v-if="formErrors.content" class="invalid-feedback">
                  {{ formErrors.content }}
                </div>
                <div class="form-text">
                  支援 Markdown 語法：**粗體**、*斜體*、[連結](url)、```程式碼```
                </div>
              </div>

              <!-- 圖片上傳 -->
              <div class="mb-3">
                <label class="form-label">文章圖片</label>
                <image-upload
                  :multiple="true"
                  :show-preview="true"
                  :auto-upload="false"
                  @upload-success="handleImageUploadSuccess"
                  @upload-error="handleImageUploadError"
                  @files-added="handleFilesAdded"
                />
                <div class="form-text">
                  可上傳多張圖片，支援拖放操作。圖片將用於文章內容或封面。
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">標籤（用逗號分隔）</label>
                    <input
                      v-model="tagsInput"
                      type="text"
                      class="form-control"
                      placeholder="Vue.js, JavaScript, 前端開發"
                    />
                    <div class="form-text">建議使用 3-5 個相關標籤</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">文章分類</label>
                    <blog-category-selector
                      v-model="currentPost.category"
                      placeholder="選擇或新增分類"
                      class="w-100"
                    />
                    <div class="form-text">為文章選擇適當的分類</div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">狀態</label>
                    <select v-model="currentPost.status" class="form-select">
                      <option value="draft">草稿</option>
                      <option value="published">發布</option>
                      <option value="archived">封存</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <div class="form-check form-switch">
                      <input
                        v-model="currentPost.featured"
                        class="form-check-input"
                        type="checkbox"
                        id="featuredSwitch"
                      />
                      <label class="form-check-label" for="featuredSwitch"> 精選文章 </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
                <button
                  type="submit"
                  class="btn btn-primary"
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
            </form>
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
              確定要刪除文章「<strong>{{ postToDelete?.title }}</strong
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
              @click="deletePost"
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
import { useBlogStore, type BlogPost } from "@/stores/blog";
import { useUIStore } from "@/stores/ui";
import ImageUpload from "@/components/ImageUpload.vue";
import BlogCategorySelector from "@/components/BlogCategorySelector.vue";

const blogStore = useBlogStore();
const uiStore = useUIStore();

// Store getters
const {
  posts,
  fetchLoading,
  createLoading,
  updateLoading,
  deleteLoading,
  error,
} = blogStore;

// Modal states
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);

// Form data
const currentPost = ref<Partial<BlogPost>>({
  title: "",
  excerpt: "",
  content: "",
  author: "Orion",
  tags: [],
  featured: false,
  status: "draft",
});

const tagsInput = ref("");
const formErrors = ref<Record<string, string>>({});

// Search and filter
const searchQuery = ref("");
const statusFilter = ref("");

// Pagination
const currentPage = ref(1);
const postsPerPage = 10;

// Delete modal
const postToDelete = ref<BlogPost | null>(null);

// Computed
const filteredPosts = computed(() => {
  let filtered = posts;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(query)),
    );
  }

  if (statusFilter.value) {
    filtered = filtered.filter((post) => post.status === statusFilter.value);
  }

  const start = (currentPage.value - 1) * postsPerPage;
  const end = start + postsPerPage;
  return filtered.slice(start, end);
});

const totalPages = computed(() => {
  let filtered = posts;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(query)),
    );
  }

  if (statusFilter.value) {
    filtered = filtered.filter((post) => post.status === statusFilter.value);
  }

  return Math.ceil(filtered.length / postsPerPage);
});

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, start + 4);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Methods
const loadPosts = async () => {
  await blogStore.fetchPosts({ forAdmin: true });
};

const formatDate = (date: Date | string | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getStatusText = (status: string) => {
  const statusMap = {
    published: "已發布",
    draft: "草稿",
    archived: "已封存",
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const validateForm = () => {
  formErrors.value = {};

  if (!currentPost.value.title?.trim()) {
    formErrors.value.title = "請輸入文章標題";
  }

  if (!currentPost.value.excerpt?.trim()) {
    formErrors.value.excerpt = "請輸入文章摘要";
  }

  if (!currentPost.value.content?.trim()) {
    formErrors.value.content = "請輸入文章內容";
  }

  return Object.keys(formErrors.value).length === 0;
};

const savePost = async () => {
  if (!validateForm()) return;

  const tags = tagsInput.value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);
  const postData = {
    ...currentPost.value,
    tags,
    publishedAt: currentPost.value.status === "published" ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  } as Omit<BlogPost, "id">;

  try {
    let result;
    if (showEditModal.value && currentPost.value.id) {
      result = await blogStore.updatePost(currentPost.value.id, postData);
    } else {
      result = await blogStore.createPost(postData);
    }

    if (result.success) {
      uiStore.showSuccess("操作成功", showEditModal.value ? "文章已更新" : "文章已創建");
      closeModal();
    } else {
      const errorMsg = (result.error as { message?: string })?.message || "未知錯誤";
      uiStore.showError("操作失敗", errorMsg);
    }
  } catch (error: unknown) {
    const errorObj = error as { message?: string };
    uiStore.showError("操作失敗", errorObj.message || "未知錯誤");
  }
};

const editPost = (post: BlogPost) => {
  currentPost.value = { ...post };
  tagsInput.value = post.tags.join(", ");
  showEditModal.value = true;
  formErrors.value = {};
};

const confirmDelete = (post: BlogPost) => {
  postToDelete.value = post;
  showDeleteModal.value = true;
};

const deletePost = async () => {
  if (!postToDelete.value) return;

  try {
    const result = await blogStore.deletePost(postToDelete.value.id);
    if (result.success) {
      uiStore.showSuccess("刪除成功", "文章已刪除");
      showDeleteModal.value = false;
      postToDelete.value = null;
    } else {
      const errorMsg = (result.error as { message?: string })?.message || "未知錯誤";
      uiStore.showError("刪除失敗", errorMsg);
    }
  } catch (error: unknown) {
    const errorObj = error as { message?: string };
    uiStore.showError("刪除失敗", errorObj.message || "未知錯誤");
  }
};

const toggleFeatured = async (post: BlogPost) => {
  try {
    const result = await blogStore.updatePost(post.id, {
      featured: !post.featured,
    });
    if (result.success) {
      uiStore.showSuccess("更新成功", post.featured ? "已取消精選" : "已設為精選");
    } else {
      const errorMsg = (result.error as { message?: string })?.message || "未知錯誤";
      uiStore.showError("更新失敗", errorMsg);
    }
  } catch (error: unknown) {
    const errorObj = error as { message?: string };
    uiStore.showError("更新失敗", errorObj.message || "未知錯誤");
  }
};

const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  currentPost.value = {
    title: "",
    excerpt: "",
    content: "",
    author: "Orion",
    tags: [],
    featured: false,
    status: "draft",
  };
  tagsInput.value = "";
  formErrors.value = {};
};

const clearFilters = () => {
  searchQuery.value = "";
  statusFilter.value = "";
  currentPage.value = 1;
};

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const clearError = () => {
  blogStore.clearError();
};

// Image upload handlers
const handleImageUploadSuccess = (urls: string[]) => {
  uiStore.showSuccess("上傳成功", `已成功上傳 ${urls.length} 張圖片`);

  // Insert image markdown into content
  const imageMarkdowns = urls.map((url) => `![圖片](${url})`).join("\n\n");
  if (currentPost.value.content) {
    currentPost.value.content += "\n\n" + imageMarkdowns;
  } else {
    currentPost.value.content = imageMarkdowns;
  }
};

const handleImageUploadError = (error: Error) => {
  uiStore.showError("上傳失敗", error.message || "圖片上傳失敗");
};

const handleFilesAdded = (files: File[]) => {
  uiStore.showInfo("檔案已選擇", `已選擇 ${files.length} 個檔案，請點擊上傳按鈕開始上傳`);
};

// Watchers
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1;
});

// Lifecycle
onMounted(() => {
  loadPosts();
});
</script>

<style scoped>
.table th {
  border-top: none;
  font-weight: 600;
}

.modal {
  z-index: 1055;
}

.badge {
  font-size: 0.75rem;
}

/* BlogManagement 元件特有樣式 - Orion-BEM-Lite */
textarea {
  resize: vertical;
  min-height: 120px;
}

/* 移除重複的全域樣式，使用CSS變數 */
.form-check-input:checked {
  background-color: var(--brand-primary);
  border-color: var(--brand-primary);
}

.btn-group .btn {
  border-radius: var(--radius-md);
  margin-right: 2px;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.is-invalid {
  border-color: var(--orion-error);
}

.invalid-feedback {
  display: block;
}

.pagination {
  margin: 0;
}

.page-link {
  border-color: var(--border-color);
}

.page-item.active .page-link {
  background-color: var(--brand-primary);
  border-color: var(--brand-primary);
}

/* 提高文字對比度 */
.text-secondary {
  color: #495057 !important;
  opacity: 0.8;
}

/* 改善表格可讀性 */
.table td {
  vertical-align: middle;
}

.table th {
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
}
</style>
