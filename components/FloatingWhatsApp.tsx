'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useMenuData } from '@/lib/store';
import { getWhatsAppLink } from '@/lib/whatsapp';

export function FloatingWhatsApp() {
  const { configTV } = useMenuData();
  const whatsappUrl = getWhatsAppLink(
    configTV[0]?.telefono_whatsapp,
    'Hola BillyBurger! Quisiera hacer un pedido o consulta.'
  );

  return (
    <aside aria-label="Contacto directo" className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      <a
        href={whatsappUrl}
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
