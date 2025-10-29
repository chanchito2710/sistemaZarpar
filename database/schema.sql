-- ============================================================
-- SISTEMA ZARPAR IMPORTACIONES URUGUAY
-- Base de Datos: zarparEcommerce
-- Descripción: Sistema de gestión completo para comercio de repuestos de celulares
-- Fecha de creación: 2025
-- ============================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS zarparEcommerce
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE zarparEcommerce;

-- ============================================================
-- TABLAS DE USUARIOS Y AUTENTICACIÓN
-- ============================================================

-- Tabla de roles de usuario
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre del rol (admin, vendedor, gerente, etc.)',
  descripcion TEXT COMMENT 'Descripción del rol',
  permisos JSON COMMENT 'Permisos del rol en formato JSON',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Roles de usuario del sistema';

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre completo del usuario',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email del usuario',
  password VARCHAR(255) NOT NULL COMMENT 'Contraseña encriptada',
  telefono VARCHAR(20) COMMENT 'Teléfono de contacto',
  rol_id INT NOT NULL COMMENT 'ID del rol asignado',
  sucursal_id INT COMMENT 'ID de la sucursal asignada',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Estado del usuario',
  ultimo_acceso TIMESTAMP NULL COMMENT 'Último acceso al sistema',
  avatar_url VARCHAR(255) COMMENT 'URL del avatar del usuario',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios del sistema';

-- ============================================================
-- TABLAS DE CONFIGURACIÓN DE EMPRESA
-- ============================================================

-- Tabla de sucursales
CREATE TABLE IF NOT EXISTS sucursales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre de la sucursal',
  codigo VARCHAR(20) NOT NULL UNIQUE COMMENT 'Código único de la sucursal',
  direccion TEXT COMMENT 'Dirección completa',
  ciudad VARCHAR(50) COMMENT 'Ciudad',
  departamento VARCHAR(50) COMMENT 'Departamento/Estado',
  telefono VARCHAR(20) COMMENT 'Teléfono de contacto',
  email VARCHAR(100) COMMENT 'Email de contacto',
  gerente_id INT COMMENT 'ID del gerente responsable',
  activa BOOLEAN DEFAULT TRUE COMMENT 'Estado de la sucursal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (gerente_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sucursales de ZARPAR';

-- ============================================================
-- TABLAS DE PRODUCTOS Y CATEGORÍAS
-- ============================================================

-- Tabla de categorías de productos
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre de la categoría',
  descripcion TEXT COMMENT 'Descripción de la categoría',
  categoria_padre_id INT NULL COMMENT 'ID de la categoría padre (para subcategorías)',
  icono VARCHAR(50) COMMENT 'Nombre del icono',
  orden INT DEFAULT 0 COMMENT 'Orden de visualización',
  activa BOOLEAN DEFAULT TRUE COMMENT 'Estado de la categoría',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_padre_id) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Categorías de productos';

-- Tabla de marcas
CREATE TABLE IF NOT EXISTS marcas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre de la marca',
  descripcion TEXT COMMENT 'Descripción de la marca',
  logo_url VARCHAR(255) COMMENT 'URL del logo de la marca',
  activa BOOLEAN DEFAULT TRUE COMMENT 'Estado de la marca',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Marcas de productos';

