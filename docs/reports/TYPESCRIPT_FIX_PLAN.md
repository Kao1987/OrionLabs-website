# TypeScript 錯誤修復計畫

## 已修復的問題
1. ✅ vitest.config.ts 配置錯誤
2. ✅ CSS 衝突檢測語法錯誤
3. ✅ BlogPost 介面類型統一

## 正在修復的問題
1. 🔄 BlogDetail.vue 的 marked.js 類型問題
2. 🔄 日期格式化安全處理
3. 🔄 SEO 資料類型轉換

## 主要修復策略

### 1. 日期類型統一
- BlogPost.publishedAt/updatedAt: string | undefined
- 建立安全的格式化函數處理 undefined 情況

### 2. Marked.js 類型適配
- 使用新版本 API: ({ tokens, depth }) 而非 (text, level)
- 移除 computed 中的副作用，改用 watch 觸發

### 3. Null 安全檢查
- 在模板中加入 v-if 條件
- 在函數中加入 null 檢查

### 4. API 類型優化
- 移除重複的 any 類型
- 建立具體的錯誤類型

## 預期結果
- 0 個 TypeScript 錯誤
- 建構成功
- 所有測試通過
