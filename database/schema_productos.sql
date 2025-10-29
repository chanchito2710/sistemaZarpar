-- ============================================
-- SCHEMA PARA SISTEMA DE PRODUCTOS
-- Sistema ZARPAR - Gestión de Stock por Sucursal
-- ============================================

-- Tabla principal: PRODUCTOS
-- Almacena la información básica de cada producto (independiente de sucursal)
CREATE TABLE IF NOT EXISTS productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL COMMENT 'Nombre del producto (ej: Arroz)',
  marca VARCHAR(100) COMMENT 'Marca del producto (ej: Saman)',
  tipo VARCHAR(100) COMMENT 'Tipo de producto (ej: Grano largo, Integral)',
  calidad ENUM('Economica', 'Media', 'Premium', 'Super Premium') DEFAULT 'Media' COMMENT 'Nivel de calidad del producto',
  codigo_barras VARCHAR(50) UNIQUE COMMENT 'Código de barras (opcional)',
  descripcion TEXT COMMENT 'Descripción adicional del producto',
  activo BOOLEAN DEFAULT 1 COMMENT '1 = Producto activo, 0 = Producto desactivado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  
  INDEX idx_nombre (nombre),
  INDEX idx_marca (marca),
  INDEX idx_activo (activo),
  INDEX idx_codigo_barras (codigo_barras)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo maestro de productos';

-- Tabla de relación: PRODUCTOS_SUCURSAL
-- Almacena stock y precio específico de cada producto en cada sucursal
CREATE TABLE IF NOT EXISTS productos_sucursal (
  id INT PRIMARY KEY AUTO_INCREMENT,
  producto_id INT NOT NULL COMMENT 'ID del producto (FK a productos)',
  sucursal ENUM('maldonado', 'pando', 'rivera', 'melo', 'paysandu', 'salto', 'tacuarembo') NOT NULL COMMENT 'Nombre de la sucursal',
  stock INT DEFAULT 0 COMMENT 'Cantidad disponible en esta sucursal',
  precio DECIMAL(10,2) NOT NULL COMMENT 'Precio de venta en esta sucursal',
  stock_minimo INT DEFAULT 10 COMMENT 'Stock mínimo para alertas',
  es_stock_principal BOOLEAN DEFAULT 0 COMMENT '1 = Stock principal (Maldonado), 0 = Stock local',
  activo BOOLEAN DEFAULT 1 COMMENT '1 = Producto disponible en esta sucursal, 0 = No disponible',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_producto_sucursal (producto_id, sucursal) COMMENT 'Un producto solo puede tener un registro por sucursal',
  INDEX idx_sucursal (sucursal),
  INDEX idx_stock (stock),
  INDEX idx_es_stock_principal (es_stock_principal),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stock y precios por sucursal';

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL - PARA TESTING)
-- ============================================

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, marca, tipo, calidad, codigo_barras, descripcion) VALUES
('Arroz', 'Saman', 'Grano largo', 'Premium', '7790001000001', 'Arroz grano largo premium de 1kg'),
('Azúcar', 'Bella Unión', 'Refinada', 'Media', '7790001000002', 'Azúcar refinada blanca de 1kg'),
('Aceite', 'Cocinero', 'Girasol', 'Media', '7790001000003', 'Aceite de girasol puro de 900ml'),
('Fideos', 'Don Vicente', 'Tallarines', 'Premium', '7790001000004', 'Fideos tallarines premium 500g'),
('Sal', 'Celusal', 'Fina', 'Economica', NULL, 'Sal fina de mesa 500g');

-- Insertar stock y precios por sucursal
-- Producto 1: Arroz Saman
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal) VALUES
(1, 'maldonado', 1000, 50.00, 100, 1),  -- Stock principal
(1, 'pando', 20, 55.00, 10, 0),
(1, 'rivera', 15, 53.00, 10, 0),
(1, 'melo', 25, 54.00, 10, 0),
(1, 'paysandu', 18, 56.00, 10, 0),
(1, 'salto', 22, 55.00, 10, 0),
(1, 'tacuarembo', 12, 57.00, 10, 0);

-- Producto 2: Azúcar Bella Unión
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal) VALUES
(2, 'maldonado', 500, 30.00, 50, 1),
(2, 'pando', 30, 32.00, 10, 0),
(2, 'rivera', 25, 31.50, 10, 0),
(2, 'melo', 28, 32.50, 10, 0),
(2, 'paysandu', 20, 33.00, 10, 0),
(2, 'salto', 35, 31.80, 10, 0),
(2, 'tacuarembo', 15, 33.50, 10, 0);

-- Producto 3: Aceite Cocinero
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal) VALUES
(3, 'maldonado', 800, 120.00, 80, 1),
(3, 'pando', 40, 125.00, 15, 0),
(3, 'rivera', 35, 123.00, 15, 0),
(3, 'melo', 38, 126.00, 15, 0),
(3, 'paysandu', 42, 124.50, 15, 0),
(3, 'salto', 45, 125.50, 15, 0),
(3, 'tacuarembo', 30, 127.00, 15, 0);

-- Producto 4: Fideos Don Vicente
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal) VALUES
(4, 'maldonado', 600, 40.00, 60, 1),
(4, 'pando', 25, 42.00, 10, 0),
(4, 'rivera', 20, 41.50, 10, 0),
(4, 'melo', 22, 43.00, 10, 0),
(4, 'paysandu', 28, 42.50, 10, 0),
(4, 'salto', 30, 41.80, 10, 0),
(4, 'tacuarembo', 18, 44.00, 10, 0);

-- Producto 5: Sal Celusal
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal) VALUES
(5, 'maldonado', 300, 15.00, 30, 1),
(5, 'pando', 15, 16.00, 5, 0),
(5, 'rivera', 12, 15.50, 5, 0),
(5, 'melo', 18, 16.50, 5, 0),
(5, 'paysandu', 14, 16.00, 5, 0),
(5, 'salto', 20, 15.80, 5, 0),
(5, 'tacuarembo', 10, 17.00, 5, 0);

-- ============================================
-- VERIFICACIÓN DE TABLAS CREADAS
-- ============================================
-- Para verificar que las tablas se crearon correctamente:
-- SHOW TABLES LIKE 'productos%';
-- DESCRIBE productos;
-- DESCRIBE productos_sucursal;

