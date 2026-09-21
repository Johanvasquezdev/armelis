import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Armelis',
    short_name: 'Armelis',
    description: 'Application Security Intelligence for AI-Assisted Teams & SOC Analysts.',
    start_url: '/',
    display: 'standalone',
    background_color: '#040711',
    theme_color: '#040711',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  };
}
