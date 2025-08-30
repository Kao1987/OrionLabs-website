import { test, expect } from "@playwright/test";

test("首頁載入與標題驗證", async ({ page }) => {
  // 目標：驗證首頁能正常載入，且標題正確
  await page.goto("http://localhost:5173/");
  await expect(page).toHaveTitle(/Orionlabs|Orion/);
  // 你可以根據實際標題調整正則
});
