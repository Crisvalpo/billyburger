'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMenuData } from '@/lib/store';
import { Producto } from '@/lib/types';
import {
  Plus,
  Tv,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeft,
  Trash2,
  Edit,
  RotateCcw,
  ImageIcon,
  X,
} from 'lucide-react';

const GALERIA_IMAGENES = [
  { nombre: '🍔 Burger Walala (Foto Real)', url: '/images/burger-walala.jpg' },
  { nombre: '🍔 Burger Clásica (Transparente)', url: '/images/burger-png.png' },
  { nombre: '🍟 Chorrillana con Huevos Fritos', url: '/images/chorrillana.png' },
  { nombre: '🍟 Papas Fritas & Salchipapas', url: '/images/papas-fritas.png' },
  { nombre: '🥪 Sándwich / Mechada / Completo', url: '/images/sandwich.png' },
  { nombre: '🌯 Fajita Tradicional', url: '/images/fajita.jpg' },
  { nombre: '🥗 Ensalada Completa', url: '/images/ensalada.png' },
  { nombre: '🥤 Bebidas & Latas', url: '/images/bebidas.png' },
];

export default function AdminPage() {
  const {
    categorias,
    productos,
    updateProducto,
    addProducto,
    deleteProducto,
    resetToDefaults,
  } = useMenuData();

  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

  // Formulario nuevo producto
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCatId, setNuevaCatId] = useState(categorias[0]?.id || 'cat-burgers');
  const [nuevoPrecio, setNuevoPrecio] = useState(5000);
  const [nuevoPrecioSecundario, setNuevoPrecioSecundario] = useState<number | undefined>(undefined);
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevaImagen, setNuevaImagen] = useState('/images/burger-png.png');
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
    setEditingProduct({ ...p });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await updateProducto(editingProduct);
    setEditingProduct(null);
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
      precio_secundario: nuevoPrecioSecundario,
      etiqueta_precio_secundario: nuevoPrecioSecundario ? 'Sin Papas' : undefined,
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
    setNuevoPrecioSecundario(undefined);
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
                Ajusta imágenes, precios y disponibilidad en tiempo real
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
              <span>TV 1</span>
            </Link>
            <Link
              href="/tv?pantalla=2"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold flex items-center gap-1.5 text-zinc-300 transition"
            >
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span>TV 2</span>
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
                {/* Product Thumbnail & Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl bg-zinc-900 overflow-hidden shrink-0 border border-white/10">
                    {prod.imagen_url ? (
                      <Image
                        src={prod.imagen_url}
                        alt={prod.nombre}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-base truncate">{prod.nombre}</h3>
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
                </div>

                {/* Price Display */}
                <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
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

                  {/* Action Toggles & Edit Button */}
                  <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                    {/* Botón Editar Completo (Ajustar Imagen, Precio, etc.) */}
                    <button
                      onClick={() => handleStartEdit(prod)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 transition"
                      title="Editar Producto e Imagen"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

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

      {/* MODAL EDITAR PRODUCTO E IMAGEN */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#13151e] border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                Editar: {editingProduct.nombre}
              </h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              {/* Selector Visual de Imagen */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">
                  1. Imagen del Producto (Selecciona una de la galería):
                </label>

                {/* Previsualización actual */}
                <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-2xl border border-white/10 mb-3">
                  <div className="relative w-16 h-16 rounded-xl bg-black overflow-hidden border border-amber-500/40 shrink-0">
                    {editingProduct.imagen_url ? (
                      <Image
                        src={editingProduct.imagen_url}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-zinc-600 m-auto" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] text-zinc-400 block font-medium">Ruta actual:</span>
                    <span className="text-xs font-mono text-amber-400 truncate block">
                      {editingProduct.imagen_url || 'Sin imagen'}
                    </span>
                  </div>
                </div>

                {/* Galería de botones con miniaturas */}
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {GALERIA_IMAGENES.map((img) => (
                    <button
                      type="button"
                      key={img.url}
                      onClick={() =>
                        setEditingProduct({ ...editingProduct, imagen_url: img.url })
                      }
                      className={`p-2 rounded-xl text-left border flex items-center gap-2 transition ${
                        editingProduct.imagen_url === img.url
                          ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                          : 'bg-zinc-900/80 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-black">
                        <Image src={img.url} alt={img.nombre} fill className="object-cover" />
                      </div>
                      <span className="text-[11px] line-clamp-1 leading-tight">{img.nombre}</span>
                    </button>
                  ))}
                </div>

                {/* Campo URL libre */}
                <div className="mt-2">
                  <input
                    type="text"
                    value={editingProduct.imagen_url || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, imagen_url: e.target.value })
                    }
                    placeholder="O escribe una URL personalizada (/images/foto.jpg o https://...)"
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Datos del producto */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.nombre}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, nombre: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Precio ($ CLP)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.precio}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        precio: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Precio Sin Papas */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Precio Secundario (Opcional, Ej: &quot;Sin Papas&quot;)
                </label>
                <input
                  type="number"
                  value={editingProduct.precio_secundario || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      precio_secundario: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      etiqueta_precio_secundario: e.target.value ? 'Sin Papas' : undefined,
                    })
                  }
                  placeholder="Dejar vacío si no aplica"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Ingredientes</label>
                <textarea
                  rows={2}
                  value={editingProduct.descripcion}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, descripcion: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Asignación TV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Pantalla TV</label>
                  <select
                    value={editingProduct.pantalla_tv}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        pantalla_tv: parseInt(e.target.value, 10),
                      })
                    }
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
                    id="editDestacadoCheck"
                    checked={editingProduct.es_destacado}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        es_destacado: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <label
                    htmlFor="editDestacadoCheck"
                    className="text-xs font-bold text-zinc-300 cursor-pointer"
                  >
                    Hero Destacado en TV
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition shadow-lg shadow-amber-500/20"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR NUEVO PRODUCTO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#13151e] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl my-8">
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
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Precio Sin Papas (Opcional)
                </label>
                <input
                  type="number"
                  value={nuevoPrecioSecundario || ''}
                  onChange={(e) =>
                    setNuevoPrecioSecundario(e.target.value ? parseInt(e.target.value, 10) : undefined)
                  }
                  placeholder="Ej: 5000"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Imagen</label>
                <select
                  value={nuevaImagen}
                  onChange={(e) => setNuevaImagen(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                >
                  {GALERIA_IMAGENES.map((img) => (
                    <option key={img.url} value={img.url}>
                      {img.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Ingredientes / Descripción
                </label>
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
                  <label
                    htmlFor="destacadoCheck"
                    className="text-xs font-bold text-zinc-300 cursor-pointer"
                  >
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
