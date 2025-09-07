<template>
  <div class="blog-page">
    <!-- 頁面標題 -->
    <section class="page-header" style="padding: var(--section-padding-sm) 0;">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center">
            <h1 class="page-header__title display-4 fw-bold" style="margin-bottom: var(--spacing-4);">部落格</h1>
            <p class="page-header__lead lead">分享技術心得與開發經驗</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 文章列表 -->
    <section class="section" style="padding: var(--section-padding) 0;">
      <div class="container">
        <!-- 分類篩選 -->
        <div class="row" style="margin-bottom: var(--spacing-6);">
          <div class="col-12">
            <div class="blog-filter" style="padding: var(--spacing-6); border-radius: var(--radius-lg); background: var(--color-bg-card); margin-bottom: var(--spacing-8);">
              <div class="d-flex flex-wrap align-items-center justify-content-between" style="margin-bottom: var(--spacing-5);">
                <h5 class="mb-0">文章列表</h5>
                <div class="d-flex align-items-center">
                  <span class="text-muted" style="margin-right: var(--spacing-3);">共 {{ filteredPosts.length }} 篇文章</span>
                </div>
              </div>

              <!-- 分類按鈕 -->
              <div class="blog-filter__categories" style="margin-bottom: var(--spacing-5);">
                <div class="d-flex flex-wrap" style="gap: var(--spacing-3);">
                  <button
                    @click="selectCategory('')"
                    class="blog-filter__category-btn btn btn-sm"
                    :class="{
                      'blog-filter__category-btn--active': selectedCategory === '',
                      'btn-outline-primary': selectedCategory !== ''
                    }"
                    style="padding: var(--btn-padding-y) var(--spacing-4);"
                  >
                    全部
                  </button>
                  <button
                    v-for="category in categories"
                    :key="category"
                    @click="selectCategory(category)"
                    class="blog-filter__category-btn btn btn-sm"
                    :class="{
                      'blog-filter__category-btn--active': selectedCategory === category,
                      'btn-outline-primary': selectedCategory !== category
                    }"
                    style="padding: var(--btn-padding-y) var(--spacing-4);"
                  >
                    {{ category }}
                  </button>
                </div>
              </div>

              <!-- 搜尋框 -->
              <div class="blog-filter__search">
                <div class="input-group" style="border-radius: var(--radius-lg); overflow: hidden;">
                  <span class="input-group-text" style="background: var(--color-primary); border: none; color: var(--color-text-light);">
                    <i class="bi bi-search"></i>
                  </span>
                  <input
                    :value="searchQuery"
                    @input="setSearchQuery(($event.target as HTMLInputElement).value)"
                    type="text"
                    class="form-control"
                    placeholder="搜尋文章標題或內容..."
                    style="border: none; padding: var(--spacing-3) var(--spacing-4); background: var(--color-bg-primary);"
                  />
                  <button
                    v-if="searchQuery"
                    @click="clearSearch"
                    class="btn btn-outline-secondary"
                    type="button"
                    style="border: none; padding: var(--spacing-3) var(--spacing-4);"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- 文章內容 -->
          <div class="col-lg-8">
            <!-- 有文章時顯示列表 -->
            <div class="row" style="gap: var(--spacing-6);" v-if="paginatedPosts.length > 0">
              <div
                v-for="(post, index) in paginatedPosts"
                :key="post.id"
                class="col-12"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <article class="blog-card card h-100">
                  <div class="row g-0 h-100">
                    <div class="col-md-4 blog-card__column">
                      <div
                        class="blog-card__image d-flex align-items-center justify-content-center h-100"
                        style="min-height: 200px"
                      >
                        <i
                          :class="getCategoryIcon((post as any).category || 'general')"
                          class="display-3 text-primary"
                        ></i>
                      </div>
                    </div>
                    <div class="col-md-8 blog-card__column d-flex">
                      <div class="card-body d-flex flex-column" style="padding: var(--card-padding);">
                        <div class="d-flex align-items-center" style="margin-bottom: var(--spacing-3);">
                          <span
                            :class="getCategoryBadgeClass((post as any).category || 'general')"
                            class="badge"
                            style="margin-right: var(--spacing-3); padding: var(--spacing-1) var(--spacing-3);"
                            >{{ (post as any).category || "一般" }}</span
                          >
                          <small class="text-muted">
                            <i class="bi bi-calendar3" style="margin-right: var(--spacing-1);"></i>{{ formatDate(post.publishedAt) }}
                          </small>
                        </div>
                        <h5 class="card-title" style="margin-bottom: var(--spacing-4);">
                          <a href="#" class="text-decoration-none" @click.prevent="openPost(post)">
                            {{ post.title }}
                          </a>
                        </h5>
                        <p class="card-text text-muted flex-grow-1" style="margin-bottom: var(--spacing-4);">{{ post.excerpt }}</p>
                        <div class="mt-auto">
                          <div class="d-flex flex-wrap" style="gap: var(--spacing-2); margin-bottom: var(--spacing-3);">
                            <span
                              v-for="tag in (post.tags || []).slice(0, 3)"
                              :key="tag"
                              class="blog-card__tag-badge badge bg-light"
                              @click="filterByTag(tag)"
                              style="padding: var(--spacing-1) var(--spacing-3); cursor: pointer;"
                            >
                              #{{ tag }}
                            </span>
                            <span v-if="(post.tags || []).length > 3" class="badge bg-light" style="padding: var(--spacing-1) var(--spacing-3);">
                              +{{ (post.tags || []).length - 3 }}
                            </span>
                          </div>
                          <div
                            class="d-flex align-items-center justify-content-between text-muted small"
                          >
                            <span>
                              <i class="bi bi-clock" style="margin-right: var(--spacing-1);"></i
                              >{{ (post as any).readTime || 5 }} 分鐘閱讀
                            </span>
                            <div class="d-flex align-items-center gap-3">
                              <span>
                                <i class="bi bi-eye me-1"></i>{{ (post as any).views || 0 }}
                              </span>
                              <span>
                                <i class="bi bi-heart me-1"></i>{{ (post as any).likes || 0 }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <!-- 空狀態顯示 -->
            <div class="row" v-else>
              <div class="col-12">
                <!-- 篩選結果為空 -->
                <div v-if="searchQuery || selectedCategory" class="text-center py-5">
                  <i class="bi bi-search display-1 text-muted mb-3"></i>
                  <h4 class="text-muted">沒有找到符合條件的文章</h4>
                  <p class="text-muted">請嘗試修改篩選條件或搜尋關鍵字</p>
                  <button @click="clearAllFilters" class="btn btn-primary">清除篩選</button>
                </div>

                <!-- 預設內容 -->
                <div v-else class="blog-empty-state">
                  <div class="text-center py-5 mb-5">
                    <i class="bi bi-journal-text display-1 text-primary mb-3"></i>
                    <h4>技術部落格即將上線</h4>
                    <p class="text-muted lead">
                      我將在這裡分享前端開發、UI/UX 設計的技術心得與實戰經驗
                    </p>
                  </div>

                  <!-- 預計分享的主題 -->
                  <div class="row g-4 mb-5">
                    <div class="col-md-6 col-lg-4">
                      <div class="preview-card card h-100">
                        <div class="card-body text-center">
                          <i class="bi bi-braces display-4 text-primary mb-3"></i>
                          <h5 class="card-title">前端技術</h5>
                          <p class="card-text text-muted">
                            Vue.js、React、TypeScript 開發技巧與最佳實踐
                          </p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <div class="preview-card card h-100">
                        <div class="card-body text-center">
                          <i class="bi bi-palette display-4 text-primary mb-3"></i>
                          <h5 class="card-title">UI/UX 設計</h5>
                          <p class="card-text text-muted">設計思維、使用者體驗優化與介面設計心得</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <div class="preview-card card h-100">
                        <div class="card-body text-center">
                          <i class="bi bi-tools display-4 text-primary mb-3"></i>
                          <h5 class="card-title">開發工具</h5>
                          <p class="card-text text-muted">提升開發效率的工具與工作流程分享</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 訂閱提醒 -->
                  <div class="text-center">
                    <div class="subscribe-prompt card">
                      <div class="card-body">
                        <h5 class="card-title">
                          <i class="bi bi-bell me-2"></i>
                          文章發布通知
                        </h5>
                        <p class="card-text">想要第一時間收到新文章通知嗎？</p>
                        <router-link to="/contact" class="btn btn-primary">
                          <i class="bi bi-envelope me-2"></i>
                          聯絡我
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分頁 -->
            <nav aria-label="Blog pagination" class="mt-5" v-if="totalPages > 1">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage <= 1 }">
                  <button
                    class="page-link"
                    @click="changePage(currentPage - 1)"
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
                  <button
                    v-if="typeof page === 'number'"
                    class="page-link"
                    @click="changePage(page)"
                  >
                    {{ page }}
                  </button>
                  <span v-else class="page-link">
                    {{ page }}
                  </span>
                </li>

                <li class="page-item" :class="{ disabled: currentPage >= totalPages }">
                  <button
                    class="page-link"
                    @click="changePage(currentPage + 1)"
                    :disabled="currentPage >= totalPages"
                    aria-label="Next"
                  >
                    <span aria-hidden="true">&raquo;</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <!-- 側邊欄 -->
          <div class="col-lg-4">
            <div class="position-sticky" style="top: 100px">
              <!-- 關於作者 -->
              <div class="card" style="margin-bottom: var(--spacing-6);">
                <div class="card-body text-center" style="padding: var(--card-padding);">
                  <div class="d-flex align-items-center justify-content-center" style="margin-bottom: var(--spacing-5);">
                    <i class="bi bi-person-circle display-4 text-primary"></i>
                  </div>
                  <h6 class="card-title" style="margin-bottom: var(--spacing-3);">Orion</h6>
                  <p class="card-text text-muted small">
                    前端開發工程師，專注於 Vue.js 和現代網頁開發技術
                  </p>
                </div>
              </div>

              <!-- 熱門標籤 -->
              <div class="card" style="margin-bottom: var(--spacing-6);" v-if="popularTags.length > 0">
                <div class="card-header" style="padding: var(--spacing-4) var(--spacing-5);">
                  <h6 class="mb-0">熱門標籤</h6>
                </div>
                <div class="card-body" style="padding: var(--card-padding);">
                  <div class="d-flex flex-wrap" style="gap: var(--spacing-2);">
                    <span
                      v-for="tag in popularTags"
                      :key="tag.name"
                      class="badge bg-light text-dark"
                      style="cursor: pointer; padding: var(--spacing-2) var(--spacing-3);"
                      @click="filterByTag(tag.name)"
                    >
                      #{{ tag.name }} ({{ tag.count }})
                    </span>
                  </div>
                </div>
              </div>

              <!-- 最新文章 -->
              <div class="card" style="margin-bottom: var(--spacing-6);" v-if="recentPosts.length > 0">
                <div class="card-header" style="padding: var(--spacing-4) var(--spacing-5);">
                  <h6 class="mb-0">最新文章</h6>
                </div>
                <div class="card-body" style="padding: var(--card-padding);">
                  <div v-for="recentPost in recentPosts" :key="recentPost.id" class="d-flex" style="margin-bottom: var(--spacing-5);">
                    <div class="flex-shrink-0" style="margin-right: var(--spacing-3);">
                      <i class="bi bi-file-text text-muted"></i>
                    </div>
                    <div>
                      <h6 style="margin-bottom: var(--spacing-1);">
                        <a
                          href="#"
                          class="text-decoration-none small"
                          @click.prevent="openPost(recentPost)"
                        >
                          {{ recentPost.title }}
                        </a>
                      </h6>
                      <small class="text-muted">{{ recentPost.publishedAt }}</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 文章歸檔 -->
              <div class="card" v-if="archives.length > 0">
                <div class="card-header" style="padding: var(--spacing-4) var(--spacing-5);">
                  <h6 class="mb-0">文章歸檔</h6>
                </div>
                <div class="card-body" style="padding: var(--card-padding);">
                  <ul class="list-unstyled mb-0">
                    <li v-for="archive in archives" :key="(archive as any).month" style="margin-bottom: var(--spacing-2);">
                      <a href="#" class="text-decoration-none text-muted">
                        {{ (archive as any).month }} ({{ (archive as any).count }})
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useBlogStore, type BlogPost } from "@/stores/blog";

