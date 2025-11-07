-- ============================================================
-- Script para actualizar Foreign Keys de tablas de clientes
-- Este script estandariza los nombres de las FK para que sean
-- predecibles y fáciles de eliminar
-- ============================================================
-- AUTOR: Sistema Zarpar
-- FECHA: 31 de Octubre, 2025
-- VERSIÓN: 1.0.0
-- ============================================================

-- ⚠️ ADVERTENCIA: Este script modifica la estructura de la BD
-- Hacer backup antes de ejecutar

USE zarparDataBase;

-- ============================================================
-- FUNCIÓN: Obtener el nombre actual de la FK de una tabla
-- ============================================================

-- Para cada tabla de clientes, vamos a:
-- 1. Encontrar la FK actual
-- 2. Eliminarla
-- 3. Crear una nueva con nombre estandarizado

-- ============================================================
-- TABLA: clientes_pando
-- ============================================================

-- Verificar FK actual
SELECT CONSTRAINT_NAME 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'zarparDataBase' 
  AND TABLE_NAME = 'clientes_pando' 
  AND CONSTRAINT_TYPE = 'FOREIGN KEY';

-- Eliminar FK antigua (ajustar nombre según resultado anterior)
-- ALTER TABLE `clientes_pando` DROP FOREIGN KEY `clientes_pando_ibfk_1`;

-- Crear FK nueva con nombre estandarizado
-- ALTER TABLE `clientes_pando` 
-- ADD CONSTRAINT `fk_clientes_pando_vendedor` 
-- FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) 
-- ON DELETE SET NULL;

-- ============================================================
-- TABLA: clientes_maldonado
-- ============================================================

SELECT CONSTRAINT_NAME 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'zarparDataBase' 
  AND TABLE_NAME = 'clientes_maldonado' 
  AND CONSTRAINT_TYPE = 'FOREIGN KEY';

-- ALTER TABLE `clientes_maldonado` DROP FOREIGN KEY `clientes_maldonado_ibfk_1`;
-- ALTER TABLE `clientes_maldonado` 
-- ADD CONSTRAINT `fk_clientes_maldonado_vendedor` 
-- FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) 
-- ON DELETE SET NULL;

-- ============================================================
-- TABLA: clientes_rivera
-- ============================================================

SELECT CONSTRAINT_NAME 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'zarparDataBase' 
  AND TABLE_NAME = 'clientes_rivera' 
  AND CONSTRAINT_TYPE = 'FOREIGN KEY';

-- ALTER TABLE `clientes_rivera` DROP FOREIGN KEY `clientes_rivera_ibfk_1`;
-- ALTER TABLE `clientes_rivera` 
-- ADD CONSTRAINT `fk_clientes_rivera_vendedor` 
-- FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) 
-- ON DELETE SET NULL;

-- ============================================================
-- TABLA: clientes_melo
-- ============================================================

SELECT CONSTRAINT_NAME 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'zarparDataBase' 
  AND TABLE_NAME = 'clientes_melo' 
  AND CONSTRAINT_TYPE = 'FOREIGN KEY';

-- ALTER TABLE `clientes_melo` DROP FOREIGN KEY `clientes_melo_ibfk_1`;
-- ALTER TABLE `clientes_melo` 
-- ADD CONSTRAINT `fk_clientes_melo_vendedor` 
-- FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) 
-- ON DELETE SET NULL;

-- ============================================================
-- TABLA: clientes_mercedes
-- ============================================================

SELECT CONSTRAINT_NAME 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'zarparDataBase' 
  AND TABLE_NAME = 'clientes_mercedes' 
  AND CONSTRAINT_TYPE = 'FOREIGN KEY';

-- ALTER TABLE `clientes_mercedes` DROP FOREIGN KEY `clientes_mercedes_ibfk_1`;
-- ALTER TABLE `clientes_mercedes` 
-- ADD CONSTRAINT `fk_clientes_mercedes_vendedor` 
-- FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) 
-- ON DELETE SET NULL;

-- ============================================================
-- TABLA: clientes_paysandu
-- ============================================================

SELECT CONSTRAINT_NAME 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'zarparDataBase' 
  AND TABLE_NAME = 'clientes_paysandu' 
  AND CONSTRAINT_TYPE = 'FOREIGN KEY';

-- ALTER TABLE `clientes_paysandu` DROP FOREIGN KEY `clientes_paysandu_ibfk_1`;
-- ALTER TABLE `clientes_paysandu` 
-- ADD CONSTRAINT `fk_clientes_paysandu_vendedor` 
-- FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) 
-- ON DELETE SET NULL;

-- ============================================================
-- TABLA: clientes_salto
-- ============================================================

SELECT CONSTRAINT_NAME 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'zarparDataBase' 
  AND TABLE_NAME = 'clientes_salto' 
  AND CONSTRAINT_TYPE = 'FOREIGN KEY';

-- ALTER TABLE `clientes_salto` DROP FOREIGN KEY `clientes_salto_ibfk_1`;
-- ALTER TABLE `clientes_salto` 
-- ADD CONSTRAINT `fk_clientes_salto_vendedor` 
-- FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) 
-- ON DELETE SET NULL;

-- ============================================================
-- TABLA: clientes_tacuarembo
-- ============================================================

SELECT CONSTRAINT_NAME 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'zarparDataBase' 
  AND TABLE_NAME = 'clientes_tacuarembo' 
  AND CONSTRAINT_TYPE = 'FOREIGN KEY';

-- ALTER TABLE `clientes_tacuarembo` DROP FOREIGN KEY `clientes_tacuarembo_ibfk_1`;
-- ALTER TABLE `clientes_tacuarembo` 
-- ADD CONSTRAINT `fk_clientes_tacuarembo_vendedor` 
-- FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) 
-- ON DELETE SET NULL;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================

-- Ver todas las FK de todas las tablas de clientes
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'zarparDataBase'
  AND TABLE_NAME LIKE 'clientes_%'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;

-- ============================================================
-- NOTAS IMPORTANTES:
-- ============================================================
-- 
-- ⚠️ Este script está comentado por seguridad
-- ⚠️ Descomenta SOLO las líneas ALTER TABLE después de verificar
-- 
-- El sistema actual detecta AUTOMÁTICAMENTE las FK y las elimina
-- Por lo tanto, este script es OPCIONAL
-- 
-- Solo ejecuta este script si quieres estandarizar los nombres
-- de las FK por consistencia
-- 
-- ============================================================










