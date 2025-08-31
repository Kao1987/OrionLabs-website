// sitemap-generator.js
// 動態生成 sitemap.xml 的工具

export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export class SitemapGenerator {
  private baseUrl: string;
  private urls: SitemapUrl[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  addUrl(url: Partial<SitemapUrl> & { loc: string }): void {
    const fullUrl: SitemapUrl = {
      loc: url.loc.startsWith('http') ? url.loc : `${this.baseUrl}${url.loc}`,
      lastmod: url.lastmod || new Date().toISOString().split('T')[0],
      changefreq: url.changefreq || 'monthly',
      priority: url.priority || 0.5
    };
    this.urls.push(fullUrl);
  }

  addBlogPosts(posts: Array<{ slug: string; publishedAt: string; updatedAt?: string }>): void {
    posts.forEach(post => {
      this.addUrl({
        loc: `/blog/${post.slug}`,
        lastmod: post.updatedAt || post.publishedAt,
        changefreq: 'monthly',
        priority: 0.6
      });
    });
  }

  addPortfolioItems(items: Array<{ slug: string; createdAt: string; updatedAt?: string }>): void {
    items.forEach(item => {
      this.addUrl({
        loc: `/portfolio/${item.slug}`,
        lastmod: item.updatedAt || item.createdAt,
        changefreq: 'yearly',
        priority: 0.7
      });
    });
  }

  generateXML(): string {
    const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

    const urlsXML = this.urls
      .sort((a, b) => b.priority - a.priority)
      .map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`)
      .join('\n');

    const footer = `</urlset>`;

    return `${header}\n${urlsXML}\n${footer}`;
  }

  static generateDefault(): string {
    const generator = new SitemapGenerator('https://orionlabs.pro');

    // 主要頁面
    generator.addUrl({
      loc: '/',
      changefreq: 'weekly',
      priority: 1.0
    });

    generator.addUrl({
      loc: '/about',
      changefreq: 'monthly',
      priority: 0.8
    });

    generator.addUrl({
      loc: '/portfolio',
      changefreq: 'weekly',
      priority: 0.9
    });

    generator.addUrl({
      loc: '/blog',
      changefreq: 'daily',
      priority: 0.8
    });

    generator.addUrl({
      loc: '/contact',
      changefreq: 'monthly',
      priority: 0.7
    });

    // 法遵頁面
    generator.addUrl({
      loc: '/privacy',
      changefreq: 'yearly',
      priority: 0.3
    });

    generator.addUrl({
      loc: '/terms',
      changefreq: 'yearly',
      priority: 0.3
    });

    generator.addUrl({
      loc: '/cookie',
      changefreq: 'yearly',
      priority: 0.3
    });

    return generator.generateXML();
  }
}

// 使用範例
// const sitemap = SitemapGenerator.generateDefault();
// console.log(sitemap);
