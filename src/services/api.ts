// API 基本配置 - 安全的環境變數優先配置
// 移除硬編碼 IP，使用環境變數確保安全性
const DEFAULT_API_URL = import.meta.env.VITE_DEFAULT_API_URL || "";
const DEFAULT_CONTACT_API_URL = import.meta.env.VITE_DEFAULT_CONTACT_API_URL || "";

// 環境變數優先，確保生產環境安全
// 臨時直接連接，因為 Vite 代理出現網路問題
const API_BASE_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || "/api") : (import.meta.env.VITE_API_URL || DEFAULT_API_URL);
const CONTACT_API_URL = import.meta.env.DEV ? (import.meta.env.VITE_CONTACT_API_URL || "/api") : (import.meta.env.VITE_CONTACT_API_URL || DEFAULT_CONTACT_API_URL);

// 環境配置
export const config = {
  API_BASE_URL,
  CONTACT_API_URL,
  DEFAULT_API_URL,
  DEFAULT_CONTACT_API_URL,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  version: import.meta.env.VITE_APP_VERSION || "1.0.0",
  // API 請求配置
  timeout: 10000, // 10秒超時
  maxRetries: 3,
  retryDelay: 1000,
};

// 統一的 API 端點配置 - 更新為 v1 API 結構
export const API_ENDPOINTS = {
  // 認證相關
  AUTH: {
    LOGIN: "/v1/auth/login",
    LOGOUT: "/v1/auth/logout",
    REFRESH: "/v1/auth/refresh",
    ME: "/v1/auth/me",
  },
  // 部落格相關
  BLOG: {
    POSTS: "/v1/blog/",
    POST: (id: string) => `/v1/blog/${id}`,
    PUBLIC: "/v1/blog/public",
    PUBLIC_POST: (id: string) => `/v1/blog/public/${id}`,
    CREATE: "/v1/blog/",
    UPDATE: (id: string) => `/v1/blog/${id}`,
    DELETE: (id: string) => `/v1/blog/${id}`,
    LIKE: (id: string) => `/v1/blog/${id}/like`,
  },
  // 作品集相關
  PORTFOLIO: {
    PROJECTS: "/v1/blog/portfolio",
    PROJECT: (id: string) => `/v1/blog/portfolio/${id}`,
    PUBLIC: "/v1/blog/portfolio/public",
    PUBLIC_PROJECT: (id: string) => `/v1/blog/portfolio/public/${id}`,
    CREATE: "/v1/blog/portfolio",
    UPDATE: (id: string) => `/v1/blog/portfolio/${id}`,
    DELETE: (id: string) => `/v1/blog/portfolio/${id}`,
  },
  // 聯絡相關
  CONTACT: {
    MESSAGES: "/v1/blog/messages",
    MESSAGE: (id: string) => `/v1/blog/messages/${id}`,
  },
  // 系統相關
  SYSTEM: {
    HEALTH: "/health",
    STATS: "/v1/blog/stats",
  },
  // 檔案上傳
  UPLOAD: {
    IMAGE: "/v1/upload/image",
    DELETE: (filename: string) => `/v1/upload/${filename}`,
  },
};

// 統一的 API 請求函數包裝器
export const createApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// 統一的 fetch 函數
export const unifiedFetch = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  const url = createApiUrl(endpoint);

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  return fetch(url, { ...defaultOptions, ...options });
};

// 調試模式
const DEBUG = config.isDevelopment;

// 日誌工具
export class Logger {
  static log(...args: unknown[]): void {
    if (DEBUG) {
      console.log("[API]", ...args);
    }
  }

  static error(...args: unknown[]): void {
    if (DEBUG) {
      console.error("[API ERROR]", ...args);
    }
  }

  static warn(...args: unknown[]): void {
    if (DEBUG) {
      console.warn("[API WARNING]", ...args);
    }
  }
}

// 類型定義
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  username: string;
  role: string;
}

export interface BlogPost {
  id: number;
  slug?: string;
  title: string;
  excerpt?: string;
  content: string;
  category: string;
  tags: string[];
  status: "draft" | "published";
  author: string;
  createdAt: string;
  publishedAt?: string;
  updatedAt?: string;
  readTime?: number;
  views?: number;
  likes?: number;
  featured?: boolean;
  featuredImage?: string;
}

export interface BlogPostCreate {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags: string[];
  status: "draft" | "published";
}

