-- =====================================================
-- SCRIPT: Asignar Productos a Nuevas Sucursales
-- =====================================================
-- Uso: Copia los productos de "maldonado" (stock principal) 
--      a sucursales nuevas que tengan menos productos
-- =====================================================

-- 1. Ver estado actual
SELECT 
  sucursal, 
  COUNT(*) as total_productos 
FROM productos_sucursal 
GROUP BY sucursal 
ORDER BY total_productos, sucursal;

-- =====================================================
-- 2. Copiar productos de MALDONADO a RIO NEGRO
-- =====================================================

INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo)
SELECT 
  producto_id, 
  'rionegro' as sucursal,
  0 as stock,                    -- Stock inicial en 0
  precio,                        -- Mismo precio que Maldonado
  10 as stock_minimo             -- Stock mínimo por defecto
FROM productos_sucursal
WHERE sucursal = 'maldonado'
AND producto_id NOT IN (
  -- No duplicar productos ya existentes
  SELECT producto_id 
  FROM productos_sucursal 
  WHERE sucursal = 'rionegro'
);

-- =====================================================
-- 3. Copiar productos de MALDONADO a SORIANO
-- =====================================================

INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo)
SELECT 
  producto_id, 
  'soriano' as sucursal,
  0 as stock,                    -- Stock inicial en 0
  precio,                        -- Mismo precio que Maldonado
  10 as stock_minimo             -- Stock mínimo por defecto
FROM productos_sucursal
WHERE sucursal = 'maldonado'
AND producto_id NOT IN (
  -- No duplicar productos ya existentes
  SELECT producto_id 
  FROM productos_sucursal 
  WHERE sucursal = 'soriano'
);

-- =====================================================
-- 4. Verificar resultado
-- =====================================================

SELECT 
  sucursal, 
  COUNT(*) as total_productos 
FROM productos_sucursal 
GROUP BY sucursal 
ORDER BY sucursal;

-- =====================================================
-- RESULTADO ESPERADO:
-- Todas las sucursales deberían tener 4 productos
-- =====================================================

-- =====================================================
-- OPCIONAL: Ver detalle de productos por sucursal
-- =====================================================

SELECT 
  p.nombre as producto,
  ps.sucursal,
  ps.stock,
  ps.precio,
  ps.stock_minimo
FROM productos p
JOIN productos_sucursal ps ON p.id = ps.producto_id
ORDER BY p.nombre, ps.sucursal;

-- =====================================================
-- NOTAS:
-- - Este script copia SOLO la estructura (productos disponibles)
-- - El stock inicial es 0 (debes ajustarlo manualmente desde /products)
-- - Los precios se copian de Maldonado (puedes modificarlos después)
-- - Stock mínimo se establece en 10 por defecto
-- - NO copia precio_costo (no existe en productos_sucursal)
-- =====================================================