const router = useRouter();
const blogStore = useBlogStore();

// 從 store 獲取響應式資料
const {
  paginatedPosts,
  filteredPosts,
  searchQuery,
  selectedCategory,
  currentPage,
  totalPages,
  categories,
  tagCounts,
} = storeToRefs(blogStore);

// 從 store 獲取方法
const { setSearchQuery, setCategory, setPage, clearFilters, toggleTag } = blogStore;

// 計算屬性
const popularTags = computed(() =>
  (tagCounts.value || [])
    .slice(0, 8)
    .map(({ tag, count }: { tag: string; count: number }) => ({ name: tag, count })),
);

const recentPosts = computed(() => (blogStore.publishedPosts || []).slice(0, 5));

const archives = computed(() => {
  const archiveMap = new Map<string, number>();
  const posts = blogStore.publishedPosts || [];

  posts.forEach((post: BlogPost) => {
    if (post.publishedAt) {
      const date = new Date(post.publishedAt);
      if (!isNaN(date.getTime())) {
        const monthKey = `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, "0")}月`;
        archiveMap.set(monthKey, (archiveMap.get(monthKey) || 0) + 1);
      }
    }
  });

  return Array.from(archiveMap.entries())
    .map(([month, count]: [string, number]) => ({ month, count }))
    .sort((a: { month: string }, b: { month: string }) => b.month.localeCompare(a.month));
});

