'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Producto, Categoria } from '@/lib/types';
import { useCart } from './CartContext';
import { Plus, Minus, ShoppingBag } from 'lucide-react';

interface CategorySectionProps {
  categoria: Categoria;
  productos: Producto[];
}

function ProductRow({ prod, categoriaSlug }: { prod: Producto; categoriaSlug?: string }) {
  const { addItem, removeItem, getItemQuantity } = useCart();
  const [sinPapas, setSinPapas] = useState(false);
  const [conPapas, setConPapas] = useState(false);

  const formatoPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(precio);
  };

  const esCompleto = categoriaSlug === 'completos';
  const precioPapasCompletos = 1500;

  let precioActual = prod.precio;
  let opcionNombre = '';

  if (esCompleto) {
    if (conPapas) {
      precioActual = prod.precio + precioPapasCompletos;
      opcionNombre = 'Con Papas Fritas (+ $1.500)';
    } else {
      precioActual = prod.precio;
      opcionNombre = '';
    }
  } else if (prod.precio_secundario) {
    if (sinPapas) {
      precioActual = prod.precio_secundario;
      opcionNombre = prod.etiqueta_precio_secundario || 'Sin Papas';
    } else {
      precioActual = prod.precio;
      opcionNombre = 'Con Papas';
    }
  }

  const cantidad = getItemQuantity(prod.id, opcionNombre);

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-black/80 hover:bg-black/90 backdrop-blur-sm border transition-all duration-200 p-3 sm:p-4 shadow-[0_4px_12px_rgba(0,0,0,0.7)] ${
        cantidad > 0
          ? 'border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
          : 'border-black/40'
      } ${!prod.disponible ? 'opacity-50 grayscale' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Miniatura del producto (si tiene foto subida) */}
        {prod.imagen_url && prod.imagen_url.trim() !== '' && (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-black/40 border border-amber-500/20 overflow-hidden shrink-0 shadow-md">
            <Image
              src={prod.imagen_url}
              alt={prod.nombre}
              fill
              unoptimized
              className="object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
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
              <span className="text-base sm:xl font-black text-amber-400 font-mono tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {formatoPrecio(precioActual)}
              </span>
            </div>
          </div>

          {/* Fila Secundaria: Ingredientes */}
          {prod.descripcion && (
            <p className="mt-1 text-xs sm:text-sm text-zinc-200 font-normal leading-relaxed tracking-wide">
              {prod.descripcion}
            </p>
          )}

          {/* Selector de Papas para la sección de COMPLETOS */}
          {esCompleto && (
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-zinc-400">Opción:</span>
              <div className="inline-flex rounded-lg bg-zinc-900/90 p-0.5 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setConPapas(false)}
                  className={`px-2.5 py-1 rounded-md font-bold transition text-[11px] ${
                    !conPapas
                      ? 'bg-amber-500 text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Solo Completo ({formatoPrecio(prod.precio)})
                </button>
                <button
                  type="button"
                  onClick={() => setConPapas(true)}
                  className={`px-2.5 py-1 rounded-md font-bold transition text-[11px] flex items-center gap-1 ${
                    conPapas
                      ? 'bg-amber-500 text-black shadow'
                      : 'text-amber-400/90 hover:text-amber-300'
                  }`}
                >
                  <span>🍟 + Papas Fritas</span>
                  <span className="opacity-90">({formatoPrecio(prod.precio + precioPapasCompletos)})</span>
                </button>
              </div>
            </div>
          )}

          {/* Selector de Papas si el producto tiene precio secundario (Sándwiches) */}
          {!esCompleto && prod.precio_secundario && (
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-zinc-400">Opción:</span>
              <div className="inline-flex rounded-lg bg-zinc-900/90 p-0.5 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setSinPapas(false)}
                  className={`px-2 py-1 rounded-md font-bold transition text-[11px] ${
                    !sinPapas
                      ? 'bg-amber-500 text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Con Papas ({formatoPrecio(prod.precio)})
                </button>
                <button
                  type="button"
                  onClick={() => setSinPapas(true)}
                  className={`px-2 py-1 rounded-md font-bold transition text-[11px] ${
                    sinPapas
                      ? 'bg-amber-500 text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {prod.etiqueta_precio_secundario || 'Sin Papas'} ({formatoPrecio(prod.precio_secundario)})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control interactivo de Agregar a la Orden */}
      {prod.disponible && (
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-zinc-400">
            {cantidad > 0 && (
              <span className="text-amber-300 font-bold flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                {cantidad} en tu orden ({formatoPrecio(precioActual * cantidad)})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {cantidad === 0 ? (
              <button
                type="button"
                onClick={() => addItem(prod, opcionNombre, precioActual)}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Agregar</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 bg-zinc-900 border border-amber-500/40 rounded-xl p-1 shadow-md">
                <button
                  type="button"
                  onClick={() => removeItem(prod.id, opcionNombre)}
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 flex items-center justify-center text-white transition"
                  title="Disminuir o quitar"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <span className="text-sm font-black font-mono px-2 text-amber-400 min-w-[20px] text-center">
                  {cantidad}
                </span>
                <button
                  type="button"
                  onClick={() => addItem(prod, opcionNombre, precioActual)}
                  className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 flex items-center justify-center text-black font-bold transition"
                  title="Aumentar"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CategorySection({ categoria, productos }: CategorySectionProps) {
  if (productos.length === 0) return null;

  return (
    <section id={categoria.slug} className="scroll-mt-28 py-4 sm:py-6 w-full">
      {/* 1. SECTION WOOD HEADER - TODO EL ANCHO DE VENTANA SIN BORDES */}
      <div className="w-full bg-gradient-to-b from-[#2a1708] via-[#190d04] to-[#0a0502] py-3.5 sm:py-4 shadow-2xl flex items-center justify-center gap-3 border-none">
        <div className="w-7 h-7 rounded-full border border-amber-400/40 p-0.5 flex items-center justify-center">
          <Image
            src="/images/logo-icon.png"
            alt="Icon"
            width={22}
            height={22}
            className="object-contain"
          />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-amber-100 tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          {categoria.nombre}
        </h2>
      </div>

      {/* Contenedor centralizado para los productos */}
      <div className="max-w-xl w-full mx-auto px-3 sm:px-4">
        {/* 2. SECTION HERO CUTOUT IMAGE */}
        {categoria.imagen_url && categoria.imagen_url.trim() !== '' && (
          <div className="flex justify-center">
            <div className="relative w-44 h-32 sm:w-52 sm:h-36 my-3 filter drop-shadow-[0_12px_16px_rgba(0,0,0,0.85)]">
              <Image
                src={categoria.imagen_url}
                alt={categoria.nombre}
                fill
                unoptimized
                className="object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        )}

        {/* Banner informativo de sección */}
        {categoria.slug === 'sandwiches' && (
          <div className="my-3 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-black/75 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-lg">
              🍟 Todos los Sándwich incluyen Deliciosas Papas Fritas
            </span>
          </div>
        )}

        {/* 3. MENU ITEMS LIST */}
        <div className="space-y-3 mt-3">
          {productos.map((prod) => (
            <ProductRow key={prod.id} prod={prod} categoriaSlug={categoria.slug} />
          ))}
        </div>

        {/* 4. ADICIONALES (SOLO SI CORRESPONDE, EJ. FAJITAS - REMOVIDO DE COMPLETOS Y PAPAS FRITAS) */}
        {categoria.slug === 'fajitas' && (
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
          </div>
        )}
      </div>
    </section>
  );
}

