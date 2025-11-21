-- ============================================
-- EJECUTAR ESTE SQL EN RAILWAY WEB CONSOLE
-- ============================================
-- Agregar columna una_vez_activo a la tabla configuracion_descuentos_sucursal
-- ============================================

USE zarparDataBase;

-- Verificar si la columna ya existe
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'zarparDataBase'
  AND TABLE_NAME = 'configuracion_descuentos_sucursal'
  AND COLUMN_NAME = 'una_vez_activo';

-- Si el resultado anterior está vacío, ejecuta esto:
ALTER TABLE `configuracion_descuentos_sucursal`
ADD COLUMN `una_vez_activo` TINYINT(1) DEFAULT 0 
COMMENT 'Descuento habilitado SOLO para la próxima venta (0=NO, 1=SÍ)' 
AFTER `descuento_habilitado`;

-- Verificar que se agregó correctamente
DESCRIBE configuracion_descuentos_sucursal;

-- Ver datos actuales
SELECT 
  sucursal, 
  descuento_habilitado, 
  una_vez_activo,
  updated_at 
FROM configuracion_descuentos_sucursal
ORDER BY sucursal;

-- Registrar la migración
INSERT IGNORE INTO `migraciones` (`nombre`) VALUES ('009_agregar_una_vez_descuentos.sql');

-- Verificar migraciones ejecutadas
SELECT * FROM migraciones ORDER BY ejecutado_en DESC LIMIT 5;

