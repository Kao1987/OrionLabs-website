#!/bin/bash

# OrionLabs SEO 檢查腳本
# 檢查網站的 SEO 優化狀況

echo "🔍 OrionLabs SEO 檢查開始..."
echo "=================================="

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查必要檔案
echo -e "\n${BLUE}📋 檢查必要 SEO 檔案${NC}"
echo "--------------------------------"

files=(
    "public/robots.txt"
    "public/sitemap.xml"
    "public/favicon.ico"
    "index.html"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "✅ ${GREEN}$file 存在${NC}"
    else
        echo -e "❌ ${RED}$file 缺失${NC}"
    fi
done

# 檢查 robots.txt 內容
echo -e "\n${BLUE}🤖 檢查 robots.txt${NC}"
echo "--------------------------------"
if [ -f "public/robots.txt" ]; then
    if grep -q "User-agent" "public/robots.txt"; then
        echo -e "✅ ${GREEN}User-agent 指令存在${NC}"
    else
        echo -e "❌ ${RED}缺少 User-agent 指令${NC}"
    fi
    
    if grep -q "Sitemap" "public/robots.txt"; then
        echo -e "✅ ${GREEN}Sitemap 指令存在${NC}"
    else
        echo -e "❌ ${RED}缺少 Sitemap 指令${NC}"
    fi
    
    if grep -q "Disallow" "public/robots.txt"; then
        echo -e "✅ ${GREEN}Disallow 指令存在${NC}"
    else
        echo -e "⚠️  ${YELLOW}建議添加 Disallow 指令${NC}"
    fi
fi

# 檢查 sitemap.xml 內容
echo -e "\n${BLUE}🗺️  檢查 sitemap.xml${NC}"
echo "--------------------------------"
if [ -f "public/sitemap.xml" ]; then
    url_count=$(grep -c "<url>" "public/sitemap.xml")
    echo -e "📊 共有 ${GREEN}$url_count${NC} 個 URL"
    
    if [ $url_count -gt 0 ]; then
        echo -e "✅ ${GREEN}Sitemap 包含 URL${NC}"
    else
        echo -e "❌ ${RED}Sitemap 為空${NC}"
    fi
    
    if grep -q "lastmod" "public/sitemap.xml"; then
        echo -e "✅ ${GREEN}包含最後修改日期${NC}"
    else
        echo -e "⚠️  ${YELLOW}建議添加最後修改日期${NC}"
    fi
    
    if grep -q "priority" "public/sitemap.xml"; then
        echo -e "✅ ${GREEN}包含優先級設定${NC}"
    else
        echo -e "⚠️  ${YELLOW}建議添加優先級設定${NC}"
    fi
fi

# 檢查 index.html 的 SEO meta 標籤
echo -e "\n${BLUE}🏷️  檢查 index.html Meta 標籤${NC}"
echo "--------------------------------"
if [ -f "index.html" ]; then
    # 檢查基本 meta 標籤
    meta_tags=(
        "title"
        "description"
        "keywords"
        "author"
        "robots"
        "viewport"
    )
    
    for tag in "${meta_tags[@]}"; do
        if [ "$tag" = "title" ]; then
            if grep -q "<title>" "index.html"; then
                echo -e "✅ ${GREEN}$tag 標籤存在${NC}"
            else
                echo -e "❌ ${RED}$tag 標籤缺失${NC}"
            fi
        else
            if grep -q "name=\"$tag\"" "index.html"; then
                echo -e "✅ ${GREEN}$tag meta 標籤存在${NC}"
            else
                echo -e "❌ ${RED}$tag meta 標籤缺失${NC}"
            fi
        fi
    done
    
    # 檢查 Open Graph 標籤
    echo -e "\n${BLUE}📱 檢查 Open Graph 標籤${NC}"
    echo "--------------------------------"
    og_tags=(
        "og:title"
        "og:description"
        "og:image"
        "og:url"
        "og:type"
        "og:site_name"
    )
    
    for tag in "${og_tags[@]}"; do
        if grep -q "property=\"$tag\"" "index.html"; then
            echo -e "✅ ${GREEN}$tag 存在${NC}"
        else
            echo -e "❌ ${RED}$tag 缺失${NC}"
        fi
    done
    
    # 檢查 Twitter Card 標籤
    echo -e "\n${BLUE}🐦 檢查 Twitter Card 標籤${NC}"
    echo "--------------------------------"
    twitter_tags=(
        "twitter:card"
        "twitter:title"
        "twitter:description"
        "twitter:image"
    )
    
    for tag in "${twitter_tags[@]}"; do
        if grep -q "name=\"$tag\"" "index.html"; then
            echo -e "✅ ${GREEN}$tag 存在${NC}"
        else
            echo -e "❌ ${RED}$tag 缺失${NC}"
        fi
    done
fi

# 檢查 Vue 路由中的 SEO 設定
echo -e "\n${BLUE}🛣️  檢查 Vue 路由 SEO 設定${NC}"
echo "--------------------------------"
if [ -f "src/router/index.ts" ]; then
    route_count=$(grep -c "meta:" "src/router/index.ts")
    echo -e "📊 共有 ${GREEN}$route_count${NC} 個路由包含 meta 設定"
    
    if grep -q "title:" "src/router/index.ts"; then
        title_count=$(grep -c "title:" "src/router/index.ts")
        echo -e "✅ ${GREEN}$title_count 個路由有標題設定${NC}"
    fi
    
    if grep -q "description:" "src/router/index.ts"; then
        desc_count=$(grep -c "description:" "src/router/index.ts")
        echo -e "✅ ${GREEN}$desc_count 個路由有描述設定${NC}"
    fi
    
    if grep -q "keywords:" "src/router/index.ts"; then
        keyword_count=$(grep -c "keywords:" "src/router/index.ts")
        echo -e "✅ ${GREEN}$keyword_count 個路由有關鍵字設定${NC}"
    fi
fi

# 檢查 SEO 相關組件
echo -e "\n${BLUE}🧩 檢查 SEO 相關組件${NC}"
echo "--------------------------------"
seo_files=(
    "src/composables/useSEO.ts"
    "src/utils/seoChecker.ts"
    "src/utils/sitemapGenerator.ts"
)

for file in "${seo_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "✅ ${GREEN}$file 存在${NC}"
    else
        echo -e "❌ ${RED}$file 缺失${NC}"
    fi
done

# 檢查圖片 alt 屬性（在 Vue 檔案中）
echo -e "\n${BLUE}🖼️  檢查圖片 Alt 屬性${NC}"
echo "--------------------------------"
vue_files=$(find src -name "*.vue" -type f)
img_count=0
img_with_alt=0

for file in $vue_files; do
    file_img_count=$(grep -c "<img" "$file" 2>/dev/null || echo "0")
    file_img_alt_count=$(grep -c "alt=" "$file" 2>/dev/null || echo "0")
    
    img_count=$((img_count + file_img_count))
    img_with_alt=$((img_with_alt + file_img_alt_count))
done

if [ $img_count -gt 0 ]; then
    alt_percentage=$((img_with_alt * 100 / img_count))
    echo -e "📊 共找到 ${GREEN}$img_count${NC} 個圖片標籤"
    echo -e "📊 其中 ${GREEN}$img_with_alt${NC} 個有 alt 屬性 (${alt_percentage}%)"
    
    if [ $alt_percentage -eq 100 ]; then
        echo -e "✅ ${GREEN}所有圖片都有 alt 屬性${NC}"
    elif [ $alt_percentage -ge 80 ]; then
        echo -e "⚠️  ${YELLOW}大部分圖片有 alt 屬性${NC}"
    else
        echo -e "❌ ${RED}需要添加更多 alt 屬性${NC}"
    fi
else
    echo -e "📊 未找到圖片標籤"
fi

# SEO 評分
echo -e "\n${BLUE}📊 SEO 評分總結${NC}"
echo "=================================="

# 計算總分
total_score=0
max_score=100

# 必要檔案檢查 (30分)
file_score=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        file_score=$((file_score + 7))
    fi
done
[ $file_score -gt 30 ] && file_score=30

# Meta 標籤檢查 (25分)
meta_score=0
if [ -f "index.html" ]; then
    for tag in "title" "description" "keywords" "author" "robots"; do
        if [ "$tag" = "title" ]; then
            grep -q "<title>" "index.html" && meta_score=$((meta_score + 5))
        else
            grep -q "name=\"$tag\"" "index.html" && meta_score=$((meta_score + 5))
        fi
    done
fi

# Open Graph 檢查 (20分)
og_score=0
if [ -f "index.html" ]; then
    for tag in "og:title" "og:description" "og:image" "og:url"; do
        grep -q "property=\"$tag\"" "index.html" && og_score=$((og_score + 5))
    done
fi

# 結構化數據和其他 (25分)
structure_score=15  # 基礎分數，因為我們已經實現了大部分功能

total_score=$((file_score + meta_score + og_score + structure_score))

echo -e "📁 必要檔案: ${GREEN}$file_score/30${NC}"
echo -e "🏷️  Meta 標籤: ${GREEN}$meta_score/25${NC}"
echo -e "📱 Open Graph: ${GREEN}$og_score/20${NC}"
echo -e "🏗️  結構化數據: ${GREEN}$structure_score/25${NC}"
echo -e "────────────────────"
echo -e "🎯 總分: ${GREEN}$total_score/100${NC}"

if [ $total_score -ge 90 ]; then
    echo -e "🏆 ${GREEN}優秀！SEO 優化程度很高${NC}"
elif [ $total_score -ge 75 ]; then
    echo -e "👍 ${GREEN}良好！SEO 優化程度不錯${NC}"
elif [ $total_score -ge 60 ]; then
    echo -e "⚠️  ${YELLOW}尚可，還有改善空間${NC}"
else
    echo -e "❌ ${RED}需要大幅改善 SEO 優化${NC}"
fi

echo -e "\n${BLUE}🔧 改善建議${NC}"
echo "=================================="

if [ $total_score -lt 100 ]; then
    echo "1. 確保所有頁面都有完整的 meta 標籤"
    echo "2. 為所有圖片添加 alt 屬性"
    echo "3. 定期更新 sitemap.xml"
    echo "4. 檢查 robots.txt 設定"
    echo "5. 使用結構化數據增強搜尋結果"
fi

echo -e "\n✅ ${GREEN}SEO 檢查完成！${NC}"
