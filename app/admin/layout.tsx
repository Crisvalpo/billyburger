import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Billy Admin | Panel de Control',
  description: 'Administración de menú, pantallas TV y pedidos de Billy Burger',
  manifest: '/admin/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Billy Admin',
  },
  icons: {
    icon: '/icon-admin-512.png',
    apple: '/icon-admin-512.png',
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <head>
        <link rel="manifest" href="/admin/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icon-admin-512.png" />
      </head>
      {children}
    </>
  );
}
