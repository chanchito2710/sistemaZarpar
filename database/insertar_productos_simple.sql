-- ============================================
-- INSERCIÓN SIMPLE DE PRODUCTOS
-- Lista de precios Maldonado 21/10/25
-- ============================================

USE zarparDataBase;

-- ============================================
-- INSERTAR PRODUCTOS HUAWEI DISPLAY
-- ============================================

-- Producto 1
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X6/X6S/X8 5G/X8A 5G/PLAY 6C/Honor 70 Lite 5G', 'Huawei', 'Display', 'Original', 1);
SET @p1 = LAST_INSERT_ID();

-- Producto 2
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X6/X6s/Honor 70 Lite 5G Con Marco', 'Huawei', 'Display', 'Original', 1);
SET @p2 = LAST_INSERT_ID();

-- Producto 3
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X6A / X5 PLUS/X5B/X6a PLUS', 'Huawei', 'Display', 'Original', 1);
SET @p3 = LAST_INSERT_ID();

-- Producto 4
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X6A Con Marco', 'Huawei', 'Display', 'Original', 1);
SET @p4 = LAST_INSERT_ID();

-- Producto 5
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X6B 4g', 'Huawei', 'Display', 'Original', 1);
SET @p5 = LAST_INSERT_ID();

-- Producto 6
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X7A', 'Huawei', 'Display', 'Original', 1);
SET @p6 = LAST_INSERT_ID();

-- Producto 7
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X7B', 'Huawei', 'Display', 'Original', 1);
SET @p7 = LAST_INSERT_ID();

-- Producto 8
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X8A', 'Huawei', 'Display', 'Original', 1);
SET @p8 = LAST_INSERT_ID();

-- Producto 9
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X8B', 'Huawei', 'Display', 'Original', 1);
SET @p9 = LAST_INSERT_ID();

-- Producto 10
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X9A / X9B 5G', 'Huawei', 'Display', 'Original', 1);
SET @p10 = LAST_INSERT_ID();

-- ============================================
-- ASIGNAR A TODAS LAS SUCURSALES
-- ============================================

-- Producto 1: $700 en todas las sucursales
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal, activo, stock_en_transito)
SELECT @p1, sucursal, 0, 700.00, 5, 0, 1, 0
FROM configuracion_sucursales;

-- Producto 2: $900
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal, activo, stock_en_transito)
SELECT @p2, sucursal, 0, 900.00, 5, 0, 1, 0
FROM configuracion_sucursales;

-- Producto 3: $700
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal, activo, stock_en_transito)
SELECT @p3, sucursal, 0, 700.00, 5, 0, 1, 0
FROM configuracion_sucursales;

-- Producto 4: $900
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal, activo, stock_en_transito)
SELECT @p4, sucursal, 0, 900.00, 5, 0, 1, 0
FROM configuracion_sucursales;

-- Producto 5: $1,000
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal, activo, stock_en_transito)
SELECT @p5, sucursal, 0, 1000.00, 5, 0, 1, 0
FROM configuracion_sucursales;

-- Producto 6: $1,000
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal, activo, stock_en_transito)
SELECT @p6, sucursal, 0, 1000.00, 5, 0, 1, 0
FROM configuracion_sucursales;

-- Producto 7: $1,150
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal, activo, stock_en_transito)
SELECT @p7, sucursal, 0, 1150.00, 5, 0, 1, 0
FROM configuracion_sucursales;

-- Producto 8: $1,100
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal, activo, stock_en_transito)
SELECT @p8, sucursal, 0, 1100.00, 5, 0, 1, 0
FROM configuracion_sucursales;

-- Producto 9: $1,250
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal, activo, stock_en_transito)
SELECT @p9, sucursal, 0, 1250.00, 5, 0, 1, 0
FROM configuracion_sucursales;

-- Producto 10: $1,800
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal, activo, stock_en_transito)
SELECT @p10, sucursal, 0, 1800.00, 5, 0, 1, 0
FROM configuracion_sucursales;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 
    p.id,
    p.nombre,
    p.marca,
    p.tipo,
    p.calidad,
    COUNT(ps.id) as sucursales_asignadas
FROM productos p
LEFT JOIN productos_sucursal ps ON p.id = ps.producto_id
WHERE p.id > 12
GROUP BY p.id, p.nombre, p.marca, p.tipo, p.calidad
ORDER BY p.id;




