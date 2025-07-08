<template>
  <div class="blog-management">
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="h2">部落格管理</h1>
      <button @click="showAddModal = true" class="btn btn-primary">
        <i class="bi bi-plus-circle me-1"></i>
        新增文章
      </button>
    </div>

    <!-- 文章列表 -->
    <div class="row">
      <div class="col-12">
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>標題</th>
                <th>分類</th>
                <th>狀態</th>
                <th>發布日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="post in blogPosts" :key="post.id">
                <td>{{ post.title }}</td>
                <td>
                  <span class="badge bg-primary">{{ post.category }}</span>
                </td>
                <td>
                  <span 
                    class="badge" 
                    :class="post.status === 'published' ? 'bg-success' : 'bg-warning'"
                  >
                    {{ post.status === 'published' ? '已發布' : '草稿' }}
                  </span>
                </td>
                <td>{{ formatDate(post.publishedAt) }}</td>
                <td>
                  <button 
                    @click="editPost(post)" 
                    class="btn btn-sm btn-outline-primary me-2"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button 
                    @click="deletePost(post.id)" 
                    class="btn btn-sm btn-outline-danger"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="blogPosts.length === 0">
                <td colspan="5" class="text-center text-muted">
                  暫無文章，點擊上方「新增文章」開始撰寫
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 新增/編輯文章 Modal -->
    <div 
      v-if="showAddModal || showEditModal"
      class="modal fade show d-block" 
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ showEditModal ? '編輯文章' : '新增文章' }}
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeModal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="savePost">
              <div class="row">
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label">文章標題</label>
                    <input 
                      v-model="currentPost.title"
                      type="text" 
                      class="form-control" 
                      required
                    >
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">分類</label>
                    <select v-model="currentPost.category" class="form-select" required>
                      <option value="">選擇分類</option>
                      <option value="Vue.js">Vue.js</option>
                      <option value="JavaScript">JavaScript</option>
                      <option value="CSS">CSS</option>
                      <option value="前端開發">前端開發</option>
                      <option value="後端開發">後端開發</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">摘要</label>
                <textarea 
                  v-model="currentPost.excerpt"
                  class="form-control" 
                  rows="3"
                  placeholder="文章摘要..."
                  required
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">內容</label>
                <textarea 
                  v-model="currentPost.content"
                  class="form-control" 
                  rows="10"
                  placeholder="在此撰寫文章內容..."
                  required
                ></textarea>
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
                    >
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">閱讀時間（分鐘）</label>
                    <input 
                      v-model.number="currentPost.readTime"
                      type="number" 
                      class="form-control" 
                      min="1"
                      required
                    >
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">狀態</label>
                    <select v-model="currentPost.status" class="form-select">
                      <option value="draft">草稿</option>
                      <option value="published">發布</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeModal">
                  取消
                </button>
                <button type="submit" class="btn btn-primary">
                  {{ showEditModal ? '更新' : '儲存' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

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
  status: 'draft' | 'published'
}

const blogPosts = ref<BlogPost[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const currentPost = ref<Partial<BlogPost>>({
  title: '',
  excerpt: '',
  content: '',
  category: '',
  tags: [],
  readTime: 5,
  author: 'Orion',
  status: 'draft'
})

const tagsInput = ref('')

// 載入文章列表
onMounted(() => {
  loadPosts()
})

const loadPosts = () => {
  // 這裡之後會連接API
  // 目前使用 localStorage 模擬
  const saved = localStorage.getItem('blogPosts')
  if (saved) {
    blogPosts.value = JSON.parse(saved)
  }
}

const savePosts = () => {
  localStorage.setItem('blogPosts', JSON.stringify(blogPosts.value))
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-TW')
}

const savePost = () => {
  const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag)
  const postData = {
    ...currentPost.value,
    tags,
    publishedAt: currentPost.value.publishedAt || new Date().toISOString().split('T')[0]
  } as BlogPost

  if (showEditModal.value) {
    // 更新文章
    const index = blogPosts.value.findIndex(p => p.id === postData.id)
    if (index !== -1) {
      blogPosts.value[index] = postData
    }
  } else {
    // 新增文章
    postData.id = Date.now()
    blogPosts.value.unshift(postData)
  }

  savePosts()
  closeModal()
}

const editPost = (post: BlogPost) => {
  currentPost.value = { ...post }
  tagsInput.value = post.tags.join(', ')
  showEditModal.value = true
}

const deletePost = (id: number) => {
  if (confirm('確定要刪除這篇文章嗎？')) {
    blogPosts.value = blogPosts.value.filter(p => p.id !== id)
    savePosts()
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  currentPost.value = {
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    readTime: 5,
    author: 'Orion',
    status: 'draft'
  }
  tagsInput.value = ''
}
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

textarea {
  resize: vertical;
}
</style> 