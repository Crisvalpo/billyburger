'use client';

import { useEffect } from 'react';

/**
 * Componente para evitar el zoom y los gestos de acercamiento (pinch-to-zoom y double-tap zoom)
 * en dispositivos móviles (iOS Safari, Android Chrome) y navegadores web.
 */
export function PreventZoom() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Prevenir gestos de zoom de iOS Safari (gesturestart / gesturechange / gestureend)
    const handleGesture = (e: Event) => {
      e.preventDefault();
    };

    // 2. Prevenir pinch-to-zoom multitouch (2 o más dedos)
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // 3. Prevenir doble toque rápido para hacer zoom (double-tap to zoom)
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      // Permitir interacción normal en inputs, textareas y selects
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      );
      if (isInput) return;

      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // 4. Prevenir zoom con rueda del mouse + Ctrl en escritorio o laptops
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    // 5. Prevenir atajos de teclado Ctrl + / Ctrl - / Ctrl 0
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
        e.preventDefault();
      }
    };

    // Registrar listeners con opciones no pasivas donde sea necesario
    document.addEventListener('gesturestart', handleGesture, { passive: false } as any);
    document.addEventListener('gesturechange', handleGesture, { passive: false } as any);
    document.addEventListener('gestureend', handleGesture, { passive: false } as any);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('gesturestart', handleGesture as any);
      document.removeEventListener('gesturechange', handleGesture as any);
      document.removeEventListener('gestureend', handleGesture as any);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
