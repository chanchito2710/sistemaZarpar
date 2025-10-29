-- ============================================================
-- SISTEMA ZARPAR - BASE DE DATOS POS
-- Base de Datos: zarparDataBase
-- Descripción: Sistema POS para gestión de ventas por sucursales
-- Fecha de creación: 2025
-- ============================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS zarparDataBase
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE zarparDataBase;

-- ============================================================
-- TABLA DE VENDEDORES
-- ============================================================
CREATE TABLE IF NOT EXISTS vendedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre completo del vendedor',
  cargo VARCHAR(50) NOT NULL COMMENT 'Cargo del vendedor (Vendedor, Gerente, etc.)',
  sucursal VARCHAR(50) NOT NULL COMMENT 'Sucursal asignada',
  telefono VARCHAR(20) COMMENT 'Teléfono de contacto',
  email VARCHAR(100) COMMENT 'Email del vendedor',
  fecha_ingreso DATE COMMENT 'Fecha de ingreso',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Estado del vendedor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sucursal (sucursal),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Vendedores del sistema';

-- ============================================================
-- TABLAS DE CLIENTES POR SUCURSAL
-- ============================================================

-- Tabla de clientes - PANDO
CREATE TABLE IF NOT EXISTS clientes_pando (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del cliente',
  apellido VARCHAR(100) NOT NULL COMMENT 'Apellido del cliente',
  nombre_fantasia VARCHAR(150) COMMENT 'Nombre de fantasía o comercial',
  rut VARCHAR(20) NULL COMMENT 'RUT del cliente (puede ser NULL)',
  direccion TEXT COMMENT 'Dirección completa',
  email VARCHAR(100) COMMENT 'Email del cliente',
  razon_social VARCHAR(200) NULL COMMENT 'Razón social (puede ser NULL)',
  telefono VARCHAR(20) COMMENT 'Teléfono principal',
  vendedor_id INT COMMENT 'ID del vendedor asignado',
  fecha_registro DATE NOT NULL DEFAULT (CURRENT_DATE) COMMENT 'Fecha de registro',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Estado del cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL,
  INDEX idx_nombre (nombre, apellido),
  INDEX idx_vendedor (vendedor_id),
  INDEX idx_rut (rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Pando';

-- Tabla de clientes - MALDONADO
CREATE TABLE IF NOT EXISTS clientes_maldonado (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del cliente',
  apellido VARCHAR(100) NOT NULL COMMENT 'Apellido del cliente',
  nombre_fantasia VARCHAR(150) COMMENT 'Nombre de fantasía o comercial',
  rut VARCHAR(20) NULL COMMENT 'RUT del cliente (puede ser NULL)',
  direccion TEXT COMMENT 'Dirección completa',
  email VARCHAR(100) COMMENT 'Email del cliente',
  razon_social VARCHAR(200) NULL COMMENT 'Razón social (puede ser NULL)',
  telefono VARCHAR(20) COMMENT 'Teléfono principal',
  vendedor_id INT COMMENT 'ID del vendedor asignado',
  fecha_registro DATE NOT NULL DEFAULT (CURRENT_DATE) COMMENT 'Fecha de registro',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Estado del cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL,
  INDEX idx_nombre (nombre, apellido),
  INDEX idx_vendedor (vendedor_id),
  INDEX idx_rut (rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Maldonado';

-- Tabla de clientes - RIVERA
CREATE TABLE IF NOT EXISTS clientes_rivera (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del cliente',
  apellido VARCHAR(100) NOT NULL COMMENT 'Apellido del cliente',
  nombre_fantasia VARCHAR(150) COMMENT 'Nombre de fantasía o comercial',
  rut VARCHAR(20) NULL COMMENT 'RUT del cliente (puede ser NULL)',
  direccion TEXT COMMENT 'Dirección completa',
  email VARCHAR(100) COMMENT 'Email del cliente',
  razon_social VARCHAR(200) NULL COMMENT 'Razón social (puede ser NULL)',
  telefono VARCHAR(20) COMMENT 'Teléfono principal',
  vendedor_id INT COMMENT 'ID del vendedor asignado',
  fecha_registro DATE NOT NULL DEFAULT (CURRENT_DATE) COMMENT 'Fecha de registro',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Estado del cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL,
  INDEX idx_nombre (nombre, apellido),
  INDEX idx_vendedor (vendedor_id),
  INDEX idx_rut (rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Rivera';

-- Tabla de clientes - MELO
CREATE TABLE IF NOT EXISTS clientes_melo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del cliente',
  apellido VARCHAR(100) NOT NULL COMMENT 'Apellido del cliente',
  nombre_fantasia VARCHAR(150) COMMENT 'Nombre de fantasía o comercial',
  rut VARCHAR(20) NULL COMMENT 'RUT del cliente (puede ser NULL)',
  direccion TEXT COMMENT 'Dirección completa',
  email VARCHAR(100) COMMENT 'Email del cliente',
  razon_social VARCHAR(200) NULL COMMENT 'Razón social (puede ser NULL)',
  telefono VARCHAR(20) COMMENT 'Teléfono principal',
  vendedor_id INT COMMENT 'ID del vendedor asignado',
  fecha_registro DATE NOT NULL DEFAULT (CURRENT_DATE) COMMENT 'Fecha de registro',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Estado del cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL,
  INDEX idx_nombre (nombre, apellido),
  INDEX idx_vendedor (vendedor_id),
  INDEX idx_rut (rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Melo';

-- Tabla de clientes - PAYSANDÚ
CREATE TABLE IF NOT EXISTS clientes_paysandu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del cliente',
  apellido VARCHAR(100) NOT NULL COMMENT 'Apellido del cliente',
  nombre_fantasia VARCHAR(150) COMMENT 'Nombre de fantasía o comercial',
  rut VARCHAR(20) NULL COMMENT 'RUT del cliente (puede ser NULL)',
  direccion TEXT COMMENT 'Dirección completa',
  email VARCHAR(100) COMMENT 'Email del cliente',
  razon_social VARCHAR(200) NULL COMMENT 'Razón social (puede ser NULL)',
  telefono VARCHAR(20) COMMENT 'Teléfono principal',
  vendedor_id INT COMMENT 'ID del vendedor asignado',
  fecha_registro DATE NOT NULL DEFAULT (CURRENT_DATE) COMMENT 'Fecha de registro',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Estado del cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL,
  INDEX idx_nombre (nombre, apellido),
  INDEX idx_vendedor (vendedor_id),
  INDEX idx_rut (rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Paysandú';

-- Tabla de clientes - SALTO
CREATE TABLE IF NOT EXISTS clientes_salto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del cliente',
  apellido VARCHAR(100) NOT NULL COMMENT 'Apellido del cliente',
  nombre_fantasia VARCHAR(150) COMMENT 'Nombre de fantasía o comercial',
  rut VARCHAR(20) NULL COMMENT 'RUT del cliente (puede ser NULL)',
  direccion TEXT COMMENT 'Dirección completa',
  email VARCHAR(100) COMMENT 'Email del cliente',
  razon_social VARCHAR(200) NULL COMMENT 'Razón social (puede ser NULL)',
  telefono VARCHAR(20) COMMENT 'Teléfono principal',
  vendedor_id INT COMMENT 'ID del vendedor asignado',
  fecha_registro DATE NOT NULL DEFAULT (CURRENT_DATE) COMMENT 'Fecha de registro',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Estado del cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL,
  INDEX idx_nombre (nombre, apellido),
  INDEX idx_vendedor (vendedor_id),
  INDEX idx_rut (rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Salto';

-- Tabla de clientes - TACUAREMBÓ
CREATE TABLE IF NOT EXISTS clientes_tacuarembo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del cliente',
  apellido VARCHAR(100) NOT NULL COMMENT 'Apellido del cliente',
  nombre_fantasia VARCHAR(150) COMMENT 'Nombre de fantasía o comercial',
  rut VARCHAR(20) NULL COMMENT 'RUT del cliente (puede ser NULL)',
  direccion TEXT COMMENT 'Dirección completa',
  email VARCHAR(100) COMMENT 'Email del cliente',
  razon_social VARCHAR(200) NULL COMMENT 'Razón social (puede ser NULL)',
  telefono VARCHAR(20) COMMENT 'Teléfono principal',
  vendedor_id INT COMMENT 'ID del vendedor asignado',
  fecha_registro DATE NOT NULL DEFAULT (CURRENT_DATE) COMMENT 'Fecha de registro',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Estado del cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL,
  INDEX idx_nombre (nombre, apellido),
  INDEX idx_vendedor (vendedor_id),
  INDEX idx_rut (rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Tacuarembó';

-- ============================================================
-- INSERTAR DATOS DE PRUEBA
-- ============================================================

-- Insertar vendedores de prueba para cada sucursal
INSERT INTO vendedores (nombre, cargo, sucursal, telefono, email, fecha_ingreso, activo) VALUES
('Juan Pérez', 'Vendedor Senior', 'pando', '099 123 456', 'juan.perez@zarpar.com', '2024-01-15', TRUE),
('María González', 'Gerente de Ventas', 'maldonado', '099 234 567', 'maria.gonzalez@zarpar.com', '2024-02-01', TRUE),
('Carlos Rodríguez', 'Vendedor', 'rivera', '099 345 678', 'carlos.rodriguez@zarpar.com', '2024-03-10', TRUE),
('Ana Martínez', 'Vendedor Senior', 'melo', '099 456 789', 'ana.martinez@zarpar.com', '2024-01-20', TRUE),
('Luis Fernández', 'Gerente de Ventas', 'paysandu', '099 567 890', 'luis.fernandez@zarpar.com', '2024-02-15', TRUE),
('Laura Sánchez', 'Vendedor', 'salto', '099 678 901', 'laura.sanchez@zarpar.com', '2024-03-05', TRUE),
('Diego Silva', 'Vendedor Senior', 'tacuarembo', '099 789 012', 'diego.silva@zarpar.com', '2024-01-25', TRUE);

-- Insertar clientes de prueba para Pando
INSERT INTO clientes_pando (nombre, apellido, nombre_fantasia, rut, direccion, email, razon_social, telefono, vendedor_id, fecha_registro) VALUES
('Roberto', 'García', 'TecnoFix Pando', '212345670018', 'Av. Wilson 1234', 'roberto@tecnofix.com', 'TecnoFix S.R.L.', '099 111 222', 1, '2024-01-20'),
('Patricia', 'López', NULL, NULL, 'Calle Italia 567', 'patricia.lopez@gmail.com', NULL, '099 222 333', 1, '2024-02-10');

-- Insertar clientes de prueba para Maldonado
INSERT INTO clientes_maldonado (nombre, apellido, nombre_fantasia, rut, direccion, email, razon_social, telefono, vendedor_id, fecha_registro) VALUES
('Fernando', 'Díaz', 'Celulares del Este', '214567890019', 'Rambla 890', 'fernando@celuest.com', 'Celulares del Este S.A.', '099 333 444', 2, '2024-02-15'),
('Mónica', 'Torres', NULL, NULL, 'Av. Gorlero 234', 'monica.torres@hotmail.com', NULL, '099 444 555', 2, '2024-03-01');

-- Insertar clientes de prueba para Rivera
INSERT INTO clientes_rivera (nombre, apellido, nombre_fantasia, rut, direccion, email, razon_social, telefono, vendedor_id, fecha_registro) VALUES
('Andrés', 'Castro', 'Repuestos Norte', '211234567015', 'Calle Sarandí 456', 'andres@norte.com', 'Repuestos Norte Ltda.', '099 555 666', 3, '2024-01-18'),
('Claudia', 'Benítez', NULL, NULL, 'Av. Brasil 789', 'claudia.benitez@yahoo.com', NULL, '099 666 777', 3, '2024-02-20');

-- Insertar clientes de prueba para Melo
INSERT INTO clientes_melo (nombre, apellido, nombre_fantasia, rut, direccion, email, razon_social, telefono, vendedor_id, fecha_registro) VALUES
('Gustavo', 'Ramírez', 'Tech Store Melo', '219876543012', 'Av. Artigas 321', 'gustavo@techstore.com', 'Tech Store S.R.L.', '099 777 888', 4, '2024-02-05'),
('Silvia', 'Núñez', NULL, NULL, 'Calle Treinta y Tres 654', 'silvia.nunez@gmail.com', NULL, '099 888 999', 4, '2024-03-15');

-- Insertar clientes de prueba para Paysandú
INSERT INTO clientes_paysandu (nombre, apellido, nombre_fantasia, rut, direccion, email, razon_social, telefono, vendedor_id, fecha_registro) VALUES
('Ricardo', 'Méndez', 'Móviles Paysandú', '216543210011', 'Av. 18 de Julio 987', 'ricardo@moviles.com', 'Móviles Paysandú S.A.', '099 999 000', 5, '2024-01-22'),
('Beatriz', 'Flores', NULL, NULL, 'Calle Zorrilla 432', 'beatriz.flores@hotmail.com', NULL, '099 000 111', 5, '2024-02-28');

-- Insertar clientes de prueba para Salto
INSERT INTO clientes_salto (nombre, apellido, nombre_fantasia, rut, direccion, email, razon_social, telefono, vendedor_id, fecha_registro) VALUES
('Pablo', 'Vargas', 'Phone Service Salto', '213579246017', 'Av. Uruguay 765', 'pablo@phoneservice.com', 'Phone Service Ltda.', '099 111 000', 6, '2024-02-12'),
('Cecilia', 'Rojas', NULL, NULL, 'Calle Artigas 210', 'cecilia.rojas@gmail.com', NULL, '099 222 111', 6, '2024-03-08');

-- Insertar clientes de prueba para Tacuarembó
INSERT INTO clientes_tacuarembo (nombre, apellido, nombre_fantasia, rut, direccion, email, razon_social, telefono, vendedor_id, fecha_registro) VALUES
('Martín', 'Acosta', 'Repuestos TBO', '218642097014', 'Av. Batlle 543', 'martin@rptbo.com', 'Repuestos TBO S.R.L.', '099 333 222', 7, '2024-01-30'),
('Gabriela', 'Suárez', NULL, NULL, 'Calle Rivera 876', 'gabriela.suarez@yahoo.com', NULL, '099 444 333', 7, '2024-03-12');

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

-- Mostrar todas las tablas creadas
SHOW TABLES;

-- Contar registros en cada tabla
SELECT 'vendedores' as tabla, COUNT(*) as registros FROM vendedores
UNION ALL
SELECT 'clientes_pando', COUNT(*) FROM clientes_pando
UNION ALL
SELECT 'clientes_maldonado', COUNT(*) FROM clientes_maldonado
UNION ALL
SELECT 'clientes_rivera', COUNT(*) FROM clientes_rivera
UNION ALL
SELECT 'clientes_melo', COUNT(*) FROM clientes_melo
UNION ALL
SELECT 'clientes_paysandu', COUNT(*) FROM clientes_paysandu
UNION ALL
SELECT 'clientes_salto', COUNT(*) FROM clientes_salto
UNION ALL
SELECT 'clientes_tacuarembo', COUNT(*) FROM clientes_tacuarembo;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================


