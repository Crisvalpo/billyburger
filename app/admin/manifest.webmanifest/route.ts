import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: 'BillyBurger | Panel de Control Admin',
    short_name: 'Billy Admin',
    description: 'Panel privado de administración y gestión para dueños de Billy Burger',
    start_url: '/admin',
    scope: '/admin',
    display: 'standalone',
    background_color: '#090a0d',
    theme_color: '#12141c',
    orientation: 'any',
    icons: [
      {
        src: '/icon-admin-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-admin-512.png',
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
