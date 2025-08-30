#!/usr/bin/env node

/**
 * Changed Files Coverage Monitor Script
 * 按照 Orion 規範要求監控 changed-files 覆蓋率 ≥ 80%
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const COVERAGE_THRESHOLD = 80 // 80% minimum for changed files
const COVERAGE_REPORT_PATH = 'coverage/coverage-summary.json'

/**
 * 獲取 Git 變更的檔案列表
 */
function getChangedFiles() {
  try {
    // 獲取與 main 分支的差異檔案
    const output = execSync('git diff --name-only main...HEAD', { encoding: 'utf8' })
    return output.split('\n')
      .filter(file => file.trim())
      .filter(file => file.endsWith('.ts') || file.endsWith('.vue') || file.endsWith('.js'))
      .filter(file => !file.includes('test') && !file.includes('spec'))
  } catch (error) {
    console.warn('Warning: Could not get changed files from git, checking all files')
    return []
  }
}

/**
 * 執行覆蓋率測試
 */
function runCoverageTest() {
  console.log('🔍 Running coverage analysis...')
  try {
    execSync('npx vitest run --coverage --reporter=json-summary', { 
      stdio: 'inherit',
      timeout: 120000 
    })
  } catch (error) {
    console.error('❌ Coverage test failed:', error.message)
    process.exit(1)
  }
}

/**
 * 讀取覆蓋率報告
 */
function readCoverageReport() {
  if (!fs.existsSync(COVERAGE_REPORT_PATH)) {
    console.error(`❌ Coverage report not found at ${COVERAGE_REPORT_PATH}`)
    process.exit(1)
  }
  
  return JSON.parse(fs.readFileSync(COVERAGE_REPORT_PATH, 'utf8'))
}

/**
 * 計算變更檔案的覆蓋率
 */
function calculateChangedFilesCoverage(coverageData, changedFiles) {
  if (changedFiles.length === 0) {
    console.log('ℹ️  No changed files detected, checking overall coverage')
    return {
      files: [],
      averages: coverageData.total,
      fileCount: 0
    }
  }

  const changedFilesCoverage = {}
  let totalStatements = 0
  let coveredStatements = 0
  let totalBranches = 0
  let coveredBranches = 0
  let totalFunctions = 0
  let coveredFunctions = 0
  let totalLines = 0
  let coveredLines = 0

  for (const filePath of changedFiles) {
    // 尋找對應的覆蓋率資料
    const fullPath = path.resolve(filePath)
    const relativePath = path.relative(process.cwd(), fullPath)
    
    // 檢查不同可能的路徑格式
    const possiblePaths = [
      filePath,
      relativePath,
      `./${filePath}`,
      fullPath
    ]

    let fileData = null
    for (const testPath of possiblePaths) {
      if (coverageData[testPath]) {
        fileData = coverageData[testPath]
        break
      }
    }

    if (fileData) {
      changedFilesCoverage[filePath] = fileData
      
      totalStatements += fileData.statements.total
      coveredStatements += fileData.statements.covered
      totalBranches += fileData.branches.total
      coveredBranches += fileData.branches.covered
      totalFunctions += fileData.functions.total
      coveredFunctions += fileData.functions.covered
      totalLines += fileData.lines.total
      coveredLines += fileData.lines.covered
    } else {
      console.warn(`⚠️  Coverage data not found for: ${filePath}`)
    }
  }

  const averages = {
    statements: { 
      pct: totalStatements > 0 ? (coveredStatements / totalStatements * 100) : 100 
    },
    branches: { 
      pct: totalBranches > 0 ? (coveredBranches / totalBranches * 100) : 100 
    },
    functions: { 
      pct: totalFunctions > 0 ? (coveredFunctions / totalFunctions * 100) : 100 
    },
    lines: { 
      pct: totalLines > 0 ? (coveredLines / totalLines * 100) : 100 
    }
  }

  return {
    files: changedFilesCoverage,
    averages,
    fileCount: Object.keys(changedFilesCoverage).length
  }
}

/**
 * 檢查覆蓋率是否符合標準
 */
function checkCoverageThreshold(coverage) {
  const { statements, branches, functions, lines } = coverage.averages
  
  const results = {
    statements: statements.pct >= COVERAGE_THRESHOLD,
    branches: branches.pct >= COVERAGE_THRESHOLD,
    functions: functions.pct >= COVERAGE_THRESHOLD,
    lines: lines.pct >= COVERAGE_THRESHOLD
  }

  return results
}

/**
 * 輸出報告
 */
function generateReport(changedFiles, coverage, thresholdResults) {
  console.log('\n📊 Changed Files Coverage Report')
  console.log('=' .repeat(50))
  
  if (changedFiles.length > 0) {
    console.log(`📁 Changed Files (${changedFiles.length}):`)
    changedFiles.forEach(file => console.log(`   - ${file}`))
    console.log()
  }

  console.log(`📈 Coverage Results (${coverage.fileCount} files analyzed):`)
  console.log(`   Statements: ${coverage.averages.statements.pct.toFixed(2)}% ${thresholdResults.statements ? '✅' : '❌'}`)
  console.log(`   Branches:   ${coverage.averages.branches.pct.toFixed(2)}% ${thresholdResults.branches ? '✅' : '❌'}`)
  console.log(`   Functions:  ${coverage.averages.functions.pct.toFixed(2)}% ${thresholdResults.functions ? '✅' : '❌'}`)
  console.log(`   Lines:      ${coverage.averages.lines.pct.toFixed(2)}% ${thresholdResults.lines ? '✅' : '❌'}`)
  
  const allPassed = Object.values(thresholdResults).every(Boolean)
  console.log(`\n🎯 Threshold Check (≥${COVERAGE_THRESHOLD}%): ${allPassed ? '✅ PASSED' : '❌ FAILED'}`)
  
  if (!allPassed) {
    console.log('\n❌ Coverage threshold not met for changed files!')
    console.log('Please add tests to improve coverage before merging.')
    process.exit(1)
  } else {
    console.log('\n✅ Coverage requirements satisfied!')
  }
}

/**
 * 主執行函數
 */
function main() {
  console.log('🚀 Changed Files Coverage Monitor')
  console.log('Following Orion Specifications A v2.8.0\n')

  // 1. 獲取變更檔案
  const changedFiles = getChangedFiles()
  
  // 2. 執行覆蓋率測試
  runCoverageTest()
  
  // 3. 讀取覆蓋率報告
  const coverageData = readCoverageReport()
  
  // 4. 計算變更檔案覆蓋率
  const coverage = calculateChangedFilesCoverage(coverageData, changedFiles)
  
  // 5. 檢查門檻
  const thresholdResults = checkCoverageThreshold(coverage)
  
  // 6. 產生報告
  generateReport(changedFiles, coverage, thresholdResults)
}

// 執行主程式
if (require.main === module) {
  main()
}

module.exports = {
  getChangedFiles,
  calculateChangedFilesCoverage,
  checkCoverageThreshold,
  COVERAGE_THRESHOLD
}