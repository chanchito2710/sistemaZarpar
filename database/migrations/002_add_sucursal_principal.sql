/**
 * Migración: Agregar sistema de Sucursal Principal (Casa Central)
 * 
 * OBJETIVO:
 * - Crear tabla para gestionar configuración de sucursales
 * - Permitir marcar una sucursal como "principal" o "casa central"
 * - Establecer Maldonado como casa principal por defecto
 * 
 * IMPORTANTE:
 * - Solo UNA sucursal puede ser principal a la vez
 * - La casa principal se usa como referencia para transferencias y operaciones
 */

-- Crear tabla de configuración de sucursales
CREATE TABLE IF NOT EXISTS `configuracion_sucursales` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sucursal` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre de la sucursal',
  `es_principal` TINYINT(1) DEFAULT 0 COMMENT '1 = Casa Principal, 0 = Sucursal normal',
  `direccion` VARCHAR(255) DEFAULT NULL COMMENT 'Dirección de la sucursal',
  `telefono` VARCHAR(20) DEFAULT NULL COMMENT 'Teléfono de contacto',
  `ciudad` VARCHAR(100) DEFAULT NULL COMMENT 'Ciudad donde está ubicada',
  `activa` TINYINT(1) DEFAULT 1 COMMENT 'Estado de la sucursal',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sucursal` (`sucursal`),
  KEY `idx_es_principal` (`es_principal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Configuración y gestión de sucursales del sistema';

-- Insertar sucursales existentes detectadas dinámicamente
-- (Esto detecta todas las tablas clientes_* que existen)
INSERT INTO `configuracion_sucursales` (`sucursal`, `es_principal`, `activa`)
SELECT 
  REPLACE(TABLE_NAME, 'clientes_', '') as sucursal,
  CASE 
    WHEN REPLACE(TABLE_NAME, 'clientes_', '') = 'maldonado' THEN 1 
    ELSE 0 
  END as es_principal,
  1 as activa
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME LIKE 'clientes_%'
  AND REPLACE(TABLE_NAME, 'clientes_', '') NOT IN ('administrador')
ON DUPLICATE KEY UPDATE
  `es_principal` = VALUES(`es_principal`),
  `updated_at` = CURRENT_TIMESTAMP;

-- Verificar que solo haya UNA sucursal principal
-- Si hay más de una, dejar solo Maldonado (o la primera encontrada)
UPDATE `configuracion_sucursales` 
SET `es_principal` = 0 
WHERE `sucursal` != 'maldonado' 
  AND `es_principal` = 1;

-- Trigger para asegurar que solo haya una sucursal principal
DELIMITER $$

DROP TRIGGER IF EXISTS `before_update_sucursal_principal`$$

CREATE TRIGGER `before_update_sucursal_principal`
BEFORE UPDATE ON `configuracion_sucursales`
FOR EACH ROW
BEGIN
  -- Si se está estableciendo esta sucursal como principal
  IF NEW.es_principal = 1 AND OLD.es_principal = 0 THEN
    -- Quitar el flag de principal a todas las demás
    UPDATE `configuracion_sucursales` 
    SET `es_principal` = 0 
    WHERE `id` != NEW.id AND `es_principal` = 1;
  END IF;
END$$

DELIMITER ;

-- Crear índice para búsqueda rápida de la sucursal principal
-- (Ignorar error si ya existe)
ALTER TABLE `configuracion_sucursales` 
ADD INDEX `idx_principal_activa` (`es_principal`, `activa`);

-- Mostrar resumen
SELECT 
  sucursal,
  CASE WHEN es_principal = 1 THEN '🏠 CASA PRINCIPAL' ELSE '📍 Sucursal' END as tipo,
  CASE WHEN activa = 1 THEN '✅ Activa' ELSE '❌ Inactiva' END as estado
FROM `configuracion_sucursales`
ORDER BY es_principal DESC, sucursal ASC;


