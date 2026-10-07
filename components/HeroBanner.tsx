'use client';

import React from 'react';
import Image from 'next/image';
import { Phone, MessageCircle, MapPin, Sparkles, PartyPopper } from 'lucide-react';
import { Evento } from '@/lib/types';

interface HeroBannerProps {
  eventos: Evento[];
}

export function HeroBanner({ eventos }: HeroBannerProps) {
  const eventoActivo = eventos.find((e) => e.activo);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#14161d] via-[#101217] to-[#0a0a0c] border-b border-white/5 py-8 px-4">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left text column */}
        <div className="text-center md:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Carta Digital & Menú Online</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            LAS MEJORES <span className="text-amber-400">BURGERS</span> & CHORRILLANAS
          </h2>

          <p className="mt-2 text-sm text-zinc-300 max-w-md mx-auto md:mx-0 leading-relaxed">
            Ingredientes seleccionados, mayonesa casera, abundantes porciones y la receta original de BillyBurger.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <a
              href="https://wa.me/56932553527?text=Hola%20BillyBurger!%20Quisiera%20hacer%20un%20pedido."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              <span>Haz tu Pedido</span>
            </a>

            <a
              href="tel:+56932553527"
              className="px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-white/10 font-bold text-xs flex items-center gap-2 transition"
            >
              <Phone className="w-4 h-4" />
              <span>+56 9 3255 3527</span>
            </a>
          </div>

          <div className="mt-4 flex items-center justify-center md:justify-start gap-2 text-xs text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Retiro en Local & Delivery coordinado por WhatsApp</span>
          </div>
        </div>

        {/* Right hero image */}
        <div className="relative w-64 h-52 sm:w-72 sm:h-60 shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-orange-500/0 rounded-full blur-2xl" />
          <Image
            src="/images/e88fb0a7c5f6a08ae9bba1aa294d8bb9.png"
            alt="Hamburguesa Billy"
            width={320}
            height={260}
            className="w-full h-full object-contain filter drop-shadow-2xl animate-pulse"
            priority
          />
        </div>
      </div>

      {/* Event Banner (si existe evento activo) */}
      {eventoActivo && (
        <div className="max-w-4xl mx-auto mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/40 to-black/60 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <PartyPopper className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                {eventoActivo.fecha_evento}
              </span>
              <h4 className="text-sm font-bold text-white">{eventoActivo.titulo}</h4>
              <p className="text-xs text-zinc-300 mt-0.5">{eventoActivo.descripcion}</p>
            </div>
          </div>
          <a
            href="https://wa.me/56932553527?text=Hola%20BillyBurger!%20Quisiera%20cotizar%20un%20evento%20o%20celebraci%C3%B3n."
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs shrink-0 hover:bg-amber-400 transition"
          >
            Cotizar Evento
          </a>
        </div>
      )}
    </div>
  );
}
