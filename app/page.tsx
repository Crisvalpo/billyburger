'use client';

import React, { useState } from 'react';
import { useMenuData } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { CategorySection } from '@/components/CategorySection';
import { CartFloatingBar } from '@/components/CartFloatingBar';
import { OrderDrawer } from '@/components/OrderDrawer';
import { CartProvider } from '@/components/CartContext';
import { Footer } from '@/components/Footer';
import { BillyLoader } from '@/components/BillyLoader';
import { verificarEstadoHorario } from '@/lib/horario';
import { Clock } from 'lucide-react';

function MainMenuContent() {
  const { categorias, productos, configTV, loading } = useMenuData();
  const [categoriaActiva, setCategoriaActiva] = useState<string>(
    categorias[0]?.slug || 'fajitas'
  );

  const handleSelectCategoria = (slug: string) => {
    setCategoriaActiva(slug);
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#170d05]">
        <BillyLoader size={90} text="Cargando la carta de BillyBurger..." />
      </div>
    );
  }

  const portadaUrl = configTV[0]?.portada_url || '';
  const estadoHorario = verificarEstadoHorario(configTV[0]?.horario_atencion);

  const categoriasActivasOrdenadas = [...categorias]
    .filter((c) => c.activo)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navbar Sticky */}
      <Navbar
        categorias={categoriasActivasOrdenadas}
        categoriaActiva={categoriaActiva}
        onSelectCategoria={handleSelectCategoria}
      />

      {/* Banner de Aviso cuando el Local está Cerrado en Hora Chilena */}
      {!estadoHorario.estaAbierto && (
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-b border-red-500/40 px-4 py-2.5 text-center shadow-xl">
          <div className="max-w-xl mx-auto flex items-center justify-center gap-2.5 text-white">
            <Clock className="w-4 h-4 text-red-300 animate-pulse shrink-0" />
            <div className="text-left sm:text-center">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-red-100 block sm:inline">
                Local Cerrado en este momento:{' '}
              </span>
              <span className="text-[11px] sm:text-xs text-red-200">
                {estadoHorario.mensajePersonalizado || estadoHorario.horarioHoyTexto}.{' '}
                {estadoHorario.proximaApertura ? `Próxima apertura: ${estadoHorario.proximaApertura}.` : ''}{' '}
                (Carta solo para consulta).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Container - Ancho completo con encabezados full-width */}
      <main className="flex-1 w-full mx-auto pb-24">
        {/* Hero Top Emblem & Portada */}
        <HeroBanner portadaUrl={portadaUrl} />

        {/* List of Sections with Wooden Badges & Horizontal Item Ribbons */}
        {categoriasActivasOrdenadas
          .map((cat) => {
            const prodsDeCategoria = productos
              .filter((p) => p.categoria_id === cat.id)
              .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

            return (
              <CategorySection
                key={cat.id}
                categoria={cat}
                productos={prodsDeCategoria}
                precioPapasCombo={configTV[0]?.precio_papas_combo || 1500}
                localAbierto={estadoHorario.estaAbierto}
              />
            );
          })}
      </main>

      {/* Drawer modal de revisión de pedido */}
      <OrderDrawer
        localAbierto={estadoHorario.estaAbierto}
        mensajeCerrado={estadoHorario.mensajePersonalizado || estadoHorario.horarioHoyTexto}
      />

      {/* Barra o botón flotante inteligente */}
      <CartFloatingBar />

      {/* Rustic Footer with Instagram and Events */}
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <CartProvider>
      <MainMenuContent />
    </CartProvider>
  );
}
