# Orion Labs 元件間距規範

根據 Google Material Design 3 標準和 8px 網格系統制定的元件間距規範。

## 🎯 **總體原則**

### 1. **8px 網格系統**
- 所有間距必須是 4px 的倍數（4, 8, 12, 16, 20, 24, 32, 48, 64...）
- 使用統一的間距變數，避免硬編碼數值
- 優先使用語義化間距名稱

### 2. **觸控友好**
- 最小觸控目標：44px × 44px
- 按鈕間最小間距：8px
- 可互動元素周圍留白：至少 4px

### 3. **視覺層次**
- 相關元素間距較小（4-8px）
- 不同群組間距中等（16-24px）  
- 不同區塊間距較大（32-64px）

## 📝 **元件間距規範**

### **按鈕 (Button)**
```css
.btn {
  padding: var(--btn-padding-y) var(--btn-padding-x); /* 8px 16px */
  margin-bottom: var(--spacing-2); /* 8px */
}

.btn-group {
  gap: var(--btn-gap); /* 12px */
}

.btn-sm {
  padding: var(--spacing-1) var(--spacing-3); /* 4px 12px */
}

.btn-lg {
  padding: var(--spacing-3) var(--spacing-6); /* 12px 24px */
}
```

### **卡片 (Card)**
```css
.card {
  padding: var(--card-padding); /* 24px */
  margin-bottom: var(--card-margin); /* 24px */
  gap: var(--card-gap); /* 16px (內部元素) */
}

.card-header {
  padding: var(--spacing-4) var(--spacing-6); /* 16px 24px */
  margin-bottom: var(--spacing-4); /* 16px */
}

.card-body {
  padding: var(--card-padding); /* 24px */
}

.card-footer {
  padding: var(--spacing-4) var(--spacing-6); /* 16px 24px */
  margin-top: var(--spacing-4); /* 16px */
}
```

### **表單 (Form)**
```css
.form-group {
  margin-bottom: var(--form-field-spacing); /* 20px */
}

.form-label {
  margin-bottom: var(--form-label-spacing); /* 8px */
  display: block;
}

.form-control {
  padding: var(--spacing-3) var(--spacing-4); /* 12px 16px */
  margin-bottom: var(--spacing-1); /* 4px */
}

.form-text {
  margin-top: var(--spacing-1); /* 4px */
}

.form-section {
  margin-bottom: var(--form-section-spacing); /* 32px */
}
```

### **導航 (Navigation)**
```css
.navbar {
  padding: var(--nav-padding) 0; /* 16px 0 */
}

.nav {
  gap: var(--nav-item-gap); /* 16px */
}

.nav-link {
  padding: var(--spacing-2) var(--spacing-4); /* 8px 16px */
}

.breadcrumb {
  padding: var(--spacing-3) 0; /* 12px 0 */
  margin-bottom: var(--spacing-4); /* 16px */
}
```

### **列表 (List)**
```css
.list-group-item {
  padding: var(--spacing-3) var(--spacing-4); /* 12px 16px */
}

.list-group-item + .list-group-item {
  border-top: 1px solid var(--border-color);
}

ul, ol {
  margin-bottom: var(--spacing-4); /* 16px */
  padding-left: var(--spacing-6); /* 24px */
}

li {
  margin-bottom: var(--spacing-1); /* 4px */
}
```

### **模態視窗 (Modal)**
```css
.modal-header {
  padding: var(--spacing-4) var(--spacing-6); /* 16px 24px */
}

.modal-body {
  padding: var(--spacing-6); /* 24px */
}

.modal-footer {
  padding: var(--spacing-4) var(--spacing-6); /* 16px 24px */
  gap: var(--spacing-3); /* 12px */
}
```

### **表格 (Table)**
```css
.table th,
.table td {
  padding: var(--spacing-3) var(--spacing-4); /* 12px 16px */
}

.table-sm th,
.table-sm td {
  padding: var(--spacing-2) var(--spacing-3); /* 8px 12px */
}

.table {
  margin-bottom: var(--spacing-6); /* 24px */
}
```

