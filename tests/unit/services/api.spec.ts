/**
 * SUT Map
 * - module: '@/services/api'
 * - exports: { TokenManager, CacheManager, apiRequest, unifiedFetch, authAPI }
 * - public contracts: Token 存取/驗證/過期檢查、快取管理、API 請求函數、認證 API
 * - mocks: localStorage, Date.now, fetch, AbortController, setTimeout
 */

import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from "vitest";
import {
  TokenManager,
  CacheManager,
  authAPI,
  apiRequest,
  unifiedFetch,
  config,
} from "@/services/api";
import { flushAll } from "../../setup";

describe("TokenManager", () => {
  beforeEach(() => {
    // 清除 localStorage
    localStorage.clear();
    // 重置時間 mock
    vi.setSystemTime(new Date("2025-08-02T12:00:00Z"));
  });

  describe("setToken", () => {
    it("should store token with default expiry (24 hours)", () => {
      const token = "test-token-123";
      const tokenType = "Bearer";

      TokenManager.setToken(token, tokenType);

      expect(localStorage.getItem("adminToken")).toBe(token);
      expect(localStorage.getItem("tokenType")).toBe(tokenType);
      expect(localStorage.getItem("rememberMe")).toBe("false");

      // 驗證過期時間約為 24 小時後
      const expiry = parseInt(localStorage.getItem("tokenExpiry") || "0");
      const expectedExpiry = Date.now() + 24 * 60 * 60 * 1000;
      expect(expiry).toBeCloseTo(expectedExpiry, -4); // 允許 10 秒誤差
    });

    it("should store token with remember me (30 days)", () => {
      const token = "remember-token";

      TokenManager.setToken(token, "Bearer", undefined, true);

      expect(localStorage.getItem("rememberMe")).toBe("true");

      // 驗證過期時間約為 30 天後
      const expiry = parseInt(localStorage.getItem("tokenExpiry") || "0");
      const expectedExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
      expect(expiry).toBeCloseTo(expectedExpiry, -5); // 允許更大誤差
    });

    it("should store token with custom expiry", () => {
      const token = "custom-token";
      const customExpiresIn = 7200; // 2 小時（秒）

      TokenManager.setToken(token, "Bearer", customExpiresIn);

      const expiry = parseInt(localStorage.getItem("tokenExpiry") || "0");
      const expectedExpiry = Date.now() + customExpiresIn * 1000;
      expect(expiry).toBeCloseTo(expectedExpiry, -4);
    });

    it("should set last login time", () => {
      TokenManager.setToken("token", "Bearer");

      const lastLogin = parseInt(localStorage.getItem("lastLoginTime") || "0");
      expect(lastLogin).toBeCloseTo(Date.now(), -3);
    });
  });

  describe("getToken", () => {
    it("should return stored token", () => {
      localStorage.setItem("adminToken", "stored-token");

      expect(TokenManager.getToken()).toBe("stored-token");
    });

    it("should return null when no token stored", () => {
      expect(TokenManager.getToken()).toBeNull();
    });
  });

  describe("getTokenType", () => {
    it("should return stored token type", () => {
      localStorage.setItem("tokenType", "JWT");

      expect(TokenManager.getTokenType()).toBe("JWT");
    });

    it("should return default Bearer when no type stored", () => {
      expect(TokenManager.getTokenType()).toBe("Bearer");
    });
  });

  describe("isTokenExpired", () => {
    it("should return true when no expiry set", () => {
      expect(TokenManager.isTokenExpired()).toBe(true);
    });

    it("should return true when token expired", () => {
      // 設定已過期的時間戳（1 小時前）
      const pastTime = Date.now() - 60 * 60 * 1000;
      localStorage.setItem("tokenExpiry", pastTime.toString());

      expect(TokenManager.isTokenExpired()).toBe(true);
    });

    it("should return false when token not expired", () => {
      // 設定未來的時間戳（1 小時後）
      const futureTime = Date.now() + 60 * 60 * 1000;
      localStorage.setItem("tokenExpiry", futureTime.toString());

      expect(TokenManager.isTokenExpired()).toBe(false);
    });
  });

  describe("hasValidToken", () => {
    it("should return false when no token", () => {
      expect(TokenManager.hasValidToken()).toBe(false);
    });

    it("should return false when token expired", () => {
      localStorage.setItem("adminToken", "expired-token");
      const pastTime = Date.now() - 60 * 60 * 1000;
      localStorage.setItem("tokenExpiry", pastTime.toString());

      expect(TokenManager.hasValidToken()).toBe(false);
    });

    it("should return true when token valid", () => {
      localStorage.setItem("adminToken", "valid-token");
      const futureTime = Date.now() + 60 * 60 * 1000;
      localStorage.setItem("tokenExpiry", futureTime.toString());

      expect(TokenManager.hasValidToken()).toBe(true);
    });
  });

  describe("isRecentLogin", () => {
    it("should return false when no last login", () => {
      expect(TokenManager.isRecentLogin()).toBe(false);
    });

    it("should return false when login more than 24 hours ago", () => {
      const oldTime = Date.now() - 25 * 60 * 60 * 1000; // 25 小時前
      localStorage.setItem("lastLoginTime", oldTime.toString());

      expect(TokenManager.isRecentLogin()).toBe(false);
    });

    it("should return true when login within 24 hours", () => {
      const recentTime = Date.now() - 23 * 60 * 60 * 1000; // 23 小時前
      localStorage.setItem("lastLoginTime", recentTime.toString());

      expect(TokenManager.isRecentLogin()).toBe(true);
    });
  });

  describe("getRemainingTime", () => {
    it("should return 0 when no expiry", () => {
      expect(TokenManager.getRemainingTime()).toBe(0);
    });

    it("should return 0 when expired", () => {
      const pastTime = Date.now() - 60 * 60 * 1000;
      localStorage.setItem("tokenExpiry", pastTime.toString());

      expect(TokenManager.getRemainingTime()).toBe(0);
    });

    it("should return remaining minutes", () => {
      const futureTime = Date.now() + 2 * 60 * 60 * 1000; // 2 小時後
      localStorage.setItem("tokenExpiry", futureTime.toString());

      expect(TokenManager.getRemainingTime()).toBe(120); // 120 分鐘
    });
  });

  describe("clearToken", () => {
    it("should remove all token related data", () => {
      // 設定一些資料
      TokenManager.setToken("token", "Bearer", undefined, true);

      // 清除
      TokenManager.clearToken();

      // 驗證所有資料都被清除
      expect(localStorage.getItem("adminToken")).toBeNull();
      expect(localStorage.getItem("tokenType")).toBeNull();
      expect(localStorage.getItem("tokenExpiry")).toBeNull();
      expect(localStorage.getItem("rememberMe")).toBeNull();
      expect(localStorage.getItem("lastLoginTime")).toBeNull();
    });
  });

  describe("isRemembered", () => {
    it("should return false by default", () => {
      expect(TokenManager.isRemembered()).toBe(false);
    });

    it("should return true when remember me is set", () => {
      localStorage.setItem("rememberMe", "true");

      expect(TokenManager.isRemembered()).toBe(true);
    });

    it("should return false when remember me is false", () => {
      localStorage.setItem("rememberMe", "false");

      expect(TokenManager.isRemembered()).toBe(false);
    });
  });
});

