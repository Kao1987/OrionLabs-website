# CSS BEM 重構計畫

- **日期:** 2025年8月25日
- **作者:** Gemini
- **狀態:** 已提案

## 1. 簡介與目標

本文件旨在闡述將專案現有 CSS 導入 BEM (Block__Element--Modifier) 命名法的重構計畫。主要目標是提升 CSS 的可維護性、擴展性與可讀性，同時避免樣式衝突。本次重構將在現有的 Bootstrap 5 框架基礎上，針對自定義的元件樣式進行。

## 2. 第一階段：盤點與分析 (已完成)

- **行動:** 掃描 `src/components` 與 `src/views` 目錄下的所有元件。
- **發現:** 元件的樣式由 Bootstrap 功能類別和未結構化的自定義 class 混合組成。
- **產出:** 已建立一份按風險排序的元件重構優先級列表，從最獨立的元件開始著手。

## 3. 第二階段：分階段重構 (計畫中)

此階段將以逐一元件的方式進行。

- **首要目標:** `src/components/ContactForm.vue`
- **重構範例:**
  - **Block:** `contact-form`
  - **Elements:** `contact-form__wrapper`, `contact-form__field`, `contact-form__label`, `contact-form__input`, `contact-form__submit`
  - **Modifiers:** `contact-form__submit--disabled`, `contact-form__input--error`
- **流程:**
  1. 更新 `<template>` 中的 class 名稱。
  2. 更新 `<style>` 區塊中對應的選擇器。
  3. 驗證樣式未被破壞，並移除舊的、不再使用的 class。

## 4. 第三階段：建立 Linting 規則

- **目標:** 自動化 BEM 規範，確保未來所有新開發的程式碼都符合標準。
- **行動:** 提議將 ESLint 的 BEM 外掛（如 `eslint-plugin-vue-bem-class`）整合至 `eslint.config.ts` 設定檔中。

## 5. 第四階段：驗證與測試

- **目標:** 確保重構未引入任何視覺或功能上的問題。
- **行動:**
  - **自動化測試:** 每重構完一個元件，即執行完整的 Playwright 端對端測試。
  - **視覺驗證:** 手動檢查重構後的元件在亮色與暗色模式，以及不同螢幕尺寸下的外觀。

## 6. 下一步

- 將以 `ContactForm.vue` 作為試點，開始進行重構。