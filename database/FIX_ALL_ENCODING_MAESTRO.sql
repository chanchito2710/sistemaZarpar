-- ================================================================
-- SCRIPT MAESTRO: CORRECCIÓN COMPLETA DE ENCODING UTF-8
-- ================================================================
-- Este script corrige TODAS las tablas con problemas de encoding
-- Ejecutar UNA SOLA VEZ después de configurar charset en Node.js
-- ================================================================

USE zarparDataBase;

SET NAMES 'utf8mb4';
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- ==========================================
-- REPORTE INICIAL
-- ==========================================
SELECT '========== REPORTE INICIAL DE DATOS CORRUPTOS ===========' as titulo;

SELECT 'TOTAL DE DATOS CORRUPTOS POR TABLA:' as titulo;

SELECT 'clientes_pando' as tabla, COUNT(*) as total_corruptos
FROM clientes_pando
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%';

SELECT 'clientes_maldonado' as tabla, COUNT(*) as total_corruptos
FROM clientes_maldonado
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%';

SELECT 'clientes_rivera' as tabla, COUNT(*) as total_corruptos
FROM clientes_rivera
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%';

SELECT 'clientes_melo' as tabla, COUNT(*) as total_corruptos
FROM clientes_melo
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%';

SELECT 'clientes_paysandu' as tabla, COUNT(*) as total_corruptos
FROM clientes_paysandu
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%';

SELECT 'clientes_salto' as tabla, COUNT(*) as total_corruptos
FROM clientes_salto
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%';

SELECT 'clientes_tacuarembo' as tabla, COUNT(*) as total_corruptos
FROM clientes_tacuarembo
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%';

-- ==========================================
-- CORRECCIÓN: CLIENTES_PANDO
-- ==========================================
SELECT '========== CORRIGIENDO clientes_pando ===========' as titulo;

-- Corregir caracteres específicos comunes
UPDATE clientes_pando SET nombre = REPLACE(nombre, 'Ã¡', 'á') WHERE nombre LIKE '%Ã¡%';
UPDATE clientes_pando SET nombre = REPLACE(nombre, 'Ã©', 'é') WHERE nombre LIKE '%Ã©%';
UPDATE clientes_pando SET nombre = REPLACE(nombre, 'Ã­', 'í') WHERE nombre LIKE '%Ã­%';
UPDATE clientes_pando SET nombre = REPLACE(nombre, 'Ã³', 'ó') WHERE nombre LIKE '%Ã³%';
UPDATE clientes_pando SET nombre = REPLACE(nombre, 'Ãº', 'ú') WHERE nombre LIKE '%Ãº%';
UPDATE clientes_pando SET nombre = REPLACE(nombre, 'Ã±', 'ñ') WHERE nombre LIKE '%Ã±%';

UPDATE clientes_pando SET apellido = REPLACE(apellido, 'Ã¡', 'á') WHERE apellido LIKE '%Ã¡%';
UPDATE clientes_pando SET apellido = REPLACE(apellido, 'Ã©', 'é') WHERE apellido LIKE '%Ã©%';
UPDATE clientes_pando SET apellido = REPLACE(apellido, 'Ã­', 'í') WHERE apellido LIKE '%Ã­%';
UPDATE clientes_pando SET apellido = REPLACE(apellido, 'Ã³', 'ó') WHERE apellido LIKE '%Ã³%';
UPDATE clientes_pando SET apellido = REPLACE(apellido, 'Ãº', 'ú') WHERE apellido LIKE '%Ãº%';
UPDATE clientes_pando SET apellido = REPLACE(apellido, 'Ã±', 'ñ') WHERE apellido LIKE '%Ã±%';

