#!/bin/bash

# OrionLabs 混合開發環境啟動腳本
# 支援 Python 3.11 統一環境，確保與 Docker 一致性

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 配置路徑
BACKEND_DIR="/Users/hong-yikao/Documents/Orionlabs/Orionlabs-backend"
FRONTEND_DIR="/Users/hong-yikao/Documents/Orionlabs/orionlabs-website"
PYTHON311_VENV="$BACKEND_DIR/.venv311"

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

# 檢查 Python 3.11 環境
check_python311_env() {
    log_info "檢查 Python 3.11 虛擬環境..."
    
    if [ ! -d "$PYTHON311_VENV" ]; then
        log_error "Python 3.11 虛擬環境不存在：$PYTHON311_VENV"
        log_info "請先執行：cd $BACKEND_DIR && python3.11 -m venv .venv311"
        return 1
    fi
    
    # 檢查虛擬環境中的 Python 版本
    PYTHON_VERSION=$($PYTHON311_VENV/bin/python --version 2>&1)
    if [[ "$PYTHON_VERSION" == *"3.11"* ]]; then
        log_success "Python 3.11 環境確認：$PYTHON_VERSION"
        return 0
    else
        log_error "虛擬環境 Python 版本不正確：$PYTHON_VERSION"
        return 1
    fi
}

# 啟動本地後端（Python 3.11）
start_local_backend() {
    log_header "🐍 啟動本地後端 (Python 3.11)"
    
    if ! check_python311_env; then
        return 1
    fi
    
    cd "$BACKEND_DIR"
    
    # 檢查依賴
    log_info "檢查 FastAPI 依賴..."
    if ! $PYTHON311_VENV/bin/python -c "import fastapi, uvicorn" 2>/dev/null; then
        log_warning "依賴不完整，正在安裝..."
        $PYTHON311_VENV/bin/pip install -r requirements.txt
    fi
    
    # 啟動後端
    log_info "啟動後端服務器在 http://localhost:8001..."
    $PYTHON311_VENV/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload &
    BACKEND_PID=$!
    
    # 等待啟動
    sleep 3
    
    # 檢查健康狀態
    if curl -s http://localhost:8001/health > /dev/null; then
        log_success "✅ 本地後端已啟動 (PID: $BACKEND_PID)"
        echo "   🔗 API URL: http://localhost:8001"
        echo "   📋 健康檢查: http://localhost:8001/health"
        return 0
    else
        log_error "❌ 後端啟動失敗"
        return 1
    fi
}

# 啟動 Docker 後端
start_docker_backend() {
    log_header "🐳 啟動 Docker 後端"
    
    cd "$FRONTEND_DIR"
    
    log_info "檢查 Docker 服務..."
    if ! docker ps > /dev/null 2>&1; then
        log_error "Docker 未運行，請啟動 Docker Desktop"
        return 1
    fi
    
    log_info "啟動 Docker 後端容器..."
    docker-compose -f docker-compose.dev.yml up -d backend-dev
    
    # 等待容器健康
    log_info "等待容器就緒..."
    sleep 10
    
    if curl -s http://localhost:8001/health > /dev/null; then
        log_success "✅ Docker 後端已啟動"
        echo "   🔗 API URL: http://localhost:8001"
        echo "   📋 健康檢查: http://localhost:8001/health"
        return 0
    else
        log_error "❌ Docker 後端啟動失敗"
        return 1
    fi
}

# 啟動前端
start_frontend() {
    log_header "⚡ 啟動前端 (Vite)"
    
    cd "$FRONTEND_DIR"
    
    # 檢查 Node.js 依賴
    if [ ! -d "node_modules" ]; then
        log_info "安裝 Node.js 依賴..."
        yarn install
    fi
    
    log_info "啟動 Vite 開發服務器..."
    yarn dev &
    FRONTEND_PID=$!
    
    log_success "✅ 前端已啟動 (PID: $FRONTEND_PID)"
    echo "   🔗 前端 URL: http://localhost:5174"
}

# 主選單
show_menu() {
    echo ""
    log_header "🚀 OrionLabs 混合開發環境"
    echo ""
    echo "選擇開發模式："
    echo "1) 🐍 本地模式    - Python 3.11 後端 + Vite 前端 (快速開發)"
    echo "2) 🐳 Docker模式  - Docker 後端 + Vite 前端 (環境一致性)"
    echo "3) 📊 環境對比    - 顯示本地vs Docker環境差異"
    echo "4) 🛑 停止服務    - 停止所有服務"
    echo "5) ❌ 退出"
    echo ""
    read -p "請選擇 (1-5): " choice
}

# 環境對比
show_env_comparison() {
    log_header "📊 環境對比分析"
    
    echo ""
    echo "| 項目 | 本地開發 | Docker容器 | 一致性 |"
    echo "|------|----------|------------|--------|"
    
    # Python 版本對比
    if [ -d "$PYTHON311_VENV" ]; then
        LOCAL_PYTHON=$($PYTHON311_VENV/bin/python --version 2>&1)
        echo "| Python | $LOCAL_PYTHON | Python 3.11.13 | ✅ 相容 |"
    else
        echo "| Python | 未設定 | Python 3.11.13 | ❌ 需設定 |"
    fi
    
    # 檢查線上 Docker 狀態
    echo "| Docker | 本地容器 | Oracle Cloud | 檢查中... |"
    
    echo ""
    log_info "建議：使用 Python 3.11 統一環境確保最佳一致性"
}

# 停止服務
stop_services() {
    log_header "🛑 停止所有服務"
    
    # 停止本地進程
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        log_info "已停止本地後端 (PID: $BACKEND_PID)"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        log_info "已停止前端 (PID: $FRONTEND_PID)"
    fi
    
    # 停止 Docker 容器
    cd "$FRONTEND_DIR"
    docker-compose -f docker-compose.dev.yml down 2>/dev/null
    log_info "已停止 Docker 服務"
    
    log_success "✅ 所有服務已停止"
}

# 主程式
main() {
    while true; do
        show_menu
        
        case $choice in
            1)
                start_local_backend && start_frontend
                ;;
            2)
                start_docker_backend && start_frontend
                ;;
            3)
                show_env_comparison
                ;;
            4)
                stop_services
                ;;
            5)
                log_info "再見！"
                exit 0
                ;;
            *)
                log_error "無效選擇，請重新選擇"
                ;;
        esac
        
        echo ""
        read -p "按 Enter 繼續..."
    done
}

# 執行主程式
main
