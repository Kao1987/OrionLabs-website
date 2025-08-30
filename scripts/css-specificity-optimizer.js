#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔧 OrionLabs CSS 特異性優化器');
console.log('========================================\n');

/**
 * 計算 CSS 選擇器特異性
 */
function calculateSpecificity(selector) {
  // 移除偽元素和偽類的複雜部分
  const cleanSelector = selector.replace(/::?[\w-]+(\([^)]*\))?/g, '');
  
  let ids = 0;
  let classes = 0; 
  let elements = 0;
  
  // 計算 ID 選擇器
  ids = (cleanSelector.match(/#[\w-]+/g) || []).length;
  
  // 計算類選擇器、屬性選擇器
  classes = (cleanSelector.match(/\.[\w-]+|\[[\w-]+.*?\]/g) || []).length;
  
  // 計算元素選擇器
  elements = (cleanSelector.match(/(?:^|[\s>+~])([a-z][\w-]*)/gi) || []).length;
  
  // 特異性值：inline(1000) + ids(100) + classes(10) + elements(1)
  return {
    value: ids * 100 + classes * 10 + elements,
    breakdown: { ids, classes, elements },
    selector: selector.trim()
  };
}

/**
 * 分析 CSS 檔案中的 !important 使用
 */
function analyzeImportantUsage(cssContent, filePath) {
  console.log(`📊 分析 ${filePath}...`);
  
  const rules = [];
  const importantMatches = cssContent.matchAll(/([^{]*)\{([^}]*!important[^}]*)\}/gs);
  
  for (const match of importantMatches) {
    const selector = match[1].trim();
    const declarations = match[2];
    const importantDeclarations = declarations.match(/[^;]*!important[^;]*/g) || [];
    
    const specificity = calculateSpecificity(selector);
    
    rules.push({
      selector,
      specificity,
      importantDeclarations,
      fullRule: match[0],
      filePath
    });
  }
  
  console.log(`   發現 ${rules.length} 個使用 !important 的規則\n`);
  return rules;
}

/**
 * 生成特異性優化建議
 */
function generateOptimizationSuggestions(rules) {
  console.log('💡 生成優化建議...\n');
  
  const suggestions = [];
  
  rules.forEach((rule, index) => {
    const { selector, specificity, importantDeclarations } = rule;
    
    // 低特異性但使用 !important 的情況
    if (specificity.value < 20 && importantDeclarations.length > 0) {
      suggestions.push({
        type: 'LOW_SPECIFICITY_IMPORTANT',
        priority: 'HIGH',
        rule,
        suggestion: `選擇器 "${selector}" 特異性很低 (${specificity.value})，可以通過增加特異性來移除 !important`,
        fix: generateAlternativeSelector(selector)
      });
    }
    
    // 多個 !important 的情況
    if (importantDeclarations.length > 3) {
      suggestions.push({
        type: 'MULTIPLE_IMPORTANT',
        priority: 'MEDIUM', 
        rule,
        suggestion: `選擇器 "${selector}" 有 ${importantDeclarations.length} 個 !important，建議拆分成多個規則`,
        fix: 'Split into multiple specific rules'
      });
    }
    
    // Bootstrap 覆蓋的情況
    if (selector.includes('btn') || selector.includes('card') || selector.includes('nav')) {
      suggestions.push({
        type: 'BOOTSTRAP_OVERRIDE',
        priority: 'LOW',
        rule,
        suggestion: `這可能是 Bootstrap 覆蓋，考慮使用 CSS 層級 (@layer) 來管理`,
        fix: 'Use @layer overrides'
      });
    }
  });
  
  return suggestions;
}

/**
 * 生成替代選擇器
 */
function generateAlternativeSelector(selector) {
  // 簡單的特異性增強策略
  if (selector.includes('.')) {
    return selector + selector.match(/\.[\w-]+/)?.[0] || '';
  }
  
  if (!selector.includes('#') && !selector.includes('[')) {
    return '.orion-app ' + selector;
  }
  
  return selector;
}

