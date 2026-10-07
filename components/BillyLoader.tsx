'use client';

import React from 'react';
import Image from 'next/image';

interface BillyLoaderProps {
  size?: number;
  text?: string;
}

export function BillyLoader({ size = 80, text = 'Cargando BillyBurger...' }: BillyLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Container con el círculo animado girando alrededor del logo */}
      <div className="relative flex items-center justify-center" style={{ width: size + 24, height: size + 24 }}>
        {/* Anillo exterior animado (Spin rotatorio con gradiente ámbar) */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-500/60 border-b-orange-500/20 animate-spin" />

        {/* Segundo anillo sutil con pulso */}
        <div className="absolute inset-1.5 rounded-full border border-amber-500/30 animate-pulse" />

        {/* Logo oficial en el centro */}
        <div className="relative" style={{ width: size, height: size }}>
          <Image
            src="/images/29cbf34f55662089f170bbc92c87501d.png"
            alt="BillyBurger Loading"
            fill
            className="object-contain filter drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            priority
          />
        </div>
      </div>

      {text && (
        <p className="text-xs font-black uppercase tracking-widest text-amber-300 animate-pulse drop-shadow">
          {text}
        </p>
      )}
    </div>
  );
}
