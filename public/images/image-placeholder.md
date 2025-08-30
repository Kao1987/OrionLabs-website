# 臨時解決方案：圖片佔位符

由於目前缺少設計師製作的 OG 圖片，建議暫時使用以下解決方案：

## 方案 1：使用現有 Favicon
可以暫時將 favicon.ico 複製並重新命名為各個 OG 圖片檔案：

```bash
# 在專案根目錄執行
cp public/favicon.ico public/images/og-default.jpg
cp public/favicon.ico public/images/og-home.jpg
cp public/favicon.ico public/images/og-about.jpg
cp public/favicon.ico public/images/og-portfolio.jpg
cp public/favicon.ico public/images/og-blog.jpg
cp public/favicon.ico public/images/og-blog-default.jpg
cp public/favicon.ico public/images/og-contact.jpg
```

## 方案 2：線上圖片產生器
使用線上工具生成簡單的 OG 圖片：
- https://www.canva.com/create/facebook-covers/
- https://www.figma.com/
- https://placeholdit.imgix.net/~text?txtsize=60&txt=OrionLabs&w=1200&h=630

## 方案 3：程式化生成
建立簡單的 SVG 並轉換為 JPEG：

```html
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#002fa7"/>
  <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="72" font-family="Arial">
    OrionLabs
  </text>
</svg>
```

## 建議
立即採用方案 1 作為臨時解決方案，確保網站可以正常上線。
後續再請設計師製作專業的 OG 圖片。