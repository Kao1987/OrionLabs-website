<template>
  <div class="blog-detail">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="text-center py-5">
              <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">載入中...</span>
              </div>
              <p class="text-muted">載入文章中...</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="text-center py-5">
              <i class="bi bi-exclamation-triangle display-1 text-danger mb-3"></i>
              <h2>文章載入失敗</h2>
              <p class="text-muted mb-4">{{ error.message }}</p>
              <div class="d-flex gap-3 justify-content-center">
                <button @click="loadPost" class="btn btn-primary">
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  重新載入
                </button>
                <router-link to="/blog" class="btn btn-outline-secondary">
                  <i class="bi bi-arrow-left me-1"></i>
                  返回部落格
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Article Content -->
    <article v-else-if="post" class="article-container">
      <!-- Article Header -->
      <header class="article-header">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-8">
              <!-- Breadcrumb -->
              <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                  <li class="breadcrumb-item">
                    <router-link to="/">首頁</router-link>
                  </li>
                  <li class="breadcrumb-item">
                    <router-link to="/blog">部落格</router-link>
                  </li>
                  <li class="breadcrumb-item active" aria-current="page">
                    {{ post.title }}
                  </li>
                </ol>
              </nav>

              <!-- Article Meta -->
              <div class="article-meta mb-4">
                <div class="d-flex flex-wrap align-items-center gap-3 mb-3">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-calendar3 me-2 text-muted"></i>
                    <time :datetime="formatDateISO(post.publishedAt)" class="text-muted">
                      {{ formatDate(post.publishedAt) }}
                    </time>
                  </div>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-person me-2 text-muted"></i>
                    <span class="text-muted">{{ post.author }}</span>
                  </div>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-clock me-2 text-muted"></i>
                    <span class="text-muted">{{ estimateReadingTime(post.content) }} 分鐘閱讀</span>
                  </div>
                  <div v-if="post.featured" class="d-flex align-items-center">
                    <i class="bi bi-star-fill text-warning me-1"></i>
                    <span class="text-warning small">精選文章</span>
                  </div>
                </div>

                <!-- Tags -->
                <div v-if="post.tags && post.tags.length > 0" class="article-tags">
                  <router-link
                    v-for="tag in post.tags"
                    :key="tag"
                    :to="`/blog?tag=${encodeURIComponent(tag)}`"
                    class="badge bg-primary text-decoration-none me-2 mb-2"
                  >
                    <i class="bi bi-tag me-1"></i>
                    {{ tag }}
                  </router-link>
                </div>
              </div>

              <!-- Article Title -->
              <h1 class="article-title mb-4">{{ post.title }}</h1>

              <!-- Article Excerpt -->
              <div v-if="post.excerpt" class="article-excerpt mb-4">
                <p class="lead">{{ post.excerpt }}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Article Content -->
      <section class="article-content">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-8">
              <!-- Table of Contents -->
              <div v-if="tableOfContents.length > 0" class="toc-container mb-5">
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0">
                      <i class="bi bi-list-ul me-2"></i>
                      文章目錄
                    </h6>
                  </div>
                  <div class="card-body">
                    <ul class="toc-list">
                      <li
                        v-for="heading in tableOfContents"
                        :key="heading.id"
                        :class="`toc-level-${heading.level}`"
                      >
                        <a :href="`#${heading.id}`" class="toc-link" @click="scrollToHeading">
                          {{ heading.text }}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Rendered Markdown Content -->
              <div class="markdown-content" v-html="renderedContent"></div>

              <!-- Article Footer -->
              <footer class="article-footer mt-5 pt-4 border-top">
                <div class="row">
                  <div class="col-md-6">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-calendar-check me-2 text-muted"></i>
                      <span class="text-muted small">
                        最後更新：{{ formatDate(post.updatedAt) }}
                      </span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="d-flex justify-content-md-end">
                      <div class="share-buttons">
                        <span class="text-muted small me-3">分享文章：</span>
                        <button
                          @click="shareOnTwitter"
                          class="btn btn-sm btn-outline-info me-2"
                          title="分享到 Twitter"
                        >
                          <i class="bi bi-twitter"></i>
                        </button>
                        <button
                          @click="shareOnFacebook"
                          class="btn btn-sm btn-outline-primary me-2"
                          title="分享到 Facebook"
                        >
                          <i class="bi bi-facebook"></i>
                        </button>
                        <button
                          @click="copyLink"
                          class="btn btn-sm btn-outline-secondary"
                          title="複製連結"
                        >
                          <i class="bi bi-link-45deg"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Articles -->
      <section v-if="relatedPosts.length > 0" class="related-articles py-5 bg-light">
        <div class="container">
          <div class="row">
            <div class="col-12">
              <h3 class="mb-4">相關文章</h3>
            </div>
          </div>
          <div class="row">
            <div v-for="relatedPost in relatedPosts" :key="relatedPost.id" class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-body">
                  <h6 class="card-title">
                    <router-link
                      :to="`/blog/${relatedPost.slug || relatedPost.id}`"
                      class="text-decoration-none"
                    >
                      {{ relatedPost.title }}
                    </router-link>
                  </h6>
                  <p class="card-text small text-muted">{{ relatedPost.excerpt }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                      {{ formatDate(relatedPost.publishedAt) }}
                    </small>
                    <router-link
                      :to="`/blog/${relatedPost.slug || relatedPost.id}`"
                      class="btn btn-sm btn-outline-primary"
                    >
                      閱讀更多
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Back to Blog -->
      <section class="back-to-blog py-4">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-8">
              <div class="text-center">
                <router-link to="/blog" class="btn btn-outline-primary">
                  <i class="bi bi-arrow-left me-2"></i>
                  返回部落格列表
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useBlogStore, type BlogPost } from "@/stores/blog";
import { useUIStore } from "@/stores/ui";
import { useSEO, useStructuredData } from "@/composables/useSEO";
import { marked } from "marked";
import hljs from "highlight.js";
import DOMPurify from "dompurify";

