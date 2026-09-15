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
    default: 'Hopchain | Application Security Intelligence for AI-Assisted Teams & SOC Analysts',
    template: '%s | Hopchain'
  },
  description: 'See every hop from public entry point to crown-jewel asset — then fix the one link that breaks the chain.',
  applicationName: 'Hopchain',
  keywords: ['application security', 'reachability graph', 'attack paths', 'lateral movement', 'DevSecOps', 'vulnerability management', 'AI security'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Hopchain',
    title: 'Hopchain | Application Security Intelligence for AI-Assisted Teams & SOC Analysts',
    description: 'See every hop from public entry point to crown-jewel asset — then fix the one link that breaks the chain.',
    url: siteUrl,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Hopchain application security intelligence' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hopchain | Application Security Intelligence for AI-Assisted Teams & SOC Analysts',
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
