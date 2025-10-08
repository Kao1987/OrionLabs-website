import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { technologyTagAPI, type TechnologyTag, type TechnologyTagCreate, type TechnologyTagUpdate } from "@/services/api";
import { Logger } from "@/services/api";

// This store now directly uses the latest technologyTagAPI for all operations.

export const useTagStore = defineStore("tag", () => {
  // State
  const tags = ref<TechnologyTag[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const popularTags = computed(() =>
    tags.value
      .filter((tag) => tag.usage_count > 0)
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 10),
  );

  const tagsByName = computed(() => [...tags.value].sort((a, b) => a.name.localeCompare(b.name)));

  const totalTags = computed(() => tags.value.length);

  // Actions
  const fetchTags = async (category?: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      tags.value = await technologyTagAPI.getTechnologyTags(category);
    } catch (e: any) {
      error.value = e.detail || "Failed to fetch tags";
      Logger.error("fetchTags error:", e);
    }
    isLoading.value = false;
  };

  const createTag = async (tagData: TechnologyTagCreate): Promise<TechnologyTag | null> => {
    isLoading.value = true;
    error.value = null;
    try {
      const newTag = await technologyTagAPI.createTechnologyTag(tagData);
      tags.value.unshift(newTag);
      return newTag;
    } catch (e: any) {
      error.value = e.detail || "Failed to create tag";
      Logger.error("createTag error:", e);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const updateTag = async (id: number, tagData: TechnologyTagUpdate): Promise<TechnologyTag | null> => {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedTag = await technologyTagAPI.updateTechnologyTag(id, tagData);
      const index = tags.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        tags.value[index] = updatedTag;
      }
      return updatedTag;
    } catch (e: any) {
      error.value = e.detail || "Failed to update tag";
      Logger.error("updateTag error:", e);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteTag = async (id: number): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;
    try {
      await technologyTagAPI.deleteTechnologyTag(id);
      const index = tags.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        tags.value.splice(index, 1);
      }
      return true;
    } catch (e: any) {
      error.value = e.detail || "Failed to delete tag";
      Logger.error("deleteTag error:", e);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const getTagById = (id: number): TechnologyTag | undefined => {
    return tags.value.find(t => t.id === id);
  };

  const findTagByName = (name: string): TechnologyTag | undefined => {
    return tags.value.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
  };

  return {
    tags,
    isLoading,
    error,
    popularTags,
    tagsByName,
    totalTags,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    getTagById,
    findTagByName,
  };
});