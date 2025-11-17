-- ========================================
-- MIGRACIÓN: Historial de Envíos de Stock de Fallas
-- ========================================
-- Descripción: Tabla para registrar todos los envíos de productos con fallas
-- Fecha: 2025-11-17
-- ========================================

USE zarparDataBase;

-- Tabla: historial_envios_fallas
CREATE TABLE IF NOT EXISTS historial_envios_fallas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Información del envío
  sucursal VARCHAR(50) NOT NULL COMMENT 'Sucursal que envía las fallas',
  fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora del envío',
  
  -- Usuario responsable
  usuario_id INT NULL COMMENT 'ID del usuario que realizó el envío',
  usuario_email VARCHAR(255) NULL COMMENT 'Email del usuario',
  
  -- Totales del envío
  total_productos INT DEFAULT 0 COMMENT 'Cantidad de productos diferentes',
  total_unidades INT DEFAULT 0 COMMENT 'Cantidad total de unidades enviadas',
  
  -- Observaciones
  observaciones TEXT NULL COMMENT 'Notas adicionales del envío',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_sucursal (sucursal),
  INDEX idx_fecha_envio (fecha_envio),
  INDEX idx_usuario_email (usuario_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historial de envíos de stock de fallas por sucursal';

-- Tabla: historial_envios_fallas_detalle
CREATE TABLE IF NOT EXISTS historial_envios_fallas_detalle (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Relación con el envío
  envio_id INT NOT NULL COMMENT 'ID del envío (FK a historial_envios_fallas)',
  
  -- Información del producto
  producto_id INT NOT NULL COMMENT 'ID del producto',
  producto_nombre VARCHAR(255) NOT NULL COMMENT 'Nombre del producto',
  producto_marca VARCHAR(100) NULL COMMENT 'Marca del producto',
  producto_tipo VARCHAR(100) NULL COMMENT 'Tipo del producto',
  
  -- Cantidad enviada
  cantidad INT NOT NULL COMMENT 'Cantidad de unidades enviadas',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (envio_id) REFERENCES historial_envios_fallas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  
  INDEX idx_envio_id (envio_id),
  INDEX idx_producto_id (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Detalle de productos en cada envío de fallas';

-- ========================================
-- Insertar datos de ejemplo (opcional)
-- ========================================
-- Puedes comentar esta sección si no quieres datos de ejemplo

-- INSERT INTO historial_envios_fallas 
-- (sucursal, usuario_email, total_productos, total_unidades, observaciones)
-- VALUES 
-- ('maldonado', 'admin@zarparuy.com', 5, 15, 'Envío de fallas mensual');

-- ========================================
-- Verificación
-- ========================================
SELECT 'Tabla historial_envios_fallas creada exitosamente' as status;
SELECT 'Tabla historial_envios_fallas_detalle creada exitosamente' as status;

