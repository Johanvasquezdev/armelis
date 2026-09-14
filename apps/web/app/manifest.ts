import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CyberScan',
    short_name: 'CyberScan',
    description: 'Security intelligence platform for modern applications.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050811',
    theme_color: '#050811',
    icons: []
  };
}
