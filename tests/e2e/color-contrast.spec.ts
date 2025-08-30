import { test, expect } from "@playwright/test";

// 檢查所有主要頁面文字與背景色的對比度
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

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((x) => x + x)
      .join("");
  const num = parseInt(hex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function luminance([r, g, b]) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(rgb1, rgb2) {
  const lum1 = luminance(rgb1);
  const lum2 = luminance(rgb2);
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}

async function getColorInfo(page, selector) {
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      color: style.color,
      background: style.backgroundColor,
    };
  }, selector);
}

function parseColor(str) {
  if (!str) return null;
  if (str.startsWith("rgb")) {
    const arr = str.match(/\d+/g).map(Number);
    return arr.length === 3 ? arr : null;
  }
  if (str.startsWith("#")) return hexToRgb(str);
  return null;
}

test.describe("全站配色可讀性檢查", () => {
  for (const pageInfo of pages) {
    test(`${pageInfo.name} (${pageInfo.path}) 文字與背景色對比度`, async ({ page }) => {
      await page.goto(pageInfo.path);
      // 檢查所有可見文字元素
      const elements = await page.$$("body *:not(script):not(style)");
      for (const el of elements) {
        const visible = await el.isVisible();
        if (!visible) continue;
        const info = await el.evaluate((node) => {
          const style = window.getComputedStyle(node);
          return {
            color: style.color,
            background: style.backgroundColor,
            text: node.textContent,
          };
        });
        if (!info.text || !info.text.trim()) continue;
        const rgbText = parseColor(info.color);
        const rgbBg = parseColor(info.background);
        if (!rgbText || !rgbBg) continue;
        const ratio = contrast(rgbText, rgbBg);
        // WCAG AA 標準: 一般文字至少 4.5:1
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});
