import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { tagAPI } from "@/services/api";

export interface Tag {
  id: number;
  name: string;
  color: string;
  description?: string;
  post_count: number;
  created_at: string;
  updated_at?: string;
}

export interface TagCreate {
  name: string;
  color?: string;
  description?: string;
}

export interface TagUpdate {
  name?: string;
  color?: string;
  description?: string;
}

export const useTagStore = defineStore("tag", () => {
  // 狀態
  const tags = ref<Tag[]>([]);
  const currentTag = ref<Tag | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 計算屬性
  const popularTags = computed(() =>
    tags.value
      .filter((tag) => tag.post_count > 0)
      .sort((a, b) => b.post_count - a.post_count)
      .slice(0, 10),
  );

  const tagsByName = computed(() => tags.value.sort((a, b) => a.name.localeCompare(b.name)));

  const totalTags = computed(() => tags.value.length);

  // 操作
  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  const setError = (err: string | null) => {
    error.value = err;
  };

  const clearError = () => {
    error.value = null;
  };

  // API 操作
  const fetchTags = async () => {
    setLoading(true);
    clearError();

    try {
      const response = await tagAPI.getTags();
      // 將簡單的標籤轉換為完整的Tag格式
      tags.value = response.map((tag, index) => ({
        id: index + 1,
        name: tag.name,
        color: "#007bff",
        post_count: tag.count,
        created_at: new Date().toISOString(),
      }));
      return tags.value;
    } catch (err) {
      const message = err instanceof Error ? err.message : "取得標籤失敗";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularTags = async (limit = 10) => {
    setLoading(true);
    clearError();

    try {
      const response = await tagAPI.getTags();
      // 取前N個作為熱門標籤
      const popularTags = response.slice(0, limit).map((tag, index) => ({
        id: index + 1,
        name: tag.name,
        color: "#007bff",
        post_count: tag.count,
        created_at: new Date().toISOString(),
      }));

      // 更新現有標籤或添加新標籤
      popularTags.forEach((tag: Tag) => {
        const existingIndex = tags.value.findIndex((t) => t.name === tag.name);
        if (existingIndex >= 0) {
          tags.value[existingIndex] = tag;
        } else {
          tags.value.push(tag);
        }
      });
      return popularTags;
    } catch (err) {
      const message = err instanceof Error ? err.message : "取得熱門標籤失敗";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTag = async (id: number) => {
    setLoading(true);
    clearError();

    try {
      // tagAPI 目前不支持獲取單一標籤，返回mock數據
      const mockTag: Tag = {
        id,
        name: `標籤 ${id}`,
        color: "#007bff",
        post_count: 0,
        created_at: new Date().toISOString(),
      };
      currentTag.value = mockTag;

      // 更新 tags 陣列中的相應項目
      const existingIndex = tags.value.findIndex((tag) => tag.id === id);
      if (existingIndex >= 0) {
        tags.value[existingIndex] = mockTag;
      } else {
        tags.value.push(mockTag);
      }

      return mockTag;
    } catch (err) {
      const message = err instanceof Error ? err.message : "取得標籤詳情失敗";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (tagData: TagCreate) => {
    setLoading(true);
    clearError();

    try {
      const response = await tagAPI.createTag(tagData.name);
      const newTag: Tag = {
        id: Date.now(), // 臨時ID
        name: response.name,
        color: tagData.color || "#007bff",
        description: tagData.description,
        post_count: 0,
        created_at: new Date().toISOString(),
      };
      tags.value.unshift(newTag); // 添加到開頭
      return newTag;
    } catch (err) {
      const message = err instanceof Error ? err.message : "建立標籤失敗";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTag = async (id: number, tagData: TagUpdate) => {
    setLoading(true);
    clearError();

    try {
      // tagAPI 目前不支持更新標籤，僅更新本地數據
      const index = tags.value.findIndex((tag) => tag.id === id);
      if (index >= 0) {
        tags.value[index] = {
          ...tags.value[index],
          ...tagData,
          updated_at: new Date().toISOString(),
        };
      } else {
        throw new Error("標籤不存在");
      }

      // 更新 currentTag 如果是當前選中的標籤
      if (currentTag.value?.id === id) {
        currentTag.value = tags.value[index];
      }

      return tags.value[index];
    } catch (err) {
      const message = err instanceof Error ? err.message : "更新標籤失敗";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (id: number) => {
    setLoading(true);
    clearError();

    try {
      await tagAPI.deleteTag(id);

      // 從 tags 陣列中移除
      const index = tags.value.findIndex((tag) => tag.id === id);
      if (index >= 0) {
        tags.value.splice(index, 1);
      }

      // 清除 currentTag 如果是當前選中的標籤
      if (currentTag.value?.id === id) {
        currentTag.value = null;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "刪除標籤失敗";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const findTagByName = (name: string) => {
    return tags.value.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
  };

  const getTagsWithMinPosts = (minPosts: number) => {
    return tags.value.filter((tag) => tag.post_count >= minPosts);
  };

  // 重置狀態
  const reset = () => {
    tags.value = [];
    currentTag.value = null;
    isLoading.value = false;
    error.value = null;
  };

  return {
    // 狀態
    tags,
    currentTag,
    isLoading,
    error,

    // 計算屬性
    popularTags,
    tagsByName,
    totalTags,

    // 操作
    setLoading,
    setError,
    clearError,

    // API 操作
    fetchTags,
    fetchPopularTags,
    fetchTag,
    createTag,
    updateTag,
    deleteTag,

    // 輔助方法
    findTagByName,
    getTagsWithMinPosts,
    reset,
  };
});
