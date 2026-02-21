/**
 * Blog SEO Component
 * 
 * Injects dynamic Article structured data for individual blog posts
 * to improve Google search indexing and rich snippet display.
 */

import React, { useEffect } from 'react';

interface BlogSEOProps {
    title: string;
    description: string;
    slug: string;
    author: string;
    publishedAt: string;
    updatedAt?: string;
    imageUrl?: string;
    tags?: string[];
    category?: string;
}

export const BlogSEO: React.FC<BlogSEOProps> = ({
    title,
    description,
    slug,
    author,
    publishedAt,
    updatedAt,
    imageUrl,
    tags = [],
    category
}) => {
    const siteUrl = 'https://intervised.com';
    const postUrl = `${siteUrl}/blog/${slug}`;
    const defaultImage = `${siteUrl}/og-image.png`;
    const toIsoDate = (value?: string): string | null => {
        if (!value) return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return null;
        return date.toISOString();
    };

    useEffect(() => {
        const publishedIso = toIsoDate(publishedAt);
        const updatedIso = toIsoDate(updatedAt) || publishedIso;

        // Update document title
        document.title = `${title} | Intervised Blog`;

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', description || title);
        }

        // Add/update canonical link
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = postUrl;

        const updatePropertyMeta = (property: string, content: string) => {
            let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('property', property);
                document.head.appendChild(meta);
            }
            meta.content = content;
        };

        const updateNameMeta = (name: string, content: string) => {
            let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', name);
                document.head.appendChild(meta);
            }
            meta.content = content;
        };

        // Update OG/Twitter meta tags
        updatePropertyMeta('og:type', 'article');
        updatePropertyMeta('og:url', postUrl);
        updatePropertyMeta('og:title', title);
        updatePropertyMeta('og:description', description);
        updatePropertyMeta('og:image', imageUrl || defaultImage);
        updatePropertyMeta('og:image:alt', title);
        updateNameMeta('twitter:card', 'summary_large_image');
        updateNameMeta('twitter:url', postUrl);
        updateNameMeta('twitter:title', title);
        updateNameMeta('twitter:description', description);
        updateNameMeta('twitter:image', imageUrl || defaultImage);

        if (publishedIso) updatePropertyMeta('article:published_time', publishedIso);
        if (updatedIso) updatePropertyMeta('article:modified_time', updatedIso);
        if (author) updatePropertyMeta('article:author', author);

        document.querySelectorAll('meta[property="article:tag"][data-blog-seo-tag="true"]').forEach((el) => el.remove());
        tags.filter(Boolean).forEach((tag) => {
            const tagMeta = document.createElement('meta');
            tagMeta.setAttribute('property', 'article:tag');
            tagMeta.setAttribute('content', tag);
            tagMeta.setAttribute('data-blog-seo-tag', 'true');
            document.head.appendChild(tagMeta);
        });

        // Inject Article JSON-LD
        const existingLD = document.querySelector('script[data-blog-seo]');
        if (existingLD) existingLD.remove();

        const jsonLD = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": title,
            "description": description,
            "image": imageUrl || defaultImage,
            "datePublished": publishedIso,
            "dateModified": updatedIso || publishedIso,
            "author": {
                "@type": "Person",
                "name": author
            },
            "publisher": {
                "@type": "Organization",
                "name": "Intervised LLC",
                "logo": {
                    "@type": "ImageObject",
                    "url": defaultImage
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": postUrl
            },
            "keywords": tags.join(', '),
            "articleSection": category || "Blog"
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-blog-seo', 'true');
        script.textContent = JSON.stringify(jsonLD);
        document.head.appendChild(script);

        // Cleanup on unmount
        return () => {
            document.title = 'Intervised LLC | Mutually Envisioned - Creative & Technology Studio';
            const blogLD = document.querySelector('script[data-blog-seo]');
            if (blogLD) blogLD.remove();
            document.querySelectorAll('meta[property="article:tag"][data-blog-seo-tag="true"]').forEach((el) => el.remove());
        };
    }, [title, description, slug, author, publishedAt, updatedAt, imageUrl, tags, category]);

    return null; // This is a head-only component
};

export default BlogSEO;
