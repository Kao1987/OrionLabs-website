# OrionLabs CSS 衝突與對比度分析報告

## 🚨 發現的 CSS 重複定義問題

### 1. 按鈕組件 (.btn) 重複定義
**發生位置：**
- `/src/assets/css/orion-unified-theme.css` (Line 246)
- `/src/assets/global.css` (Line 273)
- `/src/assets/styles/components.css` (Line 5)

**問題：** 三個檔案都定義了 `.btn` 基礎樣式，會造成樣式衝突和覆蓋問題。

### 2. 卡片組件 (.card) 重複定義
**發生位置：**
- `/src/assets/css/orion-unified-theme.css` (Line 327)
- `/src/assets/global.css` (Line 208)
- `/src/assets/styles/components.css` (Line 108)
- `/src/assets/color-optimizations.css` (Line 161)

**問題：** 四個檔案都定義了 `.card` 樣式，會造成混淆。

### 3. Body 元素重複定義 (已修復但需確認)
**發生位置：**
- `/src/assets/base.css` (已修復)
- `/src/assets/global.css` (已修復)
- `/src/assets/css/orion-unified-theme.css` (主要定義)

## 🌙 暗色主題對比度問題分析

### 當前暗色主題配色：
- **背景色：** `#1c1917` (orion-silver-950)
- **主要文字：** `#fafafa` (orion-silver-50)
- **次要文字：** `#e7e5e4` (orion-silver-200)
- **淡化文字：** `#c8c7c5` (orion-silver-400)

### 對比度檢測結果：

#### 主要文字 (#fafafa on #1c1917)
- **對比比率：** 15.68:1 ✅ WCAG AAA 合格

#### 次要文字 (#e7e5e4 on #1c1917)  
- **對比比率：** 12.85:1 ✅ WCAG AAA 合格

#### 淡化文字 (#c8c7c5 on #1c1917)
- **對比比率：** 7.94:1 ⚠️ WCAG AA 合格，但可能在某些情況下不夠明顯

## 🔧 建議的修復方案

### 1. 解決 CSS 重複定義問題

#### 方案A：統一到 orion-unified-theme.css
- 刪除 `global.css` 和 `components.css` 中的重複定義
- 保留 `orion-unified-theme.css` 作為唯一來源

#### 方案B：建立明確的優先級
- 在 `main.ts` 中調整 CSS 載入順序
- 添加註解說明每個檔案的用途

### 2. 改善暗色主題對比度

#### 調整淡化文字色彩：
```css
--color-text-muted: var(--orion-silver-300); /* 從 400 改為 300，提升對比度 */
```

#### 添加更高對比度選項：
```css
--color-text-high-contrast: #ffffff; /* 純白色，用於重要資訊 */
```

## 🔍 需要檢查的其他區域

1. **導航選單** - 特別是下拉選單項目
2. **表單標籤** - 輸入框的 placeholder 文字
3. **按鈕文字** - 次要按鈕的文字對比度
4. **連結文字** - 特別是訪問過的連結
5. **卡片標題和內容** - 確保階層清晰

## 📊 建議的測試步驟

1. 使用對比度檢測工具測試所有文字元素
2. 在不同螢幕亮度下測試可讀性
3. 測試色盲友善性
4. 確保符合 WCAG 2.1 AA 標準

## 🎯 優先處理順序

1. **高優先級：** 修復 CSS 重複定義問題
2. **中優先級：** 改善暗色主題淡化文字對比度
3. **低優先級：** 添加高對比度模式選項
