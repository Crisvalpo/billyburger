'use client';

import React from 'react';
import Image from 'next/image';
import { Producto, Categoria } from '@/lib/types';
import { MessageCircle } from 'lucide-react';

interface CategorySectionProps {
  categoria: Categoria;
  productos: Producto[];
}

// Mapeo de fotos recortadas oficiales para cada sección
const IMAGENES_SECCION: Record<string, string> = {
  fajitas: '/images/fajita-cutout.png',
  'papas-fritas': '/images/papas-sticker.png',
  chorrillanas: '/images/chorrillana.png',
  completos: '/images/sandwich.png',
  sandwiches: '/images/sandwich.png',
  burgers: '/images/burger-png.png',
  ensaladas: '/images/ensalada.png',
  bebidas: '/images/bebidas.png',
};

export function CategorySection({ categoria, productos }: CategorySectionProps) {
  if (productos.length === 0) return null;

  const imagenSeccion = IMAGENES_SECCION[categoria.slug] || '/images/burger-png.png';

  const formatoPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(precio);
  };

  return (
    <section id={categoria.slug} className="scroll-mt-28 py-6">
      {/* 1. SECTION WOOD HEADER BADGE */}
      <div className="flex flex-col items-center mb-5">
        <div className="relative px-8 py-2.5 rounded-2xl bg-gradient-to-b from-[#2a1708] via-[#190d04] to-[#0a0502] border-2 border-amber-600/60 shadow-2xl flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border border-amber-400/40 p-0.5 flex items-center justify-center">
            <Image
              src="/images/logo-icon.png"
              alt="Icon"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-100 tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {categoria.nombre}
          </h2>
          <a
            href="https://wa.me/56932553527"
            target="_blank"
            rel="noopener noreferrer"
            className="w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white shadow-md transition"
            title="Pedir por WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
          </a>
        </div>

        {/* 2. SECTION HERO CUTOUT IMAGE */}
        <div className="relative w-44 h-32 sm:w-52 sm:h-36 my-3 filter drop-shadow-[0_12px_16px_rgba(0,0,0,0.85)]">
          <Image
            src={imagenSeccion}
            alt={categoria.nombre}
            fill
            className="object-contain hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Banner informativo de sección (ej: Sándwiches con papas) */}
        {categoria.slug === 'sandwiches' && (
          <div className="mb-3 px-4 py-1.5 rounded-full bg-black/75 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-lg">
            🍟 Todos los Sándwich incluyen Deliciosas Papas Fritas
          </div>
        )}
      </div>

      {/* 3. MENU ITEMS LIST (ESTILO CARTA CLÁSICA CON FRANJAS OSCURAS) */}
      <div className="space-y-3">
        {productos.map((prod) => {
          const mensajeWA = encodeURIComponent(
            `Hola BillyBurger! Quiero pedir: ${prod.nombre} - ${formatoPrecio(prod.precio)}`
          );

          return (
            <div
              key={prod.id}
              className={`relative overflow-hidden rounded-xl bg-black/80 hover:bg-black/90 backdrop-blur-sm border border-black/40 shadow-[0_4px_12px_rgba(0,0,0,0.7)] p-3 sm:p-4 transition-all ${
                !prod.disponible ? 'opacity-50 grayscale' : ''
              }`}
            >
              {/* Fila Principal: Nombre del Producto + Precio */}
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {prod.nombre}
                  </h3>
                  {prod.es_destacado && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-black shadow">
                      Favorito
                    </span>
                  )}
                  {!prod.disponible && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                      Agotado
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base sm:text-xl font-black text-amber-400 font-mono tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {formatoPrecio(prod.precio)}
                  </span>
                  {prod.precio_secundario && (
                    <span className="text-[11px] block font-bold text-zinc-300">
                      {prod.etiqueta_precio_secundario || 'Sin Papas'}: {formatoPrecio(prod.precio_secundario)}
                    </span>
                  )}
                </div>
              </div>

              {/* Fila Secundaria: Ingredientes en tipografía clara */}
              {prod.descripcion && (
                <p className="mt-1 text-xs sm:text-sm text-zinc-200 font-normal leading-relaxed tracking-wide">
                  {prod.descripcion}
                </p>
              )}

              {/* Botón sutil de pedido al tocar el plato */}
              {prod.disponible && (
                <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-end">
                  <a
                    href={`https://wa.me/56932553527?text=${mensajeWA}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>Pedir este plato</span>
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. ADICIONALES (EN SECCIONES CORRESPONDIENTES) */}
      {(categoria.slug === 'fajitas' || categoria.slug === 'completos' || categoria.slug === 'papas-fritas') && (
        <div className="mt-4 p-3.5 rounded-2xl bg-black/85 backdrop-blur-sm border border-amber-500/20 shadow-xl flex items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
              Adicionales & Agregados
            </h4>
            <p className="text-[11px] text-zinc-300 mt-0.5">
              Carne o Pollo +$1.300 • Otros agregados +$1.000
            </p>
            <p className="text-xs font-bold text-white mt-1">
              🍟 Agrégale Deliciosas Papas Fritas: <span className="text-amber-400 font-mono">+$1.500</span>
            </p>
          </div>

          <div className="relative w-16 h-14 shrink-0 filter drop-shadow-md">
            <Image
              src="/images/papas-sticker.png"
              alt="Papas Fritas"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
