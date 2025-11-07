-- ============================================
-- INSERCIÓN COMPLETA DE PRODUCTOS HUAWEI
-- Lista de precios Maldonado 21/10/25
-- ============================================

USE zarparDataBase;

-- ============================================
-- LIMPIAR PRODUCTOS HUAWEI ANTERIORES
-- ============================================
DELETE ps FROM productos_sucursal ps
INNER JOIN productos p ON ps.producto_id = p.id
WHERE p.marca = 'Huawei' AND p.id > 12;

DELETE FROM productos WHERE marca = 'Huawei' AND id > 12;

-- ============================================
-- PRODUCTOS HUAWEI - DISPLAYS (PAN)
-- ============================================

-- Grupo 1: Honor X Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES 
('Honor X6/X6S/X8 5G/X8A 5G/PLAY 6C/Honor 70 Lite 5G', 'Huawei', 'Display', 'Original', 1),
('Honor X6/X6s/Honor 70 Lite 5G Con Marco', 'Huawei', 'Display', 'Original', 1),
('Honor X6A / X5 PLUS/X5B/X6a PLUS', 'Huawei', 'Display', 'Original', 1),
('Honor X6A Con Marco', 'Huawei', 'Display', 'Original', 1),
('Honor X6B 4g', 'Huawei', 'Display', 'Original', 1),
('Honor X7A', 'Huawei', 'Display', 'Original', 1),
('Honor X7B', 'Huawei', 'Display', 'Original', 1),
('Honor X8A', 'Huawei', 'Display', 'Original', 1),
('Honor X8B', 'Huawei', 'Display', 'Original', 1),
('Honor X9A / X9B 5G', 'Huawei', 'Display', 'Original', 1);

-- Grupo 2: Honor Series adicionales
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES 
('Honor 8X', 'Huawei', 'Display', 'Original', 1),
('Honor 9X', 'Huawei', 'Display', 'Original', 1),
('Honor 10 Lite', 'Huawei', 'Display', 'Original', 1),
('Honor 20 Lite', 'Huawei', 'Display', 'Original', 1),
('Honor 50', 'Huawei', 'Display', 'Original', 1),
('Honor 70', 'Huawei', 'Display', 'Original', 1),
('Honor 90', 'Huawei', 'Display', 'Original', 1),
('Honor Magic 4', 'Huawei', 'Display', 'Original', 1),
('Honor Magic 5', 'Huawei', 'Display', 'Original', 1),
('Honor Magic 6', 'Huawei', 'Display', 'Original', 1);

-- Grupo 3: P Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES 
('P20', 'Huawei', 'Display', 'Original', 1),
('P20 Lite', 'Huawei', 'Display', 'Original', 1),
('P20 Pro', 'Huawei', 'Display', 'Original', 1),
('P30', 'Huawei', 'Display', 'Original', 1),
('P30 Lite', 'Huawei', 'Display', 'Original', 1),
('P30 Pro', 'Huawei', 'Display', 'Original', 1),
('P40', 'Huawei', 'Display', 'Original', 1),
('P40 Lite', 'Huawei', 'Display', 'Original', 1),
('P40 Pro', 'Huawei', 'Display', 'Original', 1),
('P Smart 2019', 'Huawei', 'Display', 'Original', 1);

-- Grupo 4: Y Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES 
('Y5 2019', 'Huawei', 'Display', 'OEM', 1),
('Y6 2019', 'Huawei', 'Display', 'OEM', 1),
('Y7 2019', 'Huawei', 'Display', 'OEM', 1),
('Y9 2019', 'Huawei', 'Display', 'OEM', 1),
('Y6P', 'Huawei', 'Display', 'OEM', 1),
('Y7P', 'Huawei', 'Display', 'OEM', 1),
('Y9A', 'Huawei', 'Display', 'OEM', 1),
('Y9 Prime 2019', 'Huawei', 'Display', 'OEM', 1);

-- Grupo 5: Mate Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES 
('Mate 10', 'Huawei', 'Display', 'Original', 1),
('Mate 10 Lite', 'Huawei', 'Display', 'Original', 1),
('Mate 20', 'Huawei', 'Display', 'Original', 1),
('Mate 20 Lite', 'Huawei', 'Display', 'Original', 1),
('Mate 20 Pro', 'Huawei', 'Display', 'Original', 1),
('Mate 30', 'Huawei', 'Display', 'Original', 1),
('Mate 30 Pro', 'Huawei', 'Display', 'Original', 1);

-- ============================================
-- BATERÍAS (BAT)
-- ============================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES 
('Batería Honor X6/X6S', 'Huawei', 'Batería', 'Original', 1),
('Batería Honor X7A', 'Huawei', 'Batería', 'Original', 1),
('Batería Honor X8A', 'Huawei', 'Batería', 'Original', 1),
('Batería Honor X9A', 'Huawei', 'Batería', 'Original', 1),
('Batería P20 Lite', 'Huawei', 'Batería', 'Original', 1),
('Batería P30 Lite', 'Huawei', 'Batería', 'Original', 1),
('Batería P40 Lite', 'Huawei', 'Batería', 'Original', 1),
('Batería Y6 2019', 'Huawei', 'Batería', 'Original', 1),
('Batería Y7 2019', 'Huawei', 'Batería', 'Original', 1),
('Batería Y9 2019', 'Huawei', 'Batería', 'Original', 1);

