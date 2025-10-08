// API 基本配置 - 遵循 M-BE-security.md 安全規範
// 移除硬編碼 IP，使用環境變數確保安全性
const DEFAULT_API_URL = import.meta.env.VITE_DEFAULT_API_URL || "http://localhost:8000/api/v1";
const DEFAULT_CONTACT_API_URL = import.meta.env.VITE_DEFAULT_CONTACT_API_URL || "http://localhost:8000/api/v1";

// 環境變數優先，確保生產環境安全
// 開發模式使用代理，生產模式使用直接URL
const API_BASE_URL = import.meta.env.DEV ?
  (import.meta.env.VITE_API_URL || "/api/v1") :
  (import.meta.env.VITE_API_URL || DEFAULT_API_URL);

// 安全檢查：生產環境必須使用 HTTPS
if (import.meta.env.PROD && !API_BASE_URL.startsWith('https://') && !API_BASE_URL.startsWith('/')) {
  console.warn('⚠️ 安全警告：生產環境應使用 HTTPS');
}
const CONTACT_API_URL = import.meta.env.DEV ?
  (import.meta.env.VITE_CONTACT_API_URL || "/api/v1") :
  (import.meta.env.VITE_CONTACT_API_URL || DEFAULT_CONTACT_API_URL);

// 判斷後端連接類型
function getBackendConnectionType(): 'local' | 'remote' | 'docker' {
  const url = DEFAULT_API_URL.toLowerCase();

  // 檢查是否為本地後端
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return 'local';
  }

  // 檢查是否為 Docker 後端（通常使用 8001 端口）
  if (url.includes('docker') || url.includes(':8001')) {
    return 'docker';
  }

  // 其他情況視為遠端後端
  return 'remote';
}

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
  // 後端連接資訊
  backendConnection: {
    type: getBackendConnectionType(),
    target: DEFAULT_API_URL,
  },
};

