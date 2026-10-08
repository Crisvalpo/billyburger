const CACHE_NAME = 'billyburger-pwa-v2';

const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/admin/manifest.webmanifest',
  '/tv/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-admin-192.png',
  '/icon-admin-512.png',
  '/icon-tv-192.png',
  '/icon-tv-512.png',
  '/images/logo.png',
  '/images/logo-icon.png',
  '/images/logo-text.png',
  '/images/madera-bg.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => console.warn('Cache assets error:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') return;

  // Ignorar llamadas a la API y Supabase para tener siempre datos frescos
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guardar copia en cache de assets estáticos
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
