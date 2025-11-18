-- ⚠️ EJECUTAR ESTE SCRIPT EN RAILWAY SI LAS ALERTAS DE STOCK NO APARECEN
-- Fecha: 2025-11-18
-- Propósito: Agregar columna stock_minimo a productos_sucursal manualmente

-- 1. Verificar si la columna ya existe
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  COLUMN_DEFAULT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'productos_sucursal' 
  AND COLUMN_NAME = 'stock_minimo';

-- Si el resultado está vacío, ejecutar lo siguiente:

-- 2. Agregar columna stock_minimo
ALTER TABLE productos_sucursal 
ADD COLUMN stock_minimo INT DEFAULT 0 
COMMENT 'Stock mínimo para alertas (0 = sin alerta)';

-- 3. Crear índice para mejorar performance
CREATE INDEX idx_stock_minimo 
ON productos_sucursal(stock_minimo, stock);

-- 4. Verificar que se aplicó correctamente
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'productos_sucursal' 
  AND COLUMN_NAME = 'stock_minimo';

-- Resultado esperado:
-- COLUMN_NAME: stock_minimo
-- COLUMN_TYPE: int
-- COLUMN_DEFAULT: 0
-- COLUMN_COMMENT: Stock mínimo para alertas (0 = sin alerta)

-- 5. (OPCIONAL) Ver algunos registros de prueba
SELECT 
  producto_id,
  sucursal,
  stock,
  stock_minimo,
  CASE 
    WHEN stock_minimo > 0 AND stock < stock_minimo THEN 'ALERTA'
    WHEN stock = 0 THEN 'SIN STOCK'
    ELSE 'OK'
  END AS estado
FROM productos_sucursal
LIMIT 10;

-- ✅ Una vez ejecutado correctamente, las alertas de stock deberían aparecer en el frontend

