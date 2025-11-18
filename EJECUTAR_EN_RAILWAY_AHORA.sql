-- ⚠️⚠️⚠️ EJECUTAR ESTE SQL EN RAILWAY AHORA ⚠️⚠️⚠️
-- Copia y pega TODO este archivo en Railway MySQL

-- PASO 1: Verificar si la columna ya existe
SELECT 'PASO 1: Verificando si stock_minimo existe...' AS paso;

SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  COLUMN_DEFAULT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'productos_sucursal' 
  AND COLUMN_NAME = 'stock_minimo';

-- Si el resultado está VACÍO, continuar con PASO 2
-- Si muestra una fila, la columna YA EXISTE, salta al PASO 5

-- ====================================================================
-- PASO 2: Agregar columna stock_minimo
-- ====================================================================
SELECT 'PASO 2: Agregando columna stock_minimo...' AS paso;

ALTER TABLE productos_sucursal 
ADD COLUMN stock_minimo INT DEFAULT 0 
COMMENT 'Stock minimo para alertas (0 = sin alerta)';

-- ====================================================================
-- PASO 3: Crear índice
-- ====================================================================
SELECT 'PASO 3: Creando indice...' AS paso;

CREATE INDEX idx_stock_minimo 
ON productos_sucursal(stock_minimo, stock);

-- ====================================================================
-- PASO 4: Verificar que se aplicó correctamente
-- ====================================================================
SELECT 'PASO 4: Verificacion final...' AS paso;

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

-- ====================================================================
-- PASO 5: Configurar UNA alerta de prueba
-- ====================================================================
SELECT 'PASO 5: Configurando alerta de prueba...' AS paso;

-- Esto configura stock_minimo = 10 en el primer producto de Maldonado
UPDATE productos_sucursal 
SET stock_minimo = 10 
WHERE sucursal = 'maldonado' 
LIMIT 1;

-- ====================================================================
-- PASO 6: Verificar que hay alertas
-- ====================================================================
SELECT 'PASO 6: Verificando alertas generadas...' AS paso;

SELECT 
  p.nombre AS producto,
  ps.sucursal,
  ps.stock AS stock_actual,
  ps.stock_minimo AS stock_minimo_configurado,
  CASE 
    WHEN ps.stock = 0 THEN '🔴 SIN STOCK'
    WHEN ps.stock_minimo > 0 AND ps.stock < ps.stock_minimo THEN '🟠 STOCK BAJO'
    ELSE '🟢 OK'
  END AS estado
FROM productos_sucursal ps
INNER JOIN productos p ON ps.producto_id = p.id
WHERE ps.stock_minimo > 0
ORDER BY ps.stock ASC
LIMIT 10;

-- Si ves productos aquí, el botón debería aparecer en el frontend

SELECT '✅ LISTO! Refresca el navegador (CTRL + SHIFT + R)' AS resultado;

