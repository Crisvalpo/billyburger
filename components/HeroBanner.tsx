'use client';

import React from 'react';
import Image from 'next/image';
import { Phone, ShoppingBag, ArrowDown } from 'lucide-react';
import { Categoria } from '@/lib/types';
import { useCart } from './CartContext';

interface HeroBannerProps {
  categorias: Categoria[];
  onSelectCategoria: (slug: string) => void;
  portadaUrl?: string;
}

export function HeroBanner({ categorias, onSelectCategoria, portadaUrl }: HeroBannerProps) {
  const { totalItems, setIsOpen } = useCart();

  const handleCtaClick = () => {
    if (totalItems > 0) {
      setIsOpen(true);
    } else {
      // Scroll al primer ítem o categoría
      if (categorias[0]) {
        onSelectCategoria(categorias[0].slug);
      }
    }
  };

  return (
    <div className="flex flex-col items-center text-center pt-6 pb-4 px-4">
      {/* 1. TOP WOODEN SIGN / EMBLEM */}
      <div className="relative px-8 py-3 rounded-3xl bg-gradient-to-b from-[#3a200b] via-[#241306] to-[#120902] border-2 border-amber-500/70 shadow-[0_8px_25px_rgba(0,0,0,0.9)] mb-4">
        <Image
          src="/images/logo-text.png"
          alt="Billy BURGER"
          width={180}
          height={65}
          className="object-contain filter drop-shadow-md"
          priority
        />
      </div>

      {/* 2. HERO PORTADA / BANNER DINÁMICO */}
      {portadaUrl && portadaUrl.trim() !== '' && (
        <div className="relative w-72 h-56 sm:w-80 sm:h-64 my-2 filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.95)] hover:scale-105 transition-transform duration-300">
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

      {/* 3. BOTÓN PRINCIPAL DE ORDEN INTELIGENTE */}
      <div className="my-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleCtaClick}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black font-black text-sm uppercase tracking-wider flex items-center gap-2.5 shadow-xl shadow-black/80 hover:scale-105 active:scale-95 transition"
        >
          <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
          <span>{totalItems > 0 ? `Ver Mi Orden (${totalItems})` : 'Elegir Menú'}</span>
          {totalItems === 0 && <ArrowDown className="w-4 h-4 ml-0.5" />}
        </button>

        <a
          href="tel:+56932553527"
          className="px-5 py-2.5 rounded-full bg-black/70 hover:bg-black/90 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-2 shadow-lg transition"
        >
          <Phone className="w-4 h-4" />
          <span>+56 9 3255 3527</span>
        </a>
      </div>

      {/* 4. ÍNDICE DE SECCIONES (ESTILO CARTA TRADICIONAL) */}
      <div className="w-full max-w-sm mx-auto my-3 p-3.5 rounded-2xl bg-black/75 backdrop-blur-sm border border-amber-500/30 shadow-2xl">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-2">
          Índice del Menú
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategoria(cat.slug)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-amber-500 hover:text-black text-zinc-200 text-xs font-bold tracking-wide transition text-center border border-white/5"
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
