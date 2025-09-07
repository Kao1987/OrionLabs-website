#!/usr/bin/env node

/**
 * OrionLabs Critical CSS 提取工具
 * 分析首屏關鍵樣式，實現 Critical CSS 優化
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🎯 OrionLabs Critical CSS 提取工具');
console.log('===================================\n');

// 需要分析的關鍵頁面
const criticalPages = [
  {
    name: 'home',
    path: '/',
    title: '首頁'
  },
  {
    name: 'about',
    path: '/about',
    title: '關於頁面'
  },
  {
    name: 'portfolio',
    path: '/portfolio',
    title: '作品集頁面'
  },
  {
    name: 'blog',
    path: '/blog',
    title: '部落格頁面'
  },
  {
    name: 'contact',
    path: '/contact',
    title: '聯絡頁面'
  }
];

// Critical CSS 規則配置
const criticalConfig = {
  // 視窗大小
  viewports: [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ],

  // 關鍵 CSS 選擇器（必須包含）
  criticalSelectors: [
    // 全域重置和基礎樣式
    'html', 'body', '*', '::before', '::after',

    // 佈局容器
    '.container', '.container-fluid', '.row', '[class*="col-"]',

    // 導航欄（始終可見）
    '.navbar', '.navbar-brand', '.navbar-nav', '.nav-link',

    // Hero 區塊（首屏）
    '.hero_section', '.hero_title', '.hero_subtitle',

    // 按鈕（互動元素）
    '.btn', '.btn-primary', '.btn-secondary', '.btn-outline-primary',

    // 字體和排版
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a',

    // 基本工具類
    '.d-none', '.d-block', '.d-flex', '.text-center', '.mb-3', '.mt-3'
  ],

  // 非關鍵選擇器（可延遲載入）
  nonCriticalSelectors: [
    // 模態框（用戶觸發才顯示）
    '.modal', '.modal-dialog', '.modal-content', '.modal-header', '.modal-body', '.modal-footer',

    // 下拉選單（用戶觸發才顯示）
    '.dropdown-menu', '.dropdown-item',

    // 吐司通知（動態生成）
    '.toast', '.toast-header', '.toast-body',

    // 載入器（動態顯示）
    '.spinner-border', '.spinner-grow',

    // 表單驗證樣式（動態添加）
    '.is-valid', '.is-invalid', '.valid-feedback', '.invalid-feedback',

    // 動畫和特效
    '@keyframes', '.animate', '.fade', '.slide'
  ]
};

async function startLocalServer() {
  console.log('🚀 啟動本地開發服務器...');

  // 檢查是否有現有的開發服務器
  try {
    const response = await fetch('http://localhost:5173');
    if (response.ok) {
      console.log('✅ 發現運行中的開發服務器: http://localhost:5173');
      return 'http://localhost:5173';
    }
  } catch (error) {
    // 服務器未運行，需要啟動
  }

  console.log('⚠️  需要啟動開發服務器');
  console.log('請在另一個終端執行: yarn dev');
  console.log('然後重新運行此腳本\n');

  return null;
}

async function extractUsedCSS(url, viewport) {
  console.log(`📱 分析 ${viewport.name} (${viewport.width}x${viewport.height})...`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(viewport);

    // 載入頁面
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // 等待動態內容載入
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 提取使用的 CSS 規則
    const usedCSS = await page.evaluate(() => {
      const usedRules = new Set();
      const styleSheets = Array.from(document.styleSheets);

      // 分析所有樣式表
      for (const styleSheet of styleSheets) {
        try {
          const rules = Array.from(styleSheet.cssRules || styleSheet.rules || []);

          for (const rule of rules) {
            if (rule.type === CSSRule.STYLE_RULE) {
              const selector = rule.selectorText;

              // 檢查選擇器是否匹配頁面元素
              try {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                  // 檢查元素是否在視窗內（Critical CSS）
                  let isInViewport = false;
                  for (const element of elements) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0 &&
                        rect.left < window.innerWidth && rect.right > 0) {
                      isInViewport = true;
                      break;
                    }
                  }

                  usedRules.add({
                    selector: selector,
                    cssText: rule.cssText,
                    isCritical: isInViewport,
                    mediaQuery: rule.parentRule?.conditionText || null
                  });
                }
              } catch (e) {
                // 忽略無效選擇器
              }
            }
          }
        } catch (e) {
          // 忽略跨域樣式表
          console.log('跨域樣式表，跳過:', e.message);
        }
      }

      return Array.from(usedRules);
    });

    await browser.close();
    return usedCSS;

  } catch (error) {
    await browser.close();
    throw error;
  }
}

async function analyzePage(baseUrl, pageConfig) {
  console.log(`\n🔍 分析頁面: ${pageConfig.title} (${pageConfig.path})`);
  console.log('─'.repeat(50));

  const fullUrl = baseUrl + pageConfig.path;
  const pageResults = {};

  // 分析不同視窗大小
  for (const viewport of criticalConfig.viewports) {
    try {
      const usedCSS = await extractUsedCSS(fullUrl, viewport);

      // 分類關鍵和非關鍵 CSS
      const criticalRules = [];
      const nonCriticalRules = [];

      for (const rule of usedCSS) {
        const isForcedCritical = criticalConfig.criticalSelectors.some(selector =>
          rule.selector.includes(selector)
        );
        const isForcedNonCritical = criticalConfig.nonCriticalSelectors.some(selector =>
          rule.selector.includes(selector)
        );

        if (isForcedCritical || (rule.isCritical && !isForcedNonCritical)) {
          criticalRules.push(rule);
        } else {
          nonCriticalRules.push(rule);
        }
      }

      pageResults[viewport.name] = {
        viewport: viewport,
        totalRules: usedCSS.length,
        criticalRules: criticalRules,
        nonCriticalRules: nonCriticalRules,
        criticalCount: criticalRules.length,
        nonCriticalCount: nonCriticalRules.length
      };

      console.log(`  ${viewport.name}: ${criticalRules.length}/${usedCSS.length} 關鍵規則`);

    } catch (error) {
      console.log(`  ❌ ${viewport.name} 分析失敗:`, error.message);
    }
  }

  return {
    page: pageConfig,
    results: pageResults
  };
}

function generateCriticalCSS(analysisResults) {
  console.log('\n📝 生成 Critical CSS...');

  // 合併所有頁面的關鍵 CSS
  const allCriticalRules = new Map();

  for (const pageResult of analysisResults) {
    for (const [viewportName, result] of Object.entries(pageResult.results)) {
      const key = `${pageResult.page.name}-${viewportName}`;

      for (const rule of result.criticalRules) {
        const ruleKey = `${rule.selector}-${rule.cssText}`;
        if (!allCriticalRules.has(ruleKey)) {
          allCriticalRules.set(ruleKey, {
            ...rule,
            pages: [key],
            priority: rule.selector.includes('html') || rule.selector.includes('body') ? 1 : 2
          });
        } else {
          allCriticalRules.get(ruleKey).pages.push(key);
        }
      }
    }
  }

  // 按優先級排序
  const sortedRules = Array.from(allCriticalRules.values()).sort((a, b) => a.priority - b.priority);

  // 生成 CSS 內容
  const criticalCSSContent = `/* OrionLabs Critical CSS */