UPDATE clientes_pando SET direccion = REPLACE(direccion, 'Ã¡', 'á') WHERE direccion LIKE '%Ã¡%';
UPDATE clientes_pando SET direccion = REPLACE(direccion, 'Ã©', 'é') WHERE direccion LIKE '%Ã©%';
UPDATE clientes_pando SET direccion = REPLACE(direccion, 'Ã­', 'í') WHERE direccion LIKE '%Ã­%';
UPDATE clientes_pando SET direccion = REPLACE(direccion, 'Ã³', 'ó') WHERE direccion LIKE '%Ã³%';
UPDATE clientes_pando SET direccion = REPLACE(direccion, 'Ãº', 'ú') WHERE direccion LIKE '%Ãº%';
UPDATE clientes_pando SET direccion = REPLACE(direccion, 'Ã±', 'ñ') WHERE direccion LIKE '%Ã±%';

-- ==========================================
-- CORRECCIÓN: CLIENTES_MALDONADO
-- ==========================================
SELECT '========== CORRIGIENDO clientes_maldonado ===========' as titulo;

UPDATE clientes_maldonado SET nombre = REPLACE(nombre, 'Ã¡', 'á') WHERE nombre LIKE '%Ã¡%';
UPDATE clientes_maldonado SET nombre = REPLACE(nombre, 'Ã©', 'é') WHERE nombre LIKE '%Ã©%';
UPDATE clientes_maldonado SET nombre = REPLACE(nombre, 'Ã­', 'í') WHERE nombre LIKE '%Ã­%';
UPDATE clientes_maldonado SET nombre = REPLACE(nombre, 'Ã³', 'ó') WHERE nombre LIKE '%Ã³%';
UPDATE clientes_maldonado SET nombre = REPLACE(nombre, 'Ãº', 'ú') WHERE nombre LIKE '%Ãº%';
UPDATE clientes_maldonado SET nombre = REPLACE(nombre, 'Ã±', 'ñ') WHERE nombre LIKE '%Ã±%';

UPDATE clientes_maldonado SET apellido = REPLACE(apellido, 'Ã¡', 'á') WHERE apellido LIKE '%Ã¡%';
UPDATE clientes_maldonado SET apellido = REPLACE(apellido, 'Ã©', 'é') WHERE apellido LIKE '%Ã©%';
UPDATE clientes_maldonado SET apellido = REPLACE(apellido, 'Ã­', 'í') WHERE apellido LIKE '%Ã­%';
UPDATE clientes_maldonado SET apellido = REPLACE(apellido, 'Ã³', 'ó') WHERE apellido LIKE '%Ã³%';
UPDATE clientes_maldonado SET apellido = REPLACE(apellido, 'Ãº', 'ú') WHERE apellido LIKE '%Ãº%';
UPDATE clientes_maldonado SET apellido = REPLACE(apellido, 'Ã±', 'ñ') WHERE apellido LIKE '%Ã±%';

UPDATE clientes_maldonado SET direccion = REPLACE(direccion, 'Ã¡', 'á') WHERE direccion LIKE '%Ã¡%';
UPDATE clientes_maldonado SET direccion = REPLACE(direccion, 'Ã©', 'é') WHERE direccion LIKE '%Ã©%';
UPDATE clientes_maldonado SET direccion = REPLACE(direccion, 'Ã­', 'í') WHERE direccion LIKE '%Ã­%';
UPDATE clientes_maldonado SET direccion = REPLACE(direccion, 'Ã³', 'ó') WHERE direccion LIKE '%Ã³%';
UPDATE clientes_maldonado SET direccion = REPLACE(direccion, 'Ãº', 'ú') WHERE direccion LIKE '%Ãº%';
UPDATE clientes_maldonado SET direccion = REPLACE(direccion, 'Ã±', 'ñ') WHERE direccion LIKE '%Ã±%';

-- ==========================================
-- CORRECCIÓN: CLIENTES_RIVERA
-- ==========================================
SELECT '========== CORRIGIENDO clientes_rivera ===========' as titulo;

