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

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navbar Sticky */}
      <Navbar
        categorias={categorias.filter((c) => c.activo)}
        categoriaActiva={categoriaActiva}
        onSelectCategoria={handleSelectCategoria}
      />

      {/* Main Container - Centrado y enfocado para experiencia móvil de carta */}
      <main className="flex-1 max-w-xl w-full mx-auto px-3 sm:px-4 pb-20">
        {/* Hero Top Emblem, Portada & Quick Menu Index */}
        <HeroBanner
          categorias={categorias.filter((c) => c.activo)}
          onSelectCategoria={handleSelectCategoria}
          portadaUrl={portadaUrl}
        />

        {/* List of Sections with Wooden Badges & Horizontal Item Ribbons */}
        {categorias
          .filter((cat) => cat.activo)
          .map((cat) => {
            const prodsDeCategoria = productos
              .filter((p) => p.categoria_id === cat.id)
              .sort((a, b) => a.orden - b.orden);

            return (
              <CategorySection
                key={cat.id}
                categoria={cat}
                productos={prodsDeCategoria}
              />
            );
          })}
      </main>

      {/* Drawer modal de revisión de pedido */}
      <OrderDrawer />

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
