-- ============================================================
-- SCRIPT DE CREACIÓN DE TABLAS NUEVAS
-- Sistema Zarpar POS - Gestión de Cuenta Corriente y Ventas
-- Fecha: 29 de Octubre 2025
-- ============================================================

USE zarparDataBase;

-- ============================================================
-- TABLA 1: cuenta_corriente
-- ============================================================
CREATE TABLE IF NOT EXISTS cuenta_corriente (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Cliente
  cliente_id INT NOT NULL,
  sucursal VARCHAR(50) NOT NULL,
  
  -- Estado de aprobación
  estado ENUM('pendiente', 'aprobada', 'rechazada', 'suspendida') 
    DEFAULT 'pendiente',
  
  -- Límites y saldos
  limite_credito DECIMAL(10, 2) DEFAULT 0 
    COMMENT 'Monto máximo que puede deber',
  saldo_actual DECIMAL(10, 2) DEFAULT 0 
    COMMENT 'Cuánto debe actualmente',
  saldo_disponible DECIMAL(10, 2) GENERATED ALWAYS AS 
    (limite_credito - saldo_actual) STORED,
  
  -- Condiciones de pago
  dias_credito INT DEFAULT 30 
    COMMENT 'Días que tiene para pagar',
  fecha_vencimiento_cuenta DATE NULL 
    COMMENT 'Fecha límite para saldar cuenta',
  
  -- Control de morosidad
  es_moroso TINYINT(1) DEFAULT 0,
  dias_mora INT DEFAULT 0,
  monto_mora DECIMAL(10, 2) DEFAULT 0,
  
  -- Prórrogas
  tiene_prorroga TINYINT(1) DEFAULT 0,
  dias_prorroga INT DEFAULT 0,
  fecha_prorroga_vencimiento DATE NULL,
  motivo_prorroga TEXT NULL,
  
  -- Aprobación
  aprobada_por INT NULL COMMENT 'ID del gerente que aprobó',
  fecha_aprobacion TIMESTAMP NULL,
  rechazada_por INT NULL,
  fecha_rechazo TIMESTAMP NULL,
  motivo_rechazo TEXT NULL,
  
  -- Notas
  notas_internas TEXT NULL,
  
  -- Fechas
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_cliente (cliente_id),
  INDEX idx_sucursal (sucursal),
  INDEX idx_estado (estado),
  INDEX idx_moroso (es_moroso),
  UNIQUE KEY unique_cliente_sucursal (cliente_id, sucursal)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 
  COMMENT='Control de cuentas corrientes con sistema de aprobación';

-- ============================================================
-- TABLA 2: cuenta_corriente_historial
-- ============================================================
CREATE TABLE IF NOT EXISTS cuenta_corriente_historial (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cuenta_corriente_id INT NOT NULL,
  
  -- Tipo de movimiento
  tipo_movimiento ENUM(
    'solicitud',
    'aprobacion',
    'rechazo',
    'venta',
    'pago',
    'ajuste_limite',
    'prorroga_otorgada',
    'suspension',
    'reactivacion',
    'nota'
  ) NOT NULL,
  
  -- Detalles del movimiento
  monto_movimiento DECIMAL(10, 2) DEFAULT 0,
  saldo_anterior DECIMAL(10, 2) NOT NULL,
  saldo_nuevo DECIMAL(10, 2) NOT NULL,
  
  -- Referencias
  venta_id INT NULL,
  pago_id INT NULL,
  
  -- Usuario que realizó la acción
  realizado_por INT NULL COMMENT 'ID del vendedor/gerente',
  
  -- Descripción
  descripcion TEXT,
  detalles_json TEXT COMMENT 'Detalles adicionales en JSON',
  
  -- Fecha
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Key
  FOREIGN KEY (cuenta_corriente_id) 
    REFERENCES cuenta_corriente(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_cuenta (cuenta_corriente_id),
  INDEX idx_tipo (tipo_movimiento),
  INDEX idx_fecha (fecha),
  INDEX idx_venta (venta_id)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Historial completo de movimientos de cuenta corriente';

-- ============================================================
-- TABLA 3: ventas
-- ============================================================
CREATE TABLE IF NOT EXISTS ventas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  numero_venta VARCHAR(20) UNIQUE NOT NULL 
    COMMENT 'VT-2025-000001',
  
  -- Cliente y sucursal
  cliente_id INT NOT NULL,
  cliente_nombre VARCHAR(200) NOT NULL 
    COMMENT 'Por si se borra el cliente',
  sucursal VARCHAR(50) NOT NULL,
  
  -- Vendedor
  vendedor_id INT NOT NULL,
  vendedor_nombre VARCHAR(100) NOT NULL,
  
  -- Montos
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Descuento
  descuento_tipo ENUM('monto', 'porcentaje') DEFAULT 'monto',
  descuento_valor DECIMAL(10, 2) DEFAULT 0,
  descuento_monto DECIMAL(10, 2) DEFAULT 0,
  
  -- Total
  total DECIMAL(10, 2) NOT NULL,
  
  -- Método de pago
  metodo_pago ENUM('efectivo', 'transferencia', 'cuenta_corriente') NOT NULL,
  
  -- Control de morosidad (interno, no se muestra en PDF)
  cliente_era_moroso TINYINT(1) DEFAULT 0 
    COMMENT 'Si estaba moroso al momento de la venta',
  dias_mora_al_vender INT DEFAULT 0,
  
  -- Estado
  estado ENUM('completada', 'cancelada', 'pendiente_pago') DEFAULT 'completada',
  
  -- Cuenta corriente (si aplica)
  cuenta_corriente_id INT NULL,
  fecha_vencimiento_pago DATE NULL 
    COMMENT 'Si es cuenta corriente, cuándo vence',
  
  -- Notas
  notas_venta TEXT NULL,
  notas_internas TEXT NULL 
    COMMENT 'Notas que NO aparecen en el PDF',
  
  -- Fechas
  fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_cliente (cliente_id),
  INDEX idx_sucursal (sucursal),
  INDEX idx_vendedor (vendedor_id),
  INDEX idx_fecha (fecha_venta),
  INDEX idx_metodo_pago (metodo_pago),
  INDEX idx_estado (estado),
  INDEX idx_numero (numero_venta)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Registro de todas las ventas del sistema';

-- ============================================================
-- TABLA 4: ventas_detalle
-- ============================================================
CREATE TABLE IF NOT EXISTS ventas_detalle (
  id INT PRIMARY KEY AUTO_INCREMENT,
  venta_id INT NOT NULL,
  
  -- Producto
  producto_id INT NOT NULL,
  nombre_producto VARCHAR(200) NOT NULL,
  codigo_barras VARCHAR(100) NULL,
  
  -- Cantidades y precios
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Key
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_venta (venta_id),
  INDEX idx_producto (producto_id)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Detalle de productos por venta';

-- ============================================================
-- TABLA 5: pagos
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  numero_pago VARCHAR(20) UNIQUE NOT NULL 
    COMMENT 'PG-2025-000001',
  
  -- Cliente
  cliente_id INT NOT NULL,
  cliente_nombre VARCHAR(200) NOT NULL,
  sucursal VARCHAR(50) NOT NULL,
  
  -- Monto
  monto DECIMAL(10, 2) NOT NULL,
  
  -- Método de pago
  metodo_pago ENUM(
    'efectivo', 
    'transferencia', 
    'cheque', 
    'debito', 
    'credito', 
    'otros'
  ) NOT NULL,
  
  -- Referencias
  venta_id INT NULL 
    COMMENT 'Si es pago de una venta específica',
  cuenta_corriente_id INT NULL 
    COMMENT 'Abono a cuenta corriente',
  
  -- Recibido por
  recibido_por INT NOT NULL 
    COMMENT 'ID del vendedor que recibió el pago',
  
  -- Detalles
  concepto VARCHAR(255) NOT NULL,
  notas TEXT,
  referencia_bancaria VARCHAR(100) NULL 
    COMMENT 'Número de transferencia/cheque',
  
  -- Fecha
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_cliente (cliente_id),
  INDEX idx_sucursal (sucursal),
  INDEX idx_fecha (fecha_pago),
  INDEX idx_metodo (metodo_pago),
  INDEX idx_venta (venta_id),
  INDEX idx_cuenta_corriente (cuenta_corriente_id)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Registro de todos los pagos recibidos';

-- ============================================================
-- TABLA 6: notificaciones
-- ============================================================
CREATE TABLE IF NOT EXISTS notificaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Destinatario
  usuario_id INT NOT NULL 
    COMMENT 'ID del vendedor/gerente que debe ver la notificación',
  rol_destinatario ENUM('administrador', 'gerente', 'vendedor') NOT NULL,
  sucursal VARCHAR(50) NULL 
    COMMENT 'NULL si es para admin (todas las sucursales)',
  
  -- Tipo de notificación
  tipo ENUM(
    'solicitud_cuenta_corriente',
    'cliente_moroso',
    'limite_credito_excedido',
    'vencimiento_proximo',
    'pago_recibido',
    'prorroga_vencida',
    'general'
  ) NOT NULL,
  
  -- Contenido
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  
  -- Prioridad
  prioridad ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
  
  -- Estado
  leida TINYINT(1) DEFAULT 0,
  fecha_leida TIMESTAMP NULL,
  
  -- Referencias
  cliente_id INT NULL,
  cuenta_corriente_id INT NULL,
  venta_id INT NULL,
  
  -- Metadatos
  datos_adicionales TEXT 
    COMMENT 'JSON con información adicional',
  
  -- Fechas
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expira_en TIMESTAMP NULL 
    COMMENT 'Fecha en que la notificación ya no es relevante',
  
  -- Índices
  INDEX idx_usuario (usuario_id),
  INDEX idx_rol (rol_destinatario),
  INDEX idx_sucursal (sucursal),
  INDEX idx_tipo (tipo),
  INDEX idx_leida (leida),
  INDEX idx_fecha (fecha_creacion)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Sistema de notificaciones para usuarios';

-- ============================================================
-- TABLA 7: solicitudes_cuenta_corriente
-- ============================================================
CREATE TABLE IF NOT EXISTS solicitudes_cuenta_corriente (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Cliente
  cliente_id INT NOT NULL,
  sucursal VARCHAR(50) NOT NULL,
  
  -- Solicitante
  solicitado_por INT NOT NULL COMMENT 'ID del vendedor que solicita',
  
  -- Detalles de la solicitud
  limite_sugerido DECIMAL(10, 2) NOT NULL,
  dias_credito_sugeridos INT DEFAULT 30,
  justificacion TEXT NOT NULL,
  
  -- Estado
  estado ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
  
  -- Respuesta
  respondido_por INT NULL COMMENT 'ID del gerente que respondió',
  fecha_respuesta TIMESTAMP NULL,
  motivo_respuesta TEXT NULL,
  
  -- Límite aprobado (puede ser diferente al sugerido)
  limite_aprobado DECIMAL(10, 2) NULL,
  dias_aprobados INT NULL,
  
  -- Fechas
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_cliente (cliente_id),
  INDEX idx_sucursal (sucursal),
  INDEX idx_estado (estado),
  INDEX idx_solicitado_por (solicitado_por),
  INDEX idx_respondido_por (respondido_por)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Solicitudes de cuenta corriente pendientes de aprobación';

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================

