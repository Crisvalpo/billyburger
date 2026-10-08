import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Billy TV | Menuboard Digital',
  description: 'Cartelería digital en alta resolución para pantallas de Billy Burger',
  manifest: '/tv/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Billy TV',
  },
  icons: {
    icon: '/icon-tv-512.png',
    apple: '/icon-tv-512.png',
  },
};

export default function TVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <head>
        <link rel="manifest" href="/tv/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icon-tv-512.png" />
      </head>
      {children}
    </>
  );
}
