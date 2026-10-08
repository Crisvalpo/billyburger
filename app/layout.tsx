import type { Metadata, Viewport } from 'next';
import './globals.css';

import { PwaRegister } from '@/components/PwaRegister';

export const viewport: Viewport = {
  themeColor: '#170d05',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'BillyBurger | Carta Digital & Menú Online',
  description:
    'Las mejores hamburguesas, sándwiches, chorrillanas y completos de Curauma. Pide directo al WhatsApp +56 9 3255 3527.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BillyBurger',
  },
  icons: {
    icon: '/icon-512.png',
    apple: '/icon-512.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark h-full antialiased">
      <head>
        <link rel="icon" href="/images/logo.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0b0c0f] text-zinc-100">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
