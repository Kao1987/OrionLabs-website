<template>
  <div class="contact-page">
    <!-- 頁面標題 -->
    <section class="main-header">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center">
            <h1 class="display-4 fw-bold">聯絡我</h1>
            <p class="lead">有任何問題或合作機會，歡迎與我聯繫</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 聯絡內容 -->
    <section class="section">
      <div class="container">
        <div class="row g-5">
          <!-- 聯絡表單 -->
          <div class="col-lg-8">
            <div class="card">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <h4 class="card-title mb-0">發送訊息</h4>
                  <div v-if="formProgress > 0" class="form-progress">
                    <small class="text-muted">完成度: {{ formProgress }}%</small>
                    <div class="progress mt-1" style="height: 4px; width: 100px">
                      <div
                        class="progress-bar"
                        :style="{ width: formProgress + '%' }"
                        role="progressbar"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- 成功訊息 -->
                <div v-if="submitSuccess" class="alert alert-success mb-4" role="alert">
                  <i class="bi bi-check-circle me-2"></i>
                  訊息已成功發送！我會盡快回覆您。
                </div>

                <!-- 錯誤訊息 -->
                <div v-if="submitError" class="alert alert-danger mb-4" role="alert">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{ submitError.message }}
                  <button
                    v-if="submitError.code === 'SUBMIT_ERROR'"
                    @click="retrySubmit"
                    class="btn btn-sm btn-outline-danger ms-2"
                    :disabled="isSubmitting"
                  >
                    重試
                  </button>
                </div>

                <form @submit.prevent="handleSubmit" novalidate>
                  <!-- Honeypot field (hidden) -->
                  <input
                    v-model="formData.honeypot"
                    type="text"
                    name="website"
                    class="d-none"
                    tabindex="-1"
                    autocomplete="off"
                  />

                  <div class="row g-3">
                    <div class="col-md-6">
                      <label for="name" class="form-label">
                        姓名 <span class="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="name"
                        v-model="formData.name"
                        :class="{
                          'is-invalid': errors.name,
                          'is-valid': !errors.name && formData.name.trim().length > 0,
                        }"
                        @input="handleFieldInput('name')"
                        @blur="handleFieldBlur('name')"
                        @focus="trackInteraction"
                        required
                        autocomplete="name"
                      />
                      <div v-if="errors.name" class="invalid-feedback">
                        {{ errors.name }}
                      </div>
                      <div v-else-if="formData.name.trim().length > 0" class="valid-feedback">
                        <i class="bi bi-check-circle me-1"></i>
                        格式正確
                      </div>
                    </div>

                    <div class="col-md-6">
                      <label for="email" class="form-label">
                        電子郵件 <span class="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        class="form-control"
                        id="email"
                        v-model="formData.email"
                        :class="{
                          'is-invalid': errors.email,
                          'is-valid': !errors.email && formData.email.trim().length > 0,
                        }"
                        @input="handleFieldInput('email')"
                        @blur="handleFieldBlur('email')"
                        @focus="trackInteraction"
                        required
                        autocomplete="email"
                      />
                      <div v-if="errors.email" class="invalid-feedback">
                        {{ errors.email }}
                      </div>
                      <div v-else-if="isValidEmail(formData.email)" class="valid-feedback">
                        <i class="bi bi-check-circle me-1"></i>
                        電子郵件格式正確
                      </div>
                    </div>

                    <div class="col-12">
                      <label for="subject" class="form-label">
                        主旨 <span class="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="subject"
                        v-model="formData.subject"
                        :class="{
                          'is-invalid': errors.subject,
                          'is-valid': !errors.subject && formData.subject.trim().length >= 5,
                        }"
                        @input="handleFieldInput('subject')"
                        @blur="handleFieldBlur('subject')"
                        @focus="trackInteraction"
                        required
                        placeholder="請簡述您的需求..."
                      />
                      <div v-if="errors.subject" class="invalid-feedback">
                        {{ errors.subject }}
                      </div>
                      <div v-else-if="formData.subject.trim().length >= 5" class="valid-feedback">
                        <i class="bi bi-check-circle me-1"></i>
                        主旨長度適當
                      </div>
                      <div v-else-if="formData.subject.trim().length > 0" class="form-text">
                        還需要 {{ 5 - formData.subject.trim().length }} 個字元
                      </div>
                    </div>

                    <div class="col-12">
                      <label for="message" class="form-label">
                        訊息內容 <span class="text-danger">*</span>
                      </label>
                      <textarea
                        class="form-control"
                        id="message"
                        rows="6"
                        v-model="formData.message"
                        :class="{
                          'is-invalid': errors.message,
                          'is-valid': !errors.message && formData.message.trim().length >= 10,
                        }"
                        @input="handleFieldInput('message')"
                        @blur="handleFieldBlur('message')"
                        @focus="trackInteraction"
                        placeholder="請詳細描述您的需求、預算範圍、時程要求等..."
                        required
                      ></textarea>
                      <div v-if="errors.message" class="invalid-feedback">
                        {{ errors.message }}
                      </div>
                      <div v-else-if="formData.message.trim().length >= 10" class="valid-feedback">
                        <i class="bi bi-check-circle me-1"></i>
                        內容詳細度良好
                      </div>
                      <div v-else class="form-text">
                        <span class="text-muted">
                          {{ formData.message.trim().length }}/1000 字元
                          <span v-if="formData.message.trim().length < 10">
                            (至少需要 {{ 10 - formData.message.trim().length }} 個字元)
                          </span>
                        </span>
                      </div>
                    </div>

                    <!-- 隱私政策同意 -->
                    <div class="col-12">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="privacyConsent"
                          v-model="privacyConsent"
                          required
                        />
                        <label class="form-check-label" for="privacyConsent">
                          我已閱讀並同意
                          <router-link to="/privacy" target="_blank" class="text-decoration-none">
                            隱私政策
                          </router-link>
                          <span class="text-danger">*</span>
                        </label>
                      </div>
                    </div>

                    <div class="col-12">
                      <button
                        type="submit"
                        class="btn btn-primary btn-lg me-3"
                        :disabled="!canSubmit"
                      >
                        <span
                          v-if="isSubmitting"
                          class="spinner-border spinner-border-sm me-2"
                        ></span>
                        <i v-else class="bi bi-send me-2"></i>
                        {{ isSubmitting ? "發送中..." : "發送訊息" }}
                      </button>

                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="handleClearForm"
                        :disabled="isSubmitting"
                      >
                        <i class="bi bi-arrow-clockwise me-1"></i>
                        清除表單
                      </button>
                    </div>
                  </div>
                </form>

                <!-- 表單提示 -->
                <div class="mt-4 p-3 bg-light rounded">
                  <h6 class="mb-2">
                    <i class="bi bi-info-circle me-2"></i>
                    提交須知
                  </h6>
                  <ul class="list-unstyled mb-0 small">
                    <li class="mb-1">
                      <i class="bi bi-check text-success me-2"></i>
                      我會在 24 小時內回覆您的訊息
                    </li>
                    <li class="mb-1">
                      <i class="bi bi-check text-success me-2"></i>
                      所有資料都會被安全保護，不會被第三方使用
                    </li>
                    <li class="mb-1">
                      <i class="bi bi-check text-success me-2"></i>
                      緊急事務請直接透過電話聯絡
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- 聯絡資訊 -->
          <div class="col-lg-4">
            <!-- 聯絡方式 -->
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">聯絡資訊</h5>
                <div class="contact-info">
                  <div class="contact-item mb-3">
                    <div class="d-flex align-items-center">
                      <div class="contact-icon me-3">
                        <i class="bi bi-envelope-fill"></i>
                      </div>
                      <div>
                        <h6 class="mb-1">電子郵件</h6>
                        <a href="mailto:orionkaolabs@gmail.com" class="text-muted">
                          orionkaolabs@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                  <div class="contact-item mb-3">
                    <div class="d-flex align-items-center">
                      <div class="contact-icon me-3">
                        <i class="bi bi-phone-fill"></i>
                      </div>
                      <div>
                        <h6 class="mb-1">電話</h6>
                        <a href="tel:+886912345678" class="text-muted">+886-912-345-678</a>
                      </div>
                    </div>
                  </div>
                  <div class="contact-item mb-3">
                    <div class="d-flex align-items-center">
                      <div class="contact-icon me-3">
                        <i class="bi bi-geo-alt-fill"></i>
                      </div>
                      <div>
                        <h6 class="mb-1">位置</h6>
                        <span class="text-muted">台北市, 台灣</span>
                      </div>
                    </div>
                  </div>
                  <div class="contact-item">
                    <div class="d-flex align-items-center">
                      <div class="contact-icon me-3">
                        <i class="bi bi-clock-fill"></i>
                      </div>
                      <div>
                        <h6 class="mb-1">回覆時間</h6>
                        <span class="text-muted">24小時內</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 社群媒體 -->
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">社群媒體</h5>
                <div class="d-flex gap-3">
                  <a
                    v-for="social in socialLinks"
                    :key="social.name"
                    :href="social.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-outline-primary"
                    :aria-label="social.name"
                  >
                    <i :class="social.icon"></i>
                  </a>
                </div>
              </div>
            </div>

            <!-- 服務時間 -->
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">服務時間</h5>
                <ul class="list-unstyled mb-0">
                  <li class="d-flex justify-content-between mb-2">
                    <span>週一 - 週五</span>
                    <span class="text-muted">9:00 - 18:00</span>
                  </li>
                  <li class="d-flex justify-content-between mb-2">
                    <span>週六</span>
                    <span class="text-muted">10:00 - 16:00</span>
                  </li>
                  <li class="d-flex justify-content-between">
                    <span>週日</span>
                    <span class="text-muted">休息</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ 區塊 -->
    <section class="section section-alt">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h2 class="section-title">常見問題</h2>
            <p class="section-subtitle text-muted">快速了解合作相關資訊</p>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="accordion" id="faqAccordion">
              <div v-for="(faq, index) in faqs" :key="faq.id" class="accordion-item">
                <h2 class="accordion-header" :id="`heading${faq.id}`">
                  <button
                    class="accordion-button"
                    :class="{ collapsed: index !== 0 }"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#collapse${faq.id}`"
                    :aria-expanded="index === 0"
                    :aria-controls="`collapse${faq.id}`"
                  >
                    {{ faq.question }}
                  </button>
                </h2>
                <div
                  :id="`collapse${faq.id}`"
                  class="accordion-collapse collapse"
                  :class="{ show: index === 0 }"
                  :aria-labelledby="`heading${faq.id}`"
                  data-bs-parent="#faqAccordion"
                >
                  <div class="accordion-body">
                    {{ faq.answer }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useContactStore } from "@/stores/contact";