// 事件處理函數
const openPost = (post: BlogPost) => {
  const slug = post.slug || post.id;
  router.push(`/blog/${slug}`);
};

const selectCategory = (category: string) => {
  setCategory(category);
};

const filterByTag = (tagName: string) => {
  toggleTag(tagName);
};

const clearSearch = () => {
  setSearchQuery("");
};

const clearAllFilters = () => {
  clearFilters();
};

const changePage = (page: number) => {
  setPage(page);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// 格式化日期
const formatDate = (date?: Date | string) => {
  if (!date) return "未知日期";
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "無效日期";

  return dateObj.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// 工具函數
const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: string } = {
    前端技術: "bi bi-code-slash",
    後端技術: "bi bi-server",
    DevOps: "bi bi-gear",
    "UI/UX": "bi bi-palette",
    個人分享: "bi bi-heart",
  };
  return iconMap[category] || "bi bi-file-text";
};

const getCategoryBadgeClass = (category: string) => {
  const classMap: { [key: string]: string } = {
    前端技術: "badge-primary",
    後端技術: "badge-secondary",
    DevOps: "badge-outline",
    "UI/UX": "badge-primary",
    個人分享: "badge-secondary",
  };
  return `badge ${classMap[category] || "badge-outline"}`;
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
    await blogStore.fetchPosts();
  } catch (err) {
    console.error("Failed to fetch blog posts:", err);
    // 即使失敗也不阻止組件渲染，因為有預設內容
  }
});
</script>

