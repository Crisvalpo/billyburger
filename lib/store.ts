import { useState, useEffect } from 'react';
import { Producto, Categoria, Evento, ConfiguracionTV } from './types';
import { CATEGORIAS_INICIALES, PRODUCTOS_INICIALES, EVENTOS_INICIALES, CONFIG_TV_INICIAL } from './data';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  PRODUCTOS: 'billy_productos_v1',
  CATEGORIAS: 'billy_categorias_v1',
  EVENTOS: 'billy_eventos_v1',
  CONFIG_TV: 'billy_config_tv_v1',
};

// Canal Broadcast para sincronización local entre pestañas (TV + Admin)
const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('billy_realtime_sync')
  : null;

export function useMenuData() {
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_INICIALES);
  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS_INICIALES);
  const [eventos, setEventos] = useState<Evento[]>(EVENTOS_INICIALES);
  const [configTV, setConfigTV] = useState<ConfiguracionTV[]>(CONFIG_TV_INICIAL);
  const [loading, setLoading] = useState<boolean>(true);

  // Carga inicial
  useEffect(() => {
    async function loadData() {
      // 1. Intentar cargar desde el endpoint servidor /api/menu (máxima fiabilidad)
      try {
        const res = await fetch('/api/menu');
        if (res.ok) {
          const json = await res.json();
          if (json.categorias && json.categorias.length > 0) {
            setCategorias(json.categorias);
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(json.categorias));
            }
          }
          if (json.productos && json.productos.length > 0) {
            setProductos(json.productos);
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEYS.PRODUCTOS, JSON.stringify(json.productos));
            }
          }
          if (json.eventos && json.eventos.length > 0) setEventos(json.eventos);
          if (json.configTV && json.configTV.length > 0) setConfigTV(json.configTV);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Error fetching /api/menu, fallback a Supabase directo:', e);
      }

      // 2. Fallback directo a Supabase
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: dbCats } = await supabase.from('categorias').select('*').order('orden');
          const { data: dbProds } = await supabase.from('productos').select('*').order('orden');
          const { data: dbEvents } = await supabase.from('eventos').select('*').order('orden');
          const { data: dbConfig } = await supabase.from('configuracion_tv').select('*');

          if (dbCats && dbCats.length > 0) setCategorias(dbCats);
          if (dbProds && dbProds.length > 0) setProductos(dbProds);
          if (dbEvents && dbEvents.length > 0) setEventos(dbEvents);
          if (dbConfig && dbConfig.length > 0) setConfigTV(dbConfig);
        } catch (err) {
          console.warn('Error loading from Supabase, fallback to localStorage/default:', err);
          loadFromLocal();
        }
      } else {
        loadFromLocal();
      }
      setLoading(false);
    }

    function loadFromLocal() {
      if (typeof window === 'undefined') return;
      try {
        const localProds = localStorage.getItem(STORAGE_KEYS.PRODUCTOS);
        const localCats = localStorage.getItem(STORAGE_KEYS.CATEGORIAS);
        const localEvents = localStorage.getItem(STORAGE_KEYS.EVENTOS);
        const localConfig = localStorage.getItem(STORAGE_KEYS.CONFIG_TV);

        // Limpiar rutas locales rotas /images/ que ya no existen
        const sanitizeImages = (items: any[]) => {
          return items.map((it) => {
            if (it.imagen_url && it.imagen_url.startsWith('/images/')) {
              return { ...it, imagen_url: '' };
            }
            return it;
          });
        };

        if (localProds) setProductos(sanitizeImages(JSON.parse(localProds)));
        if (localCats) setCategorias(sanitizeImages(JSON.parse(localCats)));
        if (localEvents) setEventos(JSON.parse(localEvents));
        if (localConfig) setConfigTV(JSON.parse(localConfig));
      } catch (e) {
        console.error('Error reading localStorage:', e);
      }
    }

    loadData();

    // Suscripción Realtime Supabase
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('billy-realtime')
        .on('postgres_changes', { event: '*', schema: 'billy', table: 'categorias' }, () => {
          loadData();
        })
        .on('postgres_changes', { event: '*', schema: 'billy', table: 'productos' }, (payload) => {
          console.log('Realtime product update:', payload);
          loadData();
        })
        .on('postgres_changes', { event: '*', schema: 'billy', table: 'eventos' }, () => {
          loadData();
        })
        .on('postgres_changes', { event: '*', schema: 'billy', table: 'configuracion_tv' }, () => {
          loadData();
        })
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }

    // Suscripción BroadcastChannel entre pestañas
    if (bc) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'UPDATE_ALL') {
          loadData();
        }
      };
      bc.addEventListener('message', handleMessage);
      return () => {
        bc.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  // Función para actualizar categoría
  const updateCategoria = async (categoriaActualizada: Categoria) => {
    const nuevas = categorias.map((c) => (c.id === categoriaActualizada.id ? categoriaActualizada : c));
    setCategorias(nuevas);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(nuevas));
      bc?.postMessage({ type: 'UPDATE_ALL' });
    }

    // Guardar vía backend API seguro
    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateCategoria', data: categoriaActualizada }),
      });
    } catch (e) {
      console.warn('Error saving categoria via /api/menu:', e);
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('categorias').update(categoriaActualizada).eq('id', categoriaActualizada.id);
    }
  };

  // Función para actualizar producto
  const updateProducto = async (productoActualizado: Producto) => {
    const nuevos = productos.map((p) => (p.id === productoActualizado.id ? productoActualizado : p));
    setProductos(nuevos);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRODUCTOS, JSON.stringify(nuevos));
      bc?.postMessage({ type: 'UPDATE_ALL' });
    }

    // Guardar vía backend API seguro
    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateProducto', data: productoActualizado }),
      });
    } catch (e) {
      console.warn('Error saving producto via /api/menu:', e);
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('productos').update(productoActualizado).eq('id', productoActualizado.id);
    }
  };

  // Función para agregar producto
  const addProducto = async (nuevo: Producto) => {
    const nuevos = [...productos, nuevo];
    setProductos(nuevos);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRODUCTOS, JSON.stringify(nuevos));
      bc?.postMessage({ type: 'UPDATE_ALL' });
    }

    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addProducto', data: nuevo }),
      });
    } catch (e) {
      console.warn('Error adding producto via /api/menu:', e);
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('productos').insert(nuevo);
    }
  };

  // Función para eliminar producto
  const deleteProducto = async (id: string) => {
    const nuevos = productos.filter((p) => p.id !== id);
    setProductos(nuevos);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRODUCTOS, JSON.stringify(nuevos));
      bc?.postMessage({ type: 'UPDATE_ALL' });
    }

    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteProducto', id }),
      });
    } catch (e) {
      console.warn('Error deleting producto via /api/menu:', e);
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('productos').delete().eq('id', id);
    }
  };

  const updateConfigTV = async (configActualizada: ConfiguracionTV) => {
    setConfigTV((prev) =>
      prev.map((c) =>
        c.pantalla_id === configActualizada.pantalla_id ? configActualizada : c
      )
    );
    if (typeof window !== 'undefined') {
      const items = configTV.map((c) =>
        c.pantalla_id === configActualizada.pantalla_id ? configActualizada : c
      );
      localStorage.setItem(STORAGE_KEYS.CONFIG_TV, JSON.stringify(items));
      bc?.postMessage({ type: 'UPDATE_ALL' });
    }

    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateConfigTV', data: configActualizada }),
      });
    } catch (e) {
      console.warn('Error saving configTV via /api/menu:', e);
    }

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('configuracion_tv')
        .update(configActualizada)
        .eq('pantalla_id', configActualizada.pantalla_id);
    }
  };

  // Función para resetear datos iniciales
  const resetToDefaults = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.PRODUCTOS);
      localStorage.removeItem(STORAGE_KEYS.CATEGORIAS);
      localStorage.removeItem(STORAGE_KEYS.EVENTOS);
      localStorage.removeItem(STORAGE_KEYS.CONFIG_TV);
      bc?.postMessage({ type: 'UPDATE_ALL' });
    }
    setProductos(PRODUCTOS_INICIALES);
    setCategorias(CATEGORIAS_INICIALES);
    setEventos(EVENTOS_INICIALES);
    setConfigTV(CONFIG_TV_INICIAL);
  };

  return {
    categorias,
    productos,
    eventos,
    configTV,
    loading,
    updateCategoria,
    updateProducto,
    updateConfigTV,
    addProducto,
    deleteProducto,
    resetToDefaults,
  };
}
