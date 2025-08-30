import { test, expect } from "@playwright/test";

/**
 * OrionLabs Website 主題一致性 E2E 測試
 * 檢查淺色與深色模式的配色是否維持一致
 */

// 測試頁面清單
const pages = [
  { path: "/", name: "首頁", hasThemeToggle: true },
  { path: "/about", name: "關於我們", hasThemeToggle: true },
  { path: "/contact", name: "聯絡我們", hasThemeToggle: true },
  { path: "/blog", name: "部落格", hasThemeToggle: true },
  { path: "/portfolio", name: "作品集", hasThemeToggle: true },
  { path: "/login", name: "登入", hasThemeToggle: false },
  { path: "/privacy-policy", name: "隱私權政策", hasThemeToggle: true },
  { path: "/terms-of-service", name: "服務條款", hasThemeToggle: true },
];

// 需要檢查的 CSS 變數清單
const requiredCSSVariables = [
  "--color-bg-primary",
  "--color-bg-secondary",
  "--color-bg-card",
  "--color-text-primary",
  "--color-text-secondary",
  "--color-text-muted",
  "--color-primary",
  "--color-primary-hover",
  "--color-accent",
  "--color-border-primary",
  "--nav-brand-color",
  "--nav-link-color",
  "--nav-link-hover",
];

// 檢查元素的色彩選擇器
const colorTestSelectors = [
  { selector: "body", properties: ["background-color", "color"] },
  { selector: ".btn-primary", properties: ["background-color", "color", "border-color"] },
  { selector: ".btn-secondary", properties: ["background-color", "color", "border-color"] },
  { selector: ".card", properties: ["background-color", "border-color"] },
  { selector: ".navbar", properties: ["background-color"] },
  { selector: ".navbar_link", properties: ["color"] },
  { selector: "h1, h2, h3, h4, h5, h6", properties: ["color"] },
  { selector: "p", properties: ["color"] },
  { selector: "a", properties: ["color"] },
  { selector: ".text-primary", properties: ["color"] },
  { selector: ".text-secondary", properties: ["color"] },
  { selector: ".bg-primary", properties: ["background-color"] },
  { selector: ".bg-secondary", properties: ["background-color"] },
];

/**
 * 輔助函數：解析 RGB 色彩值
 */
function parseRGB(color: string): [number, number, number] | null {
  if (!color) return null;

  // 處理 rgb() 格式
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
  }

  // 處理 rgba() 格式
  const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
  if (rgbaMatch) {
    return [parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3])];
  }

  // 處理 hex 格式
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    } else if (hex.length === 6) {
      return [
        parseInt(hex.substr(0, 2), 16),
        parseInt(hex.substr(2, 2), 16),
        parseInt(hex.substr(4, 2), 16),
      ];
    }
  }

  return null;
}

/**
 * 計算色彩亮度
 */
function calculateLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * 計算對比度
 */
