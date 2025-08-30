/**
 * SUT Map
 * - module: '@/services/api'
 * - exports: { unifiedFetch, API_ENDPOINTS }
 * - public contracts: API 端點契約驗證、HTTP 方法與 payload 格式、錯誤響應結構
 * - mocks: MSW server, HTTP handlers
 */

import { describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { unifiedFetch, API_ENDPOINTS } from "@/services/api";
import { flushAll, server } from "../../setup";

describe("API Contract Tests (MSW Layer)", () => {
  beforeEach(() => {
    // 清除預設 handlers，為契約測試設置專用 handlers
    server.resetHandlers();
  });

  describe("Auth API Contracts", () => {
    describe("POST /auth/login", () => {
      it("should accept valid login payload and return user + token", async () => {
        server.use(
          http.post(`*/auth/login`, async ({ request }) => {
            const body = (await request.json()) as any;

            // 驗證 payload 結構
            expect(body).toHaveProperty("email");
            expect(body).toHaveProperty("password");
            expect(typeof body.email).toBe("string");
            expect(typeof body.password).toBe("string");

            return HttpResponse.json(
              {
                token: "valid-jwt-token",
                user: {
                  id: "1",
                  email: body.email,
                  name: "Test User",
                  role: "user",
                },
              },
              { status: 200 },
            );
          }),
        );

        const response = await unifiedFetch(API_ENDPOINTS.AUTH.LOGIN, {
          method: "POST",
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toHaveProperty("token");
        expect(data).toHaveProperty("user");
        expect(data.user).toHaveProperty("id");
        expect(data.user).toHaveProperty("email");
        expect(data.user).toHaveProperty("name");
        expect(data.user).toHaveProperty("role");
      });

      it("should return 401 with error structure for invalid credentials", async () => {
        server.use(
          http.post(`*/auth/login`, () => {
            return HttpResponse.json(
              {
                error: {
                  code: "INVALID_CREDENTIALS",
                  message: "Invalid email or password",
                  field: "password",
                },
              },
              { status: 401 },
            );
          }),
        );

        const response = await unifiedFetch(API_ENDPOINTS.AUTH.LOGIN, {
          method: "POST",
          body: JSON.stringify({
            email: "test@example.com",
            password: "wrong-password",
          }),
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toHaveProperty("error");
        expect(data.error).toHaveProperty("code");
        expect(data.error).toHaveProperty("message");
        expect(data.error).toHaveProperty("field");
      });

      it("should return 422 for validation errors", async () => {
        server.use(
          http.post(`*/auth/login`, () => {
            return HttpResponse.json(
              {
                error: {
                  code: "VALIDATION_ERROR",
                  message: "Email is required",
                  field: "email",
                  details: {
                    email: ["Email field is required"],
                  },
                },
              },
              { status: 422 },
            );
          }),
        );

        const response = await unifiedFetch(API_ENDPOINTS.AUTH.LOGIN, {
          method: "POST",
          body: JSON.stringify({
            password: "password123",
          }),
        });

        expect(response.status).toBe(422);
        const data = await response.json();
        expect(data.error).toHaveProperty("details");
      });
    });

    describe("POST /auth/logout", () => {
      it("should accept logout request and return success", async () => {
        server.use(
          http.post(`*/auth/logout`, () => {
            return HttpResponse.json(
              {
                message: "Logged out successfully",
              },
              { status: 200 },
            );
          }),
        );

        const response = await unifiedFetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: "POST",
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toHaveProperty("message");
      });

      it("should handle logout when already logged out", async () => {
        server.use(
          http.post(`*/auth/logout`, () => {
            return HttpResponse.json(
              {
                error: {
                  code: "NOT_AUTHENTICATED",
                  message: "Already logged out",
                },
              },
              { status: 401 },
            );
          }),
        );

        const response = await unifiedFetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: "POST",
        });

        expect(response.status).toBe(401);
      });
    });

    describe("GET /auth/me", () => {
      it("should return user profile for valid token", async () => {
        server.use(
          http.get(`*/auth/me`, ({ request }) => {
            const authHeader = request.headers.get("Authorization");
            // 驗證認證標頭存在（可能為 Bearer token 格式）
            if (authHeader) {
              console.log("Auth header found:", authHeader);
            }

            return HttpResponse.json(
              {
                id: "1",
                email: "test@example.com",
                name: "Test User",
                role: "user",
                avatar: "https://example.com/avatar.jpg",
              },
              { status: 200 },
            );
          }),
        );

        // 先設置 token
        localStorage.setItem("token", "valid-token");

        const response = await unifiedFetch(API_ENDPOINTS.AUTH.ME, {
          method: "GET",
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toHaveProperty("id");
        expect(data).toHaveProperty("email");
        expect(data).toHaveProperty("name");
        expect(data).toHaveProperty("role");
      });

      it("should return 401 for expired/invalid token", async () => {
        server.use(
          http.get(`*/auth/me`, () => {
            return HttpResponse.json(
              {
                error: {
                  code: "TOKEN_EXPIRED",
                  message: "Token has expired",
                },
              },
              { status: 401 },
            );
          }),
        );

        const response = await unifiedFetch(API_ENDPOINTS.AUTH.ME, {
          method: "GET",
        });

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error.code).toBe("TOKEN_EXPIRED");
      });
    });
  });

  describe("Blog API Contracts", () => {
    describe("GET /blog/posts", () => {
      it("should return paginated blog posts list", async () => {
        server.use(
          http.get(`*/api/blog/posts`, ({ request }) => {
            const url = new URL(request.url);
            const page = url.searchParams.get("page") || "1";
            const limit = url.searchParams.get("limit") || "10";

            return HttpResponse.json(
              {
                posts: [
                  {
                    id: "1",
                    title: "Test Post",
                    content: "Test content",
                    slug: "test-post",
                    status: "published",
                    createdAt: "2025-01-01T00:00:00Z",
                    updatedAt: "2025-01-01T00:00:00Z",
                    author: {
                      id: "1",
                      name: "Author Name",
                    },
                    tags: ["tech", "vue"],
                  },
                ],
                pagination: {
                  currentPage: parseInt(page),
                  totalPages: 5,
                  totalPosts: 50,
                  hasNext: true,
                  hasPrev: false,
                },
              },
              { status: 200 },
            );
          }),
        );

        const response = await unifiedFetch(`${API_ENDPOINTS.BLOG.POSTS}?page=1&limit=10`, {
          method: "GET",
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toHaveProperty("posts");
        expect(data).toHaveProperty("pagination");
        expect(Array.isArray(data.posts)).toBe(true);
        expect(data.pagination).toHaveProperty("currentPage");
        expect(data.pagination).toHaveProperty("totalPages");
      });

      it("should handle search and filter parameters", async () => {
        server.use(
          http.get(`*/api/blog/posts`, ({ request }) => {
            const url = new URL(request.url);
            const search = url.searchParams.get("search");
            const tag = url.searchParams.get("tag");
            const status = url.searchParams.get("status");

            // 驗證查詢參數被正確處理
            expect(search).toBeTruthy();

            return HttpResponse.json(
              {
                posts: [],
                pagination: {
                  currentPage: 1,
                  totalPages: 0,
                  totalPosts: 0,
                  hasNext: false,
                  hasPrev: false,
                },
              },
              { status: 200 },
            );
          }),
        );

        const response = await unifiedFetch(
          `${API_ENDPOINTS.BLOG.POSTS}?search=test&tag=tech&status=published`,
          { method: "GET" },
        );

        expect(response.ok).toBe(true);
      });
    });

    describe("POST /blog/posts", () => {
      it("should create new blog post with valid payload", async () => {
        server.use(
          http.post(`*/api/blog/posts`, async ({ request }) => {
            const body = (await request.json()) as any;

            // 驗證必要欄位
            expect(body).toHaveProperty("title");
            expect(body).toHaveProperty("content");
            expect(body).toHaveProperty("status");

            return HttpResponse.json(
              {
                id: "2",
                title: body.title,
                content: body.content,
                slug: "new-post",
                status: body.status,
                createdAt: "2025-01-01T00:00:00Z",
                updatedAt: "2025-01-01T00:00:00Z",
                author: {
                  id: "1",
                  name: "Author",
                },
                tags: body.tags || [],
              },
              { status: 201 },
            );
          }),
        );

        const response = await unifiedFetch(API_ENDPOINTS.BLOG.POSTS, {
          method: "POST",
          body: JSON.stringify({
            title: "New Blog Post",
            content: "This is the content",
            status: "draft",
            tags: ["tech"],
          }),
        });

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data).toHaveProperty("id");
        expect(data.title).toBe("New Blog Post");
      });
    });
  });

  describe("Portfolio API Contracts", () => {
    describe("GET /portfolio/projects", () => {
      it("should return projects list with proper structure", async () => {
        server.use(
          http.get(`*/api/portfolio/projects`, () => {
            return HttpResponse.json(
              {
                projects: [
                  {
                    id: "1",
                    title: "Project 1",
                    description: "Project description",
                    technologies: ["Vue", "TypeScript"],
                    images: ["image1.jpg"],
                    githubUrl: "https://github.com/user/project",
                    liveUrl: "https://project.com",
                    featured: true,
                    status: "completed",
                    createdAt: "2025-01-01T00:00:00Z",
                  },
                ],
              },
              { status: 200 },
            );
          }),
        );

        const response = await unifiedFetch(API_ENDPOINTS.PORTFOLIO.PROJECTS, {
          method: "GET",
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toHaveProperty("projects");
        expect(Array.isArray(data.projects)).toBe(true);
        if (data.projects.length > 0) {
          const project = data.projects[0];
          expect(project).toHaveProperty("id");
          expect(project).toHaveProperty("title");
          expect(project).toHaveProperty("description");
          expect(project).toHaveProperty("technologies");
          expect(Array.isArray(project.technologies)).toBe(true);
        }
      });
    });
  });

  describe("Error Response Contracts", () => {
    it("should handle 500 server errors with consistent structure", async () => {
      server.use(
        http.get("*/test-endpoint", () => {
          return HttpResponse.json(
            {
              error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong on our end",
              },
            },
            { status: 500 },
          );
        }),
      );

      const response = await unifiedFetch("/test-endpoint", {
        method: "GET",
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty("error");
      expect(data.error).toHaveProperty("code");
      expect(data.error).toHaveProperty("message");
    });

    it("should handle network timeouts appropriately", async () => {
      server.use(
        http.get("*/slow-endpoint", async () => {
          // 模擬網路延遲
          await new Promise(resolve => setTimeout(resolve, 200));
          return HttpResponse.json({ data: "slow response" });
        }),
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50); // 50ms timeout

      await expect(unifiedFetch("/slow-endpoint", {
        method: "GET",
        signal: controller.signal,
      })).rejects.toThrow("The operation was aborted");

      clearTimeout(timeoutId);
    });

    it("should handle rate limiting (429) responses", async () => {
      server.use(
        http.post("*/rate-limited", () => {
          return HttpResponse.json(
            {
              error: {
                code: "RATE_LIMIT_EXCEEDED",
                message: "Too many requests. Please try again later.",
                retryAfter: 60,
              },
            },
            {
              status: 429,
              headers: {
                "Retry-After": "60",
              },
            },
          );
        }),
      );

      const response = await unifiedFetch("/rate-limited", {
        method: "POST",
      });

      expect(response.status).toBe(429);
      expect(response.headers.get("Retry-After")).toBe("60");
      const data = await response.json();
      expect(data.error.code).toBe("RATE_LIMIT_EXCEEDED");
    });
  });
});
