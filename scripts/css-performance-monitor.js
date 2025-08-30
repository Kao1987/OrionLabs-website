#!/usr/bin/env node

/**
 * CSS 性能監控系統 - Google Level 3
 * 即時監控 CSS 載入性能、Critical CSS 大小、渲染指標
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class CSSPerformanceMonitor {
  constructor() {
    this.thresholds = {
      criticalCSS: 14 * 1024,      // 14KB
      totalCSS: 120 * 1024,       // 120KB  
      fileCount: 8,               // 8 files
      importantUsage: 10,         // 10%
      renderBlocking: 50 * 1024   // 50KB
    };
    
    this.metrics = {
      cssFileCount: 0,
      totalCSSSize: 0,
      criticalCSSSize: 0,
      renderBlockingSize: 0,
      importantUsage: 0,
      performanceScore: 0
    };
  }

  // 分析 CSS 檔案性能
  async analyzeCSSPerformance() {
    console.log('📊 分析 CSS 性能指標...\n');
    
    // 分析整合後的 CSS 檔案
    const cssFiles = await glob('src/assets/css/0[1-8]-*.css', { 
      cwd: projectRoot,
      absolute: true 
    });
    
    let totalSize = 0;
    let criticalSize = 0;
    let renderBlockingSize = 0;
    let importantCount = 0;
    let totalRules = 0;
    
    console.log('📄 CSS 檔案分析:');
    
    for (const file of cssFiles) {
      const stat = await fs.stat(file);
      const content = await fs.readFile(file, 'utf8');
      const filename = path.basename(file);
      
      // 計算基本指標
      const size = stat.size;
      const sizeKB = (size / 1024).toFixed(2);
      
      // 分析 !important 使用
      const rules = content.match(/[^{}]+\{[^}]+\}/g) || [];
      const importantRules = content.match(/!important/g) || [];
      
      totalSize += size;
      totalRules += rules.length;
      importantCount += importantRules.length;
      
      // Critical CSS 檢測
      if (filename.includes('01-critical')) {
        criticalSize = size;
      }
      
      // 渲染阻塞 CSS (前 3 個檔案)
      if (filename.match(/0[1-3]-/)) {
        renderBlockingSize += size;
      }
      
      console.log(`  📄 ${filename}: ${sizeKB}KB (${rules.length} rules, ${importantRules.length} !important)`);
    }
    
    this.metrics = {
      cssFileCount: cssFiles.length,
      totalCSSSize: totalSize,
      criticalCSSSize: criticalSize,
      renderBlockingSize,
      importantUsage: totalRules > 0 ? (importantCount / totalRules * 100) : 0,
      performanceScore: this.calculatePerformanceScore({
        cssFileCount: cssFiles.length,
        totalCSSSize: totalSize,
        criticalCSSSize: criticalSize,
        renderBlockingSize,
        importantUsage: totalRules > 0 ? (importantCount / totalRules * 100) : 0
      })
    };
    
    return this.metrics;
  }

  // 計算性能評分 (0-100)
  calculatePerformanceScore(metrics) {
    let score = 100;
    
    // CSS 檔案數量 (-10 分每超出 1 個)
    if (metrics.cssFileCount > this.thresholds.fileCount) {
      score -= (metrics.cssFileCount - this.thresholds.fileCount) * 10;
    }
    
    // Critical CSS 大小 (-20 分每超出 5KB)  
    if (metrics.criticalCSSSize > this.thresholds.criticalCSS) {
      const excess = (metrics.criticalCSSSize - this.thresholds.criticalCSS) / 1024 / 5;
      score -= Math.ceil(excess) * 20;
    }
    
    // 總 CSS 大小 (-15 分每超出 20KB)
    if (metrics.totalCSSSize > this.thresholds.totalCSS) {
      const excess = (metrics.totalCSSSize - this.thresholds.totalCSS) / 1024 / 20;
      score -= Math.ceil(excess) * 15;
    }
    
    // 渲染阻塞 CSS 大小 (-25 分每超出 10KB)
    if (metrics.renderBlockingSize > this.thresholds.renderBlocking) {
      const excess = (metrics.renderBlockingSize - this.thresholds.renderBlocking) / 1024 / 10;
      score -= Math.ceil(excess) * 25;
    }
    
    // !important 使用率 (-30 分每超出 5%)
    if (metrics.importantUsage > this.thresholds.importantUsage) {
      const excess = (metrics.importantUsage - this.thresholds.importantUsage) / 5;
      score -= Math.ceil(excess) * 30;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // 生成性能等級
  getPerformanceLevel(score) {
    if (score >= 90) return { level: 'Level 3', grade: 'A+', color: '🟢' };
    if (score >= 80) return { level: 'Level 2', grade: 'A', color: '🟢' };
    if (score >= 70) return { level: 'Level 1', grade: 'B+', color: '🟡' };
    if (score >= 60) return { level: 'Basic', grade: 'B', color: '🟡' };
    if (score >= 50) return { level: 'Warning', grade: 'C', color: '🟠' };
    return { level: 'Critical', grade: 'F', color: '🔴' };
  }

  // 主執行函數
  async run() {
    console.log('🚀 === CSS 性能監控系統 ===');
    console.log('監控 Google Level 3 性能標準合規性\n');
    
    try {
      const metrics = await this.analyzeCSSPerformance();
      const level = this.getPerformanceLevel(metrics.performanceScore);
      
      console.log('\n📊 === 性能評估結果 ===');
      console.log(`綜合評分: ${metrics.performanceScore}/100 (${level.level}) ${level.color}`);
      console.log(`Critical CSS: ${(metrics.criticalCSSSize / 1024).toFixed(2)}KB`);
      console.log(`總 CSS 大小: ${(metrics.totalCSSSize / 1024).toFixed(2)}KB`);
      console.log(`!important 使用率: ${metrics.importantUsage.toFixed(1)}%`);
      console.log(`CSS 檔案數量: ${metrics.cssFileCount} 個`);
      
      const isLevel3 = metrics.performanceScore >= 90;
      console.log(`Google Level 3 認證: ${isLevel3 ? '✅ 通過' : '❌ 未通過'}`);
      
      return {
        metrics,
        level,
        isLevel3
      };
      
    } catch (error) {
      console.error('❌ CSS 性能監控失敗:', error.message);
      throw error;
    }
  }
}

// 執行監控
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new CSSPerformanceMonitor();
  monitor.run().catch(console.error);
}

export default CSSPerformanceMonitor;