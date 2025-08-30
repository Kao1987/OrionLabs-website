/**
 * SUT Map
 * - module: '@/stores/auth'
 * - exports: { useAuthStore }
 * - public contracts: 認證狀態管理、登入/登出 actions、computed getters、錯誤處理
 * - mocks: unifiedFetch, localStorage, nextTick
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { nextTick } from "vue";
import { useAuthStore } from "@/stores/auth";
import { flushAll } from "../../setup";

// Mock unifiedFetch
vi.mock("@/services/api", () => ({
  unifiedFetch: vi.fn(),
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      ME: "/auth/me",
    },
  },
}));

import { unifiedFetch } from "@/services/api";

describe("useAuthStore", () => {
  let authStore: ReturnType<typeof useAuthStore>;
  const mockUnifiedFetch = unifiedFetch as any;

  beforeEach(() => {
    // 設置新的 Pinia 實例（setup.ts 已處理）
    authStore = useAuthStore();

    // 清除所有 mocks
    vi.clearAllMocks();

    // 清除 localStorage
    localStorage.clear();
  });

  describe("初始狀態", () => {
    it("should have correct initial state", () => {
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      expect(authStore.isLoading).toBe(false);
      expect(authStore.error).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.isAdmin).toBe(false);
      expect(authStore.hasError).toBe(false);
    });

    it("should load token from localStorage on initialization", () => {
      localStorage.setItem("token", "existing-token");

      // 重新創建 store 實例
      setActivePinia(createPinia());
      const newAuthStore = useAuthStore();

      expect(newAuthStore.token).toBe("existing-token");
    });
  });

  describe("computed getters (按您的規範：輸入→輸出驗證)", () => {
    it("isAuthenticated should return true when both token and user exist", async () => {
      // 輸入：設置 token 和 user
      authStore.token = "valid-token";
      authStore.user = { id: "1", email: "test@example.com", name: "Test User", role: "user" };

      // 等待反應性更新
      await nextTick();

      // 輸出：驗證 computed 結果
      expect(authStore.isAuthenticated).toBe(true);
    });

    it("isAuthenticated should return false when token missing", async () => {
      authStore.token = null;
      authStore.user = { id: "1", email: "test@example.com", name: "Test User", role: "user" };

      await nextTick();

      expect(authStore.isAuthenticated).toBe(false);
    });

    it("isAuthenticated should return false when user missing", async () => {
      authStore.token = "valid-token";
      authStore.user = null;

      await nextTick();

      expect(authStore.isAuthenticated).toBe(false);
    });

    it("isAdmin should return true for admin role", async () => {
      authStore.user = { id: "1", email: "admin@example.com", name: "Admin", role: "admin" };

      await nextTick();

      expect(authStore.isAdmin).toBe(true);
    });

    it("isAdmin should return false for non-admin role", async () => {
      authStore.user = { id: "1", email: "user@example.com", name: "User", role: "user" };

      await nextTick();

      expect(authStore.isAdmin).toBe(false);
    });

    it("hasError should return true when error exists", async () => {
      authStore.setError({ code: "TEST_ERROR", message: "Test error" });

      await nextTick();

      expect(authStore.hasError).toBe(true);
    });
  });

  describe("錯誤處理 actions", () => {
    it("setError should set error state", () => {
      const error = { code: "LOGIN_ERROR", message: "Login failed" };

      authStore.setError(error);

      expect(authStore.error).toEqual(error);
    });

    it("clearError should clear error state", () => {
      authStore.setError({ code: "TEST_ERROR", message: "Test" });

      authStore.clearError();

      expect(authStore.error).toBeNull();
    });
  });

  describe("login action (按您的規範：直接 await)", () => {
    it("should login successfully", async () => {
      const credentials = { email: "test@example.com", password: "password123" };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          token: "new-token",
          user: { id: "1", email: "test@example.com", name: "Test User", role: "user" },
        }),
      };
      mockUnifiedFetch.mockResolvedValueOnce(mockResponse);

      const result = await authStore.login(credentials);

      expect(mockUnifiedFetch).toHaveBeenCalledWith("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      expect(result.success).toBe(true);
      expect(authStore.user).toEqual({
        id: "1",
        email: "test@example.com",
        name: "Test User",
        role: "user",
      });
      expect(authStore.token).toBe("new-token");
      expect(localStorage.getItem("token")).toBe("new-token");
      expect(authStore.loginLoading).toBe(false);
    });

    it("should handle login failure", async () => {
      const credentials = { email: "test@example.com", password: "wrong" };
      const mockResponse = {
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({
          message: "Invalid credentials",
          field: "password",
        }),
      };
      mockUnifiedFetch.mockResolvedValueOnce(mockResponse);

      const result = await authStore.login(credentials);

      expect(result.success).toBe(false);
      expect(authStore.error).toEqual({
        code: "HTTP_401",
        message: "Invalid credentials",
        field: "password",
      });
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
    });

    it("should handle network errors during login", async () => {
      const credentials = { email: "test@example.com", password: "password123" };
      const networkError = new Error("Network error");
      mockUnifiedFetch.mockRejectedValueOnce(networkError);

      const result = await authStore.login(credentials);

      expect(result.success).toBe(false);
      expect(authStore.error).toEqual({
        code: "LOGIN_ERROR",
        message: "Network error",
      });
    });

    it("should set loading states during login", async () => {
      const credentials = { email: "test@example.com", password: "password123" };
      let loginPromiseResolve: any;
      const loginPromise = new Promise((resolve) => {
        loginPromiseResolve = resolve;
      });

      mockUnifiedFetch.mockReturnValueOnce(loginPromise);

      // 開始登入
      const loginCall = authStore.login(credentials);

      // 檢查 loading 狀態
      expect(authStore.loginLoading).toBe(true);
      expect(authStore.isLoading).toBe(true);

      // 完成登入
      loginPromiseResolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: "token",
            user: { id: "1", email: "test@example.com", name: "Test", role: "user" },
          }),
      });

      await loginCall;

      expect(authStore.loginLoading).toBe(false);
      expect(authStore.isLoading).toBe(false);
    });
  });

  describe("logout action", () => {
    it("should logout successfully", async () => {
      // 設置初始認證狀態
      authStore.token = "existing-token";
      authStore.user = { id: "1", email: "test@example.com", name: "Test", role: "user" };
      localStorage.setItem("token", "existing-token");

      const mockResponse = { ok: true };
      mockUnifiedFetch.mockResolvedValueOnce(mockResponse);

      await authStore.logout();

      expect(mockUnifiedFetch).toHaveBeenCalledWith("/auth/logout", {
        method: "POST",
      });
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      expect(localStorage.getItem("token")).toBeNull();
      expect(authStore.logoutLoading).toBe(false);
    });

    it("should clear local state even if logout API fails", async () => {
      authStore.token = "existing-token";
      authStore.user = { id: "1", email: "test@example.com", name: "Test", role: "user" };
      localStorage.setItem("token", "existing-token");

      mockUnifiedFetch.mockRejectedValueOnce(new Error("API Error"));

      await authStore.logout();

      // 即使 API 失敗，本地狀態也應被清除
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      expect(localStorage.getItem("token")).toBeNull();
    });
  });

  describe("checkAuth action", () => {
    it("should return false when no token", async () => {
      authStore.token = null;

      const result = await authStore.checkAuth();

      expect(result).toBe(false);
      expect(mockUnifiedFetch).not.toHaveBeenCalled();
    });

    it("should verify token and set user on success", async () => {
      authStore.token = "valid-token";
      const mockUser = { id: "1", email: "test@example.com", name: "Test", role: "user" };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockUser),
      };
      mockUnifiedFetch.mockResolvedValueOnce(mockResponse);

      const result = await authStore.checkAuth();

      expect(mockUnifiedFetch).toHaveBeenCalledWith("/auth/me", {
        method: "GET",
      });
      expect(result).toBe(true);
      expect(authStore.user).toEqual(mockUser);
    });

    it("should handle 401 error and clear token", async () => {
      authStore.token = "expired-token";
      const mockResponse = { ok: false, status: 401 };
      mockUnifiedFetch.mockResolvedValueOnce(mockResponse);

      const result = await authStore.checkAuth();

      expect(result).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      expect(authStore.error).toEqual({
        code: "TOKEN_EXPIRED",
        message: "Your session has expired. Please log in again.",
      });
    });

    it("should handle network errors and clear state", async () => {
      authStore.token = "valid-token";
      authStore.user = { id: "1", email: "test@example.com", name: "Test", role: "user" };
      mockUnifiedFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await authStore.checkAuth();

      expect(result).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      // Error is cleared by logout() call, which is the actual behavior
      expect(authStore.error).toBeNull();
    });
  });

  describe("反應性依賴 (§R-2 規範遵循)", () => {
    it("computed values should update when dependencies change", async () => {
      // 初始狀態檢查
      expect(authStore.isAuthenticated).toBe(false);

      // 更新依賴 (ref/reactive 來源)
      authStore.token = "test-token";
      authStore.user = { id: "1", email: "test@example.com", name: "Test", role: "admin" };

      // 等待反應性更新
      await nextTick();

      // 驗證 computed 重算結果
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.isAdmin).toBe(true);

      // 再次更新依賴
      authStore.user.role = "user";
      await nextTick();

      expect(authStore.isAdmin).toBe(false);
    });
  });
});
