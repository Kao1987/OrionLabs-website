import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    // 測試環境配置
    environment: 'jsdom',
    
    // 全局設定
    globals: true,
    
    // 覆蓋率配置
    coverage: {
      provider: 'v8',
    reporters: ['text', 'json', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts', // re-export 檔案
        'src/main.ts', // 啟動檔案
        'src/App.vue', // 應用根組件
        '**/*.stories.*', // Storybook
        'src/assets/**', // 靜態資源
        'deprecated/**' // 已棄用檔案
      ],
      // 覆蓋率門檻
      thresholds: {
        statements: 75,
        branches: 70,
        functions: 75,
        lines: 75
      }
    },
    
    // 測試檔案匹配模式
    include: [
      'tests/unit/**/*.{test,spec}.{js,ts}',
      'tests/components/**/*.{test,spec}.{js,ts}'
    ],
    
    // 排除檔案
    exclude: [
      'node_modules/',
      'tests/e2e/**',
      'tests/_staging/**' // 暫存測試檔案
    ],
    
    // 測試設定
    testTimeout: 5000, // 5秒超時
    hookTimeout: 5000,
    
    // 測試報告
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './tests/_reports/results.json'
    },
    
    // 設置檔案
    setupFiles: ['./tests/setup.ts'],
    
    // 模擬設定
    unstubEnvs: true,
    unstubGlobals: true,
    
    // 隔離設定
    isolate: true,
    
    // 監視模式排除
    watchExclude: [
      'node_modules/**',
      'coverage/**',
      'tests/_reports/**'
    ]
  }
})