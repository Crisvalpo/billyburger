-- ==========================================
-- BILLYBURGER SEED DATA (MENU COMPLETO)
-- ==========================================

-- Limpiar datos previos si existen
TRUNCATE billy.productos, billy.eventos, billy.configuracion_tv, billy.categorias CASCADE;

-- Insertar Configuración de Pantallas TV
INSERT INTO billy.configuracion_tv (pantalla_id, nombre, segundos_rotacion, cintillo_texto) VALUES
(1, 'Pantalla 1 - Burgers & Papas Fritas', 12, '🍔 ¡Bienvenido a Billy Burger! Pide en caja o al WhatsApp +56 9 3255 3527 • Todas las burgers y sándwiches incluyen crujientes papas fritas'),
(2, 'Pantalla 2 - Chorrillanas & Sándwiches', 12, '🔥 Prueba nuestras Chorrillanas y Sándwiches XL • Eventos y celebraciones a pedido al +56 9 3255 3527');

-- Insertar Categorías y guardar IDs en variables temporales
DO $$
DECLARE
    cat_burgers UUID;
    cat_sandwiches UUID;
    cat_chorrillanas UUID;
    cat_papas UUID;
    cat_completos UUID;
    cat_fajitas UUID;
    cat_ensaladas UUID;
    cat_bebidas UUID;
