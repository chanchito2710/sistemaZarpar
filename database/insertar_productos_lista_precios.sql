-- ============================================
-- SCRIPT: INSERCIÓN MASIVA DE PRODUCTOS
-- Fuente: Lista de precios Maldonado 21/10/25
-- Fecha: 04/11/2025
-- ============================================

USE zarparDataBase;

-- PASO 1: Limpiar productos existentes (excepto los que ya están)
-- (Opcional: descomentar si quieres empezar desde cero)
-- DELETE FROM productos_sucursal;
-- DELETE FROM productos WHERE id > 12;

-- ============================================
-- MARCA: HUAWEI (HW)
-- TIPO: DISPLAY (PAN)
-- ============================================

-- Producto 1: Honor X6/X6S/X8 5G/X8A 5G/PLAY 6C/Honor 70 Lite 5G
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X6/X6S/X8 5G/X8A 5G/PLAY 6C/Honor 70 Lite 5G', 'Huawei', 'Display', 'Original', 1);

-- Producto 2: Honor X6/X6s/Honor 70 Lite 5G Con Marco
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X6/X6s/Honor 70 Lite 5G Con Marco', 'Huawei', 'Display', 'Original', 1);

-- Producto 3: Honor X6A / X5 PLUS/X5B/X6a PLUS
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X6A / X5 PLUS/X5B/X6a PLUS', 'Huawei', 'Display', 'Original', 1);

-- Producto 4: Honor X6A Con Marco
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X6A Con Marco', 'Huawei', 'Display', 'Original', 1);

-- Producto 5: Honor X6B 4g
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X6B 4g', 'Huawei', 'Display', 'Original', 1);

-- Producto 6: Honor X7A
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X7A', 'Huawei', 'Display', 'Original', 1);

-- Producto 7: Honor X7B
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X7B', 'Huawei', 'Display', 'Original', 1);

-- Producto 8: Honor X8A
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X8A', 'Huawei', 'Display', 'Original', 1);

-- Producto 9: Honor X8B
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X8B', 'Huawei', 'Display', 'Original', 1);

-- Producto 10: Honor X9A / X9B 5G
INSERT INTO productos (nombre, marca, tipo, calidad, activo)
VALUES ('Honor X9A / X9B 5G', 'Huawei', 'Display', 'Original', 1);

-- ============================================
-- PASO 2: ASIGNAR PRECIOS Y STOCK A TODAS LAS SUCURSALES
-- ============================================

-- Obtener todas las sucursales dinámicamente
SET @sucursales = '';
SELECT GROUP_CONCAT(DISTINCT sucursal) INTO @sucursales
FROM configuracion_sucursales;

-- Crear un procedimiento temporal para insertar en todas las sucursales
DELIMITER $$

DROP PROCEDURE IF EXISTS InsertarProductoEnTodasSucursales$$

CREATE PROCEDURE InsertarProductoEnTodasSucursales(
    IN p_producto_nombre VARCHAR(255),
    IN p_precio DECIMAL(10,2),
    IN p_stock_inicial INT,
    IN p_es_principal TINYINT
)
BEGIN
    DECLARE v_producto_id INT;
    DECLARE v_sucursal VARCHAR(50);
    DECLARE done INT DEFAULT FALSE;
    
    -- Cursor para recorrer todas las sucursales
    DECLARE cur CURSOR FOR 
        SELECT sucursal FROM configuracion_sucursales;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Obtener el ID del producto recién insertado
    SELECT id INTO v_producto_id 
    FROM productos 
    WHERE nombre = p_producto_nombre 
    ORDER BY id DESC 
    LIMIT 1;
    
    -- Abrir cursor
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_sucursal;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Insertar en productos_sucursal
        INSERT INTO productos_sucursal 
            (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal, activo, stock_en_transito)
        VALUES 
            (v_producto_id, v_sucursal, p_stock_inicial, p_precio, 5, p_es_principal, 1, 0);
            
    END LOOP;
    
    CLOSE cur;
END$$

DELIMITER ;

-- ============================================
-- PASO 3: EJECUTAR INSERCIÓN EN TODAS LAS SUCURSALES
-- ============================================

-- Producto 1: $700
CALL InsertarProductoEnTodasSucursales('Honor X6/X6S/X8 5G/X8A 5G/PLAY 6C/Honor 70 Lite 5G', 700.00, 0, 0);

-- Producto 2: $900
CALL InsertarProductoEnTodasSucursales('Honor X6/X6s/Honor 70 Lite 5G Con Marco', 900.00, 0, 0);

-- Producto 3: $700
CALL InsertarProductoEnTodasSucursales('Honor X6A / X5 PLUS/X5B/X6a PLUS', 700.00, 0, 0);

-- Producto 4: $900
CALL InsertarProductoEnTodasSucursales('Honor X6A Con Marco', 900.00, 0, 0);

-- Producto 5: $1,000
CALL InsertarProductoEnTodasSucursales('Honor X6B 4g', 1000.00, 0, 0);

-- Producto 6: $1,000
CALL InsertarProductoEnTodasSucursales('Honor X7A', 1000.00, 0, 0);

-- Producto 7: $1,150
CALL InsertarProductoEnTodasSucursales('Honor X7B', 1150.00, 0, 0);

-- Producto 8: $1,100
CALL InsertarProductoEnTodasSucursales('Honor X8A', 1100.00, 0, 0);

-- Producto 9: $1,250
CALL InsertarProductoEnTodasSucursales('Honor X8B', 1250.00, 0, 0);

-- Producto 10: $1,800
CALL InsertarProductoEnTodasSucursales('Honor X9A / X9B 5G', 1800.00, 0, 0);

-- ============================================
-- PASO 4: LIMPIEZA
-- ============================================

-- Eliminar el procedimiento temporal
DROP PROCEDURE IF EXISTS InsertarProductoEnTodasSucursales;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver productos insertados
SELECT 
    p.id,
    p.nombre,
    p.marca,
    p.tipo,
    p.calidad,
    COUNT(ps.id) as sucursales_asignadas,
    GROUP_CONCAT(DISTINCT ps.precio) as precios
FROM productos p
LEFT JOIN productos_sucursal ps ON p.id = ps.producto_id
WHERE p.id > 12
GROUP BY p.id, p.nombre, p.marca, p.tipo, p.calidad
ORDER BY p.id;

-- Ver stock por sucursal
SELECT 
    ps.sucursal,
    COUNT(ps.producto_id) as total_productos,
    SUM(ps.stock) as stock_total,
    MIN(ps.precio) as precio_min,
    MAX(ps.precio) as precio_max
FROM productos_sucursal ps
INNER JOIN productos p ON ps.producto_id = p.id
WHERE p.id > 12
GROUP BY ps.sucursal
ORDER BY ps.sucursal;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================