export type BlogPostUpdate = Partial<BlogPostCreate>;

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  full_description?: string;
  technologies: string[];
  category: string;
  status: "in_progress" | "completed";
  date: string;
  live_url?: string;
  github_url?: string;
  features: string[];
  images?: string[];
}

export interface PortfolioItemCreate {
  title: string;
  description: string;
  full_description?: string;
  technologies: string[];
  category: string;
  status: "in_progress" | "completed";
  date: string;
  live_url?: string;
  github_url?: string;
  features: string[];
}

export type PortfolioItemUpdate = Partial<PortfolioItemCreate>;

export interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
}

export interface MessageCreate {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Stats {
  blogPosts: number;
  portfolioItems: number;
  totalViews?: number;
  totalMessages?: number;
}

export interface APIError {
  detail: string;
  status?: number;
}

// 自訂 API 錯誤類別
export class APIErrorClass extends Error {
  public status: number;
  public detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
    this.name = "APIError";
  }
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface FilterParams {
  category?: string;
  status?: string;
  search?: string;
  [key: string]: unknown;
}

export interface APIResponse<T> {
  data: T;
  total?: number;
  page?: number;
  size?: number;
}

// Token 管理 - 增強版24小時記憶登入
export class TokenManager {
  private static readonly TOKEN_KEY = "adminToken";
  private static readonly TOKEN_TYPE_KEY = "tokenType";
  private static readonly TOKEN_EXPIRY_KEY = "tokenExpiry";
  private static readonly REMEMBER_ME_KEY = "rememberMe";
  private static readonly LAST_LOGIN_KEY = "lastLoginTime";
  private static readonly DEFAULT_EXPIRY_HOURS = 24; // 24小時過期
  private static readonly REMEMBER_EXPIRY_DAYS = 30; // 記住我30天

  static setToken(
    token: string,
    tokenType = "Bearer",
    expiresIn?: number,
    rememberMe = false,
  ): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.TOKEN_TYPE_KEY, tokenType);
    localStorage.setItem(this.LAST_LOGIN_KEY, Date.now().toString());

    // 如果勾選記住我，延長過期時間
    const expiry = rememberMe
      ? Date.now() + this.REMEMBER_EXPIRY_DAYS * 24 * 60 * 60 * 1000 // 30天
      : expiresIn
        ? Date.now() + expiresIn * 1000
        : Date.now() + this.DEFAULT_EXPIRY_HOURS * 60 * 60 * 1000; // 24小時

    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
    localStorage.setItem(this.REMEMBER_ME_KEY, rememberMe.toString());
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getTokenType(): string {
    return localStorage.getItem(this.TOKEN_TYPE_KEY) || "Bearer";
  }

  static isTokenExpired(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;

    return Date.now() > parseInt(expiry);
  }

  static isRemembered(): boolean {
    const rememberMe = localStorage.getItem(this.REMEMBER_ME_KEY);
    return rememberMe === "true";
  }

  static getLastLoginTime(): number | null {
    const lastLogin = localStorage.getItem(this.LAST_LOGIN_KEY);
    return lastLogin ? parseInt(lastLogin) : null;
  }

  static clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_TYPE_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);
    localStorage.removeItem(this.LAST_LOGIN_KEY);
  }

  static hasValidToken(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }

  // 檢查是否在24小時內登入過
  static isRecentLogin(): boolean {
    const lastLogin = this.getLastLoginTime();
    if (!lastLogin) return false;

    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - lastLogin < twentyFourHours;
  }

  // 取得剩餘時間（分鐘）
  static getRemainingTime(): number {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return 0;

    const remaining = parseInt(expiry) - Date.now();
    return Math.max(0, Math.floor(remaining / (60 * 1000)));
  }
}

// 快取管理
export class CacheManager {
  private static cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  static set(key: string, data: unknown, ttl = 300000): void {
    // 預設5分鐘
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  static clear(): void {
    this.cache.clear();
  }

  static delete(key: string): void {
    this.cache.delete(key);
  }
}

// 獲取認證標頭
function getAuthHeaders(): Record<string, string> {
  const token = TokenManager.getToken();
  const tokenType = TokenManager.getTokenType();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token && !TokenManager.isTokenExpired()) {
    headers["Authorization"] = `${tokenType} ${token}`;
  }

  return headers;
}

// 請求重試機制
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// 延遲函數
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 網路錯誤檢查
const isNetworkError = (error: unknown): boolean => {
  return (
    error instanceof TypeError ||
    (error instanceof Error && (
      error.message === "Failed to fetch" ||
      error.message === "Network request failed" ||
      error.name === "NetworkError"
    ))
  );
};

