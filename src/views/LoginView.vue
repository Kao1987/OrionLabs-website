<template>
  <section class="login-section container py-5">
    <div class="login-section_form-box mx-auto orion-card" style="max-width: 400px">
      <!-- 檢查登入狀態的載入畫面 -->
      <div v-if="checkingAuth" class="text-center py-4">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">檢查登入狀態中...</span>
        </div>
        <p class="text-muted mb-0">檢查登入狀態中...</p>
      </div>

      <!-- 登入表單 -->
      <div v-else>
        <h2 class="mb-4 text-center orion-text-primary">管理員登入</h2>

        <!-- 錯誤訊息 -->
        <div v-if="error" class="alert alert-danger mb-3" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <form @submit.prevent="onLogin">
          <div class="mb-3">
            <label for="username" class="form-label">帳號</label>
            <input
              v-model="username"
              id="username"
              class="orion-form-control"
              :class="{ 'is-invalid': validationErrors.username }"
              required
              autocomplete="username"
              :disabled="loading"
            />
            <div v-if="validationErrors.username" class="invalid-feedback">
              {{ validationErrors.username }}
            </div>
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">密碼</label>
            <input
              v-model="password"
              id="password"
              type="password"
              class="orion-form-control"
              :class="{ 'is-invalid': validationErrors.password }"
              required
              autocomplete="current-password"
              :disabled="loading"
            />
            <div v-if="validationErrors.password" class="invalid-feedback">
              {{ validationErrors.password }}
            </div>
          </div>

          <!-- 記住我選項 -->
          <div class="mb-3 form-check">
            <input
              v-model="rememberMe"
              id="rememberMe"
              type="checkbox"
              class="form-check-input"
              :disabled="loading"
            />
            <label for="rememberMe" class="form-check-label text-muted">
              <i class="bi bi-clock-history me-1"></i>
              記住我的登入狀態 (30天)
            </label>
          </div>

          <button
            type="submit"
            class="orion-btn orion-btn-primary w-100"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="bi bi-box-arrow-in-right me-2"></i>
            {{ loading ? "登入中..." : "登入" }}
          </button>
        </form>

        <!-- 開發環境提示 -->
        <div v-if="isDevelopment" class="mt-3 text-center">
          <small class="text-muted"> 開發環境 - 如需測試帳號請聯繫管理員 </small>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authAPI, TokenManager } from "@/services/api";
import { useUIStore } from "@/stores/ui";

const username = ref("");
const password = ref("");
const rememberMe = ref(false);
const loading = ref(false);
const error = ref("");
const validationErrors = ref<Record<string, string>>({});
const checkingAuth = ref(true); // 新增：檢查認證狀態

const router = useRouter();
const uiStore = useUIStore();

const isDevelopment = import.meta.env.DEV;

const isFormValid = computed(() => {
  return (
    username.value.trim() &&
    password.value.trim() &&
    Object.keys(validationErrors.value).length === 0
  );
});

// 檢查是否已經登入
onMounted(async () => {
  checkingAuth.value = true;

  try {
    const authStatus = await authAPI.checkAuthStatus();

    if (authStatus.isAuthenticated) {
      // 已經登入，顯示友好訊息並導向管理後台
      const remainingTime = TokenManager.getRemainingTime();
      const isRemembered = TokenManager.isRemembered();

      let message = "您已經登入，正在導向管理後台...";
      if (remainingTime > 0) {
        const timeText =
          remainingTime > 60
            ? `${Math.floor(remainingTime / 60)}小時${remainingTime % 60}分鐘`
            : `${remainingTime}分鐘`;
        message += `登入狀態還有${timeText}有效`;
      }

      uiStore.showSuccess(isRemembered ? "歡迎回來！" : "登入狀態有效", message);
      await router.push("/admin");
      return;
    } else {
      // 檢查是否最近登入過，自動勾選記住我
      if (TokenManager.isRecentLogin()) {
        rememberMe.value = true;
      }
    }
  } catch {
      // Ignore error
    // 檢查失敗，繼續顯示登入表單
    console.warn("檢查登入狀態失敗:", error);
  } finally {
    checkingAuth.value = false;
  }
});

const validateForm = () => {
  validationErrors.value = {};

  if (!username.value.trim()) {
    validationErrors.value.username = "請輸入帳號";
  }

  if (!password.value.trim()) {
    validationErrors.value.password = "請輸入密碼";
  } else if (password.value.length < 6) {
    validationErrors.value.password = "密碼至少需要6個字元";
  }

  return Object.keys(validationErrors.value).length === 0;
};

const onLogin = async () => {
  if (!validateForm()) return;

  loading.value = true;
  error.value = "";

  try {
    const result = await authAPI.login(username.value.trim(), password.value, rememberMe.value);

    // 額外儲存相容性 token（向後兼容）
    localStorage.setItem("token", result.access_token);

    const expireTime = rememberMe.value ? "30天" : "24小時";
    uiStore.showSuccess("登入成功", `歡迎回來！登入狀態將保持${expireTime}`);

    // 導向管理後台
    await router.push("/admin");
  } catch (err: unknown) {
    console.error("Login error:", err);

    // 處理不同類型的錯誤
    const errorObj = err as { status?: number; message?: string; detail?: string };
    if (errorObj.status === 401) {
      error.value = "帳號或密碼錯誤";
    } else if (errorObj.status === 429) {
      error.value = "登入嘗試過於頻繁，請稍後再試";
    } else if (errorObj.status === 0) {
      error.value = "無法連接到伺服器，請檢查網路連線";
    } else {
      error.value = errorObj.detail || errorObj.message || "登入失敗，請重試";
    }

    // 清空密碼欄位
    password.value = "";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, var(--orion-light-bg) 0%, var(--orion-white) 100%);
}

.login-section_form-box {
  background: var(--orion-white);
  border: 1px solid var(--orion-light);
  max-width: 400px;
}

.form-label {
  font-weight: var(--orion-font-weight-medium);
  color: var(--orion-text-primary);
  margin-bottom: 0.5rem;
}

.orion-form-control {
  width: 100%;
}

.orion-form-control:focus {
  border-color: var(--orion-accent);
  box-shadow: 0 0 0 0.25rem rgba(52, 152, 219, 0.1);
}

.is-invalid {
  border-color: var(--orion-danger);
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--orion-danger);
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* RWD */
@media (max-width: 576px) {
  .login-section {
    padding: 2rem 1rem;
  }

  .login-section_form-box {
    margin: 0 auto;
    max-width: 100%;
  }
}

/* === Dark Mode Support === */
[data-theme="dark"] .text-muted {
  color: var(--color-text-secondary) !important;
}

[data-theme="dark"] .form-control {
  background: var(--color-bg-secondary);
  border-color: var(--color-border-primary);
  color: var(--color-text-primary);
}

[data-theme="dark"] .form-check-label {
  color: var(--color-text-secondary);
}
</style>
