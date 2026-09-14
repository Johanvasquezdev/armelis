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
    default: 'CyberScan | Security intelligence for modern applications',
    template: '%s | CyberScan'
  },
  description: 'Turn security findings into context, attack paths, impact, and remediation priorities.',
  applicationName: 'CyberScan',
  keywords: ['application security', 'security graph', 'attack paths', 'DevSecOps', 'vulnerability management'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'CyberScan',
    title: 'CyberScan | Security intelligence for modern applications',
    description: 'Map the attack paths. Find the real risks. Secure what matters.',
    url: siteUrl,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'CyberScan security intelligence' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CyberScan | Security intelligence for modern applications',
    description: 'Map the attack paths. Find the real risks. Secure what matters.',
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