/**
 * 創建 CSS Layer 系統
 */
function createCSSLayerSystem() {
  console.log('🎨 創建 CSS Layer 系統...\n');
  
  const layerSystemContent = `/* === OrionLabs CSS Layer 系統 === */
/* 用於管理 CSS 特異性，減少 !important 使用 */

@layer reset, base, theme, components, overrides, utilities;

/* === Reset Layer (最低優先級) === */
@layer reset {
  /* CSS Reset 和 Normalize */
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
  }
}

/* === Base Layer === */
@layer base {
  /* 基礎 HTML 元素樣式 */
  body {
    font-family: var(--font-family-base);
    line-height: var(--line-height-base);
    color: var(--color-text-primary);
    background-color: var(--color-bg-primary);
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-tight);
    color: var(--color-text-primary);
  }
  
  a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }
  
  a:hover, a:focus {
    color: var(--color-primary-hover);
    text-decoration: underline;
  }
}

/* === Theme Layer === */
@layer theme {
  /* 主題相關的全域樣式 */
  [data-theme="dark"] {
    color-scheme: dark;
  }
  
  [data-theme="light"] {
    color-scheme: light;
  }
}

/* === Components Layer === */  
@layer components {
  /* BEM 組件樣式在這裡 */
  /* 這些樣式會自動載入更高的特異性 */
}

/* === Overrides Layer === */
@layer overrides {
  /* Bootstrap 和第三方庫的覆蓋 */
  /* 只在這裡使用 !important */
  
  /* Bootstrap 按鈕覆蓋 */
  .btn-primary {
    background-color: var(--color-primary) !important;
    border-color: var(--color-primary) !important;
  }
  
  .btn-primary:hover {
    background-color: var(--color-primary-hover) !important;
    border-color: var(--color-primary-hover) !important;
  }
}

/* === Utilities Layer (最高優先級) === */
@layer utilities {
  /* 工具類，可以安全使用 !important */
  .d-none {
    display: none !important;
  }
  
  .sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }
}
`;

  const outputPath = path.join(projectRoot, 'src/assets/css/orion-layer-system.css');
  fs.writeFileSync(outputPath, layerSystemContent);
  
  console.log('✅ 已創建 CSS Layer 系統: src/assets/css/orion-layer-system.css\n');
  return outputPath;
}

/**
 * 生成優化後的 CSS
 */
function generateOptimizedCSS(rules, suggestions) {
  console.log('🔄 生成優化後的 CSS...\n');
  
  let optimizedCSS = `/* === 優化後的 CSS === */
/* 移除了不必要的 !important，使用 CSS Layer 管理特異性 */

`;

  const highPrioritySuggestions = suggestions.filter(s => s.priority === 'HIGH');
  
  highPrioritySuggestions.forEach(suggestion => {
    const { rule, fix } = suggestion;
    const optimizedSelector = fix === 'Split into multiple specific rules' ? rule.selector : fix;
    
    // 移除 !important
    const declarations = rule.importantDeclarations.map(decl => 
      decl.replace(/\s*!important\s*/g, '')
    ).join(';\n  ');
    
    optimizedCSS += `/* 優化前: ${rule.selector} */
${optimizedSelector} {
  ${declarations};
}

`;
  });
  
  return optimizedCSS;
}

/**
 * 主執行函數
 */
