<!-- ContactForm.vue - 改進的聯絡表單組件 -->
<template>
  <div class="contact-form">
    <form @submit.prevent="handleSubmit" novalidate class="contact-form__form">
      <!-- Honeypot field (隱藏式防機器人) -->
      <input
        v-model="formData.honeypot"
        type="text"
        name="website"
        class="contact-form__honeypot"
        tabindex="-1"
        autocomplete="off"
      />

      <!-- 成功訊息 -->
      <div v-if="submitSuccess" class="contact-form__alert contact-form__alert--success mb-4" role="alert">
        <i class="contact-form__alert-icon bi bi-check-circle"></i>
        <span class="contact-form__alert-message">{{ t("success") }}</span>
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="submitError" class="contact-form__alert contact-form__alert--danger mb-4" role="alert">
        <i class="contact-form__alert-icon bi bi-exclamation-triangle"></i>
        <span class="contact-form__alert-message">{{ submitError }}</span>
        <button
          v-if="canRetry"
          @click="retrySubmit"
          class="contact-form__retry-btn btn btn-sm btn-outline-danger"
          :disabled="isSubmitting"
        >
          {{ t("retry") }}
        </button>
      </div>

      <div class="row g-3">
        <!-- 姓名欄位 -->
        <div class="col-md-6 contact-form__field">
          <label for="name" class="form-label contact-form__label">
            {{ t("contact.form.name") }} <span class="contact-form__required">*</span>
          </label>
          <input
            type="text"
            class="form-control contact-form__input"
            id="name"
            v-model="formData.name"
            :class="{
              'is-invalid': errors.name,
              'is-valid': !errors.name && formData.name.trim().length > 0,
            }"
            @input="handleFieldInput('name')"
            @blur="validateField('name')"
            @focus="trackInteraction('name')"
            :placeholder="t('contact.form.namePlaceholder')"
            required
            autocomplete="name"
            :disabled="isSubmitting"
          />
          <div v-if="errors.name" class="invalid-feedback">
            {{ errors.name }}
          </div>
          <div v-else-if="formData.name.trim().length > 0" class="valid-feedback">
            <i class="bi bi-check-circle me-1"></i>
            {{ t("common.valid") }}
          </div>
        </div>

        <!-- 電子郵件欄位 -->
        <div class="col-md-6 contact-form__field">
          <label for="email" class="form-label contact-form__label">
            {{ t("contact.form.email") }} <span class="contact-form__required">*</span>
          </label>
          <input
            type="email"
            class="form-control contact-form__input"
            id="email"
            v-model="formData.email"
            :class="{
              'is-invalid': errors.email,
              'is-valid': !errors.email && formData.email.trim().length > 0,
            }"
            @input="handleFieldInput('email')"
            @blur="validateField('email')"
            @focus="trackInteraction('email')"
            :placeholder="t('contact.form.emailPlaceholder')"
            required
            autocomplete="email"
            :disabled="isSubmitting"
          />
          <div v-if="errors.email" class="invalid-feedback">
            {{ errors.email }}
          </div>
          <div
            v-else-if="formData.email.trim().length > 0 && isValidEmail(formData.email)"
            class="valid-feedback"
          >
            <i class="bi bi-check-circle me-1"></i>
            {{ t("common.valid") }}
          </div>
        </div>

        <!-- 主旨欄位 -->
        <div class="col-12 contact-form__field">
          <label for="subject" class="form-label contact-form__label">
            {{ t("contact.form.subject") }} <span class="contact-form__required">*</span>
          </label>
          <input
            type="text"
            class="form-control contact-form__input"
            id="subject"
            v-model="formData.subject"
            :class="{
              'is-invalid': errors.subject,
              'is-valid': !errors.subject && formData.subject.trim().length > 0,
            }"
            @input="handleFieldInput('subject')"
            @blur="validateField('subject')"
            @focus="trackInteraction('subject')"
            :placeholder="t('contact.form.subjectPlaceholder')"
            required
            :disabled="isSubmitting"
          />
          <div v-if="errors.subject" class="invalid-feedback">
            {{ errors.subject }}
          </div>
        </div>

        <!-- 訊息內容 -->
        <div class="col-12 contact-form__field">
          <label for="message" class="form-label contact-form__label">
            {{ t("contact.form.message") }} <span class="contact-form__required">*</span>
          </label>
          <textarea
            class="form-control contact-form__input contact-form__textarea"
            id="message"
            rows="5"
            v-model="formData.message"
            :class="{
              'is-invalid': errors.message,
              'is-valid': !errors.message && formData.message.trim().length > 0,
            }"
            @input="handleFieldInput('message')"
            @blur="validateField('message')"
            @focus="trackInteraction('message')"
            :placeholder="t('contact.form.messagePlaceholder')"
            required
            :disabled="isSubmitting"
            maxlength="2000"
          ></textarea>
          <div v-if="errors.message" class="invalid-feedback">
            {{ errors.message }}
          </div>
          <div class="form-text">
            {{ t("contact.form.messageCount", { current: formData.message.length, max: 2000 }) }}
          </div>
        </div>

        <!-- reCAPTCHA -->
        <div class="col-12">
          <div ref="recaptchaContainer" class="g-recaptcha"></div>
          <div v-if="errors.recaptcha" class="text-danger mt-2">
            <small>{{ errors.recaptcha }}</small>
          </div>
        </div>

        <!-- 隱私權同意 -->
        <div class="col-12">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              id="privacy"
              v-model="formData.privacy"
              :class="{ 'is-invalid': errors.privacy }"
              @change="validateField('privacy')"
              required
              :disabled="isSubmitting"
            />
            <label class="form-check-label" for="privacy">
              {{ t("contact.form.privacyPrefix") }}
              <router-link to="/privacy" class="text-decoration-none" target="_blank">
                {{ t("contact.form.privacyLink") }}
              </router-link>
              {{ t("contact.form.privacySuffix") }}
              <span class="text-danger">*</span>
            </label>
            <div v-if="errors.privacy" class="invalid-feedback d-block">
              {{ errors.privacy }}
            </div>
          </div>
        </div>

        <!-- 送出按鈕 -->
        <div class="col-12 contact-form__submit-wrapper">
          <button
            type="submit"
            class="btn btn-primary btn-lg contact-form__submit"
            :disabled="!canSubmit || isSubmitting"
          >
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm me-2"
              role="status"
            ></span>
            <i v-else class="bi bi-send me-2"></i>
            {{ isSubmitting ? t("contact.form.submitting") : t("contact.form.submit") }}
          </button>
        </div>
      </div>
    </form>

    <!-- 進度指示器 -->
    <div v-if="formProgress > 0 && formProgress < 100" class="contact-form__progress mt-4">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <small class="text-muted">{{ t("contact.form.progress") }}</small>
        <small class="text-muted">{{ formProgress }}%</small>
      </div>
      <div class="progress" style="height: 4px">
        <div class="progress-bar" :style="{ width: formProgress + '%' }" role="progressbar"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { messageAPI, type MessageCreate } from "@/services/api";

