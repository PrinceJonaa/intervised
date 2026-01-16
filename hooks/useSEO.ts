import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  noIndex?: boolean;
}

const BASE_URL = 'https://intervised.com';
const DEFAULT_TITLE = 'Intervised | Mutually Envisioned - Creative & Technology Studio';
const DEFAULT_DESCRIPTION = 'Premium creative and technology studio offering web development, brand design, AI integration, and digital strategy services.';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * Custom hook for managing dynamic SEO meta tags
 * Updates document head without external dependencies (React 19 compatible)
 */
// Enhanced SEO hook with full Open Graph Protocol support
export function useSEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = 'Intervised - Mutually Envisioned',
  ogType = 'website',
  ogSiteName = 'Intervised',
  ogLocale = 'en_US',
  article,
  noIndex = false,
}: SEOProps & {
  ogImageAlt?: string;
  ogSiteName?: string;
  ogLocale?: string;
} = {}) {
  useEffect(() => {
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

    // Primary meta tags
    setMetaTag('title', title);
    setMetaTag('description', description);
    setMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:url', canonical || window.location.href, true);
    setMetaTag('og:site_name', ogSiteName, true);
    setMetaTag('og:locale', ogLocale, true);
    setMetaTag('og:type', ogType, true);

    // OG Image Structured Properties
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:image:alt', ogImageAlt, true);
    // Standard social card size
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    setMetaTag('og:image:type', 'image/png', true);

    if (canonical) {
      setLinkTag('canonical', canonical);
    }

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image', false); // Use standard name for twitter:card
    setMetaTag('twitter:title', title, false);
    setMetaTag('twitter:description', description, false);
    setMetaTag('twitter:image', ogImage, false);

    // Article-specific meta
    if (ogType === 'article' && article) {
      if (article.publishedTime) {
        setMetaTag('article:published_time', article.publishedTime, true);
      }
      if (article.modifiedTime) {
        setMetaTag('article:modified_time', article.modifiedTime, true);
      }
      if (article.author) {
        setMetaTag('article:author', article.author, true);
      }
      if (article.tags) {
        article.tags.forEach((tag, index) => {
          setMetaTag(`article:tag`, tag, true); // Multiple tags support
        });
      }

      // JSON-LD Structured Data for Rich Snippets
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": description,
        "image": ogImage,
        "datePublished": article.publishedTime,
        "dateModified": article.modifiedTime || article.publishedTime,
        "author": {
          "@type": "Person",
          "name": article.author || "Intervised Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Intervised",
          "logo": {
            "@type": "ImageObject",
            "url": `${BASE_URL}/logo.png`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonical || window.location.href
        }
      };

      // Inject or update JSON-LD script
      let ldScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!ldScript) {
        ldScript = document.createElement('script');
        ldScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(structuredData);
    }

    // Cleanup
    return () => {
      document.title = DEFAULT_TITLE;
      // Remove JSON-LD on cleanup
      const ldScript = document.querySelector('script[type="application/ld+json"]');
      if (ldScript) ldScript.remove();
    };
  }, [title, description, canonical, ogImage, ogType, ogSiteName, ogLocale, article, noIndex]);
}

// Pre-defined SEO configs for each page
export const SEO_CONFIG = {
  home: {
    title: 'Intervised | Mutually Envisioned - Creative & Technology Studio',
    description: 'Premium creative and technology studio offering web development, brand design, AI integration, and digital strategy services. Transform your vision into reality.',
    canonical: BASE_URL,
  },
  services: {
    title: 'Services | Intervised - Web Development, Brand Design & AI Integration',
    description: 'Explore our comprehensive digital services including custom web development, brand design, AI chatbot integration, content creation, and growth strategy.',
    canonical: `${BASE_URL}/services`,
  },
  team: {
    title: 'Our Team | Intervised - Meet the Creators Behind Your Vision',
    description: 'Meet the talented team at Intervised. Creative directors, developers, and strategists dedicated to transforming your digital presence.',
    canonical: `${BASE_URL}/team`,
  },
  blog: {
    title: 'Blog | Intervised - Insights on Design, Technology & Strategy',
    description: 'Read our latest insights on web development, brand design, AI integration, and digital strategy. Expert articles from the Intervised team.',
    canonical: `${BASE_URL}/blog`,
  },
  contact: {
    title: 'Contact Us | Intervised - Start Your Project Today',
    description: 'Get in touch with Intervised to discuss your project. We\'re here to help transform your vision into a stunning digital reality.',
    canonical: `${BASE_URL}/contact`,
  },
  chat: {
    title: 'AI Chat | Intervised - Ask Our AI Assistant',
    description: 'Chat with our AI assistant to learn more about our services, get recommendations, and start your project journey.',
    canonical: `${BASE_URL}/chat`,
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
  };
}

export default useSEO;
