'use client';

import React, { useState } from 'react';
import { useMenuData } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { CategorySection } from '@/components/CategorySection';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  const { categorias, productos, eventos, loading } = useMenuData();
  const [categoriaActiva, setCategoriaActiva] = useState<string>(
    categorias[0]?.slug || 'burgers'
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
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wider text-zinc-400">
            Cargando la carta de BillyBurger...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0f] text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navbar with Category Slider */}
      <Navbar
        categorias={categorias.filter((c) => c.activo)}
        categoriaActiva={categoriaActiva}
        onSelectCategoria={handleSelectCategoria}
      />

      {/* Hero Banner with WhatsApp CTA & Events */}
      <HeroBanner eventos={eventos} />

      {/* Main Menu Feed */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4">
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

      {/* Floating Sticky WhatsApp Button */}
      <FloatingWhatsApp />

      {/* Footer */}
      <Footer />
    </div>
  );
}
