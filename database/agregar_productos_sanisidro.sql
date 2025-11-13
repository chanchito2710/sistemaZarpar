-- =====================================================
-- 📦 AGREGAR TODOS LOS PRODUCTOS A SANISIDRO
-- =====================================================
-- Copia todos los productos de Pando a San Isidro
-- con los mismos precios y stock inicial de 100
-- =====================================================

USE zarparDataBase;

-- Insertar todos los productos copiando de Pando
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, activo)
SELECT 
    producto_id,
    'sanisidro' as sucursal,
    100 as stock,
    precio,
    stock_minimo,
    activo
FROM productos_sucursal
WHERE sucursal = 'pando';

-- Verificar que se insertaron correctamente
SELECT 
    sucursal,
    COUNT(*) as total_productos,
    SUM(stock) as stock_total,
    AVG(precio) as precio_promedio
FROM productos_sucursal
WHERE sucursal = 'sanisidro'
GROUP BY sucursal;








