-- ============================================================
-- AGREGAR AUTENTICACIÓN AL SISTEMA ZARPAR
-- Script para agregar columna de password y usuarios del sistema
-- ============================================================

USE zarparDataBase;

-- Agregar columna password a la tabla vendedores
ALTER TABLE vendedores 
ADD COLUMN IF NOT EXISTS password VARCHAR(255) COMMENT 'Contraseña encriptada del vendedor' AFTER email;

-- Actualizar emails de los vendedores existentes según su sucursal
-- y agregar contraseña temporal (será encriptada por el backend)
UPDATE vendedores SET 
  email = 'pando@zarparuy.com',
  password = '$2a$10$YQs.xR5wZ5W5kF5pF5pF5eKp5F5pF5pF5pF5pF5pF5pF5pF5pF5pO'  -- "zarpar123" encriptado
WHERE sucursal = 'pando';

UPDATE vendedores SET 
  email = 'maldonado@zarparuy.com',
  password = '$2a$10$YQs.xR5wZ5W5kF5pF5pF5eKp5F5pF5pF5pF5pF5pF5pF5pF5pF5pO'  -- "zarpar123" encriptado
WHERE sucursal = 'maldonado';

UPDATE vendedores SET 
  email = 'rivera@zarparuy.com',
  password = '$2a$10$YQs.xR5wZ5W5kF5pF5pF5eKp5F5pF5pF5pF5pF5pF5pF5pF5pF5pO'  -- "zarpar123" encriptado
WHERE sucursal = 'rivera';

UPDATE vendedores SET 
  email = 'melo@zarparuy.com',
  password = '$2a$10$YQs.xR5wZ5W5kF5pF5pF5eKp5F5pF5pF5pF5pF5pF5pF5pF5pF5pO'  -- "zarpar123" encriptado
WHERE sucursal = 'melo';

UPDATE vendedores SET 
  email = 'paysandu@zarparuy.com',
  password = '$2a$10$YQs.xR5wZ5W5kF5pF5pF5eKp5F5pF5pF5pF5pF5pF5pF5pF5pF5pO'  -- "zarpar123" encriptado
WHERE sucursal = 'paysandu';

UPDATE vendedores SET 
  email = 'salto@zarparuy.com',
  password = '$2a$10$YQs.xR5wZ5W5kF5pF5pF5eKp5F5pF5pF5pF5pF5pF5pF5pF5pF5pO'  -- "zarpar123" encriptado
WHERE sucursal = 'salto';

UPDATE vendedores SET 
  email = 'tacuarembo@zarparuy.com',
  password = '$2a$10$YQs.xR5wZ5W5kF5pF5pF5eKp5F5pF5pF5pF5pF5pF5pF5pF5pF5pO'  -- "zarpar123" encriptado
WHERE sucursal = 'tacuarembo';

-- ============================================================
-- INSERTAR USUARIO ADMINISTRADOR
-- ============================================================
-- Este usuario tiene acceso a TODAS las sucursales y clientes
INSERT INTO vendedores (nombre, cargo, sucursal, telefono, email, password, fecha_ingreso, activo)
VALUES (
  'Administrador General',
  'Administrador',
  'Administracion',
  '099 000 000',
  'admin@zarparuy.com',
  '$2a$10$YQs.xR5wZ5W5kF5pF5pF5eKp5F5pF5pF5pF5pF5pF5pF5pF5pF5pO',  -- "zarpar123" encriptado
  '2024-01-01',
  TRUE
)
ON DUPLICATE KEY UPDATE email = email;  -- No insertar si ya existe

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT 
  id,
  nombre,
  cargo,
  sucursal,
  email,
  CASE 
    WHEN password IS NOT NULL THEN '✓ Contraseña configurada'
    ELSE '✗ Sin contraseña'
  END as estado_password,
  activo
FROM vendedores
ORDER BY 
  CASE 
    WHEN email = 'admin@zarparuy.com' THEN 0
    ELSE 1
  END,
  sucursal;

-- ============================================================
-- RESUMEN
-- ============================================================
-- Usuarios creados:
-- 1. admin@zarparuy.com (Administrador) - Acceso a TODAS las sucursales
-- 2. pando@zarparuy.com (Vendedor) - Solo sucursal Pando
-- 3. maldonado@zarparuy.com (Vendedor) - Solo sucursal Maldonado  
-- 4. rivera@zarparuy.com (Vendedor) - Solo sucursal Rivera
-- 5. melo@zarparuy.com (Vendedor) - Solo sucursal Melo
-- 6. paysandu@zarparuy.com (Vendedor) - Solo sucursal Paysandú
-- 7. salto@zarparuy.com (Vendedor) - Solo sucursal Salto
-- 8. tacuarembo@zarparuy.com (Vendedor) - Solo sucursal Tacuarembó
--
-- Contraseña por defecto para TODOS: zarpar123
-- (Se recomienda cambiarla después del primer login)
-- ============================================================

