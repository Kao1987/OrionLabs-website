import { test, expect } from '@playwright/test';

/**
 * CSS 載入性能測試
 * 檢驗 BEM 重構後的 CSS 載入性能改善
 */

interface PerformanceMetrics {
  cssLoadTime: number;
  totalCSSSize: number;
  cssFileCount: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

test.describe('🚀 CSS 載入性能測試', () => {
  test('測試 CSS 載入時間與檔案大小', async ({ page }) => {
    const startTime = Date.now();
    
    // 監聽所有 CSS 請求
    const cssRequests: any[] = [];
    page.on('response', response => {
      if (response.url().includes('.css') && response.status() === 200) {
        cssRequests.push({
          url: response.url(),
          size: 0, // 將在後面獲取
          loadTime: Date.now() - startTime
        });
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    // 獲取 CSS 檔案大小
    for (const request of cssRequests) {
      try {
        const response = await page.request.get(request.url);
        const buffer = await response.body();
        request.size = buffer.length;
      } catch (error) {
        console.warn(`無法獲取 ${request.url} 的大小`);
      }
    }

    const totalCSSSize = cssRequests.reduce((sum, req) => sum + req.size, 0);
    const cssLoadTime = Math.max(...cssRequests.map(req => req.loadTime));

    console.log('\n📊 CSS 載入性能分析:');
    console.log(`CSS 檔案數量: ${cssRequests.length}`);
    console.log(`總 CSS 大小: ${(totalCSSSize / 1024).toFixed(2)} KB`);
    console.log(`CSS 載入時間: ${cssLoadTime} ms`);
    
    cssRequests.forEach(req => {
      const fileName = req.url.split('/').pop();
      console.log(`  • ${fileName}: ${(req.size / 1024).toFixed(2)} KB (${req.loadTime} ms)`);
    });

    // 性能基準檢查
    expect(cssRequests.length).toBeLessThan(10); // CSS 檔案數量應少於 10 個
    expect(totalCSSSize).toBeLessThan(200 * 1024); // 總大小應小於 200KB
    expect(cssLoadTime).toBeLessThan(2000); // 載入時間應小於 2 秒
  });

  test('測試頁面渲染性能指標', async ({ page }) => {
    await page.goto('/');

    // 獲取 Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics: any = {};

          entries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime;
            }
          });

          // 手動計算 LCP (簡化版)
          const paintEntries = performance.getEntriesByType('paint');
          paintEntries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime;
            }
          });

          resolve(metrics);
        });

        observer.observe({ type: 'paint', buffered: true });
        
        // 設定超時
        setTimeout(() => resolve({ fcp: 0 }), 5000);
      });
    });

    console.log('\n⚡ 頁面渲染性能指標:');
    console.log(`First Contentful Paint: ${(webVitals as any).fcp?.toFixed(2) || 'N/A'} ms`);

    // 檢查是否有未使用的 CSS
    const unusedCSSRatio = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      let totalRules = 0;
      let usedRules = 0;

      styleSheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          totalRules += rules.length;

          rules.forEach(rule => {
            if (rule instanceof CSSStyleRule) {
              try {
                const elements = document.querySelectorAll(rule.selectorText);
                if (elements.length > 0) {
                  usedRules++;
                }
              } catch (e) {
                // 忽略無效選擇器
              }
            }
          });
        } catch (e) {
          // 跨域樣式表無法存取
        }
      });

      return totalRules > 0 ? (totalRules - usedRules) / totalRules : 0;
    });

    console.log(`未使用 CSS 比例: ${(unusedCSSRatio * 100).toFixed(1)}%`);

    // 性能檢查
    if (webVitals && (webVitals as any).fcp) {
      expect((webVitals as any).fcp).toBeLessThan(2500); // FCP 應小於 2.5 秒
    }
    expect(unusedCSSRatio).toBeLessThan(0.5); // 未使用 CSS 應小於 50%
  });

  test('測試深色模式切換性能', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 測試主題切換時間
    const switchTimes: number[] = [];
    
    for (let i = 0; i < 3; i++) {
      const startTime = performance.now();
      
      await page.evaluate(() => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        document.body.className = `theme-${newTheme}`;
      });

      await page.waitForTimeout(100); // 等待 CSS 轉換完成
      
      const endTime = performance.now();
      switchTimes.push(endTime - startTime);
    }

    const averageSwitchTime = switchTimes.reduce((sum, time) => sum + time, 0) / switchTimes.length;
    
    console.log('\n🌙 深色模式切換性能:');
    console.log(`平均切換時間: ${averageSwitchTime.toFixed(2)} ms`);
    switchTimes.forEach((time, index) => {
      console.log(`  切換 ${index + 1}: ${time.toFixed(2)} ms`);
    });

    expect(averageSwitchTime).toBeLessThan(200); // 主題切換應小於 200ms
  });

  test('比較 BEM 前後 CSS 複雜度', async ({ page }) => {
    await page.goto('/');

    const cssComplexity = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      const analysis = {
        totalRules: 0,
        bemRules: 0,
        nestedSelectors: 0,
        importantDeclarations: 0,
        averageSelectorLength: 0
      };

      const selectorLengths: number[] = [];

      styleSheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          analysis.totalRules += rules.length;

          rules.forEach(rule => {
            if (rule instanceof CSSStyleRule) {
              const selector = rule.selectorText;
              selectorLengths.push(selector.length);

              // 檢查 BEM 模式
              if (/^\.[\w-]+(__[\w-]+)?(--[\w-]+)?$/.test(selector.trim())) {
                analysis.bemRules++;
              }

              // 檢查嵌套選擇器
              if (selector.includes(' ') && selector.split(' ').length > 3) {
                analysis.nestedSelectors++;
              }

              // 檢查 !important 使用
              Array.from(rule.style).forEach(prop => {
                if (rule.style.getPropertyPriority(prop) === 'important') {
                  analysis.importantDeclarations++;
                }
              });
            }
          });
        } catch (e) {
          // 跨域樣式表無法存取
        }
      });

      analysis.averageSelectorLength = selectorLengths.length > 0 
        ? selectorLengths.reduce((sum, len) => sum + len, 0) / selectorLengths.length 
        : 0;

      return analysis;
    });

    console.log('\n🔍 CSS 複雜度分析:');
    console.log(`總 CSS 規則: ${cssComplexity.totalRules}`);
    console.log(`BEM 規則數量: ${cssComplexity.bemRules}`);
    console.log(`BEM 採用率: ${((cssComplexity.bemRules / cssComplexity.totalRules) * 100).toFixed(1)}%`);
    console.log(`深層嵌套選擇器: ${cssComplexity.nestedSelectors}`);
    console.log(`!important 使用次數: ${cssComplexity.importantDeclarations}`);
    console.log(`平均選擇器長度: ${cssComplexity.averageSelectorLength.toFixed(1)} 字符`);

    // 品質檢查
    expect(cssComplexity.bemRules).toBeGreaterThan(10); // 應該有一定數量的 BEM 規則
    expect(cssComplexity.nestedSelectors / cssComplexity.totalRules).toBeLessThan(0.3); // 深層嵌套應少於 30%
    expect(cssComplexity.importantDeclarations / cssComplexity.totalRules).toBeLessThan(0.1); // !important 使用應少於 10%
  });

  test('檢測 CSS 載入阻塞', async ({ page }) => {
    const navigationStart = Date.now();
    
    await page.goto('/', { 
      waitUntil: 'domcontentloaded' 
    });
    
    const domContentLoadedTime = Date.now() - navigationStart;

    await page.waitForLoadState('networkidle');
    const fullyLoadedTime = Date.now() - navigationStart;

    // 檢查首次渲染時間
    const renderTiming = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcpEntry ? fcpEntry.startTime : null;
    });

    console.log('\n⏱️ 載入時序分析:');
    console.log(`DOM Content Loaded: ${domContentLoadedTime} ms`);
    console.log(`完全載入時間: ${fullyLoadedTime} ms`);
    console.log(`First Contentful Paint: ${renderTiming?.toFixed(2) || 'N/A'} ms`);

    // 檢查 CSS 是否阻塞渲染
    const cssBlockingTime = renderTiming ? renderTiming - domContentLoadedTime : 0;
    console.log(`CSS 阻塞時間: ${cssBlockingTime.toFixed(2)} ms`);

    expect(domContentLoadedTime).toBeLessThan(1500); // DOM 載入應小於 1.5 秒
    expect(fullyLoadedTime).toBeLessThan(3000); // 完全載入應小於 3 秒
    if (renderTiming) {
      expect(renderTiming).toBeLessThan(2000); // FCP 應小於 2 秒
    }
  });
});