'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, MessageCircle, Tv, Settings } from 'lucide-react';
import { Categoria } from '@/lib/types';

interface NavbarProps {
  categorias: Categoria[];
  categoriaActiva: string;
  onSelectCategoria: (slug: string) => void;
}

export function Navbar({ categorias, categoriaActiva, onSelectCategoria }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#140b04]/90 backdrop-blur-md border-b border-amber-600/30 transition-all shadow-2xl">
      {/* Top micro bar */}
      <div className="bg-gradient-to-r from-[#2b1404] via-[#3a1b06] to-[#2b1404] text-amber-200 text-xs font-semibold py-1 px-4 border-b border-amber-500/20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold">🔥 ¡Abiertos! Pide directo por WhatsApp</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tv?pantalla=1"
              target="_blank"
              className="flex items-center gap-1 hover:text-amber-400 transition text-[11px] bg-black/40 px-2 py-0.5 rounded border border-white/5"
              title="Ver Pantalla TV"
            >
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span>Modo TV</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1 hover:text-amber-400 transition text-[11px] bg-black/40 px-2 py-0.5 rounded border border-white/5"
              title="Panel de Control"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>

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

        {/* WhatsApp Call to action */}
        <div className="flex items-center gap-2">
          <a
            href="tel:+56932553527"
            className="w-9 h-9 rounded-full bg-black/60 border border-amber-500/30 flex items-center justify-center text-amber-300 hover:text-white hover:bg-black transition"
            title="Llamar al local"
          >
            <Phone className="w-4 h-4" />
          </a>
          <a
            href="https://wa.me/56932553527?text=Hola%20BillyBurger!%20Quisiera%20hacer%20un%20pedido."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-lg shadow-black/60 transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Pedir</span>
          </a>
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
