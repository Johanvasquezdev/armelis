import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hopchain',
    short_name: 'Hopchain',
    description: 'Application Security Intelligence for AI-Assisted Teams & SOC Analysts.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050811',
    theme_color: '#050811',
    icons: []
  };
}
