import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

// SEO 資料介面
export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  siteName?: string;
  locale?: string;
  modifiedTime?: string;
  publishedTime?: string;
  section?: string;
  tags?: string[];
  // Twitter Card
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  twitterSite?: string;
  twitterCreator?: string;
  // 額外設定
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
}

// 預設 SEO 設定
const DEFAULT_SEO: Required<Omit<SEOData, "publishedTime" | "modifiedTime" | "section" | "tags">> =
  {
    title: "OrionLabs - 前端開發與 UI/UX 設計",
    description:
      "歡迎來到 OrionLabs！我是一名專注於前端開發與 UI/UX 設計的工程師，致力於創造優質的數位體驗。探索我的作品集、技術文章，以及與我聯絡合作。",
    keywords: [
      "前端開發",
      "Vue.js",
      "React",
      "TypeScript",
      "UI/UX設計",
      "網頁開發",
      "個人品牌",
      "OrionLabs",
    ],
    author: "Orion",
    image: "/images/og-default.jpg",
    url: "https://orionlabs.dev",
    type: "website",
    siteName: "OrionLabs",
    locale: "zh_TW",
    twitterCard: "summary_large_image",
    twitterSite: "@orionlabs_dev",
    twitterCreator: "@orion_dev",
    noindex: false,
    nofollow: false,
    canonical: "",
  };

export function useSEO(initialData?: Partial<SEOData>) {
  const route = useRoute();
  const seoData = ref<SEOData>({ ...DEFAULT_SEO, ...initialData });

  // 計算完整的 URL
  const fullUrl = computed(() => {
    if (seoData.value.url) {
      return seoData.value.url;
    }
    return `${DEFAULT_SEO.url}${route.path}`;
  });

  // 計算完整的圖片 URL
  const fullImageUrl = computed(() => {
    const image = seoData.value.image || DEFAULT_SEO.image;
    if (image.startsWith("http")) {
      return image;
    }
    return `${DEFAULT_SEO.url}${image}`;
  });

  // 計算完整標題
  const fullTitle = computed(() => {
    if (!seoData.value.title) return DEFAULT_SEO.title;
    if (seoData.value.title.includes("OrionLabs")) {
      return seoData.value.title;
    }
    return `${seoData.value.title} | OrionLabs`;
  });

  // 更新 Meta 標籤
  const updateMetaTags = () => {
    // 更新標題
    document.title = fullTitle.value;

    // 移除現有的 meta 標籤
    const existingMetas = document.querySelectorAll("meta[data-seo]");
    existingMetas.forEach((meta) => meta.remove());

    // 基礎 Meta 標籤
    setMetaTag("description", seoData.value.description || DEFAULT_SEO.description);
    setMetaTag("keywords", seoData.value.keywords?.join(", ") || DEFAULT_SEO.keywords.join(", "));
    setMetaTag("author", seoData.value.author || DEFAULT_SEO.author);

    // Robots 標籤
    const robotsContent = [];
    if (seoData.value.noindex) robotsContent.push("noindex");
    if (seoData.value.nofollow) robotsContent.push("nofollow");
    if (robotsContent.length === 0) robotsContent.push("index", "follow");
    setMetaTag("robots", robotsContent.join(", "));

    // Canonical URL
    if (seoData.value.canonical || fullUrl.value) {
      setLinkTag("canonical", seoData.value.canonical || fullUrl.value);
    }

    // Open Graph 標籤
    setMetaProperty("og:title", fullTitle.value);
    setMetaProperty("og:description", seoData.value.description || DEFAULT_SEO.description);
    setMetaProperty("og:image", fullImageUrl.value);
    setMetaProperty("og:url", fullUrl.value);
    setMetaProperty("og:type", seoData.value.type || DEFAULT_SEO.type);
    setMetaProperty("og:site_name", seoData.value.siteName || DEFAULT_SEO.siteName);
    setMetaProperty("og:locale", seoData.value.locale || DEFAULT_SEO.locale);

    // 文章特定的 OG 標籤
    if (seoData.value.type === "article") {
      if (seoData.value.publishedTime) {
        setMetaProperty("article:published_time", seoData.value.publishedTime);
      }
      if (seoData.value.modifiedTime) {
        setMetaProperty("article:modified_time", seoData.value.modifiedTime);
      }
      if (seoData.value.section) {
        setMetaProperty("article:section", seoData.value.section);
      }
      if (seoData.value.tags) {
        seoData.value.tags.forEach((tag) => {
          setMetaProperty("article:tag", tag);
        });
      }
      setMetaProperty("article:author", seoData.value.author || DEFAULT_SEO.author);
    }

    // Twitter Card 標籤
    setMetaTag("twitter:card", seoData.value.twitterCard || DEFAULT_SEO.twitterCard, "name");
    setMetaTag("twitter:site", seoData.value.twitterSite || DEFAULT_SEO.twitterSite, "name");
    setMetaTag(
      "twitter:creator",
      seoData.value.twitterCreator || DEFAULT_SEO.twitterCreator,
      "name",
    );
    setMetaTag("twitter:title", fullTitle.value, "name");
    setMetaTag("twitter:description", seoData.value.description || DEFAULT_SEO.description, "name");
    setMetaTag("twitter:image", fullImageUrl.value, "name");
  };

  // 設定 Meta 標籤輔助函數
  const setMetaTag = (name: string, content: string, attribute: string = "name") => {
    if (!content) return;

    let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
    if (meta) {
      meta.content = content;
    } else {
      meta = document.createElement("meta");
      meta.setAttribute(attribute, name);
      meta.content = content;
      meta.setAttribute("data-seo", "true");
      document.head.appendChild(meta);
    }
  };

  // 設定 OG Property 標籤
  const setMetaProperty = (property: string, content: string) => {
    if (!content) return;

    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (meta) {
      meta.content = content;
    } else {
      meta = document.createElement("meta");
      meta.setAttribute("property", property);
      meta.content = content;
      meta.setAttribute("data-seo", "true");
      document.head.appendChild(meta);
    }
  };

  // 設定 Link 標籤
  const setLinkTag = (rel: string, href: string) => {
    if (!href) return;

    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    if (link) {
      link.href = href;
    } else {
      link = document.createElement("link");
      link.rel = rel;
      link.href = href;
      link.setAttribute("data-seo", "true");
      document.head.appendChild(link);
    }
  };

  // 更新 SEO 資料
  const updateSEO = (newData: Partial<SEOData>) => {
    seoData.value = { ...seoData.value, ...newData };
  };

  // 監聽資料變化
  watch(seoData, updateMetaTags, { deep: true });

  // 監聽路由變化
  watch(
    () => route.path,
    () => {
      updateMetaTags();
    },
  );

  // 組件掛載時更新
  onMounted(() => {
    updateMetaTags();
  });

  // 清理函數
  onUnmounted(() => {
    // 清理由 SEO 組件新增的標籤
    const seoTags = document.querySelectorAll('[data-seo="true"]');
    seoTags.forEach((tag) => tag.remove());
  });

  return {
    seoData: computed(() => seoData.value),
    fullTitle,
    fullUrl,
    fullImageUrl,
    updateSEO,
    updateMetaTags,
  };
}

