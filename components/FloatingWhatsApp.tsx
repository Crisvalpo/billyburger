'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export function FloatingWhatsApp() {
  return (
    <aside aria-label="Contacto directo" className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      <a
        href="https://wa.me/56932553527?text=Hola%20BillyBurger!%20Quisiera%20hacer%20un%20pedido%20o%20consulta."
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-sm shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all"
        aria-label="Abrir chat de WhatsApp para pedir"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="hidden xs:inline">Pedir por WhatsApp</span>
      </a>
    </aside>
  );
}
