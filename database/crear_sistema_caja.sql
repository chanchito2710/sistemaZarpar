-- =====================================================
-- SISTEMA DE GESTIÓN DE CAJA
-- =====================================================
-- Descripción:
-- Sistema completo para gestionar el efectivo de cada sucursal
-- Registra ingresos automáticos desde POS y cuentas corrientes
-- Permite envíos de dinero y ajustes manuales
-- Mantiene historial completo de todos los movimientos
-- =====================================================

USE zarparDataBase;

-- =====================================================
-- TABLA 1: caja
-- Almacena el saldo actual de efectivo de cada sucursal
-- =====================================================
CREATE TABLE IF NOT EXISTS caja (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sucursal VARCHAR(50) NOT NULL UNIQUE,
  monto_actual DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_sucursal (sucursal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA 2: movimientos_caja
-- Historial completo de todos los movimientos de efectivo
-- =====================================================
CREATE TABLE IF NOT EXISTS movimientos_caja (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sucursal VARCHAR(50) NOT NULL,
  
  -- Tipo de movimiento
  tipo_movimiento ENUM(
    'ingreso_venta',              -- Ingreso desde venta POS con efectivo
    'ingreso_cuenta_corriente',   -- Ingreso desde pago de cuenta corriente con efectivo
    'envio',                      -- Envío de dinero (salida)
    'ajuste_manual'               -- Ajuste manual por administrador
  ) NOT NULL,
  
  -- Montos
  monto DECIMAL(10, 2) NOT NULL,           -- Monto del movimiento (+/-)
  monto_anterior DECIMAL(10, 2) NOT NULL,  -- Saldo antes del movimiento
  monto_nuevo DECIMAL(10, 2) NOT NULL,     -- Saldo después del movimiento
  
  -- Descripción y referencias
  concepto VARCHAR(255) NOT NULL,          -- Descripción del movimiento
  venta_id INT NULL,                       -- FK a tabla ventas (si aplica)
  pago_cuenta_corriente_id INT NULL,       -- FK a pagos_cuenta_corriente (si aplica)
  
  -- Usuario que realizó el movimiento
  usuario_id INT NULL,                     -- FK a vendedores
  usuario_email VARCHAR(100) NULL,         -- Email del usuario
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_sucursal (sucursal),
  INDEX idx_tipo_movimiento (tipo_movimiento),
  INDEX idx_created_at (created_at),
  INDEX idx_venta_id (venta_id),
  INDEX idx_pago_cc_id (pago_cuenta_corriente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INICIALIZAR CAJAS PARA TODAS LAS SUCURSALES EXISTENTES
-- =====================================================
-- Obtener todas las sucursales únicas y crear entrada con saldo inicial 0

INSERT IGNORE INTO caja (sucursal, monto_actual)
SELECT DISTINCT sucursal, 0.00
FROM productos_sucursal
WHERE sucursal IS NOT NULL AND sucursal != ''
ORDER BY sucursal;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 
  '✅ Tablas creadas exitosamente' as status,
  (SELECT COUNT(*) FROM caja) as cajas_inicializadas,
  (SELECT COUNT(*) FROM movimientos_caja) as movimientos_registrados;

SELECT * FROM caja ORDER BY sucursal;

