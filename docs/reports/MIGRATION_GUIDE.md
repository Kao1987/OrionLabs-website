# Orion 色彩系統遷移指南

## 📋 遷移檢查清單

### Phase 1: 準備階段 ✅
- [x] 建立 `orion-unified-theme.css` 統一主題檔案
- [x] 定義完整的藍色 + 銀灰色色彩系統
- [x] 實現 BEM-Lite 命名規範
- [x] 建立示範頁面 `color-system-demo.html`
- [x] 撰寫色彩使用指南

### Phase 2: 更新階段 (待執行)
- [ ] 更新主要 HTML 檔案引用
- [ ] 遷移現有組件樣式
- [ ] 替換硬編碼色彩值
- [ ] 更新 CSS 變數引用

### Phase 3: 清理階段 (待執行)
- [ ] 標記舊檔案為 @deprecated
- [ ] 移除重複的色彩定義
- [ ] 更新文件和範例
- [ ] 驗證無障礙合規性

## 🔄 具體遷移步驟

### 1. 更新 HTML 引用

**現在 (multiple files):**
```html
<link rel="stylesheet" href="./src/assets/css/orion-theme.css">
<link rel="stylesheet" href="./src/assets/styles/design-system.css">
<link rel="stylesheet" href="./src/assets/color-optimizations.css">
```

**更新為 (single file):**
```html
<link rel="stylesheet" href="./src/assets/css/orion-unified-theme.css">
```

### 2. 色彩變數對應表

| 舊變數 | 新變數 | 說明 |
|--------|--------|------|
| `--orion-primary: #2c3e50` | `--color-primary` (→ `#002fa7`) | 主色調改為純藍色 |
| `--orion-secondary: #34495e` | `--color-secondary` (→ `#c8c7c5`) | 次色調改為銀灰色 |
| `--orion-accent: #3498db` | `--color-accent` (→ `#3e52f7`) | 強調色保持藍色系 |
| `--color-text-primary: #2c3e50` | `--color-text-primary` (→ `#292524`) | 文字色改為深灰 |
| `--color-text-secondary: #34495e` | `--color-text-secondary` (→ `#57534e`) | 次要文字色 |
| `--color-text-muted: #7f8c8d` | `--color-text-muted` (→ `#a8a29e`) | 輔助文字色 |

### 3. 組件更新範例

#### 按鈕組件更新

**舊樣式 (需更新):**
```css
.btn-primary {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: #ffffff;
  border: 1px solid #2c3e50;
}

.btn-primary:hover {
  background: #1a252f;
}
```

**新樣式 (BEM-Lite + 新色彩):**
```css
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-text-light);
  border: 1px solid var(--color-primary);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

#### 卡片組件更新

**舊樣式:**
```css
.orion-card {
  background: var(--orion-bg-primary);
  border: 1px solid #dee2e6;
  border-radius: var(--orion-border-radius);
}
```

**新樣式:**
```css
.card {
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card_header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-primary);
}

.card_body {
  padding: var(--spacing-lg);
}
```

### 4. BEM 命名規範更新

#### 需要修正的命名

**❌ 不符合規範:**
```css
.help-tab-btn__active { }        /* 雙底線 */
.nav-tabs--primary { }           /* 雙連字號 */
.cardHeader { }                  /* 駝峰命名 */
.btn-primary-large { }           /* 過度嵌套 */
```

**✅ 正確的 BEM-Lite:**
```css
.help-tab-btn { }
.help-tab-btn-active { }         /* 單連字號 modifier */

.nav-tabs { }
.nav-tabs-primary { }            /* 單連字號 modifier */

.card { }
.card_header { }                 /* 單底線 element */

.btn { }
.btn-primary { }                 /* modifier */
.btn-large { }                   /* modifier */
/* 組合使用: .btn.btn-primary.btn-large */
```

### 5. 檔案標記為 @deprecated

在舊檔案頂部添加：

```css
/* @deprecated 2025-07-24 - 請使用 orion-unified-theme.css
 * 此檔案將在下一個主要版本中移除
 * 遷移指南: /ORION_COLOR_GUIDE.md
 */