// 統一的 API 端點配置 - 更新為 v1 API 結構
export const API_ENDPOINTS = {
  // 認證相關 - 已測試可用
  AUTH: {
    LOGIN: "/auth/login", // ✅ 已測試 - 端點存在，返回401表示需要正確帳密
    LOGOUT: "/auth/logout", // 需要認證
    REFRESH: "/auth/refresh", // 需要認證
    ME: "/auth/me", // 需要認證
  },
  // 部落格相關
  BLOG: {
    POSTS: "/blog/", // 需要認證
    POST: (id: string) => `/blog/${id}`, // 需要認證
    PUBLIC: "/blog/public", // ✅ 已測試 - 可用，返回空陣列
    PUBLIC_POST: (id: string) => `/blog/public/${id}`, // 公開端點
    CREATE: "/blog/", // 需要認證
    UPDATE: (id: string) => `/blog/${id}`, // 需要認證
    DELETE: (id: string) => `/blog/${id}`, // 需要認證
    LIKE: (id: string) => `/blog/${id}/like`, // 需要認證
  },
  // 作品集相關
  PORTFOLIO: {
    PROJECTS: "/blog/portfolio",
    PROJECT: (id: string) => `/blog/portfolio/${id}`,
    PUBLIC: "/blog/portfolio/public",
    PUBLIC_PROJECT: (id: string) => `/blog/portfolio/public/${id}`,
    CREATE: "/blog/portfolio",
    UPDATE: (id: string) => `/blog/portfolio/${id}`,
    DELETE: (id: string) => `/blog/portfolio/${id}`,
  },
  // 聯絡相關
  CONTACT: {
    MESSAGES: "/blog/messages",
    MESSAGE: (id: string) => `/blog/messages/${id}`,
    CREATE: "/blog/messages",
  },
  // 系統相關
  SYSTEM: {
    HEALTH: "/health",
    STATS: "/blog/stats",
  },
  // 檔案上傳
  UPLOAD: {
    IMAGE: "/upload/image",
    DELETE: (filename: string) => `/upload/${filename}`,
  },
  // 標籤相關（技術標籤）
  TAGS: {
    LIST: "/blog/tags",
    TAG: (id: string) => `/blog/tags/${id}`,
    CREATE: "/blog/tags",
    UPDATE: (id: string) => `/blog/tags/${id}`,
    DELETE: (id: string) => `/blog/tags/${id}`,
    POPULAR: "/blog/tags/popular",
    BY_CATEGORY: (category: string) => `/blog/tags?category=${category}`,
  },
  // 部落格分類相關
  BLOG_CATEGORIES: {
    LIST: "/blog/categories",
    CATEGORY: (id: string) => `/blog/categories/${id}`,
    CREATE: "/blog/categories",
    UPDATE: (id: string) => `/blog/categories/${id}`,
    DELETE: (id: string) => `/blog/categories/${id}`,
    STATS: "/blog/categories/stats",
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
  // 如果endpoint已經是完整URL，直接使用；
  // 如果是health端點，使用特殊處理，直接加到基礎代理路徑
  // 否則添加API前綴
  let url: string;
  if (endpoint.startsWith('http')) {
    url = endpoint;
  } else if (endpoint.startsWith('/health')) {
    // Health 端點特殊處理，直接使用代理路徑
    url = import.meta.env.DEV ? `/api${endpoint}` : `${config.DEFAULT_API_URL.replace('/v1', '')}${endpoint}`;
  } else {
    url = createApiUrl(endpoint);
  }

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

// 技術標籤相關介面（基於擴充後的 tags 表）
export interface TechnologyTag {
  id: number;
  name: string;
  color: string;
  description?: string;
  post_count: number;
  category: "technology" | "blog" | "general";
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface TechnologyTagCreate {
  name: string;
  color: string;
  description?: string;
  category: "technology" | "blog" | "general";
}

export type TechnologyTagUpdate = Partial<TechnologyTagCreate>;

// 部落格分類相關介面（基於新的 blog_categories 表）
export interface BlogCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  post_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogCategoryCreate {
  name: string;
  description?: string;
  color: string;
}

export interface BlogCategoryUpdate extends Partial<BlogCategoryCreate> {
  is_active?: boolean;
}

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

// 系統監控相關介面
export interface BuildInfo {
  commitHash: string;
  branch: string;
  buildTime: string;
}

export interface BackendInfo {
  version: string;
  buildInfo: BuildInfo;
  environment: string;
}

export interface HealthInfo {
  status: 'healthy' | 'unhealthy';
  database: boolean;
  authSystem: boolean;
}

export interface SystemStatusData {
  backend: BackendInfo;
  health: HealthInfo;
  timestamp: string;
}

export interface SystemStatus {
  data: SystemStatusData;
}

export interface EndpointTest {
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  latency?: number;
  statusCode?: number;
  error?: string;
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
    return cachedApiRequest<BlogPost[]>(`${API_ENDPOINTS.BLOG.PUBLIC}${queryString ? `?${queryString}` : ""}`);
  },

  getPublishedPost: async (id: number): Promise<BlogPost> => {
    return apiRequest<BlogPost>(API_ENDPOINTS.BLOG.PUBLIC_POST(id.toString()));
  },

  getPublishedPostBySlug: async (slug: string): Promise<BlogPost> => {
    return apiRequest<BlogPost>(`${API_ENDPOINTS.BLOG.PUBLIC}/slug/${slug}`);
  },

  likePost: async (id: number): Promise<{ likes: number; message: string }> => {
    return apiRequest<{ likes: number; message: string }>(API_ENDPOINTS.BLOG.LIKE(id.toString()), {
      method: "POST",
    });
  },

  // 獲取文章分類
  getCategories: async (): Promise<string[]> => {
    return cachedApiRequest<string[]>(`${API_ENDPOINTS.BLOG.POSTS}categories`);
  },

  // 獲取熱門標籤
  getPopularTags: async (limit = 10): Promise<{ name: string; count: number }[]> => {
    return cachedApiRequest<{ name: string; count: number }[]>(
      `${API_ENDPOINTS.BLOG.POSTS}tags/popular?limit=${limit}`,
    );
  },

  // 搜尋文章
  searchPosts: async (query: string, params?: PaginationParams): Promise<BlogPost[]> => {
    const searchParams = { ...params, search: query };
    const queryString = buildQueryParams(searchParams);
    return apiRequest<BlogPost[]>(`${API_ENDPOINTS.BLOG.POSTS}search?${queryString}`);
  },

  // 管理員API
  getAllPosts: async (params?: PaginationParams & FilterParams): Promise<BlogPost[]> => {
    const queryString = params ? buildQueryParams(params) : "";
    return apiRequest<BlogPost[]>(`${API_ENDPOINTS.BLOG.POSTS}${queryString ? `?${queryString}` : ""}`);
  },

  getPost: async (id: number): Promise<BlogPost> => {
    return apiRequest<BlogPost>(API_ENDPOINTS.BLOG.POST(id.toString()));
  },

  createPost: async (postData: BlogPostCreate): Promise<BlogPost> => {
    return apiRequest<BlogPost>(API_ENDPOINTS.BLOG.CREATE, {
      method: "POST",
      body: JSON.stringify(postData),
    });
  },

  updatePost: async (id: number, postData: BlogPostUpdate): Promise<BlogPost> => {
    return apiRequest<BlogPost>(API_ENDPOINTS.BLOG.UPDATE(id.toString()), {
      method: "PUT",
      body: JSON.stringify(postData),
    });
  },

  deletePost: async (id: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(API_ENDPOINTS.BLOG.DELETE(id.toString()), {
      method: "DELETE",
    });
  },

  // 批量操作
  batchUpdatePosts: async (
    ids: number[],
    updates: BlogPostUpdate,
  ): Promise<{ updated: number }> => {
    return apiRequest<{ updated: number }>(`${API_ENDPOINTS.BLOG.POSTS}batch`, {
      method: "PATCH",
      body: JSON.stringify({ ids, updates }),
    });
  },

  batchDeletePosts: async (ids: number[]): Promise<{ deleted: number }> => {
    return apiRequest<{ deleted: number }>(`${API_ENDPOINTS.BLOG.POSTS}batch`, {
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
      `${API_ENDPOINTS.PORTFOLIO.PUBLIC}${queryString ? `?${queryString}` : ""}`,
    );
  },

  getPublishedItem: async (id: number): Promise<PortfolioItem> => {
    return apiRequest<PortfolioItem>(API_ENDPOINTS.PORTFOLIO.PUBLIC_PROJECT(id.toString()));
  },

  // 獲取作品分類
  getCategories: async (): Promise<string[]> => {
    return cachedApiRequest<string[]>(`${API_ENDPOINTS.PORTFOLIO.PROJECTS}/categories`);
  },

  // 獲取技術標籤
  getTechnologies: async (): Promise<string[]> => {
    return cachedApiRequest<string[]>(`${API_ENDPOINTS.PORTFOLIO.PROJECTS}/technologies`);
  },

  // 管理員API
  getAllItems: async (params?: PaginationParams & FilterParams): Promise<PortfolioItem[]> => {
    const queryString = params ? buildQueryParams(params) : "";
    return apiRequest<PortfolioItem[]>(`${API_ENDPOINTS.PORTFOLIO.PROJECTS}${queryString ? `?${queryString}` : ""}`);
  },

  getItem: async (id: number): Promise<PortfolioItem> => {
    return apiRequest<PortfolioItem>(API_ENDPOINTS.PORTFOLIO.PROJECT(id.toString()));
  },

  createItem: async (itemData: PortfolioItemCreate): Promise<PortfolioItem> => {
    return apiRequest<PortfolioItem>(API_ENDPOINTS.PORTFOLIO.CREATE, {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  },

  updateItem: async (id: number, itemData: PortfolioItemUpdate): Promise<PortfolioItem> => {
    return apiRequest<PortfolioItem>(API_ENDPOINTS.PORTFOLIO.UPDATE(id.toString()), {
      method: "PUT",
      body: JSON.stringify(itemData),
    });
  },

  deleteItem: async (id: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(API_ENDPOINTS.PORTFOLIO.DELETE(id.toString()), {
      method: "DELETE",
    });
  },

  // 圖片上傳
  uploadImage: async (id: number, file: File): Promise<{ url: string; message: string }> => {
    const formData = new FormData();
    formData.append("image", file);

    return apiRequest<{ url: string; message: string }>(`${API_ENDPOINTS.PORTFOLIO.PROJECT(id.toString())}/images`, {
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
  // 公開API - 發送留言
  sendMessage: async (messageData: MessageCreate): Promise<{ message: string; id: number }> => {
    return apiRequest<{ message: string; id: number }>(API_ENDPOINTS.CONTACT.CREATE, {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  },

  // 管理員API - 獲取留言列表
  getMessages: async (params?: PaginationParams & { status?: string }): Promise<Message[]> => {
    const queryString = params ? buildQueryParams(params) : "";
    return apiRequest<Message[]>(`${API_ENDPOINTS.CONTACT.MESSAGES}${queryString ? `?${queryString}` : ""}`);
  },

  // 獲取單一留言
  getMessage: async (id: number): Promise<Message> => {
    return apiRequest<Message>(API_ENDPOINTS.CONTACT.MESSAGE(id.toString()));
  },

  // 更新留言狀態
  updateMessageStatus: async (id: number, status: "new" | "read" | "replied"): Promise<Message> => {
    return apiRequest<Message>(API_ENDPOINTS.CONTACT.MESSAGE(id.toString()), {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  // 刪除留言
  deleteMessage: async (id: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(API_ENDPOINTS.CONTACT.MESSAGE(id.toString()), {
      method: "DELETE",
    });
  },

  // 標記單一訊息為已讀
  markAsRead: async (id: number): Promise<{ message: string }> => {
    // 後端端點是 /messages/{message_id}/mark-read
    return apiRequest<{ message: string }>(`${API_ENDPOINTS.CONTACT.MESSAGE(id.toString())}/mark-read`, {
      method: "POST",
    });
  },
};

// 技術標籤相關API（基於擴充後的 tags 表）
export const technologyTagAPI = {
  // 獲取所有技術標籤
  getTechnologyTags: async (category?: string): Promise<TechnologyTag[]> => {
    const endpoint = category ? API_ENDPOINTS.TAGS.BY_CATEGORY(category) : API_ENDPOINTS.TAGS.LIST;
    return await apiRequest<TechnologyTag[]>(endpoint);
  },

  // 獲取單個技術標籤
  getTechnologyTag: async (id: number): Promise<TechnologyTag> => {
    return await apiRequest<TechnologyTag>(API_ENDPOINTS.TAGS.TAG(id.toString()));
  },

  // 創建技術標籤
  createTechnologyTag: async (tag: TechnologyTagCreate): Promise<TechnologyTag> => {
    return await apiRequest<TechnologyTag>(API_ENDPOINTS.TAGS.CREATE, {
      method: "POST",
      body: JSON.stringify(tag),
    });
  },

  // 更新技術標籤
  updateTechnologyTag: async (id: number, tag: TechnologyTagUpdate): Promise<TechnologyTag> => {
    return await apiRequest<TechnologyTag>(API_ENDPOINTS.TAGS.UPDATE(id.toString()), {
      method: "PUT",
      body: JSON.stringify(tag),
    });
  },

  // 刪除技術標籤
  deleteTechnologyTag: async (id: number): Promise<{ message: string }> => {
    return await apiRequest<{ message: string }>(API_ENDPOINTS.TAGS.DELETE(id.toString()), {
      method: "DELETE",
    });
  },

  // 獲取熱門技術標籤
  getPopularTechnologyTags: async (limit: number = 10): Promise<TechnologyTag[]> => {
    return await apiRequest<TechnologyTag[]>(`${API_ENDPOINTS.TAGS.POPULAR}?limit=${limit}`);
  },

  // 搜尋技術標籤
  searchTechnologyTags: async (query: string): Promise<TechnologyTag[]> => {
    return await apiRequest<TechnologyTag[]>(`${API_ENDPOINTS.TAGS.LIST}?search=${encodeURIComponent(query)}`);
  },
};

// 部落格分類相關API（基於新的 blog_categories 表）
export const blogCategoryAPI = {
  // 獲取所有部落格分類
  getCategories: async (): Promise<BlogCategory[]> => {
    return await apiRequest<BlogCategory[]>(API_ENDPOINTS.BLOG_CATEGORIES.LIST);
  },

  // 獲取單個分類
  getCategory: async (id: number): Promise<BlogCategory> => {
    return await apiRequest<BlogCategory>(API_ENDPOINTS.BLOG_CATEGORIES.CATEGORY(id.toString()));
  },

  // 創建分類
  createCategory: async (category: BlogCategoryCreate): Promise<BlogCategory> => {
    return await apiRequest<BlogCategory>(API_ENDPOINTS.BLOG_CATEGORIES.CREATE, {
      method: "POST",
      body: JSON.stringify(category),
    });
  },

  // 更新分類
  updateCategory: async (id: number, category: BlogCategoryUpdate): Promise<BlogCategory> => {
    return await apiRequest<BlogCategory>(API_ENDPOINTS.BLOG_CATEGORIES.UPDATE(id.toString()), {
      method: "PUT",
      body: JSON.stringify(category),
    });
  },

  // 刪除分類
  deleteCategory: async (id: number): Promise<{ message: string }> => {
    return await apiRequest<{ message: string }>(API_ENDPOINTS.BLOG_CATEGORIES.DELETE(id.toString()), {
      method: "DELETE",
    });
  },

  // 獲取分類統計
  getCategoryStats: async (): Promise<{ name: string; count: number; color: string }[]> => {
    return await apiRequest<{ name: string; count: number; color: string }[]>(API_ENDPOINTS.BLOG_CATEGORIES.STATS);
  },
};

// 統計相關API
export const statsAPI = {
  getStats: async (): Promise<Stats> => {
    return apiRequest<Stats>(API_ENDPOINTS.SYSTEM.STATS);
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

    return apiRequest<{ url: string; filename: string }>(API_ENDPOINTS.UPLOAD.IMAGE, {
      method: "POST",
      body: formData,
      headers: {} as Record<string, string>, // 讓瀏覽器自動設置 Content-Type
    });
  },

  // 刪除檔案
  deleteFile: async (filename: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(API_ENDPOINTS.UPLOAD.DELETE(filename), {
      method: "DELETE",
    });
  },
};

// 健康檢查API
export const healthAPI = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    return apiRequest<{ status: string; timestamp: string }>(API_ENDPOINTS.SYSTEM.HEALTH);
  },
};

// 系統監控 API
export const systemAPI = {
  // 獲取完整系統狀態
  getStatus: async (): Promise<SystemStatus> => {
    return apiRequest<SystemStatus>('/system/status');
  },

  // 測試 API 端點連接
  testEndpoint: async (endpoint: string): Promise<EndpointTest> => {
    const startTime = performance.now();

    try {
      const response = await unifiedFetch(endpoint, {
        method: 'GET',
      });

      const latency = Math.round(performance.now() - startTime);

      return {
        endpoint,
        status: response.ok ? 'success' : 'error',
        latency,
        statusCode: response.status,
      };
    } catch (error: unknown) {
      const latency = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        endpoint,
        status: 'error',
        latency,
        error: errorMessage,
      };
    }
  },

  // 批量測試多個端點
  testEndpoints: async (endpoints: string[]): Promise<EndpointTest[]> => {
    return Promise.all(endpoints.map(ep => systemAPI.testEndpoint(ep)));
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
  technologyTag: technologyTagAPI,
  blogCategory: blogCategoryAPI,
  stats: statsAPI,
  upload: uploadAPI,
  health: healthAPI,
  system: systemAPI,
};