<style scoped>
/* 全局設定 */
.blog-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.section {
  padding: 5rem 0;
}

/* 頁面標題 */
.page-header {
  color: var(--color-text-light);
  padding: 4rem 0;
  margin-bottom: 0;
}

.page-header__title {
  font-weight: 700;
  color: var(--color-text-primary);
}

.page-header__lead {
  font-size: 1.25rem;
  opacity: 0.9;
  color: var(--color-text-secondary);
}

/* 篩選區域 */
.blog-filter {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-sm);
}

.blog-filter__categories .btn {
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid var(--color-border-primary);
}

.blog-filter__category-btn--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-light);
}

.blog-filter__search .input-group {
  box-shadow: var(--shadow-sm);
}

.blog-filter__search .form-control {
  color: var(--color-text-primary);
  transition: all 0.3s ease;
}

.blog-filter__search .form-control:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.25rem var(--color-shadow-focus);
}

/* 文章卡片 */
.blog-card {
  border: none;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.4s ease;
  background: var(--color-bg-card);
  position: relative;
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(30px);
}

.blog-card:nth-child(1) { animation-delay: 0.1s; }
.blog-card:nth-child(2) { animation-delay: 0.2s; }
.blog-card:nth-child(3) { animation-delay: 0.3s; }
.blog-card:nth-child(4) { animation-delay: 0.4s; }
.blog-card:nth-child(5) { animation-delay: 0.5s; }

.blog-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-hover));
  transform: scaleX(0);
  transition: var(--transition-base);
}

.blog-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-lg);
}

.blog-card:hover::before {
  transform: scaleX(1);
}

/* 文章圖片區域 */
.blog-card__image {
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%);
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
}

.blog-card__image::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.blog-card:hover .blog-card__image::before {
  transform: translateX(100%);
}

.blog-card__image i {
  transition: all 0.3s ease;
}

.blog-card:hover .blog-card__image i {
  transform: scale(1.1);
}

/* 卡片內容 */
.card-body {
  padding: var(--spacing-lg);
}

.card-title {
  font-weight: 600;
  line-height: 1.4;
}

.card-title a {
  transition: var(--transition-fast);
}

.card-title a:hover {
  color: var(--color-primary) !important;
}

.card-text {
  line-height: 1.6;
  color: var(--text-muted);
}

/* 標籤設計 */
.badge {
  font-size: 0.75rem;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: 500;
}

.blog-card__tag-badge {
  cursor: pointer;
  transition: var(--transition-fast);
}

