module.exports = {
  // CSS 性能門檻配置
  thresholds: {
    "maxTotalCSSSize": 200,
    "maxSingleFileSize": 50,
    "maxCriticalCSSSize": 14,
    "maxCSSFiles": 8,
    "maxImportantUsage": 0.1,
    "maxSpecificityScore": 50,
    "maxBuildTime": 30,
    "maxBundleSize": 500,
    "maxFCP": 1500,
    "maxLCP": 2500,
    "maxCLS": 0.1,
    "minGzipRatio": 0.3,
    "minBrotliRatio": 0.25
},
  
  // 監控選項
  monitoring: {
    // 是否啟用 Critical CSS 檢查
    checkCriticalCSS: true,
    
    // 是否檢查 !important 使用
    checkImportantUsage: true,
    
    // 是否檢查檔案大小
    checkFileSize: true,
    
    // 是否執行建構測試
    checkBuildPerformance: true,
    
    // 報告輸出目錄
    reportDir: 'docs/reports',
    
    // 是否在性能低於門檻時失敗
    failOnThreshold: false,
    
    // 性能評分最低要求 (0-100)
    minimumScore: 75
  },
  
  // 忽略的檔案模式
  ignore: [
    '**/node_modules/**',
    '**/dist/**/*.map',
    '**/*.min.css'
  ]
};
