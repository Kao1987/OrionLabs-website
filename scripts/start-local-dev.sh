#!/bin/bash

# OrionLabs 本地全端開發環境啟動腳本
# Local Full-Stack Development Environment Startup Script

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# PID 變數
BACKEND_PID=""
FRONTEND_PID=""

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

log_header() {
    echo -e "${PURPLE}[ORION]${NC} $1"
}

# 檢查後端是否可用
check_backend_ready() {
    local retries=0
    local max_retries=30
    
    log_info "等待後端服務啟動..."
    
    while [ $retries -lt $max_retries ]; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            log_success "後端服務已就緒！"
            return 0
        fi
        
        echo -n "."
        sleep 1
        retries=$((retries + 1))
    done
    
    log_error "後端服務啟動超時"
    return 1
}

# 啟動後端服務
start_backend() {
    log_info "正在啟動本地後端服務..."
    
    # 檢查後端目錄是否存在
    if [ ! -d "../Orionlabs-backend" ]; then
        log_error "找不到後端目錄: ../Orionlabs-backend"
        log_info "請確保後端專案位於: $(dirname $(pwd))/Orionlabs-backend"
        return 1
    fi
    
    cd ../Orionlabs-backend
    
    # 檢查虛擬環境
    if [ -d ".venv" ]; then
        log_info "使用虛擬環境: .venv"
        source .venv/bin/activate
    elif [ -d "../.venv" ]; then
        log_info "使用虛擬環境: ../.venv"
        source ../.venv/bin/activate
    else
        log_warning "未找到虛擬環境，使用系統 Python"
    fi
    
    # 檢查並安裝依賴
    if [ -f "requirements.txt" ]; then
        log_info "檢查 Python 依賴..."
        pip install -r requirements.txt > /dev/null 2>&1
    fi
    
    # 啟動後端
    log_info "啟動 FastAPI 服務器..."
    nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
    BACKEND_PID=$!
    
    cd ../orionlabs-website
    
    # 檢查後端是否啟動成功
    if check_backend_ready; then
        log_success "後端服務已啟動 (PID: $BACKEND_PID)"
        log_info "後端日誌: ../Orionlabs-backend/backend.log"
        return 0
    else
        log_error "後端啟動失敗"
        return 1
    fi
}

# 啟動前端服務
start_frontend() {
    log_info "正在啟動前端開發服務器..."
    
    # 複製本地環境配置
    if [ -f ".env.local" ]; then
        log_info "使用本地環境配置: .env.local"
    else
        log_warning "找不到 .env.local 文件"
    fi
    
    # 啟動前端 (使用 local 模式)
    nohup yarn dev --mode local > frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    log_success "前端服務已啟動 (PID: $FRONTEND_PID)"
    log_info "前端日誌: frontend.log"
}

# 清理函數
cleanup() {
    log_info "正在停止所有服務..."
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        log_info "前端服務已停止"
    fi
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        log_info "後端服務已停止"
    fi
    
    # 清理日誌文件
    if [ -f "frontend.log" ]; then
        rm frontend.log
    fi
    
    if [ -f "../Orionlabs-backend/backend.log" ]; then
        rm ../Orionlabs-backend/backend.log
    fi
    
    log_success "所有服務已停止"
    exit 0
}

# 顯示服務狀態
show_status() {
    echo
    log_header "=== OrionLabs 本地開發環境已啟動 ==="
    echo
    log_info "🌐 前端服務: http://localhost:5173 (或其他可用端口)"
    log_info "🔧 後端 API: http://localhost:8000"
    log_info "📚 API 文檔: http://localhost:8000/docs"
    log_info "💾 健康檢查: http://localhost:8000/health"
    echo
    log_info "📋 模式: 本地全端開發"
    log_info "📁 配置文件: .env.local"
    log_info "📝 前端日誌: frontend.log"
    log_info "📝 後端日誌: ../Orionlabs-backend/backend.log"
    echo
    log_warning "按 Ctrl+C 停止所有服務"
    echo
}

# 設定信號處理
trap cleanup SIGINT SIGTERM

# 主程序
main() {
    log_header "=== 啟動 OrionLabs 本地全端開發環境 ==="
    echo
    
    # 啟動後端
    if ! start_backend; then
        log_error "後端啟動失敗，退出"
        exit 1
    fi
    
    # 等待一下讓後端完全啟動
    sleep 2
    
    # 啟動前端
    start_frontend
    
    # 等待前端啟動
    sleep 3
    
    # 顯示狀態
    show_status
    
    # 等待用戶中斷
    while true; do
        sleep 1
    done
}

# 檢查是否在正確的目錄
if [ ! -f "package.json" ]; then
    log_error "請在前端專案根目錄執行此腳本"
    exit 1
fi

# 執行主程序
main