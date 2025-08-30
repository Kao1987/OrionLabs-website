#!/usr/bin/env node

/**
 * OrionLabs Bootstrap 使用優化器
 * 分析專案中實際使用的 Bootstrap 組件，建議按需載入策略
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔧 OrionLabs Bootstrap 使用優化分析工具');
console.log('================================\n');

// Bootstrap 組件和類別對應表
const bootstrapComponents = {
  // Layout
  'container': ['container', 'container-fluid', 'container-sm', 'container-md', 'container-lg', 'container-xl'],
  'grid': ['row', 'col', 'col-1', 'col-2', 'col-3', 'col-4', 'col-5', 'col-6', 'col-7', 'col-8', 'col-9', 'col-10', 'col-11', 'col-12', 'col-auto'],
  
  // Components
  'buttons': ['btn', 'btn-primary', 'btn-secondary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info', 'btn-light', 'btn-dark', 'btn-outline'],
  'cards': ['card', 'card-header', 'card-body', 'card-footer', 'card-title', 'card-text', 'card-img'],
  'navbar': ['navbar', 'navbar-nav', 'navbar-brand', 'navbar-toggler', 'navbar-collapse', 'nav-link', 'nav-item'],
  'forms': ['form-control', 'form-group', 'form-label', 'form-text', 'form-check', 'input-group'],
  'modals': ['modal', 'modal-dialog', 'modal-content', 'modal-header', 'modal-body', 'modal-footer'],
  'alerts': ['alert', 'alert-primary', 'alert-secondary', 'alert-success', 'alert-danger', 'alert-warning', 'alert-info'],
  'badges': ['badge', 'badge-primary', 'badge-secondary', 'badge-success', 'badge-danger', 'badge-warning'],
  'breadcrumb': ['breadcrumb', 'breadcrumb-item'],
  'carousel': ['carousel', 'carousel-item', 'carousel-control', 'carousel-indicators'],
  'dropdown': ['dropdown', 'dropdown-menu', 'dropdown-item', 'dropdown-toggle'],
  'pagination': ['pagination', 'page-item', 'page-link'],
  'progress': ['progress', 'progress-bar'],
  'spinner': ['spinner-border', 'spinner-grow'],
  'toast': ['toast', 'toast-header', 'toast-body'],
  'tooltip': ['tooltip'],
  'popover': ['popover'],
  
  // Utilities
  'spacing': ['m-', 'p-', 'mt-', 'mb-', 'ms-', 'me-', 'pt-', 'pb-', 'ps-', 'pe-'],
  'display': ['d-none', 'd-block', 'd-inline', 'd-inline-block', 'd-flex', 'd-grid'],
  'flexbox': ['justify-content-', 'align-items-', 'flex-', 'order-'],
  'colors': ['text-primary', 'text-secondary', 'text-success', 'text-danger', 'text-warning', 'text-info', 'text-light', 'text-dark'],
  'backgrounds': ['bg-primary', 'bg-secondary', 'bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'bg-light', 'bg-dark'],
  'borders': ['border', 'border-top', 'border-bottom', 'border-start', 'border-end', 'rounded'],
  'typography': ['text-center', 'text-start', 'text-end', 'fw-bold', 'fw-normal', 'fst-italic'],
  'shadows': ['shadow', 'shadow-sm', 'shadow-lg']
};

// Bootstrap JavaScript 組件
const bootstrapJS = {
  'alert': 'Alert',
  'button': 'Button', 
  'carousel': 'Carousel',
  'collapse': 'Collapse',
  'dropdown': 'Dropdown',
  'modal': 'Modal',
  'offcanvas': 'Offcanvas',
  'popover': 'Popover',
  'scrollspy': 'ScrollSpy',
  'tab': 'Tab',
  'toast': 'Toast',
  'tooltip': 'Tooltip'
};

async function analyzeBootstrapUsage() {
  console.log('📊 分析 Bootstrap 使用情況...\n');
  
  // 尋找所有 Vue、HTML、CSS 檔案
  const files = await glob([
    'src/**/*.vue',
    'src/**/*.html', 
    'src/**/*.css',
    'src/**/*.ts',
    'src/**/*.js',
    '*.html'
  ], { 
    cwd: projectRoot,
    absolute: true 
  });

  const usedComponents = new Set();
  const usedClasses = new Set();
  const jsUsage = new Set();
  let totalBootstrapClasses = 0;

  console.log(`📁 掃描 ${files.length} 個檔案...\n`);

  // 分析每個檔案
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const fileName = path.relative(projectRoot, file);
      
      let fileBootstrapCount = 0;

      // 檢查 Bootstrap 類別使用
      for (const [component, classes] of Object.entries(bootstrapComponents)) {
        for (const className of classes) {
          // 處理前綴類別（如 m-, p- 等）
          if (className.endsWith('-')) {
            const prefixRegex = new RegExp(`\\b${className.replace('-', '-[0-9a-z]+')}`);
            if (prefixRegex.test(content)) {
              usedComponents.add(component);
              const matches = content.match(new RegExp(`\\b${className}[0-9a-z-]+`, 'g')) || [];
              matches.forEach(match => usedClasses.add(match));
              fileBootstrapCount += matches.length;
            }
          } else {
            // 完整類別名稱
            const regex = new RegExp(`\\b${className}(?:-\\w+)?\\b`, 'g');
            const matches = content.match(regex) || [];
            if (matches.length > 0) {
              usedComponents.add(component);
              matches.forEach(match => usedClasses.add(match));
              fileBootstrapCount += matches.length;
            }
          }
        }
      }

      // 檢查 Bootstrap JavaScript 組件使用
      for (const [component, className] of Object.entries(bootstrapJS)) {
        if (content.includes(className) || content.includes(`data-bs-${component}`)) {
          jsUsage.add(component);
        }
      }

      if (fileBootstrapCount > 0) {
        console.log(`  📄 ${fileName}: ${fileBootstrapCount} Bootstrap 類別`);
        totalBootstrapClasses += fileBootstrapCount;
      }
    } catch (error) {
      console.log(`  ⚠️  無法讀取: ${file}`);
    }
  }

  return {
    usedComponents: Array.from(usedComponents),
    usedClasses: Array.from(usedClasses).sort(),
    jsUsage: Array.from(jsUsage),
    totalBootstrapClasses,
    totalFiles: files.length
  };
}

