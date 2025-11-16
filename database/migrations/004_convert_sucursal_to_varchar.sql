-- ============================================
-- MIGRACIÓN 004: Convertir ENUM de sucursales a VARCHAR
-- Sistema ZARPAR - Soporte para Sucursales Dinámicas
-- Fecha: 16 de Noviembre, 2025
-- ============================================
-- 
-- PROBLEMA:
-- La tabla productos_sucursal tiene un ENUM con sucursales hardcodeadas.
-- Esto impide crear productos en sucursales nuevas creadas dinámicamente.
-- 
-- SOLUCIÓN:
-- Convertir el campo 'sucursal' de ENUM a VARCHAR(50) para permitir
-- cualquier sucursal creada desde el sistema dinámico.
-- ============================================

USE zarparDataBase;

-- ============================================
-- 1. CONVERTIR productos_sucursal.sucursal a VARCHAR
-- ============================================
ALTER TABLE productos_sucursal 
MODIFY COLUMN sucursal VARCHAR(50) NOT NULL COMMENT 'Nombre de la sucursal (dinámico)';

-- Verificar cambio
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'zarparDataBase'
  AND TABLE_NAME = 'productos_sucursal'
  AND COLUMN_NAME = 'sucursal';

-- ============================================
-- 2. RECREAR ÍNDICE (si es necesario)
-- ============================================
-- El índice se mantiene automáticamente, lo verificamos aquí

-- Verificar índices existentes
SHOW INDEX FROM productos_sucursal WHERE Key_name = 'idx_sucursal';

-- ============================================
-- 3. VERIFICACIÓN FINAL
-- ============================================
-- Verificar que todos los registros existentes siguen funcionando

SELECT 
  sucursal,
  COUNT(*) as total_productos
FROM productos_sucursal
GROUP BY sucursal
ORDER BY sucursal;

-- ============================================
-- ✅ MIGRACIÓN COMPLETADA
-- ============================================
-- Ahora cualquier sucursal nueva creada dinámicamente podrá:
-- 1. Tener productos asignados
-- 2. Manejar stock independiente
-- 3. Tener precios propios
-- 
-- El sistema es 100% dinámico y escalable.
-- ============================================

