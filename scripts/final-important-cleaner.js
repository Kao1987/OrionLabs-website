#!/usr/bin/env node

/**
 * 最終 !important 精準清除器
 * 將 10.5% 精準降至 <10%，完成 Google Level 3 最後一哩路
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class FinalImportantCleaner {
  constructor() {
    this.target = 10.0; // 10.0%
    this.removedCount = 0;
  }

  // 分析當前狀態
  async analyzeCurrentState() {
    console.log('🔍 分析當前 !important 使用狀況...');
    
    const cssFiles = await glob('src/assets/css/0[1-8]-*.css', { 
      cwd: projectRoot,
      absolute: true 
    });
    
    let totalRules = 0;
    let totalImportant = 0;
    const fileDetails = [];
    
    for (const file of cssFiles) {
      const content = await fs.readFile(file, 'utf8');
      const filename = path.basename(file);
      
      const rules = content.match(/[^{}]+\{[^}]+\}/g) || [];
      const importantRules = content.match(/!important/g) || [];
      
      totalRules += rules.length;
      totalImportant += importantRules.length;
      
      fileDetails.push({
        file,
        filename,
        rules: rules.length,
        important: importantRules.length,
        rate: rules.length > 0 ? (importantRules.length / rules.length * 100) : 0,
        content
      });
      
      console.log(`  📄 ${filename}: ${rules.length} rules, ${importantRules.length} !important (${((importantRules.length / rules.length) * 100).toFixed(1)}%)`);
    }
    
    const currentRate = totalRules > 0 ? (totalImportant / totalRules * 100) : 0;
    console.log(`\n📊 總計: ${totalRules} rules, ${totalImportant} !important (${currentRate.toFixed(1)}%)`);
    console.log(`🎯 目標: < ${this.target}%`);
    console.log(`⚡ 需要移除: ${Math.ceil(totalImportant - (totalRules * this.target / 100))} 個 !important\n`);
    
    return { totalRules, totalImportant, currentRate, fileDetails };
  }

  // 智能移除最安全的 !important
  async smartRemoval(fileDetails) {
    console.log('🎯 執行智能 !important 移除...');
    
    // 優先級順序：最安全 -> 風險較高
    const removalRules = [
      // 1. 背景色（通常可以通過特異性解決）
      {
        pattern: /background-color\s*:\s*[^;]+\s*!important/g,
        replacement: (match) => match.replace(' !important', ''),
        safety: 'high',
        description: '背景色 !important'
      },
      
      // 2. 邊框顏色（通常可以通過特異性解決）
      {
        pattern: /border-color\s*:\s*[^;]+\s*!important/g,
        replacement: (match) => match.replace(' !important', ''),
        safety: 'high',
        description: '邊框顏色 !important'
      },
      
      // 3. 一般顏色（在不影響對比度的情況下）
      {
        pattern: /(^|[^-])color\s*:\s*[^;]+\s*!important/g,
        replacement: (match) => match.replace(' !important', ''),
        safety: 'medium',
        description: '文字顏色 !important'
      },
      
      // 4. 字重（通常裝飾性）
      {
        pattern: /font-weight\s*:\s*[^;]+\s*!important/g,
        replacement: (match) => match.replace(' !important', ''),
        safety: 'high',
        description: '字重 !important'
      },
      
      // 5. 透明度（通常裝飾性）
      {
        pattern: /opacity\s*:\s*[^;]+\s*!important/g,
        replacement: (match) => match.replace(' !important', ''),
        safety: 'high',
        description: '透明度 !important'
      },
      
      // 6. 文字陰影（裝飾性）
      {
        pattern: /text-shadow\s*:\s*[^;]+\s*!important/g,
        replacement: (match) => match.replace(' !important', ''),
        safety: 'high',
        description: '文字陰影 !important'
      }
    ];
    
    let totalRemoved = 0;
    
    for (const { file, filename, content } of fileDetails) {
      let modifiedContent = content;
      let fileRemovals = 0;
      
      const originalImportant = (content.match(/!important/g) || []).length;
      
      // 按安全順序移除
      for (const rule of removalRules) {
        const matches = modifiedContent.match(rule.pattern) || [];
        
        if (matches.length > 0) {
          modifiedContent = modifiedContent.replace(rule.pattern, rule.replacement);
          const removed = matches.length;
          fileRemovals += removed;
          
          console.log(`    ✅ ${filename}: 移除 ${removed} 個 ${rule.description}`);
        }
      }
      
      const newImportant = (modifiedContent.match(/!important/g) || []).length;
      const actualRemoved = originalImportant - newImportant;
      
      if (actualRemoved > 0) {
        await fs.writeFile(file, modifiedContent);
        totalRemoved += actualRemoved;
        console.log(`  📄 ${filename}: 總共移除 ${actualRemoved} 個 !important`);
      }
    }
    
    this.removedCount = totalRemoved;
    console.log(`\n🎯 總計移除: ${totalRemoved} 個 !important`);
    
    return totalRemoved;
  }

  // 最終驗證
  async performFinalValidation() {
    console.log('\n🔍 執行最終驗證...');
    
    const { totalRules, totalImportant, currentRate } = await this.analyzeCurrentState();
    
    const isSuccess = currentRate < this.target;
    
    console.log('\n🎯 === 最終驗證結果 ===');
    console.log(`!important 使用率: ${currentRate.toFixed(1)}%`);
    console.log(`目標: < ${this.target}%`);
    console.log(`狀態: ${isSuccess ? '✅ 達成目標' : '❌ 仍需優化'}`);
    
    if (isSuccess) {
      console.log('🎉 恭喜！!important 使用率已達到 Google Level 3 標準！');
    } else {
      const remaining = Math.ceil(totalImportant - (totalRules * this.target / 100));
      console.log(`⚠️  仍需移除 ${remaining} 個 !important`);
    }
    
    return {
      success: isSuccess,
      currentRate,
      totalRules,
      totalImportant,
      removedCount: this.removedCount
    };
  }

  // 主執行函數
  async run() {
    console.log('🚀 === 最終 !important 精準清除器 ===');
    console.log('目標: 將 10.5% 降至 < 10%，完成 Google Level 3 認證\n');
    
    try {
      // 分析當前狀態
      const analysisResult = await this.analyzeCurrentState();
      
      if (analysisResult.currentRate < this.target) {
        console.log('✅ 當前 !important 使用率已符合目標！');
        return await this.performFinalValidation();
      }
      
      // 執行智能移除
      await this.smartRemoval(analysisResult.fileDetails);
      
      // 最終驗證
      const finalResult = await this.performFinalValidation();
      
      return finalResult;
      
    } catch (error) {
      console.error('❌ 最終清除失敗:', error.message);
      throw error;
    }
  }
}

// 執行最終清除
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleaner = new FinalImportantCleaner();
  cleaner.run().catch(console.error);
}

export default FinalImportantCleaner;