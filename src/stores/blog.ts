import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  blogAPI,
  type BlogPost as APIBlogPost,
  type BlogPostCreate,
  type BlogPostUpdate,
  blogCategoryAPI,
  type BlogCategory,
} from "@/services/api";

export type BlogPost = APIBlogPost;

export const useBlogStore = defineStore("blog", () => {
  // State
  const posts = ref<BlogPost[]>([]);
  const currentPost = ref<BlogPost | null>(null);
  const loading = ref({
    fetch: false,
    create: false,
    update: false,
    delete: false,
    categories: false,
  });
  const error = ref<{ message: string; code?: number } | null>(null);

  // 部落格分類相關狀態
  const blogCategories = ref<BlogCategory[]>([]);
  const categoryMap = ref<Map<number, BlogCategory>>(new Map());

  // 新增的篩選和分頁狀態
  const searchQuery = ref("");
  const selectedCategory = ref("");
  const currentPage = ref(1);
  const postsPerPage = ref(6);
  const selectedTags = ref<string[]>([]);

  // Getters
  const isLoading = computed(() => Object.values(loading.value).some((l) => l));
  const fetchLoading = computed(() => loading.value.fetch);
  const createLoading = computed(() => loading.value.create);
  const updateLoading = computed(() => loading.value.update);
  const deleteLoading = computed(() => loading.value.delete);
  const hasError = computed(() => !!error.value);

  const publishedPosts = computed(() => posts.value.filter((post) => post.status === "published"));

  const featuredPosts = computed(() => publishedPosts.value.filter((post) => post.featured));

  const recentPosts = computed(() =>
    publishedPosts.value
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
  );

  // 分類列表
  const categories = computed(() => {
    const categorySet = new Set<string>();
    publishedPosts.value.forEach((post) => {
      if (post.category) {
        categorySet.add(post.category);
      }
    });
    return Array.from(categorySet);
  });

  // 篩選後的文章
  const filteredPosts = computed(() => {
    let filtered = publishedPosts.value;

    // 按分類篩選
    if (selectedCategory.value) {
      filtered = filtered.filter((post) => post.category === selectedCategory.value);
    }

    // 按搜尋關鍵字篩選
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          (post.content && post.content.toLowerCase().includes(query)) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(query)),
      );
    }

    // 按標籤篩選
    if (selectedTags.value.length > 0) {
      filtered = filtered.filter((post) => {
        if (!post.tags) return false;
        return selectedTags.value.some((tag) => post.tags!.includes(tag));
      });
    }

    return filtered;
  });

  // 分頁相關
  const totalPages = computed(() => Math.ceil(filteredPosts.value.length / postsPerPage.value));

  const paginatedPosts = computed(() => {
    const start = (currentPage.value - 1) * postsPerPage.value;
    const end = start + postsPerPage.value;
    return filteredPosts.value.slice(start, end);
  });

  // 標籤統計
  const tagCounts = computed(() => {
    const tagMap = new Map<string, number>();
    publishedPosts.value.forEach((post) => {
      if (post.tags) {
        post.tags.forEach((tag) => {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
      }
    });
    return Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  });

  // Actions
  const setLoading = (type: keyof typeof loading.value, value: boolean) => {
    loading.value[type] = value;
  };

  const setError = (err: string | Error | null, code?: number) => {
    if (err === null) {
      error.value = null;
    } else if (typeof err === "string") {
      error.value = { message: err, code };
    } else {
      error.value = { message: err.message, code };
    }
  };

  const clearError = () => {
    error.value = null;
  };

  // API Actions
  const fetchPosts = async (params?: {
    status?: string;
    category?: string;
    skip?: number;
    limit?: number;
    forAdmin?: boolean; // 新增參數控制是否為管理員模式
  }) => {
    try {
      setLoading("fetch", true);
      clearError();

      let result: BlogPost[];

      // 根據是否為管理員模式選擇API端點
      if (params?.forAdmin) {
        // 管理員模式：使用需要認證的API
        result = await blogAPI.getAllPosts(params);
      } else {
        // 一般模式：使用公開API
        result = await blogAPI.getPublishedPosts(params);
      }

      posts.value = result;

      return { success: true, data: result };
    } catch (err: unknown) {
      const catchError = err as { detail?: string; message?: string };
      setError(catchError.detail || catchError.message || "載入文章失敗");
      return { success: false, error: err };
    } finally {
      setLoading("fetch", false);
    }
  };

  const createPost = async (postData: BlogPostCreate & { featured?: boolean }) => {
    try {
      setLoading("create", true);
      clearError();

      const result = await blogAPI.createPost(postData);
      posts.value.unshift(result);

      return { success: true, data: result };
    } catch (err: unknown) {
      const catchError = err as { detail?: string; message?: string };
      setError(catchError.detail || catchError.message || "創建文章失敗");
      return { success: false, error: err };
    } finally {
      setLoading("create", false);
    }
  };

  const updatePost = async (id: number, postData: BlogPostUpdate & { featured?: boolean }) => {
    try {
      setLoading("update", true);
      clearError();

      const result = await blogAPI.updatePost(id, postData);

      // Update local state
      const index = posts.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        posts.value[index] = result;
      }

      if (currentPost.value?.id === id) {
        currentPost.value = result;
      }

      return { success: true, data: result };
    } catch (err: unknown) {
      const catchError = err as { detail?: string; message?: string };
      setError(catchError.detail || catchError.message || "更新文章失敗");
      return { success: false, error: err };
    } finally {
      setLoading("update", false);
    }
  };

  const deletePost = async (id: number) => {
    try {
      setLoading("delete", true);
      clearError();

      await blogAPI.deletePost(id);

      // Remove from local state
      posts.value = posts.value.filter((p) => p.id !== id);

      if (currentPost.value?.id === id) {
        currentPost.value = null;
      }

      return { success: true };
    } catch (err: unknown) {
      const catchError = err as { detail?: string; message?: string };
      setError(catchError.detail || catchError.message || "刪除文章失敗");
      return { success: false, error: err };
    } finally {
      setLoading("delete", false);
    }
  };

  // 篩選和分頁方法
  const setSearchQuery = (query: string) => {
    searchQuery.value = query;
    currentPage.value = 1; // 重置到第一頁
  };

  const setCategory = (category: string) => {
    selectedCategory.value = category;
    currentPage.value = 1; // 重置到第一頁
  };

  const setPage = (page: number) => {
    currentPage.value = page;
  };

  const toggleTag = (tag: string) => {
    const index = selectedTags.value.indexOf(tag);
    if (index > -1) {
      selectedTags.value.splice(index, 1);
    } else {
      selectedTags.value.push(tag);
    }
    currentPage.value = 1; // 重置到第一頁
  };

  const clearFilters = () => {
    searchQuery.value = "";
    selectedCategory.value = "";
    selectedTags.value = [];
    currentPage.value = 1;
  };

  // 部落格分類相關方法
  const fetchBlogCategories = async () => {
    try {
      loading.value.categories = true;
      const fetchedCategories = await blogCategoryAPI.getCategories();
      blogCategories.value = fetchedCategories;

      // 更新 categoryMap 以便快速查找
      categoryMap.value.clear();
      fetchedCategories.forEach(cat => {
        categoryMap.value.set(cat.id, cat);
      });
    } catch (err) {
      console.error('載入部落格分類失敗:', err);
      setError('載入分類失敗', 500);
    } finally {
      loading.value.categories = false;
    }
  };

  const getCategoryById = (id: number): BlogCategory | null => {
    return categoryMap.value.get(id) || null;
  };

  const getCategoryByName = (name: string): BlogCategory | null => {
    return blogCategories.value.find(cat => cat.name === name) || null;
  };

  const getActiveBlogCategories = computed(() => {
    return blogCategories.value.filter(cat => cat.is_active);
  });

  const getBlogCategoriesWithCounts = computed(() => {
    return blogCategories.value.map(category => {
      const postCount = publishedPosts.value.filter(post =>
        post.category === category.name
      ).length;
      return { ...category, actual_post_count: postCount };
    });
  });

  return {
    // State
    posts: computed(() => posts.value),
    currentPost: computed(() => currentPost.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    searchQuery,
    selectedCategory,
    currentPage,
    postsPerPage,
    selectedTags,

    // Getters
    isLoading,
    fetchLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    hasError,
    publishedPosts,
    featuredPosts,
    recentPosts,
    categories,
    filteredPosts,
    totalPages,
    paginatedPosts,
    tagCounts,

    // Blog Categories State
    blogCategories: computed(() => blogCategories.value),
    activeCategories: getActiveBlogCategories,
    categoriesWithCounts: getBlogCategoriesWithCounts,

    // Actions
    setLoading,
    setError,
    clearError,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    setSearchQuery,
    setCategory,
    setPage,
    toggleTag,
    clearFilters,

    // Blog Category Actions
    fetchBlogCategories,
    getCategoryById,
    getCategoryByName,
  };
});
