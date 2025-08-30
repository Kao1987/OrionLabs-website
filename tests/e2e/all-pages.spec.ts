import { test, expect } from "@playwright/test";

const pages = [
  { path: "/", name: "首頁" },
  { path: "/about", name: "關於我們" },
  { path: "/contact", name: "聯絡我們" },
  { path: "/blog", name: "部落格" },
  { path: "/portfolio", name: "作品集" },
  { path: "/login", name: "登入" },
  { path: "/privacy-policy", name: "隱私權政策" },
  { path: "/terms-of-service", name: "服務條款" },
];

test.describe("全站主要頁面載入測試", () => {
  for (const pageInfo of pages) {
    test(`${pageInfo.name} (${pageInfo.path}) 能正常載入`, async ({ page }) => {
      await page.goto(`http://localhost:5173${pageInfo.path}`);
      await expect(page).toHaveURL(new RegExp(pageInfo.path.replace("/", "\\/?") + "$"));
      // 可加強：驗證主要元素存在
    });
  }
});
