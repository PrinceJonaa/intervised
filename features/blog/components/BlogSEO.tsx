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

    useEffect(() => {
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

        // Update OG/Twitter meta tags
        const updateMeta = (property: string, content: string) => {
            let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('property', property);
                document.head.appendChild(meta);
            }
            meta.content = content;
        };

        updateMeta('og:type', 'article');
        updateMeta('og:url', postUrl);
        updateMeta('og:title', title);
        updateMeta('og:description', description);
        updateMeta('og:image', imageUrl || defaultImage);
        updateMeta('article:published_time', publishedAt);
        if (updatedAt) updateMeta('article:modified_time', updatedAt);
        if (author) updateMeta('article:author', author);
        tags.forEach((tag, i) => updateMeta(`article:tag:${i}`, tag));

        // Inject Article JSON-LD
        const existingLD = document.querySelector('script[data-blog-seo]');
        if (existingLD) existingLD.remove();

        const jsonLD = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": description,
            "image": imageUrl || defaultImage,
            "datePublished": publishedAt,
            "dateModified": updatedAt || publishedAt,
            "author": {
                "@type": "Person",
                "name": author,
                "url": siteUrl
            },
            "publisher": {
                "@type": "Organization",
                "name": "Intervised",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${siteUrl}/logo.png`
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
            document.title = 'Intervised | Mutually Envisioned';
            const blogLD = document.querySelector('script[data-blog-seo]');
            if (blogLD) blogLD.remove();
        };
    }, [title, description, slug, author, publishedAt, updatedAt, imageUrl, tags, category]);

    return null; // This is a head-only component
};

export default BlogSEO;
