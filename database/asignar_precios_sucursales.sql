-- =====================================================
-- 💰 ASIGNAR PRECIOS A TODAS LAS SUCURSALES
-- =====================================================
-- Asigna los 295 productos a las 9 sucursales
-- con precios específicos según modelo y calidad
-- =====================================================

USE zarparDataBase;

-- =====================================================
-- ESTRATEGIA DE PRECIOS POR MARCA Y TIPO
-- =====================================================
-- iPhone: Los más caros (Original $1200-7000, OEM $400-650)
-- Samsung S/Note: Premium ($800-5500)
-- Samsung A/J: Gama media-baja ($500-1600)
-- Huawei/Honor: Gama media ($500-3000)
-- Xiaomi: Económicos ($600-1700)
-- Motorola: Económicos-medios ($500-2000)
-- Baterías: $300-1200
-- Placas: $200-500
-- Flex/Botones/Antenas: $130-350
-- =====================================================

-- 🍎 iPhone 6/6S/7/8 - OEM ($600-750)
INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio)
SELECT id, 'pando', 0, 
  CASE 
    WHEN nombre LIKE '%6 Plus%' THEN 650.00
    WHEN nombre LIKE '%6S Plus%' THEN 750.00
    WHEN nombre LIKE '%6S%' THEN 700.00
    ELSE 600.00
  END
FROM productos 
WHERE marca = 'iPhone' AND tipo = 'Display' 
AND nombre IN ('iPhone 6', 'iPhone 6 Plus', 'iPhone 6S', 'iPhone 6S Plus');

INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio)
SELECT id, 'maldonado', 0, 
  CASE 
    WHEN nombre LIKE '%6 Plus%' THEN 650.00
    WHEN nombre LIKE '%6S Plus%' THEN 750.00
    WHEN nombre LIKE '%6S%' THEN 700.00
    ELSE 600.00
  END
FROM productos 
WHERE marca = 'iPhone' AND tipo = 'Display' 
AND nombre IN ('iPhone 6', 'iPhone 6 Plus', 'iPhone 6S', 'iPhone 6S Plus');

INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio)
SELECT id, 'rivera', 0, 
  CASE 
    WHEN nombre LIKE '%6 Plus%' THEN 650.00
    WHEN nombre LIKE '%6S Plus%' THEN 750.00
    WHEN nombre LIKE '%6S%' THEN 700.00
    ELSE 600.00
  END
FROM productos 
WHERE marca = 'iPhone' AND tipo = 'Display' 
AND nombre IN ('iPhone 6', 'iPhone 6 Plus', 'iPhone 6S', 'iPhone 6S Plus');

INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio)
SELECT id, 'melo', 0, 
  CASE 
    WHEN nombre LIKE '%6 Plus%' THEN 650.00
    WHEN nombre LIKE '%6S Plus%' THEN 750.00
    WHEN nombre LIKE '%6S%' THEN 700.00
    ELSE 600.00
  END
FROM productos 
WHERE marca = 'iPhone' AND tipo = 'Display' 
AND nombre IN ('iPhone 6', 'iPhone 6 Plus', 'iPhone 6S', 'iPhone 6S Plus');

INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio)
SELECT id, 'paysandu', 0, 
  CASE 
    WHEN nombre LIKE '%6 Plus%' THEN 650.00
    WHEN nombre LIKE '%6S Plus%' THEN 750.00
    WHEN nombre LIKE '%6S%' THEN 700.00
    ELSE 600.00
  END
FROM productos 
WHERE marca = 'iPhone' AND tipo = 'Display' 
AND nombre IN ('iPhone 6', 'iPhone 6 Plus', 'iPhone 6S', 'iPhone 6S Plus');

INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio)
SELECT id, 'salto', 0, 
  CASE 
    WHEN nombre LIKE '%6 Plus%' THEN 650.00
    WHEN nombre LIKE '%6S Plus%' THEN 750.00
    WHEN nombre LIKE '%6S%' THEN 700.00
    ELSE 600.00
  END
FROM productos 
WHERE marca = 'iPhone' AND tipo = 'Display' 
AND nombre IN ('iPhone 6', 'iPhone 6 Plus', 'iPhone 6S', 'iPhone 6S Plus');

INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio)
SELECT id, 'tacuarembo', 0, 
  CASE 
    WHEN nombre LIKE '%6 Plus%' THEN 650.00
    WHEN nombre LIKE '%6S Plus%' THEN 750.00
    WHEN nombre LIKE '%6S%' THEN 700.00
    ELSE 600.00
  END
FROM productos 
WHERE marca = 'iPhone' AND tipo = 'Display' 
AND nombre IN ('iPhone 6', 'iPhone 6 Plus', 'iPhone 6S', 'iPhone 6S Plus');

INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio)
SELECT id, 'rio negro', 0, 
  CASE 
    WHEN nombre LIKE '%6 Plus%' THEN 650.00
    WHEN nombre LIKE '%6S Plus%' THEN 750.00
    WHEN nombre LIKE '%6S%' THEN 700.00
    ELSE 600.00
  END
FROM productos 
WHERE marca = 'iPhone' AND tipo = 'Display' 
AND nombre IN ('iPhone 6', 'iPhone 6 Plus', 'iPhone 6S', 'iPhone 6S Plus');

INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio)
SELECT id, 'soriano', 0, 
  CASE 
    WHEN nombre LIKE '%6 Plus%' THEN 650.00
    WHEN nombre LIKE '%6S Plus%' THEN 750.00
    WHEN nombre LIKE '%6S%' THEN 700.00
    ELSE 600.00
  END
FROM productos 
WHERE marca = 'iPhone' AND tipo = 'Display' 
AND nombre IN ('iPhone 6', 'iPhone 6 Plus', 'iPhone 6S', 'iPhone 6S Plus');

