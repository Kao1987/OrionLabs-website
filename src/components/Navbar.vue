<template>
  <!-- 主導航列 -->
  <nav class="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm">
    <div class="container">
      <!-- 品牌標誌 -->
      <router-link to="/" class="navbar-brand text-primary">
        {{ brandName }}
      </router-link>

      <!-- 手機版選單切換按鈕 -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- 導航選單 -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link to="/" class="nav-link" active-class="active">
              首頁
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/about" class="nav-link" active-class="active">
              關於我
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/portfolio" class="nav-link" active-class="active">
              作品集
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/blog" class="nav-link" active-class="active">
              部落格
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/contact" class="nav-link" active-class="active">
              聯絡我
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
interface Props {
  brandName?: string
}

withDefaults(defineProps<Props>(), {
  brandName: 'Your Brand'
})
</script>

<style scoped>
.navbar {
  transition: all 0.3s ease;
}

.nav-link.active {
  color: var(--brand-primary) !important;
  font-weight: 600;
}

.nav-link:hover {
  color: var(--brand-accent) !important;
}

@media (max-width: 991px) {
  .navbar-nav {
    padding-top: 1rem;
  }
  
  .nav-item {
    text-align: center;
    margin: 0.25rem 0;
  }
}
</style> 