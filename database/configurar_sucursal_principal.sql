-- ========================================
-- CONFIGURAR MALDONADO COMO SUCURSAL PRINCIPAL
-- ========================================
-- Este script establece a MALDONADO como la sucursal principal del sistema.
-- La sucursal principal es la que se selecciona por defecto para administradores.

USE zarparDataBase;

-- 1. Quitar el flag de principal a todas las sucursales
UPDATE configuracion_sucursales 
SET es_principal = 0;

-- 2. Establecer MALDONADO como sucursal principal
UPDATE configuracion_sucursales 
SET es_principal = 1 
WHERE LOWER(sucursal) = 'maldonado';

-- 3. Si MALDONADO no existe, crearla
INSERT INTO configuracion_sucursales (sucursal, es_principal, activa)
VALUES ('maldonado', 1, 1)
ON DUPLICATE KEY UPDATE es_principal = 1, activa = 1;

-- 4. Verificar el resultado
SELECT 
  sucursal,
  es_principal,
  activa,
  created_at
FROM configuracion_sucursales
ORDER BY es_principal DESC, sucursal ASC;

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- sucursal | es_principal | activa | created_at
-- ---------|--------------|--------|------------
-- maldonado|      1       |   1    | [timestamp]
-- pando    |      0       |   1    | [timestamp]
-- rivera   |      0       |   1    | [timestamp]
-- ...