-- ============================================
-- PLACAS DE CARGA (PC)
-- ============================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES 
('Placa Carga Honor X6', 'Huawei', 'Placa Carga', 'OEM', 1),
('Placa Carga Honor X7A', 'Huawei', 'Placa Carga', 'OEM', 1),
('Placa Carga Honor X8A', 'Huawei', 'Placa Carga', 'OEM', 1),
('Placa Carga P20 Lite', 'Huawei', 'Placa Carga', 'OEM', 1),
('Placa Carga P30 Lite', 'Huawei', 'Placa Carga', 'OEM', 1),
('Placa Carga Y6 2019', 'Huawei', 'Placa Carga', 'OEM', 1),
('Placa Carga Y7 2019', 'Huawei', 'Placa Carga', 'OEM', 1);

-- ============================================
-- FLEX (FLEX)
-- ============================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES 
('Flex Power Honor X6', 'Huawei', 'Flex', 'OEM', 1),
('Flex Volume Honor X6', 'Huawei', 'Flex', 'OEM', 1),
('Flex Power P20 Lite', 'Huawei', 'Flex', 'OEM', 1),
('Flex Power P30 Lite', 'Huawei', 'Flex', 'OEM', 1);

-- ============================================
-- ASIGNAR PRECIOS A TODAS LAS SUCURSALES
-- ============================================

-- Obtener los IDs de los productos recién insertados
SET @base_id = (SELECT MIN(id) FROM productos WHERE marca = 'Huawei' AND id > 12);

-- Crear tabla temporal con precios
CREATE TEMPORARY TABLE temp_precios (
    row_num INT AUTO_INCREMENT PRIMARY KEY,
    precio DECIMAL(10,2)
);

-- Insertar precios según el orden de inserción
INSERT INTO temp_precios (precio) VALUES 
-- Grupo 1: Honor X Series (700-1800)
(700), (900), (700), (900), (1000), (1000), (1150), (1100), (1250), (1800),
-- Grupo 2: Honor adicionales (1200-2000)
(1200), (1300), (1100), (1200), (1500), (1600), (1800), (2000), (2100), (2200),
-- Grupo 3: P Series (1500-2500)
(1500), (1400), (1600), (1800), (1600), (2000), (2200), (2000), (2500), (1300),
-- Grupo 4: Y Series (800-1200)
(800), (900), (1000), (1100), (900), (1000), (1200), (1100),
-- Grupo 5: Mate Series (2000-3000)
(2000), (1800), (2200), (2000), (2500), (2800), (3000),
-- Baterías (300-500)
(350), (380), (400), (450), (350), (380), (400), (300), (320), (350),
-- Placas de Carga (200-350)
(250), (280), (300), (250), (280), (220), (240),
-- Flex (150-250)
(180), (180), (200), (220);

-- Insertar en productos_sucursal usando JOIN con la tabla temporal
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal, activo, stock_en_transito)
SELECT 
    p.id,
    cs.sucursal,
    0,
    tp.precio,
    5,
    0,
    1,
    0
FROM productos p
CROSS JOIN configuracion_sucursales cs
LEFT JOIN temp_precios tp ON (p.id - @base_id + 1) = tp.row_num
WHERE p.marca = 'Huawei' 
AND p.id >= @base_id
ORDER BY p.id, cs.sucursal;

-- Limpiar tabla temporal
DROP TEMPORARY TABLE temp_precios;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 
    'RESUMEN GENERAL' as tipo,
    COUNT(DISTINCT p.id) as total_productos,
    COUNT(ps.id) as total_registros_sucursales,
    MIN(ps.precio) as precio_minimo,
    MAX(ps.precio) as precio_maximo
FROM productos p
LEFT JOIN productos_sucursal ps ON p.id = ps.producto_id
WHERE p.marca = 'Huawei' AND p.id > 12;

SELECT 
    p.tipo as 'Tipo de Producto',
    COUNT(DISTINCT p.id) as 'Cantidad'
FROM productos p
WHERE p.marca = 'Huawei' AND p.id > 12
GROUP BY p.tipo;

-- Mostrar primeros 10 productos
SELECT 
    p.id,
    p.nombre,
    p.tipo,
    p.calidad,
    COUNT(ps.id) as sucursales,
    MIN(ps.precio) as precio
FROM productos p
LEFT JOIN productos_sucursal ps ON p.id = ps.producto_id
WHERE p.marca = 'Huawei' AND p.id > 12
GROUP BY p.id, p.nombre, p.tipo, p.calidad
ORDER BY p.id
LIMIT 10;

SELECT 'TOTAL DE PRODUCTOS HUAWEI INSERTADOS:' as mensaje, COUNT(*) as total
FROM productos 
WHERE marca = 'Huawei' AND id > 12;




