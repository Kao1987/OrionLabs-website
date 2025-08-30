#!/usr/bin/env node
/**
 * Orion Labs 前端開發服務器啟動腳本
 * 具備端口自動檢測和切換功能
 */

const { createServer } = require('net')
const { spawn } = require('child_process')
const path = require('path')

// 顏色工具
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = colors.reset) {
  const timestamp = new Date().toLocaleTimeString('zh-TW')
  console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

function logError(message) {
  log(`❌ ${message}`, colors.red)
}

function logInfo(message) {
  log(`🚀 ${message}`, colors.blue)
}

/**
 * 檢查端口是否可用
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const server = createServer()

    server.listen(port, () => {
      server.close(() => {
        resolve(true) // 端口可用
      })
    })

    server.on('error', () => {
      resolve(false) // 端口被佔用
    })
  })
}

/**
 * 尋找可用端口
 */
async function findAvailablePort(startPort = 5173, maxAttempts = 10) {
  logInfo(`正在檢查端口 ${startPort}...`)

  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i
    const isAvailable = await checkPort(port)

    if (isAvailable) {
      logSuccess(`找到可用端口: ${port}`)
      return port
    } else {
      logWarning(`端口 ${port} 已被佔用，嘗試下一個...`)
    }
  }

  throw new Error(`無法找到可用端口 (嘗試範圍: ${startPort}-${startPort + maxAttempts - 1})`)
}

/**
 * 啟動 Vite 開發服務器
 */
async function startViteServer() {
  try {
    // 尋找可用端口
    const availablePort = await findAvailablePort(5173, 10)

    // 設置環境變數
    process.env.VITE_DEV_PORT = availablePort.toString()

    console.log('\n' + '='.repeat(60))
    console.log(`🌟 Orion Labs 前端開發服務器`)
    console.log(`🔌 端口: ${availablePort}`)
    console.log(`🌐 本地訪問: http://localhost:${availablePort}`)
    console.log(`🌍 網路訪問: http://0.0.0.0:${availablePort}`)
    console.log('='.repeat(60) + '\n')

    // 啟動 Vite
    const viteProcess = spawn('npm', ['run', 'dev', '--', '--port', availablePort.toString(), '--host'], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    })

    // 處理進程退出
    viteProcess.on('close', (code) => {
      if (code !== 0) {
        logError(`Vite 進程退出，代碼: ${code}`)
        process.exit(code)
      }
    })

    // 處理 Ctrl+C
    process.on('SIGINT', () => {
      logInfo('正在停止開發服務器...')
      viteProcess.kill('SIGINT')
      process.exit(0)
    })

    process.on('SIGTERM', () => {
      logInfo('正在停止開發服務器...')
      viteProcess.kill('SIGTERM')
      process.exit(0)
    })

  } catch (error) {
    logError(`啟動失敗: ${error.message}`)
    process.exit(1)
  }
}

// 主程序
if (require.main === module) {
  logInfo('Orion Labs 前端啟動中...')
  startViteServer()
}

module.exports = {
  findAvailablePort,
  startViteServer
}
