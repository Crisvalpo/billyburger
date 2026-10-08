'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-12 pt-8 pb-20 px-4 text-center">
      <div className="max-w-xl mx-auto flex flex-col items-center">
        {/* 1. CELEBRACIONES & EVENTOS CALLOUT */}
        <div className="p-6 rounded-3xl bg-black/80 backdrop-blur-sm border-2 border-amber-600/40 shadow-2xl mb-8">
          <h3 className="text-xl sm:text-2xl font-black text-amber-200 tracking-wide leading-snug drop-shadow">
            ¿Quieres que seamos parte de tu celebración?
          </h3>
          <p className="mt-2 text-sm text-amber-100/90 font-medium leading-relaxed">
            Cotiza con Nosotros una experiencia llena de sabor para tus cumpleaños y reuniones.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/56932553527?text=Hola%20BillyBurger!%20Quisiera%20cotizar%20un%20evento%20o%20celebraci%C3%B3n."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Cotizar por WhatsApp</span>
            </a>

            <a
              href="tel:+56932553527"
              className="px-4 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-2 transition"
            >
              <Phone className="w-4 h-4" />
              <span>Llamar al Local</span>
            </a>

            <a
              href="https://www.instagram.com/billyburger_eventoss/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:opacity-95 text-white font-black text-xs flex items-center gap-1.5 shadow-lg transition"
            >
              <span>Fotos de Eventos</span>
            </a>
          </div>
        </div>

        {/* 2. INSTAGRAM ICON 3D */}
        <div className="my-4">
          <a
            href="https://www.instagram.com/billyburger_eventoss/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-1.5 hover:scale-105 transition-transform duration-300 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
            title="Síguenos en Instagram @billyburger_eventoss"
          >
            <Image
              src="/images/instagram-3d.png"
              alt="Instagram BillyBurger"
              width={56}
              height={56}
              className="object-contain group-hover:rotate-6 transition-transform"
            />
            <span className="text-xs font-black text-amber-300 group-hover:text-amber-200 tracking-wider">
              @billyburger_eventoss
            </span>
          </a>
        </div>

        {/* 3. LOGO TEXT */}
        <div className="my-4">
          <Image
            src="/images/logo-text.png"
            alt="Billy BURGER"
            width={160}
            height={55}
            className="object-contain filter drop-shadow-md"
          />
        </div>

        {/* CRÉDITOS OFICIALES */}
        <p className="mt-6 text-[11px] text-amber-100/60 font-semibold tracking-wider">
          Design Print Curauma - Narkis &amp; Luke
        </p>
      </div>
    </footer>
  );
}
