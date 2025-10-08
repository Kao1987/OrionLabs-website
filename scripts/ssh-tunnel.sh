#!/bin/bash

# SSH隧道管理腳本 - OrionLabs Docker開發環境
# SSH Tunnel Management Script for OrionLabs Docker Development

set -e

# 配置變數
SSH_HOST="161.33.209.198"
SSH_USER="your-username"  # 請修改為你的用戶名
LOCAL_PORT="3306"
REMOTE_HOST="localhost" 
REMOTE_PORT="3306"
TUNNEL_NAME="orionlabs-docker-db-tunnel"

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 顯示使用說明
show_usage() {
    echo -e "${BLUE}📘 OrionLabs Docker開發環境 - SSH隧道管理工具${NC}"
    echo ""
    echo "此工具用於建立本地Docker後端到線上資料庫的連接"
    echo ""
    echo "使用方法:"
    echo "  $0 start    - 啟動SSH隧道"
    echo "  $0 stop     - 停止SSH隧道" 
    echo "  $0 status   - 檢查隧道狀態"
    echo "  $0 restart  - 重啟隧道"
    echo "  $0 docker   - 啟動隧道並運行Docker後端"
    echo ""
    echo "配置說明:"
    echo "  本地端口: ${LOCAL_PORT} (Docker容器通過host.docker.internal訪問)"
    echo "  遠程主機: ${SSH_HOST}"
    echo "  遠程端口: ${REMOTE_PORT}"
    echo ""
    echo "開發流程:"
    echo "  1. $0 start     # 建立資料庫隧道"
    echo "  2. yarn dev     # 啟動前端開發服務器"
    echo "  3. docker-compose -f docker-compose.dev.yml up  # 啟動後端"
}

# 檢查隧道狀態
check_tunnel_status() {
    if pgrep -f "ssh.*-L.*${LOCAL_PORT}:${REMOTE_HOST}:${REMOTE_PORT}.*${SSH_HOST}" > /dev/null; then
        return 0  # 隧道運行中
    else
        return 1  # 隧道未運行
    fi
}

# 啟動隧道
start_tunnel() {
    echo -e "${BLUE}🚀 啟動SSH隧道...${NC}"
    
    if check_tunnel_status; then
        echo -e "${YELLOW}⚠️  SSH隧道已在運行中${NC}"
        return 0
    fi
    
    # 檢查本地端口是否被佔用
    if lsof -i :${LOCAL_PORT} > /dev/null 2>&1; then
        echo -e "${RED}❌ 端口 ${LOCAL_PORT} 已被佔用${NC}"
        echo "請檢查是否有其他服務使用此端口:"
        lsof -i :${LOCAL_PORT}
        return 1
    fi
    
    # 啟動SSH隧道
    echo "建立隧道: localhost:${LOCAL_PORT} -> ${SSH_HOST}:${REMOTE_PORT}"
    ssh -f -N -L ${LOCAL_PORT}:${REMOTE_HOST}:${REMOTE_PORT} ${SSH_USER}@${SSH_HOST}
    
    # 等待一秒鐘並檢查狀態
    sleep 2
    if check_tunnel_status; then
        echo -e "${GREEN}✅ SSH隧道啟動成功${NC}"
        echo -e "${GREEN}📡 資料庫連接可用: localhost:${LOCAL_PORT}${NC}"
    else
        echo -e "${RED}❌ SSH隧道啟動失敗${NC}"
        return 1
    fi
}

# 停止隧道
stop_tunnel() {
    echo -e "${BLUE}🛑 停止SSH隧道...${NC}"
    
    if ! check_tunnel_status; then
        echo -e "${YELLOW}⚠️  SSH隧道未在運行${NC}"
        return 0
    fi
    
    # 找到並終止SSH隧道進程
    pkill -f "ssh.*-L.*${LOCAL_PORT}:${REMOTE_HOST}:${REMOTE_PORT}.*${SSH_HOST}" || true
    
    sleep 1
    if ! check_tunnel_status; then
        echo -e "${GREEN}✅ SSH隧道已停止${NC}"
    else
        echo -e "${RED}❌ 無法停止SSH隧道${NC}"
        return 1
    fi
}

