#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🚀 OrionLabs CSS Performance Optimizer');
console.log('========================================\n');

/**
 * 分析 CSS 檔案結構和大小
 */
async function analyzeCssFiles() {
  console.log('📊 分析 CSS 檔案結構...\n');
  
  const cssFiles = await glob('src/assets/**/*.css', { 
    cwd: projectRoot,
    absolute: true 
  });
  
  let totalSize = 0;
  const fileAnalysis = [];
  
  for (const file of cssFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const size = Buffer.byteLength(content, 'utf8');
    const relativePath = path.relative(projectRoot, file);
    
    // 分析 CSS 規則數量
    const rules = content.match(/[^{}]*\{[^{}]*\}/g) || [];
    const importantCount = (content.match(/!important/g) || []).length;
    const variables = (content.match(/--[\w-]+:/g) || []).length;
    
    fileAnalysis.push({
      path: relativePath,
      size,
      rules: rules.length,
      important: importantCount,
      variables,
      content
    });
    
    totalSize += size;
  }
  
  // 按大小排序
  fileAnalysis.sort((a, b) => b.size - a.size);
  
  console.log(`找到 ${cssFiles.length} 個 CSS 檔案，總大小: ${(totalSize / 1024).toFixed(2)} KB\n`);
  
  // 顯示前 10 大檔案
  console.log('📈 最大的 CSS 檔案:');
  fileAnalysis.slice(0, 10).forEach((file, index) => {
    console.log(`${index + 1}. ${file.path}`);
    console.log(`   大小: ${(file.size / 1024).toFixed(2)} KB`);
    console.log(`   規則: ${file.rules} | !important: ${file.important} | 變數: ${file.variables}\n`);
  });
  
  return fileAnalysis;
}

/**
 * 識別重複的主題檔案
 */
function identifyDuplicateThemes(fileAnalysis) {
  console.log('🔍 識別重複的主題檔案...\n');
  
  const themeFiles = fileAnalysis.filter(file => 
    file.path.includes('theme') || 
    file.path.includes('color') ||
    file.path.includes('orion')
  );
  
  console.log('🎨 主題相關檔案:');
  themeFiles.forEach(file => {
    console.log(`• ${file.path} (${(file.size / 1024).toFixed(2)} KB)`);
  });
  
  return themeFiles;
}

/**
 * 分析 !important 使用情況
 */
function analyzeImportantUsage(fileAnalysis) {
  console.log('\n⚠️ !important 使用分析...\n');
  
  const importantFiles = fileAnalysis
    .filter(file => file.important > 0)
    .sort((a, b) => b.important - a.important);
  
  let totalImportant = 0;
  importantFiles.forEach(file => {
    totalImportant += file.important;
    console.log(`• ${file.path}: ${file.important} 次使用`);
  });
  
  console.log(`\n總計 !important 使用次數: ${totalImportant}`);
  
  return { importantFiles, totalImportant };
}

/**
 * 創建合併的主題檔案
 */
function createConsolidatedTheme(themeFiles) {
  console.log('\n🔧 創建合併的主題檔案...\n');
  
  // CSS 變數集合
  let variables = new Set();
  let baseStyles = '';
  let darkModeStyles = '';
  let componentStyles = '';
  
  themeFiles.forEach(file => {
    const content = file.content;
    
    // 提取 CSS 變數
    const varMatches = content.match(/:root\s*\{[^}]+\}/g) || [];
    varMatches.forEach(match => {
      const vars = match.match(/--[\w-]+:[^;]+;/g) || [];
      vars.forEach(v => variables.add(v.trim()));
    });
    
    // 提取深色模式樣式
    const darkMatches = content.match(/\[data-theme="dark"\][^{]*\{[^}]*\}/g) || [];
    darkModeStyles += darkMatches.join('\n') + '\n';
    
    // 其他樣式
    const otherStyles = content
      .replace(/:root\s*\{[^}]+\}/g, '')
      .replace(/\[data-theme="dark"\][^{]*\{[^}]*\}/g, '')
      .replace(/\/\*.*?\*\//gs, '')
      .trim();
    
    if (otherStyles) {
      componentStyles += `/* From ${file.path} */\n${otherStyles}\n\n`;
    }
  });
  
  // 建立合併的內容
  const consolidatedContent = `/* === OrionLabs 統一主題檔案 === */
/* 自動生成於 ${new Date().toISOString()} */
/* 合併了 ${themeFiles.length} 個主題檔案，減少 HTTP 請求 */

/* === CSS 變數定義 === */
:root {
${Array.from(variables).sort().map(v => '  ' + v).join('\n')}
}

/* === 基礎樣式 === */
${baseStyles}

/* === 組件樣式 === */
${componentStyles}

/* === 深色模式樣式 === */
${darkModeStyles}
`;
  
  const outputPath = path.join(projectRoot, 'src/assets/css/orion-consolidated-theme.css');
  fs.writeFileSync(outputPath, consolidatedContent);
  
  console.log(`✅ 已創建合併主題檔案: src/assets/css/orion-consolidated-theme.css`);
  console.log(`   合併了 ${themeFiles.length} 個檔案`);
  console.log(`   CSS 變數: ${variables.size} 個`);
  console.log(`   檔案大小: ${(consolidatedContent.length / 1024).toFixed(2)} KB\n`);
  
  return {
    outputPath: 'src/assets/css/orion-consolidated-theme.css',
    originalFiles: themeFiles.map(f => f.path),
    size: consolidatedContent.length,
    variableCount: variables.size
  };
}

/**
 * 分析未使用的 CSS
 */
