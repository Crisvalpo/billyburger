import type { Metadata, Viewport } from 'next';
import './globals.css';

import { PwaRegister } from '@/components/PwaRegister';
import { MenuProvider } from '@/lib/store';

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
    icon: '/images/logo-icon.png',
    apple: '/images/logo-icon.png',
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
        <link rel="icon" type="image/png" href="/images/logo-icon.png" />
        <link rel="apple-touch-icon" href="/images/logo-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@700;800;900&family=Montserrat:ital,wght@0,700;0,800;0,900;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0b0c0f] text-zinc-100">
        <PwaRegister />
        <MenuProvider>
          {children}
        </MenuProvider>
      </body>
    </html>
  );
}
