-- 🔧 SCRIPT PARA AGREGAR PRODUCTOS EXISTENTES A TODAS LAS SUCURSALES
-- Fecha: 29/10/2025
-- Propósito: Los productos 2, 6, 7, 8, 9, 10 no tienen registros en productos_sucursal

-- Producto 2: Azúcar
INSERT IGNORE INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal) VALUES
(2, 'maldonado', 0, 0, 10, 1),
(2, 'pando', 0, 0, 10, 0),
(2, 'rivera', 0, 0, 10, 0),
(2, 'melo', 0, 0, 10, 0),
(2, 'paysandu', 0, 0, 10, 0),
(2, 'salto', 0, 0, 10, 0),
(2, 'tacuarembo', 0, 0, 10, 0);

-- Producto 6: Café
INSERT IGNORE INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal) VALUES
(6, 'maldonado', 0, 0, 10, 1),
(6, 'pando', 0, 0, 10, 0),
(6, 'rivera', 0, 0, 10, 0),
(6, 'melo', 0, 0, 10, 0),
(6, 'paysandu', 0, 0, 10, 0),
(6, 'salto', 0, 0, 10, 0),
(6, 'tacuarembo', 0, 0, 10, 0);

-- Producto 7: iphone 11 jk (Inactivo, pero agregamos por si lo activan después)
INSERT IGNORE INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal) VALUES
(7, 'maldonado', 0, 0, 10, 1),
(7, 'pando', 0, 0, 10, 0),
(7, 'rivera', 0, 0, 10, 0),
(7, 'melo', 0, 0, 10, 0),
(7, 'paysandu', 0, 0, 10, 0),
(7, 'salto', 0, 0, 10, 0),
(7, 'tacuarembo', 0, 0, 10, 0);

-- Producto 8: Samsung S24 Ultra (Inactivo, pero agregamos por si lo activan después)
INSERT IGNORE INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal) VALUES
(8, 'maldonado', 0, 0, 10, 1),
(8, 'pando', 0, 0, 10, 0),
(8, 'rivera', 0, 0, 10, 0),
(8, 'melo', 0, 0, 10, 0),
(8, 'paysandu', 0, 0, 10, 0),
(8, 'salto', 0, 0, 10, 0),
(8, 'tacuarembo', 0, 0, 10, 0);

-- Producto 9: Test Producto (Inactivo, pero agregamos por si lo activan después)
INSERT IGNORE INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal) VALUES
(9, 'maldonado', 0, 0, 10, 1),
(9, 'pando', 0, 0, 10, 0),
(9, 'rivera', 0, 0, 10, 0),
(9, 'melo', 0, 0, 10, 0),
(9, 'paysandu', 0, 0, 10, 0),
(9, 'salto', 0, 0, 10, 0),
(9, 'tacuarembo', 0, 0, 10, 0);

-- Producto 10: iphone 11 jk
INSERT IGNORE INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal) VALUES
(10, 'maldonado', 0, 0, 10, 1),
(10, 'pando', 0, 0, 10, 0),
(10, 'rivera', 0, 0, 10, 0),
(10, 'melo', 0, 0, 10, 0),
(10, 'paysandu', 0, 0, 10, 0),
(10, 'salto', 0, 0, 10, 0),
(10, 'tacuarembo', 0, 0, 10, 0);

-- ✅ VERIFICACIÓN: Contar cuántos registros tiene cada producto ahora
SELECT 
  p.id,
  p.nombre,
  p.activo,
  COUNT(ps.id) as sucursales_asociadas
FROM productos p
LEFT JOIN productos_sucursal ps ON p.id = ps.producto_id
GROUP BY p.id, p.nombre, p.activo
ORDER BY p.id;