### **警告/提醒 (Alert)**
```css
.alert {
  padding: var(--spacing-4) var(--spacing-6); /* 16px 24px */
  margin-bottom: var(--spacing-4); /* 16px */
}

.alert-icon {
  margin-right: var(--spacing-3); /* 12px */
}
```

## 📱 **響應式間距**

### **行動裝置 (< 768px)**
```css
@media (max-width: 767px) {
  :root {
    --card-padding: var(--spacing-4); /* 減小為 16px */
    --section-padding: var(--spacing-12); /* 減小為 48px */
    --container-padding: var(--spacing-4); /* 減小為 16px */
  }
}
```

### **平板裝置 (768px - 1199px)**
```css
@media (min-width: 768px) and (max-width: 1199px) {
  :root {
    --card-padding: var(--spacing-5); /* 調整為 20px */
    --section-padding: var(--spacing-16); /* 調整為 64px */
  }
}
```

### **桌面裝置 (≥ 1200px)**
```css
@media (min-width: 1200px) {
  :root {
    --section-padding: var(--spacing-20); /* 增大為 80px */
    --section-padding-lg: var(--spacing-24); /* 增大為 96px */
  }
}
```

## 🛠️ **實用工具類別**

### **快速間距**
```html
<!-- Margin -->
<div class="u-m-0">無邊距</div>
<div class="u-mb-4">底部 16px 邊距</div>
<div class="u-mt-6">頂部 24px 邊距</div>
<div class="u-mx-auto">水平置中</div>

<!-- Padding -->
<div class="u-p-4">全方向 16px 內距</div>
<div class="u-px-6">水平 24px 內距</div>
<div class="u-py-8">垂直 32px 內距</div>

<!-- Gap -->
<div class="u-gap-4">16px 間距</div>
<div class="u-gap-6">24px 間距</div>
```

### **語義化間距**
```html
<!-- 區段間距 -->
<section class="section">標準區段</section>
<section class="section-sm">小區段</section>
<section class="section-lg">大區段</section>

<!-- 卡片間距 -->
<div class="card-spacing">統一卡片間距</div>

<!-- 表單間距 -->
<form class="form-spacing">統一表單間距</form>

<!-- 按鈕群組間距 -->
<div class="btn-group-spacing">統一按鈕間距</div>
```

## ✅ **檢核清單**

### **開發前檢查**
- [ ] 所有間距使用設計系統變數
- [ ] 避免硬編碼 px 值
- [ ] 確保觸控目標大小 ≥ 44px
- [ ] 考慮響應式間距調整

### **設計審查**
- [ ] 視覺層次清晰
- [ ] 相關元素適當群組
- [ ] 留白空間充足但不過度
- [ ] 各裝置尺寸和諧一致

### **可存取性檢查**
- [ ] 鍵盤導航順暢
- [ ] 可互動元素易於點擊
- [ ] 文字與背景對比度足夠
- [ ] 支援縮放至 200% 不破版

## 🚫 **常見錯誤**

### **避免這些做法**
```css
/* ❌ 錯誤：硬編碼間距 */
.my-component {
  padding: 15px;
  margin: 10px 5px;
}

/* ❌ 錯誤：不符合網格系統 */
.my-component {
  padding: var(--spacing-2) 14px;
}

/* ❌ 錯誤：過度使用 !important */
.my-component {
  margin-bottom: 20px !important;
}
```

### **推薦做法**
```css
/* ✅ 正確：使用設計系統變數 */
.my-component {
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-5);
}

/* ✅ 正確：語義化間距 */
.my-component {
  padding: var(--card-padding);
  margin-bottom: var(--card-margin);
}

/* ✅ 正確：響應式間距 */
.my-component {
  padding: clamp(var(--spacing-2), 3vw, var(--spacing-6));
}
```

---

**遵循此規範可確保 UI 一致性、可維護性和優秀的使用者體驗。**
