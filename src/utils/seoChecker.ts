// SEO 檢查和優化工具
export interface SEOCheckResult {
  score: number;
  issues: SEOIssue[];
  recommendations: string[];
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  category: 'meta' | 'content' | 'structure' | 'performance' | 'accessibility';
  message: string;
  element?: string;
}

export class SEOChecker {
  private document: Document;

  constructor(document: Document) {
    this.document = document;
  }

  checkAll(): SEOCheckResult {
    const issues: SEOIssue[] = [];
    let score = 100;

    // 檢查基礎 Meta 標籤
    const metaIssues = this.checkMetaTags();
    issues.push(...metaIssues);
    score -= metaIssues.filter(i => i.type === 'error').length * 10;
    score -= metaIssues.filter(i => i.type === 'warning').length * 5;

    // 檢查標題結構
    const headingIssues = this.checkHeadingStructure();
    issues.push(...headingIssues);
    score -= headingIssues.filter(i => i.type === 'error').length * 8;

    // 檢查圖片
    const imageIssues = this.checkImages();
    issues.push(...imageIssues);
    score -= imageIssues.filter(i => i.type === 'error').length * 5;

    // 檢查連結
    const linkIssues = this.checkLinks();
    issues.push(...linkIssues);
    score -= linkIssues.filter(i => i.type === 'error').length * 3;

    // 檢查可訪問性
    const a11yIssues = this.checkAccessibility();
    issues.push(...a11yIssues);
    score -= a11yIssues.filter(i => i.type === 'error').length * 7;

    const recommendations = this.generateRecommendations(issues);

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  private checkMetaTags(): SEOIssue[] {
    const issues: SEOIssue[] = [];

    // 檢查 title
    const title = this.document.querySelector('title');
    if (!title || !title.textContent?.trim()) {
      issues.push({
        type: 'error',
        category: 'meta',
        message: '缺少頁面標題',
        element: '<title>'
      });
    } else if (title.textContent.length > 60) {
      issues.push({
        type: 'warning',
        category: 'meta',
        message: '頁面標題過長（建議 60 字元以內）',
        element: '<title>'
      });
    } else if (title.textContent.length < 30) {
      issues.push({
        type: 'warning',
        category: 'meta',
        message: '頁面標題過短（建議 30-60 字元）',
        element: '<title>'
      });
    }

    // 檢查 meta description
    const description = this.document.querySelector('meta[name="description"]');
    if (!description || !description.getAttribute('content')?.trim()) {
      issues.push({
        type: 'error',
        category: 'meta',
        message: '缺少 meta description',
        element: 'meta[name="description"]'
      });
    } else {
      const content = description.getAttribute('content')!;
      if (content.length > 160) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: 'Meta description 過長（建議 160 字元以內）',
          element: 'meta[name="description"]'
        });
      } else if (content.length < 120) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: 'Meta description 過短（建議 120-160 字元）',
          element: 'meta[name="description"]'
        });
      }
    }

    // 檢查 robots
    const robots = this.document.querySelector('meta[name="robots"]');
    if (!robots) {
      issues.push({
        type: 'warning',
        category: 'meta',
        message: '建議添加 robots meta 標籤',
        element: 'meta[name="robots"]'
      });
    }

    // 檢查 canonical
    const canonical = this.document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      issues.push({
        type: 'warning',
        category: 'meta',
        message: '建議添加 canonical 連結',
        element: 'link[rel="canonical"]'
      });
    }

    // 檢查 Open Graph
    const ogTitle = this.document.querySelector('meta[property="og:title"]');
    const ogDescription = this.document.querySelector('meta[property="og:description"]');
    const ogImage = this.document.querySelector('meta[property="og:image"]');

    if (!ogTitle) {
      issues.push({
        type: 'warning',
        category: 'meta',
        message: '缺少 Open Graph title',
        element: 'meta[property="og:title"]'
      });
    }

    if (!ogDescription) {
      issues.push({
        type: 'warning',
        category: 'meta',
        message: '缺少 Open Graph description',
        element: 'meta[property="og:description"]'
      });
    }

    if (!ogImage) {
      issues.push({
        type: 'warning',
        category: 'meta',
        message: '缺少 Open Graph image',
        element: 'meta[property="og:image"]'
      });
    }

    return issues;
  }

  private checkHeadingStructure(): SEOIssue[] {
    const issues: SEOIssue[] = [];
    const headings = this.document.querySelectorAll('h1, h2, h3, h4, h5, h6');

    // 檢查 H1
    const h1s = this.document.querySelectorAll('h1');
    if (h1s.length === 0) {
      issues.push({
        type: 'error',
        category: 'structure',
        message: '頁面缺少 H1 標題',
        element: 'h1'
      });
    } else if (h1s.length > 1) {
      issues.push({
        type: 'warning',
        category: 'structure',
        message: '頁面有多個 H1 標題（建議只有一個）',
        element: 'h1'
      });
    }

    // 檢查標題階層
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (index > 0 && level > lastLevel + 1) {
        issues.push({
          type: 'warning',
          category: 'structure',
          message: `標題階層跳躍：${heading.tagName} 在 H${lastLevel} 之後`,
          element: heading.tagName.toLowerCase()
        });
      }
      lastLevel = level;
    });

    return issues;
  }

  private checkImages(): SEOIssue[] {
    const issues: SEOIssue[] = [];
    const images = this.document.querySelectorAll('img');

    images.forEach((img, index) => {
      if (!img.getAttribute('alt')) {
        issues.push({
          type: 'error',
          category: 'accessibility',
          message: `圖片缺少 alt 屬性 (第 ${index + 1} 張)`,
          element: 'img'
        });
      } else if (img.getAttribute('alt')?.trim() === '') {
        issues.push({
          type: 'warning',
          category: 'accessibility',
          message: `圖片 alt 屬性為空 (第 ${index + 1} 張)`,
          element: 'img'
        });
      }

      if (!img.getAttribute('loading')) {
        issues.push({
          type: 'info',
          category: 'performance',
          message: `建議為圖片添加 loading="lazy" (第 ${index + 1} 張)`,
          element: 'img'
        });
      }
    });

    return issues;
  }

  private checkLinks(): SEOIssue[] {
    const issues: SEOIssue[] = [];
    const links = this.document.querySelectorAll('a');

    links.forEach((link, index) => {
      const href = link.getAttribute('href');
      
      if (!href || href === '#') {
        issues.push({
          type: 'warning',
          category: 'structure',
          message: `連結缺少有效的 href (第 ${index + 1} 個)`,
          element: 'a'
        });
      }

      if (href?.startsWith('http') && !link.getAttribute('rel')?.includes('noopener')) {
        issues.push({
          type: 'warning',
          category: 'structure',
          message: `外部連結建議添加 rel="noopener" (第 ${index + 1} 個)`,
          element: 'a'
        });
      }

      if (!link.textContent?.trim() && !link.querySelector('img[alt]')) {
        issues.push({
          type: 'error',
          category: 'accessibility',
          message: `連結缺少文字內容或 alt 屬性 (第 ${index + 1} 個)`,
          element: 'a'
        });
      }
    });

    return issues;
  }

  private checkAccessibility(): SEOIssue[] {
    const issues: SEOIssue[] = [];

    // 檢查 lang 屬性
    const html = this.document.querySelector('html');
    if (!html?.getAttribute('lang')) {
      issues.push({
        type: 'error',
        category: 'accessibility',
        message: 'HTML 缺少 lang 屬性',
        element: 'html'
      });
    }

    // 檢查表單標籤
    const inputs = this.document.querySelectorAll('input, textarea, select');
    inputs.forEach((input, index) => {
      const id = input.getAttribute('id');
      const label = id ? this.document.querySelector(`label[for="${id}"]`) : null;
      
      if (!label && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        issues.push({
          type: 'error',
          category: 'accessibility',
          message: `表單元素缺少標籤 (第 ${index + 1} 個)`,
          element: input.tagName.toLowerCase()
        });
      }
    });

    return issues;
  }

  private generateRecommendations(issues: SEOIssue[]): string[] {
    const recommendations: string[] = [];

    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;

    if (errorCount > 0) {
      recommendations.push(`優先修復 ${errorCount} 個嚴重問題以提升 SEO 表現`);
    }

    if (warningCount > 0) {
      recommendations.push(`考慮優化 ${warningCount} 個警告項目以獲得更好的 SEO 效果`);
    }

    const metaIssues = issues.filter(i => i.category === 'meta');
    if (metaIssues.length > 0) {
      recommendations.push('完善 Meta 標籤設定，包括 title、description 和 Open Graph');
    }

    const a11yIssues = issues.filter(i => i.category === 'accessibility');
    if (a11yIssues.length > 0) {
      recommendations.push('改善網站可訪問性，這對 SEO 和使用者體驗都很重要');
    }

    const performanceIssues = issues.filter(i => i.category === 'performance');
    if (performanceIssues.length > 0) {
      recommendations.push('優化圖片載入和其他性能相關項目');
    }

    if (recommendations.length === 0) {
      recommendations.push('您的頁面 SEO 表現良好！');
    }

    return recommendations;
  }
}

// 使用範例
export function checkPageSEO(): SEOCheckResult {
  const checker = new SEOChecker(document);
  return checker.checkAll();
}
