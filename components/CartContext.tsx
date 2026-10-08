'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Producto } from '@/lib/types';

export interface CartItem {
  id: string; // unique item key: `${producto.id}-${opcionNombre || 'default'}`
  producto: Producto;
  cantidad: number;
  opcionNombre?: string;
  precioUnitario: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (producto: Producto, opcionNombre?: string, precioUnitarioOverride?: number) => void;
  removeItem: (productoId: string, opcionNombre?: string) => void;
  updateQuantity: (productoId: string, cantidad: number, opcionNombre?: string) => void;
  getItemQuantity: (productoId: string, opcionNombre?: string) => number;
  clearCart: () => void;
  totalItems: number;
  totalPrecio: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'billy_cart_v2';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar carrito previo de localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Error cargando carrito local:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar cada cambio en localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Error guardando carrito:', e);
    }
  }, [items, isLoaded]);

  const getItemKey = (productoId: string, opcionNombre: string = '') => {
    return `${productoId}-${opcionNombre || 'default'}`;
  };

  const addItem = (
    producto: Producto,
    opcionNombre: string = '',
    precioUnitarioOverride?: number
  ) => {
    const key = getItemKey(producto.id, opcionNombre);
    const precioFinal =
      precioUnitarioOverride !== undefined
        ? precioUnitarioOverride
        : producto.precio;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === key);
      if (existing) {
        return prev.map((item) =>
          item.id === key ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: key,
          producto,
          cantidad: 1,
          opcionNombre,
          precioUnitario: precioFinal,
        },
      ];
    });
  };

  const removeItem = (productoId: string, opcionNombre: string = '') => {
    const key = getItemKey(productoId, opcionNombre);
    setItems((prev) => {
      const existing = prev.find((item) => item.id === key);
      if (!existing) return prev;
      if (existing.cantidad <= 1) {
        return prev.filter((item) => item.id !== key);
      }
      return prev.map((item) =>
        item.id === key ? { ...item, cantidad: item.cantidad - 1 } : item
      );
    });
  };

  const updateQuantity = (
    productoId: string,
    cantidad: number,
    opcionNombre: string = ''
  ) => {
    const key = getItemKey(productoId, opcionNombre);
    if (cantidad <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== key));
    } else {
      setItems((prev) =>
        prev.map((item) => (item.id === key ? { ...item, cantidad } : item))
      );
    }
  };

  const getItemQuantity = (productoId: string, opcionNombre: string = ''): number => {
    const key = getItemKey(productoId, opcionNombre);
    const item = items.find((it) => it.id === key);
    return item ? item.cantidad : 0;
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, it) => acc + it.cantidad, 0);
  const totalPrecio = items.reduce((acc, it) => acc + it.precioUnitario * it.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        getItemQuantity,
        clearCart,
        totalItems,
        totalPrecio,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}
