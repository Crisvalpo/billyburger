'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMenuData } from '@/lib/store';
import { Producto } from '@/lib/types';
import {
  Plus,
  Tv,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Trash2,
  Edit,
  Save,
  RotateCcw,
} from 'lucide-react';

export default function AdminPage() {
  const {
    categorias,
    productos,
    eventos,
    updateProducto,
    addProducto,
    deleteProducto,
    resetToDefaults,
  } = useMenuData();

  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editSecondaryPrice, setEditSecondaryPrice] = useState<number | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Formulario nuevo producto
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCatId, setNuevaCatId] = useState(categorias[0]?.id || 'cat-burgers');
  const [nuevoPrecio, setNuevoPrecio] = useState(5000);
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevaImagen, setNuevaImagen] = useState('/images/e88fb0a7c5f6a08ae9bba1aa294d8bb9.png');
  const [nuevaPantalla, setNuevaPantalla] = useState(1);
  const [nuevoDestacado, setNuevoDestacado] = useState(false);

  const formatoPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(precio);
  };

  const handleStartEdit = (p: Producto) => {
    setEditingId(p.id);
    setEditPrice(p.precio);
    setEditSecondaryPrice(p.precio_secundario);
  };

  const handleSavePrice = async (p: Producto) => {
    await updateProducto({
      ...p,
      precio: editPrice,
      precio_secundario: editSecondaryPrice,
    });
    setEditingId(null);
  };

  const handleToggleDisponible = async (p: Producto) => {
    await updateProducto({
      ...p,
      disponible: !p.disponible,
    });
  };

  const handleToggleTV = async (p: Producto) => {
    await updateProducto({
      ...p,
      mostrar_en_tv: !p.mostrar_en_tv,
    });
  };

  const handleToggleDestacado = async (p: Producto) => {
    await updateProducto({
      ...p,
      es_destacado: !p.es_destacado,
    });
  };

  const handleCrearProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    const nuevo: Producto = {
      id: 'prod-' + Date.now(),
      categoria_id: nuevaCatId,
      nombre: nuevoNombre.trim(),
      descripcion: nuevaDesc.trim(),
      precio: nuevoPrecio,
      imagen_url: nuevaImagen,
      disponible: true,
      es_destacado: nuevoDestacado,
      mostrar_en_tv: true,
      pantalla_tv: nuevaPantalla,
      orden: productos.length + 1,
    };

    await addProducto(nuevo);
    setShowAddModal(false);
    setNuevoNombre('');
    setNuevaDesc('');
  };

  const productosFiltrados = productos.filter((p) => {
    if (categoriaFiltro === 'todas') return true;
    return p.categoria_id === categoriaFiltro;
  });

  return (
    <div className="min-h-screen bg-[#090a0d] text-zinc-100 font-sans pb-24">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-[#101217]/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition"
              title="Volver a la Carta"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-white flex items-center gap-2">
                Panel de Administración <span className="text-amber-400">BillyBurger</span>
              </h1>
              <p className="text-xs text-zinc-400">
                Actualiza precios, disponibilidad y cartelería en tiempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/tv?pantalla=1"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold flex items-center gap-1.5 text-zinc-300 transition"
            >
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver TV 1</span>
            </Link>
            <Link
              href="/tv?pantalla=2"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold flex items-center gap-1.5 text-zinc-300 transition"
            >
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver TV 2</span>
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold flex items-center gap-1.5 transition shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-5xl mx-auto px-4 mt-6">
        {/* Quick Stats & Shortcuts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#12141c] p-4 rounded-2xl border border-white/5">
            <span className="text-xs text-zinc-400 uppercase font-bold">Total Productos</span>
            <p className="text-2xl font-black text-white mt-1">{productos.length}</p>
          </div>
          <div className="bg-[#12141c] p-4 rounded-2xl border border-white/5">
            <span className="text-xs text-zinc-400 uppercase font-bold">En Cartelería TV</span>
            <p className="text-2xl font-black text-amber-400 mt-1">
              {productos.filter((p) => p.mostrar_en_tv && p.disponible).length}
            </p>
          </div>
          <div className="bg-[#12141c] p-4 rounded-2xl border border-white/5">
            <span className="text-xs text-zinc-400 uppercase font-bold">Agotados / Ocultos</span>
            <p className="text-2xl font-black text-red-400 mt-1">
              {productos.filter((p) => !p.disponible).length}
            </p>
          </div>
          <div className="bg-[#12141c] p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
            <span className="text-xs text-zinc-400 uppercase font-bold">Restaurar</span>
            <button
              onClick={() => {
                if (confirm('¿Restaurar menú a los valores iniciales de Canva?')) {
                  resetToDefaults();
                }
              }}
              className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1 mt-1 transition font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset datos</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          <button
            onClick={() => setCategoriaFiltro('todas')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              categoriaFiltro === 'todas'
                ? 'bg-amber-500 text-black font-extrabold'
                : 'bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            Todas ({productos.length})
          </button>
          {categorias.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoriaFiltro(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                categoriaFiltro === c.id
                  ? 'bg-amber-500 text-black font-extrabold'
                  : 'bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              {c.nombre} ({productos.filter((p) => p.categoria_id === c.id).length})
            </button>
          ))}
        </div>

        {/* Product Table / Cards */}
        <div className="space-y-3">
          {productosFiltrados.map((prod) => {
            const isEditing = editingId === prod.id;
            return (
              <div
                key={prod.id}
                className={`p-4 rounded-2xl bg-[#12141c] border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  !prod.disponible
                    ? 'border-red-900/40 opacity-60'
                    : prod.es_destacado
                    ? 'border-amber-500/30'
                    : 'border-white/5'
                }`}
              >
                {/* Product Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white text-base">{prod.nombre}</h3>
                    {prod.es_destacado && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Destacado TV
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      TV {prod.pantalla_tv === 0 ? 'Ambas' : prod.pantalla_tv}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{prod.descripcion}</p>
                </div>

                {/* Price Display / Edit Input */}
                <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-xl border border-white/10">
                          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(parseInt(e.target.value, 10) || 0)}
                            className="w-20 bg-transparent text-sm font-black font-mono text-white focus:outline-none"
                            autoFocus
                          />
                        </div>
                        {prod.precio_secundario !== undefined && (
                          <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-xl border border-white/10">
                            <span className="text-[10px] text-zinc-400">Sin Papas: $</span>
                            <input
                              type="number"
                              value={editSecondaryPrice || 0}
                              onChange={(e) =>
                                setEditSecondaryPrice(parseInt(e.target.value, 10) || 0)
                              }
                              className="w-16 bg-transparent text-xs font-bold font-mono text-white focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleSavePrice(prod)}
                        className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition"
                        title="Guardar Precio"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-lg font-black font-mono text-amber-400 block">
                          {formatoPrecio(prod.precio)}
                        </span>
                        {prod.precio_secundario && (
                          <span className="text-[11px] font-bold text-zinc-400 block">
                            Sin papas: {formatoPrecio(prod.precio_secundario)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleStartEdit(prod)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                        title="Modificar Precio"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Action Toggles */}
                  <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                    {/* Toggle Stock */}
                    <button
                      onClick={() => handleToggleDisponible(prod)}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                        prod.disponible
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                      }`}
                      title={prod.disponible ? 'Disponible (clic para agotar)' : 'Agotado'}
                    >
                      {prod.disponible ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </button>

                    {/* Toggle TV */}
                    <button
                      onClick={() => handleToggleTV(prod)}
                      className={`p-2 rounded-xl text-xs font-bold transition ${
                        prod.mostrar_en_tv
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                      title={prod.mostrar_en_tv ? 'Visible en TV' : 'Oculto en TV'}
                    >
                      <Tv className="w-4 h-4" />
                    </button>

                    {/* Toggle Destacado */}
                    <button
                      onClick={() => handleToggleDestacado(prod)}
                      className={`p-2 rounded-xl text-xs font-bold transition ${
                        prod.es_destacado
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title={prod.es_destacado ? 'Hero Destacado en TV' : 'Destacar'}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar permanentemente "${prod.nombre}"?`)) {
                          deleteProducto(prod.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-zinc-800/80 hover:bg-red-950 text-zinc-400 hover:text-red-400 transition"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal Agregar Producto */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#13151e] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-black text-white">Nuevo Producto</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Se creará y reflejará automáticamente en la web y en la TV
            </p>

            <form onSubmit={handleCrearProducto} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Hamburguesa Monster"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Categoría</label>
                  <select
                    value={nuevaCatId}
                    onChange={(e) => setNuevaCatId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Precio ($ CLP)</label>
                  <input
                    type="number"
                    required
                    value={nuevoPrecio}
                    onChange={(e) => setNuevoPrecio(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Ingredientes / Descripción</label>
                <textarea
                  rows={2}
                  value={nuevaDesc}
                  onChange={(e) => setNuevaDesc(e.target.value)}
                  placeholder="Detalla los ingredientes y salsas..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Pantalla TV</label>
                  <select
                    value={nuevaPantalla}
                    onChange={(e) => setNuevaPantalla(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value={1}>Pantalla 1 (Burgers/Papas)</option>
                    <option value={2}>Pantalla 2 (Sandwiches/Chorrillanas)</option>
                    <option value={0}>Ambas Pantallas</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="destacadoCheck"
                    checked={nuevoDestacado}
                    onChange={(e) => setNuevoDestacado(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <label htmlFor="destacadoCheck" className="text-xs font-bold text-zinc-300 cursor-pointer">
                    Destacar en TV
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition"
                >
                  Crear Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
