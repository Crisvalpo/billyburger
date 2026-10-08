'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Producto } from '@/lib/types';

export interface CartItem {
  id: string; // unique item key: `${producto.id}-${sinPapas ? 'sin' : 'con'}`
  producto: Producto;
  cantidad: number;
  sinPapas?: boolean;
  precioUnitario: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (producto: Producto, sinPapas?: boolean) => void;
  removeItem: (productoId: string, sinPapas?: boolean) => void;
  updateQuantity: (productoId: string, cantidad: number, sinPapas?: boolean) => void;
  getItemQuantity: (productoId: string, sinPapas?: boolean) => number;
  clearCart: () => void;
  totalItems: number;
  totalPrecio: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'billy_cart_v1';

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

  const getItemKey = (productoId: string, sinPapas: boolean = false) => {
    return `${productoId}-${sinPapas ? 'sin-papas' : 'con-papas'}`;
  };

  const addItem = (producto: Producto, sinPapas: boolean = false) => {
    const key = getItemKey(producto.id, sinPapas);
    const precioUnitario = sinPapas && producto.precio_secundario
      ? producto.precio_secundario
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
          sinPapas,
          precioUnitario,
        },
      ];
    });
  };

  const removeItem = (productoId: string, sinPapas: boolean = false) => {
    const key = getItemKey(productoId, sinPapas);
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

  const updateQuantity = (productoId: string, cantidad: number, sinPapas: boolean = false) => {
    const key = getItemKey(productoId, sinPapas);
    if (cantidad <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== key));
    } else {
      setItems((prev) =>
        prev.map((item) => (item.id === key ? { ...item, cantidad } : item))
      );
    }
  };

  const getItemQuantity = (productoId: string, sinPapas: boolean = false): number => {
    const key = getItemKey(productoId, sinPapas);
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