// 構建查詢參數的輔助函數
function buildQueryParams(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, String(v)));
      } else {
        query.append(key, String(value));
      }
    }
  });
  return query.toString();
}

// 快取輔助函數
function getCacheKey(endpoint: string, params?: unknown): string {
  const paramString = params ? JSON.stringify(params) : "";
  return `${endpoint}${paramString}`;
}

// 通用 API 請求函數（帶重試機制）
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  retries = MAX_RETRIES,
  skipAuthCheck = false,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超時

    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 處理不同的HTTP狀態碼
    if (response.status === 401) {
      // 登入請求的 401 不清除 token，讓後端錯誤訊息傳遞
      if (!skipAuthCheck && !endpoint.includes("/auth/login")) {
        TokenManager.clearToken();
        const error: APIError = { detail: "認證已過期，請重新登入", status: 401 };
        throw error;
      }
    }

    if (response.status === 403) {
      const error: APIError = { detail: "權限不足", status: 403 };
      throw error;
    }

    if (response.status === 404) {
      const error: APIError = { detail: "請求的資源不存在", status: 404 };
      throw error;
    }

    if (response.status === 429) {
      const error: APIError = { detail: "請求過於頻繁，請稍後再試", status: 429 };
      throw error;
    }

    if (response.status >= 500) {
      const error: APIError = { detail: "伺服器錯誤，請稍後再試", status: response.status };
      throw error;
    }

    // 處理非JSON回應
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      if (response.ok) {
        return response as unknown as T;
      } else {
        const error: APIError = {
          detail: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
        throw error;
      }
    }

    const data = await response.json();

    if (!response.ok) {
      const error: APIError = {
        detail: data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error: unknown) {
    // 如果是網路錯誤且還有重試次數，則重試
    if (isNetworkError(error) && retries > 0) {
      Logger.warn(`API請求失敗，準備重試... (剩餘重試次數: ${retries})`, endpoint);
      await delay(RETRY_DELAY);
      return apiRequest<T>(endpoint, options, retries - 1, skipAuthCheck);
    }

    // 如果是abort錯誤（超時）
    if (error instanceof Error && error.name === "AbortError") {
      const timeoutError: APIError = { detail: "請求超時，請檢查網路連線", status: 408 };
      throw timeoutError;
    }

    Logger.error(`API請求失敗 ${endpoint}:`, error);

    // 如果已經是APIError格式，直接拋出
    const errorObj = error as { detail?: string; status?: number; message?: string };
    if (errorObj.detail !== undefined) {
      throw error;
    }

    // 包裝其他錯誤
    const wrappedError: APIError = {
      detail: errorObj.message || "未知錯誤",
      status: errorObj.status || 0,
    };
    throw wrappedError;
  }
}

// 聯絡表單專用 API 請求函數
async function contactApiRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${CONTACT_API_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超時

    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      const error: APIError = {
        detail: data.detail || data.message || `聯絡 API 錯誤 ${response.status}`,
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error: unknown) {
    Logger.error(`聯絡 API 請求失敗 ${endpoint}:`, error);

    const catchError = error as { name?: string; detail?: string; message?: string; status?: number };

    // 如果是abort錯誤（超時）
    if (catchError.name === "AbortError") {
      const timeoutError: APIError = { detail: "聯絡請求超時，請檢查網路連線", status: 408 };
      throw timeoutError;
    }

    // 如果已經是APIError格式，直接拋出
    if (catchError.detail !== undefined) {
      throw error;
    }

    // 包裝其他錯誤
    const wrappedError: APIError = {
      detail: catchError.message || "聯絡功能暫時無法使用",
      status: catchError.status || 0,
    };
    throw wrappedError;
  }
}

// 帶快取的API請求
async function cachedApiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  cacheTTL = 300000,
): Promise<T> {
  const cacheKey = getCacheKey(endpoint, options);

  // 只有GET請求才使用快取
  if (!options.method || options.method === "GET") {
    const cached = CacheManager.get<T>(cacheKey);
    if (cached) {
      Logger.log("Cache hit:", endpoint);
      return cached;
    }
  }

  const result = await apiRequest<T>(endpoint, options);

  // 只快取GET請求的結果
  if (!options.method || options.method === "GET") {
    CacheManager.set(cacheKey, result, cacheTTL);
  }

  return result;
}

