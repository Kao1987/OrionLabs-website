/**
 * OrionLabs 深色模式綜合驗證測試
 * 專門測試淺色/深色模式切換和視覺效果
 */

import { test, expect, Page } from "@playwright/test";

// 測試頁面配置
const TEST_PAGES = [
  { path: "/", name: "首頁", hasSkillsSection: true },
  { path: "/about", name: "關於頁面", hasSkillsSection: false },
  { path: "/portfolio", name: "作品集", hasSkillsSection: false },
  { path: "/blog", name: "部落格", hasSkillsSection: false },
  { path: "/contact", name: "聯絡頁面", hasSkillsSection: false },
] as const;

// 關鍵 CSS 變數定義
const THEME_VARIABLES = {
  light: {
    "--color-bg-primary": "#ffffff",
    "--color-bg-secondary": "#fafafa",
    "--color-text-primary": "#292524",
    "--color-text-secondary": "#57534e",
  },
  dark: {
    "--color-bg-primary": "#1c1917",
    "--color-bg-secondary": "#292524",
    "--color-text-primary": "#fafafa",
    "--color-text-secondary": "#e7e5e4",
  },
} as const;

// 色彩工具類
class ColorTestUtils {
  /**
   * 解析 RGB 顏色字串
   */
  static parseRgbColor(color: string): [number, number, number] | null {
    if (!color) return null;

    // 處理 rgba 格式
    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbaMatch) {
      return [parseInt(rgbaMatch[1], 10), parseInt(rgbaMatch[2], 10), parseInt(rgbaMatch[3], 10)];
    }

    // 處理 hex 格式
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return [r, g, b];
    }

    return null;
  }

  /**
   * 計算色彩亮度
   */
  static getLuminance([r, g, b]: [number, number, number]): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * 計算對比度
   */
  static calculateContrast(
    color1: [number, number, number],
    color2: [number, number, number],
  ): number {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * 檢查是否為深色
   */
  static isDarkColor([r, g, b]: [number, number, number]): boolean {
    const luminance = this.getLuminance([r, g, b]);
    return luminance < 0.5;
  }
}

// 主題操作工具
class ThemeTestHelper {
  /**
   * 設定主題
   */
  static async setTheme(page: Page, theme: "light" | "dark"): Promise<void> {
    await page.evaluate((themeName: string) => {
      // 設定 data-theme 屬性
      document.documentElement.setAttribute("data-theme", themeName);

      // 設定類別
      document.documentElement.classList.remove("theme-light", "theme-dark");
      document.documentElement.classList.add(`theme-${themeName}`);

      // 更新 localStorage
      localStorage.setItem("theme", themeName);

      // 觸發主題變更事件
      window.dispatchEvent(
        new CustomEvent("themeChanged", {
          detail: { theme: themeName },
        }),
      );
    }, theme);

    // 等待主題變更生效
    await page.waitForTimeout(500);
  }

  /**
   * 取得當前主題
   */
  static async getCurrentTheme(page: Page): Promise<string> {
    return await page.evaluate(() => {
      return document.documentElement.getAttribute("data-theme") || "light";
    });
  }

  /**
   * 點擊主題切換按鈕
   */
  static async clickThemeToggle(page: Page): Promise<boolean> {
    const selectors = [
      ".theme-toggle",
      "button.theme-toggle",
      ".nav-link.theme-toggle",
      '[aria-label*="切換"]',
    ];

    for (const selector of selectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          await button.click();
          await page.waitForTimeout(500);
          return true;
        }
      } catch {
        // 繼續嘗試下一個選擇器
      }
    }
    return false;
  }

  /**
   * 取得 CSS 變數值
   */
  static async getCSSVariable(page: Page, variable: string): Promise<string> {
    return await page.evaluate((varName: string) => {
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    }, variable);
  }
}

