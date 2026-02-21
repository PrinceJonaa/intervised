/**
 * Prerender Configuration for Intervised
 * 
 * This script prerenders static HTML for SEO-critical routes.
 * Run after building: npm run build && npm run prerender
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Prerenderer from '@prerenderer/prerenderer';
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes to prerender for SEO
const ROUTES_TO_PRERENDER = [
  '/',
  '/services',
  '/team',
  '/about',
  '/blog',
  '/contact',
  '/privacy',
  '/terms',
  // Don't prerender /chat - it's dynamic and noindex
];

async function prerender() {
  const distPath = path.resolve(__dirname, '../dist');
  
  // Check if dist folder exists
  if (!fs.existsSync(distPath)) {
    console.error('Error: dist folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  console.log('🚀 Starting prerendering...');
  console.log(`📁 Output directory: ${distPath}`);
  console.log(`📄 Routes to prerender: ${ROUTES_TO_PRERENDER.join(', ')}`);

  const prerenderer = new Prerenderer({
    staticDir: distPath,
    renderer: new PuppeteerRenderer({
      // Wait for network to be idle (all requests finished)
      renderAfterDocumentEvent: 'DOMContentLoaded',
      // Additional wait time for JS to execute
      renderAfterTime: 2000,
      // Puppeteer launch options
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }),
  });

  try {
    await prerenderer.initialize();

    const renderedRoutes = await prerenderer.renderRoutes(ROUTES_TO_PRERENDER);

    // Write prerendered HTML files
    for (const route of renderedRoutes) {
      const routePath = route.route === '/' ? 'index' : route.route.replace(/^\//, '');
      const outputPath = path.join(distPath, `${routePath}.html`);
      const outputDir = path.dirname(outputPath);

      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write the prerendered HTML
      fs.writeFileSync(outputPath, route.html);
      console.log(`✅ Prerendered: ${routePath}.html`);
    }

    console.log('\n🎉 Prerendering complete!');
  } catch (error) {
    console.error('❌ Prerendering failed:', error);
    process.exit(1);
  } finally {
    await prerenderer.destroy();
  }
}

prerender();
