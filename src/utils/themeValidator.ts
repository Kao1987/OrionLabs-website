/* === Orion 主題驗證工具 - 符合 A-core 規範 === */

export interface ThemeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    lightThemeColors: number;
    darkThemeColors: number;
    missingVariables: string[];
  };
}

/**
 * 驗證主題色彩變數是否完整
 * 確保淺色和深色主題都有對應的色彩定義
 */
export function validateThemeColors(): ThemeValidationResult {
  const result: ThemeValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    summary: {
      lightThemeColors: 0,
      darkThemeColors: 0,
      missingVariables: [],
    },
  };

  // 必要的色彩變數清單
  const requiredVariables = [
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

  // 檢查淺色主題
  document.documentElement.setAttribute("data-theme", "light");
  const lightStyle = getComputedStyle(document.documentElement);

  requiredVariables.forEach((variable) => {
    const value = lightStyle.getPropertyValue(variable).trim();
    if (value) {
      result.summary.lightThemeColors++;
    } else {
      result.errors.push(`淺色主題缺少變數: ${variable}`);
      result.summary.missingVariables.push(`light:${variable}`);
      result.isValid = false;
    }
  });

  // 檢查深色主題
  document.documentElement.setAttribute("data-theme", "dark");
  const darkStyle = getComputedStyle(document.documentElement);

  requiredVariables.forEach((variable) => {
    const value = darkStyle.getPropertyValue(variable).trim();
    if (value) {
      result.summary.darkThemeColors++;
    } else {
      result.errors.push(`深色主題缺少變數: ${variable}`);
      result.summary.missingVariables.push(`dark:${variable}`);
      result.isValid = false;
    }
  });

  // 恢復原始主題
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // 檢查色彩對比度
  if (result.summary.lightThemeColors < requiredVariables.length * 0.8) {
    result.warnings.push("淺色主題色彩定義不完整，可能影響用戶體驗");
  }

  if (result.summary.darkThemeColors < requiredVariables.length * 0.8) {
    result.warnings.push("深色主題色彩定義不完整，可能影響用戶體驗");
  }

  return result;
}

/**
 * 檢查 BEM-Lite 命名規範符合性
 */
export function validateBEMLiteNaming(cssContent: string): string[] {
  const violations: string[] = [];
  const lines = cssContent.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // 檢查是否有雙底線 (__) 或雙連字號 (--)
    if (line.includes("__") && !line.includes("/* vendor-bem-allow */")) {
      violations.push(`行 ${lineNum}: 發現雙底線 (__) 命名，違反 BEM-Lite 規範`);
    }

    if (
      line.includes("--") &&
      !line.includes("/* vendor-bem-allow */") &&
      !line.includes("--color") &&
      !line.includes("--orion")
    ) {
      violations.push(`行 ${lineNum}: 發現雙連字號 (--) 命名，違反 BEM-Lite 規範`);
    }
  });

  return violations;
}

/**
 * 開發環境主題一致性檢查
 */
export function runThemeConsistencyCheck(): void {
  // 僅在開發環境執行
  if (import.meta.env.MODE !== "development") return;

  const validation = validateThemeColors();

  if (!validation.isValid) {
    console.group("🎨 Orion 主題驗證失敗");
    validation.errors.forEach((error) => console.error("❌", error));
    validation.warnings.forEach((warning) => console.warn("⚠️", warning));
    console.groupEnd();
  } else {
    console.log("✅ Orion 主題驗證通過", {
      淺色主題變數: validation.summary.lightThemeColors,
      深色主題變數: validation.summary.darkThemeColors,
    });
  }
}
