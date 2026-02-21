import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  pageType?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'FAQPage';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  faq?: Array<{ question: string; answer: string }>;
  customSchemas?: object[];
  noIndex?: boolean;
  // New schema support
  breadcrumbs?: readonly { readonly name: string; readonly url: string }[];
  service?: {
    name: string;
    description: string;
    provider?: string;
    areaServed?: string[];
    offers?: Array<{ name: string; price?: number }>;
  };
}

const BASE_URL = 'https://intervised.com';
const DEFAULT_TITLE = 'Intervised LLC | Mutually Envisioned - Creative & Technology Studio';
const DEFAULT_DESCRIPTION = 'Premium creative and technology studio offering web development, brand design, AI integration, and digital strategy services.';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

const normalizePath = (pathname: string): string => {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
};

const normalizeCanonicalUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const normalizedPath = normalizePath(parsed.pathname);
    return `${parsed.origin}${normalizedPath}${parsed.search}`;
  } catch {
    return url;
  }
};

const resolveCanonicalUrl = (canonical?: string): string => {
  if (canonical) return normalizeCanonicalUrl(canonical);
  if (typeof window === 'undefined') return BASE_URL;
  return `${BASE_URL}${normalizePath(window.location.pathname)}`;
};

const toIsoDate = (value?: string): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

/**
 * Custom hook for managing dynamic SEO meta tags
 * Updates document head without external dependencies (React 19 compatible)
 * Supports Organization, Service, Breadcrumb, and Article schemas
 */
