-- =====================================================
-- 📦 ACTUALIZAR STOCK A 100 UNIDADES
-- =====================================================
-- Establece 100 unidades de stock para TODOS los productos
-- en TODAS las sucursales
-- =====================================================

USE zarparDataBase;

-- Actualizar stock a 100 para todos los productos en todas las sucursales
UPDATE productos_sucursal 
SET stock = 100
WHERE activo = 1;

-- Verificar actualización
SELECT 
    COUNT(*) as total_registros_actualizados,
    SUM(stock) as stock_total
FROM productos_sucursal 
WHERE activo = 1;

-- Mostrar resumen por sucursal
SELECT 
    sucursal,
    COUNT(*) as productos,
    SUM(stock) as stock_total,
    AVG(stock) as promedio_stock
FROM productos_sucursal
WHERE activo = 1
GROUP BY sucursal
ORDER BY sucursal;