// Import highlight.js theme
import "highlight.js/styles/github.css";

const route = useRoute();
const blogStore = useBlogStore();
const uiStore = useUIStore();

// SEO
const { updateSEO } = useSEO();
const { addArticleSchema } = useStructuredData();

// State
const post = ref<BlogPost | null>(null);
const isLoading = ref(false);
const error = ref<{ message: string } | null>(null);
const tableOfContents = ref<Array<{ id: string; text: string; level: number }>>([]);

//  處理 Markdown 渲染
const renderedContent = ref<string>('');

const renderMarkdown = async () => {
  if (!post.value?.content) {
    renderedContent.value = '';
    return;
  }

  // Reset table of contents
  tableOfContents.value = [];

  // Configure marked with highlight.js
  const renderer = new marked.Renderer();

  // Custom heading renderer to generate table of contents
  renderer.heading = ({ tokens, depth }) => {
    const text = tokens[0]?.raw || '';
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Add to table of contents
    tableOfContents.value.push({
      id,
      text: text.replace(/<[^>]*>/g, ""), // Strip HTML tags
      level: depth,
    });

    return `<h${depth} id="${id}" class="heading-anchor">
      <a href="#${id}" class="anchor-link">#</a>
      ${text}
    </h${depth}>`;
  };

  // Custom code block renderer with syntax highlighting
  renderer.code = ({ text, lang }) => {
    const language = lang || 'text';
    const validLanguage = hljs.getLanguage(language) ? language : 'text';
    const highlightedCode = hljs.highlight(text, { language: validLanguage }).value;

    return `<div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="language-label">${validLanguage}</span>
        <button class="copy-btn" onclick="copyCodeToClipboard(this)">
          <i class="bi bi-clipboard"></i> 複製
        </button>
      </div>
      <pre><code class="language-${validLanguage}">${highlightedCode}</code></pre>
    </div>`;
  };

  // Custom link renderer for external links
  renderer.link = ({ href, title, tokens }) => {
    const text = tokens[0]?.raw || '';
    const isExternal = href.startsWith("http") && !href.includes(window.location.hostname);
    const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
    const titleAttr = title ? ` title="${title}"` : "";

    return `<a href="${href}"${titleAttr}${target}>${text}</a>`;
  };

  // Configure marked options
  marked.setOptions({
    renderer,
    breaks: true,
    gfm: true,
  });

  try {
    // Render and sanitize
    const rawHtml = await marked.parse(post.value.content);
    renderedContent.value = DOMPurify.sanitize(rawHtml as string, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
    });
  } catch {
      // Ignore error
    console.error('Markdown rendering error:', error);
    renderedContent.value = post.value.content;
  }
};

