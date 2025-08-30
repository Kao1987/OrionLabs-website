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
export default defineConfig(async () => {
  const availablePort = await findAvailablePort(5173, 10)

  console.log(`🚀 啟動 Orion 前端開發服務器...`)
  console.log(`🔌 端口: ${availablePort}`)
  console.log(`🌐 本地訪問: http://localhost:${availablePort}`)
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
      // 添加代理配置來解決 CORS 問題 - 使用環境變數確保安全
      proxy: {
        '/api': {
          target: process.env.VITE_PROXY_API_TARGET || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/api/, '/api')
        },
        '/auth': {
          target: process.env.VITE_PROXY_API_TARGET || 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        },
        '/health': {
          target: process.env.VITE_PROXY_API_TARGET || 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        },
        '/contact-api': {
          target: process.env.VITE_PROXY_CONTACT_TARGET || 'http://localhost:3002',
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/contact-api/, '')
        }
      }
    },
    build: {
      // 確保建構輸出正確
      rollupOptions: {
        output: {
          entryFileNames: '[name]-[hash].js',
          chunkFileNames: '[name]-[hash].js',
          assetFileNames: '[name]-[hash].[ext]'
        }
      }
    }
  }
})
