import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { portfolioAPI, type PortfolioItem, type PortfolioItemCreate, technologyTagAPI, type TechnologyTag } from "@/services/api";

// 為了向下兼容，保留原有的 PortfolioProject 介面但使用 PortfolioItem 數據
export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  images: string[];
  demoUrl?: string;
  githubUrl?: string;
  category: string;
  featured: boolean;
  status: "active" | "completed" | "archived";
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioError {
  code: string;
  message: string;
  operation?: string;
}

// 轉換函數：將 PortfolioItem 轉換為 PortfolioProject
const convertToPortfolioProject = (item: PortfolioItem): PortfolioProject => {
  return {
    id: String(item.id),
    title: item.title,
    description: item.description,
    longDescription: item.full_description || item.description,
    technologies: item.technologies || [],
    images: item.images || [],
    demoUrl: item.live_url,
    githubUrl: item.github_url,
    category: item.category,
    featured: item.status === "completed", // 假設完成的項目為精選
    status: item.status === "completed" ? "completed" : "active",
    startDate: new Date(item.date),
    endDate: item.status === "completed" ? new Date(item.date) : undefined,
    createdAt: new Date(item.date),
    updatedAt: new Date(item.date),
  };
};

export const usePortfolioStore = defineStore("portfolio", () => {
  // 初始化時加入一些 mock 資料
  const projects = ref<PortfolioProject[]>([
    {
      id: "1",
      title: "OrionLabs 個人品牌網站",
      description: "使用 Vue 3 + TypeScript 建立的個人品牌網站",
      longDescription:
        "這是一個全方位的個人品牌網站，包含作品集展示、部落格系統、聯絡表單等功能。使用了現代前端技術棧，提供響應式設計和優秀的用戶體驗。",
      technologies: ["Vue 3", "TypeScript", "Vite", "Bootstrap 5", "Pinia"],
      images: ["/api/placeholder/800/600"],
      demoUrl: "#",
      githubUrl: "#",
      category: "web",
      featured: true,
      status: "active" as const,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-12-31"),
    },
    {
      id: "2",
      title: "響應式電商平台",
      description: "現代化的電子商務解決方案",
      longDescription: "功能完整的電商平台，包含商品管理、購物車、支付系統、用戶管理等核心功能。",
      technologies: ["Vue 3", "Node.js", "Express", "MongoDB", "Stripe"],
      images: ["/api/placeholder/800/600"],
      demoUrl: "#",
      githubUrl: "#",
      category: "web",
      featured: true,
      status: "completed" as const,
      startDate: new Date("2023-06-01"),
      endDate: new Date("2023-12-31"),
      createdAt: new Date("2023-06-01"),
      updatedAt: new Date("2023-12-31"),
    },
    {
      id: "3",
      title: "任務管理工具",
      description: "高效的專案和任務管理應用",
      longDescription: "直觀易用的任務管理工具，支援團隊協作、時間追蹤、進度報告等功能。",
      technologies: ["React", "Node.js", "PostgreSQL", "Socket.io"],
      images: ["/api/placeholder/800/600"],
      category: "tool",
      featured: false,
      status: "active" as const,
      startDate: new Date("2024-03-01"),
      createdAt: new Date("2024-03-01"),
      updatedAt: new Date("2024-06-01"),
    },
  ]);
  const currentProject = ref<PortfolioProject | null>(null);
  const isLoading = ref(false);
  const fetchLoading = ref(false);
  const createLoading = ref(false);
  const updateLoading = ref(false);
  const deleteLoading = ref(false);
  const error = ref<PortfolioError | null>(null);
  const selectedCategory = ref<string>("all");
  const selectedTechnologies = ref<string[]>([]);
  const searchQuery = ref("");
  const currentPage = ref(1);
  const projectsPerPage = ref(9);

  // 技術標籤相關狀態
  const availableTechnologyTags = ref<TechnologyTag[]>([]);
  const technologyTagsLoading = ref(false);

  const activeProjects = computed(() =>
    projects.value.filter((project) => project.status === "active"),
  );

  const featuredProjects = computed(() =>
    projects.value.filter((project) => project.featured).slice(0, 6),
  );

  const categories = computed(() => {
    const cats = new Set<string>();
    projects.value.forEach((project) => cats.add(project.category));
    return ["all", ...Array.from(cats).sort()];
  });

  const filteredProjects = computed(() => {
    let filtered = projects.value;

    // 搜尋篩選
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.longDescription.toLowerCase().includes(query) ||
          project.technologies.some((tech) => tech.toLowerCase().includes(query)),
      );
    }

    // 分類篩選
    if (selectedCategory.value !== "all") {
      filtered = filtered.filter((project) => project.category === selectedCategory.value);
    }

    // 技術標籤篩選
    if (selectedTechnologies.value.length > 0) {
      filtered = filtered.filter((project) =>
        selectedTechnologies.value.every((tech) => project.technologies.includes(tech)),
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  });

  const paginatedProjects = computed(() => {
    const start = (currentPage.value - 1) * projectsPerPage.value;
    const end = start + projectsPerPage.value;
    return filteredProjects.value.slice(start, end);
  });

  const totalPages = computed(() =>
    Math.ceil(filteredProjects.value.length / projectsPerPage.value),
  );

  const technologies = computed(() => {
    const techs = new Set<string>();
    projects.value.forEach((project) => {
      project.technologies.forEach((tech) => techs.add(tech));
    });
    return Array.from(techs).sort();
  });

  const technologyCounts = computed(() => {
    const counts = new Map<string, number>();
    projects.value.forEach((project) => {
      project.technologies.forEach((tech) => {
        counts.set(tech, (counts.get(tech) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .map(([tech, count]) => ({ tech, count }))
      .sort((a, b) => b.count - a.count);
  });

  const hasError = computed(() => !!error.value);

  const clearError = () => {
    error.value = null;
  };

  const setError = (err: PortfolioError) => {
    error.value = err;
  };

  // 技術標籤相關方法
  const fetchTechnologyTags = async () => {
    try {
      technologyTagsLoading.value = true;
      const tags = await technologyTagAPI.getTechnologyTags('technology');
      availableTechnologyTags.value = tags;
    } catch (err) {
      console.error('載入技術標籤失敗:', err);
      setError({
        code: 'FETCH_TAGS_ERROR',
        message: '載入技術標籤失敗',
        operation: 'fetchTechnologyTags'
      });
    } finally {
      technologyTagsLoading.value = false;
    }
  };

  const getTechnologyTagsByNames = (names: string[]): TechnologyTag[] => {
    return availableTechnologyTags.value.filter(tag =>
      names.some(name => name.toLowerCase() === tag.name.toLowerCase())
    );
  };

  const getOrCreateTechnologyTags = async (names: string[]): Promise<TechnologyTag[]> => {
    const existingTags = getTechnologyTagsByNames(names);
    const existingNames = existingTags.map(tag => tag.name.toLowerCase());
    const newNames = names.filter(name => !existingNames.includes(name.toLowerCase()));

    const newTags: TechnologyTag[] = [];
    for (const name of newNames) {
      try {
        const newTag = await technologyTagAPI.createTechnologyTag({
          name,
          color: '#3498db',
          category: 'technology'
        });
        newTags.push(newTag);
        availableTechnologyTags.value.push(newTag);
      } catch (err) {
        console.error(`建立標籤 "${name}" 失敗:`, err);
      }
    }

    return [...existingTags, ...newTags];
  };

  const fetchProjects = async (options: { forAdmin?: boolean } = {}) => {
    fetchLoading.value = true;
    isLoading.value = true;
    clearError();

    try {
      let items: PortfolioItem[];

      if (options.forAdmin) {
        // 管理員API
        items = await portfolioAPI.getAllItems();
      } else {
        // 公開API
        items = await portfolioAPI.getPublishedItems();
      }

      // 轉換為 PortfolioProject 格式
      projects.value = items.map(convertToPortfolioProject);
    } catch (err: unknown) {
      const catchError = err as { code?: string; message?: string };
      const portfolioError: PortfolioError = {
        code: catchError.code || "FETCH_ERROR",
        message: catchError.message || "Failed to load portfolio projects",
        operation: "fetch_projects",
      };
      setError(portfolioError);
    } finally {
      fetchLoading.value = false;
      isLoading.value = false;
    }
  };

  const fetchProject = async (id: string) => {
    fetchLoading.value = true;
    isLoading.value = true;
    clearError();

    try {
      const item = await portfolioAPI.getItem(Number(id));
      currentProject.value = convertToPortfolioProject(item);
    } catch (err: unknown) {
      const catchError = err as { code?: string; message?: string };
      const portfolioError: PortfolioError = {
        code: catchError.code || "FETCH_ERROR",
        message: catchError.message || "Failed to load portfolio project",
        operation: "fetch_project",
      };
      setError(portfolioError);
      currentProject.value = null;
    } finally {
      fetchLoading.value = false;
      isLoading.value = false;
    }
  };

  const createProject = async (
    projectData: Omit<PortfolioProject, "id" | "createdAt" | "updatedAt">,
  ) => {
    createLoading.value = true;
    clearError();

    try {
      // 轉換為後端API期望的格式
      const itemData = {
        title: projectData.title,
        description: projectData.description,
        full_description: projectData.longDescription,
        technologies: projectData.technologies,
        category: projectData.category,
        status: (projectData.status === "completed" ? "completed" : "in_progress") as
          | "completed"
          | "in_progress",
        date: projectData.startDate.toISOString(),
        live_url: projectData.demoUrl,
        github_url: projectData.githubUrl,
        features: [],
        images: projectData.images || [],
      };

      const newItem = await portfolioAPI.createItem(itemData);
      const newProject = convertToPortfolioProject(newItem);
      projects.value.push(newProject);
      return { success: true, project: newProject };
    } catch (err: unknown) {
      const catchError = err as { code?: string; message?: string };
      const portfolioError: PortfolioError = {
        code: catchError.code || "CREATE_ERROR",
        message: catchError.message || "Failed to create portfolio project",
        operation: "create_project",
      };
      setError(portfolioError);
      return { success: false, error: portfolioError };
    } finally {
      createLoading.value = false;
    }
  };

  const updateProject = async (id: string, projectData: Partial<PortfolioProject>) => {
    updateLoading.value = true;
    clearError();

    try {
      // 轉換為後端API期望的格式
      const updateData: Partial<PortfolioItemCreate & { images?: string[] }> = {};
      if (projectData.title) updateData.title = projectData.title;
      if (projectData.description) updateData.description = projectData.description;
      if (projectData.longDescription) updateData.full_description = projectData.longDescription;
      if (projectData.technologies) updateData.technologies = projectData.technologies;
      if (projectData.category) updateData.category = projectData.category;
      if (projectData.status)
        updateData.status = (projectData.status === "completed" ? "completed" : "in_progress") as
          | "completed"
          | "in_progress";
      if (projectData.startDate) updateData.date = projectData.startDate.toISOString();
      if (projectData.demoUrl !== undefined) updateData.live_url = projectData.demoUrl;
      if (projectData.githubUrl !== undefined) updateData.github_url = projectData.githubUrl;
      if (projectData.images) updateData.images = projectData.images;

      const updatedItem = await portfolioAPI.updateItem(Number(id), updateData);
      const updatedProject = convertToPortfolioProject(updatedItem);

      const index = projects.value.findIndex((project) => project.id === id);
      if (index !== -1) {
        projects.value[index] = updatedProject;
      }
      return { success: true, project: updatedProject };
    } catch (err: unknown) {
      const catchError = err as { code?: string; message?: string };
      const portfolioError: PortfolioError = {
        code: catchError.code || "UPDATE_ERROR",
        message: catchError.message || "Failed to update portfolio project",
        operation: "update_project",
      };
      setError(portfolioError);
      return { success: false, error: portfolioError };
    } finally {
      updateLoading.value = false;
    }
  };

  const deleteProject = async (id: string) => {
    deleteLoading.value = true;
    clearError();

    try {
      await portfolioAPI.deleteItem(Number(id));

      projects.value = projects.value.filter((project) => project.id !== id);
      if (currentProject.value?.id === id) {
        currentProject.value = null;
      }
      return { success: true };
    } catch (err: unknown) {
      const catchError = err as { code?: string; message?: string };
      const portfolioError: PortfolioError = {
        code: catchError.code || "DELETE_ERROR",
        message: catchError.message || "Failed to delete portfolio project",
        operation: "delete_project",
      };
      setError(portfolioError);
      return { success: false, error: portfolioError };
    } finally {
      deleteLoading.value = false;
    }
  };

  const setCategory = (category: string) => {
    selectedCategory.value = category;
    currentPage.value = 1;
  };

  const setSearchQuery = (query: string) => {
    searchQuery.value = query;
    currentPage.value = 1;
  };

  const toggleTechnology = (tech: string) => {
    const index = selectedTechnologies.value.indexOf(tech);
    if (index > -1) {
      selectedTechnologies.value.splice(index, 1);
    } else {
      selectedTechnologies.value.push(tech);
    }
    currentPage.value = 1;
  };

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  const setProjectsPerPage = (count: number) => {
    projectsPerPage.value = count;
    currentPage.value = 1;
  };

  const clearFilters = () => {
    selectedCategory.value = "all";
    selectedTechnologies.value = [];
    searchQuery.value = "";
    currentPage.value = 1;
  };

  const performSearch = (
    query: string,
    filters: {
      category?: string;
      technologies?: string[];
      page?: number;
      limit?: number;
    } = {},
  ) => {
    searchQuery.value = query;
    if (filters.category !== undefined) selectedCategory.value = filters.category;
    if (filters.technologies !== undefined) selectedTechnologies.value = filters.technologies;
    if (filters.page !== undefined) currentPage.value = filters.page;
    if (filters.limit !== undefined) projectsPerPage.value = filters.limit;
  };

  return {
    // Portfolio data
    projects,
    currentProject,

    // Loading states
    isLoading,
    fetchLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    technologyTagsLoading,

    // Error handling
    error,
    hasError,

    // Computed data
    activeProjects,
    featuredProjects,
    categories,
    filteredProjects,
    paginatedProjects,
    totalPages,
    technologies,
    technologyCounts,

    // Technology tags
    availableTechnologyTags,

    // Filters and pagination
    selectedCategory,
    selectedTechnologies,
    searchQuery,
    currentPage,
    projectsPerPage,

    // Actions - Portfolio CRUD
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,

    // Actions - Technology tags
    fetchTechnologyTags,
    getTechnologyTagsByNames,
    getOrCreateTechnologyTags,

    // Actions - Filters and navigation
    setCategory,
    setSearchQuery,
    toggleTechnology,
    setPage,
    setProjectsPerPage,
    clearFilters,
    performSearch,

    // Actions - Error handling
    clearError,
    setError,
  };
});
