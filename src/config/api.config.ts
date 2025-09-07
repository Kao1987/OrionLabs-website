/**
 * API 配置管理中心
 * 統一管理所有 API 相關的配置和端點
 */

// 開發環境預設值
export const DEV_DEFAULTS = {
  API_URL: "http://161.33.209.198:8000", // 更新為新的後端地址
  CONTACT_API_URL: "http://localhost:3002",
  BACKEND_PORT: 8000,
  FRONTEND_PORT: 5173,
};

// 生產環境配置
export const PROD_DEFAULTS = {
  API_URL: "http://161.33.209.198:8000", // 已部署的後端API
  CONTACT_API_URL: "http://161.33.209.198:8000", // 聯絡表單使用同一個API
  BACKEND_PORT: 8000,
  FRONTEND_PORT: 80,
};

// 當前環境配置
const isDev = import.meta.env.DEV;
const defaults = isDev ? DEV_DEFAULTS : PROD_DEFAULTS;

// 最終配置
export const API_CONFIG = {
  // 基礎 URL
  BASE_URL: import.meta.env.VITE_API_URL ?? defaults.API_URL,
  CONTACT_URL: import.meta.env.VITE_CONTACT_API_URL ?? defaults.CONTACT_API_URL,

  // 環境信息
  IS_DEV: isDev,
  IS_PROD: !isDev,

  // 請求配置
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT ?? "10000"),
  MAX_RETRIES: parseInt(import.meta.env.VITE_API_MAX_RETRIES ?? "3"),
  RETRY_DELAY: parseInt(import.meta.env.VITE_API_RETRY_DELAY ?? "1000"),

  // 調試配置
  DEBUG: import.meta.env.VITE_DEBUG === "true" || isDev,

  // 版本信息
  VERSION: import.meta.env.VITE_APP_VERSION ?? "1.0.0",
};

// API 端點配置 - 更新為 v1 API 結構
export const API_ENDPOINTS = {
  // 認證相關
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    LOGOUT: "/api/v1/auth/logout",
    REFRESH: "/api/v1/auth/refresh",
    ME: "/api/v1/auth/me",
  },

  // 部落格相關
  BLOG: {
    POSTS: "/api/v1/blog/",
    POST: (id: string | number) => `/api/v1/blog/${id}`,
    PUBLIC: "/api/v1/blog/public",
    PUBLIC_POST: (id: string | number) => `/api/v1/blog/public/${id}`,
    CATEGORIES: "/api/v1/blog/categories",
    TAGS: "/api/v1/blog/tags",
    POPULAR_TAGS: "/api/v1/blog/tags/popular",
    SEARCH: "/api/v1/blog/search",
    LIKE_POST: (id: string | number) => `/api/v1/blog/${id}/like`,
  },

  // 作品集相關
  PORTFOLIO: {
    ITEMS: "/api/v1/blog/portfolio",
    ITEM: (id: string | number) => `/api/v1/blog/portfolio/${id}`,
    PUBLIC: "/api/v1/blog/portfolio/public",
    PUBLIC_ITEM: (id: string | number) => `/api/v1/blog/portfolio/public/${id}`,
    CATEGORIES: "/api/v1/blog/portfolio/categories",
    TECHNOLOGIES: "/api/v1/blog/portfolio/technologies",
  },

  // 留言相關
  MESSAGE: {
    MESSAGES: "/api/v1/blog/messages",
    MESSAGE: (id: string | number) => `/api/v1/blog/messages/${id}`,
    STATUS: (id: string | number) => `/api/v1/blog/messages/${id}/status`,
    MARK_READ: (id: string | number) => `/api/v1/blog/messages/${id}/mark-read`,
    UNREAD_COUNT: "/api/v1/blog/messages/stats/unread",
  },

  // 聯絡表單（使用留言API）
  CONTACT: {
    SUBMIT: "/api/v1/blog/messages",
  },

  // 統計相關
  STATS: {
    OVERVIEW: "/api/v1/blog/stats",
    DETAILED: "/api/v1/blog/stats/detailed",
    VISITORS: "/api/v1/blog/stats/visitors",
  },

  // 檔案上傳
  UPLOAD: {
    IMAGE: "/api/v1/upload/image",
    FILE: "/api/v1/upload/file",
    DELETE: (filename: string) => `/api/v1/upload/${filename}`,
  },

  // 系統相關
  SYSTEM: {
    HEALTH: "/health",
    DATABASE: "/health/database",
  },
};

// API 錯誤代碼配置
export const API_ERROR_CODES = {
  // 網路錯誤
  NETWORK_ERROR: 0,

  // HTTP 狀態碼
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 408,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,

  // 自定義錯誤
  AUTH_EXPIRED: "AUTH_EXPIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  VALIDATION_ERROR: "VALIDATION_ERROR",
};

// 預設錯誤訊息
export const DEFAULT_ERROR_MESSAGES = {
  [API_ERROR_CODES.NETWORK_ERROR]: "無法連接到伺服器，請檢查網路連線",
  [API_ERROR_CODES.UNAUTHORIZED]: "認證失敗，請重新登入",
  [API_ERROR_CODES.FORBIDDEN]: "權限不足",
  [API_ERROR_CODES.NOT_FOUND]: "請求的資源不存在",
  [API_ERROR_CODES.TIMEOUT]: "請求超時，請稍後再試",
  [API_ERROR_CODES.TOO_MANY_REQUESTS]: "請求過於頻繁，請稍後再試",
  [API_ERROR_CODES.INTERNAL_ERROR]: "伺服器內部錯誤",
  [API_ERROR_CODES.BAD_GATEWAY]: "伺服器連線錯誤",
  [API_ERROR_CODES.SERVICE_UNAVAILABLE]: "服務暫時不可用",
  [API_ERROR_CODES.AUTH_EXPIRED]: "認證已過期，請重新登入",
  [API_ERROR_CODES.INVALID_CREDENTIALS]: "帳號或密碼錯誤",
  [API_ERROR_CODES.VALIDATION_ERROR]: "輸入資料有誤",
};

// 日誌配置
export const LOG_CONFIG = {
  ENABLE_API_LOGS: API_CONFIG.DEBUG,
  ENABLE_ERROR_LOGS: true,
  ENABLE_NETWORK_LOGS: API_CONFIG.DEBUG,
  LOG_LEVEL: API_CONFIG.IS_DEV ? "debug" : "error",
};