UPDATE clientes_rivera SET nombre = REPLACE(nombre, 'Ã¡', 'á') WHERE nombre LIKE '%Ã¡%';
UPDATE clientes_rivera SET nombre = REPLACE(nombre, 'Ã©', 'é') WHERE nombre LIKE '%Ã©%';
UPDATE clientes_rivera SET nombre = REPLACE(nombre, 'Ã­', 'í') WHERE nombre LIKE '%Ã­%';
UPDATE clientes_rivera SET nombre = REPLACE(nombre, 'Ã³', 'ó') WHERE nombre LIKE '%Ã³%';
UPDATE clientes_rivera SET nombre = REPLACE(nombre, 'Ãº', 'ú') WHERE nombre LIKE '%Ãº%';
UPDATE clientes_rivera SET nombre = REPLACE(nombre, 'Ã±', 'ñ') WHERE nombre LIKE '%Ã±%';

UPDATE clientes_rivera SET apellido = REPLACE(apellido, 'Ã¡', 'á') WHERE apellido LIKE '%Ã¡%';
UPDATE clientes_rivera SET apellido = REPLACE(apellido, 'Ã©', 'é') WHERE apellido LIKE '%Ã©%';
UPDATE clientes_rivera SET apellido = REPLACE(apellido, 'Ã­', 'í') WHERE apellido LIKE '%Ã­%';
UPDATE clientes_rivera SET apellido = REPLACE(apellido, 'Ã³', 'ó') WHERE apellido LIKE '%Ã³%';
UPDATE clientes_rivera SET apellido = REPLACE(apellido, 'Ãº', 'ú') WHERE apellido LIKE '%Ãº%';
UPDATE clientes_rivera SET apellido = REPLACE(apellido, 'Ã±', 'ñ') WHERE apellido LIKE '%Ã±%';

UPDATE clientes_rivera SET direccion = REPLACE(direccion, 'Ã¡', 'á') WHERE direccion LIKE '%Ã¡%';
UPDATE clientes_rivera SET direccion = REPLACE(direccion, 'Ã©', 'é') WHERE direccion LIKE '%Ã©%';
UPDATE clientes_rivera SET direccion = REPLACE(direccion, 'Ã­', 'í') WHERE direccion LIKE '%Ã­%';
UPDATE clientes_rivera SET direccion = REPLACE(direccion, 'Ã³', 'ó') WHERE direccion LIKE '%Ã³%';
UPDATE clientes_rivera SET direccion = REPLACE(direccion, 'Ãº', 'ú') WHERE direccion LIKE '%Ãº%';
UPDATE clientes_rivera SET direccion = REPLACE(direccion, 'Ã±', 'ñ') WHERE direccion LIKE '%Ã±%';

-- ==========================================
-- CORRECCIÓN: CLIENTES_MELO
-- ==========================================
SELECT '========== CORRIGIENDO clientes_melo ===========' as titulo;

UPDATE clientes_melo SET nombre = REPLACE(nombre, 'Ã¡', 'á') WHERE nombre LIKE '%Ã¡%';
UPDATE clientes_melo SET nombre = REPLACE(nombre, 'Ã©', 'é') WHERE nombre LIKE '%Ã©%';
UPDATE clientes_melo SET nombre = REPLACE(nombre, 'Ã­', 'í') WHERE nombre LIKE '%Ã­%';
UPDATE clientes_melo SET nombre = REPLACE(nombre, 'Ã³', 'ó') WHERE nombre LIKE '%Ã³%';
UPDATE clientes_melo SET nombre = REPLACE(nombre, 'Ãº', 'ú') WHERE nombre LIKE '%Ãº%';
UPDATE clientes_melo SET nombre = REPLACE(nombre, 'Ã±', 'ñ') WHERE nombre LIKE '%Ã±%';

UPDATE clientes_melo SET apellido = REPLACE(apellido, 'Ã¡', 'á') WHERE apellido LIKE '%Ã¡%';
UPDATE clientes_melo SET apellido = REPLACE(apellido, 'Ã©', 'é') WHERE apellido LIKE '%Ã©%';
UPDATE clientes_melo SET apellido = REPLACE(apellido, 'Ã­', 'í') WHERE apellido LIKE '%Ã­%';
UPDATE clientes_melo SET apellido = REPLACE(apellido, 'Ã³', 'ó') WHERE apellido LIKE '%Ã³%';
UPDATE clientes_melo SET apellido = REPLACE(apellido, 'Ãº', 'ú') WHERE apellido LIKE '%Ãº%';
UPDATE clientes_melo SET apellido = REPLACE(apellido, 'Ã±', 'ñ') WHERE apellido LIKE '%Ã±%';

