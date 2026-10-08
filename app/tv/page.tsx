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
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Determinar estado real de la cocina / local
  const cocinaAbierta = useMemo(() => {
    const horario = currentConfig?.horario_atencion;
    if (horario?.modoForzado === 'cerrado') return false;
    if (horario?.modoForzado === 'abierto') return true;

    if (!horario?.habilitado || !horario?.dias) return true;

    try {
      const now = new Date();
      const diaActual = now.getDay();
      const configDia = horario.dias.find((d) => d.dia === diaActual);

      if (!configDia || !configDia.abierto) return false;

      const horaActualMin = now.getHours() * 60 + now.getMinutes();
      const [apH, apM] = configDia.horaApertura.split(':').map(Number);
      const [ciH, ciM] = configDia.horaCierre.split(':').map(Number);

      const horaApMin = apH * 60 + apM;
      let horaCiMin = ciH * 60 + ciM;

      if (horaCiMin < horaApMin) {
        horaCiMin += 24 * 60;
      }

      return horaActualMin >= horaApMin && horaActualMin <= horaCiMin;
    } catch {
      return true;
    }
  }, [currentConfig]);

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
      className="fixed inset-0 w-screen h-screen text-white overflow-hidden flex flex-col font-sans select-none z-50 bg-[#0d0906]"
      style={{
        background: 'radial-gradient(ellipse at 35% 35%, #18110b 0%, #0d0906 100%)',
      }}
    >
      {/* ========================================================
          1. HEADER PRINCIPAL (LOGO ORIGINAL, CATEGORÍAS & STATUS)
         ======================================================== */}
      <header className="h-16 lg:h-18 bg-[#120c08]/95 px-6 lg:px-8 flex items-center justify-between shrink-0 z-30 shadow-md shadow-black/40">
        {/* Left: Brand Identity (Icono + TÍTULO ORIGINAL logo-text.png) */}
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 p-1.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
            <Image
              src="/images/logo-icon.png"
              alt="Billy Burger Icon"
              width={34}
              height={34}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Título Original con logo-text.png */}
            <Image
              src="/images/logo-text.png"
              alt="Billy BURGER"
              width={150}
              height={45}
              className="h-9 lg:h-10 w-auto object-contain filter drop-shadow-md"
              priority
            />
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#22160e] text-[#c9b7a5] text-[11px] font-bold tracking-wider">
              <MapPin className="w-3 h-3 text-amber-400" />
              CURAUMA · VALPARAÍSO
            </span>
          </div>
        </div>

        {/* Center: Categorías Reales con Productos en esta Pantalla */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none max-w-[50%]">
          {categoriasConProductos.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategoryIndex(idx);
                setActiveSlideIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-montserrat font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                idx === activeCategoryIndex
                  ? 'bg-amber-500 text-[#0d0906] shadow-md shadow-amber-500/25'
                  : 'bg-[#22160e] text-[#b8a796] hover:text-white hover:bg-[#301f14]'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Right: Switcher Pantallas 1 y 2, Estado y Pantalla Completa */}
        <div className="flex items-center gap-3">
          {/* Switcher Pantallas */}
          <div className="flex items-center gap-1 bg-[#1a110a] p-1 rounded-full shadow-inner">
            <button
              type="button"
              onClick={() => cambiarPantalla(1)}
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 ${
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
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                pantallaId === 2
                  ? 'bg-amber-500 text-[#0d0906] shadow-sm'
                  : 'text-[#9e8d7c] hover:text-white'
              }`}
            >
              2
            </button>
          </div>

          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black tracking-wider ${
              cocinaAbierta
                ? 'bg-[#0e2417] text-emerald-400'
                : 'bg-[#290e0e] text-red-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                cocinaAbierta ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
              }`}
            />
            <span className="hidden md:inline">{cocinaAbierta ? 'COCINA ABIERTA' : 'LOCAL CERRADO'}</span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-lg bg-[#22160e] hover:bg-[#301f14] flex items-center justify-center text-[#d6c7b7] hover:text-white transition"
            title="Pantalla Completa (F11)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ========================================================
          2. MAIN MENUBOARD STAGE
         ======================================================== */}
      <main className="flex-1 grid grid-cols-12 gap-5 lg:gap-6 p-5 lg:p-6 min-h-0 overflow-hidden relative">
        {/* Glow de ambiente cálido ámbar */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-amber-600/12 blur-[140px] rounded-full pointer-events-none" />

        {/* --------------------------------------------------------
            LEFT STAGE: SECCIÓN DE DESTACADOS CON LA IMAGEN DE LA MESA DE FONDO
            "los productos con imagen , del lado de destacados , deben estar, informacion y luego la imagen para que haga el efecto que estan sobre la mesa"
           -------------------------------------------------------- */}
        <section className="col-span-5 rounded-3xl p-6 lg:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col justify-between relative overflow-hidden group">
          {/* IMAGEN DE FONDO PERMANENTE DE LA MESA DE MADERA */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-102"
            style={{
              backgroundImage: "url('/images/plantilla-fondo-burger.png')",
            }}
          />

          {/* Degradado oscuro en la parte superior para legibilidad de textos, dejando la mesa clara abajo */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e0a07]/95 via-[#0e0a07]/80 to-transparent pointer-events-none" />

          {/* Halo sutil de luz ámbar sobre la mesa */}
          <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />

          {/* 1. Header de la tarjeta de destacados (Badges con buen espaciado) */}
          <div className="flex items-center justify-between z-10 shrink-0 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-[#0e0a07]/85 backdrop-blur-md text-amber-400 font-montserrat text-xs font-black uppercase tracking-wider shadow-md">
                {activeCategory.nombre}
              </span>
              {heroProduct?.es_destacado && (
                <span className="px-3 py-1.5 rounded-full bg-amber-500/30 backdrop-blur-md text-amber-200 text-xs font-black uppercase tracking-wider shadow-md">
                  ⭐ Destacado
                </span>
              )}
            </div>

            {slides.length > 1 && (
              <span className="text-[11px] font-black uppercase tracking-widest text-[#d6c7b7] bg-[#0e0a07]/70 px-2.5 py-1 rounded-full backdrop-blur-sm">
                {activeSlideIndex + 1} / {slides.length}
              </span>
            )}
          </div>

          {/* 2. INFORMACIÓN DEL PRODUCTO (ARRIBA - CON AIRE, ESPACIADO CÓMODO Y NO APRETADA) */}
          {heroProduct && (
            <div className="z-10 flex flex-col shrink-0 gap-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 pr-2">
                  <h2 className="font-montserrat font-black text-2xl lg:text-3xl xl:text-4xl text-[#fff9f2] uppercase tracking-tight leading-tight drop-shadow-md">
                    {heroProduct.nombre}
                  </h2>

                  {/* Precio secundario real si existe (ej. Sin Papas) */}
                  {heroProduct.precio_secundario && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#0e0a07]/85 backdrop-blur-md shadow-sm">
                      <span className="text-[#a89685] text-xs uppercase font-bold tracking-wider">
                        {heroProduct.etiqueta_precio_secundario || 'Opción'}:
                      </span>
                      <span className="font-mono-price font-black text-lg lg:text-xl text-[#f3ece4]">
                        {formatoPrecio(heroProduct.precio_secundario)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Precio destacado principal */}
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-extrabold text-[#d6c7b7] block tracking-wider mb-0.5">
                    Precio
                  </span>
                  <span className="font-mono-price font-black text-3xl lg:text-4xl xl:text-5xl text-amber-400 tracking-tight drop-shadow-md leading-none">
                    {formatoPrecio(heroProduct.precio)}
                  </span>
                </div>
              </div>

              {/* Descripción real holgada y con tamaño al doble para lectura clara */}
              {heroProduct.descripcion && (
                <div className="bg-[#0e0a07]/85 backdrop-blur-md px-4 py-3.5 rounded-2xl shadow-lg border border-amber-500/10">
                  <p className="font-inter text-[#fff4e8] text-base lg:text-xl xl:text-[22px] font-semibold leading-snug">
                    {heroProduct.descripcion}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. IMAGEN DEL PRODUCTO (SUBIDA MÁS ALTA PARA ASENTARSE EN EL CORAZÓN DE LA MESA) */}
          {heroProduct?.imagen_url ? (
            <div className="relative flex-1 flex items-end justify-center z-10 pb-24 lg:pb-32 mt-2">
              {/* Sombra de contacto directamente sobre la madera de la mesa */}
              <div className="absolute bottom-24 lg:bottom-32 left-1/2 -translate-x-1/2 w-64 lg:w-72 h-7 bg-black/95 blur-md rounded-full pointer-events-none" />
              <div className="relative w-full h-[230px] lg:h-[270px] xl:h-[290px]">
                <Image
                  src={heroProduct.imagen_url}
                  alt={heroProduct.nombre}
                  fill
                  className="object-contain object-bottom filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.9)]"
                  priority
                />
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}
        </section>

        {/* --------------------------------------------------------
            RIGHT STAGE: PRODUCTOS SECUNDARIOS (SIN LA IMAGEN DE LA MESA, SOLO EN DESTACADOS)
           -------------------------------------------------------- */}
        <section className="col-span-7 flex flex-col gap-4 lg:gap-5 justify-between flex-1 min-h-0">
          {/* TARJETA 2 (PRODUCTO SECUNDARIO 1 O TARJETA PROMO COMBO PAPAS) */}
          {secondaryProduct1 ? (
            <div className="flex-1 rounded-3xl p-6 lg:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between relative overflow-hidden group">
              {/* Fondo de madera con toque oscuro elegante */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-102"
                style={{
                  backgroundImage: "url('/images/madera-bg.jpg')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0906]/95 via-[#140c08]/90 to-[#0e0a07]/85 pointer-events-none" />

              <div className="flex items-start justify-between gap-4 shrink-0 z-10">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#0e0a07]/80 backdrop-blur-sm text-amber-400 font-montserrat text-xs font-black uppercase tracking-wider border border-amber-500/20">
                    {activeCategory.nombre}
                  </span>
                  {secondaryProduct1.es_destacado && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/25 text-amber-200 text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                      ⭐ Destacado
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#a89685] block">
                    PRECIO
                  </span>
                  <span className="font-mono-price font-black text-3xl lg:text-4xl xl:text-5xl text-amber-400 tracking-tight leading-none drop-shadow">
                    {formatoPrecio(secondaryProduct1.precio)}
                  </span>
                </div>
              </div>

              {/* Contenido con imagen limpia si está subida a la app */}
              <div className="my-auto flex items-center gap-5 z-10">
                {secondaryProduct1.imagen_url && (
                  <div className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden shrink-0 bg-[#0e0a07]/80 flex items-center justify-center border border-white/5">
                    <Image
                      src={secondaryProduct1.imagen_url}
                      alt={secondaryProduct1.nombre}
                      fill
                      className="object-contain p-2 filter drop-shadow-md z-10"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-montserrat font-black text-2xl lg:text-3xl text-[#fff9f2] uppercase tracking-tight mb-2 drop-shadow-sm">
                    {secondaryProduct1.nombre}
                  </h3>

                  {secondaryProduct1.descripcion && (
                    <div className="bg-[#0e0a07]/85 backdrop-blur-md p-3.5 rounded-2xl border border-white/5 shadow-md">
                      <p className="font-inter text-[#ded2c4] text-base lg:text-lg xl:text-xl font-medium leading-relaxed">
                        {secondaryProduct1.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Precio secundario real si existe */}
              {secondaryProduct1.precio_secundario && (
                <div className="flex items-center gap-2 pt-1 text-xs z-10">
                  <span className="text-[#a89685] uppercase font-bold">
                    {secondaryProduct1.etiqueta_precio_secundario || 'Opción'}:
                  </span>
                  <span className="font-mono-price font-bold text-[#f3ece4] text-base">
                    {formatoPrecio(secondaryProduct1.precio_secundario)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* TARJETA PROMO 1: COMBO PAPAS FRITAS (LLENA EL ESPACIO VACÍO CON UPSELLING) */
            <div className="flex-1 rounded-3xl p-6 lg:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between relative overflow-hidden group border border-amber-500/20">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-102 opacity-80"
                style={{
                  backgroundImage: "url('/images/madera-bg.jpg')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0906]/95 via-[#180f08]/90 to-[#0e0a07]/85 pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

              <div className="flex items-start justify-between gap-4 shrink-0 z-10">
                <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-montserrat text-xs font-black uppercase tracking-wider border border-amber-500/30">
                  🍟 ¡Hazlo Combo!
                </span>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#a89685] block">
                    ADICIONAL
                  </span>
                  <span className="font-mono-price font-black text-3xl lg:text-4xl xl:text-5xl text-amber-400 tracking-tight leading-none drop-shadow">
                    +{formatoPrecio(precioPapasCombo)}
                  </span>
                </div>
              </div>

              <div className="my-auto z-10">
                <h3 className="font-montserrat font-black text-2xl lg:text-3xl text-[#fff9f2] uppercase tracking-tight mb-2">
                  Agrega Papas Fritas Crujientes
                </h3>
                <div className="bg-[#0e0a07]/85 backdrop-blur-md p-3.5 rounded-2xl border border-amber-500/10 shadow-md">
                  <p className="font-inter text-[#ded2c4] text-base lg:text-lg xl:text-xl font-medium leading-relaxed">
                    Suma una porción dorada y crujiente de papas fritas a cualquiera de tus platos para disfrutar la experiencia completa Billy Burger.
                  </p>
                </div>
              </div>

              <div className="z-10 flex items-center gap-2 pt-1 text-xs text-amber-400 font-black uppercase tracking-wider">
                <span>✦ Pídelo directo en caja o por WhatsApp</span>
              </div>
            </div>
          )}

          {/* TARJETA 3 (PRODUCTO SECUNDARIO 2 O TARJETA PROMO EVENTOS & RESERVAS) */}
          {secondaryProduct2 ? (
            <div className="flex-1 rounded-3xl p-6 lg:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between relative overflow-hidden group">
              {/* Fondo de madera con toque oscuro elegante */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-102"
                style={{
                  backgroundImage: "url('/images/madera-bg.jpg')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0906]/95 via-[#140c08]/90 to-[#0e0a07]/85 pointer-events-none" />

              <div className="flex items-start justify-between gap-4 shrink-0 z-10">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#0e0a07]/80 backdrop-blur-sm text-amber-400 font-montserrat text-xs font-black uppercase tracking-wider border border-amber-500/20">
                    {activeCategory.nombre}
                  </span>
                  {secondaryProduct2.es_destacado && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/25 text-amber-200 text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                      ⭐ Destacado
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#a89685] block">
                    PRECIO
                  </span>
                  <span className="font-mono-price font-black text-3xl lg:text-4xl xl:text-5xl text-amber-400 tracking-tight leading-none drop-shadow">
                    {formatoPrecio(secondaryProduct2.precio)}
                  </span>
                </div>
              </div>

              {/* Contenido con imagen limpia si está subida a la app */}
              <div className="my-auto flex items-center gap-5 z-10">
                {secondaryProduct2.imagen_url && (
                  <div className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden shrink-0 bg-[#0e0a07]/80 flex items-center justify-center border border-white/5">
                    <Image
                      src={secondaryProduct2.imagen_url}
                      alt={secondaryProduct2.nombre}
                      fill
                      className="object-contain p-2 filter drop-shadow-md z-10"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-montserrat font-black text-2xl lg:text-3xl text-[#fff9f2] uppercase tracking-tight mb-2 drop-shadow-sm">
                    {secondaryProduct2.nombre}
                  </h3>

                  {secondaryProduct2.descripcion && (
                    <div className="bg-[#0e0a07]/85 backdrop-blur-md p-3.5 rounded-2xl border border-white/5 shadow-md">
                      <p className="font-inter text-[#ded2c4] text-base lg:text-lg xl:text-xl font-medium leading-relaxed">
                        {secondaryProduct2.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Precio secundario real si existe */}
              {secondaryProduct2.precio_secundario && (
                <div className="flex items-center gap-2 pt-1 text-xs z-10">
                  <span className="text-[#a89685] uppercase font-bold">
                    {secondaryProduct2.etiqueta_precio_secundario || 'Opción'}:
                  </span>
                  <span className="font-mono-price font-bold text-[#f3ece4] text-base">
                    {formatoPrecio(secondaryProduct2.precio_secundario)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* TARJETA PROMO 2: EVENTOS & CELEBRACIONES (LLENA EL ESPACIO VACÍO) */
            <div className="flex-1 rounded-3xl p-6 lg:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between relative overflow-hidden group border border-amber-500/20">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-102 opacity-80"
                style={{
                  backgroundImage: "url('/images/madera-bg.jpg')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0906]/95 via-[#180f08]/90 to-[#0e0a07]/85 pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />

              <div className="flex items-start justify-between gap-4 shrink-0 z-10">
                <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-montserrat text-xs font-black uppercase tracking-wider border border-amber-500/30">
                  🎉 Eventos & Cumpleaños
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-[#0e0a07]/80 px-3 py-1 rounded-full border border-amber-500/20">
                  Cotizaciones
                </span>
              </div>

              <div className="my-auto z-10">
                <h3 className="font-montserrat font-black text-2xl lg:text-3xl text-[#fff9f2] uppercase tracking-tight mb-2">
                  ¿Quieres que seamos parte de tu celebración?
                </h3>
                <div className="bg-[#0e0a07]/85 backdrop-blur-md p-3.5 rounded-2xl border border-amber-500/10 shadow-md">
                  <p className="font-inter text-[#ded2c4] text-base lg:text-lg xl:text-xl font-medium leading-relaxed">
                    Cotiza con nosotros una experiencia llena de sabor para tus reuniones, cumpleaños y celebraciones familiares o de empresa.
                  </p>
                </div>
              </div>

              <div className="z-10 flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 bg-[#0e0a07]/90 px-3.5 py-1.5 rounded-full border border-amber-500/30">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-mono font-black text-amber-300 tracking-wider">
                    {whatsappDisplay}
                  </span>
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-[#ded2c4]">
                  Curauma · Valparaíso
                </span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ========================================================
          3. FOOTER RUNNING TICKER (CINTA ANGOSTA Y CEÑIDA AL TEXTO)
         ======================================================== */}
      <footer className="h-9 lg:h-10 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-[#0d0906] flex items-center overflow-hidden shrink-0 shadow-2xl z-30 py-0">
        <div className="whitespace-nowrap animate-marquee flex items-center gap-8 pl-4 text-xl lg:text-2xl xl:text-[28px] font-montserrat font-black uppercase tracking-tight leading-none">
          <div className="flex items-center gap-1.5 bg-[#0d0906] text-amber-400 px-2.5 py-0.5 rounded-full shadow-inner text-sm lg:text-base font-black">
            <Phone className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
            <span>PEDIDOS WHATSAPP {whatsappDisplay}</span>
          </div>
          <span className="text-[#0d0906]/40 text-lg lg:text-xl font-mono">✦</span>
          <span>RETIRO EN LOCAL & DELIVERY CURAUMA</span>
          <span className="text-[#0d0906]/40 text-lg lg:text-xl font-mono">✦</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-[#0d0906] shrink-0" />
            <span>LUN - DOM • 18:00 A 23:30 HRS (VIE/SÁB HASTA 00:30)</span>
          </div>
          <span className="text-[#0d0906]/40 text-lg lg:text-xl font-mono">✦</span>

          {mensajesTicker.map((msg, i) => (
            <React.Fragment key={`orig-${i}`}>
              <span>{msg}</span>
              <span className="text-[#0d0906]/40 text-lg lg:text-xl font-mono">✦</span>
            </React.Fragment>
          ))}

          {/* Duplicado para loop continuo fluido */}
          <div className="flex items-center gap-1.5 bg-[#0d0906] text-amber-400 px-2.5 py-0.5 rounded-full shadow-inner text-sm lg:text-base font-black">
            <Phone className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
            <span>PEDIDOS WHATSAPP {whatsappDisplay}</span>
          </div>
          <span className="text-[#0d0906]/40 text-lg lg:text-xl font-mono">✦</span>
          <span>RETIRO EN LOCAL & DELIVERY CURAUMA</span>
          <span className="text-[#0d0906]/40 text-lg lg:text-xl font-mono">✦</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-[#0d0906] shrink-0" />
            <span>LUN - DOM • 18:00 A 23:30 HRS (VIE/SÁB HASTA 00:30)</span>
          </div>
          <span className="text-[#0d0906]/40 text-lg lg:text-xl font-mono">✦</span>

          {mensajesTicker.map((msg, i) => (
            <React.Fragment key={`rep-${i}`}>
              <span>{msg}</span>
              <span className="text-[#0d0906]/40 text-lg lg:text-xl font-mono">✦</span>
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