import { useUIStore } from "@/stores/ui";

const contactStore = useContactStore();
const uiStore = useUIStore();

// Store getters with storeToRefs
const { formData, errors, isSubmitting, submitSuccess, submitError, formProgress, isFormValid } =
  storeToRefs(contactStore);

// Local state
const privacyConsent = ref(false);
const fieldTouched = ref<Record<string, boolean>>({});

// Computed
const canSubmit = computed(() => {
  return isFormValid.value && privacyConsent.value && !isSubmitting.value;
});

// Social media links
const socialLinks = ref([
  { name: "LinkedIn", url: "https://linkedin.com/in/yourprofile", icon: "bi bi-linkedin" },
  { name: "GitHub", url: "https://github.com/yourusername", icon: "bi bi-github" },
  { name: "Instagram", url: "https://instagram.com/in/yourprofile", icon: "bi bi-instagram" },
  { name: "Twitter", url: "https://twitter.com/yourprofile", icon: "bi bi-twitter" },
]);

// FAQ data
const faqs = ref([
  {
    id: 1,
    question: "專案開發週期大概需要多久？",
    answer:
      "專案開發時間取決於複雜度和需求範圍。一般小型網站約 2-4 週，中型專案約 1-2 個月，大型專案可能需要 2-3 個月。我會在初期評估後提供詳細的時程規劃。",
  },
  {
    id: 2,
    question: "如何計算專案費用？",
    answer:
      "費用會根據專案規模、功能複雜度、設計需求和開發時程來評估。我提供透明的報價，包含設計、開發、測試和基本維護。歡迎聯絡我討論您的需求，我會提供詳細的報價單。",
  },
  {
    id: 3,
    question: "是否提供網站維護服務？",
    answer:
      "是的，我提供網站維護服務，包含安全更新、功能調整、內容更新和技術支援。維護方案可以是一次性或月費制，根據您的需求來規劃。",
  },
  {
    id: 4,
    question: "可以協助現有網站的優化嗎？",
    answer:
      "當然可以！我提供網站優化服務，包含效能提升、SEO 優化、使用者體驗改善、響應式設計調整等。會先進行全面評估，然後提出具體的優化建議。",
  },
]);

