/**
 * Speed Insights Initialization Utility
 *
 * This module handles the initialization of Vercel Speed Insights for web performance monitoring.
 * It should be called once during app initialization to start tracking Core Web Vitals and other metrics.
 *
 * Features:
 * - Tracks Core Web Vitals (LCP, FID, CLS, FCP, TTFB)
 * - Optional beforeSend callback to sanitize URLs before sending data
 * - Client-side only initialization
 * - Development logging for debugging
 *
 * Usage:
 * ```tsx
 * import { initializeSpeedInsights } from '@/lib/speedInsights';
 * initializeSpeedInsights();
 * ```
 */

/**
 * Sanitize URLs by removing query parameters that might contain sensitive information
 * This is called before sending data to Vercel Speed Insights
 *
 * @param data - The Speed Insights data object
 * @returns The sanitized data object
 */
function sanitizeSpeedInsightsData(data: any) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Create a copy to avoid mutating the original
  const sanitized = { ...data };

  // Sanitize URL if present by removing sensitive query parameters
  if (sanitized.url && typeof sanitized.url === 'string') {
    try {
      const url = new URL(sanitized.url, window.location.origin);

      // Remove common sensitive query parameters
      const sensitiveParams = [
        'token',
        'key',
        'secret',
        'api_key',
        'apikey',
        'auth',
        'password',
        'pwd',
        'session',
        'sessionid',
        'sid',
        'user_id',
        'email',
      ];

      sensitiveParams.forEach(param => {
        url.searchParams.delete(param);
      });

      // Update the URL in the sanitized data
      sanitized.url = url.pathname + url.search;
    } catch (error) {
      // If URL parsing fails, log in development and continue
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to parse URL for sanitization:', error);
      }
    }
  }

  return sanitized;
}

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
    // Set up beforeSend callback to sanitize data before sending
    (window as any).speedInsightsBeforeSend = sanitizeSpeedInsightsData;

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
