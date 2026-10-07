'use client';

import React from 'react';
import { Categoria, Producto } from '@/lib/types';
import { ProductCard } from './ProductCard';
import { Flame, Sandwich, Drumstick, UtensilsCrossed, Beef, Salad, CupSoda, Utensils } from 'lucide-react';

interface CategorySectionProps {
  categoria: Categoria;
  productos: Producto[];
}

export function CategorySection({ categoria, productos }: CategorySectionProps) {
  const getIcon = (nombre: string) => {
    switch (nombre.toLowerCase()) {
      case 'burgers + papas':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'sandwich':
      case 'sandwiches':
        return <Sandwich className="w-5 h-5 text-amber-400" />;
      case 'chorrillanas':
        return <Drumstick className="w-5 h-5 text-amber-400" />;
      case 'papas fritas':
        return <UtensilsCrossed className="w-5 h-5 text-amber-400" />;
      case 'completos & ases':
        return <Beef className="w-5 h-5 text-amber-400" />;
      case 'fajitas':
        return <UtensilsCrossed className="w-5 h-5 text-amber-400" />;
      case 'ensaladas':
        return <Salad className="w-5 h-5 text-amber-400" />;
      case 'bebidas':
        return <CupSoda className="w-5 h-5 text-amber-400" />;
      default:
        return <Utensils className="w-5 h-5 text-amber-400" />;
    }
  };

  if (productos.length === 0) return null;

  return (
    <section id={categoria.slug} className="scroll-mt-32 pt-8 pb-4">
      {/* Category Header Bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            {getIcon(categoria.nombre)}
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">
              {categoria.nombre}
            </h2>
            <span className="text-xs text-zinc-400 font-medium">
              {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>
        </div>

        {/* Special category notes from Canva */}
        {categoria.slug === 'sandwiches' && (
          <span className="hidden sm:inline-block text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            🍟 Incluyen Papas Fritas
          </span>
        )}
        {categoria.slug === 'completos' && (
          <span className="hidden sm:inline-block text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            + $1.500 Papas Fritas
          </span>
        )}
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {productos.map((prod) => (
          <ProductCard key={prod.id} producto={prod} />
        ))}
      </div>
    </section>
  );
}
