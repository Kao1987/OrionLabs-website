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
                <h4 class="card-title mb-4">發送訊息</h4>
                <form @submit.prevent="submitForm">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label for="name" class="form-label">姓名 *</label>
                      <input
                        type="text"
                        class="form-control"
                        id="name"
                        v-model="formData.name"
                        :class="{ 'is-invalid': errors.name }"
                        required
                      >
                      <div v-if="errors.name" class="invalid-feedback">
                        {{ errors.name }}
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label for="email" class="form-label">電子郵件 *</label>
                      <input
                        type="email"
                        class="form-control"
                        id="email"
                        v-model="formData.email"
                        :class="{ 'is-invalid': errors.email }"
                        required
                      >
                      <div v-if="errors.email" class="invalid-feedback">
                        {{ errors.email }}
                      </div>
                    </div>
                    <div class="col-12">
                      <label for="subject" class="form-label">主旨 *</label>
                      <input
                        type="text"
                        class="form-control"
                        id="subject"
                        v-model="formData.subject"
                        :class="{ 'is-invalid': errors.subject }"
                        required
                      >
                      <div v-if="errors.subject" class="invalid-feedback">
                        {{ errors.subject }}
                      </div>
                    </div>
                    <div class="col-12">
                      <label for="message" class="form-label">訊息內容 *</label>
                      <textarea
                        class="form-control"
                        id="message"
                        rows="6"
                        v-model="formData.message"
                        :class="{ 'is-invalid': errors.message }"
                        placeholder="請詳細描述您的需求..."
                        required
                      ></textarea>
                      <div v-if="errors.message" class="invalid-feedback">
                        {{ errors.message }}
                      </div>
                    </div>
                    <div class="col-12">
                      <button
                        type="submit"
                        class="btn btn-primary btn-lg"
                        :disabled="isSubmitting"
                      >
                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                        {{ isSubmitting ? '發送中...' : '發送訊息' }}
                      </button>
                    </div>
                  </div>
                </form>

                <!-- 成功訊息 -->
                <div v-if="showSuccess" class="alert alert-success mt-3" role="alert">
                  <i class="bi bi-check-circle me-2"></i>
                  訊息已成功發送！我會盡快回覆您。
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
                        <a href="mailto:hong.yikao@example.com" class="text-muted">
                          hong.yikao@example.com
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
                        <span class="text-muted">+886-912-345-678</span>
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
              <div
                v-for="(faq, index) in faqs"
                :key="faq.id"
                class="accordion-item"
              >
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
import { ref, reactive } from 'vue'

// 表單資料
const formData = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

// 錯誤訊息
const errors = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

// 狀態管理
const isSubmitting = ref(false)
const showSuccess = ref(false)

// 社群媒體連結
const socialLinks = ref([
  { name: 'LinkedIn', url: 'https://linkedin.com/in/yourprofile', icon: 'bi bi-linkedin' },
  { name: 'GitHub', url: 'https://github.com/yourusername', icon: 'bi bi-github' },
  { name: 'Instagram', url: 'https://instagram.com/yourprofile', icon: 'bi bi-instagram' },
  { name: 'Twitter', url: 'https://twitter.com/yourprofile', icon: 'bi bi-twitter' }
])

// FAQ 資料
const faqs = ref([
  {
    id: 1,
    question: '專案開發週期大概需要多久？',
    answer: '專案開發時間取決於複雜度和需求範圍。一般小型網站約 2-4 週，中型專案約 1-2 個月，大型專案可能需要 2-3 個月。我會在初期評估後提供詳細的時程規劃。'
  },
  {
    id: 2,
    question: '如何計算專案費用？',
    answer: '費用會根據專案規模、功能複雜度、設計需求和開發時程來評估。我提供透明的報價，包含設計、開發、測試和基本維護。歡迎聯絡我討論您的需求，我會提供詳細的報價單。'
  },
  {
    id: 3,
    question: '是否提供網站維護服務？',
    answer: '是的，我提供網站維護服務，包含安全更新、功能調整、內容更新和技術支援。維護方案可以是一次性或月費制，根據您的需求來規劃。'
  },
  {
    id: 4,
    question: '可以協助現有網站的優化嗎？',
    answer: '當然可以！我提供網站優化服務，包含效能提升、SEO 優化、使用者體驗改善、響應式設計調整等。會先進行全面評估，然後提出具體的優化建議。'
  }
])

// 表單驗證
const validateForm = () => {
  let isValid = true
  
  // 重置錯誤
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  // 驗證姓名
  if (!formData.name.trim()) {
    errors.name = '請輸入您的姓名'
    isValid = false
  }

  // 驗證電子郵件
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email.trim()) {
    errors.email = '請輸入電子郵件'
    isValid = false
  } else if (!emailRegex.test(formData.email)) {
    errors.email = '請輸入有效的電子郵件格式'
    isValid = false
  }

  // 驗證主旨
  if (!formData.subject.trim()) {
    errors.subject = '請輸入主旨'
    isValid = false
  }

  // 驗證訊息
  if (!formData.message.trim()) {
    errors.message = '請輸入訊息內容'
    isValid = false
  } else if (formData.message.trim().length < 10) {
    errors.message = '訊息內容至少需要10個字元'
    isValid = false
  }

  return isValid
}

// 提交表單
const submitForm = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  
  try {
    // 模擬發送過程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 這裡可以串接實際的 API
    console.log('Form submitted:', formData)
    
    // 重置表單
    Object.keys(formData).forEach(key => {
      formData[key as keyof typeof formData] = ''
    })
    
    showSuccess.value = true
    
    // 3秒後隱藏成功訊息
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
    
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}
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

@media (max-width: 768px) {
  .social-links {
    justify-content: center;
  }
}
</style> 