#!/bin/bash
# 啟動 backend FastAPI 伺服器
echo "正在啟動後端服務..."
cd ../Orionlabs-backend

# 檢查並激活虛擬環境
if [ -d ".venv" ]; then
    echo "激活虛擬環境..."
    source .venv/bin/activate
else
    echo "使用系統Python..."
fi

# 使用 uvicorn 啟動 FastAPI 應用
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# 等待後端啟動
echo "等待後端服務啟動..."
sleep 3

# 檢查後端是否啟動成功
for i in {1..10}; do
    if curl -s http://161.33.209.198:8000/health > /dev/null 2>&1; then
        echo "後端服務已啟動！"
        break
    fi
    echo "等待後端服務... ($i/10)"
    sleep 1
done

cd ../orionlabs-website
yarn dev
