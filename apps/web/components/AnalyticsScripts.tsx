'use client';

import Script from 'next/script';
import { GA_MEASUREMENT_ID, META_PIXEL_ID } from '../lib/analytics';

export function AnalyticsScripts() {
  return (
    <>
      {/* Google Analytics 4 & Google Ads Optimization */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
                send_page_view: true
              });
            `}
          </Script>
        </>
      )}

      {/* Meta Ads (Meta Pixel) Optimization */}
      {META_PIXEL_ID && (
        <>
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* Google Search Rich Results: Schema.org JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'SoftwareApplication',
                '@id': 'https://armelis.dev/#software',
                name: 'Armelis',
                applicationCategory: 'SecurityApplication',
                operatingSystem: 'Windows 10+, macOS 12+, Linux, Docker, Web',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock'
                },
                description:
                  'Deterministic attack path intelligence and choke-point defense. Correlates AST syntax trees, CVEs, and network egress to sever the single vulnerable link that breaks the entire breach trajectory.',
                softwareVersion: '0.1.0',
                author: {
                  '@type': 'Person',
                  name: 'Johan Vasquez',
                  url: 'https://github.com/Johanvasquezdev'
                },
                license: 'https://opensource.org/licenses/MIT',
                downloadUrl: 'https://github.com/Johanvasquezdev/armelis/releases'
              },
              {
                '@type': 'WebSite',
                '@id': 'https://armelis.dev/#website',
                url: 'https://armelis.dev',
                name: 'Armelis Application Security',
                publisher: {
                  '@type': 'Person',
                  name: 'Johan Vasquez'
                },
                inLanguage: ['en', 'es']
              },
              {
                '@type': 'Organization',
                '@id': 'https://armelis.dev/#organization',
                name: 'Armelis',
                url: 'https://armelis.dev',
                logo: 'https://armelis.dev/icon.png',
                founder: {
                  '@type': 'Person',
                  name: 'Johan Vasquez'
                }
              }
            ]
          })
        }}
      />
    </>
  );
}
