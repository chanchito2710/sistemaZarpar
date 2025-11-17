-- ========================================
-- EJECUTAR DIRECTAMENTE EN RAILWAY
-- ========================================
-- Copiar y pegar este SQL en Railway Query
-- ========================================

-- 1. Agregar 'devolucion' al ENUM
ALTER TABLE cuenta_corriente_movimientos 
MODIFY COLUMN tipo ENUM('venta', 'pago', 'ajuste', 'devolucion') NOT NULL;

-- 2. Verificar que se aplicó
SHOW COLUMNS FROM cuenta_corriente_movimientos LIKE 'tipo';

-- 3. Registrar migración como ejecutada (si tienes la tabla)
-- INSERT INTO migraciones (nombre) VALUES ('006_agregar_devolucion_tipo_enum')
-- ON DUPLICATE KEY UPDATE nombre=nombre;