async function generateOptimizationReport(analysis) {
  console.log('\n📈 生成優化建議...\n');

  const report = `# Bootstrap 使用優化報告

**生成時間:** ${new Date().toLocaleString('zh-TW')}
**掃描檔案:** ${analysis.totalFiles} 個
**Bootstrap 類別總計:** ${analysis.totalBootstrapClasses} 次使用

## 📊 使用的組件類別

### CSS 組件 (${analysis.usedComponents.length} 個)
${analysis.usedComponents.map(comp => `- **${comp}**`).join('\n')}

### JavaScript 組件 (${analysis.jsUsage.length} 個)
${analysis.jsUsage.map(js => `- **${js}**`).join('\n')}

## 🎯 按需載入建議

### 1. CSS 優化策略

#### 保留的核心組件
\`\`\`scss
// 基礎系統
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables"; 
@import "bootstrap/scss/mixins";

// 重置和排版
@import "bootstrap/scss/root";
@import "bootstrap/scss/reboot";
@import "bootstrap/scss/type";

// 布局系統 
@import "bootstrap/scss/containers";
@import "bootstrap/scss/grid";

// 使用的組件
${analysis.usedComponents.map(comp => `@import "bootstrap/scss/${comp}";`).join('\n')}

// 工具類別（按需）
@import "bootstrap/scss/utilities/api";
\`\`\`

#### 未使用的組件（可移除）
${Object.keys(bootstrapComponents).filter(comp => !analysis.usedComponents.includes(comp)).map(comp => `- ${comp}`).join('\n')}

### 2. JavaScript 優化策略

#### 保留的 JS 組件
\`\`\`javascript
// 只載入使用的組件
${analysis.jsUsage.map(js => `import { ${bootstrapJS[js]} } from 'bootstrap';`).join('\n')}
\`\`\`

#### 未使用的 JS 組件（可移除）
${Object.keys(bootstrapJS).filter(js => !analysis.jsUsage.includes(js)).map(js => `- ${js} (${bootstrapJS[js]})`).join('\n')}

## 💰 預期優化效果

### 當前狀況
- **完整 Bootstrap CSS:** ~220KB (未壓縮)
- **完整 Bootstrap JS:** ~150KB (未壓縮) 
- **總計:** ~370KB

### 優化後預估
- **自定義 Bootstrap CSS:** ~${Math.round(220 * analysis.usedComponents.length / Object.keys(bootstrapComponents).length)}KB (未壓縮)
- **自定義 Bootstrap JS:** ~${Math.round(150 * analysis.jsUsage.length / Object.keys(bootstrapJS).length)}KB (未壓縮)
- **減少:** ~${370 - Math.round(220 * analysis.usedComponents.length / Object.keys(bootstrapComponents).length) - Math.round(150 * analysis.jsUsage.length / Object.keys(bootstrapJS).length)}KB (${Math.round((1 - (Math.round(220 * analysis.usedComponents.length / Object.keys(bootstrapComponents).length) + Math.round(150 * analysis.jsUsage.length / Object.keys(bootstrapJS).length)) / 370) * 100)}%)

## 🔧 實施步驟

1. **建立自定義 Bootstrap SCSS**
   - 創建 \`src/assets/scss/bootstrap-custom.scss\`
   - 只引入必要的組件

2. **更新 JavaScript 載入**
   - 移除完整的 Bootstrap JS 載入
   - 按需引入個別組件

3. **更新 main.ts**
   - 替換 Bootstrap CSS 引入
   - 調整 JavaScript 引入方式

4. **測試和驗證** 
   - 檢查所有頁面功能正常
   - 確認樣式沒有遺漏

## 📋 使用的 Bootstrap 類別清單

\`\`\`
${analysis.usedClasses.join('\n')}
\`\`\`

---
*此報告由 OrionLabs Bootstrap 優化器自動生成*
`;

  const reportPath = path.join(projectRoot, 'docs/reports/BOOTSTRAP_OPTIMIZATION_REPORT.md');
  
  // 確保目錄存在
  const reportsDir = path.dirname(reportPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`📄 報告已生成: ${path.relative(projectRoot, reportPath)}`);
  
  return analysis;
}