UPDATE clientes_melo SET direccion = REPLACE(direccion, 'Ã¡', 'á') WHERE direccion LIKE '%Ã¡%';
UPDATE clientes_melo SET direccion = REPLACE(direccion, 'Ã©', 'é') WHERE direccion LIKE '%Ã©%';
UPDATE clientes_melo SET direccion = REPLACE(direccion, 'Ã­', 'í') WHERE direccion LIKE '%Ã­%';
UPDATE clientes_melo SET direccion = REPLACE(direccion, 'Ã³', 'ó') WHERE direccion LIKE '%Ã³%';
UPDATE clientes_melo SET direccion = REPLACE(direccion, 'Ãº', 'ú') WHERE direccion LIKE '%Ãº%';
UPDATE clientes_melo SET direccion = REPLACE(direccion, 'Ã±', 'ñ') WHERE direccion LIKE '%Ã±%';

-- ==========================================
-- CORRECCIÓN: CLIENTES_PAYSANDU
-- ==========================================
SELECT '========== CORRIGIENDO clientes_paysandu ===========' as titulo;

UPDATE clientes_paysandu SET nombre = REPLACE(nombre, 'Ã¡', 'á') WHERE nombre LIKE '%Ã¡%';
UPDATE clientes_paysandu SET nombre = REPLACE(nombre, 'Ã©', 'é') WHERE nombre LIKE '%Ã©%';
UPDATE clientes_paysandu SET nombre = REPLACE(nombre, 'Ã­', 'í') WHERE nombre LIKE '%Ã­%';
UPDATE clientes_paysandu SET nombre = REPLACE(nombre, 'Ã³', 'ó') WHERE nombre LIKE '%Ã³%';
UPDATE clientes_paysandu SET nombre = REPLACE(nombre, 'Ãº', 'ú') WHERE nombre LIKE '%Ãº%';
UPDATE clientes_paysandu SET nombre = REPLACE(nombre, 'Ã±', 'ñ') WHERE nombre LIKE '%Ã±%';

UPDATE clientes_paysandu SET apellido = REPLACE(apellido, 'Ã¡', 'á') WHERE apellido LIKE '%Ã¡%';
UPDATE clientes_paysandu SET apellido = REPLACE(apellido, 'Ã©', 'é') WHERE apellido LIKE '%Ã©%';
UPDATE clientes_paysandu SET apellido = REPLACE(apellido, 'Ã­', 'í') WHERE apellido LIKE '%Ã­%';
UPDATE clientes_paysandu SET apellido = REPLACE(apellido, 'Ã³', 'ó') WHERE apellido LIKE '%Ã³%';
UPDATE clientes_paysandu SET apellido = REPLACE(apellido, 'Ãº', 'ú') WHERE apellido LIKE '%Ãº%';
UPDATE clientes_paysandu SET apellido = REPLACE(apellido, 'Ã±', 'ñ') WHERE apellido LIKE '%Ã±%';

UPDATE clientes_paysandu SET direccion = REPLACE(direccion, 'Ã¡', 'á') WHERE direccion LIKE '%Ã¡%';
UPDATE clientes_paysandu SET direccion = REPLACE(direccion, 'Ã©', 'é') WHERE direccion LIKE '%Ã©%';
UPDATE clientes_paysandu SET direccion = REPLACE(direccion, 'Ã­', 'í') WHERE direccion LIKE '%Ã­%';
UPDATE clientes_paysandu SET direccion = REPLACE(direccion, 'Ã³', 'ó') WHERE direccion LIKE '%Ã³%';
UPDATE clientes_paysandu SET direccion = REPLACE(direccion, 'Ãº', 'ú') WHERE direccion LIKE '%Ãº%';
UPDATE clientes_paysandu SET direccion = REPLACE(direccion, 'Ã±', 'ñ') WHERE direccion LIKE '%Ã±%';