// 認證相關API
export const authAPI = {
  login: async (username: string, password: string, rememberMe = false): Promise<LoginResponse> => {
    const loginData: LoginRequest = { username, password };

    // 登入請求跳過認證檢查，避免錯誤的 401 處理
    const result = await apiRequest<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        method: "POST",
        body: JSON.stringify(loginData),
      },
      config.maxRetries,
      true,
    ); // skipAuthCheck = true

    // 自動保存 token，根據記住我設定過期時間
    if (result.access_token) {
      TokenManager.setToken(result.access_token, result.token_type, undefined, rememberMe);
      const expireTime = rememberMe ? "30天" : "24小時";
      Logger.log(`用戶登入成功，Token已保存（${expireTime}有效）`);
    }

    return result;
  },

  // 檢查是否已經登入且Token有效
  checkAuthStatus: async (): Promise<{ isAuthenticated: boolean; user?: User }> => {
    if (!TokenManager.hasValidToken()) {
      return { isAuthenticated: false };
    }

    try {
      const user = await authAPI.getCurrentUser();
      return { isAuthenticated: true, user };
    } catch {
      // Ignore error
      // Token可能已失效，清除
      TokenManager.clearToken();
      return { isAuthenticated: false };
    }
  },

  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>(API_ENDPOINTS.AUTH.ME);
  },

  refreshToken: async (): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      method: "POST",
    });
  },

  logout: async (): Promise<{ ok: boolean }> => {
    try {
      const result = await apiRequest<{ ok: boolean }>(API_ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
      });
      // 清除本地認證信息
      TokenManager.clearToken();
      return result;
    } catch (err) {
      // 即使API失敗也要清除本地認證信息
      TokenManager.clearToken();
      throw err;
    }
  },

  // 檢查認證狀態
  isAuthenticated: (): boolean => {
    return TokenManager.hasValidToken();
  },

  // 清除認證信息
  clearAuth: (): void => {
    TokenManager.clearToken();
  },
};

