-- ============================================
-- MIGRACIÓN 009: Agregar campo una_vez_activo a configuracion_descuentos_sucursal
-- ============================================
-- Fecha: 2025-11-17
-- Descripción: Permite habilitar descuentos "una sola vez" para una sucursal
--              Se desactiva automáticamente después del primer uso
-- ============================================

USE zarparDataBase;

-- Agregar columna una_vez_activo si no existe
-- Verificar primero si la columna ya existe para evitar errores
SET @column_exists = (SELECT COUNT(*)
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'zarparDataBase'
AND TABLE_NAME = 'configuracion_descuentos_sucursal'
AND COLUMN_NAME = 'una_vez_activo');

SET @sql = IF(@column_exists = 0,
'ALTER TABLE `configuracion_descuentos_sucursal` ADD COLUMN `una_vez_activo` TINYINT(1) DEFAULT 0 COMMENT \'Descuento habilitado SOLO para la próxima venta (0=NO, 1=SÍ)\' AFTER `descuento_habilitado`',
'SELECT \'Columna una_vez_activo ya existe\' AS mensaje');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificación
SELECT 
  sucursal, 
  descuento_habilitado, 
  una_vez_activo,
  updated_at 
FROM `configuracion_descuentos_sucursal`
ORDER BY sucursal;

-- Registrar la migración
INSERT IGNORE INTO `migraciones` (`nombre`) VALUES ('009_agregar_una_vez_descuentos.sql');

