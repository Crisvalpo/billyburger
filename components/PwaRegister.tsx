'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // 1. Limpiar caches viejas que hayan quedado corruptas
      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            if (key.includes('billyburger-pwa-v2') || key.includes('billyburger-pwa-v1')) {
              caches.delete(key);
            }
          }
        });
      }

      // 2. Forzar actualización inmediata del Service Worker
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.update().catch(() => {});
        }
      });

      if (window.location.protocol === 'https:') {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            reg.update().catch(() => {});
          })
          .catch((err) => console.warn('PWA ServiceWorker error:', err));
      }
    }
  }, []);

  return null;
}