/* 自動生成於 ${new Date().toISOString()} */
/* 包含 ${sortedRules.length} 個關鍵樣式規則 */

${sortedRules.map(rule => {
  const comment = `/* ${rule.pages.length} 頁面使用: ${rule.pages.slice(0, 3).join(', ')}${rule.pages.length > 3 ? '...' : ''} */`;
  return `${comment}\n${rule.cssText}`;
}).join('\n\n')}
`;

  // 寫入 Critical CSS 檔案
  const criticalCSSPath = path.join(projectRoot, 'src/assets/css/critical.css');
  fs.writeFileSync(criticalCSSPath, criticalCSSContent, 'utf8');

  console.log(`✅ Critical CSS 已生成: ${path.relative(projectRoot, criticalCSSPath)}`);
  console.log(`📊 包含 ${sortedRules.length} 個關鍵樣式規則`);

  return {
    filePath: criticalCSSPath,
    rulesCount: sortedRules.length,
    content: criticalCSSContent
  };
}

function generateOptimizedMainTS(criticalCSS, analysisResults) {
  console.log('\n⚙️  生成優化的 main.ts...');

  const optimizedMainTS = `import { createApp } from "vue";
import { createPinia } from "pinia";

// === Critical CSS (內聯) ===
// 關鍵樣式直接內聯，確保首屏快速渲染
import "./assets/css/critical.css";

