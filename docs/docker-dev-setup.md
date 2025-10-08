# Docker本地開發環境設置指南

## 🎯 架構說明
此設置讓你在本地運行：
- **前端**: Vite開發服務器 (端口5173-5176)
- **後端**: Docker容器化的FastAPI (端口8001)
- **資料庫**: 線上MySQL (通過SSH隧道連接)

## 🚀 快速開始

### 1. 設置SSH隧道 (首次設置)
```bash
# 修改SSH配置 (可選，提升便利性)
# 編輯 ~/.ssh/config 添加:
Host orion-server
    HostName 161.33.209.198
    User your-username
    Port 22
    IdentityFile ~/.ssh/your-key

# 測試SSH連接
ssh your-username@161.33.209.198
```

### 2. 修改隧道腳本配置
編輯 `scripts/ssh-tunnel.sh`，更新：
```bash
SSH_USER="your-username"  # 改為你的實際用戶名
```

### 3. 啟動開發環境

#### 方法一：一鍵啟動 (推薦)
```bash
# 啟動SSH隧道 + Docker後端
yarn docker:dev

# 另開終端，啟動前端
yarn dev:docker
```

#### 方法二：分步驟啟動
```bash
# 步驟1: 啟動SSH隧道
yarn tunnel:start

# 步驟2: 啟動Docker後端
docker-compose -f docker-compose.dev.yml up --build

# 步驟3: 啟動前端 (另開終端)
yarn dev:docker
```

## 📊 檢查服務狀態

```bash
# 檢查SSH隧道
yarn tunnel:status

# 檢查Docker服務
docker-compose -f docker-compose.dev.yml ps

# 查看後端日誌
docker-compose -f docker-compose.dev.yml logs -f backend-dev

# 測試API連接
curl http://localhost:8001/api/v1/health
```

## 🛑 停止服務

```bash
# 停止Docker後端
yarn docker:stop

# 停止SSH隧道
yarn tunnel:stop
```

## 🔧 疑難排解

### 常見問題

#### 1. SSH隧道連接失敗
```bash
# 檢查SSH密鑰權限
chmod 600 ~/.ssh/your-key

# 測試SSH連接
ssh -v your-username@161.33.209.198
```

#### 2. Docker容器無法連接資料庫
```bash
# 檢查隧道狀態
lsof -i :3306

# 在容器內測試連接
docker exec -it orionlabs-backend-dev nc -z host.docker.internal 3306
```

#### 3. 端口衝突
```bash
# 檢查端口使用
lsof -i :3306  # SSH隧道
lsof -i :8001  # Docker後端
lsof -i :5173  # 前端
```

### 重置環境
```bash
# 清理所有Docker資源
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f

# 重新建立隧道
yarn tunnel:restart
```

## 📋 開發流程

1. **啟動** → `yarn docker:dev` + `yarn dev:docker`
2. **開發** → 前端熱重載，後端代碼同步
3. **測試** → API測試在 localhost:8001
4. **停止** → `yarn docker:stop` + `yarn tunnel:stop`

## ⚙️ 環境變數說明

Docker容器使用的環境變數 (docker-compose.dev.yml):
- `DATABASE_URL`: 連接字串指向 host.docker.internal:3306
- `DATABASE_HOST`: host.docker.internal (Docker訪問主機的特殊域名)
- `FRONTEND_URL`: 支援多個前端端口
- `DEBUG`: True (開發模式)

前端環境變數 (yarn dev:docker):
- `VITE_PROXY_API_TARGET`: localhost:8001 (代理到Docker後端)

## 🔐 安全注意事項

1. **SSH隧道**: 確保SSH密鑰安全
2. **資料庫密碼**: 不要將真實密碼提交到版本控制
3. **開發環境**: 僅在本地使用，不要暴露到外網
4. **Docker權限**: 注意Docker權限管理

## 📈 效能優化

1. **Docker建構快取**: 使用 `--build` 時注意快取策略
2. **檔案同步**: volumes配置已排除 `__pycache__`
3. **資料庫連接池**: 後端配置適當的連接池大小
4. **SSH隧道**: 使用SSH密鑰而非密碼認證