describe("CacheManager", () => {
  beforeEach(() => {
    CacheManager.clear();
    vi.setSystemTime(new Date("2025-08-02T12:00:00Z"));
  });

  describe("set and get", () => {
    it("should store and retrieve data", () => {
      const testData = { message: "test data" };

      CacheManager.set("test-key", testData);

      expect(CacheManager.get("test-key")).toEqual(testData);
    });

    it("should return null for non-existent key", () => {
      expect(CacheManager.get("non-existent")).toBeNull();
    });

    it("should return null for expired data", () => {
      const testData = { message: "expired data" };

      CacheManager.set("test-key", testData, 1000); // 1 秒 TTL

      // 快進時間 2 秒
      vi.setSystemTime(new Date(Date.now() + 2000));

      expect(CacheManager.get("test-key")).toBeNull();
    });

    it("should return data within TTL", () => {
      const testData = { message: "valid data" };

      CacheManager.set("test-key", testData, 5000); // 5 秒 TTL

      // 快進時間 3 秒（仍在 TTL 內）
      vi.setSystemTime(new Date(Date.now() + 3000));

      expect(CacheManager.get("test-key")).toEqual(testData);
    });
  });

  describe("delete", () => {
    it("should remove specific key", () => {
      CacheManager.set("key1", "data1");
      CacheManager.set("key2", "data2");

      CacheManager.delete("key1");

      expect(CacheManager.get("key1")).toBeNull();
      expect(CacheManager.get("key2")).toBe("data2");
    });
  });

  describe("clear", () => {
    it("should remove all cached data", () => {
      CacheManager.set("key1", "data1");
      CacheManager.set("key2", "data2");

      CacheManager.clear();

      expect(CacheManager.get("key1")).toBeNull();
      expect(CacheManager.get("key2")).toBeNull();
    });
  });
});