test.describe("🌓 OrionLabs 深色模式綜合驗證", () => {
  test.describe("🎛️ 主題切換功能測試", () => {
    for (const pageInfo of TEST_PAGES) {
      test(`${pageInfo.name} - 主題切換按鈕功能`, async ({ page }) => {
        await page.goto(`http://localhost:5173${pageInfo.path}`);
        await page.waitForLoadState("networkidle");

        // 檢查初始主題
        const initialTheme = await ThemeTestHelper.getCurrentTheme(page);
        console.log(`📍 ${pageInfo.name} 初始主題: ${initialTheme}`);

        // 嘗試點擊主題切換按鈕
        const toggleSuccess = await ThemeTestHelper.clickThemeToggle(page);

        if (toggleSuccess) {
          const newTheme = await ThemeTestHelper.getCurrentTheme(page);
          console.log(`🔄 ${pageInfo.name} 切換後主題: ${newTheme}`);

          // 驗證主題確實有切換
          expect(newTheme).not.toBe(initialTheme);

          // 再次切換回來
          await ThemeTestHelper.clickThemeToggle(page);
          const finalTheme = await ThemeTestHelper.getCurrentTheme(page);
          expect(finalTheme).toBe(initialTheme);
        } else {
          console.log(`⚠️ ${pageInfo.name} 未找到主題切換按鈕`);
        }
      });
    }
  });

  test.describe("🎨 CSS 變數主題差異驗證", () => {
    test("關鍵 CSS 變數在不同主題下的值差異", async ({ page }) => {
      await page.goto("http://localhost:5173/");
      await page.waitForLoadState("networkidle");

      // 測試淺色模式
      await ThemeTestHelper.setTheme(page, "light");
      const lightVars: Record<string, string> = {};

      for (const [variable] of Object.entries(THEME_VARIABLES.light)) {
        lightVars[variable] = await ThemeTestHelper.getCSSVariable(page, variable);
      }

      console.log("☀️ 淺色模式 CSS 變數:", lightVars);

      // 測試深色模式
      await ThemeTestHelper.setTheme(page, "dark");
      const darkVars: Record<string, string> = {};

      for (const [variable] of Object.entries(THEME_VARIABLES.dark)) {
        darkVars[variable] = await ThemeTestHelper.getCSSVariable(page, variable);
      }

      console.log("🌙 深色模式 CSS 變數:", darkVars);

      // 驗證主要變數有明顯差異
      const bgPrimaryLight = lightVars["--color-bg-primary"];
      const bgPrimaryDark = darkVars["--color-bg-primary"];

      expect(bgPrimaryLight).not.toBe(bgPrimaryDark);

      // 驗證背景色確實有深淺差異
      const lightBg = ColorTestUtils.parseRgbColor(bgPrimaryLight);
      const darkBg = ColorTestUtils.parseRgbColor(bgPrimaryDark);

      if (lightBg && darkBg) {
        const lightIsDark = ColorTestUtils.isDarkColor(lightBg);
        const darkIsDark = ColorTestUtils.isDarkColor(darkBg);

        expect(lightIsDark).toBe(false); // 淺色模式背景應該是亮色
        expect(darkIsDark).toBe(true); // 深色模式背景應該是暗色
      }
    });
  });

  test.describe("👁️ 文字對比度驗證", () => {
    const CONTRAST_THRESHOLD = 4.5; // WCAG AA 標準

    for (const pageInfo of TEST_PAGES) {
      test(`${pageInfo.name} - 深色模式文字對比度`, async ({ page }) => {
        await page.goto(`http://localhost:5173${pageInfo.path}`);
        await page.waitForLoadState("networkidle");

        // 切換到深色模式
        await ThemeTestHelper.setTheme(page, "dark");

        // 檢查主要文字元素的對比度
        const textSelectors = [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "p",
          ".card-title",
          ".card-text",
          ".nav-link",
          ".btn",
        ];

        interface ContrastResult {
          selector: string;
          contrast: number;
          textColor: string;
          backgroundColor: string;
        }

        const contrastResults: ContrastResult[] = [];

        for (const selector of textSelectors) {
          const elements = await page.locator(selector).all();

          for (let i = 0; i < Math.min(elements.length, 5); i++) {
            const element = elements[i];

            if (await element.isVisible()) {
              const styles = await element.evaluate((el) => {
                const computed = window.getComputedStyle(el);
                return {
                  color: computed.color,
                  backgroundColor: computed.backgroundColor,
                  selector:
                    el.tagName.toLowerCase() +
                    (el.className ? "." + el.className.split(" ")[0] : ""),
                };
              });

              const textColor = ColorTestUtils.parseRgbColor(styles.color);
              const bgColor = ColorTestUtils.parseRgbColor(styles.backgroundColor);

              if (textColor && bgColor) {
                const contrast = ColorTestUtils.calculateContrast(textColor, bgColor);
                contrastResults.push({
                  selector: styles.selector,
                  contrast: contrast,
                  textColor: styles.color,
                  backgroundColor: styles.backgroundColor,
                });
              }
            }
          }
        }

        console.log(`🔍 ${pageInfo.name} 深色模式對比度檢查:`, contrastResults);

        // 檢查是否有低對比度的元素
        const lowContrastElements = contrastResults.filter(
          (result) => result.contrast < CONTRAST_THRESHOLD,
        );

        if (lowContrastElements.length > 0) {
          console.warn(
            `⚠️ ${pageInfo.name} 發現 ${lowContrastElements.length} 個低對比度元素:`,
            lowContrastElements,
          );
        }

        // 至少應該有一些元素通過對比度檢查
        const goodContrastElements = contrastResults.filter(
          (result) => result.contrast >= CONTRAST_THRESHOLD,
        );

        expect(goodContrastElements.length).toBeGreaterThan(0);
      });
    }
  });

  test.describe("🎯 特定頁面深色模式檢查", () => {
    test("首頁 - 技能區塊深色模式檢查", async ({ page }) => {
      await page.goto("http://localhost:5173/");
      await page.waitForLoadState("networkidle");

      // 切換到深色模式
      await ThemeTestHelper.setTheme(page, "dark");

      // 檢查技能區塊背景
      const skillsSection = page.locator(".skills-section");
      if (await skillsSection.isVisible()) {
        const skillsSectionBg = await skillsSection.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        console.log("🎯 技能區塊背景色:", skillsSectionBg);

        // 技能區塊背景不應該是白色
        const bgColor = ColorTestUtils.parseRgbColor(skillsSectionBg);
        if (bgColor) {
          const isWhite = bgColor[0] > 240 && bgColor[1] > 240 && bgColor[2] > 240;
          expect(isWhite).toBe(false);
        }
      }

      // 檢查技能項目背景
      const skillItems = page.locator(".skill-item");
      const skillItemCount = await skillItems.count();

      if (skillItemCount > 0) {
        const firstSkillItem = skillItems.first();
        const skillItemBg = await firstSkillItem.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        console.log("🎯 技能項目背景色:", skillItemBg);

        const itemBgColor = ColorTestUtils.parseRgbColor(skillItemBg);
        if (itemBgColor) {
          const isWhite = itemBgColor[0] > 240 && itemBgColor[1] > 240 && itemBgColor[2] > 240;
          expect(isWhite).toBe(false);
        }
      }
    });

    test("作品集頁面 - 深色模式卡片檢查", async ({ page }) => {
      await page.goto("http://localhost:5173/portfolio");
      await page.waitForLoadState("networkidle");

      // 切換到深色模式
      await ThemeTestHelper.setTheme(page, "dark");

      // 檢查作品集卡片
      const portfolioCards = page.locator(".card-portfolio");
      const cardCount = await portfolioCards.count();

      if (cardCount > 0) {
        const firstCard = portfolioCards.first();
        const cardStyles = await firstCard.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            borderColor: computed.borderColor,
            color: computed.color,
          };
        });

        console.log("🎯 作品集卡片樣式:", cardStyles);

        // 卡片背景不應該是白色
        const cardBg = ColorTestUtils.parseRgbColor(cardStyles.backgroundColor);
        if (cardBg) {
          const isWhite = cardBg[0] > 240 && cardBg[1] > 240 && cardBg[2] > 240;
          expect(isWhite).toBe(false);
        }
      }

      // 檢查頁面整體背景
      const pageBackground = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      console.log("🎯 作品集頁面背景色:", pageBackground);
    });

    test("部落格頁面 - 深色模式卡片檢查", async ({ page }) => {
      await page.goto("http://localhost:5173/blog");
      await page.waitForLoadState("networkidle");

      // 切換到深色模式
      await ThemeTestHelper.setTheme(page, "dark");

      // 檢查部落格卡片
      const blogCards = page.locator(".blog-card");
      const cardCount = await blogCards.count();

      if (cardCount > 0) {
        const firstCard = blogCards.first();
        const cardStyles = await firstCard.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            borderColor: computed.borderColor,
            color: computed.color,
          };
        });

        console.log("🎯 部落格卡片樣式:", cardStyles);

        // 卡片背景不應該是白色
        const cardBg = ColorTestUtils.parseRgbColor(cardStyles.backgroundColor);
        if (cardBg) {
          const isWhite = cardBg[0] > 240 && cardBg[1] > 240 && cardBg[2] > 240;
          expect(isWhite).toBe(false);
        }
      }

      // 檢查篩選區塊
      const filterSection = page.locator(".blog_filter-section");
      if (await filterSection.isVisible()) {
        const filterBg = await filterSection.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        console.log("🎯 部落格篩選區塊背景:", filterBg);
      }
    });
  });

  test.describe("🔄 主題持久性測試", () => {
    test("主題設定在頁面重新載入後保持", async ({ page }) => {
      await page.goto("http://localhost:5173/");
      await page.waitForLoadState("networkidle");

      // 設定為深色模式
      await ThemeTestHelper.setTheme(page, "dark");
      const themeBefore = await ThemeTestHelper.getCurrentTheme(page);
      expect(themeBefore).toBe("dark");

      // 重新載入頁面
      await page.reload();
      await page.waitForLoadState("networkidle");

      // 檢查主題是否保持
      const themeAfter = await ThemeTestHelper.getCurrentTheme(page);
      console.log("🔄 重新載入後的主題:", themeAfter);

      // 主題應該保持為深色模式
      expect(themeAfter).toBe("dark");
    });

    test("主題在不同頁面間導航時保持", async ({ page }) => {
      await page.goto("http://localhost:5173/");
      await page.waitForLoadState("networkidle");

      // 設定為深色模式
      await ThemeTestHelper.setTheme(page, "dark");

      // 導航到其他頁面
      const testPaths = ["/about", "/portfolio", "/blog", "/contact"];

      for (const path of testPaths) {
        await page.goto(`http://localhost:5173${path}`);
        await page.waitForLoadState("networkidle");

        const currentTheme = await ThemeTestHelper.getCurrentTheme(page);
        console.log(`🔄 ${path} 頁面主題:`, currentTheme);

        expect(currentTheme).toBe("dark");
      }
    });
  });
});

test.describe("📊 深色模式視覺回歸測試", () => {
  const SCREENSHOT_OPTIONS = {
    fullPage: true,
    animations: "disabled" as const,
  };

  for (const pageInfo of TEST_PAGES) {
    test(`${pageInfo.name} - 深色模式視覺截圖`, async ({ page }) => {
      await page.goto(`http://localhost:5173${pageInfo.path}`);
      await page.waitForLoadState("networkidle");

      // 淺色模式截圖
      await ThemeTestHelper.setTheme(page, "light");
      await page.screenshot({
        path: `test-results/screenshots/${pageInfo.name}-light-mode.png`,
        ...SCREENSHOT_OPTIONS,
      });

      // 深色模式截圖
      await ThemeTestHelper.setTheme(page, "dark");
      await page.screenshot({
        path: `test-results/screenshots/${pageInfo.name}-dark-mode.png`,
        ...SCREENSHOT_OPTIONS,
      });

      console.log(`📸 ${pageInfo.name} 截圖已儲存`);
    });
  }
});