// 部落格相關API
export const blogAPI = {
  // 公開API
  getPublishedPosts: async (params?: PaginationParams & FilterParams): Promise<BlogPost[]> => {
    const queryString = params ? buildQueryParams(params as Record<string, unknown>) : "";
    return cachedApiRequest<BlogPost[]>(`/api/blog/public${queryString ? `?${queryString}` : ""}`);
  },

  getPublishedPost: async (id: number): Promise<BlogPost> => {
    return apiRequest<BlogPost>(`/api/blog/public/${id}`);
  },

  getPublishedPostBySlug: async (slug: string): Promise<BlogPost> => {
    return apiRequest<BlogPost>(`/api/blog/public/slug/${slug}`);
  },

  likePost: async (id: number): Promise<{ likes: number; message: string }> => {
    return apiRequest<{ likes: number; message: string }>(`/api/blog/posts/${id}/like`, {
      method: "POST",
    });
  },

  // 獲取文章分類
  getCategories: async (): Promise<string[]> => {
    return cachedApiRequest<string[]>("/api/blog/posts/categories");
  },

  // 獲取熱門標籤
  getPopularTags: async (limit = 10): Promise<{ name: string; count: number }[]> => {
    return cachedApiRequest<{ name: string; count: number }[]>(
      `/api/blog/posts/tags/popular?limit=${limit}`,
    );
  },

  // 搜尋文章
  searchPosts: async (query: string, params?: PaginationParams): Promise<BlogPost[]> => {
    const searchParams = { ...params, search: query };
    const queryString = buildQueryParams(searchParams);
    return apiRequest<BlogPost[]>(`/api/blog/posts/search?${queryString}`);
  },

  // 管理員API
  getAllPosts: async (params?: PaginationParams & FilterParams): Promise<BlogPost[]> => {
    const queryString = params ? buildQueryParams(params) : "";
    return apiRequest<BlogPost[]>(`/api/blog${queryString ? `?${queryString}` : ""}`);
  },

  getPost: async (id: number): Promise<BlogPost> => {
    return apiRequest<BlogPost>(`/api/blog/${id}`);
  },

  createPost: async (postData: BlogPostCreate): Promise<BlogPost> => {
    return apiRequest<BlogPost>("/api/blog", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  },

  updatePost: async (id: number, postData: BlogPostUpdate): Promise<BlogPost> => {
    return apiRequest<BlogPost>(`/api/blog/${id}`, {
      method: "PUT",
      body: JSON.stringify(postData),
    });
  },

  deletePost: async (id: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/api/blog/${id}`, {
      method: "DELETE",
    });
  },

  // 批量操作
  batchUpdatePosts: async (
    ids: number[],
    updates: BlogPostUpdate,
  ): Promise<{ updated: number }> => {
    return apiRequest<{ updated: number }>("/api/blog/batch", {
      method: "PATCH",
      body: JSON.stringify({ ids, updates }),
    });
  },

  batchDeletePosts: async (ids: number[]): Promise<{ deleted: number }> => {
    return apiRequest<{ deleted: number }>("/api/blog/batch", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
  },
};

// 作品集相關API
export const portfolioAPI = {
  // 公開API
  getPublishedItems: async (params?: PaginationParams & FilterParams): Promise<PortfolioItem[]> => {
    const queryString = params ? buildQueryParams(params) : "";
    return cachedApiRequest<PortfolioItem[]>(
      `/api/portfolio/public${queryString ? `?${queryString}` : ""}`,
    );
  },

  getPublishedItem: async (id: number): Promise<PortfolioItem> => {
    return apiRequest<PortfolioItem>(`/api/portfolio/public/${id}`);
  },

  // 獲取作品分類
  getCategories: async (): Promise<string[]> => {
    return cachedApiRequest<string[]>("/api/portfolio/categories");
  },

  // 獲取技術標籤
  getTechnologies: async (): Promise<string[]> => {
    return cachedApiRequest<string[]>("/api/portfolio/technologies");
  },

  // 管理員API
  getAllItems: async (params?: PaginationParams & FilterParams): Promise<PortfolioItem[]> => {
    const queryString = params ? buildQueryParams(params) : "";
    return apiRequest<PortfolioItem[]>(`/api/portfolio${queryString ? `?${queryString}` : ""}`);
  },

  getItem: async (id: number): Promise<PortfolioItem> => {
    return apiRequest<PortfolioItem>(`/api/portfolio/${id}`);
  },

  createItem: async (itemData: PortfolioItemCreate): Promise<PortfolioItem> => {
    return apiRequest<PortfolioItem>("/api/portfolio", {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  },

  updateItem: async (id: number, itemData: PortfolioItemUpdate): Promise<PortfolioItem> => {
    return apiRequest<PortfolioItem>(`/api/portfolio/${id}`, {
      method: "PUT",
      body: JSON.stringify(itemData),
    });
  },

  deleteItem: async (id: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/api/portfolio/${id}`, {
      method: "DELETE",
    });
  },

  // 圖片上傳
  uploadImage: async (id: number, file: File): Promise<{ url: string; message: string }> => {
    const formData = new FormData();
    formData.append("image", file);

    return apiRequest<{ url: string; message: string }>(`/api/portfolio/${id}/images`, {
      method: "POST",
      body: formData,
      headers: {
        // 不設置 Content-Type，讓瀏覽器自動設置 multipart/form-data
      } as Record<string, string>,
    });
  },

  // 刪除圖片
  deleteImage: async (id: number, imageId: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/api/portfolio/${id}/images/${imageId}`, {
      method: "DELETE",
    });
  },
};

// 留言相關API
export const messageAPI = {
  // 公開API - 發送留言 (使用聯絡表單 API)
  sendMessage: async (messageData: MessageCreate): Promise<{ message: string; id: number }> => {
    try {
      // 首先嘗試使用聯絡表單 API
      return await contactApiRequest<{ message: string; id: number }>("/api/contact", {
        method: "POST",
        body: JSON.stringify(messageData),
      });
    } catch (err) {
      Logger.warn("聯絡表單 API 失敗，嘗試使用主要 API", err);
      // 如果聯絡表單 API 失敗，回退到主要 API
      return apiRequest<{ message: string; id: number }>("/api/messages", {
        method: "POST",
        body: JSON.stringify(messageData),
      });
    }
  },

  // 管理員API - 獲取留言列表
  getMessages: async (params?: PaginationParams & { status?: string }): Promise<Message[]> => {
    const queryString = params ? buildQueryParams(params) : "";
    return apiRequest<Message[]>(`/api/messages${queryString ? `?${queryString}` : ""}`);
  },

  // 獲取單一留言
  getMessage: async (id: number): Promise<Message> => {
    return apiRequest<Message>(`/api/messages/${id}`);
  },

  // 更新留言狀態
  updateMessageStatus: async (id: number, status: "new" | "read" | "replied"): Promise<Message> => {
    return apiRequest<Message>(`/api/messages/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // 刪除留言
  deleteMessage: async (id: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/api/messages/${id}`, {
      method: "DELETE",
    });
  },

  // 批量標記為已讀
  markAsRead: async (ids: number[]): Promise<{ updated: number }> => {
    return apiRequest<{ updated: number }>("/api/messages/batch/read", {
      method: "PATCH",
      body: JSON.stringify({ ids }),
    });
  },
};

// 標籤相關API (規格書要求但後端尚未實作)
export const tagAPI = {
  // 獲取所有標籤 - 待後端實作
  getTags: async (): Promise<{ name: string; count: number }[]> => {
    try {
      return cachedApiRequest<{ name: string; count: number }[]>("/api/tags");
    } catch {
      // Ignore error
      Logger.warn("Tags API not implemented yet, returning mock data");
      return []; // 暫時回傳空陣列
    }
  },

  // 創建標籤 - 待後端實作
  createTag: async (name: string): Promise<{ name: string; message: string }> => {
    try {
      return apiRequest<{ name: string; message: string }>("/api/tags", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
    } catch {
      // Ignore error
      Logger.warn("Create tag API not implemented yet");
      throw new APIErrorClass(501, "Tags API not yet implemented");
    }
  },

  // 刪除標籤 - 待後端實作
  deleteTag: async (id: number): Promise<{ message: string }> => {
    try {
      return apiRequest<{ message: string }>(`/api/tags/${id}`, {
        method: "DELETE",
      });
    } catch {
      // Ignore error
      Logger.warn("Delete tag API not implemented yet");
      throw new APIErrorClass(501, "Tags API not yet implemented");
    }
  },
};

// 統計相關API
export const statsAPI = {
  getStats: async (): Promise<Stats> => {
    return apiRequest<Stats>("/api/stats");
  },

  // 獲取詳細統計
  getDetailedStats: async (): Promise<{
    posts: { total: number; published: number; drafts: number };
    portfolio: { total: number; completed: number; in_progress: number };
    messages: { total: number; new: number; read: number; replied: number };
    views: { total: number; this_month: number; this_week: number };
  }> => {
    return apiRequest("/api/stats/detailed");
  },

  // 獲取訪問統計
  getVisitorStats: async (
    period: "week" | "month" | "year" = "month",
  ): Promise<{
    labels: string[];
    data: number[];
  }> => {
    return apiRequest(`/api/stats/visitors?period=${period}`);
  },
};

// 檔案上傳API
export const uploadAPI = {
  // 上傳圖片
  uploadImage: async (
    file: File,
    folder = "general",
  ): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    return apiRequest<{ url: string; filename: string }>("/api/upload/image", {
      method: "POST",
      body: formData,
      headers: {} as Record<string, string>, // 讓瀏覽器自動設置 Content-Type
    });
  },

  // 刪除檔案
  deleteFile: async (filename: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/api/upload/${filename}`, {
      method: "DELETE",
    });
  },
};

