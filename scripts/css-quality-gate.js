#!/usr/bin/env node

/**
 * CSS 品質檢測閘道 - Google Level 3 自動化檢測
 * 自動化 CSS 品質檢測，確保符合 Google 標準
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class CSSQualityGate {
  constructor() {
    this.standards = {
      level3: {
        criticalCSS: 14 * 1024,      // 14KB
        totalCSS: 120 * 1024,       // 120KB  
        fileCount: 8,               // 8 files
        importantUsage: 10,         // 10%
        renderBlocking: 50 * 1024,  // 50KB
        minificationRatio: 0.3,     // 30% compression
        duplicateRules: 5,          // <5% duplicate
        unusedCSS: 20               // <20% unused
      }
    };
    
    this.results = {
      passed: false,
      score: 0,
      level: 'Critical',
      issues: [],
      recommendations: []
    };
  }

  // 分析 CSS 品質指標
  async analyzeQuality() {
    console.log('🔍 執行 CSS 品質檢測閘道...\n');
    
    const cssFiles = await glob('src/assets/css/0[1-8]-*.css', { 
      cwd: projectRoot,
      absolute: true 
    });
    
    const metrics = await this.gatherMetrics(cssFiles);
    const issues = this.identifyIssues(metrics);
    const score = this.calculateQualityScore(metrics, issues);
    const level = this.determineLevel(score);
    
    this.results = {
      passed: score >= 90 && issues.filter(i => i.severity === 'critical').length === 0,
      score,
      level,
      metrics,
      issues,
      recommendations: this.generateRecommendations(issues)
    };
    
    return this.results;
  }

  // 收集指標數據
  async gatherMetrics(cssFiles) {
    const metrics = {
      fileCount: cssFiles.length,
      totalSize: 0,
      criticalSize: 0,
      renderBlockingSize: 0,
      totalRules: 0,
      importantCount: 0,
      duplicateRules: 0,
      unusedSelectors: 0,
      minificationPotential: 0
    };
    
    let allRules = new Set();
    let duplicateCount = 0;
    
    for (const file of cssFiles) {
      const content = await fs.readFile(file, 'utf8');
      const filename = path.basename(file);
      const size = Buffer.byteLength(content, 'utf8');
      
      metrics.totalSize += size;
      
      // Critical CSS 檢測
      if (filename.includes('01-critical')) {
        metrics.criticalSize = size;
      }
      
      // 渲染阻塞 CSS
      if (filename.match(/0[1-3]-/)) {
        metrics.renderBlockingSize += size;
      }
      
      // 分析規則
      const rules = content.match(/[^{}]+\{[^}]+\}/g) || [];
      const importantRules = content.match(/!important/g) || [];
      
      metrics.totalRules += rules.length;
      metrics.importantCount += importantRules.length;
      
      // 檢測重複規則
      for (const rule of rules) {
        const cleanRule = rule.replace(/\s+/g, ' ').trim();
        if (allRules.has(cleanRule)) {
          duplicateCount++;
        }
        allRules.add(cleanRule);
      }
      
      // 計算壓縮潜力
      const minified = content.replace(/\s+/g, ' ').replace(/;\s*}/g, '}').trim();
      const compressionRatio = 1 - (minified.length / content.length);
      metrics.minificationPotential = Math.max(metrics.minificationPotential, compressionRatio);
    }
    
    metrics.duplicateRules = duplicateCount;
    metrics.importantUsage = metrics.totalRules > 0 ? 
      (metrics.importantCount / metrics.totalRules * 100) : 0;
    metrics.duplicateRatio = metrics.totalRules > 0 ?
      (duplicateCount / metrics.totalRules * 100) : 0;
    
    return metrics;
  }

  // 識別問題
  identifyIssues(metrics) {
    const issues = [];
    const standards = this.standards.level3;
    
    // Critical CSS 大小檢查
    if (metrics.criticalSize > standards.criticalCSS) {
      issues.push({
        severity: 'critical',
        category: 'performance',
        issue: 'Critical CSS 過大',
        current: `${(metrics.criticalSize / 1024).toFixed(2)}KB`,
        target: `${(standards.criticalCSS / 1024).toFixed(2)}KB`,
        impact: 'First Contentful Paint 延遲',
        fix: '移除非首屏關鍵樣式，精簡 Critical CSS'
      });
    }
    
    // 總 CSS 大小檢查
    if (metrics.totalSize > standards.totalCSS) {
      issues.push({
        severity: 'high',
        category: 'performance', 
        issue: '總 CSS 大小過大',
        current: `${(metrics.totalSize / 1024).toFixed(2)}KB`,
        target: `${(standards.totalCSS / 1024).toFixed(2)}KB`,
        impact: '頁面載入時間增加',
        fix: '啟用 CSS Tree Shaking，移除未使用的樣式'
      });
    }
    
    // 檔案數量檢查
    if (metrics.fileCount > standards.fileCount) {
      issues.push({
        severity: 'medium',
        category: 'network',
        issue: 'CSS 檔案數量過多', 
        current: `${metrics.fileCount} 個`,
        target: `${standards.fileCount} 個`,
        impact: 'HTTP 請求數過多',
        fix: '進一步整合 CSS 檔案'
      });
    }
    
    // !important 使用率檢查
    if (metrics.importantUsage > standards.importantUsage) {
      issues.push({
        severity: 'high',
        category: 'maintainability',
        issue: '!important 使用率過高',
        current: `${metrics.importantUsage.toFixed(1)}%`,
        target: `<${standards.importantUsage}%`,
        impact: 'CSS 維護性降低，特異性管理困難',
        fix: '使用 CSS Layer 和選擇器特異性優化'
      });
    }
    
    // 渲染阻塞 CSS 檢查
    if (metrics.renderBlockingSize > standards.renderBlocking) {
      issues.push({
        severity: 'critical',
        category: 'performance',
        issue: '渲染阻塞 CSS 過大',
        current: `${(metrics.renderBlockingSize / 1024).toFixed(2)}KB`,
        target: `${(standards.renderBlocking / 1024).toFixed(2)}KB`,
        impact: '首屏渲染被阻塞',
        fix: '延遲載入非關鍵 CSS，使用內聯 Critical CSS'
      });
    }
    
    // 重複規則檢查
    if (metrics.duplicateRatio > standards.duplicateRules) {
      issues.push({
        severity: 'medium',
        category: 'efficiency',
        issue: 'CSS 規則重複率過高',
        current: `${metrics.duplicateRatio.toFixed(1)}%`,
        target: `<${standards.duplicateRules}%`,
        impact: '檔案大小增加，載入效率降低',
        fix: '去除重複規則，優化 CSS 組織結構'
      });
    }
    
    // 壓縮潜力檢查
    if (metrics.minificationPotential > standards.minificationRatio) {
      issues.push({
        severity: 'low',
        category: 'optimization',
        issue: 'CSS 壓縮不足',
        current: `可壓縮 ${(metrics.minificationPotential * 100).toFixed(1)}%`,
        target: `<${(standards.minificationRatio * 100).toFixed(1)}%`,
        impact: '檔案大小可進一步優化',
        fix: '啟用生產環境 CSS 壓縮'
      });
    }
    
    return issues;
  }

  // 計算品質評分
  calculateQualityScore(metrics, issues) {
    let score = 100;
    
    // 根據問題嚴重程度扣分
    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }
    
    // 品質加分項目
    if (metrics.criticalSize < this.standards.level3.criticalCSS * 0.7) {
      score += 5; // Critical CSS 優秀
    }
    
    if (metrics.importantUsage < this.standards.level3.importantUsage * 0.5) {
      score += 5; // !important 使用優秀
    }
    
    if (metrics.fileCount <= this.standards.level3.fileCount) {
      score += 3; // 檔案數量符合標準
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // 決定品質等級
  determineLevel(score) {
    if (score >= 90) return 'Level 3';
    if (score >= 80) return 'Level 2';
    if (score >= 70) return 'Level 1';
    if (score >= 60) return 'Basic';
    if (score >= 50) return 'Warning';
    return 'Critical';
  }

  // 生成改進建議
  generateRecommendations(issues) {
    const recommendations = [];
    
    // 按嚴重程度分組建議
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const highIssues = issues.filter(i => i.severity === 'high');
    const mediumIssues = issues.filter(i => i.severity === 'medium');
    
    if (criticalIssues.length > 0) {
      recommendations.push({
        priority: 'P0 - 立即處理',
        issues: criticalIssues.length,
        actions: [
          '立即修復所有 Critical 級別問題',
          '使用內聯 Critical CSS 技術',
          '實施延遲載入策略',
          '驗證首屏渲染性能'
        ]
      });
    }
    
    if (highIssues.length > 0) {
      recommendations.push({
        priority: 'P1 - 優先處理',
        issues: highIssues.length,
        actions: [
          '執行 CSS Tree Shaking',
          '優化 !important 使用',
          '實施 CSS Layer 架構',
          '監控檔案大小增長'
        ]
      });
    }
    
    if (mediumIssues.length > 0) {
      recommendations.push({
        priority: 'P2 - 計畫處理',
        issues: mediumIssues.length,
        actions: [
          '整合 CSS 檔案',
          '去除重複規則',
          '優化 CSS 組織結構',
          '建立 CSS 編碼規範'
        ]
      });
    }
    
    // 通用建議
    recommendations.push({
      priority: '持續改進',
      issues: 0,
      actions: [
        '建立 CSS 性能監控',
        '實施自動化品質檢測',
        '定期執行 CSS 審核',
        '追蹤性能指標趨勢'
      ]
    });
    
    return recommendations;
  }

  // 生成詳細報告
  generateReport() {
    const { passed, score, level, metrics, issues, recommendations } = this.results;
    
    return `# CSS 品質檢測報告

生成時間: ${new Date().toISOString()}

## 🎯 檢測結果

### 綜合評估
- **品質評分**: ${score}/100
- **品質等級**: ${level}
- **Google Level 3**: ${passed ? '✅ 通過' : '❌ 未通過'}
- **檢測狀態**: ${passed ? '🟢 PASS' : '🔴 FAIL'}

### 核心指標

| 指標 | 當前值 | 標準值 | 狀態 |
|------|--------|--------|------|
| CSS 檔案數量 | ${metrics.fileCount} 個 | ≤ 8 個 | ${metrics.fileCount <= 8 ? '✅' : '❌'} |
| Critical CSS | ${(metrics.criticalSize / 1024).toFixed(2)} KB | ≤ 14 KB | ${metrics.criticalSize <= this.standards.level3.criticalCSS ? '✅' : '❌'} |
| 總 CSS 大小 | ${(metrics.totalSize / 1024).toFixed(2)} KB | ≤ 120 KB | ${metrics.totalSize <= this.standards.level3.totalCSS ? '✅' : '❌'} |
| 渲染阻塞 CSS | ${(metrics.renderBlockingSize / 1024).toFixed(2)} KB | ≤ 50 KB | ${metrics.renderBlockingSize <= this.standards.level3.renderBlocking ? '✅' : '❌'} |
| !important 使用率 | ${metrics.importantUsage.toFixed(1)}% | ≤ 10% | ${metrics.importantUsage <= this.standards.level3.importantUsage ? '✅' : '❌'} |
| 重複規則率 | ${metrics.duplicateRatio.toFixed(1)}% | ≤ 5% | ${metrics.duplicateRatio <= this.standards.level3.duplicateRules ? '✅' : '❌'} |

## ⚠️  識別問題

${issues.length > 0 ? issues.map(issue => `### ${issue.severity.toUpperCase()} - ${issue.issue}
- **類別**: ${issue.category}
- **當前狀況**: ${issue.current}
- **目標值**: ${issue.target}  
- **影響**: ${issue.impact}
- **修復建議**: ${issue.fix}
`).join('\n') : '✅ 未發現品質問題'}

## 🔧 改進建議

${recommendations.map(rec => `### ${rec.priority}
${rec.issues > 0 ? `- **問題數量**: ${rec.issues} 個` : ''}
- **行動項目**:
${rec.actions.map(action => `  - ${action}`).join('\n')}
`).join('\n')}

## 📊 品質門檻檢查

### 必須通過項目 (Critical)
${issues.filter(i => i.severity === 'critical').map(i => `- ❌ ${i.issue}`).join('\n') || '✅ 所有 Critical 項目通過'}

### 建議通過項目 (High)
${issues.filter(i => i.severity === 'high').map(i => `- ⚠️  ${i.issue}`).join('\n') || '✅ 所有 High 項目通過'}

## 🚀 下一步行動

${passed ? 
  '✅ CSS 品質符合 Google Level 3 標準，建議持續監控和優化' : 
  '❌ 需要修復上述問題才能達到 Google Level 3 標準'}

### 立即行動項目
1. 修復所有 Critical 級別問題
2. 實施 P0 優先級改進建議  
3. 建立持續監控機制
4. 安排定期品質檢測

---
🎯 Generated by CSS Quality Gate  
Google Level 3 Performance Standards
`;
  }

  // 主執行函數
  async run() {
    console.log('🚀 === CSS 品質檢測閘道 ===');
    console.log('自動化 CSS 品質檢測，確保 Google Level 3 標準\n');
    
    try {
      const results = await this.analyzeQuality();
      
      console.log('📊 === 檢測結果 ===');
      console.log(`品質評分: ${results.score}/100 (${results.level})`);
      console.log(`Critical 問題: ${results.issues.filter(i => i.severity === 'critical').length} 個`);
      console.log(`High 問題: ${results.issues.filter(i => i.severity === 'high').length} 個`);
      console.log(`總問題數: ${results.issues.length} 個`);
      console.log(`Google Level 3: ${results.passed ? '✅ 通過' : '❌ 未通過'}`);
      
      // 生成報告
      const report = this.generateReport();
      const reportPath = path.resolve(projectRoot, 'docs/reports/css-quality-gate-report.md');
      await fs.mkdir(path.dirname(reportPath), { recursive: true });
      await fs.writeFile(reportPath, report);
      
      console.log(`\n📄 詳細報告: ${path.relative(projectRoot, reportPath)}`);
      
      // 根據結果決定退出碼
      process.exit(results.passed ? 0 : 1);
      
    } catch (error) {
      console.error('❌ CSS 品質檢測失敗:', error.message);
      process.exit(1);
    }
  }
}

// 執行檢測
if (import.meta.url === `file://${process.argv[1]}`) {
  const gate = new CSSQualityGate();
  gate.run().catch(console.error);
}

export default CSSQualityGate;