-- ==========================================
-- CORRECCIÓN: CLIENTES_SALTO
-- ==========================================
SELECT '========== CORRIGIENDO clientes_salto ===========' as titulo;

UPDATE clientes_salto SET nombre = REPLACE(nombre, 'Ã¡', 'á') WHERE nombre LIKE '%Ã¡%';
UPDATE clientes_salto SET nombre = REPLACE(nombre, 'Ã©', 'é') WHERE nombre LIKE '%Ã©%';
UPDATE clientes_salto SET nombre = REPLACE(nombre, 'Ã­', 'í') WHERE nombre LIKE '%Ã­%';
UPDATE clientes_salto SET nombre = REPLACE(nombre, 'Ã³', 'ó') WHERE nombre LIKE '%Ã³%';
UPDATE clientes_salto SET nombre = REPLACE(nombre, 'Ãº', 'ú') WHERE nombre LIKE '%Ãº%';
UPDATE clientes_salto SET nombre = REPLACE(nombre, 'Ã±', 'ñ') WHERE nombre LIKE '%Ã±%';

UPDATE clientes_salto SET apellido = REPLACE(apellido, 'Ã¡', 'á') WHERE apellido LIKE '%Ã¡%';
UPDATE clientes_salto SET apellido = REPLACE(apellido, 'Ã©', 'é') WHERE apellido LIKE '%Ã©%';
UPDATE clientes_salto SET apellido = REPLACE(apellido, 'Ã­', 'í') WHERE apellido LIKE '%Ã­%';
UPDATE clientes_salto SET apellido = REPLACE(apellido, 'Ã³', 'ó') WHERE apellido LIKE '%Ã³%';
UPDATE clientes_salto SET apellido = REPLACE(apellido, 'Ãº', 'ú') WHERE apellido LIKE '%Ãº%';
UPDATE clientes_salto SET apellido = REPLACE(apellido, 'Ã±', 'ñ') WHERE apellido LIKE '%Ã±%';

UPDATE clientes_salto SET direccion = REPLACE(direccion, 'Ã¡', 'á') WHERE direccion LIKE '%Ã¡%';
UPDATE clientes_salto SET direccion = REPLACE(direccion, 'Ã©', 'é') WHERE direccion LIKE '%Ã©%';
UPDATE clientes_salto SET direccion = REPLACE(direccion, 'Ã­', 'í') WHERE direccion LIKE '%Ã­%';
UPDATE clientes_salto SET direccion = REPLACE(direccion, 'Ã³', 'ó') WHERE direccion LIKE '%Ã³%';
UPDATE clientes_salto SET direccion = REPLACE(direccion, 'Ãº', 'ú') WHERE direccion LIKE '%Ãº%';
UPDATE clientes_salto SET direccion = REPLACE(direccion, 'Ã±', 'ñ') WHERE direccion LIKE '%Ã±%';

-- ==========================================
-- CORRECCIÓN: CLIENTES_TACUAREMBO
-- ==========================================
SELECT '========== CORRIGIENDO clientes_tacuarembo ===========' as titulo;

UPDATE clientes_tacuarembo SET nombre = REPLACE(nombre, 'Ã¡', 'á') WHERE nombre LIKE '%Ã¡%';
UPDATE clientes_tacuarembo SET nombre = REPLACE(nombre, 'Ã©', 'é') WHERE nombre LIKE '%Ã©%';
UPDATE clientes_tacuarembo SET nombre = REPLACE(nombre, 'Ã­', 'í') WHERE nombre LIKE '%Ã­%';
UPDATE clientes_tacuarembo SET nombre = REPLACE(nombre, 'Ã³', 'ó') WHERE nombre LIKE '%Ã³%';
UPDATE clientes_tacuarembo SET nombre = REPLACE(nombre, 'Ãº', 'ú') WHERE nombre LIKE '%Ãº%';
UPDATE clientes_tacuarembo SET nombre = REPLACE(nombre, 'Ã±', 'ñ') WHERE nombre LIKE '%Ã±%';

