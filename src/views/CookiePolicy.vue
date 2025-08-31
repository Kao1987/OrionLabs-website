<template>
  <section class="container py-5">
    <h1 class="mb-4">Cookie 使用政策</h1>
    
    <div class="alert alert-info">
      <strong>最後更新日期：</strong> 2025年8月31日<br>
      <strong>生效日期：</strong> 2025年8月31日
    </div>

    <p class="lead">
      本 Cookie 政策說明 OrionLabs（以下簡稱「我們」、「本網站」）如何在我們的網站
      https://orionlabs.pro 上使用 Cookie 和類似技術。
    </p>

    <h2 class="mt-5 mb-3">一、什麼是 Cookie？</h2>
    
    <p>
      Cookie 是網站在您訪問時於您的裝置（電腦、平板、手機）上儲存的小型文字檔案。
      Cookie 被廣泛用來讓網站運作，或更有效率地運作，以及向網站所有者提供資訊。
    </p>

    <h3 class="mt-4 mb-2">Cookie 的特點：</h3>
    <ul>
      <li>通常包含網站名稱、Cookie 的生存期以及一個值（通常是隨機生成的唯一號碼）</li>
      <li>可以在您的電腦硬碟上儲存資訊，以便網站記住您的偏好</li>
      <li>有助於改善您的瀏覽體驗和網站功能</li>
      <li>無法執行程式碼或傳送病毒到您的電腦</li>
    </ul>

    <h2 class="mt-5 mb-3">二、我們使用的 Cookie 類型</h2>
    
    <div class="row">
      <div class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0"><i class="bi bi-shield-check"></i> 必要性 Cookie</h5>
          </div>
          <div class="card-body">
            <p><strong>目的：</strong>確保網站基本功能正常運作</p>
            <p><strong>無法停用</strong> - 這些 Cookie 對網站運作是必要的</p>
            <ul class="small">
              <li>安全性和身份驗證</li>
              <li>記住您的語言偏好</li>
              <li>維持使用者會話狀態</li>
              <li>防止 CSRF 攻擊</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0"><i class="bi bi-gear"></i> 功能性 Cookie</h5>
          </div>
          <div class="card-body">
            <p><strong>目的：</strong>提供增強的功能和個人化設定</p>
            <p><strong>可以停用</strong> - 但可能影響某些功能</p>
            <ul class="small">
              <li>記住您的偏好設定</li>
              <li>深色/淺色主題選擇</li>
              <li>字體大小調整</li>
              <li>地區和語言設定</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0"><i class="bi bi-graph-up"></i> 分析性 Cookie</h5>
          </div>
          <div class="card-body">
            <p><strong>目的：</strong>幫助我們了解網站使用情況</p>
            <p><strong>可以停用</strong> - 不影響網站功能</p>
            <ul class="small">
              <li>訪問者統計（Google Analytics）</li>
              <li>頁面瀏覽分析</li>
              <li>使用者行為模式</li>
              <li>網站效能監控</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0"><i class="bi bi-megaphone"></i> 行銷 Cookie</h5>
          </div>
          <div class="card-body">
            <p><strong>目的：</strong>追蹤訪客跨網站的行為</p>
            <p><strong>可以停用</strong> - 目前我們不使用此類 Cookie</p>
            <ul class="small">
              <li>個人化廣告內容</li>
              <li>社交媒體功能</li>
              <li>跨網站追蹤</li>
              <li>重新鎖定廣告</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <h2 class="mt-5 mb-3">三、具體使用的 Cookie 清單</h2>
    
    <div class="table-responsive">
      <table class="table table-striped">
        <thead class="table-dark">
          <tr>
            <th>Cookie 名稱</th>
            <th>類型</th>
            <th>用途</th>
            <th>期限</th>
            <th>提供者</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>theme-preference</code></td>
            <td>功能性</td>
            <td>記住使用者的主題偏好（淺色/深色模式）</td>
            <td>1年</td>
            <td>OrionLabs</td>
          </tr>
          <tr>
            <td><code>language-preference</code></td>
            <td>功能性</td>
            <td>記住使用者的語言偏好</td>
            <td>1年</td>
            <td>OrionLabs</td>
          </tr>
          <tr>
            <td><code>cookie-consent</code></td>
            <td>必要性</td>
            <td>記錄使用者的 Cookie 同意偏好</td>
            <td>1年</td>
            <td>OrionLabs</td>
          </tr>
          <tr>
            <td><code>session-security</code></td>
            <td>必要性</td>
            <td>防止 CSRF 攻擊和維護安全會話</td>
            <td>會話結束</td>
            <td>OrionLabs</td>
          </tr>
          <tr>
            <td><code>_ga</code></td>
            <td>分析性</td>
            <td>Google Analytics - 區分使用者</td>
            <td>2年</td>
            <td>Google</td>
          </tr>
          <tr>
            <td><code>_ga_*</code></td>
            <td>分析性</td>
            <td>Google Analytics - 會話狀態持久化</td>
            <td>2年</td>
            <td>Google</td>
          </tr>
          <tr>
            <td><code>_gid</code></td>
            <td>分析性</td>
            <td>Google Analytics - 區分使用者</td>
            <td>1天</td>
            <td>Google</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 class="mt-5 mb-3">四、第三方 Cookie</h2>
    
    <h3 class="mt-4 mb-2">4.1 Google Analytics</h3>
    <div class="alert alert-light">
      <p><strong>用途：</strong>網站流量分析和使用者行為統計</p>
      <p><strong>資料處理：</strong>匿名或假名化的統計資料</p>
      <p><strong>保留期間：</strong>26個月</p>
      <p><strong>選擇退出：</strong>您可以安裝 
        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">
          Google Analytics 選擇退出瀏覽器附加元件
        </a>
      </p>
      <p><strong>隱私政策：</strong>
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">
          Google 隱私權政策
        </a>
      </p>
    </div>

    <h3 class="mt-4 mb-2">4.2 Google reCAPTCHA</h3>
    <div class="alert alert-light">
      <p><strong>用途：</strong>防止垃圾郵件和自動化攻擊</p>
      <p><strong>啟動時機：</strong>僅在使用聯絡表單時載入</p>
      <p><strong>資料處理：</strong>瀏覽器和裝置資訊用於安全驗證</p>
      <p><strong>隱私政策：</strong>
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">
          Google 隱私權政策
        </a>
      </p>
    </div>

    <h2 class="mt-5 mb-3">五、如何管理 Cookie 偏好</h2>
    
    <h3 class="mt-4 mb-2">5.1 透過我們的 Cookie 偏好中心</h3>
    <div class="alert alert-primary">
      <p class="mb-2">
        <strong><i class="bi bi-gear-fill"></i> Cookie 偏好設定</strong>
      </p>
      <p>
        您可以隨時點擊頁面底部的「Cookie 設定」來管理您的偏好，
        或者 <a href="#" class="alert-link" onclick="window.showCookiePreferences?.()">點擊這裡開啟設定</a>。
      </p>
      <p class="mb-0">
        <small class="text-muted">
          註：必要性 Cookie 無法停用，因為它們對網站運作是必需的。
        </small>
      </p>
    </div>

    <h3 class="mt-4 mb-2">5.2 透過瀏覽器設定</h3>
    <p>您也可以透過瀏覽器設定來控制 Cookie：</p>
    
    <div class="row">
      <div class="col-md-6 mb-3">
        <h6><i class="bi bi-browser-chrome"></i> Chrome</h6>
        <ol class="small">
          <li>點擊右上角的三個點選單</li>
          <li>選擇「設定」→「隱私權與安全性」</li>
          <li>點擊「Cookie 和其他網站資料」</li>
          <li>選擇您偏好的 Cookie 設定</li>
        </ol>
      </div>
      
      <div class="col-md-6 mb-3">
        <h6><i class="bi bi-browser-firefox"></i> Firefox</h6>
        <ol class="small">
          <li>點擊右上角的選單按鈕</li>
          <li>選擇「設定」</li>
          <li>點擊左側的「隱私權與安全性」</li>
          <li>在「Cookie 與網站資料」區塊調整設定</li>
        </ol>
      </div>
      
      <div class="col-md-6 mb-3">
        <h6><i class="bi bi-browser-safari"></i> Safari</h6>
        <ol class="small">
          <li>點擊選單列的「Safari」</li>
          <li>選擇「偏好設定」</li>
          <li>點擊「隱私權」標籤</li>
          <li>調整「Cookie 和網站資料」設定</li>
        </ol>
      </div>
      
      <div class="col-md-6 mb-3">
        <h6><i class="bi bi-browser-edge"></i> Edge</h6>
        <ol class="small">
          <li>點擊右上角的三個點選單</li>
          <li>選擇「設定」</li>
          <li>點擊左側的「Cookie 和網站權限」</li>
          <li>管理「Cookie 和儲存的資料」</li>
        </ol>
      </div>
    </div>

    <h3 class="mt-4 mb-2">5.3 停用 Cookie 的影響</h3>
    <div class="alert alert-warning">
      <h6><i class="bi bi-exclamation-triangle"></i> 請注意</h6>
      <p>停用某些 Cookie 可能會影響網站功能：</p>
      <ul class="mb-0">
        <li><strong>必要性 Cookie：</strong>無法停用，網站可能無法正常運作</li>
        <li><strong>功能性 Cookie：</strong>您的偏好設定將無法記住</li>
        <li><strong>分析性 Cookie：</strong>我們將無法改善網站體驗</li>
      </ul>
    </div>

    <h2 class="mt-5 mb-3">六、移動裝置上的 Cookie</h2>
    
    <p>在移動裝置上，Cookie 的管理方式可能略有不同：</p>
    
    <h3 class="mt-4 mb-2">6.1 移動瀏覽器</h3>
    <ul>
      <li><strong>iOS Safari：</strong>設定 → Safari → 阻擋所有 Cookie</li>
      <li><strong>Android Chrome：</strong>Chrome 設定 → 網站設定 → Cookie</li>
      <li><strong>其他瀏覽器：</strong>請查閱該瀏覽器的說明文件</li>
    </ul>

    <h3 class="mt-4 mb-2">6.2 廣告識別碼</h3>
    <ul>
      <li><strong>iOS：</strong>設定 → 隱私權 → Apple 廣告 → 限制廣告追蹤</li>
      <li><strong>Android：</strong>設定 → Google → 廣告 → 選擇退出廣告個人化</li>
    </ul>

    <h2 class="mt-5 mb-3">七、Cookie 政策更新</h2>
    
    <p>
      我們可能會不時更新本 Cookie 政策以反映：
    </p>
    <ul>
      <li>技術變更或新功能</li>
      <li>法律法規的變更</li>
      <li>我們業務實務的變更</li>
      <li>改善使用者體驗的需要</li>
    </ul>

    <p>
      任何重大變更將在我們網站上提前通知您。建議您定期查閱本政策以了解最新資訊。
    </p>

    <h2 class="mt-5 mb-3">八、更多資訊與聯絡方式</h2>
    
    <h3 class="mt-4 mb-2">8.1 相關資源</h3>
    <ul>
      <li><a href="/privacy" class="text-decoration-none">隱私權政策</a></li>
      <li><a href="/terms" class="text-decoration-none">服務條款</a></li>
      <li><a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener">關於 Cookie 的更多資訊</a></li>
      <li><a href="https://youronlinechoices.eu/" target="_blank" rel="noopener">您的線上選擇</a></li>
    </ul>

    <h3 class="mt-4 mb-2">8.2 聯絡我們</h3>
    <div class="card">
      <div class="card-body">
        <p class="card-text">
          如果您對我們的 Cookie 使用有任何疑問或擔憂，請隨時聯絡我們：
        </p>
        <p class="card-text">
          <strong>電子郵件：</strong><a href="mailto:orionkaolabs@gmail.com">orionkaolabs@gmail.com</a><br>
          <strong>主旨請註明：</strong>「Cookie 政策相關諮詢」<br>
          <strong>電話：</strong>+886-912-345-678
        </p>
      </div>
    </div>

    <div class="alert alert-success mt-4">
      <h6><i class="bi bi-check-circle"></i> 感謝您的理解</h6>
      <p class="mb-0">
        我們致力於透明地說明 Cookie 的使用方式，並尊重您對隱私的選擇。
        您的信任對我們非常重要。
      </p>
    </div>

  </section>
</template>

<script setup lang="ts">
import { useSEO } from '@/composables/useSEO'

// SEO 設定
const { updateSEO } = useSEO()

updateSEO({
  title: 'Cookie 使用政策',
  description: 'OrionLabs Cookie 政策詳細說明我們如何使用 Cookie 和類似技術，以及您如何管理 Cookie 偏好設定。',
  keywords: ['Cookie 政策', 'Cookie 管理', '隱私設定', '網站追蹤', 'Google Analytics', '使用者偏好'],
  type: 'article',
  noindex: false,
  nofollow: false
})
</script>
