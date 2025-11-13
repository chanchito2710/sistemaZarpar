-- =============================================
-- TABLA: historial_stock
-- DESCRIPCIÓN: Registra todos los cambios en el stock de productos
-- =============================================

CREATE TABLE IF NOT EXISTS historial_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sucursal VARCHAR(50) NOT NULL,
  producto_id INT NOT NULL,
  producto_nombre VARCHAR(255) NOT NULL,
  cliente_id INT NULL,
  cliente_nombre VARCHAR(255) NULL,
  stock_anterior INT NOT NULL DEFAULT 0,
  stock_nuevo INT NOT NULL DEFAULT 0,
  stock_fallas_anterior INT NOT NULL DEFAULT 0,
  stock_fallas_nuevo INT NOT NULL DEFAULT 0,
  tipo_movimiento ENUM(
    'venta',
    'devolucion_stock_principal',
    'devolucion_stock_fallas',
    'reemplazo',
    'ajuste_manual',
    'transferencia_entrada',
    'transferencia_salida'
  ) NOT NULL,
  referencia VARCHAR(255) NULL COMMENT 'N° de venta, ajuste o transferencia',
  usuario_email VARCHAR(255) NOT NULL,
  observaciones TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_sucursal (sucursal),
  INDEX idx_producto_id (producto_id),
  INDEX idx_cliente_id (cliente_id),
  INDEX idx_tipo_movimiento (tipo_movimiento),
  INDEX idx_usuario_email (usuario_email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Historial de movimientos de stock por producto y sucursal';