-- =====================================================
-- 🚀 ASIGNACIÓN MASIVA OPTIMIZADA PARA TODOS LOS DEMÁS
-- =====================================================
-- En lugar de repetir 9 veces cada INSERT, uso un procedimiento
-- =====================================================

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS AsignarProductosASucursales()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE producto INT;
    DECLARE precio_producto DECIMAL(10,2);
    DECLARE cur CURSOR FOR 
        SELECT id,
            CASE
                -- iPhone Displays
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%15 Pro Max%' THEN 7000.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%15 Pro%' THEN 6500.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%15 Plus%' THEN 5800.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%15%' THEN 5500.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%14 Pro Max%' THEN 6000.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%14 Pro%' THEN 5500.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%14 Plus%' THEN 5000.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%14%' THEN 4800.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%13 Pro Max%' THEN 5200.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%13 Pro%' THEN 4800.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%13 Mini%' THEN 3800.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%13%' THEN 4200.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%12 Pro Max%' THEN 4500.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%12 Pro%' THEN 4000.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%12 Mini%' THEN 3200.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%12%' THEN 3500.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%11 Pro Max%' THEN 3800.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%11 Pro%' THEN 3500.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%11%' THEN 2800.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%XS Max%' THEN 3200.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%XS%' THEN 2800.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%XR%' THEN 2200.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%X%' THEN 2500.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%8 Plus%' THEN 1700.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%8%' THEN 1500.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%7 Plus%' THEN 1400.00
                WHEN marca = 'iPhone' AND tipo = 'Display' AND nombre LIKE '%7%' THEN 1200.00
                
                -- iPhone Baterías
                WHEN marca = 'iPhone' AND tipo = 'Batería' AND nombre LIKE '%14%' THEN 1200.00
                WHEN marca = 'iPhone' AND tipo = 'Batería' AND nombre LIKE '%13%' THEN 1100.00
                WHEN marca = 'iPhone' AND tipo = 'Batería' AND nombre LIKE '%12%' THEN 1000.00
                WHEN marca = 'iPhone' AND tipo = 'Batería' AND nombre LIKE '%11%' THEN 900.00
                WHEN marca = 'iPhone' AND tipo = 'Batería' AND nombre LIKE '%X%' THEN 800.00
                WHEN marca = 'iPhone' AND tipo = 'Batería' THEN 450.00
                
                -- iPhone Otros
                WHEN marca = 'iPhone' AND tipo = 'Placa Carga' THEN 400.00
                WHEN marca = 'iPhone' AND tipo = 'Flex' THEN 260.00
                WHEN marca = 'iPhone' AND tipo = 'Botón' THEN 310.00
                WHEN marca = 'iPhone' AND tipo = 'Antena' THEN 280.00
                
                -- Samsung Galaxy S Series
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S24 Ultra%' THEN 5500.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S24 Plus%' THEN 5000.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S24%' THEN 4500.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S23 Ultra%' THEN 4800.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S23 Plus%' THEN 4200.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S23%' THEN 3800.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S22 Ultra%' THEN 4000.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S22 Plus%' THEN 3500.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S22%' THEN 3200.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S21 Ultra%' THEN 3500.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S21 FE%' THEN 2500.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S21 Plus%' THEN 3000.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S21%' THEN 2800.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S20 Ultra%' THEN 3200.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S20 FE%' THEN 2200.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S20 Plus%' THEN 2800.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S20%' THEN 2500.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S10 Plus%' THEN 2300.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S10e%' THEN 1800.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S10%' THEN 2000.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S9 Plus%' THEN 1700.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S9%' THEN 1500.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S8 Plus%' THEN 1400.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S8%' THEN 1200.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S7%' THEN 900.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%S6%' THEN 800.00
                
                -- Samsung Galaxy A Series
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A72%' THEN 1500.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A71%' THEN 1400.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A70%' THEN 1300.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A54%' THEN 1600.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A53%' THEN 1500.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A52%' THEN 1400.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A51%' THEN 1300.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A50s%' THEN 1250.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A50%' THEN 1200.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A40%' THEN 900.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A34%' THEN 1050.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A33%' THEN 1000.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A32%' THEN 950.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A31%' THEN 900.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A30s%' THEN 850.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A30%' THEN 800.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A24%' THEN 950.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A23%' THEN 900.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A22%' THEN 850.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A21s%' THEN 800.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A20s%' THEN 750.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A20%' THEN 700.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A14%' THEN 850.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A13%' THEN 800.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A12%' THEN 750.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A11%' THEN 700.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A10s%' THEN 650.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%A10%' THEN 600.00
                
                -- Samsung Galaxy J Series
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%J8%' THEN 750.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%J7%' THEN 700.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%J6%' THEN 650.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%J5%' THEN 600.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%J4%' THEN 550.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%J2%' THEN 500.00
                
                -- Samsung Galaxy Note
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%Note 20 Ultra%' THEN 4000.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%Note 20%' THEN 3500.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%Note 10 Plus%' THEN 3200.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%Note 10%' THEN 2800.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%Note 9%' THEN 2200.00
                WHEN marca = 'Samsung' AND tipo = 'Display' AND nombre LIKE '%Note 8%' THEN 2000.00
                
                -- Samsung Baterías
                WHEN marca = 'Samsung' AND tipo = 'Batería' AND nombre LIKE '%S21%' THEN 750.00
                WHEN marca = 'Samsung' AND tipo = 'Batería' AND nombre LIKE '%S20%' THEN 700.00
                WHEN marca = 'Samsung' AND tipo = 'Batería' AND nombre LIKE '%S10%' THEN 600.00
                WHEN marca = 'Samsung' AND tipo = 'Batería' AND nombre LIKE '%Note 10%' THEN 800.00
                WHEN marca = 'Samsung' AND tipo = 'Batería' AND nombre LIKE '%A50%' THEN 450.00
                WHEN marca = 'Samsung' AND tipo = 'Batería' AND nombre LIKE '%A30%' THEN 400.00
                WHEN marca = 'Samsung' AND tipo = 'Batería' AND nombre LIKE '%A10%' THEN 350.00
                WHEN marca = 'Samsung' AND tipo = 'Batería' THEN 380.00
                
                -- Samsung Otros
                WHEN marca = 'Samsung' AND tipo = 'Placa Carga' THEN 280.00
                WHEN marca = 'Samsung' AND tipo = 'Flex' THEN 190.00
                WHEN marca = 'Samsung' AND tipo = 'Botón' THEN 140.00
                WHEN marca = 'Samsung' AND tipo = 'Antena' THEN 220.00
                
                -- Huawei P Series
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%P40 Pro%' THEN 2500.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%P40 Lite%' THEN 1500.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%P30 Pro%' THEN 2000.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%P30 Lite%' THEN 1200.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%P20 Pro%' THEN 1500.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%P20 Lite%' THEN 900.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%P Smart 2021%' THEN 850.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%P Smart 2020%' THEN 800.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%P Smart 2019%' THEN 750.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%P Smart%' THEN 700.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%P10 Lite%' THEN 700.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%P9 Lite%' THEN 650.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%P8 Lite%' THEN 600.00
                
                -- Huawei Mate Series
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%Mate 30 Pro%' THEN 3000.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%Mate 30 Lite%' THEN 1500.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%Mate 20 Pro%' THEN 2200.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%Mate 20 Lite%' THEN 1200.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%Mate 10 Lite%' THEN 900.00
                
                -- Huawei Y Series
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%Y9s%' THEN 900.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%Y9 Prime%' THEN 850.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%Y9 2019%' THEN 800.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%Y9 2018%' THEN 750.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%Y7 2019%' THEN 700.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%Y7 2018%' THEN 650.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%Y6 2019%' THEN 600.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%Y6 2018%' THEN 550.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%Y5 2019%' THEN 550.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%Y5 2018%' THEN 500.00
                
                -- Honor X Series
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%X9B%' THEN 1800.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%X9A%' THEN 1800.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%X9%' THEN 1500.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%X8 5G%' THEN 950.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%X8%' THEN 900.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%X7A%' THEN 800.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%X7%' THEN 800.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%X6S%' THEN 700.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%X6A%' THEN 700.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%X6%' THEN 700.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%X5%' THEN 650.00
                
                -- Honor Otros
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%View 20%' THEN 1500.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%20 Lite%' THEN 900.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%10 Lite%' THEN 750.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%9 Lite%' THEN 700.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%8X%' THEN 750.00
                WHEN marca = 'Huawei' AND tipo = 'Display' AND nombre LIKE '%8A%' THEN 600.00
                
                -- Huawei Baterías
                WHEN marca = 'Huawei' AND tipo = 'Batería' THEN 370.00
                
                -- Huawei Otros
                WHEN marca = 'Huawei' AND tipo = 'Placa Carga' THEN 270.00
                WHEN marca = 'Huawei' AND tipo = 'Flex' THEN 180.00
                WHEN marca = 'Huawei' AND tipo = 'Botón' THEN 150.00
                WHEN marca = 'Huawei' AND tipo = 'Antena' THEN 200.00
                
                -- Xiaomi Redmi Note Series
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 13 Pro%' THEN 1700.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 13%' THEN 1400.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 12 Pro%' THEN 1500.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 12%' THEN 1200.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 11S%' THEN 1050.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 11 Pro%' THEN 1300.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 11%' THEN 1000.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 10S%' THEN 950.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 10 Pro%' THEN 1200.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 10%' THEN 900.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 9S%' THEN 950.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 9 Pro%' THEN 1000.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 9%' THEN 800.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 8 Pro%' THEN 900.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 8%' THEN 750.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Note 7%' THEN 700.00
                
                -- Xiaomi Redmi Series
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Redmi 13C%' THEN 880.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Redmi 13%' THEN 900.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Redmi 12C%' THEN 820.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Redmi 12%' THEN 850.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Redmi 11%' THEN 800.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Redmi 10C%' THEN 750.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Redmi 10A%' THEN 700.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Redmi 10%' THEN 750.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Redmi 9C%' THEN 680.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Redmi 9A%' THEN 650.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Redmi 9%' THEN 700.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Redmi 8A%' THEN 600.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Redmi 8%' THEN 650.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Redmi 7A%' THEN 550.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Redmi 7%' THEN 600.00
                
                -- Xiaomi Mi & Poco Series
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Mi 11 Lite%' THEN 1400.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Mi 10 Lite%' THEN 1200.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Mi 9 Lite%' THEN 900.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Mi 8 Lite%' THEN 800.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Mi A3%' THEN 750.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Mi A2%' THEN 700.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Poco X5 Pro%' THEN 1500.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Poco X4 Pro%' THEN 1300.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Poco X3 Pro%' THEN 1100.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Poco X3%' THEN 900.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Poco F3%' THEN 1400.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Poco M5%' THEN 800.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Poco M4 Pro%' THEN 850.00
                WHEN marca = 'Xiaomi' AND tipo = 'Display' AND nombre LIKE '%Poco M3%' THEN 750.00
                
                -- Xiaomi Baterías
                WHEN marca = 'Xiaomi' AND tipo = 'Batería' THEN 380.00
                
                -- Xiaomi Otros
                WHEN marca = 'Xiaomi' AND tipo = 'Placa Carga' THEN 270.00
                WHEN marca = 'Xiaomi' AND tipo = 'Flex' THEN 170.00
                WHEN marca = 'Xiaomi' AND tipo = 'Botón' THEN 130.00
                WHEN marca = 'Xiaomi' AND tipo = 'Antena' THEN 190.00
                
                -- Motorola Moto G Series
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G84%' THEN 1300.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G82%' THEN 1150.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G73%' THEN 1200.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G72%' THEN 1100.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G71%' THEN 1000.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G60%' THEN 1200.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G50%' THEN 950.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G40%' THEN 900.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G30%' THEN 850.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G20%' THEN 800.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G10%' THEN 750.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G9 Power%' THEN 930.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G9 Plus%' THEN 950.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G9%' THEN 900.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G8 Power%' THEN 880.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G8 Plus%' THEN 900.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G8%' THEN 850.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G7 Power%' THEN 780.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G7 Plus%' THEN 850.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G7%' THEN 800.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G6 Plus%' THEN 750.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G6%' THEN 700.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G5 Plus%' THEN 650.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%G5%' THEN 600.00
                
                -- Motorola Moto E Series
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%E40%' THEN 800.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%E32%' THEN 750.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%E22%' THEN 700.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%E20%' THEN 650.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%E7 Power%' THEN 680.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%E7 Plus%' THEN 700.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%E7%' THEN 650.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%E6%' THEN 600.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%E5%' THEN 550.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%E4%' THEN 500.00
                
                -- Motorola One & Edge Series
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%Edge 40%' THEN 2000.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%Edge 30%' THEN 1700.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%Edge 20%' THEN 1500.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%One Fusion%' THEN 900.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%One Action%' THEN 850.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%One Macro%' THEN 780.00
                WHEN marca = 'Motorola' AND tipo = 'Display' AND nombre LIKE '%One%' THEN 800.00
                
                -- Motorola Baterías
                WHEN marca = 'Motorola' AND tipo = 'Batería' THEN 360.00
                
                -- Motorola Otros
                WHEN marca = 'Motorola' AND tipo = 'Placa Carga' THEN 260.00
                WHEN marca = 'Motorola' AND tipo = 'Flex' THEN 180.00
                WHEN marca = 'Motorola' AND tipo = 'Botón' THEN 140.00
                WHEN marca = 'Motorola' AND tipo = 'Antena' THEN 190.00
                
                -- Default fallback
                ELSE 500.00
            END as precio
        FROM productos
        WHERE id NOT IN (SELECT DISTINCT producto_id FROM productos_sucursal);
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO producto, precio_producto;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Insertar en las 9 sucursales
        INSERT INTO productos_sucursal (producto_id, sucursal, stock, precio) VALUES
            (producto, 'pando', 0, precio_producto),
            (producto, 'maldonado', 0, precio_producto),
            (producto, 'rivera', 0, precio_producto),
            (producto, 'melo', 0, precio_producto),
            (producto, 'paysandu', 0, precio_producto),
            (producto, 'salto', 0, precio_producto),
            (producto, 'tacuarembo', 0, precio_producto),
            (producto, 'rio negro', 0, precio_producto),
            (producto, 'soriano', 0, precio_producto);
    END LOOP;
    
    CLOSE cur;
END$$

DELIMITER ;

-- Ejecutar el procedimiento
CALL AsignarProductosASucursales();

-- Eliminar el procedimiento (limpieza)
DROP PROCEDURE IF EXISTS AsignarProductosASucursales;