// === Orion CSS 架構系統 (Phase 4 + Critical CSS 優化) ===
import "./assets/css/orion-layer-system.css"; // CSS Layer 架構
import "./assets/css/orion-consolidated-theme.css"; // 統一主題系統

import App from "./App.vue";
import router from "./router";

// === 主題驗證工具 (開發環境) ===
import { runThemeConsistencyCheck } from "./utils/themeValidator";

console.log("main.ts loaded with Critical CSS optimization");

const app = createApp(App);

app.use(createPinia());
app.use(router);

// === 延遲載入非關鍵 CSS ===
// 使用動態匯入延遲載入非關鍵樣式，避免阻塞首屏
function loadNonCriticalCSS() {
  // Bootstrap (延遲載入)
  const bootstrapLink = document.createElement('link');
  bootstrapLink.rel = 'stylesheet';
  bootstrapLink.href = '/node_modules/bootstrap/dist/css/bootstrap.min.css';
  bootstrapLink.media = 'print';
  bootstrapLink.onload = () => {
    bootstrapLink.media = 'all';
  };
  document.head.appendChild(bootstrapLink);

  // Bootstrap Icons (延遲載入)
  const iconsLink = document.createElement('link');
  iconsLink.rel = 'stylesheet';
  iconsLink.href = '/node_modules/bootstrap-icons/font/bootstrap-icons.css';
  iconsLink.media = 'print';
  iconsLink.onload = () => {
    iconsLink.media = 'all';
  };
  document.head.appendChild(iconsLink);

  // Bootstrap 自定義覆蓋
  import("./assets/css/bootstrap-custom.css");

  // 其他非關鍵 CSS
  import("./assets/utilities.css");
  import("./assets/css/contrast-enhancements.css");
  import("./assets/global.css");
}

// === Bootstrap JavaScript 按需載入 ===
async function loadBootstrapJS() {
  const { default: bootstrapModule } = await import("./assets/scss/bootstrap-custom.js");
}

// 掛載應用
app.mount("#app");

// === 優化載入序列 ===
// 1. 首屏關鍵內容已通過 Critical CSS 優化
// 2. 延遲載入非關鍵資源
requestIdleCallback(() => {
  loadNonCriticalCSS();
  loadBootstrapJS();
}, { timeout: 100 });

// === 主題一致性檢查 (開發環境限定) ===
if (import.meta.env.DEV) {
  setTimeout(() => {
    runThemeConsistencyCheck();
  }, 200);
}

console.log("Vue app mounted with Critical CSS and performance optimization");
`;

  // 備份原始 main.ts
  const mainTSPath = path.join(projectRoot, 'src/main.ts');
  const backupPath = mainTSPath + '.pre-critical';

  if (fs.existsSync(mainTSPath)) {
    fs.copyFileSync(mainTSPath, backupPath);
    console.log(`💾 原始 main.ts 已備份: ${path.relative(projectRoot, backupPath)}`);
  }

  // 寫入優化版本
  const optimizedPath = path.join(projectRoot, 'src/main-critical.ts');
  fs.writeFileSync(optimizedPath, optimizedMainTS, 'utf8');

  console.log(`✅ 優化版 main.ts 已生成: ${path.relative(projectRoot, optimizedPath)}`);
  console.log('💡 如需啟用，請將 main-critical.ts 重命名為 main.ts');

  return optimizedPath;
}

async function generateReport(analysisResults, criticalCSS, optimizedMainTS) {
  console.log('\n📋 生成 Critical CSS 分析報告...');

  const totalPages = analysisResults.length;
  const totalRules = analysisResults.reduce((sum, page) => {
    return sum + Object.values(page.results).reduce((pageSum, result) => pageSum + result.totalRules, 0);
  }, 0);

  const avgCriticalRatio = analysisResults.reduce((sum, page) => {
    const pageAvg = Object.values(page.results).reduce((pageSum, result) => {
      return pageSum + (result.criticalCount / result.totalRules);
    }, 0) / Object.keys(page.results).length;
    return sum + pageAvg;
  }, 0) / totalPages;

  const report = `# Critical CSS 分析報告

**生成時間:** ${new Date().toLocaleString('zh-TW')}
**分析頁面:** ${totalPages} 個
**Critical CSS 規則:** ${criticalCSS.rulesCount} 個

## 📊 性能指標

