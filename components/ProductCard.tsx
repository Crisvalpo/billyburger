'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, Flame, Sparkles } from 'lucide-react';
import { Producto } from '@/lib/types';

interface ProductCardProps {
  producto: Producto;
}

export function ProductCard({ producto }: ProductCardProps) {
  // Manejo de opción con papas vs sin papas
  const [sinPapas, setSinPapas] = useState(false);

  const precioActual = sinPapas && producto.precio_secundario
    ? producto.precio_secundario
    : producto.precio;

  const formatoPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(precio);
  };

  const mensajeWhatsApp = encodeURIComponent(
    `Hola BillyBurger! Quiero pedir: ${producto.nombre}${
      sinPapas ? ' (Sin Papas)' : ''
    } - ${formatoPrecio(precioActual)}`
  );

  return (
    <div
      className={`group relative bg-[#15171e] rounded-2xl border border-white/5 overflow-hidden shadow-lg transition-all duration-300 hover:border-amber-500/40 hover:shadow-amber-500/10 flex flex-col justify-between ${
        !producto.disponible ? 'opacity-60 grayscale' : ''
      }`}
    >
      <div>
        {/* Top Image or Hero Banner */}
        <div className="relative w-full h-48 sm:h-52 bg-zinc-900 overflow-hidden">
          {producto.imagen_url ? (
            <Image
              src={producto.imagen_url}
              alt={producto.nombre}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
              <Flame className="w-12 h-12" />
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {producto.es_destacado && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-black shadow-md">
                <Sparkles className="w-3 h-3 fill-black" />
                Destacado
              </span>
            )}
            {!producto.disponible && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-600 text-white shadow-md">
                Agotado
              </span>
            )}
          </div>

          {/* Floating Price Tag on Image */}
          <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg text-right">
            <span className="text-xs text-zinc-400 block font-medium leading-none">Precio</span>
            <span className="text-lg font-black text-amber-400 font-mono tracking-tight">
              {formatoPrecio(precioActual)}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4">
          <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition tracking-tight">
            {producto.nombre}
          </h3>

          <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed font-normal">
            {producto.descripcion}
          </p>

          {/* Selector de Papas (si tiene precio secundario) */}
          {producto.precio_secundario && (
            <div className="mt-3 p-2 bg-zinc-900/90 rounded-xl border border-white/5 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">Opción Papas:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setSinPapas(false)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    !sinPapas
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Con Papas
                </button>
                <button
                  type="button"
                  onClick={() => setSinPapas(true)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    sinPapas
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Sin Papas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 pt-0">
        <a
          href={`https://wa.me/56932553527?text=${mensajeWhatsApp}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
            producto.disponible
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-600/30 active:scale-98'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed pointer-events-none'
          }`}
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>{producto.disponible ? 'Pedir por WhatsApp' : 'No disponible'}</span>
        </a>
      </div>
    </div>
  );
}