-- Tabla de modelos de celulares
CREATE TABLE IF NOT EXISTS modelos_celular (
  id INT AUTO_INCREMENT PRIMARY KEY,
  marca_id INT NOT NULL COMMENT 'ID de la marca',
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del modelo',
  codigo VARCHAR(50) UNIQUE COMMENT 'Código único del modelo',
  descripcion TEXT COMMENT 'Descripción del modelo',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Estado del modelo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Modelos de celulares';

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único del producto (SKU)',
  nombre VARCHAR(200) NOT NULL COMMENT 'Nombre del producto',
  descripcion TEXT COMMENT 'Descripción detallada',
  categoria_id INT COMMENT 'ID de la categoría',
  marca_id INT COMMENT 'ID de la marca',
  modelo_celular_id INT COMMENT 'ID del modelo de celular compatible',
  precio_compra DECIMAL(10, 2) NOT NULL DEFAULT 0 COMMENT 'Precio de compra',
  precio_venta DECIMAL(10, 2) NOT NULL DEFAULT 0 COMMENT 'Precio de venta',
  precio_mayorista DECIMAL(10, 2) COMMENT 'Precio para mayoristas',
  stock_minimo INT DEFAULT 5 COMMENT 'Stock mínimo para alertas',
  unidad_medida VARCHAR(20) DEFAULT 'unidad' COMMENT 'Unidad de medida',
  imagen_url VARCHAR(255) COMMENT 'URL de la imagen principal',
  imagenes JSON COMMENT 'Array de URLs de imágenes adicionales',
  peso DECIMAL(8, 3) COMMENT 'Peso del producto en kg',
  dimensiones VARCHAR(50) COMMENT 'Dimensiones del producto',
  palabras_clave TEXT COMMENT 'Palabras clave para SEO',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Estado del producto',
  destacado BOOLEAN DEFAULT FALSE COMMENT 'Producto destacado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE SET NULL,
  FOREIGN KEY (modelo_celular_id) REFERENCES modelos_celular(id) ON DELETE SET NULL,
  INDEX idx_codigo (codigo),
  INDEX idx_nombre (nombre),
  FULLTEXT INDEX idx_busqueda (nombre, descripcion, palabras_clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Productos del sistema';

-- ============================================================
-- TABLAS DE INVENTARIO
-- ============================================================

-- Tabla de inventario por sucursal
CREATE TABLE IF NOT EXISTS inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL COMMENT 'ID del producto',
  sucursal_id INT NOT NULL COMMENT 'ID de la sucursal',
  cantidad INT NOT NULL DEFAULT 0 COMMENT 'Cantidad disponible',
  ubicacion VARCHAR(50) COMMENT 'Ubicación física en la sucursal',
  ultimo_conteo TIMESTAMP NULL COMMENT 'Fecha del último conteo físico',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE CASCADE,
  UNIQUE KEY unique_producto_sucursal (producto_id, sucursal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Inventario por sucursal';

-- Tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL COMMENT 'ID del producto',
  sucursal_id INT NOT NULL COMMENT 'ID de la sucursal',
  tipo_movimiento ENUM('entrada', 'salida', 'transferencia', 'ajuste', 'devolucion') NOT NULL COMMENT 'Tipo de movimiento',
  cantidad INT NOT NULL COMMENT 'Cantidad movida',
  cantidad_anterior INT NOT NULL COMMENT 'Cantidad antes del movimiento',
  cantidad_nueva INT NOT NULL COMMENT 'Cantidad después del movimiento',
  motivo VARCHAR(200) COMMENT 'Motivo del movimiento',
  referencia VARCHAR(100) COMMENT 'Número de referencia (factura, transferencia, etc.)',
  usuario_id INT NOT NULL COMMENT 'Usuario que realizó el movimiento',
  sucursal_destino_id INT COMMENT 'ID de sucursal destino (para transferencias)',
  costo_unitario DECIMAL(10, 2) COMMENT 'Costo unitario del producto en el momento',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
  FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  FOREIGN KEY (sucursal_destino_id) REFERENCES sucursales(id) ON DELETE SET NULL,
  INDEX idx_fecha (created_at),
  INDEX idx_producto (producto_id),
  INDEX idx_tipo (tipo_movimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial de movimientos de inventario';

-- ============================================================
-- TABLAS DE CLIENTES
-- ============================================================

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_cliente ENUM('minorista', 'mayorista', 'distribuidor') DEFAULT 'minorista' COMMENT 'Tipo de cliente',
  tipo_documento ENUM('CI', 'RUT', 'pasaporte', 'otro') DEFAULT 'CI' COMMENT 'Tipo de documento',
  numero_documento VARCHAR(50) NOT NULL UNIQUE COMMENT 'Número de documento',
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre completo o razón social',
  email VARCHAR(100) COMMENT 'Email del cliente',
  telefono VARCHAR(20) COMMENT 'Teléfono principal',
  telefono_alternativo VARCHAR(20) COMMENT 'Teléfono alternativo',
  direccion TEXT COMMENT 'Dirección completa',
  ciudad VARCHAR(50) COMMENT 'Ciudad',
  departamento VARCHAR(50) COMMENT 'Departamento',
  limite_credito DECIMAL(12, 2) DEFAULT 0 COMMENT 'Límite de crédito autorizado',
  descuento_predeterminado DECIMAL(5, 2) DEFAULT 0 COMMENT 'Descuento predeterminado (%)',
  observaciones TEXT COMMENT 'Observaciones sobre el cliente',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Estado del cliente',
  fecha_registro DATE NOT NULL COMMENT 'Fecha de registro',
  ultima_compra TIMESTAMP NULL COMMENT 'Fecha de la última compra',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_documento (numero_documento),
  INDEX idx_nombre (nombre),
  INDEX idx_tipo (tipo_cliente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes del sistema';

-- ============================================================
-- TABLAS DE VENTAS
-- ============================================================

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_factura VARCHAR(50) NOT NULL UNIQUE COMMENT 'Número de factura',
  tipo_venta ENUM('contado', 'credito', 'cuenta_corriente') DEFAULT 'contado' COMMENT 'Tipo de venta',
  cliente_id INT NOT NULL COMMENT 'ID del cliente',
  sucursal_id INT NOT NULL COMMENT 'ID de la sucursal',
  vendedor_id INT NOT NULL COMMENT 'ID del vendedor',
  fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de la venta',
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0 COMMENT 'Subtotal antes de descuentos',
  descuento DECIMAL(12, 2) DEFAULT 0 COMMENT 'Descuento aplicado',
  iva DECIMAL(12, 2) DEFAULT 0 COMMENT 'IVA aplicado',
  total DECIMAL(12, 2) NOT NULL DEFAULT 0 COMMENT 'Total de la venta',
  metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'cheque', 'mixto', 'credito') NOT NULL COMMENT 'Método de pago',
  estado ENUM('pendiente', 'pagado', 'parcial', 'anulado') DEFAULT 'pagado' COMMENT 'Estado de la venta',
  observaciones TEXT COMMENT 'Observaciones de la venta',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
  FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT,
  FOREIGN KEY (vendedor_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_fecha (fecha_venta),
  INDEX idx_numero_factura (numero_factura),
  INDEX idx_cliente (cliente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ventas realizadas';

-- Tabla de detalle de ventas
CREATE TABLE IF NOT EXISTS detalle_ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL COMMENT 'ID de la venta',
  producto_id INT NOT NULL COMMENT 'ID del producto',
  cantidad INT NOT NULL COMMENT 'Cantidad vendida',
  precio_unitario DECIMAL(10, 2) NOT NULL COMMENT 'Precio unitario en el momento de la venta',
  descuento DECIMAL(10, 2) DEFAULT 0 COMMENT 'Descuento aplicado al producto',
  subtotal DECIMAL(12, 2) NOT NULL COMMENT 'Subtotal de la línea',
  costo_unitario DECIMAL(10, 2) COMMENT 'Costo del producto (para calcular margen)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
  INDEX idx_venta (venta_id),
  INDEX idx_producto (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detalle de las ventas';

-- Tabla de devoluciones
CREATE TABLE IF NOT EXISTS devoluciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL COMMENT 'ID de la venta original',
  numero_devolucion VARCHAR(50) NOT NULL UNIQUE COMMENT 'Número de devolución',
  fecha_devolucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de la devolución',
  motivo TEXT NOT NULL COMMENT 'Motivo de la devolución',
  total_devolucion DECIMAL(12, 2) NOT NULL COMMENT 'Total de la devolución',
  usuario_id INT NOT NULL COMMENT 'Usuario que procesó la devolución',
  estado ENUM('pendiente', 'aprobada', 'rechazada', 'procesada') DEFAULT 'pendiente' COMMENT 'Estado de la devolución',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE RESTRICT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_fecha (fecha_devolucion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Devoluciones de productos';

-- Tabla de detalle de devoluciones
CREATE TABLE IF NOT EXISTS detalle_devoluciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  devolucion_id INT NOT NULL COMMENT 'ID de la devolución',
  producto_id INT NOT NULL COMMENT 'ID del producto',
  cantidad INT NOT NULL COMMENT 'Cantidad devuelta',
  precio_unitario DECIMAL(10, 2) NOT NULL COMMENT 'Precio unitario del producto',
  subtotal DECIMAL(12, 2) NOT NULL COMMENT 'Subtotal de la línea',
  motivo_detalle TEXT COMMENT 'Motivo específico del producto',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (devolucion_id) REFERENCES devoluciones(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detalle de devoluciones';

-- ============================================================
-- TABLAS DE FINANZAS
-- ============================================================

-- Tabla de cajas
CREATE TABLE IF NOT EXISTS cajas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre de la caja',
  sucursal_id INT NOT NULL COMMENT 'ID de la sucursal',
  saldo_actual DECIMAL(12, 2) NOT NULL DEFAULT 0 COMMENT 'Saldo actual de la caja',
  estado ENUM('abierta', 'cerrada') DEFAULT 'cerrada' COMMENT 'Estado de la caja',
  fecha_apertura TIMESTAMP NULL COMMENT 'Fecha de apertura',
  fecha_cierre TIMESTAMP NULL COMMENT 'Fecha de cierre',
  usuario_apertura_id INT COMMENT 'Usuario que abrió la caja',
  usuario_cierre_id INT COMMENT 'Usuario que cerró la caja',
  saldo_inicial DECIMAL(12, 2) COMMENT 'Saldo inicial en la apertura',
  saldo_final DECIMAL(12, 2) COMMENT 'Saldo final en el cierre',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT,
  FOREIGN KEY (usuario_apertura_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_cierre_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cajas de las sucursales';

-- Tabla de movimientos de caja
CREATE TABLE IF NOT EXISTS movimientos_caja (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caja_id INT NOT NULL COMMENT 'ID de la caja',
  tipo_movimiento ENUM('ingreso', 'egreso') NOT NULL COMMENT 'Tipo de movimiento',
  concepto VARCHAR(200) NOT NULL COMMENT 'Concepto del movimiento',
  monto DECIMAL(12, 2) NOT NULL COMMENT 'Monto del movimiento',
  metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'cheque') NOT NULL COMMENT 'Método de pago',
  referencia VARCHAR(100) COMMENT 'Referencia (número de factura, etc.)',
  usuario_id INT NOT NULL COMMENT 'Usuario que realizó el movimiento',
  venta_id INT COMMENT 'ID de la venta asociada (si aplica)',
  saldo_anterior DECIMAL(12, 2) NOT NULL COMMENT 'Saldo antes del movimiento',
  saldo_nuevo DECIMAL(12, 2) NOT NULL COMMENT 'Saldo después del movimiento',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (caja_id) REFERENCES cajas(id) ON DELETE RESTRICT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE SET NULL,
  INDEX idx_fecha (created_at),
  INDEX idx_tipo (tipo_movimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Movimientos de caja';

-- Tabla de bancos
CREATE TABLE IF NOT EXISTS bancos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del banco',
  numero_cuenta VARCHAR(50) NOT NULL UNIQUE COMMENT 'Número de cuenta',
  tipo_cuenta ENUM('corriente', 'ahorro', 'caja_ahorro') NOT NULL COMMENT 'Tipo de cuenta',
  moneda ENUM('UYU', 'USD', 'EUR') DEFAULT 'UYU' COMMENT 'Moneda de la cuenta',
  sucursal_id INT COMMENT 'Sucursal asociada',
  saldo_actual DECIMAL(12, 2) NOT NULL DEFAULT 0 COMMENT 'Saldo actual',
  activa BOOLEAN DEFAULT TRUE COMMENT 'Estado de la cuenta',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cuentas bancarias';

-- Tabla de movimientos bancarios
CREATE TABLE IF NOT EXISTS movimientos_bancarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  banco_id INT NOT NULL COMMENT 'ID del banco',
  tipo_movimiento ENUM('deposito', 'retiro', 'transferencia') NOT NULL COMMENT 'Tipo de movimiento',
  concepto VARCHAR(200) NOT NULL COMMENT 'Concepto del movimiento',
  monto DECIMAL(12, 2) NOT NULL COMMENT 'Monto del movimiento',
  referencia VARCHAR(100) COMMENT 'Referencia bancaria',
  usuario_id INT NOT NULL COMMENT 'Usuario que registró el movimiento',
  banco_destino_id INT COMMENT 'Banco destino (para transferencias)',
  saldo_anterior DECIMAL(12, 2) NOT NULL COMMENT 'Saldo antes del movimiento',
  saldo_nuevo DECIMAL(12, 2) NOT NULL COMMENT 'Saldo después del movimiento',
  fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del movimiento',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (banco_id) REFERENCES bancos(id) ON DELETE RESTRICT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  FOREIGN KEY (banco_destino_id) REFERENCES bancos(id) ON DELETE SET NULL,
  INDEX idx_fecha (fecha_movimiento),
  INDEX idx_tipo (tipo_movimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Movimientos bancarios';

-- Tabla de gastos
CREATE TABLE IF NOT EXISTS gastos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  concepto VARCHAR(200) NOT NULL COMMENT 'Concepto del gasto',
  descripcion TEXT COMMENT 'Descripción detallada',
  monto DECIMAL(12, 2) NOT NULL COMMENT 'Monto del gasto',
  categoria ENUM('operativo', 'administrativo', 'marketing', 'mantenimiento', 'servicios', 'otros') NOT NULL COMMENT 'Categoría del gasto',
  metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'cheque') NOT NULL COMMENT 'Método de pago',
  sucursal_id INT NOT NULL COMMENT 'Sucursal donde se realizó el gasto',
  usuario_id INT NOT NULL COMMENT 'Usuario que registró el gasto',
  proveedor VARCHAR(100) COMMENT 'Proveedor del servicio/producto',
  comprobante_url VARCHAR(255) COMMENT 'URL del comprobante',
  fecha_gasto DATE NOT NULL COMMENT 'Fecha del gasto',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_fecha (fecha_gasto),
  INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gastos del negocio';

-- Tabla de nómina
CREATE TABLE IF NOT EXISTS nomina (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL COMMENT 'ID del empleado',
  periodo VARCHAR(20) NOT NULL COMMENT 'Periodo de pago (MM-YYYY)',
  salario_base DECIMAL(12, 2) NOT NULL COMMENT 'Salario base',
  bonos DECIMAL(12, 2) DEFAULT 0 COMMENT 'Bonos adicionales',
  comisiones DECIMAL(12, 2) DEFAULT 0 COMMENT 'Comisiones por ventas',
  deducciones DECIMAL(12, 2) DEFAULT 0 COMMENT 'Deducciones aplicadas',
  total_pagar DECIMAL(12, 2) NOT NULL COMMENT 'Total a pagar',
  estado ENUM('pendiente', 'pagado', 'anulado') DEFAULT 'pendiente' COMMENT 'Estado del pago',
  fecha_pago DATE COMMENT 'Fecha de pago',
  metodo_pago ENUM('efectivo', 'transferencia', 'cheque') NOT NULL COMMENT 'Método de pago',
  observaciones TEXT COMMENT 'Observaciones',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_periodo (periodo),
  INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nómina de empleados';

-- ============================================================
-- TABLAS DE CUENTAS CORRIENTES
-- ============================================================

-- Tabla de cuentas corrientes de clientes
CREATE TABLE IF NOT EXISTS cuentas_corrientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL COMMENT 'ID del cliente',
  saldo DECIMAL(12, 2) NOT NULL DEFAULT 0 COMMENT 'Saldo actual de la cuenta',
  limite_credito DECIMAL(12, 2) NOT NULL DEFAULT 0 COMMENT 'Límite de crédito',
  dias_credito INT DEFAULT 30 COMMENT 'Días de crédito autorizados',
  estado ENUM('activa', 'suspendida', 'bloqueada') DEFAULT 'activa' COMMENT 'Estado de la cuenta',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cliente (cliente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cuentas corrientes de clientes';

-- Tabla de movimientos de cuentas corrientes
CREATE TABLE IF NOT EXISTS movimientos_cuenta_corriente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cuenta_corriente_id INT NOT NULL COMMENT 'ID de la cuenta corriente',
  tipo_movimiento ENUM('cargo', 'abono') NOT NULL COMMENT 'Tipo de movimiento',
  concepto VARCHAR(200) NOT NULL COMMENT 'Concepto del movimiento',
  monto DECIMAL(12, 2) NOT NULL COMMENT 'Monto del movimiento',
  referencia VARCHAR(100) COMMENT 'Referencia (número de factura, recibo, etc.)',
  venta_id INT COMMENT 'ID de la venta asociada',
  saldo_anterior DECIMAL(12, 2) NOT NULL COMMENT 'Saldo antes del movimiento',
  saldo_nuevo DECIMAL(12, 2) NOT NULL COMMENT 'Saldo después del movimiento',
  usuario_id INT NOT NULL COMMENT 'Usuario que realizó el movimiento',
  fecha_vencimiento DATE COMMENT 'Fecha de vencimiento del cargo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cuenta_corriente_id) REFERENCES cuentas_corrientes(id) ON DELETE CASCADE,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_fecha (created_at),
  INDEX idx_tipo (tipo_movimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Movimientos de cuentas corrientes';

-- ============================================================
-- TABLAS DE NOTIFICACIONES Y ACTIVIDAD
-- ============================================================

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL COMMENT 'Usuario destinatario',
  tipo ENUM('alerta', 'info', 'warning', 'success') DEFAULT 'info' COMMENT 'Tipo de notificación',
  titulo VARCHAR(200) NOT NULL COMMENT 'Título de la notificación',
  mensaje TEXT NOT NULL COMMENT 'Mensaje de la notificación',
  icono VARCHAR(50) COMMENT 'Icono de la notificación',
  link VARCHAR(255) COMMENT 'Link relacionado',
  leida BOOLEAN DEFAULT FALSE COMMENT 'Estado de lectura',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuario_id),
  INDEX idx_leida (leida),
  INDEX idx_fecha (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Notificaciones del sistema';

-- Tabla de actividad de usuarios
CREATE TABLE IF NOT EXISTS actividad_usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL COMMENT 'ID del usuario',
  accion VARCHAR(100) NOT NULL COMMENT 'Acción realizada',
  modulo VARCHAR(50) NOT NULL COMMENT 'Módulo del sistema',
  descripcion TEXT COMMENT 'Descripción de la acción',
  ip_address VARCHAR(45) COMMENT 'Dirección IP',
  user_agent TEXT COMMENT 'User agent del navegador',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuario_id),
  INDEX idx_fecha (created_at),
  INDEX idx_modulo (modulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de actividad de usuarios';

-- Tabla de búsquedas de productos (para detectar usuarios que buscan +25 productos/día)
CREATE TABLE IF NOT EXISTS busquedas_productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL COMMENT 'ID de sesión del usuario',
  ip_address VARCHAR(45) NOT NULL COMMENT 'Dirección IP',
  producto_id INT COMMENT 'ID del producto buscado',
  termino_busqueda VARCHAR(200) COMMENT 'Término de búsqueda',
  resultado_encontrado BOOLEAN DEFAULT TRUE COMMENT 'Si se encontró resultado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session (session_id),
  INDEX idx_fecha (created_at),
  INDEX idx_ip (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de búsquedas de productos';

-- ============================================================
-- TABLAS DE PROVEEDORES Y COMPRAS
-- ============================================================

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL COMMENT 'Nombre o razón social',
  tipo_documento ENUM('RUT', 'CI', 'otro') DEFAULT 'RUT' COMMENT 'Tipo de documento',
  numero_documento VARCHAR(50) NOT NULL UNIQUE COMMENT 'Número de documento',
  email VARCHAR(100) COMMENT 'Email de contacto',
  telefono VARCHAR(20) COMMENT 'Teléfono de contacto',
  direccion TEXT COMMENT 'Dirección',
  ciudad VARCHAR(50) COMMENT 'Ciudad',
  pais VARCHAR(50) DEFAULT 'Uruguay' COMMENT 'País',
  contacto_nombre VARCHAR(100) COMMENT 'Nombre del contacto principal',
  contacto_telefono VARCHAR(20) COMMENT 'Teléfono del contacto',
  condiciones_pago VARCHAR(100) COMMENT 'Condiciones de pago',
  observaciones TEXT COMMENT 'Observaciones',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Estado del proveedor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Proveedores';

-- Tabla de compras
CREATE TABLE IF NOT EXISTS compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_compra VARCHAR(50) NOT NULL UNIQUE COMMENT 'Número de compra interno',
  numero_factura VARCHAR(50) COMMENT 'Número de factura del proveedor',
  proveedor_id INT NOT NULL COMMENT 'ID del proveedor',
  sucursal_id INT NOT NULL COMMENT 'Sucursal que recibe',
  fecha_compra DATE NOT NULL COMMENT 'Fecha de la compra',
  fecha_entrega DATE COMMENT 'Fecha de entrega',
  subtotal DECIMAL(12, 2) NOT NULL COMMENT 'Subtotal de la compra',
  iva DECIMAL(12, 2) DEFAULT 0 COMMENT 'IVA aplicado',
  total DECIMAL(12, 2) NOT NULL COMMENT 'Total de la compra',
  estado ENUM('pendiente', 'recibida', 'parcial', 'cancelada') DEFAULT 'pendiente' COMMENT 'Estado de la compra',
  metodo_pago ENUM('efectivo', 'transferencia', 'cheque', 'credito') NOT NULL COMMENT 'Método de pago',
  usuario_id INT NOT NULL COMMENT 'Usuario que registró la compra',
  observaciones TEXT COMMENT 'Observaciones',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE RESTRICT,
  FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_fecha (fecha_compra),
  INDEX idx_proveedor (proveedor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Compras a proveedores';

-- Tabla de detalle de compras
CREATE TABLE IF NOT EXISTS detalle_compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  compra_id INT NOT NULL COMMENT 'ID de la compra',
  producto_id INT NOT NULL COMMENT 'ID del producto',
  cantidad INT NOT NULL COMMENT 'Cantidad comprada',
  precio_unitario DECIMAL(10, 2) NOT NULL COMMENT 'Precio unitario de compra',
  subtotal DECIMAL(12, 2) NOT NULL COMMENT 'Subtotal de la línea',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detalle de compras';

-- ============================================================
-- INSERTAR DATOS INICIALES
-- ============================================================

-- Insertar rol de administrador
INSERT INTO roles (nombre, descripcion, permisos) VALUES
('Administrador', 'Acceso completo al sistema', '{"all": true}'),
('Gerente', 'Gestión de sucursal y reportes', '{"reports": true, "inventory": true, "sales": true}'),
('Vendedor', 'Ventas y atención al cliente', '{"sales": true, "customers": true}'),
('Cajero', 'Gestión de caja y cobros', '{"cash": true, "sales": true}');

-- Insertar usuario administrador por defecto (contraseña: admin123)
-- Nota: En producción, la contraseña debe estar hasheada
INSERT INTO usuarios (nombre, email, password, rol_id, activo) VALUES
('Administrador', 'admin@zarpar.com', 'admin123', 1, TRUE);

-- Insertar sucursal principal
INSERT INTO sucursales (nombre, codigo, direccion, ciudad, departamento, telefono, email, activa) VALUES
('Sucursal Centro', 'SUC-001', 'Av. 18 de Julio 1234', 'Montevideo', 'Montevideo', '+598 2xxx xxxx', 'centro@zarpar.com', TRUE);

-- Insertar categorías principales
INSERT INTO categorias (nombre, descripcion, orden, activa) VALUES
('Pantallas', 'Pantallas y displays para celulares', 1, TRUE),
('Baterías', 'Baterías para diferentes modelos', 2, TRUE),
('Carcasas', 'Carcasas y tapas traseras', 3, TRUE),
('Cámaras', 'Cámaras frontales y traseras', 4, TRUE),
('Cables y Conectores', 'Cables de carga y conectores', 5, TRUE),
('Accesorios', 'Fundas, protectores y accesorios', 6, TRUE);

-- Insertar marcas principales
INSERT INTO marcas (nombre, descripcion, activa) VALUES
('Samsung', 'Repuestos para dispositivos Samsung', TRUE),
('iPhone', 'Repuestos para dispositivos Apple iPhone', TRUE),
('Motorola', 'Repuestos para dispositivos Motorola', TRUE),
('Xiaomi', 'Repuestos para dispositivos Xiaomi', TRUE),
('Huawei', 'Repuestos para dispositivos Huawei', TRUE),
('LG', 'Repuestos para dispositivos LG', TRUE);

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================

-- Verificar que todas las tablas se crearon correctamente
SHOW TABLES;


