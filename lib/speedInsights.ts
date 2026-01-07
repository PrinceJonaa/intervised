/**
 * Speed Insights Initialization Utility
 *
 * This module handles the initialization of Vercel Speed Insights for web performance monitoring.
 * Speed Insights tracks Core Web Vitals and other performance metrics to help identify and fix
 * performance issues on your website.
 *
 * For usage, import the SpeedInsights component and add it to your app:
 * ```tsx
 * import { SpeedInsights } from '@vercel/speed-insights/react';
 * 
 * export default function App() {
 *   return (
 *     <div>
 *       <YourContent />
 *       <SpeedInsights />
 *     </div>
 *   );
 * }
 * ```
 *
 * For more information, see:
 * https://vercel.com/docs/speed-insights
 */

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
