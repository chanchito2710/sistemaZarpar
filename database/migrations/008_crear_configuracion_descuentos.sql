-- ============================================
-- MIGRACIÓN 008: Crear tabla configuracion_descuentos_sucursal
-- ============================================
-- Fecha: 2025-11-17
-- Descripción: Crea la tabla para gestionar la habilitación/deshabilitación
--              de descuentos por sucursal desde la página de Staff.
-- ============================================

USE zarparDataBase;

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS `configuracion_descuentos_sucursal` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sucursal` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descuento_habilitado` TINYINT(1) DEFAULT 0 COMMENT 'Si los descuentos están habilitados para esta sucursal (0=NO, 1=SÍ)',
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  `updated_by` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email del usuario que hizo el último cambio',
  PRIMARY KEY (`id`),
  UNIQUE KEY `sucursal` (`sucursal`),
  KEY `idx_sucursal` (`sucursal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuración de descuentos por sucursal';

-- Insertar configuraciones iniciales para todas las sucursales existentes
-- (Solo si no existen ya)
INSERT IGNORE INTO `configuracion_descuentos_sucursal` (`sucursal`, `descuento_habilitado`) VALUES
('pando', 0),
('maldonado', 0),
('rivera', 0),
('melo', 0),
('paysandu', 0),
('salto', 0),
('tacuarembo', 0),
('rionegro', 0),
('sanisidro', 0),
('soriano', 0);

-- Verificación
SELECT COUNT(*) as total_configuraciones FROM `configuracion_descuentos_sucursal`;

