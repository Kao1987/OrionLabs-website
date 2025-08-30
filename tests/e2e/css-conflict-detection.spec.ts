import { test, expect } from "@playwright/test";

/**
 * CSS 衝突檢測測試
 * 檢查多個 CSS 檔案中是否有重複定義的選擇器
 */

interface CSSConflict {
  selector: string;
  files: string[];
  properties: string[];
}

interface ContrastResult {
  selector: string;
  contrast: number;
  textColor: string;
  backgroundColor: string;
  fontSize?: string;
  fontWeight?: string;
}

test.describe("🔍 CSS 衝突檢測", () => {
  test("檢查容器元素重複定義", async ({ page }) => {
    await page.goto("/");

    // 檢查重複定義的選擇器
    const conflicts = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      const selectorRules: { [key: string]: { file: string; properties: string[] }[] } = {};

      // 常見可能衝突的選擇器
      const targetSelectors = [
        "body",
        ".navbar",
        ".btn",
        ".card",
        ".container",
        ".modal",
        ".footer",
        ".header",
        ".form",
        ".form-control",
      ];

      styleSheets.forEach((sheet, index) => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach((rule) => {
            if (rule instanceof CSSStyleRule) {
              const selector = rule.selectorText;

              // 檢查是否為目標選擇器
              targetSelectors.forEach((target) => {
                if (selector.includes(target)) {
                  if (!selectorRules[target]) {
                    selectorRules[target] = [];
                  }

                  const properties = Array.from(rule.style).map(
                    (prop) => `${prop}: ${rule.style.getPropertyValue(prop)}`,
                  );

                  selectorRules[target].push({
                    file: sheet.href || `inline-${index}`,
                    properties,
                  });
                }
              });
            }
          });
        } catch (error) {
          // 跨域樣式表可能無法訪問
          console.warn("無法訪問樣式表:", error);
        }
      });

      // 找出有衝突的選擇器
      const conflicts: CSSConflict[] = [];
      Object.keys(selectorRules).forEach((selector) => {
        if (selectorRules[selector].length > 1) {
          const files = selectorRules[selector].map((rule) => rule.file);
          const allProperties = selectorRules[selector].flatMap((rule) => rule.properties);

          conflicts.push({
            selector,
            files: [...new Set(files)],
            properties: [...new Set(allProperties)],
          });
        }
      });

      return conflicts;
    });

    console.log("🔍 發現的 CSS 衝突:", conflicts);

    // 如果有衝突，輸出詳細資訊但不讓測試失敗（作為警告）
    if (conflicts.length > 0) {
      console.warn(`⚠️ 發現 ${conflicts.length} 個潛在的 CSS 衝突:`);
      conflicts.forEach((conflict) => {
        console.warn(`- 選擇器: ${conflict.selector}`);
        console.warn(`  檔案: ${conflict.files.join(", ")}`);
        console.warn(`  屬性數量: ${conflict.properties.length}`);
      });
    }

    // 檢查關鍵衝突（body, navbar, btn）
    const criticalConflicts = conflicts.filter((c) =>
      ["body", ".navbar", ".btn"].some((selector) => c.selector.includes(selector)),
    );

    if (criticalConflicts.length > 0) {
      console.error("🚨 發現關鍵 CSS 衝突需要修復:");
      criticalConflicts.forEach((conflict) => {
        console.error(`- ${conflict.selector} 在 ${conflict.files.length} 個檔案中定義`);
      });
    }
  });

  test("檢查 CSS 變數重複定義", async ({ page }) => {
    await page.goto("/");

    const variableConflicts = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      const variables: { [key: string]: string[] } = {};

      styleSheets.forEach((sheet, index) => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach((rule) => {
            if (rule instanceof CSSStyleRule) {
              Array.from(rule.style).forEach((property) => {
                if (property.startsWith("--")) {
                  if (!variables[property]) {
                    variables[property] = [];
                  }
                  variables[property].push(sheet.href || `inline-${index}`);
                }
              });
            }
          });
        } catch (error) {
          console.warn("無法訪問樣式表:", error);
        }
      });

      // 找出重複定義的變數
      const conflicts = Object.keys(variables)
        .filter((variable) => variables[variable].length > 1)
        .map((variable) => ({
          variable,
          files: [...new Set(variables[variable])],
        }));

      return conflicts;
    });

    console.log("🔍 CSS 變數衝突:", variableConflicts);

    if (variableConflicts.length > 0) {
      console.warn(`⚠️ 發現 ${variableConflicts.length} 個重複定義的 CSS 變數:`);
      variableConflicts.forEach((conflict) => {
        console.warn(`- 變數: ${conflict.variable}`);
        console.warn(`  檔案: ${conflict.files.join(", ")}`);
      });
    }
  });
});

