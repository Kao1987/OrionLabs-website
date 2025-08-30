import { test, expect } from "@playwright/test";

/**
 * OrionLabs 色彩一致性測試 - 優化版本
 * 專注於核心色彩系統的實用檢查
 */

// 品牌色彩定義 - 基於 ORION_COLOR_GUIDE.md
const ORION_COLORS = {
  // 主要藍色系統
  blue: {
    primary: "#002fa7", // --orion-blue-900
    accent: "#3e52f7", // --orion-blue-600
    light: "#7593ff", // --orion-blue-400
    pale: "#dde8ff", // --orion-blue-100
  },
  // 銀灰色系統
  silver: {
    primary: "#c8c7c5", // --orion-silver-400
    text: "#57534e", // --orion-silver-700
    border: "#d6d3d1", // --orion-silver-300
    bg: "#f5f5f4", // --orion-silver-100
  },
} as const;

// 測試頁面配置
const TEST_PAGES = [
  { path: "/", name: "首頁" },
  { path: "/about", name: "關於我們" },
  { path: "/contact", name: "聯絡我們" },
  { path: "/portfolio", name: "作品集" },
] as const;

/**
 * 色彩工具函數
 */
class ColorUtils {
  static hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  }

  static parseRgbString(rgb: string): [number, number, number] | null {
    // 支援 rgb() 和 rgba() 格式
    const rgbMatch = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }
    return null;
  }

  static colorDistance(
    [r1, g1, b1]: [number, number, number],
    [r2, g2, b2]: [number, number, number],
  ): number {
    return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
  }

  static isOrionColor(
    actualColor: [number, number, number],
    tolerance: number = 20,
  ): {
    isOrion: boolean;
    category?: keyof typeof ORION_COLORS;
    variant?: string;
    distance?: number;
  } {
    let closestDistance = Infinity;
    let closestCategory: keyof typeof ORION_COLORS | undefined;
    let closestVariant: string | undefined;

    // 檢查所有 Orion 色彩
    for (const [category, colors] of Object.entries(ORION_COLORS)) {
      for (const [variant, hex] of Object.entries(colors)) {
        const brandRgb = this.hexToRgb(hex);
        const distance = this.colorDistance(actualColor, brandRgb);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestCategory = category as keyof typeof ORION_COLORS;
          closestVariant = variant;
        }
      }
    }

    return {
      isOrion: closestDistance <= tolerance,
      category: closestCategory,
      variant: closestVariant,
      distance: closestDistance,
    };
  }

  static calculateContrast(
    color1: [number, number, number],
    color2: [number, number, number],
  ): number {
    const getLuminance = ([r, g, b]: [number, number, number]) => {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }
}

