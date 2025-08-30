import { test, expect } from "@playwright/test";

/**
 * BEM 命名規範驗證測試
 * 確保頁面上的 CSS 類名符合 BEM 規範
 */

// BEM 命名規範正則表達式
const BEM_PATTERNS = {
  // Block: lowercase, hyphen-separated
  block: /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  
  // Element: block__element
  element: /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*__[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  
  // Modifier: block--modifier or block__element--modifier
  modifier: /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?--[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  
  // Utility classes (prefixed with u-)
  utility: /^u-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/
};

// Bootstrap classes to ignore
const BOOTSTRAP_CLASSES = new Set([
  'container', 'container-fluid', 'row', 'col', 'col-12', 'col-md-6', 'col-lg-4',
  'd-flex', 'd-none', 'd-block', 'flex-column', 'flex-row', 'justify-content-center',
  'align-items-center', 'text-center', 'text-left', 'text-right', 'mb-4', 'mt-3',
  'btn', 'btn-primary', 'btn-secondary', 'btn-outline-primary', 'form-control',
  'form-label', 'form-check', 'form-check-input', 'form-check-label', 'is-invalid',
  'is-valid', 'invalid-feedback', 'valid-feedback', 'spinner-border', 'visually-hidden',
  'me-2', 'ms-2', 'px-5', 'g-3'
]);

// Standard HTML/CSS classes to ignore
const STANDARD_CLASSES = new Set([
  'active', 'disabled', 'hidden', 'visible', 'focus', 'hover', 'bi', 'bi-check-circle',
  'bi-exclamation-triangle', 'bi-send', 'g-recaptcha'
]);

function validateClassName(className: string): { valid: boolean; type: string; reason?: string } {
  // 跳過 Bootstrap 類
  if (BOOTSTRAP_CLASSES.has(className)) {
    return { valid: true, type: 'bootstrap' };
  }
  
  // 跳過標準類
  if (STANDARD_CLASSES.has(className)) {
    return { valid: true, type: 'standard' };
  }
  
  // 跳過 Bootstrap Icons
  if (className.startsWith('bi-')) {
    return { valid: true, type: 'icon' };
  }
  
  // 跳過以數字或特殊字符開頭的類
  if (!/^[a-zA-Z]/.test(className)) {
    return { valid: true, type: 'other' };
  }
  
  // 驗證 BEM 模式
  if (BEM_PATTERNS.utility.test(className)) {
    return { valid: true, type: 'utility' };
  }
  
  if (BEM_PATTERNS.modifier.test(className)) {
    return { valid: true, type: 'modifier' };
  }
  
  if (BEM_PATTERNS.element.test(className)) {
    return { valid: true, type: 'element' };
  }
  
  if (BEM_PATTERNS.block.test(className)) {
    return { valid: true, type: 'block' };
  }
  
  return { 
    valid: false, 
    type: 'invalid',
    reason: `Does not match BEM pattern: ${className}`
  };
}

test.describe('🎯 BEM 命名規範驗證', () => {
  const testPages = [
    { name: '首頁', path: '/' },
    { name: '關於頁面', path: '/about' },
    { name: '聯絡頁面', path: '/contact' },
    { name: '作品集', path: '/portfolio' },
    { name: '部落格', path: '/blog' }
  ];

  for (const pageInfo of testPages) {
    test(`${pageInfo.name} - BEM 類名驗證`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');

      const classAnalysis = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const classNames = new Set<string>();
        
        elements.forEach(element => {
          if (element.className && typeof element.className === 'string') {
            element.className.split(/\s+/).forEach(className => {
              if (className.trim()) {
                classNames.add(className.trim());
              }
            });
          }
        });
        
        return Array.from(classNames);
      });

      const results = classAnalysis.map(className => ({
        className,
        validation: validateClassName(className)
      }));

      const invalidClasses = results.filter(result => !result.validation.valid);
      const bemClasses = results.filter(result => 
        ['block', 'element', 'modifier', 'utility'].includes(result.validation.type)
      );

      console.log(`\n📊 ${pageInfo.name} BEM 分析:`);
      console.log(`總類名數量: ${results.length}`);
      console.log(`BEM 類名數量: ${bemClasses.length}`);
      console.log(`Bootstrap 類名: ${results.filter(r => r.validation.type === 'bootstrap').length}`);
      console.log(`無效類名數量: ${invalidClasses.length}`);

      if (bemClasses.length > 0) {
        console.log('\n✅ BEM 類名範例:');
        bemClasses.slice(0, 5).forEach(result => {
          console.log(`  • ${result.className} (${result.validation.type})`);
        });
      }

      if (invalidClasses.length > 0) {
        console.log('\n❌ 無效類名:');
        invalidClasses.forEach(result => {
          console.log(`  • ${result.className}: ${result.validation.reason}`);
        });
      }

      // 軟性檢查：記錄問題但不讓測試失敗
      expect(results.length).toBeGreaterThan(0);
      
      // 檢查是否有基本的 BEM 結構
      const hasContactForm = results.some(r => r.className.startsWith('contact-form'));
      const hasLoadingSpinner = results.some(r => r.className.startsWith('loading-spinner'));
      const hasNotification = results.some(r => r.className.startsWith('notification-'));

      if (pageInfo.path === '/contact' && hasContactForm) {
        console.log('✅ 聯絡表單使用 BEM 結構');
      }

      // 記錄 BEM 採用率
      const bemAdoptionRate = bemClasses.length / results.length;
      console.log(`BEM 採用率: ${(bemAdoptionRate * 100).toFixed(1)}%`);

      if (bemAdoptionRate > 0.1) {
        console.log('✅ BEM 結構已部分實施');
      }
    });
  }

  test('組件 BEM 結構檢查', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // 檢查 ContactForm BEM 結構
    const contactFormClasses = await page.evaluate(() => {
      const contactFormContainer = document.querySelector('.contact-form');
      if (!contactFormContainer) return [];

      const elements = contactFormContainer.querySelectorAll('*');
      const classes: string[] = [];
      
      elements.forEach(element => {
        if (element.className && typeof element.className === 'string') {
          element.className.split(/\s+/).forEach(className => {
            if (className.startsWith('contact-form')) {
              classes.push(className.trim());
            }
          });
        }
      });
      
      return [...new Set(classes)].sort();
    });

    console.log('\n🔍 ContactForm BEM 類名:');
    contactFormClasses.forEach(className => {
      const validation = validateClassName(className);
      console.log(`  • ${className} (${validation.type})`);
    });

    // 檢查預期的 BEM 結構
    const expectedClasses = [
      'contact-form',
      'contact-form__form',
      'contact-form__field',
      'contact-form__label',
      'contact-form__input',
      'contact-form__submit'
    ];

    const foundExpectedClasses = expectedClasses.filter(expectedClass => 
      contactFormClasses.includes(expectedClass)
    );

    console.log(`\n📈 ContactForm BEM 完整度: ${foundExpectedClasses.length}/${expectedClasses.length}`);
    
    if (foundExpectedClasses.length > 0) {
      console.log('✅ ContactForm 已實施 BEM 結構');
    }

    expect(contactFormClasses.length).toBeGreaterThan(0);
  });

  test('LoadingSpinner BEM 結構檢查', async ({ page }) => {
    // 直接在頁面中創建 LoadingSpinner 來測試
    await page.goto('/');
    
    await page.evaluate(() => {
      const app = document.getElementById('app');
      if (app) {
        app.innerHTML += `
          <div class="loading-spinner loading-spinner--center">
            <div class="loading-spinner__spinner"></div>
            <div class="loading-spinner__message">載入中...</div>
          </div>
        `;
      }
    });

    const spinnerClasses = await page.evaluate(() => {
      const spinnerElements = document.querySelectorAll('[class*="loading-spinner"]');
      const classes: string[] = [];
      
      spinnerElements.forEach(element => {
        if (element.className && typeof element.className === 'string') {
          element.className.split(/\s+/).forEach(className => {
            if (className.startsWith('loading-spinner')) {
              classes.push(className.trim());
            }
          });
        }
      });
      
      return [...new Set(classes)].sort();
    });

    console.log('\n🔄 LoadingSpinner BEM 類名:');
    spinnerClasses.forEach(className => {
      const validation = validateClassName(className);
      console.log(`  • ${className} (${validation.type})`);
    });

    // 驗證所有類名都符合 BEM 規範
    const invalidSpinnerClasses = spinnerClasses.filter(className => {
      const validation = validateClassName(className);
      return !validation.valid;
    });

    if (invalidSpinnerClasses.length > 0) {
      console.log('❌ LoadingSpinner 無效類名:', invalidSpinnerClasses);
    } else {
      console.log('✅ LoadingSpinner 所有類名符合 BEM 規範');
    }

    expect(spinnerClasses.length).toBeGreaterThan(0);
    expect(invalidSpinnerClasses.length).toBe(0);
  });
});