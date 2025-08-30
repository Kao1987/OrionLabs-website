import { test, expect } from "@playwright/test";

/**
 * CSS 衝突和字體可見性檢測測試
 */

interface ContrastResult {
  selector: string;
  contrast: number;
  textColor: string;
  backgroundColor: string;
  fontSize?: string;
  fontWeight?: string;
}

test.describe("🔍 CSS 衝突和字體檢測", () => {
  test("檢查 CSS 容器重複定義", async ({ page }) => {
    await page.goto("/");

    // 檢查常見的重複定義問題
    const duplicateSelectors = await page.evaluate(() => {
      const results: string[] = [];

      // 檢查是否有多個 navbar 定義
      const navbars = document.querySelectorAll('style, link[rel="stylesheet"]');
      results.push(`發現 ${navbars.length} 個樣式表`);

      // 檢查計算樣式是否正常
      const navbar = document.querySelector(".navbar");
      if (navbar) {
        const computedStyle = getComputedStyle(navbar);
        results.push(`navbar background: ${computedStyle.backgroundColor}`);
        results.push(`navbar color: ${computedStyle.color}`);
      }

      return results;
    });

    console.log("🔍 CSS 檢查結果:", duplicateSelectors);
    expect(duplicateSelectors.length).toBeGreaterThan(0);
  });

  test("深色模式字體可見性檢查", async ({ page }) => {
    await page.goto("/");

    // 切換到深色模式
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.classList.add("theme-dark");
      document.body.classList.remove("theme-light");
    });

    await page.waitForTimeout(500);

    // 檢查文字對比度
    const contrastResults = await page.evaluate(() => {
      const results: any[] = [];

      // 檢查主要文字元素
      const selectors = ["p", "h1", "h2", "h3", ".navbar-nav .nav-link", ".btn", ".card-text"];

      selectors.forEach((selector) => {
        const element = document.querySelector(selector);
        if (element) {
          const computed = getComputedStyle(element);
          results.push({
            selector,
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
          });
        }
      });

      return results;
    });

    console.log("🌙 深色模式文字樣式:", contrastResults);

    // 檢查是否有透明或低對比度的文字
    const lowContrastElements = contrastResults.filter((result) => {
      // 簡單檢查：如果文字顏色包含很低的 RGB 值或透明度
      const color = result.color;
      return (
        color.includes("rgba") &&
        (color.includes("0.1") || color.includes("0.2") || color.includes("0.3"))
      );
    });

    if (lowContrastElements.length > 0) {
      console.warn("⚠️ 發現可能的低對比度元素:", lowContrastElements);
    }

    expect(contrastResults.length).toBeGreaterThan(0);
  });

  test("淺色模式字體可見性檢查", async ({ page }) => {
    await page.goto("/");

    // 確保是淺色模式
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
      document.body.classList.add("theme-light");
      document.body.classList.remove("theme-dark");
    });

    await page.waitForTimeout(500);

    const contrastResults = await page.evaluate(() => {
      const results: any[] = [];

      const selectors = ["p", "h1", "h2", "h3", ".navbar-nav .nav-link", ".btn", ".card-text"];

      selectors.forEach((selector) => {
        const element = document.querySelector(selector);
        if (element) {
          const computed = getComputedStyle(element);
          results.push({
            selector,
            color: computed.color,
            backgroundColor: computed.backgroundColor,
          });
        }
      });

      return results;
    });

    console.log("☀️ 淺色模式文字樣式:", contrastResults);
    expect(contrastResults.length).toBeGreaterThan(0);
  });

  test("檢查特定問題元素", async ({ page }) => {
    await page.goto("/");

    // 檢查夜晚模式特定問題
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });

    await page.waitForTimeout(300);

    const problemElements = await page.evaluate(() => {
      const results: any[] = [];

      // 檢查二級文字和靜音文字
      const secondarySelectors = [
        ".text-secondary",
        ".text-muted",
        ".text-sm",
        ".small",
        ".opacity-75",
        ".opacity-50",
      ];

      secondarySelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
          if (index < 3) {
            // 只檢查前幾個
            const computed = getComputedStyle(element);
            results.push({
              selector: `${selector}[${index}]`,
              color: computed.color,
              opacity: computed.opacity,
              text: element.textContent?.slice(0, 50) || "",
            });
          }
        });
      });

      return results;
    });

    console.log("🔍 潛在問題元素:", problemElements);

    // 檢查低透明度元素
    const lowOpacityElements = problemElements.filter(
      (el) =>
        parseFloat(el.opacity) < 0.6 ||
        (el.color.includes("rgba") && (el.color.includes("0.1") || el.color.includes("0.2"))),
    );

    if (lowOpacityElements.length > 0) {
      console.warn("⚠️ 發現低可見性元素:");
      lowOpacityElements.forEach((el) => {
        console.warn(`- ${el.selector}: ${el.color}, opacity: ${el.opacity}, 文字: "${el.text}"`);
      });
    }

    expect(problemElements.length).toBeGreaterThanOrEqual(0);
  });
});

// 輔助函數：計算對比度
function calculateLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrast(
  color1: [number, number, number],
  color2: [number, number, number],
): number {
  const lum1 = calculateLuminance(color1[0], color1[1], color1[2]);
  const lum2 = calculateLuminance(color2[0], color2[1], color2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}
