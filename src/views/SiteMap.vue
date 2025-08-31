<template>
  <section class="container py-5">
    <h1 class="mb-4">網站地圖</h1>
    
    <p class="lead">
      探索 OrionLabs 的所有頁面和內容，快速找到您需要的資訊。
    </p>

    <div class="row">
      <!-- 主要頁面 -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0"><i class="bi bi-house"></i> 主要頁面</h5>
          </div>
          <div class="card-body">
            <ul class="list-unstyled">
              <li class="mb-2">
                <router-link to="/" class="text-decoration-none">
                  <i class="bi bi-arrow-right"></i> 首頁
                </router-link>
              </li>
              <li class="mb-2">
                <router-link to="/about" class="text-decoration-none">
                  <i class="bi bi-arrow-right"></i> 關於我
                </router-link>
              </li>
              <li class="mb-2">
                <router-link to="/portfolio" class="text-decoration-none">
                  <i class="bi bi-arrow-right"></i> 作品集
                </router-link>
              </li>
              <li class="mb-2">
                <router-link to="/blog" class="text-decoration-none">
                  <i class="bi bi-arrow-right"></i> 技術部落格
                </router-link>
              </li>
              <li class="mb-2">
                <router-link to="/contact" class="text-decoration-none">
                  <i class="bi bi-arrow-right"></i> 聯絡我
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 法遵頁面 -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0"><i class="bi bi-shield-check"></i> 法遵資訊</h5>
          </div>
          <div class="card-body">
            <ul class="list-unstyled">
              <li class="mb-2">
                <router-link to="/privacy" class="text-decoration-none">
                  <i class="bi bi-arrow-right"></i> 隱私權政策
                </router-link>
              </li>
              <li class="mb-2">
                <router-link to="/terms" class="text-decoration-none">
                  <i class="bi bi-arrow-right"></i> 服務條款
                </router-link>
              </li>
              <li class="mb-2">
                <router-link to="/cookie" class="text-decoration-none">
                  <i class="bi bi-arrow-right"></i> Cookie 政策
                </router-link>
              </li>
              <li class="mb-2">
                <router-link to="/sitemap" class="text-decoration-none">
                  <i class="bi bi-arrow-right"></i> 網站地圖
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 技術資源 -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0"><i class="bi bi-code-square"></i> 技術資源</h5>
          </div>
          <div class="card-body">
            <ul class="list-unstyled">
              <li class="mb-2">
                <a href="/sitemap.xml" class="text-decoration-none" target="_blank">
                  <i class="bi bi-arrow-right"></i> XML 網站地圖
                </a>
              </li>
              <li class="mb-2">
                <a href="/robots.txt" class="text-decoration-none" target="_blank">
                  <i class="bi bi-arrow-right"></i> Robots.txt
                </a>
              </li>
              <li class="mb-2">
                <span class="text-muted">
                  <i class="bi bi-arrow-right"></i> API 文件 <small>(即將推出)</small>
                </span>
              </li>
              <li class="mb-2">
                <span class="text-muted">
                  <i class="bi bi-arrow-right"></i> 開發者指南 <small>(即將推出)</small>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 聯絡方式 -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0"><i class="bi bi-envelope"></i> 聯絡方式</h5>
          </div>
          <div class="card-body">
            <ul class="list-unstyled">
              <li class="mb-2">
                <a href="mailto:orionkaolabs@gmail.com" class="text-decoration-none">
                  <i class="bi bi-envelope"></i> 電子郵件
                </a>
              </li>
              <li class="mb-2">
                <a href="https://github.com/yourusername" class="text-decoration-none" target="_blank">
                  <i class="bi bi-github"></i> GitHub
                </a>
              </li>
              <li class="mb-2">
                <span class="text-muted">
                  <i class="bi bi-telephone"></i> +886-912-345-678
                </span>
              </li>
              <li class="mb-2">
                <span class="text-muted">
                  <i class="bi bi-geo-alt"></i> 台北市, 台灣
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近更新 -->
    <div class="row mt-5">
      <div class="col-12">
        <h2 class="mb-4">最近更新</h2>
        <div class="card">
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h6 class="card-title">頁面更新</h6>
                <ul class="list-unstyled">
                  <li class="mb-1">
                    <small class="text-muted">2025-08-31</small> - 隱私權政策完整重寫
                  </li>
                  <li class="mb-1">
                    <small class="text-muted">2025-08-31</small> - 服務條款詳細化
                  </li>
                  <li class="mb-1">
                    <small class="text-muted">2025-08-31</small> - Cookie 政策新增
                  </li>
                  <li class="mb-1">
                    <small class="text-muted">2025-08-31</small> - SEO 優化完成
                  </li>
                </ul>
              </div>
              <div class="col-md-6">
                <h6 class="card-title">技術改進</h6>
                <ul class="list-unstyled">
                  <li class="mb-1">
                    <small class="text-muted">2025-08-31</small> - 網站地圖 XML 生成
                  </li>
                  <li class="mb-1">
                    <small class="text-muted">2025-08-31</small> - Robots.txt 配置
                  </li>
                  <li class="mb-1">
                    <small class="text-muted">2025-08-31</small> - Footer 組件修復
                  </li>
                  <li class="mb-1">
                    <small class="text-muted">2025-08-31</small> - 結構化數據優化
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 網站統計 -->
    <div class="row mt-4">
      <div class="col-12">
        <h2 class="mb-4">網站統計</h2>
        <div class="row text-center">
          <div class="col-md-3 mb-3">
            <div class="card bg-light">
              <div class="card-body">
                <h4 class="text-primary">8+</h4>
                <p class="mb-0">主要頁面</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-light">
              <div class="card-body">
                <h4 class="text-success">4</h4>
                <p class="mb-0">法遵文件</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-light">
              <div class="card-body">
                <h4 class="text-info">100%</h4>
                <p class="mb-0">響應式設計</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-light">
              <div class="card-body">
                <h4 class="text-warning">A+</h4>
                <p class="mb-0">SEO 優化</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速搜尋 -->
    <div class="row mt-5">
      <div class="col-12">
        <h2 class="mb-4">快速搜尋</h2>
        <div class="card">
          <div class="card-body">
            <p class="card-text">
              正在尋找特定內容嗎？使用以下標籤快速找到相關頁面：
            </p>
            <div class="d-flex flex-wrap gap-2">
              <router-link to="/portfolio" class="btn btn-outline-primary btn-sm">前端開發</router-link>
              <router-link to="/portfolio" class="btn btn-outline-primary btn-sm">UI/UX 設計</router-link>
              <router-link to="/blog" class="btn btn-outline-secondary btn-sm">技術文章</router-link>
              <router-link to="/about" class="btn btn-outline-info btn-sm">個人簡介</router-link>
              <router-link to="/contact" class="btn btn-outline-success btn-sm">專案合作</router-link>
              <router-link to="/privacy" class="btn btn-outline-warning btn-sm">隱私保護</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 回到頂部 -->
    <div class="text-center mt-5">
      <button 
        class="btn btn-outline-primary" 
        onclick="window.scrollTo({top: 0, behavior: 'smooth'})"
      >
        <i class="bi bi-arrow-up"></i> 回到頂部
      </button>
    </div>

  </section>
</template>

<script setup lang="ts">
import { useSEO } from '@/composables/useSEO'

// SEO 設定
const { updateSEO } = useSEO()

updateSEO({
  title: '網站地圖',
  description: 'OrionLabs 完整網站地圖，包含所有頁面連結、法遵資訊、技術資源和聯絡方式。快速找到您需要的內容。',
  keywords: ['網站地圖', '頁面導覽', '網站結構', '快速連結', '法遵資訊', '技術資源'],
  type: 'website',
  noindex: false,
  nofollow: false
})
</script>

<style scoped>
.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.btn {
  transition: all 0.2s ease-in-out;
}
</style>
