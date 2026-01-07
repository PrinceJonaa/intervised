/**
 * Speed Insights Initialization Utility
 *
 * This module handles the initialization of Vercel Speed Insights for web performance monitoring.
 * It should be called once during app initialization to start tracking Core Web Vitals and other metrics.
 *
 * Usage:
 * ```tsx
 * import { initializeSpeedInsights } from '@/lib/speedInsights';
 * initializeSpeedInsights();
 * ```
 */

/**
 * Initialize Vercel Speed Insights for performance monitoring
 * This function should be called once at app startup, preferably before any rendering occurs
 * It only initializes on the client-side
 */
export async function initializeSpeedInsights(): Promise<void> {
  // Only initialize on client-side
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Dynamically import Speed Insights to avoid blocking app load
    const { injectSpeedInsights } = await import('@vercel/speed-insights');
    
    // Inject the tracking script
    injectSpeedInsights();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✓ Vercel Speed Insights initialized successfully');
    }
  } catch (error) {
    // Speed Insights is optional for app functionality, log warning but don't fail
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠ Failed to initialize Vercel Speed Insights:', error);
    }
  }
}

/**
 * Verify Speed Insights is loaded
 * Checks if the Speed Insights tracking script has been injected into the page
 */
export function isSpeedInsightsLoaded(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check if the Speed Insights script has been injected
  const scripts = document.querySelectorAll('script');
  return Array.from(scripts).some(script =>
    script.src.includes('/_vercel/speed-insights/script.js')
  );
}
