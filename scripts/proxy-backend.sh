#!/bin/bash
# 啟動 backend FastAPI 伺服器
echo "正在啟動後端服務..."
cd ../Orionlabs-backend
/Users/hong-yikao/Documents/Orionlabs/.venv/bin/python main.py &
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
