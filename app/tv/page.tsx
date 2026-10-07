'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useMenuData } from '@/lib/store';
import { Producto, Categoria } from '@/lib/types';
import { Flame, Sparkles, Maximize2, QrCode } from 'lucide-react';

function TVMenuboardContent() {
  const searchParams = useSearchParams();
  const pantallaParam = searchParams.get('pantalla');
  const pantallaId = pantallaParam ? parseInt(pantallaParam, 10) : 1;

  const { categorias, productos, configTV, loading } = useMenuData();

  // Configuración de la pantalla actual
  const currentConfig = configTV.find((c) => c.pantalla_id === pantallaId) || configTV[0];
  const rotacionSegundos = currentConfig?.segundos_rotacion || 12;

  // Filtrar productos según la pantalla asignada
  // pantalla_tv === 0 significa ambas pantallas
  const productosFiltrados = productos.filter((p) => {
    if (!p.mostrar_en_tv || !p.disponible) return false;
    if (p.pantalla_tv === 0 || p.pantalla_tv === pantallaId) return true;
    return false;
  });

  // Categorías que tienen productos en esta pantalla
  const categoriasConProductos = categorias.filter((c) =>
    productosFiltrados.some((p) => p.categoria_id === c.id)
  );

  // Estado del slide/categoría activa en la TV
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  // Temporizador para rotar categorías automáticamente en la TV
  useEffect(() => {
    if (categoriasConProductos.length <= 1) return;

    const timer = setInterval(() => {
      setActiveCategoryIndex((prev) => (prev + 1) % categoriasConProductos.length);
    }, rotacionSegundos * 1000);

    return () => clearInterval(timer);
  }, [categoriasConProductos.length, rotacionSegundos]);

  const activeCategory: Categoria | undefined = categoriasConProductos[activeCategoryIndex];
  const productosEnSlide = activeCategory
    ? productosFiltrados.filter((p) => p.categoria_id === activeCategory.id)
    : productosFiltrados.slice(0, 8);

  const productoHero = productosEnSlide.find((p) => p.es_destacado) || productosEnSlide[0];

  const formatoPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(precio);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (loading || !activeCategory) {
    return (
      <div className="h-screen w-screen bg-[#07080a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xl font-bold tracking-widest uppercase text-amber-400">
            Cargando Pantalla {pantallaId} BillyBurger...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#08090d] text-white overflow-hidden flex flex-col font-sans select-none">
      {/* 1. TV TOP HEADER BAR */}
      <header className="h-20 bg-gradient-to-r from-[#0e1017] via-[#141722] to-[#0e1017] border-b border-amber-500/20 px-8 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full p-1.5 bg-gradient-to-tr from-amber-500 to-orange-500 shadow-xl shadow-orange-500/30 flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="BillyBurger"
              width={50}
              height={50}
              className="w-full h-full object-contain filter invert"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              BILLY<span className="text-amber-400">BURGER</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                PANTALLA {pantallaId}
              </span>
            </h1>
            <p className="text-xs text-zinc-400 font-medium">
              Sabor & Calidad Artesanal • Pide al WhatsApp: +56 9 3255 3527
            </p>
          </div>
        </div>

        {/* Category Indicators / Progress Pills */}
        <div className="flex items-center gap-2">
          {categoriasConProductos.map((cat, idx) => (
            <div
              key={cat.id}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-500 ${
                idx === activeCategoryIndex
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-105'
                  : 'bg-zinc-800/80 text-zinc-400'
              }`}
            >
              {cat.nombre}
            </div>
          ))}

          <button
            onClick={toggleFullscreen}
            className="ml-4 w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition"
            title="Pantalla Completa"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. TV MAIN CONTENT STAGE */}
      <main className="flex-1 grid grid-cols-12 gap-6 p-8 min-h-0 overflow-hidden relative">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* LEFT COLUMN: HERO PRODUCT SPOTLIGHT */}
        <div className="col-span-5 flex flex-col justify-between bg-gradient-to-b from-[#13151f] to-[#0c0e14] rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Top category label */}
          <div className="flex items-center justify-between z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Recomendado del Chef
            </span>
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              {activeCategory.nombre}
            </span>
          </div>

          {/* Large Hero Image with auto animation */}
          <div className="relative flex-1 flex items-center justify-center my-4">
            <div className="relative w-72 h-72 xl:w-84 xl:h-84">
              <div className="absolute inset-0 bg-amber-500/15 rounded-full blur-3xl animate-pulse" />
              {productoHero?.imagen_url ? (
                <Image
                  src={productoHero.imagen_url}
                  alt={productoHero.nombre}
                  fill
                  className="object-contain filter drop-shadow-2xl transition-all duration-700 hover:scale-105"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <Flame className="w-24 h-24" />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Hero Info & Price */}
          <div className="z-10 bg-black/60 backdrop-blur-md p-5 rounded-2xl border border-white/10">
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                  {productoHero?.nombre}
                </h2>
                <p className="text-xs text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                  {productoHero?.descripcion}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Precio</span>
                <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                  {productoHero && formatoPrecio(productoHero.precio)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH-CONTRAST DIGITAL MENU BOARD */}
        <div className="col-span-7 flex flex-col justify-between bg-[#10121a]/90 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <h3 className="text-xl font-black uppercase tracking-tight text-white">
                  Menú: {activeCategory.nombre}
                </h3>
              </div>
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                {activeCategory.slug === 'sandwiches' ? 'Todos incluyen Papas Fritas' : 'Precios en Pesos'}
              </span>
            </div>

            {/* List of items in this category */}
            <div className="grid grid-cols-2 gap-3.5">
              {productosEnSlide.map((prod) => (
                <div
                  key={prod.id}
                  className={`p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    prod.id === productoHero?.id
                      ? 'bg-amber-500/15 border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-zinc-900/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-black text-white tracking-tight leading-snug">
                      {prod.nombre}
                    </h4>
                    <span className="text-base font-black text-amber-400 font-mono tracking-tight shrink-0">
                      {formatoPrecio(prod.precio)}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-tight">
                    {prod.descripcion}
                  </p>

                  {/* Secondary Price (Sin Papas) */}
                  {prod.precio_secundario && (
                    <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">{prod.etiqueta_precio_secundario || 'Sin Papas'}:</span>
                      <span className="font-bold text-zinc-200 font-mono">
                        {formatoPrecio(prod.precio_secundario)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom QR Code Callout for Customers */}
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-md">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h5 className="text-xs font-black uppercase text-white">¿Quieres ver la carta en tu celular?</h5>
                <p className="text-[11px] text-zinc-300">
                  Escanea el QR en tu mesa o visita <span className="text-amber-400 font-bold">billy.lukeapp.cl</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">WhatsApp Pedidos</span>
              <span className="text-sm font-black text-emerald-400 font-mono">+56 9 3255 3527</span>
            </div>
          </div>
        </div>
      </main>

      {/* 3. TV BOTTOM RUNNING TICKER / CINTILLO */}
      <footer className="h-10 bg-amber-500 text-black font-black text-xs uppercase tracking-wider flex items-center overflow-hidden shrink-0 shadow-2xl">
        <div className="whitespace-nowrap animate-marquee flex items-center gap-8 pl-4">
          <span>{currentConfig.cintillo_texto}</span>
          <span>•</span>
          <span>🍔 ¡Pide tu combo con papas fritas crujientes!</span>
          <span>•</span>
          <span>🛵 Delivery & Retiro en Local disponible</span>
          <span>•</span>
          <span>🎉 Consulta por eventos y celebraciones al +56 9 3255 3527</span>
          <span>•</span>
          <span>{currentConfig.cintillo_texto}</span>
        </div>
      </footer>
    </div>
  );
}

export default function TVMenuboardPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#07080a] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xl font-bold tracking-widest uppercase text-amber-400">
              Iniciando Menuboard TV...
            </p>
          </div>
        </div>
      }
    >
      <TVMenuboardContent />
    </Suspense>
  );
}