// Enhanced SEO hook with full Open Graph Protocol support
export function useSEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = 'Intervised - Mutually Envisioned',
  ogType = 'website',
  pageType = 'WebPage',
  ogSiteName = 'Intervised',
  ogLocale = 'en_US',
  article,
  faq,
  customSchemas,
  noIndex = false,
  breadcrumbs,
  service,
}: SEOProps & {
  ogImageAlt?: string;
  ogSiteName?: string;
  ogLocale?: string;
} = {}) {
  useEffect(() => {
    const canonicalUrl = resolveCanonicalUrl(canonical);

    // Update title
    document.title = title;

    // Helper to update or create meta tag
    const setMetaTag = (property: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${property}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, property);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Helper to update or create link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);

      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }

      element.setAttribute('href', href);
    };

    // Helper to set multiple property meta tags (e.g., article:tag)
    const setMultiPropertyMeta = (property: string, values: string[] = []) => {
      document.querySelectorAll(`meta[property="${property}"][data-seo-managed="true"]`).forEach((el) => el.remove());
      values.filter(Boolean).forEach((value) => {
        const element = document.createElement('meta');
        element.setAttribute('property', property);
        element.setAttribute('content', value);
        element.setAttribute('data-seo-managed', 'true');
        document.head.appendChild(element);
      });
    };

    // Helper to inject JSON-LD script with ID
    const injectJsonLd = (id: string, data: object) => {
      let ldScript = document.querySelector(`script[data-seo-id="${id}"]`) as HTMLScriptElement;
      if (!ldScript) {
        ldScript = document.createElement('script');
        ldScript.setAttribute('type', 'application/ld+json');
        ldScript.setAttribute('data-seo-id', id);
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(data);
    };

    // Primary meta tags
    setMetaTag('title', title);
    setMetaTag('description', description);
    const robots = noIndex
      ? 'noindex, nofollow, noarchive'
      : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    setMetaTag('robots', robots);
    setMetaTag('googlebot', robots);
    setMetaTag('author', 'Intervised LLC');
    setMetaTag('application-name', 'Intervised');

    // Open Graph
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:site_name', ogSiteName, true);
    setMetaTag('og:locale', ogLocale, true);
    setMetaTag('og:type', ogType, true);

    // OG Image Structured Properties
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:image:secure_url', ogImage, true);
    setMetaTag('og:image:alt', ogImageAlt, true);
    // Standard social card size
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    setMetaTag('og:image:type', 'image/png', true);

    setLinkTag('canonical', canonicalUrl);

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image', false); // Use standard name for twitter:card
    setMetaTag('twitter:url', canonicalUrl, false);
    setMetaTag('twitter:title', title, false);
    setMetaTag('twitter:description', description, false);
    setMetaTag('twitter:image', ogImage, false);
    setMetaTag('twitter:image:alt', ogImageAlt, false);

    // Core page schema for all indexable pages.
    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": pageType,
      "@id": `${canonicalUrl}#webpage`,
      "url": canonicalUrl,
      "name": title,
      "description": description,
      "isPartOf": { "@id": `${BASE_URL}/#website` },
      "about": { "@id": `${BASE_URL}/#organization` },
    };
    injectJsonLd('webpage-schema', webPageSchema);

    // Breadcrumb Schema (Internal Linking Structure)
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.url
        }))
      };
      injectJsonLd('breadcrumb-schema', breadcrumbSchema);
    }

    // Service Schema
    if (service) {
      const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": service.name,
        "description": service.description,
        "provider": {
          "@type": "Organization",
          "name": service.provider || "Intervised LLC",
          "url": BASE_URL
        },
        "areaServed": service.areaServed || ["Brooklyn", "Manhattan", "New York", "NY"],
        ...(service.offers && {
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": `${service.name} Options`,
            "itemListElement": service.offers.map(offer => ({
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": offer.name
              },
              ...(offer.price && { "price": offer.price, "priceCurrency": "USD" })
            }))
          }
        })
      };
      injectJsonLd('service-schema', serviceSchema);
    } else {
      document.querySelector('script[data-seo-id="service-schema"]')?.remove();
    }

    // FAQ schema for eligible pages.
    if (faq && faq.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faq.map((item) => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer,
          },
        })),
      };
      injectJsonLd('faq-schema', faqSchema);
    } else {
      document.querySelector('script[data-seo-id="faq-schema"]')?.remove();
    }

    // Any additional page-specific schemas.
    if (customSchemas && customSchemas.length > 0) {
      customSchemas.forEach((schema, index) => {
        injectJsonLd(`custom-schema-${index}`, schema);
      });
      document.querySelectorAll('script[data-seo-id^="custom-schema-"]').forEach((el) => {
        const id = el.getAttribute('data-seo-id') || '';
        const index = Number(id.replace('custom-schema-', ''));
        if (Number.isNaN(index) || index >= customSchemas.length) {
          el.remove();
        }
      });
    } else {
      document.querySelectorAll('script[data-seo-id^="custom-schema-"]').forEach((el) => el.remove());
    }

    // Article-specific meta
    if (ogType === 'article' && article) {
      const publishedTime = toIsoDate(article.publishedTime);
      const modifiedTime = toIsoDate(article.modifiedTime) || publishedTime;

      if (publishedTime) {
        setMetaTag('article:published_time', publishedTime, true);
      }
      if (modifiedTime) {
        setMetaTag('article:modified_time', modifiedTime, true);
      }
      if (article.author) {
        setMetaTag('article:author', article.author, true);
      }
      setMultiPropertyMeta('article:tag', article.tags || []);

      // JSON-LD Structured Data for Rich Snippets
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": description,
        "image": ogImage,
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "author": {
          "@type": "Person",
          "name": article.author || "Intervised Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Intervised",
          "logo": {
            "@type": "ImageObject",
            "url": DEFAULT_OG_IMAGE
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl
        }
      };

      injectJsonLd('article-schema', structuredData);
    } else {
      setMultiPropertyMeta('article:tag', []);
      document.querySelector('script[data-seo-id="article-schema"]')?.remove();
    }

    // Cleanup
    return () => {
      document.title = DEFAULT_TITLE;
      // Remove dynamic JSON-LD on cleanup
      document.querySelectorAll('script[data-seo-id]').forEach(el => el.remove());
    };
  }, [title, description, canonical, ogImage, ogType, pageType, ogSiteName, ogLocale, article, faq, customSchemas, noIndex, breadcrumbs, service]);
}

