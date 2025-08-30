#!/bin/bash

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日誌函數
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 檢查 Python 虛擬環境
check_python_env() {
    if [ ! -d "../.venv" ]; then
        log_error "Python 虛擬環境不存在"
        log_info "請先建立虛擬環境: python -m venv ../.venv"
        return 1
    fi
    return 0
}

# 檢查後端相依套件
check_backend_deps() {
    if [ ! -f "../Orionlabs-backend/requirements.txt" ]; then
        log_warning "找不到 requirements.txt"
        return 1
    fi
    return 0
}

# 啟動後端
start_backend() {
    log_info "正在啟動 FastAPI 後端服務..."
    cd ../Orionlabs-backend
    
    # 檢查是否有 requirements.txt
    if [ -f "requirements.txt" ]; then
        log_info "安裝後端相依套件..."
        ../.venv/bin/pip install -r requirements.txt
    fi
    
    # 啟動後端
    ../.venv/bin/python main.py &
    BACKEND_PID=$!
    
    log_success "後端服務已啟動 (PID: $BACKEND_PID)"
    cd ../orionlabs-website
}

# 啟動前端 API
start_frontend_api() {
    log_info "正在啟動前端 API 服務..."
    cd api-example
    
    # 確保相依套件已安裝
    if [ ! -d "node_modules" ]; then
        log_info "安裝前端 API 相依套件..."
        npm install
    fi
    
    # 檢查 .env 檔案
    if [ ! -f ".env" ]; then
        log_warning ".env 檔案不存在，將使用預設設定"
        cp .env.example .env
    fi
    
    npm run dev &
    API_PID=$!
    
    log_success "前端 API 服務已啟動 (PID: $API_PID)"
    cd ..
}

# 啟動前端
start_frontend() {
    log_info "正在啟動前端開發服務器..."
    yarn dev &
    FRONTEND_PID=$!
    
    log_success "前端服務已啟動 (PID: $FRONTEND_PID)"
}

# 清理函數
cleanup() {
    log_info "正在停止所有服務..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        log_info "後端服務已停止"
    fi
    
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null
        log_info "前端 API 服務已停止"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        log_info "前端服務已停止"
    fi
    
    exit 0
}

# 設定信號處理
trap cleanup SIGINT SIGTERM

# 主程序
main() {
    log_info "=== OrionLabs 完整開發環境啟動 ==="
    
    # 檢查環境
    check_python_env || exit 1
    
    # 啟動各種服務
    start_backend
    sleep 3  # 等待後端啟動
    
    start_frontend_api
    sleep 2  # 等待 API 啟動
    
    start_frontend
    
    log_success "=== 所有服務已啟動 ==="
    log_info "前端: http://localhost:5173 或 http://localhost:5174"
    log_info "前端 API: http://localhost:3002"
    log_info "後端 API: http://161.33.209.198:8000"
    log_info "按 Ctrl+C 停止所有服務"
    
    # 等待用戶中斷
    wait
}

# 執行主程序
main