// Methods
const isValidEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

const handleFieldInput = (fieldName: string) => {
  contactStore.trackInteraction();

  // Real-time validation for immediate feedback
  if (fieldTouched.value[fieldName]) {
    contactStore.validateSingleField(fieldName);
  }
};

const handleFieldBlur = (fieldName: string) => {
  fieldTouched.value[fieldName] = true;
  contactStore.validateSingleField(fieldName);
};

const trackInteraction = () => {
  contactStore.trackInteraction();
};

const handleSubmit = async () => {
  // Mark all fields as touched
  Object.keys(formData).forEach((field) => {
    fieldTouched.value[field] = true;
  });

  if (!privacyConsent.value) {
    uiStore.showError("提交失敗", "請先同意隱私政策");
    return;
  }

  const success = await contactStore.submitMessage();

  if (success) {
    // Reset form state
    privacyConsent.value = false;
    fieldTouched.value = {};
    uiStore.showSuccess("發送成功", "您的訊息已成功發送！");
  } else {
    uiStore.showError("發送失敗", submitError.value?.message || "請稍後再試");
  }
};

const handleClearForm = () => {
  if (confirm("確定要清除所有已輸入的內容嗎？")) {
    contactStore.clearForm();
    privacyConsent.value = false;
    fieldTouched.value = {};
    uiStore.showInfo("表單已清除", "所有欄位已重置");
  }
};