// Pre-defined SEO configs for each page
export const SEO_CONFIG = {
  home: {
    title: 'Intervised LLC | Mutually Envisioned - Creative & Technology Studio',
    description: 'Premium creative and technology studio offering web development, brand design, AI integration, and digital strategy services. Transform your vision into reality.',
    canonical: BASE_URL,
    pageType: 'WebPage',
    breadcrumbs: [
      { name: 'Home', url: BASE_URL }
    ],
  },
  services: {
    title: 'Services | Intervised - Web Development, Brand Design & AI Integration',
    description: 'Explore our comprehensive digital services including custom web development, brand design, AI chatbot integration, content creation, and growth strategy.',
    canonical: `${BASE_URL}/services`,
    pageType: 'CollectionPage',
    breadcrumbs: [
      { name: 'Home', url: BASE_URL },
      { name: 'Services', url: `${BASE_URL}/services` }
    ],
    service: {
      name: 'Intervised Services',
      description: 'Creative and technology services for brands, creators, and ministries.',
      provider: 'Intervised LLC',
      areaServed: ['United States', 'Worldwide'],
      offers: [
        { name: 'Web Development' },
        { name: 'Brand Design' },
        { name: 'AI Integration' },
        { name: 'Digital Strategy' },
      ],
    },
  },
  team: {
    title: 'Our Team | Intervised - Meet the Creators Behind Your Vision',
    description: 'Meet the talented team at Intervised. Creative directors, developers, and strategists dedicated to transforming your digital presence.',
    canonical: `${BASE_URL}/team`,
    pageType: 'AboutPage',
    breadcrumbs: [
      { name: 'Home', url: BASE_URL },
      { name: 'Team', url: `${BASE_URL}/team` }
    ],
    customSchemas: [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Intervised Team",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": { "@type": "Person", "name": "Prince Jona" },
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": { "@type": "Person", "name": "Reina Hondo" },
          },
        ],
      },
    ],
  },
  about: {
    title: 'About Intervised | A Shared Vision for Creative Space',
    description: 'Learn why Intervised exists: to give creators, ministries, and teams a grounded space to do their best work with strong systems and honest collaboration.',
    canonical: `${BASE_URL}/about`,
    pageType: 'AboutPage',
    breadcrumbs: [
      { name: 'Home', url: BASE_URL },
      { name: 'About', url: `${BASE_URL}/about` }
    ],
    customSchemas: [
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": `${BASE_URL}/about#about`,
        "url": `${BASE_URL}/about`,
        "name": "About Intervised",
        "description": "Intervised is a shared creative and technology studio vision focused on helping people do their best work.",
        "about": { "@id": `${BASE_URL}/#organization` },
      },
      {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "@id": `${BASE_URL}/about#vision`,
        "name": "Intervised Vision",
        "creator": [
          { "@type": "Person", "name": "Prince Jona" },
          { "@type": "Person", "name": "Reina Hondo" },
        ],
        "publisher": { "@id": `${BASE_URL}/#organization` },
      },
    ],
  },
  blog: {
    title: 'Blog | Intervised - Insights on Design, Technology & Strategy',
    description: 'Read our latest insights on web development, brand design, AI integration, and digital strategy. Expert articles from the Intervised team.',
    canonical: `${BASE_URL}/blog`,
    pageType: 'CollectionPage',
    breadcrumbs: [
      { name: 'Home', url: BASE_URL },
      { name: 'Blog', url: `${BASE_URL}/blog` }
    ],
  },
  contact: {
    title: 'Contact Us | Intervised - Start Your Project Today',
    description: 'Get in touch with Intervised to discuss your project. We\'re here to help transform your vision into a stunning digital reality.',
    canonical: `${BASE_URL}/contact`,
    pageType: 'ContactPage',
    breadcrumbs: [
      { name: 'Home', url: BASE_URL },
      { name: 'Contact', url: `${BASE_URL}/contact` }
    ],
    customSchemas: [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "@id": `${BASE_URL}/contact#contact-page`,
        "url": `${BASE_URL}/contact`,
        "name": "Contact Intervised",
        "description": "Contact Intervised for creative and technology projects.",
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "contactType": "sales",
            "email": "contact@intervised.com",
            "availableLanguage": ["en"],
          },
        ],
      },
    ],
  },
  chat: {
    title: 'AI Chat | Intervised - Ask Our AI Assistant',
    description: 'Chat with our AI assistant to learn more about our services, get recommendations, and start your project journey.',
    canonical: `${BASE_URL}/chat`,
    pageType: 'WebPage',
    noIndex: true, // Don't index the chat page
  },
} as const;

// Helper to generate blog post SEO
export function getBlogPostSEO(post: {
  title: string;
  excerpt: string;
  slug: string;
  author?: string;
  publishedAt?: string;
  tags?: string[];
  featuredImage?: string;
}): SEOProps {
  return {
    title: `${post.title} | Intervised Blog`,
    description: post.excerpt,
    canonical: `${BASE_URL}/blog/${post.slug}`,
    ogType: 'article',
    ogImage: post.featuredImage || DEFAULT_OG_IMAGE,
    article: {
      publishedTime: post.publishedAt,
      author: post.author,
      tags: post.tags,
    },
    breadcrumbs: [
      { name: 'Home', url: BASE_URL },
      { name: 'Blog', url: `${BASE_URL}/blog` },
      { name: post.title, url: `${BASE_URL}/blog/${post.slug}` }
    ],
  };
}

export default useSEO;
