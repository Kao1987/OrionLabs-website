#!/usr/bin/env node
/* eslint-disable */

/**
 * Orion Labs 性能測試腳本
 * 簡化版 Phase 3 - 智能性能評估
 */

const fs = require('fs').promises
const path = require('path')

class OrionPerformanceAuditor {
  constructor() {
    this.results = {
      criticalCSSSize: 0,
      buildSize: 0,
      mainFileSize: 0,
      performanceScore: 0,
      optimizations: []
    }
  }

  // 分析關鍵 CSS 大小
  async analyzeCriticalCSS() {
    console.log('🔍 分析關鍵 CSS...')
    
    try {
      const performanceMainFile = path.resolve(process.cwd(), 'src/main-performance.ts')
      
      if (await this.fileExists(performanceMainFile)) {
        const content = await fs.readFile(performanceMainFile, 'utf8')
        
        // 提取內聯 CSS 內容
        const match = content.match(/style\.textContent\s*=\s*`([^`]+)`/s)
        if (match) {
          const criticalCSS = match[1]
          this.results.criticalCSSSize = Buffer.byteLength(criticalCSS, 'utf8')
          
          console.log(`📏 關鍵 CSS 大小: ${(this.results.criticalCSSSize / 1024).toFixed(2)}KB`)
          
          if (this.results.criticalCSSSize < 1024) {
            console.log('✅ 關鍵 CSS < 1KB - 優秀')
            this.results.optimizations.push('關鍵 CSS 大小優化')
            return 25
          } else if (this.results.criticalCSSSize < 2048) {
            console.log('⚠️ 關鍵 CSS 1-2KB - 良好')
            return 15
          } else {
            console.log('❌ 關鍵 CSS > 2KB - 需要優化')
            return 0
          }
        }
      } else {
        console.log('ℹ️ 未找到性能主檔案，檢查一般主檔案')
        const mainFile = path.resolve(process.cwd(), 'src/main.ts')
        const content = await fs.readFile(mainFile, 'utf8')
        
        if (content.includes('performance') || content.includes('critical')) {
          console.log('✅ 主檔案包含性能優化')
          return 10
        } else {
          console.log('⚠️ 主檔案未包含性能優化')
          return 5
        }
      }
    } catch (error) {
      console.error('❌ 分析關鍵 CSS 失敗:', error.message)
      return 0
    }
  }

  // 分析建置大小
  async analyzeBuildSize() {
    console.log('🔍 分析建置大小...')
    
    try {
      const distPath = path.resolve(process.cwd(), 'dist')
      const stats = await this.getDirSize(distPath)
      this.results.buildSize = stats.totalSize
      
      console.log(`📦 建置大小: ${(this.results.buildSize / 1024 / 1024).toFixed(2)}MB`)
      console.log(`📄 檔案數量: ${stats.fileCount}`)
      
      if (this.results.buildSize < 1024 * 1024) { // < 1MB
        console.log('✅ 建置大小 < 1MB - 優秀')
        this.results.optimizations.push('建置大小優化')
        return 20
      } else if (this.results.buildSize < 2 * 1024 * 1024) { // < 2MB
        console.log('⚠️ 建置大小 1-2MB - 良好')
        return 15
      } else if (this.results.buildSize < 5 * 1024 * 1024) { // < 5MB
        console.log('⚠️ 建置大小 2-5MB - 可接受')
        return 10
      } else {
        console.log('❌ 建置大小 > 5MB - 需要優化')
        return 0
      }
    } catch (error) {
      console.log('ℹ️ 建置檔案不存在，執行建置...')
      return await this.buildAndAnalyze()
    }
  }

  // 建置並分析
  async buildAndAnalyze() {
    const { spawn } = require('child_process')
    
    return new Promise((resolve) => {
      console.log('🔨 執行建置...')
      const buildProcess = spawn('yarn', ['build'], { stdio: 'pipe' })
      
      buildProcess.on('close', async (code) => {
        if (code === 0) {
          console.log('✅ 建置完成')
          const score = await this.analyzeBuildSize()
          resolve(score)
        } else {
          console.log('❌ 建置失敗')
          resolve(0)
        }
      })
    })
  }

  // 分析性能檔案
  async analyzePerformanceFiles() {
    console.log('🔍 分析性能檔案...')
    
    let score = 0
    
    // 檢查性能 CSS
    const perfCSS = path.resolve(process.cwd(), 'src/assets/css/orion-performance.css')
    if (await this.fileExists(perfCSS)) {
      console.log('✅ 找到性能 CSS 檔案')
      score += 10
      this.results.optimizations.push('性能 CSS 檔案')
    }
    
    // 檢查間距系統
    const spacingCSS = path.resolve(process.cwd(), 'src/assets/css/spacing-system.css')
    if (await this.fileExists(spacingCSS)) {
      console.log('✅ 找到間距系統檔案')
      score += 10
      this.results.optimizations.push('統一間距系統')
    }
    
    // 檢查響應式系統
    const responsiveCSS = path.resolve(process.cwd(), 'src/assets/css/responsive-system.css')
    if (await this.fileExists(responsiveCSS)) {
      console.log('✅ 找到響應式系統檔案')
      score += 10
      this.results.optimizations.push('響應式設計系統')
    }
    
    // 檢查 main-performance.ts
    const perfMain = path.resolve(process.cwd(), 'src/main-performance.ts')
    if (await this.fileExists(perfMain)) {
      console.log('✅ 找到性能主檔案')
      score += 15
      this.results.optimizations.push('性能優化主檔案')
    }
    
    return score
  }

  // 檢查程式碼品質
  async checkCodeQuality() {
    console.log('🔍 檢查程式碼品質...')
    
    let score = 0
    
    // 檢查 TypeScript 設定
    const tsConfig = path.resolve(process.cwd(), 'tsconfig.json')
    if (await this.fileExists(tsConfig)) {
      console.log('✅ TypeScript 設定檔案存在')
      score += 5
    }
    
    // 檢查 ESLint 設定
    const eslintConfig = path.resolve(process.cwd(), 'eslint.config.ts')
    if (await this.fileExists(eslintConfig)) {
      console.log('✅ ESLint 設定檔案存在')
      score += 5
    }
    
    // 檢查測試檔案
    const testsDir = path.resolve(process.cwd(), 'tests')
    if (await this.fileExists(testsDir)) {
      console.log('✅ 測試目錄存在')
      score += 10
    }
    
    return score
  }

  // 輔助方法
  async fileExists(filePath) {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  async getDirSize(dirPath) {
    let totalSize = 0
    let fileCount = 0

    try {
      const files = await fs.readdir(dirPath)
      
      for (const file of files) {
        const filePath = path.join(dirPath, file)
        const stats = await fs.stat(filePath)
        
        if (stats.isDirectory()) {
          const subResult = await this.getDirSize(filePath)
          totalSize += subResult.totalSize
          fileCount += subResult.fileCount
        } else {
          totalSize += stats.size
          fileCount++
        }
      }
    } catch (error) {
      // 忽略無法存取的檔案
    }

    return { totalSize, fileCount }
  }

  // 生成建議
  generateRecommendations() {
    const recommendations = []
    
    if (this.results.criticalCSSSize === 0) {
      recommendations.push('• 建立關鍵 CSS 內聯系統')
    } else if (this.results.criticalCSSSize > 1024) {
      recommendations.push('• 減少關鍵 CSS 大小至 1KB 以下')
    }
    
    if (this.results.buildSize > 2 * 1024 * 1024) {
      recommendations.push('• 優化建置大小，使用程式碼分割')
    }
    
    if (!this.results.optimizations.includes('性能優化主檔案')) {
      recommendations.push('• 建立性能優化版本的 main.ts')
    }
    
    if (!this.results.optimizations.includes('統一間距系統')) {
      recommendations.push('• 實作統一的間距設計系統')
    }
    
    return recommendations
  }

  // 生成報告
  generateReport() {
    const score = this.results.performanceScore
    
    console.log('\n' + '='.repeat(60))
    console.log('🏆 ORION LABS 性能評估報告')
    console.log('='.repeat(60))
    
    console.log(`📊 總分: ${score}/100`)
    
    if (this.results.criticalCSSSize > 0) {
      console.log(`📏 關鍵 CSS: ${(this.results.criticalCSSSize / 1024).toFixed(2)}KB`)
    }
    
    if (this.results.buildSize > 0) {
      console.log(`📦 建置大小: ${(this.results.buildSize / 1024 / 1024).toFixed(2)}MB`)
    }
    
    // 等級評定
    let grade = 'F'
    let status = '❌ 需要大幅改善'
    let emoji = '🔧'
    
    if (score >= 90) {
      grade = 'A+'
      status = '🏆 優秀性能'
      emoji = '🚀'
    } else if (score >= 80) {
      grade = 'A'
      status = '🎯 良好性能' 
      emoji = '⚡'
    } else if (score >= 70) {
      grade = 'B'
      status = '⚠️ 可接受性能'
      emoji = '💪'
    } else if (score >= 60) {
      grade = 'C'
      status = '⚠️ 需要優化'
      emoji = '🔧'
    }
    
    console.log(`🏅 評級: ${grade}`)
    console.log(`📈 狀態: ${status}`)
    console.log(`${emoji} 優化項目: ${this.results.optimizations.length}`)
    
    if (this.results.optimizations.length > 0) {
      console.log('\n✅ 已實作的優化:')
      this.results.optimizations.forEach(opt => {
        console.log(`  • ${opt}`)
      })
    }
    
    const recommendations = this.generateRecommendations()
    if (recommendations.length > 0) {
      console.log('\n📝 改善建議:')
      recommendations.forEach(rec => {
        console.log(`  ${rec}`)
      })
    }
    
    console.log('\n' + '='.repeat(60))
    
    return {
      score,
      grade,
      status,
      recommendations,
      optimizations: this.results.optimizations
    }
  }

  // 執行完整評估
  async runAudit() {
    console.log('🚀 開始 Orion Labs 性能評估...\n')
    
    try {
      let totalScore = 0
      
      // 1. 分析關鍵 CSS (25分)
      totalScore += await this.analyzeCriticalCSS()
      
      // 2. 分析建置大小 (20分)
      totalScore += await this.analyzeBuildSize()
      
      // 3. 分析性能檔案 (45分)
      totalScore += await this.analyzePerformanceFiles()
      
      // 4. 檢查程式碼品質 (20分)
      totalScore += await this.checkCodeQuality()
      
      this.results.performanceScore = Math.min(totalScore, 100)
      
      // 5. 生成報告
      const report = this.generateReport()
      
      return report
    } catch (error) {
      console.error('❌ 評估過程中發生錯誤:', error)
      process.exit(1)
    }
  }
}

// 主執行函數
async function main() {
  const auditor = new OrionPerformanceAuditor()
  const report = await auditor.runAudit()
  
  // 根據分數決定退出代碼
  process.exit(report.score >= 70 ? 0 : 1)
}

// 如果直接執行此腳本
if (require.main === module) {
  main().catch(console.error)
}

module.exports = OrionPerformanceAuditor
