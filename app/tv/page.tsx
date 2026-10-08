'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useMenuData } from '@/lib/store';
import { Producto, Categoria } from '@/lib/types';
import { Flame, Sparkles, Maximize2, QrCode } from 'lucide-react';
import { BillyLoader } from '@/components/BillyLoader';

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

  // Estado del slide/categoría activa y producto activo en la TV
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeProductIndex, setActiveProductIndex] = useState(0);

  const activeCategory: Categoria | undefined = categoriasConProductos[activeCategoryIndex];
  const productosEnSlide = activeCategory
    ? productosFiltrados.filter((p) => p.categoria_id === activeCategory.id)
    : [];

  const productoActivo = productosEnSlide[activeProductIndex] || productosEnSlide[0];

  // Temporizador para rotar productos de uno en uno y luego categorías
  useEffect(() => {
    if (categoriasConProductos.length === 0) return;

    // Tiempo por producto: 7 segundos para lectura cómoda a distancia
    const segundosPorProducto = Math.max(6, Math.min(10, rotacionSegundos));

    const timer = setInterval(() => {
      setActiveProductIndex((prevProdIdx) => {
        if (productosEnSlide.length > 0 && prevProdIdx + 1 < productosEnSlide.length) {
          return prevProdIdx + 1;
        } else {
          // Avanzar a la siguiente categoría
          setActiveCategoryIndex((prevCatIdx) => (prevCatIdx + 1) % categoriasConProductos.length);
          return 0;
        }
      });
    }, segundosPorProducto * 1000);

    return () => clearInterval(timer);
  }, [categoriasConProductos.length, productosEnSlide.length, rotacionSegundos]);

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
        <BillyLoader size={100} text={`Cargando Pantalla ${pantallaId} BillyBurger...`} />
      </div>
    );
  }

  // Lista de mensajes dinámicos de la guincha gestionados desde el Admin
  const mensajesTicker: string[] =
    currentConfig?.cintillo_mensajes && currentConfig.cintillo_mensajes.length > 0
      ? currentConfig.cintillo_mensajes
      : [
          currentConfig?.cintillo_texto || '¡Bienvenido a Billy Burger!',
          '🍔 ¡Pide tu combo con papas fritas crujientes!',
          '🛵 Delivery & Retiro en Local disponible',
          '🎉 Consulta por eventos y celebraciones al +56 9 3255 3527',
          '⭐ Prueba nuestras Chorrillanas y Sándwiches artesanales',
        ];

  return (
    <div className="h-screen w-screen bg-[#08090d] text-white overflow-hidden flex flex-col font-sans select-none">
      {/* 1. TV TOP HEADER BAR */}
      <header className="h-20 bg-gradient-to-r from-[#0e1017] via-[#141722] to-[#0e1017] border-b border-amber-500/20 px-8 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full p-2 bg-gradient-to-tr from-amber-600 to-orange-600 shadow-xl shadow-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            <Image
              src="/images/logo-icon.png"
              alt="Billy Burger"
              width={44}
              height={44}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-text.png"
              alt="Billy BURGER"
              width={160}
              height={50}
              className="h-10 w-auto object-contain filter drop-shadow-md"
              priority
            />
            <span className="text-xs bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-1 rounded-full border border-amber-500/40 uppercase tracking-wider">
              PANTALLA {pantallaId}
            </span>
          </div>
        </div>

        {/* Category Indicators / Progress Pills */}
        <div className="flex items-center gap-2">
          {categoriasConProductos.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategoryIndex(idx);
                setActiveProductIndex(0);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                idx === activeCategoryIndex
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-105'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              {cat.nombre}
            </button>
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

        {/* LEFT COLUMN: HERO PRODUCT SPOTLIGHT (FOTO Y VISUAL) */}
        <div className="col-span-5 flex flex-col justify-between bg-gradient-to-b from-[#13151f] to-[#0c0e14] rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Top category label */}
          <div className="flex items-center justify-between z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              {productoActivo?.es_destacado ? '⭐ Favorito de la Casa' : 'Preparación Artesanal'}
            </span>
            <span className="text-xs text-zinc-400 font-extrabold uppercase tracking-widest">
              {activeCategory.nombre}
            </span>
          </div>

          {/* Large Hero Image sincronizada con el producto activo */}
          <div className="relative flex-1 flex items-center justify-center my-4">
            <div className="relative w-72 h-72 xl:w-96 xl:h-96">
              <div className="absolute inset-0 bg-amber-500/15 rounded-full blur-3xl animate-pulse" />
              {productoActivo?.imagen_url ? (
                <Image
                  src={productoActivo.imagen_url}
                  alt={productoActivo.nombre}
                  fill
                  className="object-contain filter drop-shadow-2xl transition-all duration-700 hover:scale-105"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <Flame className="w-28 h-28" />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Callout: Sección y WhatsApp Pedidos */}
          <div className="z-10 bg-black/70 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">SECCIÓN</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">{activeCategory.nombre}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">WHATSAPP PEDIDOS</span>
              <span className="text-base xl:text-lg font-black text-emerald-400 font-mono">+56 9 3255 3527</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SECCIÓN DE DETALLES - VISIBLE A 3 Y 4 METROS (UNO EN UNO) */}
        <div className="col-span-7 flex flex-col justify-between bg-[#10121a]/95 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl overflow-hidden">
          {/* Header de la sección de detalles */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-md shadow-amber-400/50" />
              <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-wide text-white">
                MENÚ: <span className="text-amber-400">{activeCategory.nombre}</span>
              </h3>
            </div>
            {productosEnSlide.length > 0 && (
              <span className="text-xs font-black bg-amber-500/20 text-amber-300 px-3.5 py-1.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
                Producto {activeProductIndex + 1} de {productosEnSlide.length}
              </span>
            )}
          </div>

          {/* Ficha Principal de Detalle (Enorme para visualización a 3-4 metros) */}
          {productoActivo && (
            <div className="flex-1 flex flex-col justify-center py-4 min-h-0">
              {/* Título y Precio en Gigante */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-md">
                    {productoActivo.nombre}
                  </h2>

                  {/* Precio Secundario si tiene (ej. Sin Papas) */}
                  {productoActivo.precio_secundario && (
                    <div className="mt-3 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-black/60 border border-white/10">
                      <span className="text-xs lg:text-sm font-bold uppercase text-zinc-400">
                        {productoActivo.etiqueta_precio_secundario || 'Sin Papas'}:
                      </span>
                      <span className="text-2xl lg:text-3xl font-black text-zinc-200 font-mono">
                        {formatoPrecio(productoActivo.precio_secundario)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs uppercase font-bold text-zinc-400 block tracking-wider">Precio</span>
                  <span className="text-4xl sm:text-5xl xl:text-6xl font-black text-amber-400 font-mono tracking-tight drop-shadow-lg">
                    {formatoPrecio(productoActivo.precio)}
                  </span>
                </div>
              </div>

              {/* Caja de Ingredientes y Detalles en Tipografía Gigante */}
              <div className="mt-6 flex-1 min-h-[140px] bg-black/75 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-amber-500/30 shadow-2xl flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs lg:text-sm font-black text-amber-400 uppercase tracking-widest">
                    INGREDIENTES & DETALLES
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl xl:text-4xl text-zinc-100 font-bold leading-relaxed tracking-wide drop-shadow-sm">
                  {productoActivo.descripcion || 'Preparación clásica artesanal con los mejores ingredientes de Billy Burger.'}
                </p>
              </div>
            </div>
          )}

          {/* Carrusel / Barra inferior de selección de productos de la categoría */}
          <div className="pt-3 border-t border-white/10 shrink-0">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
              <span>Otros en esta categoría:</span>
              <span>Toca o espera la rotación automática</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {productosEnSlide.map((prod, idx) => (
                <button
                  key={prod.id}
                  onClick={() => setActiveProductIndex(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                    idx === activeProductIndex
                      ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/30 scale-105'
                      : 'bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-white/5'
                  }`}
                >
                  <span>{prod.nombre}</span>
                  <span className="font-mono font-black opacity-90">{formatoPrecio(prod.precio)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 3. TV BOTTOM RUNNING TICKER / GUINCHA INFERIOR ENORME Y GESTIONABLE */}
      <footer className="h-14 lg:h-16 bg-amber-500 text-black flex items-center overflow-hidden shrink-0 shadow-2xl border-t border-amber-400">
        <div className="whitespace-nowrap animate-marquee flex items-center gap-12 pl-6 text-base lg:text-lg xl:text-xl font-black uppercase tracking-wider">
          {mensajesTicker.map((msg, i) => (
            <React.Fragment key={i}>
              <span>{msg}</span>
              <span className="text-black/40 text-xl font-mono">✦</span>
            </React.Fragment>
          ))}
          {/* Duplicado para loop continuo fluido */}
          {mensajesTicker.map((msg, i) => (
            <React.Fragment key={`repeat-${i}`}>
              <span>{msg}</span>
              <span className="text-black/40 text-xl font-mono">✦</span>
            </React.Fragment>
          ))}
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
          <BillyLoader size={100} text="Iniciando Menuboard TV..." />
        </div>
      }
    >
      <TVMenuboardContent />
    </Suspense>
  );
}