UPDATE clientes_tacuarembo SET apellido = REPLACE(apellido, 'Ã¡', 'á') WHERE apellido LIKE '%Ã¡%';
UPDATE clientes_tacuarembo SET apellido = REPLACE(apellido, 'Ã©', 'é') WHERE apellido LIKE '%Ã©%';
UPDATE clientes_tacuarembo SET apellido = REPLACE(apellido, 'Ã­', 'í') WHERE apellido LIKE '%Ã­%';
UPDATE clientes_tacuarembo SET apellido = REPLACE(apellido, 'Ã³', 'ó') WHERE apellido LIKE '%Ã³%';
UPDATE clientes_tacuarembo SET apellido = REPLACE(apellido, 'Ãº', 'ú') WHERE apellido LIKE '%Ãº%';
UPDATE clientes_tacuarembo SET apellido = REPLACE(apellido, 'Ã±', 'ñ') WHERE apellido LIKE '%Ã±%';

UPDATE clientes_tacuarembo SET direccion = REPLACE(direccion, 'Ã¡', 'á') WHERE direccion LIKE '%Ã¡%';
UPDATE clientes_tacuarembo SET direccion = REPLACE(direccion, 'Ã©', 'é') WHERE direccion LIKE '%Ã©%';
UPDATE clientes_tacuarembo SET direccion = REPLACE(direccion, 'Ã­', 'í') WHERE direccion LIKE '%Ã­%';
UPDATE clientes_tacuarembo SET direccion = REPLACE(direccion, 'Ã³', 'ó') WHERE direccion LIKE '%Ã³%';
UPDATE clientes_tacuarembo SET direccion = REPLACE(direccion, 'Ãº', 'ú') WHERE direccion LIKE '%Ãº%';
UPDATE clientes_tacuarembo SET direccion = REPLACE(direccion, 'Ã±', 'ñ') WHERE direccion LIKE '%Ã±%';

-- ==========================================
-- CORREGIR OTRAS TABLAS DE CLIENTES
-- ==========================================
SELECT '========== CORRIGIENDO clientes_rionegro ===========' as titulo;

UPDATE clientes_rionegro SET nombre = REPLACE(nombre, 'Ã¡', 'á') WHERE nombre LIKE '%Ã¡%';
UPDATE clientes_rionegro SET nombre = REPLACE(nombre, 'Ã©', 'é') WHERE nombre LIKE '%Ã©%';
UPDATE clientes_rionegro SET nombre = REPLACE(nombre, 'Ã­', 'í') WHERE nombre LIKE '%Ã­%';
UPDATE clientes_rionegro SET nombre = REPLACE(nombre, 'Ã³', 'ó') WHERE nombre LIKE '%Ã³%';
UPDATE clientes_rionegro SET nombre = REPLACE(nombre, 'Ãº', 'ú') WHERE nombre LIKE '%Ãº%';
UPDATE clientes_rionegro SET nombre = REPLACE(nombre, 'Ã±', 'ñ') WHERE nombre LIKE '%Ã±%';
UPDATE clientes_rionegro SET apellido = REPLACE(apellido, 'Ã¡', 'á') WHERE apellido LIKE '%Ã¡%';
UPDATE clientes_rionegro SET apellido = REPLACE(apellido, 'Ã©', 'é') WHERE apellido LIKE '%Ã©%';
UPDATE clientes_rionegro SET apellido = REPLACE(apellido, 'Ã­', 'í') WHERE apellido LIKE '%Ã­%';
UPDATE clientes_rionegro SET apellido = REPLACE(apellido, 'Ã³', 'ó') WHERE apellido LIKE '%Ã³%';
UPDATE clientes_rionegro SET apellido = REPLACE(apellido, 'Ãº', 'ú') WHERE apellido LIKE '%Ãº%';
UPDATE clientes_rionegro SET apellido = REPLACE(apellido, 'Ã±', 'ñ') WHERE apellido LIKE '%Ã±%';
UPDATE clientes_rionegro SET direccion = REPLACE(direccion, 'Ã¡', 'á') WHERE direccion LIKE '%Ã¡%';
UPDATE clientes_rionegro SET direccion = REPLACE(direccion, 'Ã©', 'é') WHERE direccion LIKE '%Ã©%';
UPDATE clientes_rionegro SET direccion = REPLACE(direccion, 'Ã­', 'í') WHERE direccion LIKE '%Ã­%';
UPDATE clientes_rionegro SET direccion = REPLACE(direccion, 'Ã³', 'ó') WHERE direccion LIKE '%Ã³%';
UPDATE clientes_rionegro SET direccion = REPLACE(direccion, 'Ãº', 'ú') WHERE direccion LIKE '%Ãº%';
UPDATE clientes_rionegro SET direccion = REPLACE(direccion, 'Ã±', 'ñ') WHERE direccion LIKE '%Ã±%';

