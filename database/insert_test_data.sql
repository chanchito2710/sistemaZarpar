-- ============================================================
-- DATOS DE PRUEBA PARA EL SISTEMA
-- ============================================================

USE zarparDataBase;

-- ============================================================
-- Actualizar roles de vendedores existentes
-- ============================================================

-- Actualizar administrador principal
UPDATE vendedores 
SET rol = 'administrador', 
    puede_aprobar_credito = 1,
    limite_descuento_maximo = 100.00,
    permisos_especiales = '{"acceso_total": true, "puede_modificar_roles": true}'
WHERE email = 'admin@zarparuy.com';

-- Actualizar gerentes de cada sucursal (si existen)
-- Estos usuarios tendrán permisos para aprobar cuenta corriente
UPDATE vendedores 
SET rol = 'gerente', 
    puede_aprobar_credito = 1,
    limite_descuento_maximo = 50.00
WHERE cargo IN ('Gerente', 'Director', 'Jefe de Sucursal')
  AND email != 'admin@zarparuy.com';

-- Los demás vendedores permanecen con rol 'vendedor' (default)
UPDATE vendedores 
SET rol = 'vendedor',
    puede_aprobar_credito = 0,
    limite_descuento_maximo = 15.00
WHERE rol IS NULL OR rol = 'vendedor';

-- ============================================================
-- Insertar algunos datos de prueba para cuenta corriente
-- ============================================================

-- Solicitud de cuenta corriente de prueba (pendiente)
INSERT INTO solicitudes_cuenta_corriente 
  (cliente_id, sucursal, solicitado_por, limite_sugerido, dias_credito_sugeridos, justificacion, estado)
VALUES 
  (1, 'pando', 1, 10000.00, 30, 'Cliente mayorista con buen historial', 'pendiente'),
  (2, 'maldonado', 1, 5000.00, 15, 'Cliente frecuente, solicita crédito para compras recurrentes', 'pendiente');

-- ============================================================
-- FIN
-- ============================================================