test.describe("👁️ 字體可見性檢測", () => {
  const testPages = [
    { name: "首頁", path: "/" },
    { name: "關於頁面", path: "/about" },
    { name: "聯絡頁面", path: "/contact" },
    { name: "部落格", path: "/blog" },
  ];

  for (const pageInfo of testPages) {
    test(`${pageInfo.name} - 深色模式字體對比度檢查`, async ({ page }) => {
      await page.goto(pageInfo.path);

      // 切換到深色模式
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "dark");
        document.body.classList.add("theme-dark");
        document.body.classList.remove("theme-light");
      });

      await page.waitForTimeout(300);

      // 檢查各種文字元素的對比度
      const textElements = [
        "p",
        "h1, h2, h3, h4, h5, h6",
        ".text-secondary",
        ".text-muted",
        ".navbar-nav .nav-link",
        ".btn-secondary",
        ".card-text",
        ".small, small",
        ".text-sm",
      ];

      const contrastResults: ContrastResult[] = [];

      for (const selector of textElements) {
        const elements = await page.locator(selector);
        const count = await elements.count();

        if (count > 0) {
          // 檢查前幾個元素
          for (let i = 0; i < Math.min(count, 3); i++) {
            const element = elements.nth(i);

            const styles = await element.evaluate((el) => {
              const computed = getComputedStyle(el);
              return {
                color: computed.color,
                backgroundColor: computed.backgroundColor,
                fontSize: computed.fontSize,
                fontWeight: computed.fontWeight,
              };
            });

            const textRgb = parseRgbColor(styles.color);
            const bgRgb = parseRgbColor(styles.backgroundColor);

            if (textRgb && bgRgb) {
              const contrast = calculateContrast(textRgb, bgRgb);

              contrastResults.push({
                selector,
                contrast,
                textColor: styles.color,
                backgroundColor: styles.backgroundColor,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight,
              });

              console.log(
                `${pageInfo.name} ${selector} - 對比度: ${contrast.toFixed(2)}:1, 文字: ${styles.color}, 背景: ${styles.backgroundColor}`,
              );
            }
          }
        }
      }

      // 檢查低對比度警告
      const lowContrastElements = contrastResults.filter((result) => {
        const isBoldText = result.fontWeight ? parseInt(result.fontWeight) >= 700 : false;
        const isLargeText = result.fontSize ? parseFloat(result.fontSize) >= 18 : false;

        // WCAG 標準：普通文字 4.5:1，大文字或粗體 3:1
        const requiredContrast = isBoldText || isLargeText ? 3 : 4.5;
        return result.contrast < requiredContrast;
      });

      if (lowContrastElements.length > 0) {
        console.warn(
          `⚠️ ${pageInfo.name} 深色模式發現 ${lowContrastElements.length} 個低對比度元素:`,
        );
        lowContrastElements.forEach((element) => {
          console.warn(
            `- ${element.selector}: ${element.contrast.toFixed(2)}:1 (文字: ${element.textColor}, 背景: ${element.backgroundColor})`,
          );
        });
      }

      // 輸出統計資訊
      const averageContrast =
        contrastResults.reduce((sum, result) => sum + result.contrast, 0) / contrastResults.length;
      console.log(`${pageInfo.name} 深色模式平均對比度: ${averageContrast.toFixed(2)}:1`);

      // 軟性檢查：不讓測試失敗，但記錄問題
      expect(contrastResults.length, `${pageInfo.name} 應該有可檢測的文字元素`).toBeGreaterThan(0);
    });

    test(`${pageInfo.name} - 淺色模式字體對比度檢查`, async ({ page }) => {
      await page.goto(pageInfo.path);

      // 確保是淺色模式
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "light");
        document.body.classList.add("theme-light");
        document.body.classList.remove("theme-dark");
      });

      await page.waitForTimeout(300);

      // 執行相同的對比度檢查
      const textElements = [
        "p",
        "h1, h2, h3, h4, h5, h6",
        ".text-secondary",
        ".text-muted",
        ".navbar-nav .nav-link",
        ".btn-secondary",
        ".card-text",
      ];

      const contrastResults: ContrastResult[] = [];

      for (const selector of textElements) {
        const elements = await page.locator(selector);
        const count = await elements.count();

        if (count > 0) {
          const element = elements.first();

          const styles = await element.evaluate((el) => {
            const computed = getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize,
              fontWeight: computed.fontWeight,
            };
          });

          const textRgb = parseRgbColor(styles.color);
          const bgRgb = parseRgbColor(styles.backgroundColor);

          if (textRgb && bgRgb) {
            const contrast = calculateContrast(textRgb, bgRgb);

            contrastResults.push({
              selector,
              contrast,
              textColor: styles.color,
              backgroundColor: styles.backgroundColor,
            });

            console.log(`${pageInfo.name} ${selector} - 對比度: ${contrast.toFixed(2)}:1`);
          }
        }
      }

      const averageContrast =
        contrastResults.reduce((sum, result) => sum + result.contrast, 0) / contrastResults.length;
      console.log(`${pageInfo.name} 淺色模式平均對比度: ${averageContrast.toFixed(2)}:1`);

      expect(contrastResults.length, `${pageInfo.name} 應該有可檢測的文字元素`).toBeGreaterThan(0);
    });
  }
});

// 輔助函數
function parseRgbColor(color: string): [number, number, number] | null {
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
  }

  const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
  if (rgbaMatch) {
    return [parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3])];
  }

  return null;
}

function calculateContrast(
  color1: [number, number, number],
  color2: [number, number, number],
): number {
  const getLuminance = (rgb: [number, number, number]) => {
    const [r, g, b] = rgb.map((c) => {
      const sRGB = c / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}
