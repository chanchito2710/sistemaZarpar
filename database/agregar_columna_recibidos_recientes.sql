-- ====================================================================
-- Script: Agregar Columna RECIBIDOS_RECIENTES a productos_sucursal
-- Propósito: Indicador visual de mercadería recién recibida
-- Fecha: 11/11/2025
-- Sistema: ZARPAR 3.0
-- ====================================================================

USE zarparDataBase;

-- Agregar columna para indicar unidades recién recibidas
ALTER TABLE productos_sucursal 
ADD COLUMN recibidos_recientes INT DEFAULT 0 
COMMENT 'Cantidad de unidades recién recibidas (indicador temporal)';

-- Agregar columna para timestamp de última recepción
ALTER TABLE productos_sucursal 
ADD COLUMN fecha_ultima_recepcion TIMESTAMP NULL 
COMMENT 'Fecha y hora de la última recepción de mercadería';

-- Crear índice para optimizar consultas de auto-limpieza
CREATE INDEX idx_fecha_ultima_recepcion ON productos_sucursal(fecha_ultima_recepcion);

-- Verificar que se agregaron las columnas
DESCRIBE productos_sucursal;

-- ====================================================================
-- Notas:
-- - recibidos_recientes: Se suma cuando llega mercadería desde Transfer
-- - fecha_ultima_recepcion: Se actualiza con cada recepción
-- - Auto-limpieza: Después de 48 horas, recibidos_recientes vuelve a 0
-- - Limpieza manual: Usuario puede confirmar recepción antes de 48h
-- ====================================================================

