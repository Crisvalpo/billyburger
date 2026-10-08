'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => console.log('PWA ServiceWorker registrado con éxito:', reg.scope))
          .catch((err) => console.warn('PWA ServiceWorker error:', err));
      });
    }
  }, []);

  return null;
}
