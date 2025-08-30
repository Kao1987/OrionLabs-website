import { test, expect } from "@playwright/test";

test("首頁主要按鈕可點擊", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  // 假設首頁有一個「聯絡我們」按鈕
  const contactBtn = page.getByRole("link", { name: /聯絡我們|Contact/i });
  await expect(contactBtn).toBeVisible();
  await contactBtn.click();
  await expect(page).toHaveURL(/contact/);
});

// 可依需求擴充更多互動測試
