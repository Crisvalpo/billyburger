-- ==========================================
-- BILLYBURGER DATABASE SCHEMA (SUPABASE)
-- Esquema: billy
-- ==========================================

CREATE SCHEMA IF NOT EXISTS billy;

-- 1. Categorías de la Carta
CREATE TABLE IF NOT EXISTS billy.categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    orden INT DEFAULT 0,
    icono TEXT DEFAULT 'Utensils',
    imagen_url TEXT,
    activo BOOLEAN DEFAULT true,
    creado_el TIMESTAMPTZ DEFAULT now()
);

-- 2. Productos
CREATE TABLE IF NOT EXISTS billy.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID REFERENCES billy.categorias(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio INT NOT NULL,
    precio_secundario INT,
    etiqueta_precio_secundario TEXT,
    imagen_url TEXT,
    disponible BOOLEAN DEFAULT true,
    es_destacado BOOLEAN DEFAULT false,
    mostrar_en_tv BOOLEAN DEFAULT true,
    pantalla_tv INT DEFAULT 1, -- 1: Pantalla Principal (Burgers/Papas), 2: Pantalla Secundaria (Sandwiches/Chorrillanas/Bebidas), 0: Ambas
    orden INT DEFAULT 0,
    creado_el TIMESTAMPTZ DEFAULT now(),
    actualizado_el TIMESTAMPTZ DEFAULT now()
);

-- 3. Eventos y Promociones
CREATE TABLE IF NOT EXISTS billy.eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha_evento TEXT,
    banner_url TEXT,
    mostrar_en_tv BOOLEAN DEFAULT true,
    activo BOOLEAN DEFAULT true,
    orden INT DEFAULT 0,
    creado_el TIMESTAMPTZ DEFAULT now()
);

-- 4. Configuración Menuboard TV
CREATE TABLE IF NOT EXISTS billy.configuracion_tv (
    pantalla_id INT PRIMARY KEY,
    nombre TEXT NOT NULL,
    segundos_rotacion INT DEFAULT 12,
    cintillo_texto TEXT DEFAULT '¡Haz tu pedido en caja o vía WhatsApp al +56 9 3255 3527!',
    cintillo_mensajes JSONB DEFAULT '[]'::jsonb,
    portada_url TEXT,
    precio_papas_combo INT DEFAULT 1500,
    horario_atencion JSONB,
    telefono_whatsapp TEXT DEFAULT '+56 9 3255 3527',
    actualizado_el TIMESTAMPTZ DEFAULT now()
);

-- 5. Habilitar Realtime para reflejo instantáneo en Smart TVs
ALTER PUBLICATION supabase_realtime ADD TABLE billy.categorias;
ALTER PUBLICATION supabase_realtime ADD TABLE billy.productos;
ALTER PUBLICATION supabase_realtime ADD TABLE billy.eventos;
ALTER PUBLICATION supabase_realtime ADD TABLE billy.configuracion_tv;