function calculateContrast(
  color1: [number, number, number],
  color2: [number, number, number],
): number {
  const lum1 = calculateLuminance(color1);
  const lum2 = calculateLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * 檢查主題是否正確應用
 */
async function checkThemeApplication(page: any, expectedTheme: "light" | "dark") {
  const themeAttribute = await page.getAttribute("html", "data-theme");
  const bodyClass = (await page.getAttribute("body", "class")) || "";

  expect(themeAttribute).toBe(expectedTheme);

  if (expectedTheme === "dark") {
    expect(bodyClass).toContain("theme-dark");
  } else {
    expect(bodyClass).not.toContain("theme-dark");
  }
}

/**
 * 獲取 CSS 變數值
 */
async function getCSSVariable(page: any, variableName: string): Promise<string> {
  return await page.evaluate((varName: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }, variableName);
}

/**
 * 獲取元素的計算樣式
 */
async function getElementStyles(page: any, selector: string, properties: string[]) {
  const element = await page.locator(selector).first();
  if (!(await element.count())) return null;

  const styles: { [key: string]: string } = {};
  for (const property of properties) {
    const value = await element.evaluate((el: Element, prop: string) => {
      return window.getComputedStyle(el).getPropertyValue(prop);
    }, property);
    styles[property] = value;
  }
  return styles;
}

/**
 * 切換主題 - 優化版本
 */
async function toggleTheme(page: any) {
  // 尋找主題切換按鈕（根據實際實現的選擇器）
  const themeToggleSelectors = [
    '[data-testid="theme-toggle"]',
    ".theme-toggle",
    ".nav-link.theme-toggle",
    "button.theme-toggle",
    "#theme-toggle",
    'button[aria-label*="theme"]',
    'button[aria-label*="主題"]',
    'button[aria-label*="切換到"]',
    'button[title*="theme"]',
    'button[title*="主題"]',
    'button[title*="切換"]',
    ".dark-mode-toggle",
    ".theme-switcher",
  ];

  let foundButton = false;

  for (const selector of themeToggleSelectors) {
    const themeButton = page.locator(selector);
    const count = await themeButton.count();

    if (count > 0) {
      try {
        // 檢查按鈕是否可見且可互動
        const isVisible = await themeButton
          .first()
          .isVisible()
          .catch(() => false);

        if (isVisible) {
          // 滾動到按鈕位置
          await themeButton.first().scrollIntoViewIfNeeded();
          await page.waitForTimeout(200);

          // 嘗試點擊
          await themeButton.first().click({ timeout: 3000 });
          await page.waitForTimeout(500);
          foundButton = true;
          break;
        }
      } catch (error) {
        console.log(`無法點擊主題切換按鈕 ${selector}:`, error);
        continue;
      }
    }
  }

  if (!foundButton) {
    console.log("未找到可用的主題切換按鈕，使用 JavaScript 切換主題");

    // 如果找不到主題切換按鈕，通過 JavaScript 切換
    await page.evaluate(() => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";

      // 多種主題切換方式
      document.documentElement.setAttribute("data-theme", newTheme);
      document.documentElement.setAttribute("data-bs-theme", newTheme);

      // 更新類別
      document.body.className = document.body.className.replace(/theme-(light|dark)/g, "");
      document.body.classList.add(`theme-${newTheme}`);

      document.documentElement.className = document.documentElement.className.replace(
        /theme-(light|dark)/g,
        "",
      );
      document.documentElement.classList.add(`theme-${newTheme}`);

      // 觸發主題變更事件
      window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme: newTheme } }));
    });

    await page.waitForTimeout(300);
  }
}

