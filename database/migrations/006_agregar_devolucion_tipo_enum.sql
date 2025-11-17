-- ========================================
-- MIGRACIÓN: Agregar 'devolucion' al ENUM de tipo en cuenta_corriente_movimientos
-- ========================================
-- Descripción: Permite registrar devoluciones en cuenta corriente
-- Fecha: 2025-11-17
-- ========================================

USE zarparDataBase;

-- Modificar columna 'tipo' para incluir 'devolucion'
ALTER TABLE cuenta_corriente_movimientos 
MODIFY COLUMN tipo ENUM('venta', 'pago', 'ajuste', 'devolucion') NOT NULL
COMMENT 'Tipo de movimiento: venta (DEBE), pago (HABER), ajuste (manual), devolucion (HABER)';

-- ========================================
-- Verificación
-- ========================================
SELECT 'Columna tipo actualizada con devolucion' as status;
SHOW COLUMNS FROM cuenta_corriente_movimientos LIKE 'tipo';