// API 函數單元測試（使用 vi.spyOn(global, 'fetch')）
describe("apiRequest", () => {
  let fetchSpy: any;
  let consoleSpy: any;

  beforeEach(() => {
    // 只在需要時使用 fake timers
    fetchSpy = vi.spyOn(global, "fetch");
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    fetchSpy?.mockRestore();
    consoleSpy?.mockRestore();
  });

  describe("參數處理", () => {
    it("should construct correct URL with endpoint", async () => {
      const mockResponse = Response.json({ success: true });
      fetchSpy.mockResolvedValueOnce(mockResponse);

      await apiRequest("/test-endpoint");

      expect(fetchSpy).toHaveBeenCalledWith(
        `${config.API_BASE_URL}/test-endpoint`,
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("should merge headers correctly", async () => {
      const mockResponse = Response.json({ success: true });
      fetchSpy.mockResolvedValueOnce(mockResponse);

      await apiRequest("/test", {
        headers: { "Custom-Header": "test-value" },
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "Custom-Header": "test-value",
          }),
        }),
      );
    });

    it("should include auth headers when token exists", async () => {
      // 設定有效 token
      TokenManager.setToken("test-token", "Bearer");

      const mockResponse = Response.json({ success: true });
      fetchSpy.mockResolvedValueOnce(mockResponse);

      await apiRequest("/protected");

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        }),
      );
    });
  });

  describe("超時控制", () => {
    it("should abort request after timeout", async () => {
      vi.useFakeTimers(); // 只在這個測試使用

      const abortSpy = vi.fn();
      const mockAbortController = {
        abort: abortSpy,
        signal: { aborted: false, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      };
      vi.spyOn(window, "AbortController").mockImplementation(() => mockAbortController as any);

      // Mock fetch 延遲回應
      fetchSpy.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 15000)));

      const requestPromise = apiRequest("/slow-endpoint");

      // 快進 10 秒（超時時間）
      await vi.advanceTimersByTimeAsync(10000);

      expect(abortSpy).toHaveBeenCalled();
    });

    it("should handle AbortError correctly", async () => {
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";
      fetchSpy.mockRejectedValueOnce(abortError);

      await expect(apiRequest("/timeout-test")).rejects.toMatchObject({
        detail: "請求超時，請檢查網路連線",
        status: 408,
      });
    });
  });

  describe("重試機制", () => {
    it("should not retry on non-network errors", async () => {
      const mockResponse = new Response("{}", { status: 404 });
      fetchSpy.mockResolvedValueOnce(mockResponse);

      await expect(apiRequest("/not-found")).rejects.toMatchObject({
        detail: "請求的資源不存在",
        status: 404,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle network errors without retries in this test", async () => {
      const networkError = new TypeError("Failed to fetch");
      fetchSpy.mockRejectedValueOnce(networkError);

      await expect(apiRequest("/network-fail", {}, 0)).rejects.toMatchObject({
        detail: "Failed to fetch",
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("錯誤映射", () => {
    const errorTestCases = [
      { status: 401, expectedDetail: "認證已過期，請重新登入" },
      { status: 403, expectedDetail: "權限不足" },
      { status: 404, expectedDetail: "請求的資源不存在" },
      { status: 429, expectedDetail: "請求過於頻繁，請稍後再試" },
      { status: 500, expectedDetail: "伺服器錯誤，請稍後再試" },
    ];

    errorTestCases.forEach(({ status, expectedDetail }) => {
      it(`should handle ${status} status correctly`, async () => {
        const mockResponse = new Response("{}", { status });
        fetchSpy.mockResolvedValueOnce(mockResponse);

        await expect(apiRequest("/error-test")).rejects.toMatchObject({
          detail: expectedDetail,
          status,
        });
      });
    });

    it("should handle JSON parse errors", async () => {
      const mockResponse = new Response("invalid json", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
      fetchSpy.mockResolvedValueOnce(mockResponse);

      // 這個測試可能需要調整，取決於實際的錯誤處理邏輯
      await expect(apiRequest("/invalid-json")).rejects.toThrow();
    });

    it("should handle network errors (TypeError)", async () => {
      const networkError = new TypeError("Failed to fetch");
      fetchSpy.mockRejectedValueOnce(networkError);

      await expect(apiRequest("/network-fail", {}, 0)).rejects.toMatchObject({
        detail: "Failed to fetch",
      });
    });
  });

  describe("認證處理", () => {
    it("should clear token on 401 for non-login endpoints", async () => {
      TokenManager.setToken("expired-token");
      const mockResponse = new Response("{}", { status: 401 });
      fetchSpy.mockResolvedValueOnce(mockResponse);

      await expect(apiRequest("/protected-resource")).rejects.toMatchObject({
        status: 401,
      });

      expect(TokenManager.getToken()).toBeNull();
    });

    it("should not clear token on 401 for login endpoint", async () => {
      TokenManager.setToken("test-token");
      const mockResponse = new Response("{}", { status: 401 });
      fetchSpy.mockResolvedValueOnce(mockResponse);

      await expect(apiRequest("/auth/login", {}, 3, true)).rejects.toThrow();

      // Token 不應被清除
      expect(TokenManager.getToken()).toBe("test-token");
    });
  });
});

describe("unifiedFetch", () => {
  let fetchSpy: any;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  it("should call fetch with correct parameters", async () => {
    const mockResponse = Response.json({ data: "test" });
    fetchSpy.mockResolvedValueOnce(mockResponse);

    const result = await unifiedFetch("/test-endpoint");

    expect(fetchSpy).toHaveBeenCalledWith(
      "/test-endpoint",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(result).toBe(mockResponse);
  });

  it("should merge options correctly", async () => {
    const mockResponse = Response.json({ data: "test" });
    fetchSpy.mockResolvedValueOnce(mockResponse);

    await unifiedFetch("/test", {
      method: "POST",
      body: JSON.stringify({ test: "data" }),
      headers: { Custom: "header" },
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/test",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ test: "data" }),
        headers: expect.objectContaining({
          Custom: "header",
        }),
      }),
    );
  });
});
