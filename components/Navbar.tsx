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
    <header className="sticky top-0 z-50 bg-[#0c0d10]/95 backdrop-blur-md border-b border-white/10 transition-all">
      {/* Top micro bar */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white text-xs font-semibold py-1 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>🔥 ¡Abiertos! Pide al WhatsApp o en local</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tv"
              className="flex items-center gap-1 hover:text-amber-200 transition text-[11px] bg-black/20 px-2 py-0.5 rounded"
              title="Ver Pantalla TV"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modo TV</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1 hover:text-amber-200 transition text-[11px] bg-black/20 px-2 py-0.5 rounded"
              title="Panel de Control"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main branding & quick WhatsApp */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition">
            <Image
              src="/images/logo.png"
              alt="Billy Burger Logo"
              width={44}
              height={44}
              className="w-full h-full object-contain filter drop-shadow invert"
            />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1 font-sans">
              BILLY<span className="text-amber-400">BURGER</span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">Sabor & Calidad Artesanal</p>
          </div>
        </Link>

        {/* WhatsApp Call to action */}
        <div className="flex items-center gap-2">
          <a
            href="tel:+56932553527"
            className="w-9 h-9 rounded-full bg-zinc-800/80 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
            title="Llamar"
          >
            <Phone className="w-4 h-4" />
          </a>
          <a
            href="https://wa.me/56932553527?text=Hola%20BillyBurger!%20Quisiera%20hacer%20un%20pedido."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 hover:scale-105 active:scale-95 transition"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span className="hidden xs:inline">Pedir WhatsApp</span>
            <span className="xs:hidden">Pedir</span>
          </a>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="max-w-4xl mx-auto px-4 pb-2.5 overflow-x-auto scrollbar-none flex gap-2">
        {categorias.map((cat) => {
          const isSelected = categoriaActiva === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategoria(cat.slug)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 scale-105'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-white/5'
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
