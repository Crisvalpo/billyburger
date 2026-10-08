const CACHE_NAME = 'billyburger-pwa-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

// No interceptar peticiones con fetch() roto para que Next.js maneje sus bundles nativamente sin fallar
self.addEventListener('fetch', () => {
  return;
});