# 檢查狀態
show_status() {
    echo -e "${BLUE}📊 SSH隧道狀態檢查${NC}"
    echo ""
    
    if check_tunnel_status; then
        echo -e "${GREEN}✅ SSH隧道運行中${NC}"
        echo "隧道配置: localhost:${LOCAL_PORT} -> ${SSH_HOST}:${REMOTE_PORT}"
        
        # 顯示進程信息
        echo ""
        echo "進程信息:"
        pgrep -f "ssh.*-L.*${LOCAL_PORT}:${REMOTE_HOST}:${REMOTE_PORT}.*${SSH_HOST}" | while read pid; do
            ps -p $pid -o pid,command
        done
        
        # 測試連接
        echo ""
        echo -e "${BLUE}🔍 測試資料庫連接...${NC}"
        if nc -z localhost ${LOCAL_PORT} 2>/dev/null; then
            echo -e "${GREEN}✅ 端口 ${LOCAL_PORT} 可連接${NC}"
        else
            echo -e "${RED}❌ 端口 ${LOCAL_PORT} 無法連接${NC}"
        fi
    else
        echo -e "${RED}❌ SSH隧道未運行${NC}"
    fi
    
    echo ""
    echo "系統端口狀態:"
    lsof -i :${LOCAL_PORT} 2>/dev/null || echo "端口 ${LOCAL_PORT} 未被使用"
}

# 重啟隧道
restart_tunnel() {
    echo -e "${BLUE}🔄 重啟SSH隧道...${NC}"
    stop_tunnel
    sleep 2
    start_tunnel
}

# 啟動Docker開發環境
start_docker_dev() {
    echo -e "${BLUE}🐳 啟動Docker開發環境 (本地後端 + 線上資料庫)${NC}"
    
    # 先確保SSH隧道運行
    if ! check_tunnel_status; then
        echo "首先建立SSH隧道..."
        start_tunnel || return 1
    fi
    
    echo ""
    echo -e "${BLUE}📦 啟動Docker後端服務...${NC}"
    echo "使用配置: docker-compose.dev.yml"
    echo "後端端口: localhost:8001"
    echo "資料庫連接: host.docker.internal:3306 (通過SSH隧道)"
    echo ""
    
    # 檢查docker-compose.dev.yml是否存在
    if [ ! -f "docker-compose.dev.yml" ]; then
        echo -e "${RED}❌ 找不到 docker-compose.dev.yml 文件${NC}"
        return 1
    fi
    
    # 啟動Docker服務
    docker-compose -f docker-compose.dev.yml up --build -d
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Docker後端服務啟動成功${NC}"
        echo ""
        echo -e "${GREEN}🎯 開發環境已準備就緒：${NC}"
        echo "  • 前端: 運行 'yarn dev' 啟動 (端口5173-5176)"
        echo "  • 後端: Docker容器運行中 (端口8001)"
        echo "  • 資料庫: 通過SSH隧道連接線上資料庫"
        echo ""
        echo "檢查服務狀態: docker-compose -f docker-compose.dev.yml ps"
        echo "查看日誌: docker-compose -f docker-compose.dev.yml logs -f"
    else
        echo -e "${RED}❌ Docker後端服務啟動失敗${NC}"
        return 1
    fi
}

# 主程序
case "${1:-}" in
    start)
        start_tunnel
        ;;
    stop)
        stop_tunnel
        ;;
    status)
        show_status
        ;;
    restart)
        restart_tunnel
        ;;
    docker)
        start_docker_dev
        ;;
    *)
        show_usage
        exit 1
        ;;
esac