const retrySubmit = async () => {
  const success = await contactStore.retrySubmit();
  if (success) {
    uiStore.showSuccess("發送成功", "您的訊息已成功發送！");
  }
};

// Watchers
watch(submitSuccess, (newValue) => {
  if (newValue) {
    // Scroll to top to show success message
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// Lifecycle
onMounted(() => {
  contactStore.initForm();
});
</script>

<style scoped>
.contact-icon {
  width: 40px;
  height: 40px;
  background: var(--brand-light);
  color: var(--brand-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-item h6 {
  color: var(--brand-primary);
  font-size: 0.9rem;
}

.accordion-button:not(.collapsed) {
  background-color: var(--brand-light);
  color: var(--brand-primary);
}

.accordion-button:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 0.25rem rgba(44, 62, 80, 0.25);
}

.form-progress {
  text-align: right;
}

.progress {
  background-color: #e9ecef;
}

.progress-bar {
  background-color: var(--brand-primary);
  transition: width 0.3s ease;
}

.valid-feedback {
  display: block;
}

.form-check-input:checked {
  background-color: var(--brand-primary);
  border-color: var(--brand-primary);
}

.btn-primary {
  background-color: var(--brand-primary);
  border-color: var(--brand-primary);
}

.btn-primary:hover {
  background-color: var(--brand-dark);
  border-color: var(--brand-dark);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-progress {
    text-align: left;
    margin-top: 1rem;
  }

  .social-links {
    justify-content: center;
  }
}
</style>
