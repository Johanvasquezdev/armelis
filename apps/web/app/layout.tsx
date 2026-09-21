import type { Metadata } from 'next';
import './globals.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/rajdhani/400.css';
import '@fontsource/rajdhani/500.css';
import '@fontsource/rajdhani/600.css';
import '@fontsource/rajdhani/700.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import { AnalyticsScripts } from '../components/AnalyticsScripts';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://armelis.dev';
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const fbDomainVerification = process.env.NEXT_PUBLIC_FB_DOMAIN_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Armelis — Application Security Intelligence & Choke-Point Defense',
    template: '%s | Armelis'
  },
  description:
    'Deterministic attack-path intelligence and choke-point defense. Correlates AST syntax trees, CVEs, and network egress to sever the single vulnerable link that breaks the entire breach trajectory.',
  applicationName: 'Armelis',
  authors: [{ name: 'Johan Vasquez', url: 'https://github.com/Johanvasquezdev' }],
  creator: 'Johan Vasquez',
  publisher: 'Johan Vasquez',
  keywords: [
    'application security',
    'reachability graph',
    'attack path analysis',
    'choke point security',
    'DevSecOps',
    'AST vulnerability analysis',
    'taint analysis',
    'SIEM integration',
    'ArcSight CEF',
    'Elastic ECS',
    'SARIF export',
    'MITRE ATT&CK',
    'vulnerability management',
    'Johan Vasquez',
    'open source appsec',
    'Tauri desktop security'
  ],
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/?lang=en',
      'es-ES': '/?lang=es'
    }
  },
  openGraph: {
    type: 'website',
    siteName: 'Armelis',
    title: 'Armelis — Application Security Intelligence & Choke-Point Defense',
    description:
      'Map the attack path. Kill the breach before compile. 1 correlated deterministic graph instead of 800 unprioritized CVE alerts.',
    url: siteUrl,
    locale: 'en_US',
    alternateLocale: ['es_ES'],
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Armelis application security intelligence graph'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Armelis — Application Security Intelligence & Choke-Point Defense',
    description:
      'Map the attack path. Kill the breach before compile. 1 correlated deterministic graph instead of 800 unprioritized CVE alerts.',
    creator: '@johanvasquezdev',
    images: ['/opengraph-image']
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: googleSiteVerification
  },
  other: fbDomainVerification
    ? {
        'facebook-domain-verification': fbDomainVerification
      }
    : undefined
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={siteUrl} />
      </head>
      <body>
        <AnalyticsScripts />
        {children}
      </body>
    </html>
  );
}
