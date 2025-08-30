import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { API_ENDPOINTS, unifiedFetch } from "@/services/api";

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  avatar?: string;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("token"));
  const isLoading = ref(false);
  const error = ref<AuthError | null>(null);
  const loginLoading = ref(false);
  const logoutLoading = ref(false);
  const checkAuthLoading = ref(false);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");
  const hasError = computed(() => !!error.value);

  const clearError = () => {
    error.value = null;
  };

  const setError = (err: AuthError) => {
    error.value = err;
  };

  const login = async (credentials: { email: string; password: string }) => {
    loginLoading.value = true;
    isLoading.value = true;
    clearError();

    try {
      const response = await unifiedFetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          code: `HTTP_${response.status}`,
          message: errorData.message || "Login failed",
          field: errorData.field,
        };
      }

      const data = await response.json();
      token.value = data.token;
      user.value = data.user;
      localStorage.setItem("token", data.token);

      return { success: true, user: data.user };
    } catch (err) {
      const catchError = err as { code?: string; message?: string; field?: string };
      const authError: AuthError = {
        code: catchError.code || "LOGIN_ERROR",
        message: catchError.message || "An unexpected error occurred",
        field: catchError.field,
      };
      setError(authError);
      return { success: false, error: authError };
    } finally {
      loginLoading.value = false;
      isLoading.value = false;
    }
  };

  const logout = async () => {
    logoutLoading.value = true;
    clearError();

    try {
      if (token.value) {
        await unifiedFetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: "POST",
        }).catch(() => {});
      }
    } catch (err) {
      console.warn("Logout API call failed:", err);
    } finally {
      user.value = null;
      token.value = null;
      localStorage.removeItem("token");
      logoutLoading.value = false;
    }
  };

  const checkAuth = async () => {
    if (!token.value) return false;

    checkAuthLoading.value = true;
    clearError();

    try {
      const response = await unifiedFetch(API_ENDPOINTS.AUTH.ME, {
        method: "GET",
      });

      if (!response.ok) {
        if (response.status === 401) {
          await logout();
          setError({
            code: "TOKEN_EXPIRED",
            message: "Your session has expired. Please log in again.",
          });
        } else {
          setError({
            code: `HTTP_${response.status}`,
            message: "Failed to verify authentication",
          });
        }
        return false;
      }

      user.value = await response.json();
      return true;
    } catch {
      setError({
        code: "NETWORK_ERROR",
        message: "Unable to verify authentication. Please check your connection.",
      });
      await logout();
      return false;
    } finally {
      checkAuthLoading.value = false;
    }
  };

  return {
    user,
    token,
    isLoading,
    error,
    loginLoading,
    logoutLoading,
    checkAuthLoading,
    isAuthenticated,
    isAdmin,
    hasError,
    login,
    logout,
    checkAuth,
    clearError,
    setError,
  };
});