// 健康檢查API
export const healthAPI = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    return apiRequest<{ status: string; timestamp: string }>("/health");
  },

  // 檢查資料庫連線
  checkDatabase: async (): Promise<{ database: string; status: string }> => {
    return apiRequest<{ database: string; status: string }>("/health/database");
  },
};

// API 錯誤處理工具
export class APIErrorHandler {
  static handle(error: APIError): string {
    switch (error.status) {
      case 400:
        return "請求參數錯誤";
      case 401:
        return "認證已過期，請重新登入";
      case 403:
        return "權限不足";
      case 404:
        return "請求的資源不存在";
      case 429:
        return "請求過於頻繁，請稍後再試";
      case 500:
        return "伺服器內部錯誤";
      case 502:
        return "伺服器暫時無法使用";
      case 503:
        return "服務暫時不可用";
      default:
        return error.detail || "未知錯誤";
    }
  }

  static isAuthError(error: APIError): boolean {
    return error.status === 401 || error.status === 403;
  }

  static isNetworkError(error: APIError): boolean {
    return (
      error.status === 0 || error.status === 408 || error.status === 502 || error.status === 503
    );
  }
}

// 導出所有API
export default {
  auth: authAPI,
  blog: blogAPI,
  portfolio: portfolioAPI,
  message: messageAPI,
  tag: tagAPI,
  stats: statsAPI,
  upload: uploadAPI,
  health: healthAPI,
};