BEGIN
    INSERT INTO billy.categorias (nombre, slug, orden, icono) VALUES
    ('Burgers + Papas', 'burgers', 1, 'Flame') RETURNING id INTO cat_burgers;

    INSERT INTO billy.categorias (nombre, slug, orden, icono) VALUES
    ('Sandwich', 'sandwiches', 2, 'Sandwich') RETURNING id INTO cat_sandwiches;

    INSERT INTO billy.categorias (nombre, slug, orden, icono) VALUES
    ('Chorrillanas', 'chorrillanas', 3, 'Drumstick') RETURNING id INTO cat_chorrillanas;

    INSERT INTO billy.categorias (nombre, slug, orden, icono) VALUES
    ('Papas Fritas', 'papas-fritas', 4, 'UtensilsCrossed') RETURNING id INTO cat_papas;

    INSERT INTO billy.categorias (nombre, slug, orden, icono) VALUES
    ('Completos & Ases', 'completos', 5, 'Beef') RETURNING id INTO cat_completos;

    INSERT INTO billy.categorias (nombre, slug, orden, icono) VALUES
    ('Fajitas', 'fajitas', 6, 'Wrap') RETURNING id INTO cat_fajitas;

    INSERT INTO billy.categorias (nombre, slug, orden, icono) VALUES
    ('Ensaladas', 'ensaladas', 7, 'Salad') RETURNING id INTO cat_ensaladas;

    INSERT INTO billy.categorias (nombre, slug, orden, icono) VALUES
    ('Bebidas', 'bebidas', 8, 'CupSoda') RETURNING id INTO cat_bebidas;

    -- =================== BURGERS ===================
    INSERT INTO billy.productos (categoria_id, nombre, descripcion, precio, imagen_url, es_destacado, mostrar_en_tv, pantalla_tv, orden) VALUES
    (cat_burgers, 'Hamburguesa Walala', 'Doble Queso Cheddar, Doble Carne, Cebolla Caramelizada, Huevo, Tocino, Champiñón, Tomate, Palta, Mayo, Bbq, Mostaza y Ketchup', 7000, '/images/395747bfb6d9559fbc5e6ce7c00e365e.jpg', true, true, 1, 1),
    (cat_burgers, 'Doble Sensación', 'Doble Carne, Doble Queso Cheddar, Palta, Mayo, Bbq, Mostaza y Ketchup', 6000, '/images/e88fb0a7c5f6a08ae9bba1aa294d8bb9.png', true, true, 1, 2),
    (cat_burgers, 'Hamburguesa Basqui', 'Champiñón, Crema, Queso Cheddar, Queso gouda, Tocino, Bbq, Mostaza y Ketchup', 6500, '/images/e88fb0a7c5f6a08ae9bba1aa294d8bb9.png', false, true, 1, 3),
    (cat_burgers, 'Hamburguesa Tutty', 'Queso, Champiñón, Tocino, Tomate, Palta, Mayo, Bbq, Mostaza y Ketchup', 6000, '/images/395747bfb6d9559fbc5e6ce7c00e365e.jpg', false, true, 1, 4),
    (cat_burgers, 'Hamburguesa Billy', 'Queso Cheddar, Lechuga, Pepinillo, Tocino, Mayo, Bbq, Mostaza y Ketchup', 5500, '/images/e88fb0a7c5f6a08ae9bba1aa294d8bb9.png', true, true, 1, 5),
    (cat_burgers, 'Hamburguesa Ju', 'Tomate, Lechuga, Cebolla, Queso Cheddar, Salsa Gold más pepinillos', 5500, '/images/e88fb0a7c5f6a08ae9bba1aa294d8bb9.png', false, true, 1, 6),
    (cat_burgers, 'Hamburguesa Cheddar', 'Queso Cheddar, Cebolla Caramelizada, Bbq, Mostaza y Ketchup', 5000, '/images/e88fb0a7c5f6a08ae9bba1aa294d8bb9.png', false, true, 1, 7),
    (cat_burgers, 'Hamburguesa Italiana', 'Tomate, Palta, Mayo, Queso Cheddar, Bbq, Mostaza y Ketchup', 5000, '/images/e88fb0a7c5f6a08ae9bba1aa294d8bb9.png', false, true, 1, 8),
    (cat_burgers, 'Hamburguesa 1/4', 'Pepinillo, Cebolla, Queso Cheddar, Bbq, Mostaza y Ketchup', 5000, '/images/e88fb0a7c5f6a08ae9bba1aa294d8bb9.png', false, true, 1, 9),
    (cat_burgers, 'Hamburguesa Veggie', 'Champiñón, Zapallo Italiano o Huevo, Tomate, Palta, Mayo, Queso Cheddar, Bbq, Mostaza y Ketchup', 5000, '/images/e88fb0a7c5f6a08ae9bba1aa294d8bb9.png', false, true, 1, 10);

    -- =================== SANDWICHES ===================
    INSERT INTO billy.productos (categoria_id, nombre, descripcion, precio, precio_secundario, etiqueta_precio_secundario, imagen_url, es_destacado, mostrar_en_tv, pantalla_tv, orden) VALUES
    (cat_sandwiches, 'Churrasco a lo Pobre', 'Carne, Huevo, Cebolla y Papas Fritas en el Sándwich', 7000, 5500, 'Sin Papas', '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', true, true, 2, 1),
    (cat_sandwiches, 'Churrasco Miguelo', 'Carne, Queso gouda y Palta', 6500, 5000, 'Sin Papas', '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 2),
    (cat_sandwiches, 'Sandwich Napolitano', 'Churrasco, Tomate, Queso y Orégano', 7000, 5500, 'Sin Papas', '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 3),
    (cat_sandwiches, 'Sandwich Champiñón', 'Churrasco, Queso gouda y Champiñón', 7000, 5500, 'Sin Papas', '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 4),
    (cat_sandwiches, 'Mechada Italiana', 'Tomate, Palta y Mayo', 6200, 4700, 'Sin Papas', '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', true, true, 2, 5),
    (cat_sandwiches, 'Mechada Queso', 'Carne Mechada y Queso gouda fundido', 6200, 4700, 'Sin Papas', '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 6),
    (cat_sandwiches, 'Mechada Chacarera', 'Tomate, Palta, Mayo, Poroto Verde y Ají Verde', 7000, 5500, 'Sin Papas', '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 7),
    (cat_sandwiches, 'Mechada Jimmy', 'Tomate, Palta, Mayo y Cebolla Caramelizada', 6500, 5000, 'Sin Papas', '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 8),
    (cat_sandwiches, 'Churrasco Italiano', 'Tomate, Palta y Mayo', 6200, 4700, 'Sin Papas', '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 9),
    (cat_sandwiches, 'Churrasco Barros Luco', 'Carne y Queso gouda fundido', 6200, 4700, 'Sin Papas', '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 10),
    (cat_sandwiches, 'Churrasco Chacarero', 'Tomate, Palta, Mayo, Poroto Verde y Ají Verde', 7000, 5500, 'Sin Papas', '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 11),
    (cat_sandwiches, 'Pollo Italiana', 'Pollo a la plancha, Tomate, Palta y Mayo', 6200, 4700, 'Sin Papas', '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 12),
    (cat_sandwiches, 'Pollo Queso', 'Pollo a la plancha y Queso gouda', 6200, 4700, 'Sin Papas', '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 13),
    (cat_sandwiches, 'Pollo Chacarero', 'Pollo a la plancha, Tomate, Palta, Mayo, Poroto Verde y Ají Verde', 7000, 5500, 'Sin Papas', '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 14);

    -- =================== CHORRILLANAS ===================
    INSERT INTO billy.productos (categoria_id, nombre, descripcion, precio, imagen_url, es_destacado, mostrar_en_tv, pantalla_tv, orden) VALUES
    (cat_chorrillanas, 'Chorrillana Grande', 'Papas Fritas crujientes, abundante carne, cebolla caramelizada y 2 huevos fritos (Para compartir)', 12500, '/images/21563c566950eabf31a360d208c462f3.png', true, true, 2, 1),
    (cat_chorrillanas, 'Chorrillana Chica', 'Papas Fritas, carne, cebolla caramelizada y huevo frito', 6500, '/images/21563c566950eabf31a360d208c462f3.png', false, true, 2, 2),
    (cat_chorrillanas, 'Chorrillana Puma Grande', 'Receta especial Puma, papas fritas y mix de ingredientes', 9500, '/images/21563c566950eabf31a360d208c462f3.png', false, true, 2, 3),
    (cat_chorrillanas, 'Chorrillana Puma Chica', 'Receta especial Puma individual', 5500, '/images/21563c566950eabf31a360d208c462f3.png', false, true, 2, 4);

    -- =================== PAPAS FRITAS ===================
    INSERT INTO billy.productos (categoria_id, nombre, descripcion, precio, imagen_url, es_destacado, mostrar_en_tv, pantalla_tv, orden) VALUES
    (cat_papas, 'Salchi Papa Grande', 'Porción abundante de papas fritas con vienesa salteada', 8500, '/images/3d75f978fb46740ea58ffba38bc4dff0.png', true, true, 1, 1),
    (cat_papas, 'Salchi Papa Chica', 'Papas fritas con vienesa salteada', 5000, '/images/3d75f978fb46740ea58ffba38bc4dff0.png', false, true, 1, 2),
    (cat_papas, 'Papa Frita Grande', 'Porción familiar de papas fritas crujientes', 6000, '/images/3d75f978fb46740ea58ffba38bc4dff0.png', false, true, 1, 3),
    (cat_papas, 'Papa Frita Mediana', 'Porción mediana', 4000, '/images/3d75f978fb46740ea58ffba38bc4dff0.png', false, true, 1, 4),
    (cat_papas, 'Papa Frita Chica', 'Porción individual', 2000, '/images/3d75f978fb46740ea58ffba38bc4dff0.png', false, true, 1, 5);

    -- =================== COMPLETOS & ASES ===================
    INSERT INTO billy.productos (categoria_id, nombre, descripcion, precio, imagen_url, es_destacado, mostrar_en_tv, pantalla_tv, orden) VALUES
    (cat_completos, 'AS Mechada o Churrasco', 'Mechada o Churrasco, Tomate, Palta, Mayo o Queso gouda', 2800, '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', true, true, 2, 1),
    (cat_completos, 'Champipleto', 'Champiñón, Tomate, Palta, Mayo o Champiñón con Queso gouda', 2500, '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 2),
    (cat_completos, 'Pollopleto', 'Pollo a la plancha, Tomate, Palta, Mayo o Queso gouda', 2500, '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 3),
    (cat_completos, 'Completo Tradicional', 'Tomate, Palta, Mayo, Chucrut y Americana', 2200, '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 4),
    (cat_completos, 'Completo Italiano', 'Vienesa, Tomate, Palta y Mayo casera', 2000, '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', true, true, 2, 5),
    (cat_completos, 'Papapleto', 'Papas Fritas, Tomate, Palta y Mayo', 1700, '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 6),
    (cat_completos, 'Panchito', 'Pan, Vienesa y Ketchup', 1500, '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 7);

    -- =================== FAJITAS ===================
    INSERT INTO billy.productos (categoria_id, nombre, descripcion, precio, imagen_url, es_destacado, mostrar_en_tv, pantalla_tv, orden) VALUES
    (cat_fajitas, 'Fajita Cedric', 'Carne, Queso gouda fundido y Champiñón', 4500, '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', true, true, 2, 1),
    (cat_fajitas, 'Fajita Mixta', 'Tomate, Palta, Mayo, Lechuga, Carne y Pollo', 4500, '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', true, true, 2, 2),
    (cat_fajitas, 'Fajita Carne o Pollo', 'Tomate, Palta, Mayo, Lechuga, Carne o Pollo a elección', 4000, '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 3),
    (cat_fajitas, 'Fajita Champiñón', 'Tomate, Palta, Mayo, Lechuga y Champiñón', 3500, '/images/fe065dbf0412b66d90eeed1bf975c0b6.png', false, true, 2, 4);

    -- =================== ENSALADAS ===================
    INSERT INTO billy.productos (categoria_id, nombre, descripcion, precio, imagen_url, es_destacado, mostrar_en_tv, pantalla_tv, orden) VALUES
    (cat_ensaladas, 'Ensalada Completa Billy', 'Tomate, Palta, Lechuga, Carne, Pollo, Papas Fritas y Huevo', 5500, '/images/4029ddaca1b888b1ff20dcc96b615aac.png', true, true, 2, 1);

    -- =================== BEBIDAS ===================
    INSERT INTO billy.productos (categoria_id, nombre, descripcion, precio, imagen_url, es_destacado, mostrar_en_tv, pantalla_tv, orden) VALUES
    (cat_bebidas, 'Bebida 2 Litros', 'Variedad de sabores (Coca-Cola, Sprite, Fanta)', 2800, '/images/1ffa9750e1002b36fc52371703b341fb.png', false, true, 0, 1),
    (cat_bebidas, 'Bebida 1.5 Litros', 'Variedad de sabores', 2500, '/images/1ffa9750e1002b36fc52371703b341fb.png', false, true, 0, 2),
    (cat_bebidas, 'Jugo 2 Litros', 'Sabores surtidos', 2000, '/images/1ffa9750e1002b36fc52371703b341fb.png', false, true, 0, 3),
    (cat_bebidas, 'Bebida en Lata 350cc', 'Variedad de sabores bien heladas', 1500, '/images/1ffa9750e1002b36fc52371703b341fb.png', true, true, 0, 4),
    (cat_bebidas, 'Agua Mineral 500cc', 'Con o Sin Gas', 1500, '/images/1ffa9750e1002b36fc52371703b341fb.png', false, true, 0, 5);

END $$;

-- Insertar Evento Inicial
INSERT INTO billy.eventos (titulo, descripcion, fecha_evento, banner_url, mostrar_en_tv, activo, orden) VALUES
('¡Celebra tu Cumpleaños con Nosotros!', 'Reserva tu mesa o cotiza tu evento especial con promociones exclusivas en hamburguesas y chorrillanas.', 'Viernes y Sábados', '/images/395747bfb6d9559fbc5e6ce7c00e365e.jpg', true, true, 1);