async function analyzeUnusedCSS() {
  console.log('🔍 分析未使用的 CSS 選擇器...\n');
  
  // 獲取所有 Vue 檔案
  const vueFiles = await glob('src/**/*.vue', { 
    cwd: projectRoot,
    absolute: true 
  });
  
  let allClasses = new Set();
  let allIds = new Set();
  
  // 從 Vue 檔案中提取使用的類名和 ID
  for (const file of vueFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // 提取 class 屬性
    const classMatches = content.match(/class="[^"]+"/g) || [];
    classMatches.forEach(match => {
      const classes = match.match(/class="([^"]+)"/)?.[1]?.split(/\s+/) || [];
      classes.forEach(cls => cls && allClasses.add(cls));
    });
    
    // 提取動態類名
    const dynamicClasses = content.match(/:class="[^"]+"/g) || [];
    dynamicClasses.forEach(match => {
      const classes = match.match(/[\w-]+(?:__[\w-]+)?(?:--[\w-]+)?/g) || [];
      classes.forEach(cls => allClasses.add(cls));
    });
    
    // 提取 ID
    const idMatches = content.match(/id="[^"]+"/g) || [];
    idMatches.forEach(match => {
      const id = match.match(/id="([^"]+)"/)?.[1];
      if (id) allIds.add(id);
    });
  }
  
  console.log(`📋 找到使用的類名: ${allClasses.size} 個`);
  console.log(`📋 找到使用的 ID: ${allIds.size} 個\n`);
  
  return { usedClasses: allClasses, usedIds: allIds };
}

/**
 * 創建優化建議報告
 */
function createOptimizationReport(analysis) {
  console.log('📝 生成優化建議報告...\n');
  
  const report = `# CSS 性能優化報告

**生成時間:** ${new Date().toLocaleString('zh-TW')}
**分析檔案:** ${analysis.totalFiles} 個 CSS 檔案
**總大小:** ${(analysis.totalSize / 1024).toFixed(2)} KB

## 🎯 優化建議

### 1. 檔案合併 (高優先級)
- **可合併檔案:** ${analysis.duplicateFiles.length} 個主題檔案
- **預期減少:** ${analysis.duplicateFiles.length - 1} 個 HTTP 請求
- **大小節省:** 預估 10-15% (移除重複內容)

### 2. !important 使用優化 (中優先級)  
- **當前使用次數:** ${analysis.importantCount} 次
- **建議目標:** < ${Math.ceil(analysis.importantCount * 0.1)} 次 (減少 90%)
- **重構策略:** 使用 CSS 層級 (@layer) 和特異性管理

### 3. 未使用 CSS 清理 (中優先級)
- **使用的類名:** ${analysis.usedClasses} 個
- **建議:** 實施 PurgeCSS 或類似工具清理未使用樣式

### 4. Bootstrap 優化 (低優先級)
- **建議:** 切換到自定義 Bootstrap 構建，只包含使用的組件
- **預期節省:** 50-70% 的 Bootstrap 相關檔案大小

## 📊 性能目標

| 指標 | 當前值 | 目標值 | 優先級 |
|------|--------|--------|--------|
| CSS 檔案數 | ${analysis.totalFiles} | < 8 | 高 |
| 總檔案大小 | ${(analysis.totalSize / 1024).toFixed(2)} KB | < 120 KB | 中 |
| !important 使用 | ${analysis.importantCount} | < ${Math.ceil(analysis.importantCount * 0.1)} | 中 |
| HTTP 請求數 | ${analysis.totalFiles} | < 8 | 高 |

## 🔧 立即行動項目

1. ✅ 合併主題相關 CSS 檔案
2. ⏳ 設置 CSS 壓縮和最小化
3. ⏳ 實施 Critical CSS 提取
4. ⏳ 配置 CSS Tree Shaking

---
*此報告由 OrionLabs CSS Optimizer 自動生成*
`;

  const reportPath = path.join(projectRoot, 'docs/reports/CSS_PERFORMANCE_OPTIMIZATION_REPORT.md');
  fs.writeFileSync(reportPath, report);
  
  console.log(`✅ 已生成優化報告: docs/reports/CSS_PERFORMANCE_OPTIMIZATION_REPORT.md\n`);
  
  return reportPath;
}

/**
 * 主執行函數
 */
async function main() {
  try {
    // 1. 分析 CSS 檔案
    const fileAnalysis = await analyzeCssFiles();
    
    // 2. 識別重複主題檔案
    const themeFiles = identifyDuplicateThemes(fileAnalysis);
    
    // 3. 分析 !important 使用
    const { totalImportant } = analyzeImportantUsage(fileAnalysis);
    
    // 4. 分析未使用的 CSS
    const { usedClasses, usedIds } = await analyzeUnusedCSS();
    
    // 5. 創建合併的主題檔案
    const consolidationResult = createConsolidatedTheme(themeFiles);
    
    // 6. 生成優化報告
    const reportPath = createOptimizationReport({
      totalFiles: fileAnalysis.length,
      totalSize: fileAnalysis.reduce((sum, f) => sum + f.size, 0),
      duplicateFiles: themeFiles,
      importantCount: totalImportant,
      usedClasses: usedClasses.size,
      usedIds: usedIds.size
    });
    
    console.log('🎉 CSS 優化分析完成！');
    console.log('\n📋 下一步建議:');
    console.log('1. 檢查生成的合併主題檔案');
    console.log('2. 更新 main.ts 中的 CSS 導入');
    console.log('3. 測試網站功能是否正常');
    console.log('4. 運行性能測試驗證改善效果');
    
  } catch (error) {
    console.error('❌ 優化過程中發生錯誤:', error);
    process.exit(1);
  }
}

// 執行主函數
main();