async function main() {
  try {
    console.log('開始分析 CSS 特異性和 !important 使用...\n');
    
    // 獲取所有 CSS 檔案
    const cssFiles = await glob('src/assets/**/*.css', {
      cwd: projectRoot,
      absolute: true
    });
    
    let allRules = [];
    
    // 分析每個 CSS 檔案
    for (const file of cssFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const relativePath = path.relative(projectRoot, file);
      const rules = analyzeImportantUsage(content, relativePath);
      allRules = allRules.concat(rules);
    }
    
    console.log(`📈 總計發現 ${allRules.length} 個使用 !important 的規則\n`);
    
    // 按特異性排序
    allRules.sort((a, b) => a.specificity.value - b.specificity.value);
    
    // 顯示特異性統計
    console.log('📊 特異性統計:');
    const specificityGroups = {
      low: allRules.filter(r => r.specificity.value < 20),
      medium: allRules.filter(r => r.specificity.value >= 20 && r.specificity.value < 50),
      high: allRules.filter(r => r.specificity.value >= 50)
    };
    
    console.log(`   低特異性 (<20): ${specificityGroups.low.length} 個`);
    console.log(`   中特異性 (20-49): ${specificityGroups.medium.length} 個`);
    console.log(`   高特異性 (≥50): ${specificityGroups.high.length} 個\n`);
    
    // 生成優化建議
    const suggestions = generateOptimizationSuggestions(allRules);
    
    console.log(`💡 生成了 ${suggestions.length} 個優化建議:`);
    suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. [${suggestion.priority}] ${suggestion.suggestion}`);
    });
    console.log();
    
    // 創建 CSS Layer 系統
    createCSSLayerSystem();
    
    // 生成優化後的 CSS
    const optimizedCSS = generateOptimizedCSS(allRules, suggestions);
    const optimizedPath = path.join(projectRoot, 'src/assets/css/orion-optimized-specificity.css');
    fs.writeFileSync(optimizedPath, optimizedCSS);
    
    console.log('✅ 已生成優化後的 CSS: src/assets/css/orion-optimized-specificity.css\n');
    
    // 生成報告
    const report = `# CSS 特異性優化報告

**生成時間:** ${new Date().toLocaleString('zh-TW')}
**分析規則:** ${allRules.length} 個使用 !important 的規則

## 📊 特異性分布

- **低特異性 (<20):** ${specificityGroups.low.length} 個 (${(specificityGroups.low.length/allRules.length*100).toFixed(1)}%)
- **中特異性 (20-49):** ${specificityGroups.medium.length} 個 (${(specificityGroups.medium.length/allRules.length*100).toFixed(1)}%)
- **高特異性 (≥50):** ${specificityGroups.high.length} 個 (${(specificityGroups.high.length/allRules.length*100).toFixed(1)}%)

## 🎯 優化建議總結

| 優先級 | 數量 | 說明 |
|--------|------|------|
| 高 | ${suggestions.filter(s => s.priority === 'HIGH').length} | 可立即優化，移除 !important |
| 中 | ${suggestions.filter(s => s.priority === 'MEDIUM').length} | 建議重構，改善結構 |
| 低 | ${suggestions.filter(s => s.priority === 'LOW').length} | 可使用 CSS Layer 管理 |

## 🔧 實施步驟

1. ✅ 建立 CSS Layer 系統
2. ⏳ 重構低特異性的 !important 使用
3. ⏳ 實施 Bootstrap 覆蓋層級管理
4. ⏳ 更新組件 CSS 以使用正確的特異性

## 📈 預期改善

- **!important 減少:** 預計減少 ${Math.round(suggestions.filter(s => s.priority === 'HIGH').length * 0.8)} 個不必要的使用
- **維護性提升:** 更清晰的 CSS 架構
- **性能改善:** 減少樣式計算複雜度

---
*此報告由 OrionLabs CSS 特異性優化器自動生成*
`;

    const reportPath = path.join(projectRoot, 'docs/reports/CSS_SPECIFICITY_OPTIMIZATION_REPORT.md');
    fs.writeFileSync(reportPath, report);
    
    console.log('✅ 已生成優化報告: docs/reports/CSS_SPECIFICITY_OPTIMIZATION_REPORT.md\n');
    
    console.log('🎉 CSS 特異性優化完成！');
    console.log('\n📋 下一步建議:');
    console.log('1. 將 orion-layer-system.css 加入到 main.ts');
    console.log('2. 測試網站功能是否正常');
    console.log('3. 逐步移除不必要的 !important');
    console.log('4. 運行性能測試驗證改善效果');
    
  } catch (error) {
    console.error('❌ 優化過程中發生錯誤:', error);
    process.exit(1);
  }
}

// 執行主函數
main();