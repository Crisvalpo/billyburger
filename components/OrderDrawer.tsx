'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from './CartContext';
import { useMenuData } from '@/lib/store';
import { getWhatsAppLink } from '@/lib/whatsapp';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag, ArrowRight, Clock } from 'lucide-react';

interface OrderDrawerProps {
  localAbierto?: boolean;
  mensajeCerrado?: string;
}

export function OrderDrawer({ localAbierto = true, mensajeCerrado }: OrderDrawerProps) {
  const { configTV } = useMenuData();
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, clearCart, totalItems, totalPrecio } = useCart();
  const [notas, setNotas] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');

  if (!isOpen) return null;

  const formatoPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(precio);
  };

  const handleEnviarPedido = () => {
    if (items.length === 0) return;

    let mensaje = `🍔 *NUEVO PEDIDO - BILLY BURGER* 🍔\n`;
    if (nombreCliente.trim()) {
      mensaje += `👤 *Cliente:* ${nombreCliente.trim()}\n`;
    }
    mensaje += `━━━━━━━━━━━━━━━━━━━━━\n`;

    items.forEach((item) => {
      const opcion = item.opcionNombre ? ` [${item.opcionNombre}]` : '';
      const subtotal = item.precioUnitario * item.cantidad;
      mensaje += `• *${item.cantidad}x* ${item.producto.nombre}${opcion} — ${formatoPrecio(subtotal)}\n`;
    });

    mensaje += `━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `💰 *TOTAL:* ${formatoPrecio(totalPrecio)}\n`;

    if (notas.trim()) {
      mensaje += `📝 *Observaciones:* ${notas.trim()}\n`;
    }

    mensaje += `\n¡Hola! Quisiera confirmar este pedido, por favor.`;

    const url = getWhatsAppLink(configTV[0]?.telefono_whatsapp, mensaje);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#140b04] border border-amber-600/40 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] text-white animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Drawer */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#2c1708] to-[#1a0e05] border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-100 uppercase tracking-wide">
                Tu Pedido ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
              </h3>
              <p className="text-[11px] text-zinc-400">
                Revisa y confirma tu orden antes de enviarla
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 flex items-center justify-center text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-white/5">
          {items.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-400" />
              <p className="text-sm font-bold text-zinc-300">Tu orden está vacía</p>
              <p className="text-xs text-zinc-500 mt-1">
                Agrega platos desde la carta para armar tu pedido
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                {/* Miniatura si existe */}
                {item.producto.imagen_url && (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/60 border border-white/10 shrink-0">
                    <Image
                      src={item.producto.imagen_url}
                      alt={item.producto.nombre}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-sm font-bold text-white truncate">
                      {item.producto.nombre}
                    </h4>
                    <span className="text-xs font-mono font-black text-amber-400 shrink-0">
                      {formatoPrecio(item.precioUnitario * item.cantidad)}
                    </span>
                  </div>

                  {item.opcionNombre && (
                    <span className="text-[10px] font-bold text-amber-300/90 block mt-0.5">
                      Opción: {item.opcionNombre}
                    </span>
                  )}

                  {/* Controles de Cantidad */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 bg-black/60 rounded-lg p-1 border border-white/10">
                      <button
                        onClick={() => removeItem(item.producto.id, item.opcionNombre)}
                        className="w-6 h-6 rounded bg-zinc-800 hover:bg-amber-600 flex items-center justify-center text-zinc-300 hover:text-white transition"
                        title="Disminuir"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black font-mono px-1.5 text-amber-300">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.producto.id, item.cantidad + 1, item.opcionNombre)}
                        className="w-6 h-6 rounded bg-zinc-800 hover:bg-amber-600 flex items-center justify-center text-zinc-300 hover:text-white transition"
                        title="Aumentar"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => updateQuantity(item.producto.id, 0, item.opcionNombre)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition"
                      title="Quitar plato"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {items.length > 0 && (
            <div className="pt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1">
                  Tu Nombre (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1">
                  Notas / Indicaciones para la cocina (opcional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Sin cebolla, hamburguesa bien cocida, para retirar a las 21:00..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="p-4 bg-gradient-to-t from-black via-black/95 to-black/80 border-t border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400 font-bold">Total a Pagar:</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {formatoPrecio(totalPrecio)}
              </span>
            </div>

            {!localAbierto && (
              <div className="p-3 rounded-2xl bg-red-950/80 border border-red-500/40 text-center">
                <p className="text-xs font-black text-red-200 flex items-center justify-center gap-1.5 uppercase tracking-wide">
                  <Clock className="w-4 h-4 text-red-400" />
                  <span>Local Fuera de Horario</span>
                </p>
                <p className="text-[11px] text-red-300 mt-1">
                  {mensajeCerrado || 'En este momento no estamos recibiendo pedidos por WhatsApp. Revisa nuestros horarios de atención.'}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={clearCart}
                className="px-3 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 text-xs font-bold transition flex items-center justify-center gap-1 border border-white/5"
                title="Vaciar carrito"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Vaciar</span>
              </button>

              {!localAbierto ? (
                <button
                  type="button"
                  disabled
                  className="flex-1 py-3 px-4 rounded-2xl bg-zinc-900 border border-red-500/30 text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed shadow"
                >
                  <Clock className="w-4 h-4 text-red-400" />
                  <span>Local Cerrado</span>
                </button>
              ) : (
                <button
                  onClick={handleEnviarPedido}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition active:scale-98"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Confirmar por WhatsApp</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
