<template>
  <div class="not-found-page">
    <section class="error-section">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-6 text-center">
            <div class="error-content">
              <div class="error-icon mb-4">
                <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
              </div>
              <h1 class="error-title">404</h1>
              <h2 class="error-subtitle mb-4">頁面不存在</h2>
              <p class="error-description mb-4">
                抱歉，您要找的頁面可能已被移動、刪除或不存在。
                請檢查網址是否正確，或返回首頁繼續瀏覽。
              </p>
              <div class="error-actions">
                <router-link to="/" class="btn btn-primary btn-lg me-3">
                  <i class="bi bi-house me-2"></i>
                  返回首頁
                </router-link>
                <button @click="goBack" class="btn btn-outline-primary btn-lg">
                  <i class="bi bi-arrow-left me-2"></i>
                  返回上頁
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 推薦連結 -->
    <section class="section">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h3>您可能想要瀏覽</h3>
          </div>
        </div>
        <div class="row g-4">
          <div class="col-lg-3 col-md-6">
            <div class="card h-100 text-center">
              <div class="card-body">
                <i class="bi bi-house display-4 text-primary mb-3"></i>
                <h5 class="card-title">首頁</h5>
                <p class="card-text text-muted">了解我的服務與最新作品</p>
                <router-link to="/" class="btn btn-outline-primary">
                  前往首頁
                </router-link>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="card h-100 text-center">
              <div class="card-body">
                <i class="bi bi-briefcase display-4 text-primary mb-3"></i>
                <h5 class="card-title">作品集</h5>
                <p class="card-text text-muted">查看我的設計與開發專案</p>
                <router-link to="/portfolio" class="btn btn-outline-primary">
                  查看作品
                </router-link>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="card h-100 text-center">
              <div class="card-body">
                <i class="bi bi-person display-4 text-primary mb-3"></i>
                <h5 class="card-title">關於我</h5>
                <p class="card-text text-muted">了解我的背景與專業經驗</p>
                <router-link to="/about" class="btn btn-outline-primary">
                  認識我
                </router-link>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="card h-100 text-center">
              <div class="card-body">
                <i class="bi bi-envelope display-4 text-primary mb-3"></i>
                <h5 class="card-title">聯絡我</h5>
                <p class="card-text text-muted">有任何問題歡迎與我聯繫</p>
                <router-link to="/contact" class="btn btn-outline-primary">
                  聯絡我
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// 返回上一頁
const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    // 如果沒有歷史記錄，導向首頁
    window.location.href = '/'
  }
}
</script>

<style scoped>
.error-section {
  min-height: 60vh;
  display: flex;
  align-items: center;
  padding: 4rem 0;
}

.error-title {
  font-size: 8rem;
  font-weight: 700;
  color: var(--brand-primary);
  line-height: 1;
  margin-bottom: 1rem;
}

.error-subtitle {
  font-size: 2rem;
  color: var(--brand-secondary);
  font-weight: 600;
}

.error-description {
  font-size: 1.125rem;
  color: var(--bs-gray-600);
  line-height: 1.6;
}

.error-actions {
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .error-title {
    font-size: 6rem;
  }
  
  .error-subtitle {
    font-size: 1.5rem;
  }
  
  .error-actions .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .error-actions .me-3 {
    margin-right: 0 !important;
  }
}
</style> 