async function createCustomBootstrapFiles(analysis) {
  console.log('\n🎯 建立自定義 Bootstrap 檔案...\n');

  // 建立自定義 SCSS 檔案
  const customScss = `// OrionLabs 自定義 Bootstrap 載入
// 只載入專案實際使用的組件，減少檔案大小

// 1. Bootstrap 核心系統 (必要)
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/variables-dark";
@import "bootstrap/scss/maps"; 
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/root";

// 2. 基礎重置和排版 (必要)
@import "bootstrap/scss/reboot";
@import "bootstrap/scss/type";

// 3. 布局系統
@import "bootstrap/scss/containers";
@import "bootstrap/scss/grid";

// 4. 使用的組件 (基於分析結果)
${analysis.usedComponents.map(comp => {
  // 對應組件到實際的 Bootstrap SCSS 檔案
  const scssMap = {
    'buttons': 'buttons',
    'cards': 'card', 
    'navbar': 'navbar',
    'forms': 'forms',
    'modals': 'modal',
    'alerts': 'alert',
    'badges': 'badge',
    'breadcrumb': 'breadcrumb',
    'carousel': 'carousel',
    'dropdown': 'dropdown',
    'pagination': 'pagination',
    'progress': 'progress',
    'spinner': 'spinners',
    'toast': 'toast',
    'tooltip': 'tooltip',
    'popover': 'popover'
  };
  
  const scssFile = scssMap[comp];
  return scssFile ? `@import "bootstrap/scss/${scssFile}";` : `// ${comp} (custom)`;
}).join('\n')}

// 5. 工具類別系統
@import "bootstrap/scss/helpers";

// 6. 使用的工具類別 (只載入需要的)
@import "bootstrap/scss/utilities/api";

// 7. 自定義變數覆蓋 (整合 Orion 主題)
:root {
  --bs-primary: var(--orion-primary-900);
  --bs-secondary: var(--orion-neutral-600);
  --bs-success: var(--orion-success-600);
  --bs-info: var(--orion-info-600);
  --bs-warning: var(--orion-warning-600);
  --bs-danger: var(--orion-error-600);
  --bs-light: var(--orion-neutral-100);
  --bs-dark: var(--orion-neutral-800);
}

// 8. 深色模式支持
[data-theme="dark"] {
  --bs-primary: var(--orion-primary-300);
  --bs-secondary: var(--orion-neutral-400);
  --bs-light: var(--orion-neutral-800);
  --bs-dark: var(--orion-neutral-200);
}
`;

  // 建立自定義 JS 載入檔案
  const customJs = `// OrionLabs 自定義 Bootstrap JavaScript 載入
// 只載入專案實際使用的組件

${analysis.jsUsage.map(js => {
  return `import { ${bootstrapJS[js]} } from 'bootstrap';`;
}).join('\n')}