.blog-card__tag-badge:hover {
  background-color: var(--brand-primary) !important;
  color: var(--text-inverse) !important;
  transform: translateY(-1px);
}

.badge-primary { background-color: var(--badge-primary-bg) !important; color: var(--badge-primary-text) !important; }
.badge-secondary { background-color: var(--badge-secondary-bg) !important; color: var(--badge-secondary-text) !important; }
.badge-outline { background-color: transparent !important; border: 1px solid var(--badge-outline-border) !important; color: var(--badge-outline-text) !important; }

/* 分頁設計 */
.pagination {
  margin-top: 3rem;
}

.page-link {
  color: var(--color-primary);
  border: 1px solid var(--color-border-primary);
  padding: 0.6rem 1rem;
  border-radius: 8px;
  margin: 0 0.2rem;
  transition: all 0.3s ease;
}

.page-link:hover {
  color: var(--color-text-light);
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.page-item.active .page-link {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.page-item.disabled .page-link {
  color: var(--color-text-muted);
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-primary);
}

/* 側邊欄 */
.position-sticky {
  top: 100px;
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.5rem;
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
}

.card-header {
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%);
  border-bottom: 1px solid var(--color-border-primary);
  border-radius: 12px 12px 0 0 !important;
  padding: 1rem 1.25rem;
}

.card-header h6 {
  color: var(--color-text-primary);
  font-weight: 600;
}

.card-body {
  padding: 1.25rem;
}

/* 空狀態 */
.py-5 {
  padding: 4rem 0 !important;
}

/* 動畫效果 */
@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 響應式設計 */
/* 響應式設計 - Google Material Design 3 Breakpoints */
@media (max-width: 599px) { /* Compact */
  .page-header {
    padding: var(--spacing-8) 0;
  }

  .page-header__title {
    font-size: 1.75rem;
  }

  .blog-filter {
    padding: var(--spacing-4);
    margin-bottom: var(--spacing-6);
  }

  .blog-filter__categories .btn {
    font-size: 0.8rem;
    padding: var(--spacing-2) var(--spacing-3);
    margin: var(--spacing-1);
  }

  .blog-card .card-body {
    padding: var(--card-padding-sm);
  }

  .blog-card__image {
    min-height: 150px !important;
  }

  .card-header {
    padding: var(--spacing-3) var(--spacing-4);
  }

  .position-sticky {
    position: relative !important;
    top: auto !important;
  }

  .pagination {
    margin-top: var(--spacing-8);
  }

  .page-link {
    padding: var(--spacing-2) var(--spacing-3);
    margin: 0 var(--spacing-1);
  }
}

@media (min-width: 600px) and (max-width: 839px) { /* Medium */
  .page-header {
    padding: var(--spacing-10) 0;
  }

  .page-header__title {
    font-size: 2rem;
  }

  .blog-filter {
    padding: var(--spacing-5);
  }

  .blog-card .card-body {
    padding: var(--card-padding);
  }
}

@media (min-width: 840px) and (max-width: 1199px) { /* Expanded */
  .page-header {
    padding: var(--spacing-12) 0;
  }

  .page-header__title {
    font-size: 2.5rem;
  }

  .blog-filter {
    padding: var(--spacing-6);
  }
}

@media (min-width: 1200px) { /* Large & Extra Large */
  .page-header {
    padding: var(--section-padding-lg) 0;
  }

  .blog-filter {
    padding: var(--spacing-8);
  }

  .container {
    max-width: var(--container-large);
  }
}

/* 預設內容樣式 */
.blog-empty-state {
  padding: var(--spacing-8) 0;
}

.preview-card {
  border: none;
  border-radius: var(--radius-lg);
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

.subscribe-prompt {
  border: none;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%);
  box-shadow: var(--shadow-sm);
  max-width: 500px;
  margin: 0 auto;
}

.subscribe-prompt .card-body {
  padding: var(--card-padding-lg);
}

.subscribe-prompt .btn {
  border-radius: 25px;
  padding: var(--btn-padding-y) var(--spacing-6);
  font-weight: 500;
}

/* === Dark Mode Support === */
[data-theme="dark"] .blog-page {
  background: var(--color-bg-primary);
}

[data-theme="dark"] .page-header {
  background: var(--color-bg-secondary);
}

[data-theme="dark"] .text-muted {
  color: var(--color-text-secondary) !important;
}

[data-theme="dark"] .blog-card {
  background: var(--color-bg-card);
  border-color: var(--color-border-primary);
}

[data-theme="dark"] .blog-filter {
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
</style>