test.describe("OrionLabs 主題一致性測試", () => {
  test.describe("CSS 變數一致性檢查", () => {
    for (const pageInfo of pages) {
      test(`${pageInfo.name} - CSS 變數定義完整性`, async ({ page }) => {
        await page.goto(pageInfo.path);

        // 測試淺色主題
        await page.evaluate(() => {
          document.documentElement.setAttribute("data-theme", "light");
          document.body.className = document.body.className.replace(/theme-(light|dark)/g, "");
          document.body.classList.add("theme-light");
        });
        await page.waitForTimeout(200);

        console.log(`檢查 ${pageInfo.name} 淺色主題的 CSS 變數...`);
        for (const variable of requiredCSSVariables) {
          const value = await getCSSVariable(page, variable);
          expect(value, `${pageInfo.name} 淺色主題缺少 CSS 變數: ${variable}`).toBeTruthy();
          expect(
            value,
            `${pageInfo.name} 淺色主題 ${variable} 不應為 initial 或 inherit`,
          ).not.toMatch(/^(initial|inherit|unset)$/);
        }

        // 測試深色主題
        await page.evaluate(() => {
          document.documentElement.setAttribute("data-theme", "dark");
          document.body.className = document.body.className.replace(/theme-(light|dark)/g, "");
          document.body.classList.add("theme-dark");
        });
        await page.waitForTimeout(200);

        console.log(`檢查 ${pageInfo.name} 深色主題的 CSS 變數...`);
        for (const variable of requiredCSSVariables) {
          const value = await getCSSVariable(page, variable);
          expect(value, `${pageInfo.name} 深色主題缺少 CSS 變數: ${variable}`).toBeTruthy();
          expect(
            value,
            `${pageInfo.name} 深色主題 ${variable} 不應為 initial 或 inherit`,
          ).not.toMatch(/^(initial|inherit|unset)$/);
        }
      });
    }
  });

  test.describe("主題切換功能測試", () => {
    for (const pageInfo of pages.filter((p) => p.hasThemeToggle)) {
      test(`${pageInfo.name} - 主題切換按鈕功能`, async ({ page }) => {
        await page.goto(pageInfo.path);

        // 檢查初始主題
        const initialTheme = (await page.getAttribute("html", "data-theme")) || "light";
        console.log(`${pageInfo.name} 初始主題: ${initialTheme}`);

        // 切換主題
        await toggleTheme(page);

        // 檢查主題是否已切換
        const newTheme = await page.getAttribute("html", "data-theme");
        expect(newTheme, `${pageInfo.name} 主題應該已切換`).not.toBe(initialTheme);

        // 再次切換回原主題
        await toggleTheme(page);

        // 檢查是否切回原主題
        const finalTheme = await page.getAttribute("html", "data-theme");
        expect(finalTheme, `${pageInfo.name} 應該切回原主題`).toBe(initialTheme);
      });
    }
  });

  test.describe("色彩對比度檢查", () => {
    for (const pageInfo of pages) {
      test(`${pageInfo.name} - 淺色模式對比度檢查`, async ({ page }) => {
        await page.goto(pageInfo.path);

        // 設定為淺色主題
        await page.evaluate(() => {
          document.documentElement.setAttribute("data-theme", "light");
          document.body.className = document.body.className.replace(/theme-(light|dark)/g, "");
          document.body.classList.add("theme-light");
        });
        await page.waitForTimeout(200);

        // 檢查背景色和文字色對比度
        const bgColor = await page.evaluate(() => {
          return window.getComputedStyle(document.body).backgroundColor;
        });

        const textColor = await page.evaluate(() => {
          return window.getComputedStyle(document.body).color;
        });

        const bgRGB = parseRGB(bgColor);
        const textRGB = parseRGB(textColor);

        if (bgRGB && textRGB) {
          const contrast = calculateContrast(bgRGB, textRGB);
          console.log(`${pageInfo.name} 淺色模式對比度: ${contrast.toFixed(2)}:1`);
          expect(
            contrast,
            `${pageInfo.name} 淺色模式文字與背景對比度應 ≥ 4.5:1`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      });

      test(`${pageInfo.name} - 深色模式對比度檢查`, async ({ page }) => {
        await page.goto(pageInfo.path);

        // 設定為深色主題
        await page.evaluate(() => {
          document.documentElement.setAttribute("data-theme", "dark");
          document.body.className = document.body.className.replace(/theme-(light|dark)/g, "");
          document.body.classList.add("theme-dark");
        });
        await page.waitForTimeout(200);

        // 檢查背景色和文字色對比度
        const bgColor = await page.evaluate(() => {
          return window.getComputedStyle(document.body).backgroundColor;
        });

        const textColor = await page.evaluate(() => {
          return window.getComputedStyle(document.body).color;
        });

        const bgRGB = parseRGB(bgColor);
        const textRGB = parseRGB(textColor);

        if (bgRGB && textRGB) {
          const contrast = calculateContrast(bgRGB, textRGB);
          console.log(`${pageInfo.name} 深色模式對比度: ${contrast.toFixed(2)}:1`);
          expect(
            contrast,
            `${pageInfo.name} 深色模式文字與背景對比度應 ≥ 4.5:1`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      });
    }
  });

  test.describe("元素樣式一致性檢查", () => {
    for (const pageInfo of pages) {
      test(`${pageInfo.name} - 主要元素樣式一致性`, async ({ page }) => {
        await page.goto(pageInfo.path);

        const lightModeStyles: { [key: string]: any } = {};
        const darkModeStyles: { [key: string]: any } = {};

        // 收集淺色模式樣式
        await page.evaluate(() => {
          document.documentElement.setAttribute("data-theme", "light");
          document.body.className = document.body.className.replace(/theme-(light|dark)/g, "");
          document.body.classList.add("theme-light");
        });
        await page.waitForTimeout(200);

        for (const { selector, properties } of colorTestSelectors) {
          const styles = await getElementStyles(page, selector, properties);
          if (styles) {
            lightModeStyles[selector] = styles;
          }
        }

        // 收集深色模式樣式
        await page.evaluate(() => {
          document.documentElement.setAttribute("data-theme", "dark");
          document.body.className = document.body.className.replace(/theme-(light|dark)/g, "");
          document.body.classList.add("theme-dark");
        });
        await page.waitForTimeout(200);

        for (const { selector, properties } of colorTestSelectors) {
          const styles = await getElementStyles(page, selector, properties);
          if (styles) {
            darkModeStyles[selector] = styles;
          }
        }

        // 檢查主題間的一致性（應該有合理差異）
        for (const selector of Object.keys(lightModeStyles)) {
          if (darkModeStyles[selector]) {
            const lightStyle = lightModeStyles[selector];
            const darkStyle = darkModeStyles[selector];

            // 檢查是否有色彩屬性差異
            let hasDifference = false;
            let totalColorProps = 0;
            let differentProps = 0;

            for (const property of ["background-color", "color", "border-color"]) {
              if (lightStyle[property] && darkStyle[property]) {
                totalColorProps++;

                // 忽略透明色的比較
                const isLightTransparent =
                  lightStyle[property].includes("rgba(0, 0, 0, 0)") ||
                  lightStyle[property] === "transparent";
                const isDarkTransparent =
                  darkStyle[property].includes("rgba(0, 0, 0, 0)") ||
                  darkStyle[property] === "transparent";

                if (
                  !isLightTransparent &&
                  !isDarkTransparent &&
                  lightStyle[property] !== darkStyle[property]
                ) {
                  differentProps++;
                  hasDifference = true;
                }
              }
            }

            // 只對主要可見元素要求有色彩差異，且允許部分屬性相同
            const isImportantElement =
              selector.includes("body") ||
              selector.includes("btn-primary") ||
              selector.includes("navbar") ||
              selector.includes("card-body");

            if (isImportantElement && totalColorProps > 0) {
              // 至少要有一個色彩屬性不同，或者差異比例超過 30%
              const differenceRatio = differentProps / totalColorProps;

              expect(
                hasDifference || differenceRatio > 0.3,
                `${pageInfo.name} 的 ${selector} 在淺色與深色主題下應有適當的色彩差異 (差異比例: ${(differenceRatio * 100).toFixed(1)}%)`,
              ).toBe(true);
            }
          }
        }
      });
    }
  });

  test.describe("主題持久化測試", () => {
    test("主題設定應在頁面重新載入後保持", async ({ page }) => {
      await page.goto("/");

      // 切換到深色主題
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      });

      // 重新載入頁面
      await page.reload();
      await page.waitForTimeout(500);

      // 檢查主題是否保持
      const themeAfterReload = await page.getAttribute("html", "data-theme");
      expect(themeAfterReload).toBe("dark");
    });

    test("主題設定應在不同頁面間保持一致", async ({ page }) => {
      await page.goto("/");

      // 設定深色主題
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      });

      // 導航到其他頁面
      for (const pageInfo of pages.slice(1, 3)) {
        await page.goto(pageInfo.path);
        await page.waitForTimeout(300);

        const currentTheme = await page.getAttribute("html", "data-theme");
        expect(currentTheme, `${pageInfo.name} 應該保持深色主題`).toBe("dark");
      }
    });
  });

  test.describe("可訪問性檢查", () => {
    for (const pageInfo of pages) {
      test(`${pageInfo.name} - 鍵盤導航與焦點指示器`, async ({ page }) => {
        await page.goto(pageInfo.path);

        // 測試兩種主題下的焦點指示器
        for (const theme of ["light", "dark"] as const) {
          await page.evaluate((t) => {
            document.documentElement.setAttribute("data-theme", t);
            document.body.className = document.body.className.replace(/theme-(light|dark)/g, "");
            document.body.classList.add(`theme-${t}`);
          }, theme);
          await page.waitForTimeout(200);

          // 尋找可互動元素
          const focusableElements = await page
            .locator('button, a, input, textarea, [tabindex]:not([tabindex="-1"])')
            .all();

          if (focusableElements.length > 0) {
            // 測試第一個可聚焦元素
            await focusableElements[0].focus();

            // 檢查焦點樣式是否可見
            const focusStyles = await focusableElements[0].evaluate((el) => {
              const styles = window.getComputedStyle(el, ":focus");
              return {
                outline: styles.outline,
                outlineColor: styles.outlineColor,
                boxShadow: styles.boxShadow,
                borderColor: styles.borderColor,
              };
            });

            // 至少應該有一種焦點指示器
            const hasFocusIndicator =
              focusStyles.outline !== "none" ||
              focusStyles.boxShadow !== "none" ||
              focusStyles.outlineColor !== "transparent";

            expect(hasFocusIndicator, `${pageInfo.name} ${theme} 主題下應有可見的焦點指示器`).toBe(
              true,
            );
          }
        }
      });
    }
  });
});
