'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMenuData } from '@/lib/store';
import { Producto, Categoria, ConfiguracionHorario, ConfiguracionTV } from '@/lib/types';
import { AdminAuthLock } from '@/components/AdminAuthLock';
import { HORARIO_DEFAULT, verificarEstadoHorario, getFechaHoraChile } from '@/lib/horario';
import {
  Plus,
  Tv,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeft,
  Trash2,
  Edit,
  ImageIcon,
  X,
  Upload,
  Loader2,
  Lock,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('billy_admin_auth');
      if (token) {
        setIsAuthenticated(true);
      }
    }
    setAuthChecking(false);
  }, []);

  const {
    categorias,
    productos,
    configTV,
    loading,
    updateCategoria,
    addCategoria,
    deleteCategoria,
    updateProducto,
    updateConfigTV,
    updateAllConfigTV,
    addProducto,
    deleteProducto,
  } = useMenuData();

  const [activeTab, setActiveTab] = useState<'productos' | 'secciones' | 'portada' | 'horarios' | 'guincha'>('productos');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [editingCategoria, setEditingCategoria] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Mapeo canónico de nombres de días con tildes correctas
  const NOMBRES_DIAS_CORRECTOS: Record<number, string> = {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
  };

  const ajustarHora = (horaActual: string, deltaMinutos: number): string => {
    const [h, m] = (horaActual || '18:00').split(':').map((x) => parseInt(x, 10) || 0);
    let total = (h * 60 + m + deltaMinutos) % (24 * 60);
    if (total < 0) total += 24 * 60;
    const nuevoH = Math.floor(total / 60);
    const nuevoM = total % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(nuevoH)}:${pad(nuevoM)}`;
  };

  // Configuración de Horarios de Funcionamiento en Hora Chilena
  const [horarioConfig, setHorarioConfig] = useState<ConfiguracionHorario>(
    configTV[0]?.horario_atencion || HORARIO_DEFAULT
  );
  const [guardandoHorario, setGuardandoHorario] = useState<boolean>(false);
  const [horarioGuardadoExito, setHorarioGuardadoExito] = useState<boolean>(false);
  const [horaChileActual, setHoraChileActual] = useState<{ horaStr: string; diaNombre: string; fechaStr: string }>({
    horaStr: '',
    diaNombre: '',
    fechaStr: '',
  });

  // Reloj en vivo de Santiago de Chile
  useEffect(() => {
    const updateReloj = () => {
      const ch = getFechaHoraChile();
      setHoraChileActual({
        horaStr: ch.horaStr,
        diaNombre: ch.diaNombre,
        fechaStr: ch.fechaStr,
      });
    };
    updateReloj();
    const interval = setInterval(updateReloj, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (configTV[0]?.horario_atencion) {
      setHorarioConfig(configTV[0].horario_atencion);
    }
  }, [configTV]);

  const handleGuardarHorario = async (nuevaConf?: ConfiguracionHorario) => {
    const confBase = nuevaConf || horarioConfig;
    const confAGuardar: ConfiguracionHorario = {
      ...confBase,
      dias: confBase.dias.map((d) => ({
        ...d,
        nombre: NOMBRES_DIAS_CORRECTOS[d.dia] || d.nombre,
      })),
    };
    try {
      setGuardandoHorario(true);
      setHorarioGuardadoExito(false);

      const c1 = configTV.find((c) => c.pantalla_id === 1) || configTV[0] || {
        pantalla_id: 1,
        nombre: 'Pantalla 1 - Burgers & Papas Fritas',
        segundos_rotacion: 12,
      };
      const c2 = configTV.find((c) => c.pantalla_id === 2) || configTV[1] || {
        pantalla_id: 2,
        nombre: 'Pantalla 2 - Chorrillanas & Sándwiches',
        segundos_rotacion: 12,
      };

      await updateAllConfigTV([
        { ...c1, horario_atencion: confAGuardar },
        { ...c2, horario_atencion: confAGuardar },
      ]);

      setHorarioGuardadoExito(true);
      setTimeout(() => setHorarioGuardadoExito(false), 3000);
    } catch (err: any) {
      alert('Error guardando horario: ' + err.message);
    } finally {
      setGuardandoHorario(false);
    }
  };

  const handleToggleDiaAbierto = (diaIndex: number) => {
    setHorarioConfig((prev) => {
      const dias = prev.dias.map((d) =>
        d.dia === diaIndex ? { ...d, abierto: !d.abierto } : d
      );
      return { ...prev, dias };
    });
  };

  const handleCambiarHoraDia = (diaIndex: number, campo: 'horaApertura' | 'horaCierre', valor: string) => {
    setHorarioConfig((prev) => {
      const dias = prev.dias.map((d) =>
        d.dia === diaIndex ? { ...d, [campo]: valor } : d
      );
      return { ...prev, dias };
    });
  };

  const handleAplicarPresetHorario = (tipo: 'habitual' | '2330' | '0030') => {
    setHorarioConfig((prev) => {
      const dias = prev.dias.map((d) => {
        let apertura = '18:00';
        let cierre = '23:30';
        if (tipo === 'habitual') {
          cierre = d.dia === 5 || d.dia === 6 ? '00:30' : '23:30';
        } else if (tipo === '0030') {
          cierre = '00:30';
        }
        return {
          ...d,
          nombre: NOMBRES_DIAS_CORRECTOS[d.dia] || d.nombre,
          horaApertura: apertura,
          horaCierre: cierre,
        };
      });
      return { ...prev, dias };
    });
  };

  // Configuración y Gestión de Mensajes de la Guincha / Cintillo TV
  const [mensajesGuincha, setMensajesGuincha] = useState<string[]>([]);
  const [nuevoMensajeInput, setNuevoMensajeInput] = useState<string>('');
  const [whatsappInput, setWhatsappInput] = useState<string>('+56 9 3255 3527');
  const [guardandoGuincha, setGuardandoGuincha] = useState<boolean>(false);
  const [guinchaGuardadaExito, setGuinchaGuardadaExito] = useState<boolean>(false);
  const guinchaIniciadaRef = useRef<boolean>(false);

  useEffect(() => {
    if (configTV && configTV.length > 0) {
      if (!guinchaIniciadaRef.current) {
        if (configTV[0]?.cintillo_mensajes && configTV[0].cintillo_mensajes.length > 0) {
          setMensajesGuincha(configTV[0].cintillo_mensajes);
        } else if (configTV[0]?.cintillo_texto) {
          setMensajesGuincha([configTV[0].cintillo_texto]);
        }
        if (configTV[0]?.telefono_whatsapp) {
          setWhatsappInput(configTV[0].telefono_whatsapp);
        }
        if (!loading) {
          guinchaIniciadaRef.current = true;
        }
      }
    }
  }, [configTV, loading]);

  const guardarMensajesEnServidor = async (
    mensajesAGuardar: string[],
    whatsappAGuardar: string
  ) => {
    try {
      setGuardandoGuincha(true);
      setGuinchaGuardadaExito(false);

      const tel = whatsappAGuardar.trim() || '+56 9 3255 3527';

      // Sincronizar ambas pantallas en la base de datos (Pantalla 1 y 2)
      const configsAGuardar: ConfiguracionTV[] = [1, 2].map((id) => {
        const exist = configTV.find((c) => c.pantalla_id === id) || {
          pantalla_id: id,
          nombre: id === 1 ? 'Pantalla 1 - Burgers & Papas Fritas' : 'Pantalla 2 - Chorrillanas & Sándwiches',
          segundos_rotacion: 12,
          cintillo_texto: '',
        };
        return {
          ...exist,
          telefono_whatsapp: tel,
          cintillo_mensajes: mensajesAGuardar,
          cintillo_texto: mensajesAGuardar[0] || exist.cintillo_texto || '',
        };
      });

      await updateAllConfigTV(configsAGuardar);

      setGuinchaGuardadaExito(true);
      setTimeout(() => setGuinchaGuardadaExito(false), 3000);
    } catch (err: any) {
      console.error('Error guardando mensajes de la guincha / WhatsApp:', err);
      alert('Error guardando mensajes de la guincha / WhatsApp: ' + (err.message || err));
    } finally {
      setGuardandoGuincha(false);
    }
  };

  const handleAgregarMensajeGuincha = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const texto = nuevoMensajeInput.trim();
    if (!texto) return;

    const nuevaLista = [...mensajesGuincha, texto];
    setMensajesGuincha(nuevaLista);
    setNuevoMensajeInput('');

    // Auto-guardado instantáneo para que jamás desaparezca
    await guardarMensajesEnServidor(nuevaLista, whatsappInput);
  };

  const handleEliminarMensajeGuincha = async (index: number) => {
    const nuevaLista = mensajesGuincha.filter((_, i) => i !== index);
    setMensajesGuincha(nuevaLista);
    await guardarMensajesEnServidor(nuevaLista, whatsappInput);
  };

  const handleEditarMensajeGuincha = (index: number, nuevoTexto: string) => {
    setMensajesGuincha((prev) => prev.map((m, i) => (i === index ? nuevoTexto : m)));
  };

  const handleGuardarGuincha = async () => {
    await guardarMensajesEnServidor(mensajesGuincha, whatsappInput);
  };

  const fileInputEditRef = useRef<HTMLInputElement>(null);
  const fileInputNewRef = useRef<HTMLInputElement>(null);
  const fileInputCatRef = useRef<HTMLInputElement>(null);
  const fileInputNewCatRef = useRef<HTMLInputElement>(null);
  const fileInputPortadaRef = useRef<HTMLInputElement>(null);

  // Formulario nueva categoría
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);
  const [nuevoCatNombre, setNuevoCatNombre] = useState<string>('');
  const [nuevoCatSlug, setNuevoCatSlug] = useState<string>('');
  const [nuevoCatOrden, setNuevoCatOrden] = useState<number>(categorias.length + 1);
  const [nuevoCatIcono, setNuevoCatIcono] = useState<string>('Utensils');
  const [nuevoCatImagen, setNuevoCatImagen] = useState<string>('');
  const [nuevoCatActivo, setNuevoCatActivo] = useState<boolean>(true);

  // Formulario nuevo producto
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCatId, setNuevaCatId] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState(5000);
  const [nuevoPrecioSecundario, setNuevoPrecioSecundario] = useState<number | undefined>(undefined);
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevaImagen, setNuevaImagen] = useState('');
  const [nuevaPantalla, setNuevaPantalla] = useState(1);
  const [nuevoDestacado, setNuevoDestacado] = useState(false);
  const [nuevoMostrarImagenCarta, setNuevoMostrarImagenCarta] = useState<boolean>(true);

  React.useEffect(() => {
    if (categorias.length > 0 && !nuevaCatId) {
      setNuevaCatId(categorias[0].id);
    }
  }, [categorias, nuevaCatId]);

  // Configuración de Papas Fritas (Sándwiches y Completos)
  const [precioPapasInput, setPrecioPapasInput] = useState<number>(1500);
  const [guardandoPapas, setGuardandoPapas] = useState<boolean>(false);
  const [papasGuardadoExito, setPapasGuardadoExito] = useState<boolean>(false);

  useEffect(() => {
    if (configTV[0]?.precio_papas_combo !== undefined) {
      setPrecioPapasInput(configTV[0].precio_papas_combo);
    }
  }, [configTV]);

  const handleGuardarPrecioPapas = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!precioPapasInput || precioPapasInput <= 0) {
      alert('Ingresa un valor válido para el adicional de papas');
      return;
    }

    try {
      setGuardandoPapas(true);
      setPapasGuardadoExito(false);

      if (configTV[0]) {
        await updateConfigTV({
          ...configTV[0],
          precio_papas_combo: precioPapasInput,
        });
      }
      if (configTV[1]) {
        await updateConfigTV({
          ...configTV[1],
          precio_papas_combo: precioPapasInput,
        });
      }

      setPapasGuardadoExito(true);
      setTimeout(() => setPapasGuardadoExito(false), 3000);
    } catch (err: any) {
      alert('Error guardando precio de papas: ' + err.message);
    } finally {
      setGuardandoPapas(false);
    }
  };

  const formatoPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(precio);
  };


  const handleFileUpload = async (file: File, isEdit: boolean) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      if (isEdit && editingProduct?.imagen_url) {
        formData.append('oldImageUrl', editingProduct.imagen_url);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        if (isEdit && editingProduct) {
          setEditingProduct({ ...editingProduct, imagen_url: data.url });
        } else {
          setNuevaImagen(data.url);
        }
      } else {
        alert(data.error || 'Error al subir imagen');
      }
    } catch (e: any) {
      alert('Error al subir: ' + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCategoryUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      if (editingCategoria?.imagen_url) {
        formData.append('oldImageUrl', editingCategoria.imagen_url);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url && editingCategoria) {
        setEditingCategoria({ ...editingCategoria, imagen_url: data.url });
      } else {
        alert(data.error || 'Error al subir imagen');
      }
    } catch (e: any) {
      alert('Error al subir: ' + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProductImage = async () => {
    if (!editingProduct?.imagen_url) return;
    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: editingProduct.imagen_url }),
      });
      setEditingProduct({ ...editingProduct, imagen_url: '' });
    } catch (e) {
      console.warn('Error borrando foto del bucket:', e);
      setEditingProduct({ ...editingProduct, imagen_url: '' });
    }
  };

  const handleDeleteCategoryImage = async () => {
    if (!editingCategoria?.imagen_url) return;
    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: editingCategoria.imagen_url }),
      });
      setEditingCategoria({ ...editingCategoria, imagen_url: '' });
    } catch (e) {
      console.warn('Error borrando foto del bucket:', e);
      setEditingCategoria({ ...editingCategoria, imagen_url: '' });
    }
  };

  const handlePortadaUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const currentPortada = configTV[0]?.portada_url;
      if (currentPortada) {
        formData.append('oldImageUrl', currentPortada);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        const baseConfig = configTV[0] || {
          pantalla_id: 1,
          nombre: 'Pantalla 1 - Burgers & Papas Fritas',
          segundos_rotacion: 12,
          cintillo_texto: '¡Bienvenido a Billy Burger!',
        };
        await updateConfigTV({
          ...baseConfig,
          portada_url: data.url,
        });
      } else {
        alert(data.error || 'Error al subir imagen de portada');
      }
    } catch (e: any) {
      alert('Error al subir: ' + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePortada = async () => {
    const currentPortada = configTV[0]?.portada_url;
    if (!currentPortada) return;
    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: currentPortada }),
      });
      if (configTV[0]) {
        await updateConfigTV({
          ...configTV[0],
          portada_url: '',
        });
      }
    } catch (e) {
      console.warn('Error eliminando foto de portada:', e);
      if (configTV[0]) {
        await updateConfigTV({
          ...configTV[0],
          portada_url: '',
        });
      }
    }
  };

  const handleSaveEditCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategoria) return;
    try {
      await updateCategoria(editingCategoria);
      setEditingCategoria(null);
    } catch (err: any) {
      alert('Error guardando cambios de categoría: ' + err.message);
    }
  };

  const handleCrearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCatNombre.trim()) return;

    const slugFinal = nuevoCatSlug.trim()
      ? nuevoCatSlug.trim().toLowerCase()
      : nuevoCatNombre
          .toLowerCase()
          .trim()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

    const nuevaCat: Categoria = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'cat-' + Date.now(),
      nombre: nuevoCatNombre.trim(),
      slug: slugFinal,
      orden: Number(nuevoCatOrden) || (categorias.length + 1),
      icono: nuevoCatIcono || 'Utensils',
      imagen_url: nuevoCatImagen || '',
      activo: nuevoCatActivo,
    };

    try {
      await addCategoria(nuevaCat);
      setShowAddCategoryModal(false);
      setNuevoCatNombre('');
      setNuevoCatSlug('');
      setNuevoCatImagen('');
      alert(`✅ Categoría "${nuevaCat.nombre}" creada con éxito.`);
    } catch (err: any) {
      alert('Error creando categoría: ' + err.message);
    }
  };

  const handleDeleteCategoria = async (cat: Categoria) => {
    const prodsCount = productos.filter((p) => p.categoria_id === cat.id).length;
    let mensaje = `¿Estás seguro de eliminar la categoría "${cat.nombre}"?`;
    if (prodsCount > 0) {
      mensaje += `\n\n⚠️ Atención: Contiene ${prodsCount} producto(s) asociado(s) que también serán eliminados de la carta.`;
    }
    if (!confirm(mensaje)) return;

    try {
      await deleteCategoria(cat.id);
      alert(`Categoría "${cat.nombre}" eliminada correctamente.`);
    } catch (err: any) {
      alert('Error eliminando categoría: ' + err.message);
    }
  };

  const handleToggleActivoCategoria = async (cat: Categoria) => {
    try {
      await updateCategoria({
        ...cat,
        activo: !cat.activo,
      });
    } catch (err: any) {
      alert('Error actualizando estado de la categoría: ' + err.message);
    }
  };

  const handleNewCategoryUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setNuevoCatImagen(data.url);
      } else {
        alert(data.error || 'Error al subir imagen');
      }
    } catch (e: any) {
      alert('Error al subir imagen: ' + e.message);
    } finally {
      setIsUploading(false);
    }
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

  const handleToggleFotoCarta = async (p: Producto) => {
    const nuevoEstado = p.mostrar_imagen_carta === false ? true : false;
    await updateProducto({
      ...p,
      mostrar_imagen_carta: nuevoEstado,
    });
  };

  const handleCrearProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    const catSeleccionada = categorias.find((c) => c.id === nuevaCatId) || categorias[0];
    const catIdFinal = catSeleccionada ? catSeleccionada.id : nuevaCatId;

    const nuevo: Producto = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'prod-' + Date.now(),
      categoria_id: catIdFinal,
      nombre: nuevoNombre.trim(),
      descripcion: nuevaDesc.trim(),
      precio: Number(nuevoPrecio) || 0,
      precio_secundario: nuevoPrecioSecundario ? Number(nuevoPrecioSecundario) : undefined,
      etiqueta_precio_secundario: nuevoPrecioSecundario ? 'Sin Papas' : undefined,
      imagen_url: nuevaImagen || '',
      disponible: true,
      es_destacado: nuevoDestacado,
      mostrar_en_tv: true,
      mostrar_imagen_carta: nuevoMostrarImagenCarta,
      pantalla_tv: nuevaPantalla,
      orden: productos.length + 1,
    };

    try {
      await addProducto(nuevo);
      setShowAddModal(false);
      setNuevoNombre('');
      setNuevaDesc('');
      setNuevaImagen('');
      setNuevoPrecioSecundario(undefined);
      setNuevoMostrarImagenCarta(true);
      alert(`✅ Producto "${nuevo.nombre}" guardado con éxito en la base de datos.`);
    } catch (err: any) {
      alert('Error guardando producto en la base de datos: ' + err.message);
    }
  };

  const productosFiltrados = productos.filter((p) => {
    if (categoriaFiltro === 'todas') return true;
    return p.categoria_id === categoriaFiltro;
  });

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#090a0d] flex items-center justify-center text-amber-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminAuthLock onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#090a0d] text-zinc-100 font-sans pb-24">
      {/* Top Admin Header - Totalmente Responsivo para Móviles y Desktop */}
      <header className="sticky top-0 z-40 bg-[#101217]/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 shadow-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Logo y Volver */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition shrink-0"
              title="Volver a la Carta"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-black text-white flex items-center gap-1 sm:gap-2 truncate">
                <span>Admin</span>
                <span className="text-amber-400">BillyBurger</span>
              </h1>
              <p className="hidden sm:block text-xs text-zinc-400">
                Ajusta imágenes, precios y disponibilidad en tiempo real
              </p>
            </div>
          </div>

          {/* Botones de Cabecera */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* TV Menuboard links - Visibles en tablets/PC para no saturar móviles */}
            <Link
              href="/tv?pantalla=1"
              target="_blank"
              className="hidden md:flex px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold items-center gap-1 text-zinc-300 transition"
              title="Ver Pantalla TV 1"
            >
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span>TV 1</span>
            </Link>
            <Link
              href="/tv?pantalla=2"
              target="_blank"
              className="hidden md:flex px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold items-center gap-1 text-zinc-300 transition"
              title="Ver Pantalla TV 2"
            >
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span>TV 2</span>
            </Link>

            {/* Botón Bloquear / Cerrar Sesión */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('billy_admin_auth');
                }
                setIsAuthenticated(false);
              }}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 text-xs font-bold flex items-center gap-1 transition border border-white/5 shrink-0"
              title="Cerrar sesión / Bloquear panel"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Bloquear</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 mt-4 sm:mt-6">
        {/* Quick Stats - 3 Columnas compactas en móviles y desktop */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-[#12141c] p-2.5 sm:p-4 rounded-2xl border border-white/5 text-center sm:text-left">
            <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-bold block truncate">
              Productos
            </span>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{productos.length}</p>
          </div>
          <div className="bg-[#12141c] p-2.5 sm:p-4 rounded-2xl border border-white/5 text-center sm:text-left">
            <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-bold block truncate">
              En Pantallas TV
            </span>
            <p className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
              {productos.filter((p) => p.mostrar_en_tv && p.disponible).length}
            </p>
          </div>
          <div className="bg-[#12141c] p-2.5 sm:p-4 rounded-2xl border border-white/5 text-center sm:text-left">
            <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-bold block truncate">
              Agotados
            </span>
            <p className="text-xl sm:text-2xl font-black text-red-400 mt-0.5">
              {productos.filter((p) => !p.disponible).length}
            </p>
          </div>
        </div>

        {/* Mode Switch: Carrusel horizontal suave en móviles */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 mb-5 p-1.5 rounded-2xl bg-[#12141c] border border-white/10 max-w-full scrollbar-none">
          <button
            onClick={() => setActiveTab('productos')}
            className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs font-black transition shrink-0 whitespace-nowrap ${
              activeTab === 'productos'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🍔 Productos ({productos.length})
          </button>
          <button
            onClick={() => setActiveTab('secciones')}
            className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs font-black transition shrink-0 whitespace-nowrap ${
              activeTab === 'secciones'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🖼️ Secciones ({categorias.length})
          </button>
          <button
            onClick={() => setActiveTab('portada')}
            className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs font-black transition shrink-0 whitespace-nowrap ${
              activeTab === 'portada'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            ⭐ Portada
          </button>
          <button
            onClick={() => setActiveTab('horarios')}
            className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs font-black transition shrink-0 whitespace-nowrap ${
              activeTab === 'horarios'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            ⏰ Horarios
          </button>
          <button
            onClick={() => setActiveTab('guincha')}
            className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs font-black transition shrink-0 whitespace-nowrap ${
              activeTab === 'guincha'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            📢 Guincha TV ({mensajesGuincha.length})
          </button>
        </div>

        {activeTab === 'horarios' ? (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Header Reloj Chile y Estado en Vivo */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#17130b] via-[#12141c] to-[#12141c] border border-amber-500/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Hora Oficial de Chile (Santiago)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                    {horaChileActual.horaStr || '--:--'}
                  </span>
                  <span className="text-sm font-bold text-zinc-400">
                    {horaChileActual.diaNombre} {horaChileActual.fechaStr ? `(${horaChileActual.fechaStr})` : ''}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  El bloqueo de pedidos se calcula en tiempo real con este reloj chileno.
                </p>
              </div>

              {/* Badge de Estado en Vivo */}
              <div className="shrink-0 w-full sm:w-auto">
                {(() => {
                  const est = verificarEstadoHorario(horarioConfig);
                  return est.estaAbierto ? (
                    <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2.5 shadow-lg">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider block">Local Abierto Ahora</span>
                        <span className="text-[11px] text-emerald-200 font-medium">{est.motivo}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-2.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 flex items-center gap-2.5 shadow-lg">
                      <span className="w-3 h-3 rounded-full bg-red-400 animate-pulse shrink-0" />
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider block">Local Cerrado Ahora</span>
                        <span className="text-[11px] text-red-200 font-medium">
                          {est.proximaApertura ? `Abre: ${est.proximaApertura}` : est.motivo}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Selector de Modo Maestro */}
            <div className="p-5 rounded-3xl bg-[#12141c] border border-white/10 space-y-3 shadow-xl">
              <label className="text-xs font-black text-amber-300 uppercase tracking-wider block">
                Modo de Operación del Local:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setHorarioConfig({ ...horarioConfig, modoForzado: 'auto' })}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    (horarioConfig.modoForzado || 'auto') === 'auto'
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                      : 'bg-black/40 border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-black block">⚙️ Automático</span>
                  <span className="text-[11px] text-zinc-400 mt-1 block leading-relaxed">
                    Abre y cierra automáticamente según el horario programado.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setHorarioConfig({ ...horarioConfig, modoForzado: 'abierto' })}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    horarioConfig.modoForzado === 'abierto'
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md'
                      : 'bg-black/40 border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-black block text-emerald-400">🟢 Forzar Abierto</span>
                  <span className="text-[11px] text-zinc-400 mt-1 block leading-relaxed">
                    Permite tomar pedidos de inmediato ignorando el reloj.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setHorarioConfig({ ...horarioConfig, modoForzado: 'cerrado' })}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    horarioConfig.modoForzado === 'cerrado'
                      ? 'bg-red-500/20 border-red-500 text-white shadow-md'
                      : 'bg-black/40 border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-black block text-red-400">🔴 Forzar Cerrado</span>
                  <span className="text-[11px] text-zinc-400 mt-1 block leading-relaxed">
                    Bloquea pedidos ahora mismo (imprevisto, lluvia, feriado).
                  </span>
                </button>
              </div>
            </div>

            {/* Tabla de Días y Horas */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#12141c] border border-white/10 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-sm font-black text-white">Días y Horarios de Atención</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Activa qué días atiende el local y define la hora de inicio y término.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">Validación de Horarios:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setHorarioConfig({ ...horarioConfig, habilitado: !horarioConfig.habilitado })
                    }
                    className={`px-3 py-1 rounded-full text-xs font-black transition ${
                      horarioConfig.habilitado
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-800 text-zinc-400 border border-white/10'
                    }`}
                  >
                    {horarioConfig.habilitado ? 'ACTIVA' : 'PAUSADA'}
                  </button>
                </div>
              </div>

              {/* Botones de Presets Rápidos para Móvil y Desktop */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block w-full sm:w-auto">
                  Presets Rápidos:
                </span>
                <button
                  type="button"
                  onClick={() => handleAplicarPresetHorario('habitual')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-black active:scale-95 text-xs text-amber-300 font-bold border border-white/10 transition"
                >
                  ⚡ Habitual (18:00 - 23:30 / Vie-Sáb 00:30)
                </button>
                <button
                  type="button"
                  onClick={() => handleAplicarPresetHorario('2330')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs text-zinc-300 font-medium border border-white/10 transition"
                >
                  ⏰ Todos a 23:30
                </button>
                <button
                  type="button"
                  onClick={() => handleAplicarPresetHorario('0030')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs text-zinc-300 font-medium border border-white/10 transition"
                >
                  🌙 Todos a 00:30
                </button>
              </div>

              <div className="divide-y divide-white/5 pt-2">
                {horarioConfig.dias.map((d) => (
                  <div
                    key={d.dia}
                    className={`py-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 transition ${
                      !d.abierto ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Switch / Toggle de Día */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleDiaAbierto(d.dia)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center border font-bold text-xs transition active:scale-90 ${
                          d.abierto
                            ? 'bg-amber-500 border-amber-500 text-black shadow-md shadow-amber-500/20'
                            : 'bg-zinc-900 border-zinc-700 text-transparent'
                        }`}
                        title="Activar o desactivar este día"
                      >
                        ✓
                      </button>
                      <div>
                        <span className="font-black text-sm text-white block">
                          {NOMBRES_DIAS_CORRECTOS[d.dia] || d.nombre}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {d.abierto ? 'Atiende este día' : 'Cerrado este día'}
                        </span>
                      </div>
                    </div>

                    {/* Controles de Hora Táctiles para Móvil */}
                    {d.abierto ? (
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full lg:w-auto">
                        {/* Apertura */}
                        <div className="bg-black/60 p-2 sm:p-2.5 rounded-2xl border border-white/10 flex flex-col gap-1.5 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-400">Abre:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleCambiarHoraDia(d.dia, 'horaApertura', ajustarHora(d.horaApertura, -30))
                                }
                                className="px-1.5 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-[10px] text-zinc-300 font-mono font-bold border border-white/10"
                                title="Restar 30m"
                              >
                                -30m
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCambiarHoraDia(d.dia, 'horaApertura', ajustarHora(d.horaApertura, 30))
                                }
                                className="px-1.5 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-[10px] text-zinc-300 font-mono font-bold border border-white/10"
                                title="Sumar 30m"
                              >
                                +30m
                              </button>
                            </div>
                          </div>
                          <input
                            type="time"
                            value={d.horaApertura}
                            onChange={(e) => handleCambiarHoraDia(d.dia, 'horaApertura', e.target.value)}
                            className="w-full bg-zinc-900 border border-white/20 rounded-xl px-2.5 py-2 text-sm sm:text-base text-amber-300 font-mono font-bold focus:border-amber-500 focus:outline-none min-h-[44px] [color-scheme:dark] text-center"
                          />
                        </div>

                        {/* Cierre */}
                        <div className="bg-black/60 p-2 sm:p-2.5 rounded-2xl border border-white/10 flex flex-col gap-1.5 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-400">Cierra:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleCambiarHoraDia(d.dia, 'horaCierre', ajustarHora(d.horaCierre, -30))
                                }
                                className="px-1.5 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-[10px] text-zinc-300 font-mono font-bold border border-white/10"
                                title="Restar 30m"
                              >
                                -30m
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCambiarHoraDia(d.dia, 'horaCierre', ajustarHora(d.horaCierre, 30))
                                }
                                className="px-1.5 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-[10px] text-zinc-300 font-mono font-bold border border-white/10"
                                title="Sumar 30m"
                              >
                                +30m
                              </button>
                            </div>
                          </div>
                          <input
                            type="time"
                            value={d.horaCierre}
                            onChange={(e) => handleCambiarHoraDia(d.dia, 'horaCierre', e.target.value)}
                            className="w-full bg-zinc-900 border border-white/20 rounded-xl px-2.5 py-2 text-sm sm:text-base text-amber-300 font-mono font-bold focus:border-amber-500 focus:outline-none min-h-[44px] [color-scheme:dark] text-center"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 text-xs text-zinc-500 italic bg-black/30 px-3 rounded-xl border border-white/5">
                        Local cerrado este día
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mensaje Personalizado para Clientes */}
            <div className="p-5 rounded-3xl bg-[#12141c] border border-white/10 space-y-2 shadow-xl">
              <label className="text-xs font-black text-amber-300 uppercase tracking-wider block">
                Mensaje de Aviso cuando el Local esté Cerrado:
              </label>
              <textarea
                rows={2}
                value={horarioConfig.mensajeCerrado || ''}
                onChange={(e) => setHorarioConfig({ ...horarioConfig, mensajeCerrado: e.target.value })}
                placeholder="Ej: Local cerrado en este momento. Revisa nuestros horarios de atención."
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none resize-none"
              />
              <p className="text-[11px] text-zinc-500">
                Este mensaje se mostrará a los clientes en la parte superior y en el carrito cuando no puedan pedir.
              </p>
            </div>

            {/* Botón Guardar Horario */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={guardandoHorario}
                onClick={() => handleGuardarHorario()}
                className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-extrabold text-sm uppercase tracking-wider rounded-2xl transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 disabled:opacity-50"
              >
                {guardandoHorario ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : horarioGuardadoExito ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{horarioGuardadoExito ? '¡Horarios Guardados con Éxito!' : 'Guardar Horarios de Atención'}</span>
              </button>
            </div>
          </div>
        ) : activeTab === 'guincha' ? (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Banner explicativo */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-lg">
                📢
              </div>
              <p>
                <strong>Gestión de la Guincha / Cintillo TV:</strong> Los mensajes que configures aquí se mostrarán en la cinta animada inferior de las pantallas TV con texto grande y legible a distancia. Puedes agregar ofertas, avisos de delivery, números de contacto o eventos.
              </p>
            </div>

            {/* Previsualización en Vivo de la Guincha */}
            <div className="p-5 rounded-3xl bg-[#12141c] border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Previsualización en Vivo de la Guincha (Texto Grande TV)
                </span>
                <span className="text-[11px] text-zinc-400">Visible a 3-4 metros</span>
              </div>

              <div className="w-full h-14 rounded-2xl bg-amber-500 text-black flex items-center overflow-hidden shadow-xl border-2 border-amber-400">
                <div className="whitespace-nowrap animate-marquee flex items-center gap-10 pl-4 text-base sm:text-lg font-black uppercase tracking-wider">
                  {mensajesGuincha.length > 0 ? (
                    <>
                      {mensajesGuincha.map((msg, i) => (
                        <React.Fragment key={i}>
                          <span>{msg}</span>
                          <span className="text-black/40 text-lg">✦</span>
                        </React.Fragment>
                      ))}
                      {mensajesGuincha.map((msg, i) => (
                        <React.Fragment key={`rep-${i}`}>
                          <span>{msg}</span>
                          <span className="text-black/40 text-lg">✦</span>
                        </React.Fragment>
                      ))}
                    </>
                  ) : (
                    <span>Agrega mensajes abajo para verlos en la guincha</span>
                  )}
                </div>
              </div>
            </div>

            {/* Configuración Dinámica de WhatsApp para toda la App y la TV */}
            <div className="p-5 rounded-3xl bg-[#12141c] border border-amber-500/30 shadow-2xl space-y-3">
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shadow">
                  📱
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Número de WhatsApp para Pedidos y Contacto
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Se sincroniza en vivo en el cintillo de la TV, la carta web, botones flotantes y confirmación de pedidos
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-amber-300 block mb-1.5">
                  Teléfono / WhatsApp del Local:
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        guardarMensajesEnServidor(mensajesGuincha, whatsappInput);
                      }
                    }}
                    placeholder="+56 9 3255 3527"
                    className="flex-1 px-4 py-2.5 bg-black/70 border border-white/10 rounded-xl text-sm text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={guardandoGuincha}
                    onClick={() => guardarMensajesEnServidor(mensajesGuincha, whatsappInput)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 shadow-md shadow-emerald-900/30"
                  >
                    {guardandoGuincha ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : guinchaGuardadaExito ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>{guinchaGuardadaExito ? '¡Guardado!' : 'Guardar WhatsApp'}</span>
                  </button>
                </div>
                <span className="text-xs text-zinc-400 mt-1 block">
                  Presiona Enter o haz clic en Guardar WhatsApp para aplicarlo en Web y TV.
                </span>
              </div>
            </div>

            {/* Lista de Mensajes Activos */}
            <div className="p-6 rounded-3xl bg-[#12141c] border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Mensajes Activos en la Guincha</span>
                  <span className="text-xs font-mono bg-zinc-800 text-amber-400 px-2.5 py-0.5 rounded-full border border-white/10">
                    {mensajesGuincha.length}
                  </span>
                </h3>
                <span className="text-xs text-zinc-400">Edita o elimina cada frase</span>
              </div>

              {mensajesGuincha.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  No hay mensajes configurados. Agrega uno a continuación.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {mensajesGuincha.map((msg, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-900/90 rounded-2xl border border-white/5 flex items-center gap-3 shadow-md hover:border-amber-500/30 transition"
                    >
                      <span className="w-6 h-6 rounded-lg bg-black/60 text-amber-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-white/5">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={msg}
                        onChange={(e) => handleEditarMensajeGuincha(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-black/50 border border-white/10 rounded-xl text-white font-medium text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleEliminarMensajeGuincha(idx)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 transition shrink-0"
                        title="Eliminar mensaje"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario para Agregar Nuevo Mensaje */}
              <form onSubmit={handleAgregarMensajeGuincha} className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={nuevoMensajeInput}
                  onChange={(e) => setNuevoMensajeInput(e.target.value)}
                  placeholder="Escribe un nuevo mensaje para la guincha (ej: 🍔 Promo Combo Burger + Papas $5.990)..."
                  className="flex-1 px-4 py-2.5 bg-black/70 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={!nuevoMensajeInput.trim()}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-300 font-extrabold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-40 shrink-0"
                >
                  + Agregar
                </button>
              </form>

              {/* Botón Guardar Cambios en la Guincha */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  Se actualizará automáticamente en las pantallas TV conectadas.
                </span>
                <button
                  type="button"
                  disabled={guardandoGuincha}
                  onClick={handleGuardarGuincha}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {guardandoGuincha ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : guinchaGuardadaExito ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{guinchaGuardadaExito ? '¡Mensajes Guardados!' : 'Guardar Mensajes TV'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'portada' ? (
          <div className="max-w-xl mx-auto space-y-6">
            {/* Card: Configuración Global de Opciones de Papas Fritas */}
            <div className="p-5 rounded-3xl bg-[#12141c] border border-amber-500/40 shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow">
                  🍟
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Precio Opción Papas Fritas
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Ajuste dinámico para Sándwiches, Completos y Fajitas
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                Define el valor adicional que se sumará automáticamente cuando un cliente seleccione la opción <strong>&ldquo;🍟 Con Papas&rdquo;</strong> en la carta. Si en el futuro sube el precio de las papas, modifícalo aquí sin tocar el código.
              </p>

              <form onSubmit={handleGuardarPrecioPapas} className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">$</span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={precioPapasInput}
                    onChange={(e) => setPrecioPapasInput(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-black/70 border border-white/10 rounded-xl text-amber-400 font-mono font-bold text-base focus:border-amber-500 focus:outline-none"
                    placeholder="1500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={guardandoPapas}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 shrink-0"
                >
                  {guardandoPapas ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : papasGuardadoExito ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{papasGuardadoExito ? '¡Guardado!' : 'Guardar Precio'}</span>
                </button>
              </form>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
              ⭐ <strong>Imagen de Portada (Hero Móvil):</strong> Esta es la foto destacada que ven los clientes en la parte superior de la carta (debajo del logo de Billy Burger y sobre el selector de pedidos). Puedes subir cualquier imagen en formato PNG o JPG, reemplazarla o quitarla cuando lo desees.
            </div>

            <div className="p-6 rounded-3xl bg-[#12141c] border border-white/10 shadow-2xl flex flex-col items-center text-center">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 mb-3">
                Previsualización Actual de la Portada
              </span>

              <div className="relative w-64 h-48 sm:w-72 sm:h-56 rounded-2xl bg-black/60 border-2 border-dashed border-white/20 p-2 flex items-center justify-center overflow-hidden shadow-inner my-2">
                {configTV[0]?.portada_url && configTV[0].portada_url.trim() !== '' ? (
                  <Image
                    src={configTV[0].portada_url}
                    alt="Portada Actual"
                    fill
                    unoptimized
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-500 p-4">
                    <ImageIcon className="w-12 h-12 mb-2 stroke-[1.5]" />
                    <span className="text-xs font-bold text-zinc-400">Sin foto de portada activa</span>
                    <span className="text-[11px] text-zinc-500 mt-1">La carta mostrará solo el logo e índice</span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputPortadaRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePortadaUpload(file);
                }}
              />

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputPortadaRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 transition shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{configTV[0]?.portada_url ? 'Cambiar Foto Portada' : 'Subir Foto Portada'}</span>
                </button>

                {configTV[0]?.portada_url && (
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={handleDeletePortada}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 text-xs font-bold transition flex items-center gap-1.5 border border-white/5 active:scale-95 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Quitar Foto</span>
                  </button>
                )}
              </div>

              {configTV[0]?.portada_url && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Guardado automáticamente en la nube (activo en la carta)</span>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'secciones' ? (
          <div className="space-y-4">
            {/* Barra Superior de Secciones con Botón Nueva Categoría */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#12141c] to-[#12141c] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>Secciones y Categorías ({categorias.length})</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Organiza la carta, añade nuevas secciones (Postres, Promociones, etc.) o sube fotos de cabecera.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Nueva Categoría</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {categorias.map((cat) => {
                const prodsCount = productos.filter((p) => p.categoria_id === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className={`p-4 sm:p-5 rounded-2xl bg-[#12141c] border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-lg ${
                      cat.activo === false
                        ? 'border-red-900/40 opacity-70'
                        : 'border-white/5 hover:border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/60 border border-white/10 p-1 overflow-hidden shrink-0 flex items-center justify-center">
                        {cat.imagen_url ? (
                          <Image
                            src={cat.imagen_url}
                            alt={cat.nombre}
                            fill
                            className="object-contain p-1"
                          />
                        ) : (
                          <div className="text-center p-1">
                            <ImageIcon className="w-6 h-6 text-zinc-600 mx-auto mb-1" />
                            <span className="text-[10px] text-zinc-500 font-bold block">Sin foto</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-white truncate">{cat.nombre}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              cat.activo !== false
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {cat.activo !== false ? 'Activa' : 'Oculta'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">#{cat.slug} • Orden: {cat.orden}</p>
                        <span className="text-[11px] text-amber-400/90 font-medium block mt-1">
                          {prodsCount} producto(s) asociado(s)
                        </span>
                      </div>
                    </div>

                    {/* Botones de acción de la categoría */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-white/10 pt-2.5 sm:pt-0">
                      {/* Toggle Activo */}
                      <button
                        type="button"
                        onClick={() => handleToggleActivoCategoria(cat)}
                        className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          cat.activo !== false
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                        title={cat.activo !== false ? 'Ocultar categoría de la carta' : 'Activar categoría en la carta'}
                      >
                        {cat.activo !== false ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>

                      {/* Editar datos y foto */}
                      <button
                        type="button"
                        onClick={() => setEditingCategoria({ ...cat, imagen_url: cat.imagen_url || '' })}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-200 text-xs font-black transition flex items-center gap-1.5 shrink-0"
                        title="Editar nombre, orden y foto"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      {/* Eliminar categoría */}
                      <button
                        type="button"
                        onClick={() => handleDeleteCategoria(cat)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Cabecera del apartado Productos - Único botón para crear productos */}
            <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#12141c] border border-white/5 shadow-lg">
              <div className="flex items-center justify-between sm:justify-start gap-2.5">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Carta de Productos
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  {productosFiltrados.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md shadow-amber-500/20 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Nuevo Producto</span>
              </button>
            </div>

            {/* Card: Configuración Global de Opciones de Papas Fritas en la pestaña Productos */}
            <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-[#17130b] via-[#12141c] to-[#12141c] border border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow">
                  🍟
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>Precio Opción Papas Fritas</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Sándwiches, Completos & Fajitas
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Valor adicional que se suma automáticamente al elegir &ldquo;Con Papas&rdquo;.
                  </p>
                </div>
              </div>

              <form onSubmit={handleGuardarPrecioPapas} className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-36">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">$</span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={precioPapasInput}
                    onChange={(e) => setPrecioPapasInput(Number(e.target.value))}
                    className="w-full pl-6 pr-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-amber-400 font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
                    placeholder="1500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={guardandoPapas}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 shrink-0"
                >
                  {guardandoPapas ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : papasGuardadoExito ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{papasGuardadoExito ? '¡Guardado!' : 'Guardar'}</span>
                </button>
              </form>
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
                      {prod.imagen_url && prod.mostrar_imagen_carta === false && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/5">
                          Foto solo en TV
                        </span>
                      )}
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

                    {/* Toggle Foto en Carta */}
                    <button
                      onClick={() => handleToggleFotoCarta(prod)}
                      className={`p-2 rounded-xl text-xs font-bold transition ${
                        prod.mostrar_imagen_carta !== false
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                          : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                      title={
                        prod.mostrar_imagen_carta !== false
                          ? 'Foto visible en la carta (clic para ocultar en carta)'
                          : 'Foto oculta en la carta (solo visible en pantallas TV)'
                      }
                    >
                      <ImageIcon className="w-4 h-4" />
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
      </>
    )}
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
              {/* Sección Imagen: Subir nueva o seleccionar de galería */}
              <div className="p-4 bg-zinc-900/90 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-amber-300 block">
                    Foto del Producto
                  </label>
                  {editingProduct.imagen_url && (
                    <button
                      type="button"
                      onClick={handleDeleteProductImage}
                      className="text-[11px] font-bold text-red-400 hover:text-red-300 transition"
                    >
                      Eliminar / Quitar Foto
                    </button>
                  )}
                </div>

                {/* Previsualización actual */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-16 h-16 rounded-xl bg-black overflow-hidden border border-amber-500/40 shrink-0">
                    {editingProduct.imagen_url ? (
                      <Image
                        src={editingProduct.imagen_url}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] text-zinc-400 block font-medium">Estado foto:</span>
                    <span className="text-xs font-mono text-amber-400 truncate block">
                      {editingProduct.imagen_url || 'Sin foto asignada'}
                    </span>
                  </div>
                </div>

                {/* BOTÓN SUBIR FOTO DESDE CELULAR O PC */}
                <div className="mb-3">
                  <input
                    type="file"
                    ref={fileInputEditRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0], true);
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputEditRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Subiendo foto a Supabase...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-black" />
                        <span>Subir Foto Nueva (desde celular o PC)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* O escribir URL personalizada */}
                <div className="mt-1">
                  <span className="text-[11px] text-zinc-400 font-bold block mb-1">
                    O pega una URL directa:
                  </span>
                  <input
                    type="text"
                    value={editingProduct.imagen_url || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, imagen_url: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 bg-black border border-white/10 rounded-xl text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Checkbox Mostrar Foto en Carta */}
                <div className="mt-3 p-3 bg-black/60 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <label htmlFor="editMostrarCartaCheck" className="text-xs font-bold text-white block cursor-pointer">
                      Mostrar foto en la carta
                    </label>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Si lo desmarcas, la foto se mantiene para las pantallas TV pero no se muestra repetida en el menú de clientes.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="editMostrarCartaCheck"
                    checked={editingProduct.mostrar_imagen_carta !== false}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        mostrar_imagen_carta: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer shrink-0"
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#13151e] border border-white/10 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl my-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white">Nuevo Producto</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Se reflejará automáticamente en la web y en la TV
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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

              {/* Imagen: Subir o Elegir */}
              <div className="p-3 bg-zinc-900 rounded-xl border border-white/10">
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Foto</label>
                <input
                  type="file"
                  ref={fileInputNewRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0], false);
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputNewRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/30 transition mb-2"
                >
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{isUploading ? 'Subiendo...' : 'Subir foto del producto'}</span>
                </button>

                <div className="flex items-center gap-3 mt-2">
                  <div className="relative w-12 h-12 rounded-xl bg-black overflow-hidden border border-white/10 shrink-0">
                    {nuevaImagen ? (
                      <Image src={nuevaImagen} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={nuevaImagen}
                    onChange={(e) => setNuevaImagen(e.target.value)}
                    placeholder="URL de la imagen (o súbela arriba)"
                    className="flex-1 px-3 py-2 bg-black border border-white/10 rounded-xl text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Checkbox Mostrar Foto en Carta */}
                <div className="mt-3 p-3 bg-black/60 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <label htmlFor="nuevoMostrarCartaCheck" className="text-xs font-bold text-white block cursor-pointer">
                      Mostrar foto en la carta
                    </label>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Si lo desmarcas, la foto se mantiene para pantallas TV pero no se muestra en el menú móvil/web.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="nuevoMostrarCartaCheck"
                    checked={nuevoMostrarImagenCarta}
                    onChange={(e) => setNuevoMostrarImagenCarta(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer shrink-0"
                  />
                </div>
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


      {/* MODAL CREAR NUEVA CATEGORÍA */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#13151e] border border-white/10 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl my-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">Nueva Categoría</h2>
                  <p className="text-xs text-zinc-400">
                    Se reflejará en la carta web y menuboard TV
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCrearCategoria} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoCatNombre}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNuevoCatNombre(val);
                    if (!nuevoCatSlug || nuevoCatSlug === '') {
                      const slug = val
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                      setNuevoCatSlug(slug);
                    }
                  }}
                  placeholder="Ej: Postres, Promociones, Cafetería..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Slug (URL / ancla)
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoCatSlug}
                    onChange={(e) => setNuevoCatSlug(e.target.value.toLowerCase().trim())}
                    placeholder="ej: postres"
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-amber-400 text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Orden en la Carta
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={nuevoCatOrden}
                    onChange={(e) => setNuevoCatOrden(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subir Foto de Cabecera Opcional */}
              <div className="p-3 bg-zinc-900 rounded-xl border border-white/10">
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Foto de Cabecera / Cutout (Opcional)
                </label>
                <p className="text-[11px] text-zinc-400 mb-2">
                  Imagen decorativa que acompaña el encabezado de la sección en la carta
                </p>

                <input
                  type="file"
                  ref={fileInputNewCatRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleNewCategoryUpload(file);
                  }}
                />

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputNewCatRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/30 transition mb-2"
                >
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{isUploading ? 'Subiendo imagen...' : 'Subir imagen para la sección'}</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl bg-black overflow-hidden border border-white/10 shrink-0">
                    {nuevoCatImagen ? (
                      <Image src={nuevoCatImagen} alt="Preview" fill className="object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={nuevoCatImagen}
                    onChange={(e) => setNuevoCatImagen(e.target.value)}
                    placeholder="URL de imagen o súbela arriba"
                    className="flex-1 px-3 py-1.5 bg-black border border-white/10 rounded-xl text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Activa en la Carta</span>
                  <p className="text-[11px] text-zinc-400">Visible para clientes de inmediato</p>
                </div>
                <input
                  type="checkbox"
                  checked={nuevoCatActivo}
                  onChange={(e) => setNuevoCatActivo(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                >
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR CATEGORÍA COMPLETA */}
      {editingCategoria && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#13151e] border border-white/10 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl my-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-400" />
                <span>Editar Categoría: {editingCategoria.nombre}</span>
              </h2>
              <button
                type="button"
                onClick={() => setEditingCategoria(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCategoria} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={editingCategoria.nombre}
                    onChange={(e) =>
                      setEditingCategoria({ ...editingCategoria, nombre: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={editingCategoria.slug}
                    onChange={(e) =>
                      setEditingCategoria({ ...editingCategoria, slug: e.target.value.toLowerCase().trim() })
                    }
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-amber-400 text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Orden en la Carta</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingCategoria.orden}
                    onChange={(e) =>
                      setEditingCategoria({ ...editingCategoria, orden: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="editCatActivoCheck"
                    checked={editingCategoria.activo !== false}
                    onChange={(e) =>
                      setEditingCategoria({ ...editingCategoria, activo: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                  <label htmlFor="editCatActivoCheck" className="text-xs font-bold text-zinc-300 cursor-pointer">
                    Visible en la carta
                  </label>
                </div>
              </div>

              <div className="p-4 bg-zinc-900/90 rounded-2xl border border-white/10">
                <label className="text-xs font-bold text-amber-300 block mb-2">
                  Foto de Cabecera / Cutout Decorativo
                </label>

                {/* Previsualización actual */}
                <div className="flex items-center justify-center p-3 rounded-xl bg-black/60 border border-amber-500/30 mb-3">
                  <div className="relative w-36 h-24 sm:w-44 sm:h-28">
                    {editingCategoria.imagen_url ? (
                      <Image
                        src={editingCategoria.imagen_url}
                        alt={editingCategoria.nombre}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                        Sin foto asignada
                      </div>
                    )}
                  </div>
                </div>

                {/* Subir archivo desde PC o Móvil */}
                <input
                  type="file"
                  ref={fileInputCatRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCategoryUpload(file);
                  }}
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputCatRef.current?.click()}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>
                      {isUploading ? 'Subiendo imagen...' : 'Subir Foto'}
                    </span>
                  </button>

                  {editingCategoria.imagen_url && (
                    <button
                      type="button"
                      onClick={handleDeleteCategoryImage}
                      className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition flex items-center gap-1.5"
                      title="Eliminar foto del bucket"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Quitar</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingCategoria(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
