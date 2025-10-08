# Bootstrap 使用優化報告

**生成時間:** 2025/8/25 下午11:06:52
**掃描檔案:** 77 個
**Bootstrap 類別總計:** 6593 次使用

## 📊 使用的組件類別

### CSS 組件 (26 個)
- **container**
- **buttons**
- **navbar**
- **spinner**
- **toast**
- **spacing**
- **display**
- **flexbox**
- **colors**
- **backgrounds**
- **borders**
- **typography**
- **cards**
- **shadows**
- **grid**
- **forms**
- **modals**
- **alerts**
- **badges**
- **pagination**
- **dropdown**
- **progress**
- **breadcrumb**
- **carousel**
- **tooltip**
- **popover**

### JavaScript 組件 (5 個)
- **toast**
- **modal**
- **tab**
- **button**
- **tooltip**

## 🎯 按需載入建議

### 1. CSS 優化策略

#### 保留的核心組件
```scss
// 基礎系統
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables"; 
@import "bootstrap/scss/mixins";

// 重置和排版
@import "bootstrap/scss/root";
@import "bootstrap/scss/reboot";
@import "bootstrap/scss/type";

// 布局系統 
@import "bootstrap/scss/containers";
@import "bootstrap/scss/grid";

// 使用的組件
@import "bootstrap/scss/container";
@import "bootstrap/scss/buttons";
@import "bootstrap/scss/navbar";
@import "bootstrap/scss/spinner";
@import "bootstrap/scss/toast";
@import "bootstrap/scss/spacing";
@import "bootstrap/scss/display";
@import "bootstrap/scss/flexbox";
@import "bootstrap/scss/colors";
@import "bootstrap/scss/backgrounds";
@import "bootstrap/scss/borders";
@import "bootstrap/scss/typography";
@import "bootstrap/scss/cards";
@import "bootstrap/scss/shadows";
@import "bootstrap/scss/grid";
@import "bootstrap/scss/forms";
@import "bootstrap/scss/modals";
@import "bootstrap/scss/alerts";
@import "bootstrap/scss/badges";
@import "bootstrap/scss/pagination";
@import "bootstrap/scss/dropdown";
@import "bootstrap/scss/progress";
@import "bootstrap/scss/breadcrumb";
@import "bootstrap/scss/carousel";
@import "bootstrap/scss/tooltip";
@import "bootstrap/scss/popover";

// 工具類別（按需）
@import "bootstrap/scss/utilities/api";
```

#### 未使用的組件（可移除）


### 2. JavaScript 優化策略

#### 保留的 JS 組件
```javascript
// 只載入使用的組件
import { Toast } from 'bootstrap';
import { Modal } from 'bootstrap';
import { Tab } from 'bootstrap';
import { Button } from 'bootstrap';
import { Tooltip } from 'bootstrap';
```

#### 未使用的 JS 組件（可移除）
- alert (Alert)
- carousel (Carousel)
- collapse (Collapse)
- dropdown (Dropdown)
- offcanvas (Offcanvas)
- popover (Popover)
- scrollspy (ScrollSpy)

## 💰 預期優化效果

### 當前狀況
- **完整 Bootstrap CSS:** ~220KB (未壓縮)
- **完整 Bootstrap JS:** ~150KB (未壓縮) 
- **總計:** ~370KB

### 優化後預估
- **自定義 Bootstrap CSS:** ~220KB (未壓縮)
- **自定義 Bootstrap JS:** ~63KB (未壓縮)
- **減少:** ~87KB (24%)

## 🔧 實施步驟

1. **建立自定義 Bootstrap SCSS**
   - 創建 `src/assets/scss/bootstrap-custom.scss`
   - 只引入必要的組件

2. **更新 JavaScript 載入**
   - 移除完整的 Bootstrap JS 載入
   - 按需引入個別組件

3. **更新 main.ts**
   - 替換 Bootstrap CSS 引入
   - 調整 JavaScript 引入方式

4. **測試和驗證** 
   - 檢查所有頁面功能正常
   - 確認樣式沒有遺漏

## 📋 使用的 Bootstrap 類別清單

