/* === contrast-fixes.css 硬編碼替換計畫 === */
/* 以下是將硬編碼顏色替換為 BEM 類別的對照表 */

/*
=== 原始硬編碼 → BEM 類別替換表 ===

1. 文字色彩替換：
   color: #1c1917 !important;        → .text_primary
   color: #fafafa !important;        → .text_light
   color: #002fa7 !important;        → .text_brand
   color: #001d6d !important;        → .text_brand-hover (配合 :hover)
   color: #ffffff !important;        → .text_light
   color: #e7e5e4 !important;        → .footer_text
   color: #d6d3d1 !important;        → .footer_link
   color: #57534e !important;        → .text_secondary
   color: #78716c !important;        → .text_muted

2. 背景色彩替換：
   background-color: #002fa7 !important;  → .bg_brand
   background-color: #001d6d !important;  → .bg_brand-hover (配合 :hover)
   background-color: #ffffff !important;  → .bg_primary
   background-color: #78716c !important;  → .bg_secondary
   background-color: #292524;             → .bg_tertiary (深色模式)

3. 邊框色彩替換：
   border-color: #002fa7 !important;     → border-color: var(--color-border-focus)
   border-color: #ffffff !important;     → border-color: var(--color-text-light)
   border-color: #c8c7c5;                → border-color: var(--color-border-primary)

4. 漸變背景替換：
   linear-gradient(135deg, #1c1917 0%, #44403c 100%)  → .footer_base
   linear-gradient(135deg, #0a0a0a 0%, #1c1917 100%)  → [data-theme="dark"] .footer_base

5. 陰影替換：
   text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);        → text-shadow: 0 2px 4px var(--color-shadow-dark);
   box-shadow: 0 0 0 0.25rem rgba(0, 47, 167, 0.25);  → box-shadow: 0 0 0 0.25rem var(--color-shadow-focus);

6. 透明度顏色替換：
   rgba(0, 47, 167, 0.1)                              → var(--color-primary-light)
   rgba(0, 47, 167, 0.25)                             → var(--color-shadow-focus)

7. 組件特定替換：
   .navbar-brand           → .navbar_brand
   .navbar-nav .nav-link   → .navbar_link
   .btn-primary            → .btn_primary
   .btn-outline-light      → .btn_outline-light
   .hero-title             → .hero_title
   .hero-subtitle          → .hero_subtitle
   .hero-section           → .hero_section
   .footer                 → .footer_base
   .card                   → .card_base
   .card-title             → .card_title
   .card-text              → .card_text
   .badge-primary          → .badge_primary
   .badge-secondary        → .badge_secondary
   .form-control           → .form_control

=== 淘汰清單 ===
需要移除或重構的選擇器：
- 所有包含 !important 的硬編碼顏色規則
- 重複的深色模式修正規則
- 低特異性的全域覆蓋規則

=== 保留的必要硬編碼 ===
僅保留以下例外（需加 /* Orion-style-exempt */ 註解）：
- 第三方元件庫的顏色（如 Swiper、Bootstrap 等）
- 載入畫面的關鍵 CSS
- 錯誤回退機制

*/

/* === 已棄用的 contrast-fixes.css 規則 === */
/* @deprecated 2025-07-26 建議使用 orion-bem-system.css 類別替代 */
/* 此檔案將在下一個 Major 版本移除 */

/* 
將以下內容加入 deprecated_files.yml：
- 檔名: src/assets/css/contrast-fixes.css
- 原因: 硬編碼顏色違反 D-style 規範，無法支援主題切換
- 替代方案: src/assets/css/orion-bem-system.css
- 預計清理版號: v2.0.0
- 覆蓋率影響: 約 15% 色彩相關測試需更新
*/
