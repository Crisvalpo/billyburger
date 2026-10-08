import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: 'BillyBurger | Cartelería Digital TV',
    short_name: 'Billy TV',
    description: 'Menuboard TV en tiempo real para pantallas de Billy Burger',
    start_url: '/tv',
    scope: '/tv',
    display: 'fullscreen',
    background_color: '#08090d',
    theme_color: '#08090d',
    orientation: 'landscape',
    icons: [
      {
        src: '/icon-tv-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-tv-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