// 靜態文字 (未來可改為 i18n)
const texts = {
  success: "訊息已成功發送！我會盡快回覆您。",
  retry: "重試",
  name: "姓名",
  email: "電子郵件",
  subject: "主旨",
  message: "訊息內容",
  namePlaceholder: "請輸入您的姓名",
  emailPlaceholder: "請輸入您的電子郵件",
  subjectPlaceholder: "請輸入主旨",
  messagePlaceholder: "請輸入您想說的話...",
  messageCount: "已輸入 {current} / {max} 字元",
  privacyPrefix: "我已閱讀並同意",
  privacyLink: "隱私權政策",
  privacySuffix: "的相關條款",
  submitting: "發送中...",
  submit: "發送訊息",
  progress: "完成度",
  valid: "格式正確",
  errors: {
    nameRequired: "請輸入姓名",
    nameMin: "姓名至少需要 2 個字元",
    emailRequired: "請輸入電子郵件",
    emailInvalid: "請輸入有效的電子郵件格式",
    subjectRequired: "請輸入主旨",
    subjectMin: "主旨至少需要 5 個字元",
    messageRequired: "請輸入訊息內容",
    messageMin: "訊息內容至少需要 10 個字元",
    privacyRequired: "請同意隱私權政策",
    recaptchaRequired: "請完成人機驗證",
    recaptchaExpired: "人機驗證已過期，請重新驗證",
    submitFailed: "發送失敗，請稍後再試",
  },
};

