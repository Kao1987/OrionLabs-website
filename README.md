# 🌟 Orion - 個人品牌網站

> 一個現代化的個人品牌網站，展示專業技能、作品集和個人故事

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.x-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)
[![Vite](https://img.shields.io/badge/Vite-4.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)

## 📋 目錄

- [✨ 專案特色](#-專案特色)
- [🏗️ 技術架構](#️-技術架構)
- [📄 頁面功能](#-頁面功能)
- [🚀 快速開始](#-快速開始)
- [📱 響應式設計](#-響應式設計)
- [🎨 設計系統](#-設計系統)
- [📂 專案結構](#-專案結構)
- [🔧 自訂配置](#-自訂配置)
- [📦 部署指南](#-部署指南)
- [🤝 貢獻指南](#-貢獻指南)

## ✨ 專案特色

- 🎯 **現代化設計** - 採用最新的網頁設計趨勢
- 📱 **完全響應式** - 支援所有裝置尺寸
- ⚡ **高效能** - 使用 Vite 建置工具，載入速度極快
- 🔍 **SEO 友善** - 動態頁面標題和 Meta 標籤
- ♿ **無障礙設計** - 遵循 WCAG 指導原則
- 🎨 **統一設計系統** - 一致的視覺風格和互動體驗
- 📝 **TypeScript 支援** - 提供型別安全和更好的開發體驗

## 🏗️ 技術架構

### 前端框架
- **Vue.js 3** - 使用 Composition API
- **TypeScript** - 型別安全的 JavaScript
- **Vite** - 新一代前端建置工具

### UI 框架
- **Bootstrap 5** - 響應式 CSS 框架
- **Bootstrap Icons** - 豐富的圖標庫
- **自訂 CSS** - 品牌色彩和動畫效果

### 狀態管理與路由
- **Vue Router** - 單頁應用路由
- **Pinia** - 輕量級狀態管理

### 開發工具
- **ESLint** - 程式碼品質檢查
- **Yarn** - 套件管理工具

## 📄 頁面功能

### 🏠 首頁 (`/`)
- **Hero 區塊** - 個人介紹和專業定位
- **服務項目** - 前端開發、UI/UX 設計、響應式設計
- **精選作品** - 展示最優秀的專案成果
- **技能統計** - 視覺化技能熟練度
- **專業經驗** - 重點成就展示
- **CTA 行動呼籲** - 引導訪客聯繫

### 👤 關於我 (`/about`)
- **個人故事** - 職業背景和發展歷程
- **專業技能** - 分類展示技術能力
- **工作經歷** - 時間軸形式的職業經驗
- **教育背景** - 學歷和專業認證
- **興趣愛好** - 展現個人特色
- **統計數據** - 經驗年數、完成專案、客戶數量

### 💼 作品集 (`/portfolio`)
- **專案篩選** - 依類別篩選作品
- **作品展示** - 卡片式布局
- **詳細資訊** - Modal 彈窗顯示完整資訊
- **技術標籤** - 使用的技術和工具
- **外部連結** - GitHub 和線上展示連結
- **專案特色** - 重點功能介紹

### 📝 部落格 (`/blog`)
- **文章列表** - 技術心得和開發經驗
- **分類標籤** - 文章主題分類
- **閱讀時間** - 預估閱讀時長
- **側邊欄** - 作者資訊、熱門標籤、最新文章
- **文章歸檔** - 按月份分類
- **分頁導航** - 提升瀏覽體驗

### 📧 聯絡我 (`/contact`)
- **聯絡表單** - 即時表單驗證
- **聯絡資訊** - 多種聯繫方式
- **社群媒體** - 專業社群平台連結
- **服務時間** - 回覆時間說明
- **常見問題** - FAQ 手風琴介面
- **成功回饋** - 表單提交確認

### ❌ 404 頁面
- **友善提示** - 清楚的錯誤說明
- **導航建議** - 推薦頁面連結
- **返回功能** - 一鍵返回上頁

## 🚀 快速開始

### 環境需求
- Node.js 16.0+ 
- Yarn 1.22+

### 安裝步驟

1. **複製專案**
```bash
git clone <repository-url>
cd personal-brand-website
```

2. **安裝依賴**
```bash
yarn install
```

3. **啟動開發伺服器**
```bash
yarn dev
```

4. **開啟瀏覽器**
```
http://localhost:5173
```

### 其他指令

```bash
# 建置生產版本
yarn build

# 預覽生產版本
yarn preview

# 程式碼檢查
yarn lint
```

## 📱 響應式設計

網站採用 Mobile-First 設計策略，完美支援：

- 📱 **手機** (320px - 768px)
- 📱 **平板** (768px - 992px) 
- 💻 **桌面** (992px - 1200px)
- 🖥️ **大螢幕** (1200px+)

### 主要響應式特色
- Bootstrap Grid 系統
- 彈性圖片和媒體
- 觸控友善的互動元素
- 適應性字體大小
- 手機版導航選單

## 🎨 設計系統

### 品牌色彩
```css
--brand-primary: #2c3e50    /* 主要色彩 */
--brand-secondary: #34495e  /* 次要色彩 */
--brand-accent: #3498db     /* 強調色彩 */
--brand-light: #f8f9fa      /* 淺色背景 */
```

### 字體系統
- **主要字體**: Inter, -apple-system, BlinkMacSystemFont
- **標題字體**: 700 字重
- **內文字體**: 400 字重
- **行高**: 1.6

### 元件樣式
- **卡片** - 圓角、陰影、懸停效果
- **按鈕** - 漸變背景、動畫效果
- **表單** - 現代化輸入框樣式
- **導航** - 固定式頂部導航
- **Footer** - 多欄位資訊佈局

## 📂 專案結構

```
personal-brand-website/
├── public/                 # 靜態資源
│   │   └── global.css     # 全域樣式
│   ├── components/        # 共用元件
│   │   ├── Navbar.vue     # 導航列
│   │   └── Footer.vue     # 頁腳
│   ├── router/            # 路由配置
│   │   └── index.ts       # 路由定義
│   ├── views/             # 頁面元件
│   │   ├── HomeView.vue       # 首頁
│   │   ├── AboutView.vue      # 關於我
│   │   ├── PortfolioView.vue  # 作品集
│   │   ├── BlogView.vue       # 部落格
│   │   ├── ContactView.vue    # 聯絡我
│   │   └── NotFoundView.vue   # 404頁面
│   ├── App.vue            # 根元件
│   └── main.ts            # 入口檔案
├── package.json           # 專案配置
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── README.md             # 說明文件
```

## 🔧 自訂配置

### 修改個人資訊

1. **品牌名稱** - 在 `App.vue` 中修改
2. **聯絡資訊** - 在各個元件中更新
3. **社群連結** - 在 `Footer.vue` 和相關頁面修改
4. **個人照片** - 替換 `/public` 目錄中的圖片

### 調整設計風格

1. **色彩主題** - 修改 `global.css` 中的 CSS 變數
2. **字體** - 在 `global.css` 中調整字體設定
3. **間距** - 調整 Bootstrap 的 spacing utilities
4. **動畫** - 在 `global.css` 中自訂動畫效果

### 新增內容

1. **作品專案** - 在 `PortfolioView.vue` 中新增專案資料
2. **部落格文章** - 在 `BlogView.vue` 中新增文章內容
3. **工作經歷** - 在 `AboutView.vue` 中更新經歷資訊
4. **技能項目** - 在相關元件中新增技能資料

## 📦 部署指南

### Vercel 部署
1. 推送程式碼到 GitHub
2. 連結 Vercel 帳號
3. 選擇專案並部署

### Netlify 部署
1. 建置專案：`yarn build`
2. 上傳 `dist` 資料夾到 Netlify
3. 設定重新導向規則

### GitHub Pages
1. 安裝 gh-pages：`yarn add -D gh-pages`
2. 建置並部署：`yarn build && gh-pages -d dist`

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

### 開發流程
1. Fork 專案
2. 建立功能分支：`git checkout -b feature/amazing-feature`
3. 提交變更：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 建立 Pull Request

### 程式碼風格
- 使用 ESLint 規則
- 遵循 Vue.js 風格指南
- 保持程式碼簡潔和可讀性

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 📞 聯絡資訊

- **Email**: hong.yikao@example.com
- **LinkedIn**: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- **GitHub**: [github.com/yourusername](https://github.com/yourusername)

---

<div align="center">

**⭐ 如果這個專案對您有幫助，請給個 Star！**

Made with ❤️ in Taiwan

</div>
