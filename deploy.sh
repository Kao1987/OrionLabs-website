#!/bin/bash

# 部署腳本 for Personal Brand Website
# 使用方法: ./deploy.sh [version]

set -e

# 設定變數
IMAGE_NAME="personal-brand-website"
REGISTRY_URL="your-registry-url"  # 請替換為您的容器註冊表 URL
VERSION=${1:-latest}
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_COMMIT=$(git rev-parse --short HEAD)

echo "🚀 開始部署 Personal Brand Website..."
echo "📦 映像名稱: $IMAGE_NAME"
echo "🏷️  版本標籤: $VERSION"
echo "📅 建構時間: $BUILD_DATE"
echo "🔗 Git Commit: $GIT_COMMIT"

# 建構 Docker 映像
echo "🔨 建構 Docker 映像..."
docker build \
  --build-arg BUILD_DATE="$BUILD_DATE" \
  --build-arg GIT_COMMIT="$GIT_COMMIT" \
  --tag "$IMAGE_NAME:$VERSION" \
  --tag "$IMAGE_NAME:latest" \
  .

echo "✅ Docker 映像建構完成"

# 測試映像
echo "🧪 測試映像..."
docker run --rm -d --name test-container -p 8080:80 "$IMAGE_NAME:$VERSION"
sleep 5

# 健康檢查
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ 健康檢查通過"
    docker stop test-container
else
    echo "❌ 健康檢查失敗"
    docker stop test-container
    exit 1
fi

# 標記並推送到註冊表 (可選)
if [ -n "$REGISTRY_URL" ] && [ "$REGISTRY_URL" != "your-registry-url" ]; then
    echo "🏷️  標記映像用於推送..."
    docker tag "$IMAGE_NAME:$VERSION" "$REGISTRY_URL/$IMAGE_NAME:$VERSION"
    docker tag "$IMAGE_NAME:$VERSION" "$REGISTRY_URL/$IMAGE_NAME:latest"
    
    echo "⬆️  推送映像到註冊表..."
    docker push "$REGISTRY_URL/$IMAGE_NAME:$VERSION"
    docker push "$REGISTRY_URL/$IMAGE_NAME:latest"
    
    echo "✅ 映像已推送到註冊表"
fi

echo "🎉 部署準備完成！"
echo ""
echo "📋 後續步驟："
echo "1. 本地測試: docker-compose up -d"
echo "2. 查看服務: docker-compose ps"
echo "3. 查看日誌: docker-compose logs -f"
echo "4. 停止服務: docker-compose down"
echo ""
echo "🌐 VCP 部署命令："
echo "docker run -d --name personal-brand-website -p 80:80 $IMAGE_NAME:$VERSION" 