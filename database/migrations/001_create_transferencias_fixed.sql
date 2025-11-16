-- =====================================================
-- MIGRACIÓN: Sistema de Transferencias de Inventario
-- Fecha: 2025-10-31
-- Versión: 1.0 (Corregida)
-- =====================================================

USE zarparDataBase;

-- =====================================================
-- 1. TABLA: transferencias
-- =====================================================

CREATE TABLE IF NOT EXISTS transferencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Información básica
  codigo VARCHAR(50) UNIQUE NOT NULL COMMENT 'Código único: TRANS-YYYY-NNN',
  fecha_envio DATETIME NOT NULL COMMENT 'Cuándo se envió desde Casa Central',
  fecha_recepcion DATETIME NULL COMMENT 'Cuándo se confirmó en sucursal',
  
  -- Origen y destino
  sucursal_origen VARCHAR(50) NOT NULL COMMENT 'Siempre "maldonado" (Casa Central)',
  sucursal_destino VARCHAR(50) NOT NULL COMMENT 'Sucursal que recibe',
  
  -- Estado del proceso
  estado ENUM(
    'pendiente',      -- Creada pero no enviada
    'en_transito',    -- Enviada, esperando confirmación
    'recibida',       -- Recibida pero no confirmada aún
    'completada',     -- Confirmada y stock actualizado
    'cancelada'       -- Cancelada
  ) DEFAULT 'pendiente' COMMENT 'Estado actual de la transferencia',
  
  -- Responsables
  usuario_envio VARCHAR(100) NOT NULL COMMENT 'Email del usuario que envió',
  usuario_recepcion VARCHAR(100) NULL COMMENT 'Email del usuario que recibió',
  
  -- Totales
  total_productos INT NOT NULL COMMENT 'Cantidad de productos únicos',
  total_unidades INT NOT NULL COMMENT 'Cantidad total de unidades',
  
  -- Notas y observaciones
  notas_envio TEXT NULL COMMENT 'Notas al momento del envío',
  notas_recepcion TEXT NULL COMMENT 'Notas al momento de recibir',
  diferencias TEXT NULL COMMENT 'Descripción de faltantes/sobrantes',
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices para optimización
  INDEX idx_codigo (codigo),
  INDEX idx_estado (estado),
  INDEX idx_sucursal_destino (sucursal_destino),
  INDEX idx_fecha_envio (fecha_envio),
  INDEX idx_estado_sucursal (estado, sucursal_destino)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro principal de transferencias entre sucursales';

-- =====================================================
-- 2. TABLA: transferencias_detalle
-- =====================================================

CREATE TABLE IF NOT EXISTS transferencias_detalle (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Relación con transferencia
  transferencia_id INT NOT NULL COMMENT 'FK a transferencias',
  
  -- Producto
  producto_id INT NOT NULL COMMENT 'FK a productos',
  producto_nombre VARCHAR(200) NOT NULL COMMENT 'Nombre del producto (snapshot)',
  producto_marca VARCHAR(100) NOT NULL COMMENT 'Marca del producto (snapshot)',
  producto_tipo VARCHAR(100) NOT NULL COMMENT 'Tipo del producto (snapshot)',
  
  -- Cantidades
  cantidad_enviada INT NOT NULL COMMENT 'Cantidad que se envió',
  cantidad_recibida INT NULL COMMENT 'Cantidad que se recibió (puede diferir)',
  cantidad_faltante INT DEFAULT 0 COMMENT 'Faltantes detectados',
  cantidad_sobrante INT DEFAULT 0 COMMENT 'Sobrantes detectados',
  
  -- Stock al momento de la transferencia (para auditoría)
  stock_origen_antes INT NOT NULL COMMENT 'Stock en Maldonado antes de enviar',
  stock_origen_despues INT NOT NULL COMMENT 'Stock en Maldonado después de enviar',
  stock_destino_antes INT NOT NULL COMMENT 'Stock en destino antes de recibir',
  stock_destino_despues INT NULL COMMENT 'Stock en destino después de recibir',
  
  -- Motivo de la transferencia (basado en ventas)
  ventas_periodo INT DEFAULT 0 COMMENT 'Ventas que motivaron el envío',
  fecha_inicio_ventas DATE NULL COMMENT 'Inicio del período analizado',
  fecha_fin_ventas DATE NULL COMMENT 'Fin del período analizado',
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relaciones (Foreign Keys)
  FOREIGN KEY (transferencia_id) REFERENCES transferencias(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
  
  -- Índices
  INDEX idx_transferencia (transferencia_id),
  INDEX idx_producto (producto_id),
  INDEX idx_transferencia_producto (transferencia_id, producto_id)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Detalle de productos por transferencia';

-- =====================================================
-- 3. MODIFICAR: productos_sucursal (agregar campo)
-- =====================================================

-- Verificar si la columna ya existe antes de agregarla
SET @column_exists = (
  SELECT COUNT(*) 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = 'zarparDataBase' 
    AND TABLE_NAME = 'productos_sucursal' 
    AND COLUMN_NAME = 'stock_en_transito'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE productos_sucursal ADD COLUMN stock_en_transito INT DEFAULT 0 COMMENT "Stock enviado pero no confirmado" AFTER stock',
  'SELECT "La columna stock_en_transito ya existe" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 4. SECUENCIA para códigos de transferencia
-- =====================================================

-- Crear tabla para manejar secuencias (si no existe)
CREATE TABLE IF NOT EXISTS secuencias (
  nombre VARCHAR(50) PRIMARY KEY,
  valor INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar secuencia inicial para transferencias
INSERT INTO secuencias (nombre, valor) 
VALUES ('transferencias', 0)
ON DUPLICATE KEY UPDATE valor = valor;

-- =====================================================
-- 5. FUNCIÓN: Generar código de transferencia
-- =====================================================

DELIMITER $$

DROP FUNCTION IF EXISTS generar_codigo_transferencia$$

CREATE FUNCTION generar_codigo_transferencia()
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
  DECLARE nuevo_numero INT;
  DECLARE codigo VARCHAR(50);
  DECLARE anio VARCHAR(4);
  
  -- Obtener año actual
  SET anio = YEAR(NOW());
  
  -- Incrementar secuencia
  UPDATE secuencias 
  SET valor = valor + 1 
  WHERE nombre = 'transferencias';
  
  -- Obtener nuevo valor
  SELECT valor INTO nuevo_numero 
  FROM secuencias 
  WHERE nombre = 'transferencias';
  
  -- Generar código: TRANS-2025-001
  SET codigo = CONCAT('TRANS-', anio, '-', LPAD(nuevo_numero, 3, '0'));
  
  RETURN codigo;
END$$

DELIMITER ;

-- =====================================================
-- 6. VERIFICACIÓN
-- =====================================================

-- Mostrar tablas creadas
SELECT 
  'transferencias' as tabla,
  COUNT(*) as registros
FROM transferencias
UNION ALL
SELECT 
  'transferencias_detalle' as tabla,
  COUNT(*) as registros
FROM transferencias_detalle;

-- Verificar columna agregada
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  COLUMN_COMMENT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'zarparDataBase'
  AND TABLE_NAME = 'productos_sucursal'
  AND COLUMN_NAME = 'stock_en_transito';

-- Verificar función creada
SELECT 
  ROUTINE_NAME,
  ROUTINE_TYPE,
  RETURN_TYPE
FROM information_schema.ROUTINES
WHERE ROUTINE_SCHEMA = 'zarparDataBase'
  AND ROUTINE_NAME = 'generar_codigo_transferencia';

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================

SELECT '✅ Migración completada exitosamente' as mensaje;

















