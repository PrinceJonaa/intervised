/**
 * Dynamic Sitemap Generator for Intervised
 * 
 * Generates sitemap.xml with all static routes and dynamic blog posts.
 * Run: npm run generate-sitemap
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://intervised.com';
const TODAY = new Date().toISOString().split('T')[0];

// Supabase client for fetching blog posts
const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL || 'https://jnfnqtohljybohlcslnm.supabase.co';
const supabaseAnonKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuZm5xdG9obGp5Ym9obGNzbG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NjA1MDksImV4cCI6MjA4MzIzNjUwOX0.1z3v0yieVMz88w3oyccht2zJowHzFEUnfg2tB_5iYmc';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Static routes configuration
const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/services', changefreq: 'monthly', priority: '0.9' },
  { path: '/team', changefreq: 'monthly', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.75' },
  { path: '/blog', changefreq: 'daily', priority: '0.85' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.4' },
  { path: '/terms', changefreq: 'yearly', priority: '0.4' },
];

// Generate URL entry for sitemap
function generateUrlEntry(route) {
  return `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${route.lastmod || TODAY}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
}

// Generate the full sitemap XML
function generateSitemap(routes) {
  const urlEntries = routes.map(generateUrlEntry).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

async function main() {
  console.log('🗺️  Generating sitemap...');

  // Start with static routes
  const allRoutes = [...STATIC_ROUTES];

  // Fetch published blog posts from Supabase
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('status', 'published');

    if (error) {
      console.warn('⚠️  Could not fetch blog posts:', error.message);
    } else if (posts && posts.length > 0) {
      console.log(`📝 Found ${posts.length} published blog posts`);
      posts.forEach(post => {
        allRoutes.push({
          path: `/blog/${post.slug}`,
          changefreq: 'weekly',
          priority: '0.6',
          lastmod: post.updated_at?.split('T')[0] || TODAY,
        });
      });
    }
  } catch (err) {
    console.warn('⚠️  Blog fetch failed:', err.message);
  }

  const sitemap = generateSitemap(allRoutes);

  // Write to public folder
  const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemap);

  console.log(`✅ Sitemap generated with ${allRoutes.length} URLs`);
  console.log(`📁 Output: ${outputPath}`);
}

main().catch(console.error);