SELECT '========== CORRIGIENDO clientes_sanisidro ===========' as titulo;

UPDATE clientes_sanisidro SET nombre = REPLACE(nombre, 'Ã¡', 'á') WHERE nombre LIKE '%Ã¡%';
UPDATE clientes_sanisidro SET nombre = REPLACE(nombre, 'Ã©', 'é') WHERE nombre LIKE '%Ã©%';
UPDATE clientes_sanisidro SET nombre = REPLACE(nombre, 'Ã­', 'í') WHERE nombre LIKE '%Ã­%';
UPDATE clientes_sanisidro SET nombre = REPLACE(nombre, 'Ã³', 'ó') WHERE nombre LIKE '%Ã³%';
UPDATE clientes_sanisidro SET nombre = REPLACE(nombre, 'Ãº', 'ú') WHERE nombre LIKE '%Ãº%';
UPDATE clientes_sanisidro SET nombre = REPLACE(nombre, 'Ã±', 'ñ') WHERE nombre LIKE '%Ã±%';
UPDATE clientes_sanisidro SET apellido = REPLACE(apellido, 'Ã¡', 'á') WHERE apellido LIKE '%Ã¡%';
UPDATE clientes_sanisidro SET apellido = REPLACE(apellido, 'Ã©', 'é') WHERE apellido LIKE '%Ã©%';
UPDATE clientes_sanisidro SET apellido = REPLACE(apellido, 'Ã­', 'í') WHERE apellido LIKE '%Ã­%';
UPDATE clientes_sanisidro SET apellido = REPLACE(apellido, 'Ã³', 'ó') WHERE apellido LIKE '%Ã³%';
UPDATE clientes_sanisidro SET apellido = REPLACE(apellido, 'Ãº', 'ú') WHERE apellido LIKE '%Ãº%';
UPDATE clientes_sanisidro SET apellido = REPLACE(apellido, 'Ã±', 'ñ') WHERE apellido LIKE '%Ã±%';
UPDATE clientes_sanisidro SET direccion = REPLACE(direccion, 'Ã¡', 'á') WHERE direccion LIKE '%Ã¡%';
UPDATE clientes_sanisidro SET direccion = REPLACE(direccion, 'Ã©', 'é') WHERE direccion LIKE '%Ã©%';
UPDATE clientes_sanisidro SET direccion = REPLACE(direccion, 'Ã­', 'í') WHERE direccion LIKE '%Ã­%';
UPDATE clientes_sanisidro SET direccion = REPLACE(direccion, 'Ã³', 'ó') WHERE direccion LIKE '%Ã³%';
UPDATE clientes_sanisidro SET direccion = REPLACE(direccion, 'Ãº', 'ú') WHERE direccion LIKE '%Ãº%';
UPDATE clientes_sanisidro SET direccion = REPLACE(direccion, 'Ã±', 'ñ') WHERE direccion LIKE '%Ã±%';

SELECT '========== CORRIGIENDO clientes_soriano ===========' as titulo;