// 文字替換函數
const t = (key: string, params?: Record<string, string | number>) => {
  const keys = key.split(".");
  let value: unknown = texts;

  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
  }

  if (typeof value === "string" && params) {
    return value.replace(/\{(\w+)\}/g, (match, key) => String(params[key] || match));
  }

  return typeof value === "string" ? value : key;
};

// 表單資料
const formData = ref({
  name: "",
  email: "",
  subject: "",
  message: "",
  privacy: false,
  honeypot: "", // Honeypot 欄位
});

// 錯誤狀態
const errors = ref<Record<string, string>>({});

// 提交狀態
const isSubmitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref("");
const canRetry = ref(false);

// reCAPTCHA
const recaptchaContainer = ref<HTMLElement>();
const recaptchaToken = ref("");

// 互動追蹤
const interactions = ref<Set<string>>(new Set());

// 表單進度計算
const formProgress = computed(() => {
  const fields = ["name", "email", "subject", "message"];
  const completedFields = fields.filter((field) => {
    const value = formData.value[field as keyof typeof formData.value];
    return typeof value === "string" && value.trim().length > 0;
  });
  const privacyWeight = formData.value.privacy ? 1 : 0;
  const recaptchaWeight = recaptchaToken.value ? 1 : 0;

  return Math.round(((completedFields.length + privacyWeight + recaptchaWeight) / 6) * 100);
});

// 驗證規則
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateField = (fieldName: string): boolean => {
  const value = formData.value[fieldName as keyof typeof formData.value];

  switch (fieldName) {
    case "name":
      if (!value || (typeof value === "string" && value.trim().length === 0)) {
        errors.value.name = t("contact.form.errors.nameRequired");
        return false;
      } else if (typeof value === "string" && value.trim().length < 2) {
        errors.value.name = t("contact.form.errors.nameMin");
        return false;
      }
      delete errors.value.name;
      return true;

    case "email":
      if (!value || (typeof value === "string" && value.trim().length === 0)) {
        errors.value.email = t("contact.form.errors.emailRequired");
        return false;
      } else if (typeof value === "string" && !isValidEmail(value)) {
        errors.value.email = t("contact.form.errors.emailInvalid");
        return false;
      }
      delete errors.value.email;
      return true;

    case "subject":
      if (!value || (typeof value === "string" && value.trim().length === 0)) {
        errors.value.subject = t("contact.form.errors.subjectRequired");
        return false;
      } else if (typeof value === "string" && value.trim().length < 5) {
        errors.value.subject = t("contact.form.errors.subjectMin");
        return false;
      }
      delete errors.value.subject;
      return true;

    case "message":
      if (!value || (typeof value === "string" && value.trim().length === 0)) {
        errors.value.message = t("contact.form.errors.messageRequired");
        return false;
      } else if (typeof value === "string" && value.trim().length < 10) {
        errors.value.message = t("contact.form.errors.messageMin");
        return false;
      }
      delete errors.value.message;
      return true;

    case "privacy":
      if (!value) {
        errors.value.privacy = t("contact.form.errors.privacyRequired");
        return false;
      }
      delete errors.value.privacy;
      return true;

    default:
      return true;
  }
};

// 欄位輸入處理
const handleFieldInput = (fieldName: string) => {
  // 清除該欄位的錯誤
  if (errors.value[fieldName]) {
    delete errors.value[fieldName];
  }

  // 即時驗證（僅在使用者已經互動過該欄位時）
  if (interactions.value.has(fieldName)) {
    validateField(fieldName);
  }
};

// 追蹤使用者互動
const trackInteraction = (fieldName: string) => {
  interactions.value.add(fieldName);
};

// 表單可否提交
const canSubmit = computed(() => {
  return (
    formData.value.name.trim().length > 0 &&
    formData.value.email.trim().length > 0 &&
    formData.value.subject.trim().length > 0 &&
    formData.value.message.trim().length > 0 &&
    formData.value.privacy &&
    recaptchaToken.value &&
    Object.keys(errors.value).length === 0 &&
    !isSubmitting.value
  );
});

// reCAPTCHA 相關函數
const loadRecaptcha = () => {
  if (typeof window.grecaptcha === "undefined") {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    script.onload = initRecaptcha;
    document.head.appendChild(script);
  } else {
    initRecaptcha();
  }
};

const initRecaptcha = () => {
  if (recaptchaContainer.value && window.grecaptcha) {
    window.grecaptcha.render(recaptchaContainer.value, {
      sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
      callback: (token: string) => {
        recaptchaToken.value = token;
        delete errors.value.recaptcha;
      },
      "expired-callback": () => {
        recaptchaToken.value = "";
        errors.value.recaptcha = t("contact.form.errors.recaptchaExpired");
      },
    });
  }
};

