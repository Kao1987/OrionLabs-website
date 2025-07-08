import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
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
    // 修正開發伺服器 MIME type 問題
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8'
    },
    // 如果遇到 CORS 問題
    cors: true,
    // 設定開發伺服器 host
    host: true,
    port: 5173
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
})