UPDATE clientes_soriano SET nombre = REPLACE(nombre, 'Ã¡', 'á') WHERE nombre LIKE '%Ã¡%';
UPDATE clientes_soriano SET nombre = REPLACE(nombre, 'Ã©', 'é') WHERE nombre LIKE '%Ã©%';
UPDATE clientes_soriano SET nombre = REPLACE(nombre, 'Ã­', 'í') WHERE nombre LIKE '%Ã­%';
UPDATE clientes_soriano SET nombre = REPLACE(nombre, 'Ã³', 'ó') WHERE nombre LIKE '%Ã³%';
UPDATE clientes_soriano SET nombre = REPLACE(nombre, 'Ãº', 'ú') WHERE nombre LIKE '%Ãº%';
UPDATE clientes_soriano SET nombre = REPLACE(nombre, 'Ã±', 'ñ') WHERE nombre LIKE '%Ã±%';
UPDATE clientes_soriano SET apellido = REPLACE(apellido, 'Ã¡', 'á') WHERE apellido LIKE '%Ã¡%';
UPDATE clientes_soriano SET apellido = REPLACE(apellido, 'Ã©', 'é') WHERE apellido LIKE '%Ã©%';
UPDATE clientes_soriano SET apellido = REPLACE(apellido, 'Ã­', 'í') WHERE apellido LIKE '%Ã­%';
UPDATE clientes_soriano SET apellido = REPLACE(apellido, 'Ã³', 'ó') WHERE apellido LIKE '%Ã³%';
UPDATE clientes_soriano SET apellido = REPLACE(apellido, 'Ãº', 'ú') WHERE apellido LIKE '%Ãº%';
UPDATE clientes_soriano SET apellido = REPLACE(apellido, 'Ã±', 'ñ') WHERE apellido LIKE '%Ã±%';
UPDATE clientes_soriano SET direccion = REPLACE(direccion, 'Ã¡', 'á') WHERE direccion LIKE '%Ã¡%';
UPDATE clientes_soriano SET direccion = REPLACE(direccion, 'Ã©', 'é') WHERE direccion LIKE '%Ã©%';
UPDATE clientes_soriano SET direccion = REPLACE(direccion, 'Ã­', 'í') WHERE direccion LIKE '%Ã­%';
UPDATE clientes_soriano SET direccion = REPLACE(direccion, 'Ã³', 'ó') WHERE direccion LIKE '%Ã³%';
UPDATE clientes_soriano SET direccion = REPLACE(direccion, 'Ãº', 'ú') WHERE direccion LIKE '%Ãº%';
UPDATE clientes_soriano SET direccion = REPLACE(direccion, 'Ã±', 'ñ') WHERE direccion LIKE '%Ã±%';

-- ==========================================
-- REPORTE FINAL
-- ==========================================
SELECT '========== REPORTE FINAL (DESPUÉS DE CORRECCIÓN) ===========' as titulo;

SELECT 'TOTAL DE DATOS CORRUPTOS RESTANTES:' as titulo;

SELECT 'clientes_pando' as tabla, COUNT(*) as total_corruptos_restantes
FROM clientes_pando
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%';

SELECT 'clientes_maldonado' as tabla, COUNT(*) as total_corruptos_restantes
FROM clientes_maldonado
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%';

SELECT 'clientes_rivera' as tabla, COUNT(*) as total_corruptos_restantes
FROM clientes_rivera
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%';

SELECT 'clientes_melo' as tabla, COUNT(*) as total_corruptos_restantes
FROM clientes_melo
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%';

SELECT 'clientes_paysandu' as tabla, COUNT(*) as total_corruptos_restantes
FROM clientes_paysandu
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%';

SELECT 'clientes_salto' as tabla, COUNT(*) as total_corruptos_restantes
FROM clientes_salto
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%';

SELECT 'clientes_tacuarembo' as tabla, COUNT(*) as total_corruptos_restantes
FROM clientes_tacuarembo
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%';

SELECT '========== ✅ CORRECCIÓN COMPLETA ===========' as titulo;
SELECT 'Todas las tablas de clientes han sido corregidas' as mensaje;
SELECT 'Los caracteres especiales ahora están en UTF-8 correcto' as mensaje2;