const relatedPosts = computed(() => {
  if (!post.value) return [];

  // Find posts with similar tags
  const currentTags = post.value.tags || [];
  const otherPosts = blogStore.publishedPosts.filter((p) => p.id !== post.value?.id);

  return otherPosts
    .filter((p) => {
      const postTags = p.tags || [];
      return currentTags.some((tag) => postTags.includes(tag));
    })
    .slice(0, 3);
});

// Methods
const loadPost = async () => {
  const slug = route.params.slug as string;

  if (!slug) {
    error.value = { message: "文章不存在" };
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    // Try to find post by slug or ID
    await blogStore.fetchPosts();

    const foundPost = blogStore.publishedPosts.find((p) => p.slug === slug || String(p.id) === slug);

    if (!foundPost) {
      error.value = { message: "找不到此文章" };
      return;
    }

    post.value = foundPost;

    // Render markdown content
    await renderMarkdown();

    // Set page title
    document.title = `${foundPost.title} - Orion 個人品牌網站`;

    // Add global copy code function
    nextTick(() => {
      addCopyCodeFunction();
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "載入文章失敗";
    error.value = { message: errorMessage };
  } finally {
    isLoading.value = false;
  }
};

const addCopyCodeFunction = () => {
  // Add global function for copying code
  (window as unknown as Record<string, unknown>).copyCodeToClipboard = (button: HTMLElement) => {
    const codeBlock = button.closest(".code-block");
    const code = codeBlock?.querySelector("code")?.textContent || "";

    navigator.clipboard
      .writeText(code)
      .then(() => {
        const icon = button.querySelector("i");
        if (icon) {
          icon.className = "bi bi-check";
          setTimeout(() => {
            icon.className = "bi bi-clipboard";
          }, 2000);
        }
        uiStore.showSuccess("複製成功", "程式碼已複製到剪貼簿");
      })
      .catch(() => {
        uiStore.showError("複製失敗", "請手動複製程式碼");
      });
  };
};

const estimateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

// 安全的日期格式化函數
const formatDate = (date: string | Date | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateISO = (date: string | Date | undefined): string => {
  if (!date) return '';
  return new Date(date).toISOString();
};

const scrollToHeading = (event: Event) => {
  event.preventDefault();
  const target = event.target as HTMLElement;
  const href = target.getAttribute("href");
  if (href) {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }
};

const shareOnTwitter = () => {
  const url = window.location.href;
  const text = post.value?.title || "";
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  window.open(twitterUrl, "_blank", "width=600,height=400");
};

const shareOnFacebook = () => {
  const url = window.location.href;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, "_blank", "width=600,height=400");
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    uiStore.showSuccess("複製成功", "文章連結已複製到剪貼簿");
  } catch {
    uiStore.showError("複製失敗", "請手動複製連結");
  }
};

// 監聽文章變化以更新 SEO
watch(
  post,
  (newPost) => {
    if (newPost) {
      updatePostSEO(newPost);
    }
  },
  { immediate: true },
);

// Watchers
watch(
  () => route.params.slug,
  () => {
    if (route.name === "blog-detail") {
      loadPost();
    }
  },
);

// 更新文章 SEO 資料
const updatePostSEO = (post: BlogPost) => {
  // 更新頁面 SEO
  updateSEO({
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160).replace(/[#*`]/g, ""),
    type: "article",
    image: post.featuredImage || "/images/og-default.jpg",
    url: `https://orionlabs.dev/blog/${post.slug}`,
    publishedTime: post.publishedAt ? formatDateISO(post.publishedAt) : undefined,
    modifiedTime: post.updatedAt ? formatDateISO(post.updatedAt) : (post.publishedAt ? formatDateISO(post.publishedAt) : undefined),
    section: "Technology",
    tags: post.tags || [],
    keywords: [...(post.tags || []), "前端開發", "Vue.js", "TypeScript", "OrionLabs"],
  });

  // 新增文章結構化資料
  addArticleSchema({
    headline: post.title,
    description: post.excerpt || post.content.slice(0, 160).replace(/[#*`]/g, ""),
    image: post.featuredImage
      ? `https://orionlabs.dev${post.featuredImage}`
      : "https://orionlabs.dev/images/og-default.jpg",
    datePublished: post.publishedAt ? formatDateISO(post.publishedAt) : '',
    dateModified: post.updatedAt ? formatDateISO(post.updatedAt) : (post.publishedAt ? formatDateISO(post.publishedAt) : undefined),
    author: {
      name: post.author || "Orion",
      url: "https://orionlabs.dev/about",
    },
    publisher: {
      name: "OrionLabs",
      logo: "https://orionlabs.dev/images/logo.png",
    },
    url: `https://orionlabs.dev/blog/${post.slug}`,
    keywords: post.tags || [],
  });
};

// Lifecycle
onMounted(() => {
  loadPost();
});
</script>

<style scoped>
.article-header {
  padding: 2rem 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: #2c3e50;
}

.article-excerpt {
  font-size: 1.1rem;
  color: #6c757d;
}

.article-meta {
  font-size: 0.9rem;
}

.article-tags .badge {
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
}

.toc-container {
  position: sticky;
  top: 2rem;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list li {
  margin-bottom: 0.5rem;
}

.toc-level-1 {
  margin-left: 0;
}

.toc-level-2 {
  margin-left: 1rem;
}

.toc-level-3 {
  margin-left: 2rem;
}

.toc-link {
  color: #6c757d;
  text-decoration: none;
  font-size: 0.9rem;
}

.toc-link:hover {
  color: #0d6efd;
}

.markdown-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
}

/* Markdown Content Styles */
:deep(.markdown-content) {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-weight: 600;
    color: #2c3e50;
    position: relative;
  }

  h1 {
    font-size: 2rem;
  }
  h2 {
    font-size: 1.75rem;
  }
  h3 {
    font-size: 1.5rem;
  }
  h4 {
    font-size: 1.25rem;
  }
  h5 {
    font-size: 1.1rem;
  }
  h6 {
    font-size: 1rem;
  }

  .heading-anchor {
    position: relative;
  }

  .anchor-link {
    position: absolute;
    left: -1.5rem;
    top: 0;
    color: #6c757d;
    text-decoration: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    font-weight: normal;
  }

  .heading-anchor:hover .anchor-link {
    opacity: 1;
  }

  p {
    margin-bottom: 1.5rem;
  }

  blockquote {
    border-left: 4px solid #0d6efd;
    padding-left: 1rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: #6c757d;
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 0.375rem;
  }

  ul,
  ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  table {
    width: 100%;
    margin: 1.5rem 0;
    border-collapse: collapse;
    border: 1px solid #dee2e6;
  }

  th,
  td {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    text-align: left;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 0.375rem;
    margin: 1.5rem 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  a {
    color: #0d6efd;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  hr {
    margin: 2rem 0;
    border: none;
    border-top: 1px solid #dee2e6;
  }
}

/* Code Block Styles */
:deep(.code-block) {
  position: relative;
  margin: 1.5rem 0;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.code-header) {
  background: #2d3748;
  color: white;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

:deep(.language-badge) {
  background: #4a5568;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
}

:deep(.copy-code-btn) {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

:deep(.copy-code-btn:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.code-block pre) {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
  background: #f6f8fa;
}

:deep(.code-block code) {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Inline Code */
:deep(.markdown-content code:not(.hljs)) {
  background: #f1f3f4;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.9em;
  color: #d63384;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
}

.share-buttons .btn {
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: ">";
}

@media (max-width: 768px) {
  .article-title {
    font-size: 2rem;
  }

  .toc-container {
    position: static;
    margin-bottom: 2rem;
  }

  .share-buttons {
    justify-content: center;
    margin-top: 1rem;
  }
}
</style>
