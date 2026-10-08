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
  mostrar_imagen_carta?: boolean; // Controla si se muestra la foto en la carta web/móvil
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

export interface HorarioDia {
  dia: number; // 0: Domingo, 1: Lunes, 2: Martes, 3: Miércoles, 4: Jueves, 5: Viernes, 6: Sábado
  nombre: string;
  abierto: boolean;
  horaApertura: string; // '18:00'
  horaCierre: string; // '23:30' o '01:00'
}

export interface ConfiguracionHorario {
  habilitado: boolean;
  modoForzado?: 'auto' | 'abierto' | 'cerrado';
  mensajeCerrado?: string;
  dias: HorarioDia[];
}

export interface ConfiguracionTV {
  pantalla_id: number;
  nombre: string;
  segundos_rotacion: number;
  cintillo_texto: string;
  portada_url?: string;
  precio_papas_combo?: number;
  horario_atencion?: ConfiguracionHorario;
}


