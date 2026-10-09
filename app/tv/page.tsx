'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useMenuData } from '@/lib/store';
import { Producto, Categoria } from '@/lib/types';
import { Maximize2, MapPin, Clock, Phone } from 'lucide-react';
import { BillyLoader } from '@/components/BillyLoader';
import { getWhatsAppDisplay } from '@/lib/whatsapp';

function TVMenuboardContent() {
  const searchParams = useSearchParams();
  const urlPantalla = searchParams.get('pantalla');

  const [pantallaId, setPantallaId] = useState<number>(1);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Cargar pantalla seleccionada desde URL o localStorage
  useEffect(() => {
    if (urlPantalla) {
      const p = parseInt(urlPantalla, 10);
      if (!isNaN(p)) {
        setPantallaId(p);
        localStorage.setItem('billy_tv_pantalla_id', String(p));
      }
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('billy_tv_pantalla_id');
      if (saved) {
        setPantallaId(parseInt(saved, 10));
      }
    }
  }, [urlPantalla]);

  const cambiarPantalla = (nuevaPantalla: number) => {
    setPantallaId(nuevaPantalla);
    setActiveCategoryIndex(0);
    setActiveSlideIndex(0);
    if (typeof window !== 'undefined') {
      localStorage.setItem('billy_tv_pantalla_id', String(nuevaPantalla));
      window.history.replaceState(null, '', `/tv?pantalla=${nuevaPantalla}`);
    }
  };

  const { categorias, productos, configTV, loading } = useMenuData();

  // Configuración de la pantalla actual desde la base de datos
  const currentConfig = useMemo(() => {
    return configTV.find((c) => c.pantalla_id === pantallaId) || configTV[0];
  }, [configTV, pantallaId]);

  const rotacionSegundos = currentConfig?.segundos_rotacion || 12;

  // Filtrar productos reales según la pantalla asignada (pantalla_tv === 0 es ambas)
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      if (!p.mostrar_en_tv || !p.disponible) return false;
      if (p.pantalla_tv === 0 || p.pantalla_tv === pantallaId) return true;
      return false;
    });
  }, [productos, pantallaId]);

  // Categorías reales que tienen productos en esta pantalla
  const categoriasConProductos = useMemo(() => {
    return [...categorias]
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .filter((c) =>
        productosFiltrados.some((p) => p.categoria_id === c.id)
      );
  }, [categorias, productosFiltrados]);

  // Categoría activa actual
  const activeCategory: Categoria | undefined = categoriasConProductos[activeCategoryIndex];

  // Productos reales en la categoría activa
  const productosEnCategoria = useMemo(() => {
    if (!activeCategory) return [];
    return productosFiltrados
      .filter((p) => p.categoria_id === activeCategory.id)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  }, [productosFiltrados, activeCategory]);

  // Agrupar productos: Los productos DESTACADOS pertenecen exclusivamente al LADO IZQUIERDO (Hero)
  const slides = useMemo(() => {
    if (!activeCategory || productosEnCategoria.length === 0) return [];

    const destacados = productosEnCategoria.filter((p) => p.es_destacado);
    const regulares = productosEnCategoria.filter((p) => !p.es_destacado);

    // CASO 1: Si hay productos destacados, CADA UNO lidera el lado izquierdo (Hero sobre la mesa)
    if (destacados.length > 0) {
      const grupos: (Producto | undefined)[][] = [];
      let regIdx = 0;

      // 1. Cada producto destacado tiene su propio slide estelar en la izquierda
      for (let i = 0; i < destacados.length; i++) {
        const hero = destacados[i];
        const sec1 = regulares[regIdx++];
        const sec2 = regulares[regIdx++];
        grupos.push([hero, sec1, sec2]);
      }

      // 2. Si aún quedan productos regulares por mostrar:
      // Se crean slides adicionales donde el lado izquierdo rota entre los productos destacados,
      // asegurando que la izquierda SIEMPRE sea un producto destacado y que todos los regulares se muestren a la derecha
      let heroCycleIdx = 0;
      while (regIdx < regulares.length) {
        const hero = destacados[heroCycleIdx % destacados.length];
        heroCycleIdx++;
        const sec1 = regulares[regIdx++];
        const sec2 = regulares[regIdx++];
        grupos.push([hero, sec1, sec2]);
      }

      return grupos;
    }

    // CASO 2: Si NO hay ningún producto marcado como destacado en la categoría,
    // van rotando en bloques de 3 normalmente
    const grupos: (Producto | undefined)[][] = [];
    for (let i = 0; i < productosEnCategoria.length; i += 3) {
      grupos.push([
        productosEnCategoria[i],
        productosEnCategoria[i + 1],
        productosEnCategoria[i + 2],
      ]);
    }
    return grupos;
  }, [activeCategory, productosEnCategoria]);

  // Asegurar que activeSlideIndex nunca quede fuera de rango si la categoría cambia
  useEffect(() => {
    if (activeSlideIndex >= slides.length && slides.length > 0) {
      setActiveSlideIndex(0);
    }
  }, [activeSlideIndex, slides.length]);

  // Productos visibles en el slide actual
  const currentSlideProducts = slides[activeSlideIndex] || slides[0] || [];
  const heroProduct: Producto | undefined = currentSlideProducts[0];
  const secondaryProduct1: Producto | undefined = currentSlideProducts[1];
  const secondaryProduct2: Producto | undefined = currentSlideProducts[2];

  // Precio del combo de papas desde la base de datos
  const precioPapasCombo = currentConfig?.precio_papas_combo || 1500;

  // Temporizador de rotación de productos y categorías (recorre todos los slides antes de cambiar)
  useEffect(() => {
    if (categoriasConProductos.length === 0 || slides.length === 0) return;

    const timer = setInterval(() => {
      setActiveSlideIndex((prevSlide) => {
        if (prevSlide + 1 < slides.length) {
          return prevSlide + 1;
        } else {
          setActiveCategoryIndex((prevCat) => (prevCat + 1) % categoriasConProductos.length);
          return 0;
        }
      });
    }, rotacionSegundos * 1000);

    return () => clearInterval(timer);
  }, [categoriasConProductos.length, slides.length, rotacionSegundos]);

  // Formato chileno CLP
  const formatoPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(precio);
  };

  const toggleFullscreen = () => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const whatsappDisplay = useMemo(() => {
    return getWhatsAppDisplay(currentConfig?.telefono_whatsapp);
  }, [currentConfig]);

  // Mensajes reales del ticker inferior desde la base de datos
  const mensajesTicker: string[] = useMemo(() => {
    if (currentConfig?.cintillo_mensajes && currentConfig.cintillo_mensajes.length > 0) {
      return currentConfig.cintillo_mensajes;
    }
    if (currentConfig?.cintillo_texto) {
      return [currentConfig.cintillo_texto];
    }
    return [
      '¡Bienvenido a Billy Burger!',
      `Pide al WhatsApp ${whatsappDisplay}`,
      'Retiro en Local & Delivery Curauma',
    ];
  }, [currentConfig, whatsappDisplay]);

  if (loading || !activeCategory) {
    return (
      <div className="fixed inset-0 bg-[#0d0906] flex items-center justify-center text-white z-50">
        <BillyLoader size={90} text={`Cargando Pantalla ${pantallaId} Billy Burger...`} />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 w-full h-full min-h-[100dvh] max-h-[100dvh] text-white overflow-hidden flex flex-col font-sans select-none z-50 bg-[#0d0906]"
      style={{
        background: 'radial-gradient(ellipse at 35% 35%, #18110b 0%, #0d0906 100%)',
      }}
    >
      {/* ========================================================
          1. HEADER PRINCIPAL (LOGO CON PANTALLA COMPLETA, CATEGORÍAS & SELECTOR)
         ======================================================== */}
      <header className="h-[clamp(50px,6.8vh,66px)] bg-[#120c08]/95 px-[clamp(12px,1.8vw,28px)] flex items-center justify-between shrink-0 z-30 shadow-md shadow-black/40">
        {/* Left: Brand Identity + Logo Circular Interactivo para Pantalla Completa */}
        <div className="flex items-center gap-[clamp(8px,1.2vw,16px)] shrink-0">
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Pantalla Completa (Clic aquí)"
            aria-label="Alternar Pantalla Completa"
            className="relative group cursor-pointer w-[clamp(36px,5vh,46px)] h-[clamp(36px,5vh,46px)] rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 p-1 shadow-lg shadow-amber-500/25 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all duration-200 outline-none focus:ring-2 focus:ring-amber-400"
          >
            <Image
              src="/images/logo-icon.png"
              alt="Billy Burger Icon"
              width={38}
              height={38}
              className="w-full h-full object-contain pointer-events-none drop-shadow"
              priority
            />
            {/* Indicador sutil de pantalla completa */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#120c08] border border-amber-400/80 flex items-center justify-center text-amber-300 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition shadow">
              <Maximize2 className="w-2 h-2" />
            </span>
          </button>

          <div className="flex items-center gap-2">
            <Image
              src="/images/logo-text.png"
              alt="Billy BURGER"
              width={140}
              height={40}
              className="h-[clamp(26px,3.8vh,38px)] w-auto object-contain filter drop-shadow-md"
              priority
            />
            <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#22160e] text-[#c9b7a5] text-[clamp(10px,0.85vw,11px)] font-bold tracking-wider">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              CURAUMA · VALPARAÍSO
            </span>
          </div>
        </div>

        {/* Center: Categorías Reales con Productos en esta Pantalla */}
        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-none flex-1 max-w-[55%] justify-center px-2">
          {categoriasConProductos.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategoryIndex(idx);
                setActiveSlideIndex(0);
              }}
              className={`px-[clamp(10px,1.2vw,14px)] py-[clamp(4px,0.7vh,7px)] rounded-full text-[clamp(10px,0.88vw,12px)] font-montserrat font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                idx === activeCategoryIndex
                  ? 'bg-amber-500 text-[#0d0906] shadow-md shadow-amber-500/25'
                  : 'bg-[#22160e] text-[#b8a796] hover:text-white hover:bg-[#301f14]'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Right: Switcher Pantallas 1 y 2 */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-[#1a110a] p-0.5 md:p-1 rounded-full shadow-inner">
            <button
              type="button"
              onClick={() => cambiarPantalla(1)}
              className={`px-2.5 md:px-3 py-0.5 md:py-1 rounded-full text-[clamp(10px,0.8vw,12px)] font-black uppercase tracking-wider transition-all duration-200 ${
                pantallaId === 1
                  ? 'bg-amber-500 text-[#0d0906] shadow-sm'
                  : 'text-[#9e8d7c] hover:text-white'
              }`}
            >
              1
            </button>
            <button
              type="button"
              onClick={() => cambiarPantalla(2)}
              className={`px-2.5 md:px-3 py-0.5 md:py-1 rounded-full text-[clamp(10px,0.8vw,12px)] font-black uppercase tracking-wider transition-all duration-200 ${
                pantallaId === 2
                  ? 'bg-amber-500 text-[#0d0906] shadow-sm'
                  : 'text-[#9e8d7c] hover:text-white'
              }`}
            >
              2
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          2. MAIN MENUBOARD STAGE (ADAPTABLE A CUALQUIER RESOLUCIÓN)
         ======================================================== */}
      <main className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-[clamp(10px,1.5vw,22px)] p-[clamp(10px,1.5vw,22px)] min-h-0 overflow-y-auto md:overflow-hidden relative">
        {/* Glow de ambiente cálido ámbar */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[clamp(300px,40vw,520px)] h-[clamp(300px,40vw,520px)] bg-amber-600/12 blur-[140px] rounded-full pointer-events-none" />

        {/* --------------------------------------------------------
            LEFT STAGE: SECCIÓN DE DESTACADOS CON LA IMAGEN DE LA MESA DE FONDO
           -------------------------------------------------------- */}
        <section className="w-full md:col-span-5 rounded-2xl md:rounded-3xl p-[clamp(14px,1.8vw,26px)] shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col justify-between relative overflow-hidden group min-h-0">
          {/* IMAGEN DE FONDO PERMANENTE DE LA MESA DE MADERA */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-102"
            style={{
              backgroundImage: "url('/images/plantilla-fondo-burger.png')",
            }}
          />

          {/* Degradado oscuro en la parte superior para legibilidad de textos */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e0a07]/95 via-[#0e0a07]/80 to-transparent pointer-events-none" />

          {/* Halo sutil de luz ámbar sobre la mesa */}
          <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />

          {/* 1. Header de la tarjeta de destacados */}
          <div className="flex items-center justify-between z-10 shrink-0 mb-[clamp(8px,1vh,14px)]">
            <div className="flex items-center gap-2">
              <span className="px-[clamp(10px,1.2vw,14px)] py-[clamp(4px,0.6vh,6px)] rounded-full bg-[#0e0a07]/85 backdrop-blur-md text-amber-400 font-montserrat text-[clamp(10px,0.85vw,12px)] font-black uppercase tracking-wider shadow-md">
                {activeCategory.nombre}
              </span>
              {heroProduct?.es_destacado && (
                <span className="px-[clamp(8px,1vw,12px)] py-[clamp(4px,0.6vh,6px)] rounded-full bg-amber-500/30 backdrop-blur-md text-amber-200 text-[clamp(10px,0.85vw,12px)] font-black uppercase tracking-wider shadow-md">
                  ⭐ Destacado
                </span>
              )}
            </div>

            {slides.length > 1 && (
              <span className="text-[clamp(9px,0.75vw,11px)] font-black uppercase tracking-widest text-[#d6c7b7] bg-[#0e0a07]/70 px-2.5 py-1 rounded-full backdrop-blur-sm">
                {activeSlideIndex + 1} / {slides.length}
              </span>
            )}
          </div>

          {/* 2. INFORMACIÓN DEL PRODUCTO */}
          {heroProduct && (
            <div className="z-10 flex flex-col shrink-0 gap-[clamp(6px,1vh,12px)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 pr-1">
                  <h2 className="font-montserrat font-black text-[clamp(1.25rem,2.2vw,2.4rem)] text-[#fff9f2] uppercase tracking-tight leading-tight drop-shadow-md line-clamp-2">
                    {heroProduct.nombre}
                  </h2>

                  {/* Precio secundario real si existe (ej. Sin Papas) */}
                  {heroProduct.precio_secundario && (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#0e0a07]/85 backdrop-blur-md shadow-sm">
                      <span className="text-[#a89685] text-[clamp(10px,0.8vw,11px)] uppercase font-bold tracking-wider">
                        {heroProduct.etiqueta_precio_secundario || 'Opción'}:
                      </span>
                      <span className="font-mono-price font-black text-[clamp(0.95rem,1.3vw,1.3rem)] text-[#f3ece4]">
                        {formatoPrecio(heroProduct.precio_secundario)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Precio destacado principal */}
                <div className="text-right shrink-0">
                  <span className="text-[clamp(9px,0.7vw,10px)] uppercase font-extrabold text-[#d6c7b7] block tracking-wider mb-0.5">
                    Precio
                  </span>
                  <span className="font-mono-price font-black text-[clamp(1.75rem,3.2vw,3.2rem)] text-amber-400 tracking-tight drop-shadow-md leading-none">
                    {formatoPrecio(heroProduct.precio)}
                  </span>
                </div>
              </div>

              {/* Descripción con texto fluido y clamp de líneas para no empujar la imagen */}
              {heroProduct.descripcion && (
                <div className="bg-[#0e0a07]/85 backdrop-blur-md px-3.5 py-2.5 md:py-3 rounded-xl md:rounded-2xl shadow-lg border border-amber-500/10">
                  <p className="font-inter text-[#fff4e8] text-[clamp(0.85rem,1.15vw,1.15rem)] font-semibold leading-snug line-clamp-3 md:line-clamp-4">
                    {heroProduct.descripcion}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. IMAGEN DEL PRODUCTO (FLUIDA, ADAPTADA AL ESPACIO VERTICAL DISPONIBLE) */}
          {heroProduct?.imagen_url ? (
            <div className="relative flex-1 min-h-[120px] max-h-[45vh] flex items-end justify-center z-10 pb-[clamp(10px,3vh,36px)] mt-2">
              {/* Sombra de contacto directamente sobre la madera de la mesa */}
              <div className="absolute bottom-[clamp(10px,3vh,36px)] left-1/2 -translate-x-1/2 w-[clamp(140px,22vw,280px)] h-[clamp(12px,2vh,22px)] bg-black/95 blur-md rounded-full pointer-events-none" />
              <div className="relative w-full h-full max-h-[clamp(140px,36vh,320px)] flex items-end justify-center">
                <Image
                  src={heroProduct.imagen_url}
                  alt={heroProduct.nombre}
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-contain object-bottom filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.9)]"
                  priority
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0" />
          )}
        </section>

        {/* --------------------------------------------------------
            RIGHT STAGE: PRODUCTOS SECUNDARIOS (TARJETAS AJUSTABLES A LA VENTANA)
           -------------------------------------------------------- */}
        <section className="w-full md:col-span-7 flex flex-col gap-[clamp(10px,1.5vh,18px)] justify-between flex-1 min-h-0">
          {/* TARJETA 2 (PRODUCTO SECUNDARIO 1 O PROMO COMBO PAPAS) */}
          {secondaryProduct1 ? (
            <div className="flex-1 min-h-0 rounded-2xl md:rounded-3xl p-[clamp(12px,1.5vw,22px)] shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between relative overflow-hidden group">
              {/* Fondo de madera con toque oscuro elegante */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-102"
                style={{
                  backgroundImage: "url('/images/madera-bg.jpg')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0906]/95 via-[#140c08]/90 to-[#0e0a07]/85 pointer-events-none" />

              <div className="flex items-start justify-between gap-3 shrink-0 z-10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 md:py-1 rounded-full bg-[#0e0a07]/80 backdrop-blur-sm text-amber-400 font-montserrat text-[clamp(10px,0.85vw,11px)] font-black uppercase tracking-wider border border-amber-500/20">
                    {activeCategory.nombre}
                  </span>
                  {secondaryProduct1.es_destacado && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-200 text-[clamp(10px,0.85vw,11px)] font-black uppercase tracking-wider backdrop-blur-sm">
                      ⭐ Destacado
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[clamp(9px,0.7vw,10px)] font-black uppercase tracking-widest text-[#a89685] block">
                    PRECIO
                  </span>
                  <span className="font-mono-price font-black text-[clamp(1.5rem,2.4vw,2.5rem)] text-amber-400 tracking-tight leading-none drop-shadow">
                    {formatoPrecio(secondaryProduct1.precio)}
                  </span>
                </div>
              </div>

              {/* Contenido con imagen adaptable */}
              <div className="my-auto flex items-center gap-[clamp(10px,1.5vw,20px)] z-10 py-1">
                {secondaryProduct1.imagen_url && (
                  <div className="relative w-[clamp(64px,8vw,110px)] h-[clamp(64px,8vw,110px)] rounded-xl md:rounded-2xl overflow-hidden shrink-0 bg-[#0e0a07]/80 flex items-center justify-center border border-white/5">
                    <Image
                      src={secondaryProduct1.imagen_url}
                      alt={secondaryProduct1.nombre}
                      fill
                      sizes="(max-width: 768px) 80px, 110px"
                      className="object-contain p-1.5 filter drop-shadow-md z-10"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-montserrat font-black text-[clamp(1.1rem,1.7vw,1.75rem)] text-[#fff9f2] uppercase tracking-tight mb-1 drop-shadow-sm line-clamp-1">
                    {secondaryProduct1.nombre}
                  </h3>

                  {secondaryProduct1.descripcion && (
                    <div className="bg-[#0e0a07]/85 backdrop-blur-md p-2.5 md:p-3 rounded-xl border border-white/5 shadow-md">
                      <p className="font-inter text-[#ded2c4] text-[clamp(0.78rem,1vw,1rem)] font-medium leading-snug line-clamp-2 md:line-clamp-3">
                        {secondaryProduct1.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Precio secundario real si existe */}
              {secondaryProduct1.precio_secundario && (
                <div className="flex items-center gap-1.5 pt-0.5 text-xs z-10">
                  <span className="text-[#a89685] uppercase font-bold text-[clamp(10px,0.8vw,11px)]">
                    {secondaryProduct1.etiqueta_precio_secundario || 'Opción'}:
                  </span>
                  <span className="font-mono-price font-bold text-[#f3ece4] text-[clamp(0.85rem,1.1vw,1.1rem)]">
                    {formatoPrecio(secondaryProduct1.precio_secundario)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* TARJETA PROMO 1: COMBO PAPAS FRITAS */
            <div className="flex-1 min-h-0 rounded-2xl md:rounded-3xl p-[clamp(12px,1.5vw,22px)] shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between relative overflow-hidden group border border-amber-500/20">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-102 opacity-80"
                style={{
                  backgroundImage: "url('/images/madera-bg.jpg')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0906]/95 via-[#180f08]/90 to-[#0e0a07]/85 pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

              <div className="flex items-start justify-between gap-3 shrink-0 z-10">
                <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-montserrat text-[clamp(10px,0.85vw,11px)] font-black uppercase tracking-wider border border-amber-500/30">
                  🍟 ¡Hazlo Combo!
                </span>
                <div className="text-right">
                  <span className="text-[clamp(9px,0.7vw,10px)] font-black uppercase tracking-widest text-[#a89685] block">
                    ADICIONAL
                  </span>
                  <span className="font-mono-price font-black text-[clamp(1.5rem,2.4vw,2.5rem)] text-amber-400 tracking-tight leading-none drop-shadow">
                    +{formatoPrecio(precioPapasCombo)}
                  </span>
                </div>
              </div>

              <div className="my-auto z-10 py-1">
                <h3 className="font-montserrat font-black text-[clamp(1.1rem,1.7vw,1.75rem)] text-[#fff9f2] uppercase tracking-tight mb-1 line-clamp-1">
                  Agrega Papas Fritas Crujientes
                </h3>
                <div className="bg-[#0e0a07]/85 backdrop-blur-md p-2.5 md:p-3 rounded-xl border border-amber-500/10 shadow-md">
                  <p className="font-inter text-[#ded2c4] text-[clamp(0.78rem,1vw,1rem)] font-medium leading-snug line-clamp-2 md:line-clamp-3">
                    Suma una porción dorada y crujiente de papas fritas a cualquiera de tus platos para disfrutar la experiencia completa Billy Burger.
                  </p>
                </div>
              </div>

              <div className="z-10 flex items-center gap-1.5 pt-0.5 text-[clamp(10px,0.8vw,11px)] text-amber-400 font-black uppercase tracking-wider">
                <span>✦ Pídelo directo en caja o por WhatsApp</span>
              </div>
            </div>
          )}

          {/* TARJETA 3 (PRODUCTO SECUNDARIO 2 O PROMO EVENTOS & RESERVAS) */}
          {secondaryProduct2 ? (
            <div className="flex-1 min-h-0 rounded-2xl md:rounded-3xl p-[clamp(12px,1.5vw,22px)] shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between relative overflow-hidden group">
              {/* Fondo de madera con toque oscuro elegante */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-102"
                style={{
                  backgroundImage: "url('/images/madera-bg.jpg')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0906]/95 via-[#140c08]/90 to-[#0e0a07]/85 pointer-events-none" />

              <div className="flex items-start justify-between gap-3 shrink-0 z-10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 md:py-1 rounded-full bg-[#0e0a07]/80 backdrop-blur-sm text-amber-400 font-montserrat text-[clamp(10px,0.85vw,11px)] font-black uppercase tracking-wider border border-amber-500/20">
                    {activeCategory.nombre}
                  </span>
                  {secondaryProduct2.es_destacado && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-200 text-[clamp(10px,0.85vw,11px)] font-black uppercase tracking-wider backdrop-blur-sm">
                      ⭐ Destacado
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[clamp(9px,0.7vw,10px)] font-black uppercase tracking-widest text-[#a89685] block">
                    PRECIO
                  </span>
                  <span className="font-mono-price font-black text-[clamp(1.5rem,2.4vw,2.5rem)] text-amber-400 tracking-tight leading-none drop-shadow">
                    {formatoPrecio(secondaryProduct2.precio)}
                  </span>
                </div>
              </div>

              {/* Contenido con imagen adaptable */}
              <div className="my-auto flex items-center gap-[clamp(10px,1.5vw,20px)] z-10 py-1">
                {secondaryProduct2.imagen_url && (
                  <div className="relative w-[clamp(64px,8vw,110px)] h-[clamp(64px,8vw,110px)] rounded-xl md:rounded-2xl overflow-hidden shrink-0 bg-[#0e0a07]/80 flex items-center justify-center border border-white/5">
                    <Image
                      src={secondaryProduct2.imagen_url}
                      alt={secondaryProduct2.nombre}
                      fill
                      sizes="(max-width: 768px) 80px, 110px"
                      className="object-contain p-1.5 filter drop-shadow-md z-10"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-montserrat font-black text-[clamp(1.1rem,1.7vw,1.75rem)] text-[#fff9f2] uppercase tracking-tight mb-1 drop-shadow-sm line-clamp-1">
                    {secondaryProduct2.nombre}
                  </h3>

                  {secondaryProduct2.descripcion && (
                    <div className="bg-[#0e0a07]/85 backdrop-blur-md p-2.5 md:p-3 rounded-xl border border-white/5 shadow-md">
                      <p className="font-inter text-[#ded2c4] text-[clamp(0.78rem,1vw,1rem)] font-medium leading-snug line-clamp-2 md:line-clamp-3">
                        {secondaryProduct2.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Precio secundario real si existe */}
              {secondaryProduct2.precio_secundario && (
                <div className="flex items-center gap-1.5 pt-0.5 text-xs z-10">
                  <span className="text-[#a89685] uppercase font-bold text-[clamp(10px,0.8vw,11px)]">
                    {secondaryProduct2.etiqueta_precio_secundario || 'Opción'}:
                  </span>
                  <span className="font-mono-price font-bold text-[#f3ece4] text-[clamp(0.85rem,1.1vw,1.1rem)]">
                    {formatoPrecio(secondaryProduct2.precio_secundario)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* TARJETA PROMO 2: EVENTOS & CELEBRACIONES */
            <div className="flex-1 min-h-0 rounded-2xl md:rounded-3xl p-[clamp(12px,1.5vw,22px)] shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between relative overflow-hidden group border border-amber-500/20">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-102 opacity-80"
                style={{
                  backgroundImage: "url('/images/madera-bg.jpg')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0906]/95 via-[#180f08]/90 to-[#0e0a07]/85 pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />

              <div className="flex items-start justify-between gap-3 shrink-0 z-10">
                <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-montserrat text-[clamp(10px,0.85vw,11px)] font-black uppercase tracking-wider border border-amber-500/30">
                  🎉 Eventos & Cumpleaños
                </span>
                <span className="text-[clamp(10px,0.85vw,11px)] font-black uppercase tracking-wider text-amber-400 bg-[#0e0a07]/80 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Cotizaciones
                </span>
              </div>

              <div className="my-auto z-10 py-1">
                <h3 className="font-montserrat font-black text-[clamp(1.1rem,1.7vw,1.75rem)] text-[#fff9f2] uppercase tracking-tight mb-1 line-clamp-1">
                  ¿Quieres que seamos parte de tu celebración?
                </h3>
                <div className="bg-[#0e0a07]/85 backdrop-blur-md p-2.5 md:p-3 rounded-xl border border-amber-500/10 shadow-md">
                  <p className="font-inter text-[#ded2c4] text-[clamp(0.78rem,1vw,1rem)] font-medium leading-snug line-clamp-2 md:line-clamp-3">
                    Cotiza con nosotros una experiencia llena de sabor para tus reuniones, cumpleaños y celebraciones familiares o de empresa.
                  </p>
                </div>
              </div>

              <div className="z-10 flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-1.5 bg-[#0e0a07]/90 px-3 py-1 rounded-full border border-amber-500/30">
                  <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="text-[clamp(10px,0.85vw,12px)] font-mono font-black text-amber-300 tracking-wider">
                    {whatsappDisplay}
                  </span>
                </div>
                <span className="text-[clamp(10px,0.85vw,11px)] font-black uppercase tracking-wider text-[#ded2c4]">
                  Curauma · Valparaíso
                </span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ========================================================
          3. FOOTER RUNNING TICKER (CINTA FLUIDA Y CEÑIDA AL TEXTO)
         ======================================================== */}
      <footer className="h-[clamp(32px,4.5vh,42px)] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-[#0d0906] flex items-center overflow-hidden shrink-0 shadow-2xl z-30 py-0">
        <div className="whitespace-nowrap animate-marquee flex items-center gap-[clamp(16px,2vw,32px)] pl-4 text-[clamp(13px,1.4vw,20px)] font-montserrat font-black uppercase tracking-tight leading-none">
          <div className="flex items-center gap-1.5 bg-[#0d0906] text-amber-400 px-2 py-0.5 rounded-full shadow-inner text-[clamp(11px,1vw,14px)] font-black">
            <Phone className="w-[clamp(11px,1vw,14px)] h-[clamp(11px,1vw,14px)] shrink-0" />
            <span>PEDIDOS WHATSAPP {whatsappDisplay}</span>
          </div>
          <span className="text-[#0d0906]/40 text-sm font-mono">✦</span>
          <span>RETIRO EN LOCAL & DELIVERY CURAUMA</span>
          <span className="text-[#0d0906]/40 text-sm font-mono">✦</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-[clamp(12px,1.1vw,16px)] h-[clamp(12px,1.1vw,16px)] text-[#0d0906] shrink-0" />
            <span>LUN - DOM • 18:00 A 23:30 HRS (VIE/SÁB HASTA 00:30)</span>
          </div>
          <span className="text-[#0d0906]/40 text-sm font-mono">✦</span>

          {mensajesTicker.map((msg, i) => (
            <React.Fragment key={`orig-${i}`}>
              <span>{msg}</span>
              <span className="text-[#0d0906]/40 text-sm font-mono">✦</span>
            </React.Fragment>
          ))}

          {/* Duplicado para loop continuo fluido */}
          <div className="flex items-center gap-1.5 bg-[#0d0906] text-amber-400 px-2 py-0.5 rounded-full shadow-inner text-[clamp(11px,1vw,14px)] font-black">
            <Phone className="w-[clamp(11px,1vw,14px)] h-[clamp(11px,1vw,14px)] shrink-0" />
            <span>PEDIDOS WHATSAPP {whatsappDisplay}</span>
          </div>
          <span className="text-[#0d0906]/40 text-sm font-mono">✦</span>
          <span>RETIRO EN LOCAL & DELIVERY CURAUMA</span>
          <span className="text-[#0d0906]/40 text-sm font-mono">✦</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-[clamp(12px,1.1vw,16px)] h-[clamp(12px,1.1vw,16px)] text-[#0d0906] shrink-0" />
            <span>LUN - DOM • 18:00 A 23:30 HRS (VIE/SÁB HASTA 00:30)</span>
          </div>
          <span className="text-[#0d0906]/40 text-sm font-mono">✦</span>

          {mensajesTicker.map((msg, i) => (
            <React.Fragment key={`rep-${i}`}>
              <span>{msg}</span>
              <span className="text-[#0d0906]/40 text-sm font-mono">✦</span>
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
        <div className="fixed inset-0 bg-[#0d0906] flex items-center justify-center text-white z-50">
          <BillyLoader size={90} text="Iniciando Menuboard TV..." />
        </div>
      }
    >
      <TVMenuboardContent />
    </Suspense>
  );
}
