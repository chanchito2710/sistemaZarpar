-- ============================================================
-- SISTEMA ZARPAR - TABLAS PARA VENTAS Y CUENTA CORRIENTE
-- Descripción: Tablas para gestionar ventas, pagos y estados de cuenta
-- ============================================================

USE zarparDataBase;

-- ============================================================
-- TABLA: ventas
-- Descripción: Registra todas las ventas realizadas en cada sucursal
-- ============================================================
CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_venta VARCHAR(50) UNIQUE NOT NULL COMMENT 'Número único de venta (ej: PANDO-2025-0001)',
  sucursal VARCHAR(50) NOT NULL COMMENT 'Sucursal donde se realizó la venta',
  cliente_id INT NOT NULL COMMENT 'ID del cliente (dinámico según sucursal)',
  cliente_nombre VARCHAR(200) NOT NULL COMMENT 'Nombre completo del cliente (cache)',
  vendedor_id INT NOT NULL COMMENT 'ID del vendedor',
  vendedor_nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del vendedor (cache)',
  
  -- Montos
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Subtotal antes de descuentos',
  descuento DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Monto del descuento aplicado',
  total DECIMAL(12,2) NOT NULL COMMENT 'Total a pagar',
  
  -- Método de pago
  metodo_pago ENUM('efectivo', 'transferencia', 'cuenta_corriente') NOT NULL COMMENT 'Método de pago utilizado',
  
  -- Estado de pago (para cuenta corriente)
  estado_pago ENUM('pagado', 'pendiente', 'parcial') NOT NULL DEFAULT 'pagado' COMMENT 'Estado del pago',
  saldo_pendiente DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Saldo pendiente (para cuenta corriente)',
  
  -- Fechas
  fecha_venta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de la venta',
  fecha_vencimiento DATE NULL COMMENT 'Fecha de vencimiento (para cuenta corriente)',
  
  -- Observaciones
  observaciones TEXT NULL COMMENT 'Observaciones adicionales',
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_sucursal (sucursal),
  INDEX idx_cliente (cliente_id),
  INDEX idx_vendedor (vendedor_id),
  INDEX idx_fecha (fecha_venta),
  INDEX idx_metodo_pago (metodo_pago),
  INDEX idx_estado_pago (estado_pago),
  INDEX idx_numero_venta (numero_venta),
  
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de ventas del sistema';

-- ============================================================
-- TABLA: ventas_detalle
-- Descripción: Detalle de productos vendidos en cada venta
-- ============================================================
CREATE TABLE IF NOT EXISTS ventas_detalle (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL COMMENT 'ID de la venta',
  producto_id INT NOT NULL COMMENT 'ID del producto',
  
  -- Información del producto (cache)
  producto_nombre VARCHAR(200) NOT NULL COMMENT 'Nombre del producto',
  producto_marca VARCHAR(100) NULL COMMENT 'Marca del producto',
  producto_codigo VARCHAR(100) NULL COMMENT 'Código del producto',
  
  -- Cantidades y precios
  cantidad INT NOT NULL COMMENT 'Cantidad vendida',
  precio_unitario DECIMAL(10,2) NOT NULL COMMENT 'Precio unitario al momento de la venta',
  subtotal DECIMAL(12,2) NOT NULL COMMENT 'Subtotal (cantidad * precio_unitario)',
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_venta (venta_id),
  INDEX idx_producto (producto_id),
  
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detalle de productos en cada venta';

-- ============================================================
-- TABLA: cuenta_corriente_movimientos
-- Descripción: Movimientos de cuenta corriente (ventas y pagos)
-- ============================================================
CREATE TABLE IF NOT EXISTS cuenta_corriente_movimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sucursal VARCHAR(50) NOT NULL COMMENT 'Sucursal',
  cliente_id INT NOT NULL COMMENT 'ID del cliente',
  cliente_nombre VARCHAR(200) NOT NULL COMMENT 'Nombre del cliente (cache)',
  
  -- Tipo de movimiento
  tipo ENUM('venta', 'pago', 'ajuste') NOT NULL COMMENT 'Tipo de movimiento',
  
  -- Montos
  debe DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Monto que debe el cliente (ventas)',
  haber DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Monto que paga el cliente (pagos)',
  saldo DECIMAL(12,2) NOT NULL COMMENT 'Saldo acumulado después del movimiento',
  
  -- Referencias
  venta_id INT NULL COMMENT 'ID de la venta relacionada (si aplica)',
  pago_id INT NULL COMMENT 'ID del pago relacionado (si aplica)',
  
  -- Descripción
  descripcion TEXT NULL COMMENT 'Descripción del movimiento',
  
  -- Fechas
  fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del movimiento',
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_sucursal (sucursal),
  INDEX idx_cliente (cliente_id),
  INDEX idx_tipo (tipo),
  INDEX idx_fecha (fecha_movimiento),
  INDEX idx_venta (venta_id),
  INDEX idx_pago (pago_id),
  
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Movimientos de cuenta corriente';

-- ============================================================
-- TABLA: pagos_cuenta_corriente
-- Descripción: Registra pagos realizados por clientes en cuenta corriente
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos_cuenta_corriente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sucursal VARCHAR(50) NOT NULL COMMENT 'Sucursal',
  cliente_id INT NOT NULL COMMENT 'ID del cliente',
  cliente_nombre VARCHAR(200) NOT NULL COMMENT 'Nombre del cliente (cache)',
  
  -- Monto del pago
  monto DECIMAL(12,2) NOT NULL COMMENT 'Monto del pago',
  
  -- Método de pago del abono
  metodo_pago ENUM('efectivo', 'transferencia') NOT NULL COMMENT 'Cómo pagó el abono',
  
  -- Referencias
  comprobante VARCHAR(100) NULL COMMENT 'Número de comprobante o referencia',
  
  -- Descripción
  observaciones TEXT NULL COMMENT 'Observaciones del pago',
  
  -- Fechas
  fecha_pago DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del pago',
  
  -- Auditoría
  created_by VARCHAR(100) NULL COMMENT 'Usuario que registró el pago',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_sucursal (sucursal),
  INDEX idx_cliente (cliente_id),
  INDEX idx_fecha (fecha_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pagos de cuenta corriente';

-- ============================================================
-- VISTA: resumen_cuenta_corriente
-- Descripción: Vista para obtener el saldo actual de cada cliente
-- ============================================================
CREATE OR REPLACE VIEW resumen_cuenta_corriente AS
SELECT 
  sucursal,
  cliente_id,
  cliente_nombre,
  SUM(debe) as total_debe,
  SUM(haber) as total_haber,
  (SUM(debe) - SUM(haber)) as saldo_actual,
  MAX(fecha_movimiento) as ultimo_movimiento
FROM cuenta_corriente_movimientos
GROUP BY sucursal, cliente_id, cliente_nombre;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================

















