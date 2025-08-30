import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timeout?: number;
  persistent?: boolean;
}

export interface LoadingState {
  global: boolean;
  auth: boolean;
  blog: boolean;
  portfolio: boolean;
  upload: boolean;
  [key: string]: boolean;
}

export const useUIStore = defineStore("ui", () => {
  const theme = ref<"light" | "dark">("light");
  const sidebarOpen = ref(false);
  const mobileMenuOpen = ref(false);
  const loadingStates = ref<LoadingState>({
    global: false,
    auth: false,
    blog: false,
    portfolio: false,
    upload: false,
  });
  const notifications = ref<Notification[]>([]);

  const isDarkMode = computed(() => theme.value === "dark");
  const isLoading = computed(() => Object.values(loadingStates.value).some((loading) => loading));
  const isGlobalLoading = computed(() => loadingStates.value.global);

  const toggleTheme = () => {
    const newTheme = theme.value === "light" ? "dark" : "light";
    setTheme(newTheme);

    // 優化：立即更新 DOM，減少延遲
    requestAnimationFrame(() => {
      updateThemeClass();
      updateMetaThemeColor(newTheme);

      // 觸發自定義事件，通知其他組件主題變更
      window.dispatchEvent(
        new CustomEvent("themeChanged", {
          detail: { theme: newTheme },
        }),
      );
    });
  };

  const setTheme = (newTheme: "light" | "dark") => {
    theme.value = newTheme;

    // 優化：使用 try-catch 防止 localStorage 失敗
    try {
      localStorage.setItem("orion-theme", newTheme);
    } catch (error) {
      console.warn("無法儲存主題設定到 localStorage:", error);
    }

    updateThemeClass();
    updateMetaThemeColor(newTheme);
  };

  const updateThemeClass = () => {
    const docElement = document.documentElement;

    // 優化：批次 DOM 更新，避免重複重排
    docElement.setAttribute("data-theme", theme.value);
    docElement.classList.remove("theme-light", "theme-dark");
    docElement.classList.add(`theme-${theme.value}`);

    // 確保 body 也有主題類別 (向後兼容)
    document.body.className = document.body.className
      .replace(/theme-(light|dark)/g, '')
      .trim() + ` theme-${theme.value}`;
  };

  const updateMetaThemeColor = (currentTheme: "light" | "dark") => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const themeColor = currentTheme === "dark" ? "#1c1917" : "#ffffff";
      metaThemeColor.setAttribute("content", themeColor);
    }
  };

  const initializeTheme = () => {
    const savedTheme = localStorage.getItem("orion-theme") as "light" | "dark" | null;

    // 優先使用儲存的主題，否則根據系統偏好
    if (savedTheme && ["light", "dark"].includes(savedTheme)) {
      theme.value = savedTheme;
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      theme.value = prefersDark ? "dark" : "light";
    }

    updateThemeClass();
    updateMetaThemeColor(theme.value);

    // 監聽系統主題變化（僅在沒有手動設置時）
    if (!savedTheme) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", (e) => {
        if (!localStorage.getItem("orion-theme")) {
          theme.value = e.matches ? "dark" : "light";
          updateThemeClass();
          updateMetaThemeColor(theme.value);
        }
      });
    }
  };

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };

  const closeSidebar = () => {
    sidebarOpen.value = false;
  };

  const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value;
  };

  const closeMobileMenu = () => {
    mobileMenuOpen.value = false;
  };

  const setLoading = (key: keyof LoadingState | string, isLoading: boolean) => {
    loadingStates.value[key] = isLoading;
  };

  const setGlobalLoading = (isLoading: boolean) => {
    loadingStates.value.global = isLoading;
  };

  const getLoadingState = (key: keyof LoadingState | string): boolean => {
    return loadingStates.value[key] || false;
  };

  const clearAllLoading = () => {
    Object.keys(loadingStates.value).forEach((key) => {
      loadingStates.value[key] = false;
    });
  };

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = { id, ...notification };

    notifications.value.push(newNotification);

    if (!notification.persistent && notification.timeout !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.timeout || 5000);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const clearNotifications = () => {
    notifications.value = [];
  };

  const showSuccess = (title: string, message: string, timeout?: number) => {
    return addNotification({ type: "success", title, message, timeout });
  };

  const showError = (title: string, message: string, timeout?: number) => {
    return addNotification({ type: "error", title, message, timeout });
  };

  const showWarning = (title: string, message: string, timeout?: number) => {
    return addNotification({ type: "warning", title, message, timeout });
  };

  const showInfo = (title: string, message: string, timeout?: number) => {
    return addNotification({ type: "info", title, message, timeout });
  };

  return {
    theme,
    sidebarOpen,
    mobileMenuOpen,
    loadingStates,
    notifications,
    isDarkMode,
    isLoading,
    isGlobalLoading,
    toggleTheme,
    setTheme,
    initializeTheme,
    toggleSidebar,
    closeSidebar,
    toggleMobileMenu,
    closeMobileMenu,
    setLoading,
    setGlobalLoading,
    getLoadingState,
    clearAllLoading,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
});
