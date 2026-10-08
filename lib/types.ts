export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
  icono?: string;
  imagen_url?: string;
  activo: boolean;
}

export interface Producto {
  id: string;
  categoria_id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_secundario?: number; // Para sándwiches 'Sin Papas'
  etiqueta_precio_secundario?: string; // Ej: 'Sin Papas'
  imagen_url?: string;
  disponible: boolean;
  es_destacado: boolean;
  mostrar_en_tv: boolean;
  pantalla_tv: number; // 0: Ambas, 1: TV 1, 2: TV 2
  orden: number;
}

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_evento: string;
  banner_url?: string;
  mostrar_en_tv: boolean;
  activo: boolean;
  orden: number;
}

export interface ConfiguracionTV {
  pantalla_id: number;
  nombre: string;
  segundos_rotacion: number;
  cintillo_texto: string;
  portada_url?: string;
}
