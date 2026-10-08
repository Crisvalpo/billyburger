'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Tv, Settings, ShoppingBag } from 'lucide-react';
import { Categoria } from '@/lib/types';
import { useCart } from './CartContext';

interface NavbarProps {
  categorias: Categoria[];
  categoriaActiva: string;
  onSelectCategoria: (slug: string) => void;
}

export function Navbar({ categorias, categoriaActiva, onSelectCategoria }: NavbarProps) {
  const { totalItems, setIsOpen } = useCart();
  return (
    <header className="sticky top-0 z-50 bg-[#140b04]/90 backdrop-blur-md border-b border-amber-600/30 transition-all shadow-2xl">
      {/* Main branding & quick WhatsApp */}
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-10 h-10 rounded-full p-1 bg-gradient-to-tr from-amber-600 to-orange-600 shadow-lg shadow-black/80 group-hover:scale-105 transition flex items-center justify-center">
            <Image
              src="/images/logo-icon.png"
              alt="Billy Burger Logo"
              width={34}
              height={34}
              className="object-contain"
            />
          </div>
          <div>
            <Image
              src="/images/logo-text.png"
              alt="Billy BURGER"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
        </Link>

        {/* Botón de Orden Inteligente */}
        <div className="flex items-center gap-2">
          <a
            href="tel:+56932553527"
            className="w-9 h-9 rounded-full bg-black/60 border border-amber-500/30 flex items-center justify-center text-amber-300 hover:text-white hover:bg-black transition"
            title="Llamar al local"
          >
            <Phone className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black text-xs shadow-lg shadow-black/60 transition active:scale-95"
            title="Ver orden activa"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Mi Orden{totalItems > 0 ? ` (${totalItems})` : ''}</span>
          </button>
        </div>
      </div>

      {/* Category Horizontal Pills Slider */}
      <div className="max-w-2xl mx-auto px-4 pb-2.5 overflow-x-auto scrollbar-none flex gap-2">
        {categorias.map((cat) => {
          const isSelected = categoriaActiva === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategoria(cat.slug)}
              className={`whitespace-nowrap px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40 scale-105 font-black'
                  : 'bg-black/60 text-amber-100 hover:bg-black/90 hover:text-white border border-amber-600/30'
              }`}
            >
              <span>{cat.nombre}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