// 自動初始化組件
document.addEventListener('DOMContentLoaded', function() {
${analysis.jsUsage.map(js => {
  switch(js) {
    case 'tooltip':
      return `  // 初始化 Tooltips\n  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));\n  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {\n    return new Tooltip(tooltipTriggerEl);\n  });`;
    case 'popover':
      return `  // 初始化 Popovers\n  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));\n  const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {\n    return new Popover(popoverTriggerEl);\n  });`;
    case 'toast':
      return `  // 初始化 Toasts\n  const toastElList = [].slice.call(document.querySelectorAll('.toast'));\n  const toastList = toastElList.map(function (toastEl) {\n    return new Toast(toastEl);\n  });`;
    default:
      return `  // ${js} 組件已載入`;
  }
}).join('\n')}
});

console.log('Bootstrap 自定義組件已載入:', [${analysis.jsUsage.map(js => `'${js}'`).join(', ')}]);
`;

  // 寫入檔案
  const scssDir = path.join(projectRoot, 'src/assets/scss');
  if (!fs.existsSync(scssDir)) {
    fs.mkdirSync(scssDir, { recursive: true });
  }

  const scssPath = path.join(scssDir, 'bootstrap-custom.scss');
  const jsPath = path.join(scssDir, 'bootstrap-custom.js');

  fs.writeFileSync(scssPath, customScss, 'utf8');
  fs.writeFileSync(jsPath, customJs, 'utf8');

  console.log(`✅ 建立: ${path.relative(projectRoot, scssPath)}`);
  console.log(`✅ 建立: ${path.relative(projectRoot, jsPath)}`);

  return { scssPath, jsPath };
}

async function updateMainTsForBootstrapOptimization() {
  console.log('\n🔄 更新 main.ts 使用優化的 Bootstrap...\n');
  
  const mainTsPath = path.join(projectRoot, 'src/main.ts');
  
  if (!fs.existsSync(mainTsPath)) {
    console.log('❌ main.ts 檔案不存在');
    return;
  }

  const currentContent = fs.readFileSync(mainTsPath, 'utf8');
  
  // 替換 Bootstrap 載入
  const updatedContent = currentContent
    .replace(
      /\/\/ Bootstrap 5 導入[\s\S]*?import "bootstrap";/,
      `// Bootstrap 5 導入（優化版本 - 只載入使用的組件）
import "./assets/scss/bootstrap-custom.scss";
import "./assets/scss/bootstrap-custom.js";`
    );

  if (updatedContent !== currentContent) {
    // 備份原始檔案
    fs.writeFileSync(mainTsPath + '.backup', currentContent, 'utf8');
    fs.writeFileSync(mainTsPath, updatedContent, 'utf8');
    
    console.log(`✅ 更新: ${path.relative(projectRoot, mainTsPath)}`);
    console.log(`💾 備份: ${path.relative(projectRoot, mainTsPath + '.backup')}`);
  } else {
    console.log('ℹ️  main.ts 已經是最新狀態');
  }
}

// 主要執行流程
async function main() {
  try {
    console.log('🚀 開始 Bootstrap 使用分析和優化...\n');
    
    // Step 1: 分析使用情況
    const analysis = await analyzeBootstrapUsage();
    
    // Step 2: 生成報告
    await generateOptimizationReport(analysis);
    
    // Step 3: 建立自定義檔案
    await createCustomBootstrapFiles(analysis);
    
    // Step 4: 更新 main.ts
    await updateMainTsForBootstrapOptimization();
    
    console.log('\n🎉 Bootstrap 優化完成！');
    console.log('\n📋 摘要:');
    console.log(`  • 使用的組件: ${analysis.usedComponents.length}/${Object.keys(bootstrapComponents).length}`);
    console.log(`  • 使用的 JS 組件: ${analysis.jsUsage.length}/${Object.keys(bootstrapJS).length}`);
    console.log(`  • 預估減少大小: ~${370 - Math.round(220 * analysis.usedComponents.length / Object.keys(bootstrapComponents).length) - Math.round(150 * analysis.jsUsage.length / Object.keys(bootstrapJS).length)}KB`);
    console.log('\n📄 請查看詳細報告: docs/reports/BOOTSTRAP_OPTIMIZATION_REPORT.md');
    
  } catch (error) {
    console.error('❌ 優化過程發生錯誤:', error);
    process.exit(1);
  }
}

main();