// 結構化資料 (JSON-LD) 功能
export function useStructuredData() {
  const addStructuredData = (data: Record<string, unknown>) => {
    // 移除現有的結構化資料
    const existing = document.querySelector('script[type="application/ld+json"][data-structured]');
    if (existing) {
      existing.remove();
    }

    // 新增結構化資料
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-structured", "true");
    script.textContent = JSON.stringify(data, null, 2);
    document.head.appendChild(script);
  };

  // 個人/組織結構化資料
  const addPersonSchema = (data: {
    name: string;
    jobTitle: string;
    url: string;
    image?: string;
    email?: string;
    sameAs?: string[];
    worksFor?: {
      name: string;
      url: string;
    };
  }) => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: data.name,
      jobTitle: data.jobTitle,
      url: data.url,
      image: data.image,
      email: data.email,
      sameAs: data.sameAs,
      worksFor: data.worksFor,
    };
    addStructuredData(schema);
  };

  // 文章結構化資料
  const addArticleSchema = (data: {
    headline: string;
    description: string;
    image: string;
    datePublished: string;
    dateModified?: string;
    author: {
      name: string;
      url: string;
    };
    publisher: {
      name: string;
      logo: string;
    };
    url: string;
    keywords?: string[];
  }) => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: data.headline,
      description: data.description,
      image: data.image,
      datePublished: data.datePublished,
      dateModified: data.dateModified || data.datePublished,
      author: {
        "@type": "Person",
        name: data.author.name,
        url: data.author.url,
      },
      publisher: {
        "@type": "Organization",
        name: data.publisher.name,
        logo: {
          "@type": "ImageObject",
          url: data.publisher.logo,
        },
      },
      url: data.url,
      keywords: data.keywords,
    };
    addStructuredData(schema);
  };

  // 網站結構化資料
  const addWebsiteSchema = (data: {
    name: string;
    url: string;
    description: string;
    author: {
      name: string;
      url: string;
    };
    potentialAction?: {
      target: string;
      queryInput: string;
    };
  }) => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: data.name,
      url: data.url,
      description: data.description,
      author: {
        "@type": "Person",
        name: data.author.name,
        url: data.author.url,
      },
      potentialAction: data.potentialAction
        ? {
            "@type": "SearchAction",
            target: data.potentialAction.target,
            "query-input": data.potentialAction.queryInput,
          }
        : undefined,
    };
    addStructuredData(schema);
  };

  // 清理結構化資料
  const removeStructuredData = () => {
    const existing = document.querySelector('script[type="application/ld+json"][data-structured]');
    if (existing) {
      existing.remove();
    }
  };

  return {
    addStructuredData,
    addPersonSchema,
    addArticleSchema,
    addWebsiteSchema,
    removeStructuredData,
  };
}