test.describe("OrionLabs 色彩一致性測試", () => {
  test.describe("🎨 CSS 變數品牌色彩檢查", () => {
    for (const page of TEST_PAGES) {
      test(`${page.name} - CSS 變數應使用正確的 Orion 色彩`, async ({ page: playwright }) => {
        await playwright.goto(page.path);

        // 檢查關鍵 CSS 變數
        const criticalVariables = [
          { name: "--orion-blue-900", expected: ORION_COLORS.blue.primary },
          { name: "--orion-blue-600", expected: ORION_COLORS.blue.accent },
          { name: "--orion-silver-400", expected: ORION_COLORS.silver.primary },
          { name: "--color-primary", category: "blue" },
          { name: "--color-secondary", category: "silver" },
        ];

        for (const variable of criticalVariables) {
          const value = await playwright.evaluate((varName) => {
            return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
          }, variable.name);

          if (value && value !== "") {
            console.log(`${page.name} - ${variable.name}: ${value}`);

            if ("expected" in variable && variable.expected) {
              // 檢查精確匹配
              const expectedRgb = ColorUtils.hexToRgb(variable.expected);
              const actualRgb = ColorUtils.parseRgbString(value);

              if (actualRgb) {
                const distance = ColorUtils.colorDistance(expectedRgb, actualRgb);
                expect(
                  distance,
                  `${variable.name} 應為 ${variable.expected} (實際: ${value}, 距離: ${distance.toFixed(2)})`,
                ).toBeLessThan(10);
              }
            } else if ("category" in variable) {
              // 檢查是否為品牌色彩類別
              const actualRgb = ColorUtils.parseRgbString(value);
              if (actualRgb) {
                const orionCheck = ColorUtils.isOrionColor(actualRgb, 15);
                expect(
                  orionCheck.isOrion,
                  `${variable.name} 應使用 Orion 品牌色彩 (實際: ${value})`,
                ).toBe(true);

                if (variable.category && orionCheck.category) {
                  expect(
                    orionCheck.category,
                    `${variable.name} 應使用 ${variable.category} 系列色彩`,
                  ).toBe(variable.category);
                }
              }
            }
          }
        }
      });
    }
  });

  test.describe("🎯 主要元素品牌色彩檢查", () => {
    for (const page of TEST_PAGES) {
      test(`${page.name} - 主要元素應使用 Orion 品牌色彩`, async ({ page: playwright }) => {
        await playwright.goto(page.path);

        // 檢查主要按鈕
        const primaryButtons = await playwright
          .locator('.btn-primary, .button-primary, [class*="primary"]')
          .all();

        for (let i = 0; i < Math.min(primaryButtons.length, 3); i++) {
          const button = primaryButtons[i];

          const bgColor = await button.evaluate(
            (el) => window.getComputedStyle(el).backgroundColor,
          );

          const textColor = await button.evaluate((el) => window.getComputedStyle(el).color);

          // 檢查背景色
          if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
            const bgRgb = ColorUtils.parseRgbString(bgColor);
            if (bgRgb) {
              const orionCheck = ColorUtils.isOrionColor(bgRgb, 25);
              console.log(`${page.name} 主要按鈕背景色: ${bgColor}`, orionCheck);

              expect(
                orionCheck.isOrion,
                `${page.name} 主要按鈕背景應使用 Orion 品牌色彩 (實際: ${bgColor})`,
              ).toBe(true);
            }
          }
        }

        // 檢查導航連結
        const navLinks = await playwright.locator("nav a, .nav a, .navbar a").all();

        for (let i = 0; i < Math.min(navLinks.length, 3); i++) {
          const link = navLinks[i];

          const linkColor = await link.evaluate((el) => window.getComputedStyle(el).color);

          const linkRgb = ColorUtils.parseRgbString(linkColor);
          if (linkRgb) {
            const orionCheck = ColorUtils.isOrionColor(linkRgb, 30);
            console.log(`${page.name} 導航連結色彩: ${linkColor}`, orionCheck);

            // 導航連結應該使用品牌色彩或標準文字色彩
            const isStandardText = orionCheck.distance! > 50; // 允許標準文字色彩
            expect(
              orionCheck.isOrion || isStandardText,
              `${page.name} 導航連結應使用品牌色彩或標準文字色彩 (實際: ${linkColor})`,
            ).toBe(true);
          }
        }
      });
    }
  });

  test.describe("🌓 主題一致性檢查", () => {
    for (const page of TEST_PAGES) {
      test(`${page.name} - 主題切換色彩一致性`, async ({ page: playwright }) => {
        await playwright.goto(page.path);

        // 安全的主題切換函數
        const switchToTheme = async (theme: "light" | "dark") => {
          await playwright.evaluate((t) => {
            // 多種主題切換方式
            document.documentElement.setAttribute("data-theme", t);
            document.documentElement.setAttribute("data-bs-theme", t);
            document.documentElement.className =
              document.documentElement.className.replace(/theme-(light|dark)/g, "") + ` theme-${t}`;
            document.body.className =
              document.body.className.replace(/theme-(light|dark)/g, "") + ` theme-${t}`;
          }, theme);

          // 等待主題變更生效
          await playwright.waitForTimeout(300);
        };

        // 收集兩個主題下的色彩資料
        const themeColors: Record<string, { light: string; dark: string }> = {};

        for (const theme of ["light", "dark"] as const) {
          await switchToTheme(theme);

          // 檢查關鍵變數
          const variables = ["--color-bg-primary", "--color-text-primary", "--color-primary"];

          for (const variable of variables) {
            const value = await playwright.evaluate((varName) => {
              return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
            }, variable);

            if (!themeColors[variable]) {
              themeColors[variable] = { light: "", dark: "" };
            }
            themeColors[variable][theme] = value;
          }
        }

        // 驗證主題差異
        for (const [variable, colors] of Object.entries(themeColors)) {
          if (colors.light && colors.dark) {
            const lightRgb = ColorUtils.parseRgbString(colors.light);
            const darkRgb = ColorUtils.parseRgbString(colors.dark);

            if (lightRgb && darkRgb) {
              const distance = ColorUtils.colorDistance(lightRgb, darkRgb);
              console.log(`${page.name} ${variable} 主題差異:`, {
                light: colors.light,
                dark: colors.dark,
                distance: distance.toFixed(2),
              });

              // 主題間應該有明顯差異（除非是裝飾性元素）
              if (variable.includes("bg") || variable.includes("text")) {
                expect(
                  distance,
                  `${page.name} ${variable} 在淺色與深色主題間應有足夠差異`,
                ).toBeGreaterThan(20);
              }
            }
          }
        }
      });
    }
  });

  test.describe("♿ 無障礙對比度檢查", () => {
    for (const page of TEST_PAGES) {
      test(`${page.name} - 色彩對比度符合 WCAG 標準`, async ({ page: playwright }) => {
        await playwright.goto(page.path);

        // 檢查主要文字區域
        const textElements = await playwright.locator("p, h1, h2, h3, .text, .content").first();

        if ((await textElements.count()) > 0) {
          const textColor = await textElements.evaluate((el) => window.getComputedStyle(el).color);

          const bgColor = await textElements.evaluate(
            (el) => window.getComputedStyle(el).backgroundColor,
          );

          const textRgb = ColorUtils.parseRgbString(textColor);
          const bgRgb = ColorUtils.parseRgbString(bgColor);

          if (textRgb && bgRgb) {
            const contrast = ColorUtils.calculateContrast(textRgb, bgRgb);
            console.log(`${page.name} 文字對比度: ${contrast.toFixed(2)}:1`);

            // WCAG AA 標準: 正文文字對比度 ≥ 4.5:1
            expect(
              contrast,
              `${page.name} 文字對比度應符合 WCAG AA 標準 (≥4.5:1)`,
            ).toBeGreaterThanOrEqual(4.5);
          }
        }
      });
    }
  });

  test.describe("🎨 色彩系統整體檢查", () => {
    test("Orion 色彩系統完整性檢查", async ({ page }) => {
      await page.goto("/");

      // 檢查色彩系統的定義完整性
      const colorSystemReport = {
        blueVariants: 0,
        silverVariants: 0,
        customVariables: 0,
        totalVariables: 0,
      };

      const allCssVariables = await page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);
        const variables: string[] = [];

        // 取得所有 CSS 自訂屬性
        for (let i = 0; i < document.styleSheets.length; i++) {
          try {
            const sheet = document.styleSheets[i];
            if (sheet.cssRules) {
              for (let j = 0; j < sheet.cssRules.length; j++) {
                const rule = sheet.cssRules[j];
                if (rule instanceof CSSStyleRule && rule.selectorText === ":root") {
                  for (let k = 0; k < rule.style.length; k++) {
                    const prop = rule.style[k];
                    if (prop.startsWith("--")) {
                      variables.push(prop);
                    }
                  }
                }
              }
            }
          } catch (e) {
            // 跨域限制，忽略
          }
        }

        return variables;
      });

      // 分析色彩變數
      for (const variable of allCssVariables) {
        colorSystemReport.totalVariables++;

        if (variable.includes("blue") || variable.includes("orion-blue")) {
          colorSystemReport.blueVariants++;
        } else if (variable.includes("silver") || variable.includes("orion-silver")) {
          colorSystemReport.silverVariants++;
        } else if (variable.includes("color-")) {
          colorSystemReport.customVariables++;
        }
      }

      console.log("Orion 色彩系統報告:", colorSystemReport);

      // 驗證色彩系統完整性
      expect(colorSystemReport.blueVariants, "Orion 藍色系統應該有足夠的變體").toBeGreaterThan(3);

      expect(colorSystemReport.silverVariants, "Orion 銀灰色系統應該有足夠的變體").toBeGreaterThan(
        3,
      );

      expect(colorSystemReport.totalVariables, "色彩系統應該定義充分的變數").toBeGreaterThan(10);
    });
  });
});
