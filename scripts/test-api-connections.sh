#!/bin/bash

# API 連接測試腳本
echo "🧪 開始測試 OrionLabs API 連接..."

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 測試後端 API
echo -e "\n${BLUE}1. 測試後端 FastAPI (http://161.33.209.198:8000)${NC}"
curl -s http://161.33.209.198:8000/health | jq '.' && echo -e "${GREEN}✅ 後端 API 連接正常${NC}" || echo -e "${RED}❌ 後端 API 連接失敗${NC}"

# 測試前端聯絡 API
echo -e "\n${BLUE}2. 測試前端聯絡 API (http://localhost:3002)${NC}"
curl -s http://localhost:3002/api/health | jq '.' && echo -e "${GREEN}✅ 聯絡 API 連接正常${NC}" || echo -e "${RED}❌ 聯絡 API 連接失敗${NC}"

# 測試前端應用
echo -e "\n${BLUE}3. 測試前端應用 (http://localhost:5175)${NC}"
curl -s -I http://localhost:5175 | head -1 | grep "200 OK" > /dev/null && echo -e "${GREEN}✅ 前端應用連接正常${NC}" || echo -e "${RED}❌ 前端應用連接失敗${NC}"

# 測試後端 API 端點
echo -e "\n${BLUE}4. 測試後端 API 端點${NC}"

echo -e "   ${YELLOW}4.1 測試博客端點${NC}"
curl -s http://161.33.209.198:8000/api/blog/posts?page=1&size=5 | jq '.data | length' > /dev/null && echo -e "   ${GREEN}✅ 博客 API 正常${NC}" || echo -e "   ${RED}❌ 博客 API 失敗${NC}"

echo -e "   ${YELLOW}4.2 測試作品集端點${NC}"
curl -s http://161.33.209.198:8000/api/portfolio/items | jq '. | length' > /dev/null && echo -e "   ${GREEN}✅ 作品集 API 正常${NC}" || echo -e "   ${RED}❌ 作品集 API 失敗${NC}"

echo -e "\n${BLUE}5. 測試聯絡表單端點${NC}"
# 測試聯絡表單提交（使用測試資料）
TEST_DATA='{
  "name": "測試用戶",
  "email": "test@example.com",
  "subject": "API 測試",
  "message": "這是一個自動化測試訊息，請忽略。",
  "recaptcha": "test-token"
}'

echo -e "   ${YELLOW}5.1 測試聯絡表單提交${NC}"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  http://localhost:3002/api/contact | jq '.' > /dev/null && echo -e "   ${GREEN}✅ 聯絡表單 API 正常${NC}" || echo -e "   ${YELLOW}⚠️  聯絡表單 API 需要配置 SMTP${NC}"

echo -e "\n${GREEN}🎉 API 連接測試完成！${NC}"
echo -e "${BLUE}📊 服務狀態總覽：${NC}"
echo -e "   🖥️  前端應用: http://localhost:5175"
echo -e "   🔧 前端 API: http://localhost:3002"
echo -e "   🚀 後端 API: http://161.33.209.198:8000"
echo -e "   📚 API 文檔: http://161.33.209.198:8000/docs"
