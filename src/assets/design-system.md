# OrionLabs 設計系統

這是 OrionLabs 個人品牌網站的設計系統文檔，定義了色彩、間距、字體、動畫等設計規範。

## 🎨 色彩系統

### 主色調 - Orion Blue (#002fa7)
基於品牌主色 #002fa7 建立的藍色色階：

```css
--orion-primary: #002fa7;
--orion-primary-50: #e6f0ff;   /* 最淺 */
--orion-primary-100: #b3d9ff;
--orion-primary-200: #80c2ff;
--orion-primary-300: #4dabff;
--orion-primary-400: #1a94ff;
--orion-primary-500: #002fa7;  /* 主色 */
--orion-primary-600: #002994;
--orion-primary-700: #002380;
--orion-primary-800: #001d6d;
--orion-primary-900: #001754;  /* 最深 */
```

### 中性色調 - Neutral Grey (#c8c7c5)
基於品牌中性色 #c8c7c5 建立的灰色色階：

```css
--orion-neutral: #c8c7c5;
--orion-neutral-50: #fafafa;   /* 最淺 */
--orion-neutral-100: #f5f5f4;
--orion-neutral-200: #e7e5e4;
--orion-neutral-300: #d6d3d1;
--orion-neutral-400: #c8c7c5; /* 主色 */
--orion-neutral-500: #a8a29e;
--orion-neutral-600: #78716c;
--orion-neutral-700: #57534e;
--orion-neutral-800: #3f3f46;
--orion-neutral-900: #1c1917;  /* 最深 */
```

### 語意色彩
```css
--orion-success: #10b981;  /* 成功/綠色 */
--orion-warning: #f59e0b;  /* 警告/橙色 */
--orion-error: #ef4444;    /* 錯誤/紅色 */
--orion-info: #06b6d4;     /* 資訊/青色 */
```

## 📏 間距系統

基於 8px 網格系統：

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
```

## 🔤 字體系統

### 字體家族
```css
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans TC', sans-serif;
--font-family-mono: 'Fira Code', 'Cascadia Code', 'SF Mono', Consolas, monospace;
```

### 字體大小
```css
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
```

## 📐 圓角系統

```css
--radius-xs: 0.125rem;   /* 2px */
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-full: 9999px;   /* 完全圓形 */
```

## 🌫️ 陰影系統

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 47, 167, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 47, 167, 0.1), 0 2px 4px -1px rgba(0, 47, 167, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 47, 167, 0.1), 0 4px 6px -2px rgba(0, 47, 167, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 47, 167, 0.1), 0 10px 10px -5px rgba(0, 47, 167, 0.04);
```

## 🎭 動畫系統

### 轉場時間
```css
--transition-fast: 150ms ease-in-out;
--transition-base: 250ms ease-in-out;
--transition-slow: 350ms ease-in-out;
```

### 動畫類別

#### 淡入動畫
```html
<div class="fade-in">內容會從下方淡入</div>
<div class="fade-in delay-200">延遲 0.2s 的淡入</div>
```

#### 滑入動畫
```html
<div class="slide-in-left">從左滑入</div>
<div class="slide-in-right">從右滑入</div>
```

#### 其他動畫
```html
<div class="zoom-in">放大淡入</div>
<div class="bounce-in">彈跳進入</div>
<div class="pulse">脈衝動畫</div>
```

#### 延遲類別
```html
<div class="fade-in delay-100">延遲 0.1s</div>
<div class="fade-in delay-200">延遲 0.2s</div>
<div class="fade-in delay-300">延遲 0.3s</div>
<div class="fade-in delay-400">延遲 0.4s</div>
<div class="fade-in delay-500">延遲 0.5s</div>
```

## 🎯 按鈕系統

### 按鈕尺寸
```html
<button class="btn btn-primary btn-sm">小按鈕</button>
<button class="btn btn-primary">標準按鈕</button>
<button class="btn btn-primary btn-lg">大按鈕</button>
```

### 按鈕樣式
```html
<!-- 主要按鈕 -->
<button class="btn btn-primary">主要動作</button>

<!-- 次要按鈕 -->
<button class="btn btn-secondary">次要動作</button>

<!-- 輪廓按鈕 -->
<button class="btn btn-outline-primary">輪廓主要</button>
<button class="btn btn-outline-secondary">輪廓次要</button>

<!-- 文字按鈕 -->
<button class="btn btn-text">純文字</button>
```

## 🃏 卡片系統

### 基礎卡片
```html
<div class="card">
  <div class="card-body">
    <h5 class="card-title">卡片標題</h5>
    <p class="card-text">卡片內容</p>
  </div>
</div>
```

### 提升卡片
```html
<div class="card card-elevated">
  <!-- 具有更明顯陰影效果 -->
</div>
```

### 作品集卡片
```html
<div class="card card-portfolio">
  <!-- 具有光澤動畫效果 -->
</div>
```

## 🏷️ Badge 系統

```html
<span class="badge badge-primary">主要標籤</span>
<span class="badge badge-secondary">次要標籤</span>
<span class="badge badge-outline">輪廓標籤</span>
```

## 📱 響應式斷點

遵循 Bootstrap 5 斷點系統：

- **xs**: < 576px (手機直向)
- **sm**: ≥ 576px (手機橫向)
- **md**: ≥ 768px (平板)
- **lg**: ≥ 992px (桌面)
- **xl**: ≥ 1200px (大桌面)
- **xxl**: ≥ 1400px (超大桌面)

## 🛠️ 工具類別

### 文字顏色
```html
<p class="text-primary">主要文字色</p>
<p class="text-secondary">次要文字色</p>
<p class="text-muted">靜音文字色</p>
<p class="text-brand">品牌色文字</p>
<p class="text-gradient">漸層文字</p>
```

### 背景顏色
```html
<div class="bg-primary">主要背景</div>
<div class="bg-secondary">次要背景</div>
<div class="bg-accent">強調背景</div>
```

### 陰影
```html
<div class="shadow-sm">小陰影</div>
<div class="shadow-md">中等陰影</div>
<div class="shadow-lg">大陰影</div>
<div class="shadow-xl">超大陰影</div>
```

### 圓角
```html
<div class="rounded-sm">小圓角</div>
<div class="rounded-lg">大圓角</div>
<div class="rounded-full">完全圓形</div>
```

### 特殊效果
```html
<div class="glass-effect">玻璃效果</div>
```

## 🌙 暗色模式

系統自動根據用戶的系統偏好設定切換暗色模式，使用 `prefers-color-scheme: dark` 媒體查詢。

## 💡 使用建議

1. **一致性**: 始終使用設計系統中定義的變數，避免硬編碼數值
2. **層次**: 使用適當的字體大小和間距建立視覺層次
3. **對比**: 確保文字與背景有足夠的對比度
4. **動畫**: 適度使用動畫提升用戶體驗，避免過度使用
5. **響應式**: 考慮不同裝置的顯示效果

## 🔗 相關文件

- [Bootstrap 5 文檔](https://getbootstrap.com/docs/5.3/)
- [CSS 自定義屬性](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [無障礙設計指南](https://www.w3.org/WAI/WCAG21/quickref/)