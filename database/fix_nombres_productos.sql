-- ================================================================
-- CORRECCIÓN DE NOMBRES DE PRODUCTOS CON ENCODING CORRUPTO
-- ================================================================
-- Este script corrige la columna "nombre" de la tabla "productos"
-- que tiene caracteres con doble encoding UTF-8
-- ================================================================

USE zarparDataBase;

SET NAMES 'utf8mb4';
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- ==========================================
-- REPORTE INICIAL
-- ==========================================
SELECT '========== PRODUCTOS CON NOMBRES CORRUPTOS ===========' as titulo;

SELECT COUNT(*) as total_productos_corruptos
FROM productos
WHERE nombre LIKE '%Ã%';

-- Mostrar algunos ejemplos
SELECT id, nombre, marca, tipo
FROM productos
WHERE nombre LIKE '%Ã%'
LIMIT 10;

-- ==========================================
-- CORRECCIÓN: NOMBRES DE PRODUCTOS
-- ==========================================
SELECT '========== CORRIGIENDO NOMBRES DE PRODUCTOS ===========' as titulo;

-- Corregir "Batería"
UPDATE productos 
SET nombre = REPLACE(nombre, 'BaterÃ­a', 'Batería') 
WHERE nombre LIKE '%BaterÃ­a%';

-- Corregir "Botón"
UPDATE productos 
SET nombre = REPLACE(nombre, 'BotÃ³n', 'Botón') 
WHERE nombre LIKE '%BotÃ³n%';

-- Corregir otros caracteres comunes
UPDATE productos SET nombre = REPLACE(nombre, 'Ã¡', 'á') WHERE nombre LIKE '%Ã¡%';
UPDATE productos SET nombre = REPLACE(nombre, 'Ã©', 'é') WHERE nombre LIKE '%Ã©%';
UPDATE productos SET nombre = REPLACE(nombre, 'Ã­', 'í') WHERE nombre LIKE '%Ã­%';
UPDATE productos SET nombre = REPLACE(nombre, 'Ã³', 'ó') WHERE nombre LIKE '%Ã³%';
UPDATE productos SET nombre = REPLACE(nombre, 'Ãº', 'ú') WHERE nombre LIKE '%Ãº%';
UPDATE productos SET nombre = REPLACE(nombre, 'Ã±', 'ñ') WHERE nombre LIKE '%Ã±%';

-- Corregir mayúsculas con acentos
UPDATE productos SET nombre = REPLACE(nombre, 'Ã', 'Á') WHERE nombre LIKE '%Ã%';
UPDATE productos SET nombre = REPLACE(nombre, 'Ã‰', 'É') WHERE nombre LIKE '%Ã‰%';
UPDATE productos SET nombre = REPLACE(nombre, 'Ã', 'Í') WHERE nombre LIKE '%Ã%';
UPDATE productos SET nombre = REPLACE(nombre, 'Ã"', 'Ó') WHERE nombre LIKE '%Ã"%';
UPDATE productos SET nombre = REPLACE(nombre, 'Ãš', 'Ú') WHERE nombre LIKE '%Ãš%';

-- ==========================================
-- REPORTE FINAL
-- ==========================================
SELECT '========== REPORTE FINAL ===========' as titulo;

SELECT COUNT(*) as total_productos_corruptos_restantes
FROM productos
WHERE nombre LIKE '%Ã%';

-- Mostrar productos corregidos (Batería y Botón)
SELECT '========== PRODUCTOS CORREGIDOS (MUESTRA) ===========' as titulo;

SELECT id, nombre, marca, tipo
FROM productos
WHERE nombre LIKE '%Batería%' OR nombre LIKE '%Botón%'
LIMIT 15;

SELECT '========== ✅ CORRECCIÓN COMPLETA ===========' as titulo;

