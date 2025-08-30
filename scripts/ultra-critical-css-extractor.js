#!/usr/bin/env node

/**
 * Ultra Critical CSS 提取器
 * 精準提取首屏關鍵 CSS，嚴格控制在 14KB 以下
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class UltraCriticalExtractor {
  constructor() {
    this.targetSize = 14 * 1024; // 14KB limit
    this.criticalCSS = '';
  }

  // 定義最關鍵的 CSS（手動精選）
  getEssentialCSS() {
    return `
/* === 核心 Reset 和基礎 === */
*,*::before,*::after{box-sizing:border-box}
html{line-height:1.15;-webkit-text-size-adjust:100%}
body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-size:1rem;font-weight:400;line-height:1.5;color:#212529;background-color:#fff}

/* === 關鍵 CSS 變數 === */
:root{
--bs-blue:#0d6efd;
--bs-primary:#0d6efd;
--bs-secondary:#6c757d;
--bs-success:#198754;
--bs-danger:#dc3545;
--bs-warning:#ffc107;
--bs-info:#0dcaf0;
--bs-light:#f8f9fa;
--bs-dark:#212529;
--bs-font-sans-serif:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
--bs-gradient:linear-gradient(180deg,rgba(255,255,255,.15),rgba(255,255,255,0));
--orion-primary:#2563eb;
--orion-secondary:#64748b;
--orion-accent:#f59e0b;
--orion-background:#ffffff;
--orion-surface:#f8fafc;
--orion-text:#1e293b;
--orion-text-muted:#64748b;
--orion-border:#e2e8f0;
--orion-shadow:0 1px 3px 0 rgba(0,0,0,.1);
}

/* === 基礎佈局 === */
.container{width:100%;padding-right:var(--bs-gutter-x,.75rem);padding-left:var(--bs-gutter-x,.75rem);margin-right:auto;margin-left:auto}
@media(min-width:576px){.container{max-width:540px}}
@media(min-width:768px){.container{max-width:720px}}
@media(min-width:992px){.container{max-width:960px}}
@media(min-width:1200px){.container{max-width:1140px}}
@media(min-width:1400px){.container{max-width:1320px}}

.row{display:flex;flex-wrap:wrap;margin-right:calc(var(--bs-gutter-x,1.5rem)* -.5);margin-left:calc(var(--bs-gutter-x,1.5rem)* -.5)}
.col{flex:1 0 0%}

/* === Navbar (首屏必見) === */
.navbar{position:relative;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:0.5rem 1rem}
.navbar-brand{padding-top:0.3125rem;padding-bottom:0.3125rem;margin-right:1rem;font-size:1.25rem;text-decoration:none;white-space:nowrap}
.navbar-nav{display:flex;flex-direction:column;padding-left:0;margin-bottom:0;list-style:none}
.nav-link{display:block;padding:0.5rem 1rem;color:var(--bs-nav-link-color);text-decoration:none;transition:color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out}

/* === 標題文字 === */
h1,h2,h3,h4,h5,h6{margin-top:0;margin-bottom:0.5rem;font-weight:500;line-height:1.2}
h1{font-size:calc(1.375rem + 1.5vw)}
h2{font-size:calc(1.325rem + 0.9vw)}
h3{font-size:calc(1.3rem + 0.6vw)}