```
alert
alert-bg
alert-border
alert-color
alert-danger
alert-dismissible
alert-info
alert-primary
alert-primary-bg
alert-primary-border
alert-primary-color
alert-secondary
alert-secondary-bg
alert-secondary-border
alert-secondary-color
alert-success
alert-warning
badge
badge-accent
badge-outline
badge-primary
badge-primary-bg
badge-primary-text
badge-secondary
badge-secondary-bg
badge-secondary-text
bg-danger
bg-dark
bg-info
bg-light
bg-primary
bg-secondary
bg-success
bg-warning
border
border-0
border-accent
border-bottom
border-bottom-color
border-box
border-collapse
border-color
border-default
border-error
border-focus
border-hover
border-info
border-left
border-light
border-opacity
border-primary
border-radius
border-right
border-secondary
border-sm
border-strong
border-success
border-top
border-top-color
border-warning
border-width
breadcrumb
breadcrumb-active
breadcrumb-divider
breadcrumb-item
breadcrumb-link
btn
btn-accent
btn-active
btn-bg
btn-border
btn-close
btn-danger
btn-font
btn-group
btn-hover
btn-icon
btn-info
btn-lg
btn-light
btn-outline
btn-outline-border
btn-outline-danger
btn-outline-dark
btn-outline-hover
btn-outline-info
btn-outline-light
btn-outline-primary
btn-outline-secondary
btn-outline-success
btn-outline-text
btn-outline-warning
btn-padding
btn-primary
btn-primary-active
btn-primary-bg
btn-primary-hover
btn-primary-text
btn-secondary
btn-secondary-bg
btn-secondary-hover
btn-secondary-text
btn-sm
btn-success
btn-transition
btn-warning
card
card-bg
card-body
card-border
card-footer
card-header
card-hover
card-img
card-img-top
card-portfolio
card-shadow
card-text
card-title
carousel
col
col-12
col-3
col-4
col-6
col-auto
col-lg
col-md
col-sm
col-xl
container
container-fluid
d-block
d-flex
d-inline
d-inline-block
d-inline-flex
d-none
dropdown
dropdown-border
dropdown-divider
dropdown-item
dropdown-item-active
dropdown-item-hover
dropdown-menu
dropdown-toggle
flex-column
flex-column-tablet
flex-direction
flex-end
flex-grow-1
flex-md-nowrap
flex-md-row
flex-row
flex-shrink
flex-shrink-0
flex-start
flex-wrap
form-check
form-check-checked
form-check-focus
form-check-input
form-check-label
form-control
form-group
form-label
form-text
fw-bold
fw-normal
input-group
input-group-text
m-0
m-2
mb-0
mb-1
mb-2
mb-2xl
mb-3
mb-4
mb-5
mb-auto
mb-lg
mb-lg-responsive
mb-md
mb-md-0
mb-md-responsive
mb-sm
mb-sm-responsive
mb-xl
mb-xs
mb-xs-responsive
me-1
me-2
me-3
modal
modal-backdrop
modal-body
modal-close
modal-content
modal-dialog
modal-footer
modal-footer-border
modal-header
modal-header-border
modal-lg
modal-sm
modal-title
modal-xl
ms-1
ms-2
ms-auto
ms-sm-auto
mt-0
mt-1
mt-2
mt-2xl
mt-3
mt-4
mt-5
mt-auto
mt-lg
mt-md
mt-sm
mt-xl
mt-xs
nav-item
nav-link
nav-link-active
nav-link-color
nav-link-hover
navbar
navbar-brand
navbar-collapse
navbar-dark
navbar-expand
navbar-nav
navbar-toggler
navbar-toggler-icon
p-0
p-2
p-2xl
p-3
p-4
p-lg
p-lg-responsive
p-md
p-md-responsive
p-sm
p-sm-responsive
p-xl
p-xs
page-item
page-link
pagination
pagination-active
pagination-link
pb-2
popover
progress
progress-bar
progress-bar-bg
progress-bg
progress-item
progress-skills
progress-tab
pt-3
pt-4
rounded
rounded-0
rounded-2xl
rounded-full
rounded-lg
rounded-md
rounded-sm
rounded-xl
rounded-xs
row
shadow
shadow-2xl
shadow-dark
shadow-focus
shadow-lg
shadow-light
shadow-md
shadow-medium
shadow-none
shadow-sm
shadow-xl
shadow-xs
spinner-border
spinner-border-sm
spinner-grow
text-center
text-center-mobile
text-danger
text-dark
text-dark-1
text-dark-2
text-info
text-light
text-light-1
text-light-2
text-light-muted
text-light-secondary
text-primary
text-secondary
text-secondary-color
text-success
text-warning
toast
toast-enter
toast-leave
toast-move
tooltip
tooltip-bg
tooltip-color
tooltip-inner
```

---
*此報告由 OrionLabs Bootstrap 優化器自動生成*
