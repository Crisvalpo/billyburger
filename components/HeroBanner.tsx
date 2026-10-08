'use client';

import React from 'react';
import Image from 'next/image';

interface HeroBannerProps {
  portadaUrl?: string;
}

export function HeroBanner({ portadaUrl }: HeroBannerProps) {
  return (
    <div className="w-full flex flex-col items-center text-center pb-4">
      {/* 1. TOP WOODEN SIGN / EMBLEM - ANCHO COMPLETO SIN BORDES */}
      <div className="w-full bg-gradient-to-b from-[#2a1708] via-[#1a0e04] to-[#0d0702] py-4 sm:py-5 flex items-center justify-center shadow-2xl border-none">
        <Image
          src="/images/logo-text.png"
          alt="Billy BURGER"
          width={210}
          height={75}
          className="object-contain filter drop-shadow-md"
          priority
        />
      </div>

      {/* 2. HERO PORTADA / BANNER DINÁMICO */}
      {portadaUrl && portadaUrl.trim() !== '' && (
        <div className="relative w-72 h-56 sm:w-84 sm:h-64 my-4 filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.95)] hover:scale-105 transition-transform duration-300">
          <Image
            src={portadaUrl}
            alt="Portada BillyBurger"
            fill
            unoptimized
            className="object-contain"
            priority
          />
        </div>
      )}
    </div>
  );
}