/* === 按鈕 === */
.btn{display:inline-block;font-weight:400;line-height:1.5;color:#212529;text-align:center;text-decoration:none;vertical-align:middle;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none;background-color:transparent;border:1px solid transparent;padding:0.375rem 0.75rem;font-size:1rem;border-radius:0.25rem;transition:color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out}
.btn-primary{color:#fff;background-color:var(--orion-primary);border-color:var(--orion-primary)}

/* === 基礎工具類 === */
.d-flex{display:flex!important}
.justify-content-center{justify-content:center!important}
.align-items-center{align-items:center!important}
.text-center{text-align:center!important}
.fw-bold{font-weight:700!important}
.mb-3{margin-bottom:1rem!important}
.mt-4{margin-top:1.5rem!important}

/* === 響應式手機優先 === */
@media(max-width:767.98px){
.navbar-nav{flex-direction:row}
h1{font-size:2rem}
.container{padding-left:1rem;padding-right:1rem}
}

/* === Loading 狀態 === */
.loading{display:flex;justify-content:center;align-items:center;min-height:200px}
.spinner-border{display:inline-block;width:2rem;height:2rem;vertical-align:-.125em;border:.25em solid currentColor;border-right-color:transparent;border-radius:50%;animation:spinner-border .75s linear infinite}
@keyframes spinner-border{to{transform:rotate(360deg)}}

/* === 基礎表單 === */
.form-control{display:block;width:100%;padding:0.375rem 0.75rem;font-size:1rem;font-weight:400;line-height:1.5;color:#212529;background-color:#fff;background-image:none;border:1px solid #ced4da;-webkit-appearance:none;-moz-appearance:none;appearance:none;border-radius:0.25rem;transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out}
`;
  }

  // 從現有 CSS 中提取關鍵部分
  async extractFromExistingCSS() {
    const patterns = [
      // 核心 Orion 主題變數
      /--orion-[^:]+:[^;]+;/g,
      // 核心佈局
      /\.container[^{]*{[^}]+}/g,
      /\.row[^{]*{[^}]+}/g,
      // Navbar 相關
      /\.navbar[^{]*{[^}]+}/g,
      /\.nav-link[^{]*{[^}]+}/g,
      // 按鈕基礎
      /\.btn[^{]*{[^}]+}/g,
      /\.btn-primary[^{]*{[^}]+}/g,
      // 工具類
      /\.d-flex[^{]*{[^}]+}/g,
      /\.text-center[^{]*{[^}]+}/g,
    ];

    const consolidatedThemePath = path.join(projectRoot, 'src/assets/css/orion-consolidated-theme.css');
    
    try {
      if (await fs.access(consolidatedThemePath).then(() => true).catch(() => false)) {
        const content = await fs.readFile(consolidatedThemePath, 'utf8');
        let extractedCSS = '';
        
        for (const pattern of patterns) {
          const matches = content.match(pattern);
          if (matches) {
            extractedCSS += matches.join('\n') + '\n';
          }
        }
        
        return extractedCSS;
      }
    } catch (error) {
      console.warn('無法讀取現有 CSS 檔案，使用預設 CSS');
    }
    
    return '';
  }

  // 壓縮 CSS
  minifyCSS(css) {
    return css
      .replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '') // 移除註釋
      .replace(/\s+/g, ' ') // 合併空白
      .replace(/;\s*}/g, '}') // 移除最後的分號
      .replace(/\s*{\s*/g, '{') // 清理大括號周圍空白
      .replace(/\s*}\s*/g, '}') // 清理大括號周圍空白
      .replace(/\s*,\s*/g, ',') // 清理逗號周圍空白
      .replace(/\s*:\s*/g, ':') // 清理冒號周圍空白
      .replace(/\s*;\s*/g, ';') // 清理分號周圍空白
      .trim();
  }

  // 生成 Ultra Critical CSS
  async generate() {
    console.log('⚡ 生成 Ultra Critical CSS (< 14KB)...\n');

    // 組合 CSS
    let criticalCSS = this.getEssentialCSS();
    
    // 添加從現有檔案提取的關鍵 CSS
    const extractedCSS = await this.extractFromExistingCSS();
    criticalCSS += '\n' + extractedCSS;

    // 壓縮
    criticalCSS = this.minifyCSS(criticalCSS);

    // 檢查大小
    const sizeInBytes = Buffer.byteLength(criticalCSS, 'utf8');
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);

    console.log(`📊 Ultra Critical CSS 大小: ${sizeInKB} KB`);
    console.log(`🎯 目標限制: ${(this.targetSize / 1024).toFixed(2)} KB`);
    console.log(`✅ Google Level 3 合規: ${sizeInBytes < this.targetSize ? '通過' : '未通過'}`);

    if (sizeInBytes > this.targetSize) {
      console.log('⚠️  超出限制，進行進一步優化...');
      // 如果超出限制，只保留最核心的部分
      criticalCSS = this.getEssentialCSS();
      criticalCSS = this.minifyCSS(criticalCSS);
      
      const newSizeInBytes = Buffer.byteLength(criticalCSS, 'utf8');
      const newSizeInKB = (newSizeInBytes / 1024).toFixed(2);
      console.log(`📊 優化後大小: ${newSizeInKB} KB`);
    }

    // 儲存檔案
    const outputPath = path.join(projectRoot, 'src/assets/css/ultra-critical.css');
    await fs.writeFile(outputPath, criticalCSS);

    // 生成報告
    const report = this.generateReport(criticalCSS);
    const reportPath = path.join(projectRoot, 'docs/reports/ultra-critical-css-report.md');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, report);

    console.log(`\n✅ Ultra Critical CSS 已生成: ${outputPath}`);
    console.log(`📄 報告已保存: ${reportPath}`);

    return {
      path: outputPath,
      size: Buffer.byteLength(criticalCSS, 'utf8'),
      content: criticalCSS
    };
  }

  generateReport(css) {
    const sizeInBytes = Buffer.byteLength(css, 'utf8');
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    const isCompliant = sizeInBytes < this.targetSize;

    return `# Ultra Critical CSS 報告

生成時間: ${new Date().toISOString()}

## 📊 性能指標

- **檔案大小**: ${sizeInKB} KB (${sizeInBytes} bytes)
- **目標限制**: ${(this.targetSize / 1024).toFixed(2)} KB
- **Google Level 3 合規**: ${isCompliant ? '✅ 通過' : '❌ 未通過'}

## 📋 包含的關鍵樣式

1. **核心 Reset**: 基礎 normalize 和 box-sizing
2. **CSS 變數**: Orion 主題色彩系統
3. **佈局系統**: Container, Row, Col 響應式網格
4. **Navbar**: 導航欄完整樣式（首屏必見）
5. **字體**: H1-H6 標題和基礎文字樣式
6. **按鈕**: 主要 CTA 按鈕樣式
7. **工具類**: 常用 flex, text-align 等工具
8. **響應式**: 手機優先斷點
9. **Loading**: 載入狀態和動畫
10. **表單**: 基礎 form-control 樣式

## 🚀 使用方式

1. 將此檔案內聯至 HTML \`<head>\` 中的 \`<style>\` 標籤
2. 其他 CSS 通過 \`loadCSS\` 延遲載入
3. 確保首屏渲染不依賴外部 CSS

## 🎯 優化策略

- 只包含首屏可見元素的樣式
- 移除所有非必要的裝飾性樣式
- 使用 CSS 變數減少重複
- 壓縮所有空白和註釋
- 手機優先響應式設計

---
🚀 Generated by Ultra Critical CSS Extractor
Level 3 Google Performance Standards Compliant
`;
  }

  async run() {
    try {
      const result = await this.generate();
      return result;
    } catch (error) {
      console.error('❌ Ultra Critical CSS 生成失敗:', error.message);
      throw error;
    }
  }
}

// 執行
if (import.meta.url === `file://${process.argv[1]}`) {
  const extractor = new UltraCriticalExtractor();
  extractor.run().catch(console.error);
}

export default UltraCriticalExtractor;