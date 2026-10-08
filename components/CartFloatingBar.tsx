'use client';

import React from 'react';
import { useCart } from './CartContext';
import { ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';

export function CartFloatingBar() {
  const { totalItems, totalPrecio, setIsOpen } = useCart();

  const formatoPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(precio);
  };

  // Si no hay productos en la orden, mostrar botón sutil de WhatsApp flotante
  if (totalItems === 0) {
    return (
      <aside aria-label="Contacto WhatsApp flotante" className="fixed bottom-5 right-5 z-40">
        <a
          href="https://wa.me/56932553527?text=Hola%20BillyBurger!%20Quisiera%20hacer%20una%20consulta."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir chat de WhatsApp para pedir"
          className="group flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-3.5 py-3 rounded-full shadow-2xl shadow-emerald-950/70 border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-6 h-6 fill-white" />
          <span className="hidden xs:inline text-xs font-bold tracking-wide">
            Contacto WhatsApp
          </span>
        </a>
      </aside>
    );
  }

  // Si HAY productos en la orden, mostrar BARRA FLOTANTE INTERACTIVA DE PEDIDO
  return (
    <aside
      aria-label="Barra de Pedido Activo"
      className="fixed bottom-4 left-0 right-0 z-40 px-3 sm:px-4 max-w-lg mx-auto animate-in slide-in-from-bottom duration-300"
    >
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-[#2c1708] via-[#1a0e05] to-[#2c1708] border-2 border-amber-500 rounded-2xl p-3 sm:p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.9)] flex items-center justify-between gap-3 text-white hover:border-amber-400 transition-all active:scale-98 group backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black font-black shadow-lg">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center border-2 border-[#140b04]">
              {totalItems}
            </span>
          </div>

          <div className="text-left">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block leading-tight">
              Tu Pedido Actual
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-white">
              {formatoPrecio(totalPrecio)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-600 group-hover:bg-emerald-500 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md">
          <span>Ver Orden</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    </aside>
  );
}
