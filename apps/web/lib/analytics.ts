/**
 * Armelis Analytics & Ads Optimization Engine
 * Supports Google Search / Google Ads / GA4 and Meta Ads (Meta Pixel)
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
export const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';

/**
 * Tracks a custom event in both Google Analytics/Ads and Meta Pixel.
 */
export function trackEvent(action: string, category: string, label?: string, value?: number, extra?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // Google Analytics (GA4) / Google Ads
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...extra
    });
  }

  // Meta Pixel Custom Event
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', action, {
      category,
      label,
      value,
      ...extra
    });
  }
}

/**
 * Tracks standard Meta Pixel and Google Ads conversion events.
 */
export function trackConversion(
  eventName: 'Lead' | 'CompleteRegistration' | 'Contact' | 'ViewContent' | 'Search',
  details?: Record<string, any>
) {
  if (typeof window === 'undefined') return;

  // Google Ads / GA4 conversion
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName.toLowerCase(), details);
  }

  // Meta Pixel Standard Event
  if (typeof window.fbq === 'function') {
    window.fbq('track', eventName, details);
  }
}

/**
 * Convenience helper to track user clicking to download installer
 */
export function trackInstallerDownload(platform: 'windows' | 'source' | 'cli') {
  trackConversion('Lead', {
    content_name: 'Armelis Installer Download',
    content_category: 'Software Download',
    platform
  });
  trackEvent('download_installer', 'Conversion', platform);
}

/**
 * Convenience helper to track launching the live web console
 */
export function trackLiveConsoleLaunch(source: string) {
  trackConversion('ViewContent', {
    content_name: 'Armelis Live Interactive Console',
    content_category: 'Product Demo',
    source
  });
  trackEvent('launch_console', 'Engagement', source);
}

/**
 * Convenience helper to track language changes (EN <-> ES)
 */
export function trackLanguageSwitch(newLang: 'en' | 'es') {
  trackEvent('switch_language', 'Localization', newLang);
}

/**
 * Convenience helper to track documentation tab navigation
 */
export function trackDocView(tabName: string) {
  trackEvent('view_doc_tab', 'Documentation', tabName);
}
