-- =====================================================
-- 🔧 CORREGIR NOMBRES DE SUCURSALES
-- =====================================================
-- Normalizar nombres de sucursales para que coincidan
-- con las tablas de clientes (sin espacios)
-- =====================================================

USE zarparDataBase;

-- Actualizar "rio negro" a "rionegro"
UPDATE productos_sucursal 
SET sucursal = 'rionegro' 
WHERE sucursal = 'rio negro';

-- Verificar si existe "san isidro" y cambiarlo a "sanisidro"
UPDATE productos_sucursal 
SET sucursal = 'sanisidro' 
WHERE sucursal = 'san isidro';

-- Si "sanisidro" no tiene productos, agregarlos
-- Primero verificamos cuántos productos tiene sanisidro
SELECT 
    sucursal,
    COUNT(*) as total_productos
FROM productos_sucursal
WHERE sucursal IN ('rionegro', 'sanisidro', 'soriano')
GROUP BY sucursal
ORDER BY sucursal;

-- Si sanisidro tiene 0 productos, los agregamos
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio)
SELECT 
    id as producto_id,
    'sanisidro' as sucursal,
    100 as stock,
    (SELECT precio FROM productos_sucursal WHERE producto_id = id LIMIT 1) as precio
FROM productos
WHERE id NOT IN (
    SELECT producto_id 
    FROM productos_sucursal 
    WHERE sucursal = 'sanisidro'
)
AND activo = 1;

-- Mostrar resumen final
SELECT 
    sucursal,
    COUNT(*) as total_productos,
    SUM(stock) as stock_total
FROM productos_sucursal
WHERE sucursal IN ('rionegro', 'sanisidro', 'soriano', 'pando', 'maldonado')
GROUP BY sucursal
ORDER BY sucursal;




