// 檢查後端健康狀態並顯示於終端機
import http from 'http'
import { URL } from 'url'

const baseUrl = process.env.VITE_API_URL || 'http://161.33.209.198:8000'
const healthUrl = `${baseUrl}/health`

// 顏色常數
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

// 日誌函數
function log(message, color = colors.reset) {
  const timestamp = new Date().toLocaleTimeString('zh-TW')
  console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green)
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow)
}

function logError(message) {
  log(`✗ ${message}`, colors.red)
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue)
}

// 檢查 URL 格式
function validateUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 詳細的連線檢查
function checkBackendHealth() {
  logInfo('開始檢查後端健康狀態...')
  logInfo(`目標 URL: ${colors.bold}${healthUrl}${colors.reset}`)

  // 驗證 URL 格式
  if (!validateUrl(healthUrl)) {
    logError('無效的 URL 格式')
    return
  }

  // 解析 URL
  const parsedUrl = new URL(healthUrl)
  logInfo(`主機: ${parsedUrl.hostname}:${parsedUrl.port || 80}`)

  const startTime = Date.now()

  const request = http.get(healthUrl, {
    timeout: 5000, // 5秒超時
    headers: {
      'User-Agent': 'Orion-Frontend-HealthCheck/1.0',
      'Accept': 'application/json'
    }
  }, (res) => {
    const responseTime = Date.now() - startTime
    logInfo(`HTTP 狀態碼: ${res.statusCode}`)
    logInfo(`響應時間: ${responseTime}ms`)
    logInfo(`響應標頭: ${JSON.stringify(res.headers, null, 2)}`)

    let data = ''
    let dataSize = 0

    res.on('data', chunk => {
      data += chunk
      dataSize += chunk.length
    })

    res.on('end', () => {
      logInfo(`接收資料大小: ${dataSize} bytes`)
      logInfo(`原始響應: ${data}`)

      try {
        const json = JSON.parse(data)
        if (json.status === 'healthy') {
          logSuccess('後端服務運行正常！')
          if (json.timestamp) {
            logInfo(`服務器時間: ${json.timestamp}`)
          }
        } else {
          logWarning(`後端回應異常狀態: ${json.status || 'unknown'}`)
          logWarning(`完整回應: ${JSON.stringify(json, null, 2)}`)
        }
      } catch (parseError) {
        logError(`JSON 解析失敗: ${parseError.message}`)
        logError(`原始響應內容: "${data}"`)

        // 檢查是否為 HTML 錯誤頁面
        if (data.includes('<html') || data.includes('<!DOCTYPE')) {
          logWarning('收到 HTML 響應，可能是錯誤頁面或反向代理配置問題')
        }
      }
    })
  })

  request.on('error', (error) => {
    const responseTime = Date.now() - startTime
    logError(`連線失敗 (${responseTime}ms)`)
    logError(`錯誤類型: ${error.code || error.name || 'Unknown'}`)
    logError(`錯誤訊息: ${error.message}`)

    // 提供具體的錯誤診斷
    switch (error.code) {
      case 'ECONNREFUSED':
        logError('連線被拒絕 - 後端服務可能未啟動')
        logInfo('解決方案:')
        logInfo('  1. 確認後端服務已啟動: python main.py')
        logInfo('  2. 檢查端口 8000 是否被其他程序占用')
        logInfo('  3. 執行: yarn dev:full 同時啟動前後端')
        break
      case 'ENOTFOUND':
        logError('域名解析失敗 - 無法找到主機')
        logInfo('解決方案:')
        logInfo('  1. 檢查 VITE_API_URL 環境變數設定')
        logInfo('  2. 確認網路連線正常')
        break
      case 'ETIMEDOUT':
        logError('連線超時 - 服務器響應過慢')
        logInfo('解決方案:')
        logInfo('  1. 檢查網路連線')
        logInfo('  2. 確認後端服務運行狀態')
        break
      case 'ECONNRESET':
        logError('連線被重置 - 服務器強制關閉連線')
        break
      default:
        logError('未知網路錯誤')
        logInfo('建議檢查:')
        logInfo('  1. 防火牆設定')
        logInfo('  2. 後端服務狀態')
        logInfo('  3. 網路連線')
    }

    // 顯示系統資訊
    logInfo('系統資訊:')
    logInfo(`  Node.js: ${process.version}`)
    logInfo(`  平台: ${process.platform}`)
    logInfo(`  環境變數 VITE_API_URL: ${process.env.VITE_API_URL || '未設定'}`)
  })

  request.on('timeout', () => {
    logError('請求超時 (5秒)')
    request.destroy()
  })

  // 顯示可用的命令
  logInfo('可用命令:')
  logInfo('  yarn dev      - 僅啟動前端 (當前)')
  logInfo('  yarn dev:full - 同時啟動前後端')
}

// 執行檢查
checkBackendHealth()
