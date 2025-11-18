-- Migración: Agregar columna stock_minimo a productos_sucursal
-- Fecha: 2025-11-18
-- Descripción: Agrega la columna stock_minimo para el sistema de alertas de stock

-- Verificar si la columna ya existe antes de agregarla
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'productos_sucursal' 
  AND COLUMN_NAME = 'stock_minimo';

-- Agregar columna solo si no existe
SET @query = IF(
  @col_exists = 0,
  'ALTER TABLE productos_sucursal ADD COLUMN stock_minimo INT DEFAULT 0 COMMENT "Stock mínimo para alertas (0 = sin alerta)"',
  'SELECT "Columna stock_minimo ya existe" AS resultado'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Crear índice para mejorar performance de consultas de alertas (si no existe)
SET @idx_exists = 0;
SELECT COUNT(*) INTO @idx_exists 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'productos_sucursal' 
  AND INDEX_NAME = 'idx_stock_minimo';

SET @query_idx = IF(
  @idx_exists = 0,
  'CREATE INDEX idx_stock_minimo ON productos_sucursal(stock_minimo, stock)',
  'SELECT "Índice idx_stock_minimo ya existe" AS resultado'
);

PREPARE stmt_idx FROM @query_idx;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;

-- Verificación
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'productos_sucursal' 
  AND COLUMN_NAME = 'stock_minimo';