- **總 CSS 規則:** ${totalRules} 個
- **關鍵 CSS 比例:** ${(avgCriticalRatio * 100).toFixed(1)}%
- **Critical CSS 大小:** ${Math.round(criticalCSS.content.length / 1024)} KB
- **預估首屏載入改善:** ~${Math.round((1 - avgCriticalRatio) * 100)}%

## 🎯 分析結果

${analysisResults.map(pageResult => `
### ${pageResult.page.title} (${pageResult.page.path})

${Object.entries(pageResult.results).map(([viewport, result]) => `
#### ${viewport.toUpperCase()}
- **總規則:** ${result.totalRules}
- **關鍵規則:** ${result.criticalCount} (${(result.criticalCount/result.totalRules*100).toFixed(1)}%)
- **非關鍵規則:** ${result.nonCriticalCount} (${(result.nonCriticalCount/result.totalRules*100).toFixed(1)}%)
`).join('')}
`).join('')}

## 🚀 實施建議

### 1. Critical CSS 內聯
\`\`\`html
<style>
/* 內聯 Critical CSS 內容到 HTML head */
${criticalCSS.content.substring(0, 500)}...
</style>
\`\`\`

### 2. 非關鍵 CSS 延遲載入
\`\`\`javascript
// 使用 requestIdleCallback 延遲載入
requestIdleCallback(() => {
  import('./assets/css/non-critical.css');
});
\`\`\`

### 3. 漸進式載入策略
- ✅ Critical CSS: 內聯到 HTML
- ⏳ Above-fold CSS: 高優先級載入
- 🔄 Below-fold CSS: 延遲載入
- 📱 Responsive CSS: 依設備載入

## 📁 生成檔案

- **Critical CSS:** \`src/assets/css/critical.css\`
- **優化版 Main:** \`src/main-critical.ts\`
- **分析報告:** \`docs/reports/CRITICAL_CSS_REPORT.md\`

## 🔧 使用方式

1. **啟用 Critical CSS:**
   \`\`\`bash
   cp src/main-critical.ts src/main.ts
   \`\`\`

2. **驗證效果:**
   \`\`\`bash
   yarn build
   yarn preview
   \`\`\`

3. **性能測試:**
   - 使用 Lighthouse 測試 FCP (First Contentful Paint)
   - 監控 CLS (Cumulative Layout Shift)
   - 檢查 LCP (Largest Contentful Paint)

---
*此報告由 OrionLabs Critical CSS 提取器自動生成*
`;

  const reportPath = path.join(projectRoot, 'docs/reports/CRITICAL_CSS_REPORT.md');
  const reportsDir = path.dirname(reportPath);

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`📄 報告已生成: ${path.relative(projectRoot, reportPath)}`);
}

// 主要執行流程
async function main() {
  try {
    console.log('🎯 開始 Critical CSS 分析...\n');

    // Step 1: 確認開發服務器運行
    const baseUrl = await startLocalServer();
    if (!baseUrl) {
      process.exit(1);
    }

    // Step 2: 分析所有關鍵頁面
    const analysisResults = [];
    for (const pageConfig of criticalPages) {
      const result = await analyzePage(baseUrl, pageConfig);
      analysisResults.push(result);
    }

    // Step 3: 生成 Critical CSS
    const criticalCSS = generateCriticalCSS(analysisResults);

    // Step 4: 生成優化的 main.ts
    const optimizedMainTS = generateOptimizedMainTS(criticalCSS, analysisResults);

    // Step 5: 生成分析報告
    await generateReport(analysisResults, criticalCSS, optimizedMainTS);

    console.log('\n🎉 Critical CSS 提取完成！');
    console.log('\n📋 摘要:');
    console.log(`  • 分析頁面: ${analysisResults.length} 個`);
    console.log(`  • Critical CSS 規則: ${criticalCSS.rulesCount} 個`);
    console.log(`  • Critical CSS 大小: ${Math.round(criticalCSS.content.length / 1024)} KB`);
    console.log('\n📄 詳細報告: docs/reports/CRITICAL_CSS_REPORT.md');
    console.log('💡 啟用方式: cp src/main-critical.ts src/main.ts');

  } catch (error) {
    console.error('❌ Critical CSS 提取失敗:', error);
    process.exit(1);
  }
}

// 檢查是否為直接執行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as extractCriticalCSS };
