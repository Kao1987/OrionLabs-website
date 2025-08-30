import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { API_ENDPOINTS, unifiedFetch } from "@/services/api";

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot?: string;
  submittedAt?: Date;
  status?: "pending" | "sent" | "failed";
  userAgent?: string;
  ip?: string;
}

export interface ContactError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => string | null;
}

export interface FormValidation {
  [key: string]: ValidationRule;
}

export const useContactStore = defineStore("contact", () => {
  // State
  const formData = ref<ContactMessage>({
    name: "",
    email: "",
    subject: "",
    message: "",
    honeypot: "",
  });

  const errors = ref<Record<string, string>>({});
  const isSubmitting = ref(false);
  const isValidating = ref(false);
  const submitSuccess = ref(false);
  const submitError = ref<ContactError | null>(null);
  const messages = ref<ContactMessage[]>([]);

  // Anti-spam tracking
  const formStartTime = ref<number>(0);
  const interactionCount = ref(0);
  const suspiciousActivity = ref(false);

  // Validation rules
  const validationRules: FormValidation = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\u4e00-\u9fa5\s'-]+$/,
      customValidator: (value: string) => {
        if (value.trim().length < 2) return "姓名至少需要2個字元";
        if (!/^[a-zA-Z\u4e00-\u9fa5\s'-]+$/.test(value))
          return "姓名只能包含字母、中文、空格、連字號和撇號";
        return null;
      },
    },
    email: {
      required: true,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      customValidator: (value: string) => {
        if (!value.trim()) return "請輸入電子郵件";
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          return "請輸入有效的電子郵件格式";
        }
        // Check for suspicious patterns
        if (/^\d+@/.test(value) || /test@test/.test(value)) {
          suspiciousActivity.value = true;
        }
        return null;
      },
    },
    subject: {
      required: true,
      minLength: 5,
      maxLength: 100,
      customValidator: (value: string) => {
        if (value.trim().length < 5) return "主旨至少需要5個字元";
        if (value.trim().length > 100) return "主旨不能超過100個字元";
        // Check for spam patterns
        const spamPatterns = [/viagra/i, /casino/i, /lottery/i, /click here/i];
        if (spamPatterns.some((pattern) => pattern.test(value))) {
          suspiciousActivity.value = true;
        }
        return null;
      },
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 1000,
      customValidator: (value: string) => {
        if (value.trim().length < 10) return "訊息內容至少需要10個字元";
        if (value.trim().length > 1000) return "訊息內容不能超過1000個字元";
        // Check for excessive links
        const linkCount = (value.match(/https?:\/\//gi) || []).length;
        if (linkCount > 2) {
          suspiciousActivity.value = true;
          return "訊息中包含過多連結";
        }
        return null;
      },
    },
  };

  // Computed
  const hasErrors = computed(() => Object.keys(errors.value).length > 0);
  const isFormValid = computed(() => {
    return Object.keys(validationRules).every((field) => {
      const value = formData.value[field as keyof ContactMessage] as string;
      return validateField(field, value) === null;
    });
  });

  const formProgress = computed(() => {
    const fields = Object.keys(validationRules);
    const filledFields = fields.filter((field) => {
      const value = formData.value[field as keyof ContactMessage] as string;
      return value && value.trim().length > 0;
    });
    return Math.round((filledFields.length / fields.length) * 100);
  });

  // Methods
  const clearErrors = () => {
    errors.value = {};
    submitError.value = null;
  };

  const clearForm = () => {
    formData.value = {
      name: "",
      email: "",
      subject: "",
      message: "",
      honeypot: "",
    };
    clearErrors();
    formStartTime.value = 0;
    interactionCount.value = 0;
    suspiciousActivity.value = false;
  };

  const setError = (error: ContactError) => {
    submitError.value = error;
    if (error.field) {
      errors.value[error.field] = error.message;
    }
  };

  const validateField = (fieldName: string, value: string): string | null => {
    const rule = validationRules[fieldName];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || value.trim().length === 0)) {
      return `${getFieldDisplayName(fieldName)}為必填欄位`;
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim().length === 0) return null;

    // Length validations
    if (rule.minLength && value.trim().length < rule.minLength) {
      return `${getFieldDisplayName(fieldName)}至少需要${rule.minLength}個字元`;
    }

    if (rule.maxLength && value.trim().length > rule.maxLength) {
      return `${getFieldDisplayName(fieldName)}不能超過${rule.maxLength}個字元`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return `${getFieldDisplayName(fieldName)}格式不正確`;
    }

    // Custom validation
    if (rule.customValidator) {
      return rule.customValidator(value);
    }

    return null;
  };

  const validateAllFields = (): boolean => {
    clearErrors();
    let isValid = true;

    Object.keys(validationRules).forEach((fieldName) => {
      const value = formData.value[fieldName as keyof ContactMessage] as string;
      const error = validateField(fieldName, value);
      if (error) {
        errors.value[fieldName] = error;
        isValid = false;
      }
    });

    return isValid;
  };

  const validateSingleField = (fieldName: string) => {
    const value = formData.value[fieldName as keyof ContactMessage] as string;
    const error = validateField(fieldName, value);

    if (error) {
      errors.value[fieldName] = error;
    } else {
      delete errors.value[fieldName];
    }

    return error === null;
  };

  const getFieldDisplayName = (fieldName: string): string => {
    const displayNames: Record<string, string> = {
      name: "姓名",
      email: "電子郵件",
      subject: "主旨",
      message: "訊息內容",
    };
    return displayNames[fieldName] || fieldName;
  };

  // Anti-spam methods
  const initForm = () => {
    formStartTime.value = Date.now();
    interactionCount.value = 0;
    suspiciousActivity.value = false;
  };

  const trackInteraction = () => {
    interactionCount.value++;
  };

  const checkSpamIndicators = (): boolean => {
    const now = Date.now();
    const timeDiff = now - formStartTime.value;

    // Form submitted too quickly (less than 3 seconds)
    if (timeDiff < 3000) {
      suspiciousActivity.value = true;
      return true;
    }

    // Honeypot field filled
    if (formData.value.honeypot && formData.value.honeypot.trim().length > 0) {
      suspiciousActivity.value = true;
      return true;
    }

    // Too few interactions (suspicious for a real user)
    if (interactionCount.value < 5) {
      suspiciousActivity.value = true;
      return true;
    }

    return suspiciousActivity.value;
  };

  // API methods
  const submitMessage = async (): Promise<boolean> => {
    if (!validateAllFields()) {
      return false;
    }

    if (checkSpamIndicators()) {
      setError({
        code: "SPAM_DETECTED",
        message: "檢測到可疑活動，請稍後再試",
      });
      return false;
    }

    isSubmitting.value = true;
    clearErrors();

    try {
      const messageData: ContactMessage = {
        ...formData.value,
        submittedAt: new Date(),
        userAgent: navigator.userAgent,
        status: "pending",
      };

      // Remove honeypot field before sending
      delete messageData.honeypot;

      const response = await unifiedFetch(API_ENDPOINTS.CONTACT.MESSAGES, {
        method: "POST",
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();

      // Add to messages list
      messages.value.unshift({
        ...messageData,
        id: result.id,
        status: "sent",
      });

      submitSuccess.value = true;
      clearForm();

      // Hide success message after 5 seconds
      setTimeout(() => {
        submitSuccess.value = false;
      }, 5000);

      return true;
    } catch (error: unknown) {
      const catchError = error as { message?: string };
      setError({
        code: "SUBMIT_ERROR",
        message: catchError.message || "發送失敗，請稍後再試",
      });
      return false;
    } finally {
      isSubmitting.value = false;
    }
  };

  const retrySubmit = async (): Promise<boolean> => {
    clearErrors();
    return await submitMessage();
  };

  return {
    // State
    formData,
    errors,
    isSubmitting,
    isValidating,
    submitSuccess,
    submitError,
    messages,
    formStartTime,
    interactionCount,
    suspiciousActivity,

    // Computed
    hasErrors,
    isFormValid,
    formProgress,

    // Methods
    clearErrors,
    clearForm,
    setError,
    validateField,
    validateAllFields,
    validateSingleField,
    getFieldDisplayName,
    initForm,
    trackInteraction,
    checkSpamIndicators,
    submitMessage,
    retrySubmit,
  };
});
