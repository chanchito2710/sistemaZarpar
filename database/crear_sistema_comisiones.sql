-- ============================================
-- SISTEMA DE COMISIONES - ZARPAR
-- Fecha: 04 de Noviembre, 2025
-- ============================================

USE zarparDataBase;

-- ============================================
-- 1. TABLA: configuracion_comisiones
-- Almacena los montos de comisión por tipo de producto
-- ============================================
CREATE TABLE IF NOT EXISTS configuracion_comisiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  monto_comision DECIMAL(10,2) NOT NULL DEFAULT 0,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_tipo (tipo),
  INDEX idx_tipo (tipo),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos iniciales desde tipos existentes en productos
INSERT IGNORE INTO configuracion_comisiones (tipo, monto_comision)
SELECT DISTINCT p.tipo, 
  CASE 
    WHEN p.tipo = 'Display' THEN 150.00
    WHEN p.tipo = 'Batería' THEN 100.00
    WHEN p.tipo = 'Flex' THEN 50.00
    WHEN p.tipo = 'Placa Carga' THEN 50.00
    WHEN p.tipo = 'Botón' THEN 30.00
    WHEN p.tipo = 'Antena' THEN 30.00
    ELSE 0.00
  END as monto
FROM productos p
WHERE p.tipo IS NOT NULL AND p.tipo != '';

-- ============================================
-- 2. TABLA: comisiones_vendedores
-- Registra cada comisión generada (APPEND-ONLY)
-- ============================================
CREATE TABLE IF NOT EXISTS comisiones_vendedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendedor_id INT NOT NULL,
  venta_id INT NULL,
  pago_cuenta_corriente_id INT NULL,
  cliente_id INT NOT NULL,
  sucursal VARCHAR(50) NOT NULL,
  producto_id INT NOT NULL,
  producto_nombre VARCHAR(255) NOT NULL,
  tipo_producto VARCHAR(50) NOT NULL,
  cantidad INT DEFAULT 1,
  monto_comision DECIMAL(10,2) NOT NULL,
  monto_cobrado DECIMAL(10,2) DEFAULT 0,
  monto_pendiente DECIMAL(10,2) NOT NULL,
  fecha_comision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_cobro TIMESTAMP NULL,
  estado ENUM('pendiente', 'parcial', 'pagada', 'cancelada') DEFAULT 'pendiente',
  notas TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id),
  FOREIGN KEY (venta_id) REFERENCES ventas(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  INDEX idx_vendedor_fecha (vendedor_id, fecha_comision),
  INDEX idx_sucursal_fecha (sucursal, fecha_comision),
  INDEX idx_cliente (cliente_id),
  INDEX idx_estado (estado),
  INDEX idx_venta (venta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. TABLA: remanentes_comisiones
-- Almacena remanentes pendientes por aplicar
-- ============================================
CREATE TABLE IF NOT EXISTS remanentes_comisiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendedor_id INT NOT NULL,
  cliente_id INT NOT NULL,
  sucursal VARCHAR(50) NOT NULL,
  monto_remanente DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_vendedor_cliente (vendedor_id, cliente_id, sucursal),
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id),
  INDEX idx_vendedor (vendedor_id),
  INDEX idx_cliente (cliente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TABLA: historial_cambios_comisiones
-- Auditoría de cambios en configuración
-- ============================================
CREATE TABLE IF NOT EXISTS historial_cambios_comisiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  configuracion_comision_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  monto_anterior DECIMAL(10,2) NOT NULL,
  monto_nuevo DECIMAL(10,2) NOT NULL,
  usuario_id INT NULL,
  usuario_email VARCHAR(100) NULL,
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  motivo TEXT NULL,
  FOREIGN KEY (configuracion_comision_id) REFERENCES configuracion_comisiones(id),
  INDEX idx_fecha (fecha_cambio),
  INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. TABLA: historial_pagos_comisiones
-- Tracking completo de pagos parciales
-- ============================================
CREATE TABLE IF NOT EXISTS historial_pagos_comisiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  comision_id INT NOT NULL,
  pago_cuenta_corriente_id INT NULL,
  monto_pagado DECIMAL(10,2) NOT NULL,
  monto_pendiente_antes DECIMAL(10,2) NOT NULL,
  monto_pendiente_despues DECIMAL(10,2) NOT NULL,
  remanente_usado DECIMAL(10,2) DEFAULT 0,
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notas TEXT NULL,
  FOREIGN KEY (comision_id) REFERENCES comisiones_vendedores(id),
  INDEX idx_comision (comision_id),
  INDEX idx_fecha (fecha_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Tablas creadas exitosamente:' as mensaje;
SHOW TABLES LIKE '%comision%';
SHOW TABLES LIKE '%remanent%';

SELECT 'Configuración inicial de comisiones:' as mensaje;
SELECT * FROM configuracion_comisiones ORDER BY monto_comision DESC;