```

## 🧪 測試和驗證

### 1. 視覺回歸測試
```bash
# 使用 Playwright 進行視覺比較
npm run test:visual
```

### 2. 色彩對比度測試
- 使用瀏覽器開發者工具的 Lighthouse
- 執行 `color-contrast.spec.ts` 測試

### 3. 響應式測試
- 測試不同螢幕尺寸
- 驗證觸控設備友好性

## 📝 更新檔案列表

### 需要更新的主要檔案:

1. **HTML 模板檔案**
   - `index.html`
   - `src/views/*.vue` (如果使用 Vue)

2. **CSS 組件檔案**
   - `src/assets/styles/components/tabs.css`
   - `src/assets/styles/components/tables.css`
   - `src/assets/styles/layouts/header.css`
   - `src/assets/styles/layouts/footer.css`
   - `src/assets/styles/layouts/container.css`

3. **配置檔案**
   - `package.json` (更新 build scripts)
   - `vite.config.js` (更新 CSS imports)

### 需要標記 @deprecated 的檔案:

1. `src/assets/css/orion-theme.css`
2. `src/assets/styles/design-system.css`
3. `src/assets/color-optimizations.css`

## 🚀 部署建議

### 1. 分階段部署
- **Week 1**: 新增統一主題檔案，並行運行
- **Week 2**: 逐步遷移組件，測試相容性
- **Week 3**: 完成遷移，移除舊檔案
- **Week 4**: 最終測試和文件更新

### 2. 回滾計畫
- 保留舊檔案直到完全遷移完成
- 建立 Git 分支用於快速回滾
- 監控效能和使用者回饋

### 3. 團隊培訓
- 分享 `ORION_COLOR_GUIDE.md`
- 示範 `color-system-demo.html`
- 建立程式碼審查檢查清單

## 📊 遷移進度追蹤

| 項目 | 狀態 | 負責人 | 預計完成 |
|------|------|--------|----------|
| 統一主題檔案 | ✅ 完成 | AI | 2025-07-24 |
| 示範頁面 | ✅ 完成 | AI | 2025-07-24 |
| 按鈕組件更新 | ⏳ 待辦 | - | - |
| 表單組件更新 | ⏳ 待辦 | - | - |
| 導航組件更新 | ⏳ 待辦 | - | - |
| 卡片組件更新 | ⏳ 待辦 | - | - |
| 響應式測試 | ⏳ 待辦 | - | - |
| 無障礙測試 | ⏳ 待辦 | - | - |
| 舊檔案清理 | ⏳ 待辦 | - | - |

## 💡 最佳實踐提醒

1. **優先使用語意化變數**：使用 `--color-primary` 而非 `--orion-blue-900`
2. **遵循 BEM-Lite 規範**：`block_element-modifier`
3. **支援暗色主題**：測試所有組件在兩種主題下的表現
4. **確保無障礙**：所有色彩組合都要通過對比度測試
5. **文件同步更新**：更新 README 和組件文件

## 🆘 問題排解

### 常見問題:

**Q: 新主題檔案太大，會影響載入效能嗎？**
A: 新檔案已經過最佳化，使用 CSS 變數減少重複，並支援 gzip 壓縮。

**Q: 如何處理第三方元件庫的樣式衝突？**
A: 使用 CSS 層疊順序和 `/* vendor-bem-allow */` 註解來管理第三方樣式。

**Q: 暗色主題切換不順暢怎麼辦？**
A: 確保所有 CSS 變數都有對應的暗色主題定義，並使用 CSS transitions。

## 📞 支援資源

- 📖 **色彩指南**: `/ORION_COLOR_GUIDE.md`
- 🎨 **示範頁面**: `/color-system-demo.html`
- 🔧 **統一主題**: `/src/assets/css/orion-unified-theme.css`
- 🧪 **測試檔案**: `/tests/color-contrast.spec.ts`
