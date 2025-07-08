<template>
  <div class="blog-page">
    <!-- 頁面標題 -->
    <section class="main-header">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center">
            <h1 class="display-4 fw-bold">部落格</h1>
            <p class="lead">分享技術心得與開發經驗</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 文章列表 -->
    <section class="section">
      <div class="container">
        <div class="row">
          <!-- 文章內容 -->
          <div class="col-lg-8">
            <!-- 有文章時顯示列表 -->
            <div class="row g-4" v-if="blogPosts.length > 0">
              <div
                v-for="post in paginatedPosts"
                :key="post.id"
                class="col-12"
              >
                <article class="card h-100">
                  <div class="row g-0">
                    <div class="col-md-4">
                      <div class="d-flex align-items-center justify-content-center bg-light h-100" style="min-height: 200px;">
                        <i class="bi bi-file-text display-4 text-muted"></i>
                      </div>
                    </div>
                    <div class="col-md-8">
                      <div class="card-body">
                        <div class="d-flex align-items-center mb-2">
                          <span class="badge bg-primary me-2">{{ post.category }}</span>
                          <small class="text-muted">{{ post.publishedAt }}</small>
                        </div>
                        <h5 class="card-title">
                          <a href="#" class="text-decoration-none" @click.prevent="openPost(post)">
                            {{ post.title }}
                          </a>
                        </h5>
                        <p class="card-text text-muted">{{ post.excerpt }}</p>
                        <div class="d-flex align-items-center justify-content-between">
                          <div class="d-flex flex-wrap gap-1">
                            <span
                              v-for="tag in post.tags"
                              :key="tag"
                              class="badge bg-light text-dark"
                            >
                              #{{ tag }}
                            </span>
                          </div>
                          <span class="text-muted">
                            <i class="bi bi-clock me-1"></i>{{ post.readTime }} min read
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <!-- 空狀態顯示 -->
            <div class="row" v-else>
              <div class="col-12 text-center py-5">
                <i class="bi bi-journal-text display-1 text-muted mb-3"></i>
                <h4 class="text-muted">尚無文章發布</h4>
                <p class="text-muted">敬請期待我的第一篇技術分享文章</p>
              </div>
            </div>

            <!-- 分頁 -->
            <nav aria-label="Blog pagination" class="mt-5" v-if="blogPosts.length > postsPerPage">
              <ul class="pagination justify-content-center">
                <li class="page-item">
                  <a class="page-link" href="#" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                </li>
                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                <li class="page-item"><a class="page-link" href="#">2</a></li>
                <li class="page-item"><a class="page-link" href="#">3</a></li>
                <li class="page-item">
                  <a class="page-link" href="#" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <!-- 側邊欄 -->
          <div class="col-lg-4">
            <div class="position-sticky" style="top: 100px;">
              <!-- 關於作者 -->
              <div class="card mb-4">
                <div class="card-body text-center">
                  <div class="d-flex align-items-center justify-content-center mb-3">
                    <i class="bi bi-person-circle display-4 text-primary"></i>
                  </div>
                  <h6 class="card-title">Orion</h6>
                  <p class="card-text text-muted small">
                    前端開發工程師，專注於 Vue.js 和現代網頁開發技術
                  </p>
                </div>
              </div>

              <!-- 熱門標籤 -->
              <div class="card mb-4" v-if="popularTags.length > 0">
                <div class="card-header">
                  <h6 class="mb-0">熱門標籤</h6>
                </div>
                <div class="card-body">
                  <div class="d-flex flex-wrap gap-1">
                    <span
                      v-for="tag in popularTags"
                      :key="tag.name"
                      class="badge bg-light text-dark"
                      style="cursor: pointer;"
                      @click="filterByTag(tag.name)"
                    >
                      #{{ tag.name }} ({{ tag.count }})
                    </span>
                  </div>
                </div>
              </div>

              <!-- 最新文章 -->
              <div class="card mb-4" v-if="recentPosts.length > 0">
                <div class="card-header">
                  <h6 class="mb-0">最新文章</h6>
                </div>
                <div class="card-body">
                  <div
                    v-for="recentPost in recentPosts"
                    :key="recentPost.id"
                    class="d-flex mb-3"
                  >
                    <div class="flex-shrink-0 me-2">
                      <i class="bi bi-file-text text-muted"></i>
                    </div>
                    <div>
                      <h6 class="mb-1">
                        <a href="#" class="text-decoration-none small" @click.prevent="openPost(recentPost)">
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
                <div class="card-header">
                  <h6 class="mb-0">文章歸檔</h6>
                </div>
                <div class="card-body">
                  <ul class="list-unstyled mb-0">
                    <li v-for="archive in archives" :key="archive.month" class="mb-1">
                      <a href="#" class="text-decoration-none text-muted">
                        {{ archive.month }} ({{ archive.count }})
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
import { ref, computed } from 'vue'

interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  publishedAt: string
  readTime: number
  author: string
  views?: number
  likes?: number
}

interface Tag {
  name: string
  count: number
}

interface Archive {
  month: string
  count: number
}

// 文章資料 - 空陣列，等待真實內容
const blogPosts = ref<BlogPost[]>([])

// 熱門標籤 - 空陣列，等待真實內容
const popularTags = ref<Tag[]>([])

// 最新文章 - 空陣列，等待真實內容
const recentPosts = ref<BlogPost[]>([])

// 文章歸檔 - 空陣列，等待真實內容
const archives = ref<Archive[]>([])

// 開啟文章
const openPost = (post: BlogPost) => {
  // 這裡可以導向到文章詳細頁面
  console.log('Opening post:', post.title)
  // router.push(`/blog/${post.id}`)
}

// 根據標籤篩選
const filterByTag = (tagName: string) => {
  console.log('Filtering by tag:', tagName)
  // 實作標籤篩選邏輯
}

// 分頁功能
const currentPage = ref(1)
const postsPerPage = 3

const totalPages = computed(() => Math.ceil(blogPosts.value.length / postsPerPage))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage
  const end = start + postsPerPage
  return blogPosts.value.slice(start, end)
})

// 篩選功能
const selectedCategory = ref('')
const selectedTag = ref('')

const filteredPosts = computed(() => {
  let filtered = blogPosts.value
  
  if (selectedCategory.value) {
    filtered = filtered.filter(post => post.category === selectedCategory.value)
  }
  
  if (selectedTag.value) {
    filtered = filtered.filter(post => post.tags.includes(selectedTag.value))
  }
  
  return filtered
})

const categories = computed(() => {
  const cats = new Set(blogPosts.value.map(post => post.category))
  return Array.from(cats)
})

const allTags = computed(() => {
  const tags = new Set(blogPosts.value.flatMap(post => post.tags))
  return Array.from(tags)
})
</script>

<style scoped>
.card-title a:hover {
  color: var(--brand-primary) !important;
}

.badge {
  font-size: 0.75rem;
}

.page-link {
  color: var(--brand-primary);
}

.page-item.active .page-link {
  background-color: var(--brand-primary);
  border-color: var(--brand-primary);
}

.page-link:hover {
  color: var(--brand-secondary);
  background-color: var(--brand-light);
  border-color: var(--brand-light);
}

@media (max-width: 768px) {
  .position-sticky {
    position: relative !important;
    top: auto !important;
  }
}
</style> 