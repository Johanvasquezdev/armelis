import type { Metadata } from 'next';
import './globals.css';
import '@fontsource/rajdhani/400.css';
import '@fontsource/rajdhani/500.css';
import '@fontsource/rajdhani/600.css';
import '@fontsource/rajdhani/700.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Armelis | Application Security Intelligence for AI-Assisted Teams & SOC Analysts',
    template: '%s | Armelis'
  },
  description: 'See every hop from public entry point to crown-jewel asset — then fix the one link that breaks the chain.',
  applicationName: 'Armelis',
  keywords: ['application security', 'reachability graph', 'attack paths', 'lateral movement', 'DevSecOps', 'vulnerability management', 'AI security'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Armelis',
    title: 'Armelis | Application Security Intelligence for AI-Assisted Teams & SOC Analysts',
    description: 'See every hop from public entry point to crown-jewel asset — then fix the one link that breaks the chain.',
    url: siteUrl,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Armelis application security intelligence' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Armelis | Application Security Intelligence for AI-Assisted Teams & SOC Analysts',
    description: 'See every hop from public entry point to crown-jewel asset — then fix the one link that breaks the chain.',
    images: ['/opengraph-image']
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
