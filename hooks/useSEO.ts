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
export function useSEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  article,
  noIndex = false,
}: SEOProps = {}) {
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
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:type', ogType, true);
    
    if (canonical) {
      setMetaTag('og:url', canonical, true);
      setLinkTag('canonical', canonical);
    }

    // Twitter
    setMetaTag('twitter:title', title, true);
    setMetaTag('twitter:description', description, true);
    setMetaTag('twitter:image', ogImage, true);

    // Article-specific meta (for blog posts)
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
          setMetaTag(`article:tag:${index}`, tag, true);
        });
      }
    }

    // Cleanup function to reset to defaults when component unmounts
    return () => {
      document.title = DEFAULT_TITLE;
      setMetaTag('description', DEFAULT_DESCRIPTION);
      setMetaTag('og:title', DEFAULT_TITLE, true);
      setMetaTag('og:description', DEFAULT_DESCRIPTION, true);
      setMetaTag('og:image', DEFAULT_OG_IMAGE, true);
      setMetaTag('og:type', 'website', true);
      setMetaTag('twitter:title', DEFAULT_TITLE, true);
      setMetaTag('twitter:description', DEFAULT_DESCRIPTION, true);
    };
  }, [title, description, canonical, ogImage, ogType, article, noIndex]);
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