// 表單提交
const handleSubmit = async () => {
  // 防止重複提交
  if (isSubmitting.value) return;

  // Honeypot 檢查
  if (formData.value.honeypot) {
    console.warn("Bot detected - honeypot filled");
    return;
  }

  // 驗證所有欄位
  const fieldsToValidate = ["name", "email", "subject", "message", "privacy"];
  let isValid = true;

  fieldsToValidate.forEach((field) => {
    if (!validateField(field)) {
      isValid = false;
    }
  });

  // 檢查 reCAPTCHA
  if (!recaptchaToken.value) {
    errors.value.recaptcha = t("contact.form.errors.recaptchaRequired");
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  isSubmitting.value = true;
  submitError.value = "";
  canRetry.value = false;

  try {
    const messageData: MessageCreate = {
      name: formData.value.name.trim(),
      email: formData.value.email.trim(),
      subject: formData.value.subject.trim(),
      message: formData.value.message.trim(),
    };

    await messageAPI.sendMessage(messageData);

    // 成功處理
    submitSuccess.value = true;
    formData.value = {
      name: "",
      email: "",
      subject: "",
      message: "",
      privacy: false,
      honeypot: "",
    };
    errors.value = {};
    interactions.value.clear();

    // 重置 reCAPTCHA
    if (window.grecaptcha) {
      window.grecaptcha.reset();
      recaptchaToken.value = "";
    }
  } catch (error: unknown) {
    console.error("Contact form submission error:", error);
    const errorObj = error as { detail?: string };
    submitError.value = errorObj.detail || t("contact.form.errors.submitFailed");
    canRetry.value = true;
  } finally {
    isSubmitting.value = false;
  }
};

// 重試提交
const retrySubmit = () => {
  submitError.value = "";
  canRetry.value = false;
  handleSubmit();
};

// 生命週期
onMounted(() => {
  // 僅在生產環境載入 reCAPTCHA
  if (import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
    loadRecaptcha();
  }
});

onUnmounted(() => {
  // 清理
  if (window.grecaptcha) {
    window.grecaptcha.reset();
  }
});

// TypeScript 聲明
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      reset: () => void;
      render: (container: HTMLElement, options: Record<string, unknown>) => void;
    };
  }
}
</script>

<style scoped>
/* === Contact Form BEM Styles === */
.contact-form {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.contact-form__form {
  /* Inherits form styles from Bootstrap */
}

.contact-form__field {
  /* Inherits Bootstrap column styles */
}

.contact-form__label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.contact-form__required {
  color: var(--color-error);
}

.contact-form__input {
  /* Extends Bootstrap form-control */
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.contact-form__input:focus {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 0.25rem var(--color-shadow-focus);
  background-color: var(--color-bg-primary);
}

.contact-form__textarea {
  resize: vertical;
  min-height: 120px;
}

.contact-form__submit-wrapper {
  text-align: center;
}

.contact-form__submit {
  padding: var(--spacing-sm) var(--spacing-2xl);
  min-width: 160px;
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
}

.contact-form__submit:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.contact-form__honeypot {
  position: absolute !important;
  left: -9999px !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

.contact-form__alert {
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.contact-form__alert--success {
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border-left: 4px solid var(--color-success);
}

.contact-form__alert--danger {
  background-color: var(--color-error-bg);
  color: var(--color-error);
  border-left: 4px solid var(--color-error);
}

.contact-form__alert-icon {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.contact-form__alert-message {
  flex: 1;
}

.contact-form__retry-btn {
  margin-left: auto;
  flex-shrink: 0;
}

.contact-form__progress {
  border-top: 1px solid var(--color-border-secondary);
  padding-top: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

/* === Dark Mode Support === */
[data-bs-theme="dark"] .contact-form {
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
}

[data-bs-theme="dark"] .contact-form__input {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-secondary);
  color: var(--color-text-primary);
}

[data-bs-theme="dark"] .contact-form__input:focus {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-focus);
}

/* === Responsive Design === */
@media (max-width: 768px) {
  .contact-form {
    padding: var(--spacing-lg);
  }
  
  .contact-form__submit {
    width: 100%;
  }
}
</style>
