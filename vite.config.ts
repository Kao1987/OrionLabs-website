import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { createServer } from 'net'

// 端口檢測函數
function findAvailablePort(startPort: number = 5173, maxAttempts: number = 10): Promise<number> {
  return new Promise((resolve, reject) => {
    const checkPort = (port: number, attempts: number): void => {
      if (attempts <= 0) {
        reject(new Error(`無法找到可用端口 (嘗試範圍: ${startPort}-${startPort + maxAttempts - 1})`))
        return
      }

      const server = createServer()

      server.listen(port, () => {
        server.close(() => {
          console.log(`✅ 找到可用端口: ${port}`)
          resolve(port)
        })
      })

      server.on('error', () => {
        console.log(`⚠️  端口 ${port} 已被佔用，嘗試下一個...`)
        checkPort(port + 1, attempts - 1)
      })
    }

    checkPort(startPort, maxAttempts)
  })
}

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const availablePort = await findAvailablePort(5173, 10)

  // 載入環境變數
  const envDir = './'
  const envFiles = ['.env', `.env.${mode}`, '.env.local']
  const env: Record<string, string> = {}

  for (const file of envFiles) {
    try {
      const envPath = `${envDir}${file}`
      if (await import('fs').then(fs => fs.promises.access(envPath).then(() => true, () => false))) {
        const content = await import('fs').then(fs => fs.promises.readFile(envPath, 'utf-8'))
        content.split('\n').forEach(line => {
          const [key, ...values] = line.trim().split('=')
          if (key && !key.startsWith('#')) {
            env[key] = values.join('=')
          }
        })
      }
    } catch {}
  }

  // 根據模式顯示不同的啟動信息
  const modeNames: Record<string, string> = {
    development: '純前端開發 (使用線上API)',
    local: '本地全端開發',
    remote: '前端開發 (連接線上API)',
    docker: 'Docker 後端開發 (連接本地Docker)',
    performance: '性能測試模式'
  }

  console.log(`🚀 啟動 Orion 前端開發服務器...`)
  console.log(`📋 開發模式: ${modeNames[mode] || mode}`)
  console.log(`🔌 端口: ${availablePort}`)
  console.log(`🌐 本地訪問: http://localhost:${availablePort}`)
  console.log(`🔗 代理目標: ${mode === 'local' ? 'localhost:8000' : mode === 'docker' ? 'localhost:8001' : env.VITE_PROXY_API_TARGET || 'http://161.33.209.198:8000'}`)
  console.log("-".repeat(50))

  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      // // 修正開發伺服器 MIME type 問題
      // headers: {
      //   'Content-Type': 'application/javascript; charset=utf-8'
      // },
      // 如果遇到 CORS 問題
      cors: true,
      // 設定開發伺服器 host
      host: true,
      port: availablePort,
      strictPort: false, // 允許 Vite 自動尋找可用端口
      // 根據模式動態配置代理 - 統一使用線上後端
      proxy: {
        // 代理到線上後端
        '/api': {
          target: env.VITE_PROXY_API_TARGET || 'http://161.33.209.198:8000',
          changeOrigin: true,
          secure: false
        },
        '/health': {
          target: env.VITE_PROXY_API_TARGET || 'http://161.33.209.198:8000',
          changeOrigin: true,
          secure: false
        },
        '/contact-api': {
          target: env.VITE_PROXY_CONTACT_TARGET || 'http://161.33.209.198:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/contact-api/, '')
        }
      }
    },
    build: {
      // 設置chunk size警告限制
      chunkSizeWarningLimit: 800,
      // 確保建構輸出正確並優化代碼分割
      rollupOptions: {
        output: {
          entryFileNames: '[name]-[hash].js',
          chunkFileNames: '[name]-[hash].js',
          assetFileNames: '[name]-[hash].[ext]',
          // 優化代碼分割策略
          manualChunks: {
            // 將Vue相關庫分離
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            // 將UI框架分離
            'ui-vendor': ['bootstrap'],
            // 將工具庫分離
            'utils-vendor': ['axios', 'dompurify'],
            // 將markdown相關分離
            'markdown-vendor': ['marked', 'highlight.js']
          }
        }
      }
    }
  }
})
