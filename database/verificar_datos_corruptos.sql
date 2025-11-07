-- ================================================================
-- VERIFICACIÓN DE DATOS CORRUPTOS EN TODAS LAS TABLAS
-- ================================================================

USE zarparDataBase;

SELECT '========== PRODUCTOS - Verificación ===========' as titulo;
SELECT 
  'productos' as tabla,
  id,
  nombre,
  marca,
  tipo,
  HEX(nombre) as hex_nombre,
  CASE
    WHEN HEX(nombre) LIKE '%C383%' OR HEX(nombre) LIKE '%C2AD%' THEN '⚠️ CORRUPTO'
    ELSE '✅'
  END as estado
FROM productos
WHERE nombre LIKE '%Ã%' OR marca LIKE '%Ã%' OR tipo LIKE '%Ã%'
LIMIT 10;

SELECT '========== CLIENTES_PANDO - Verificación ===========' as titulo;
SELECT 
  'clientes_pando' as tabla,
  id,
  nombre,
  apellido,
  HEX(nombre) as hex_nombre
FROM clientes_pando
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%'
LIMIT 5;

SELECT '========== CLIENTES_MALDONADO - Verificación ===========' as titulo;
SELECT 
  'clientes_maldonado' as tabla,
  id,
  nombre,
  apellido,
  HEX(nombre) as hex_nombre
FROM clientes_maldonado
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%'
LIMIT 5;

SELECT '========== CLIENTES_RIVERA - Verificación ===========' as titulo;
SELECT 
  'clientes_rivera' as tabla,
  id,
  nombre,
  apellido,
  HEX(nombre) as hex_nombre
FROM clientes_rivera
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%'
LIMIT 5;

SELECT '========== CLIENTES_MELO - Verificación ===========' as titulo;
SELECT 
  'clientes_melo' as tabla,
  id,
  nombre,
  apellido,
  HEX(nombre) as hex_nombre
FROM clientes_melo
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%'
LIMIT 5;

SELECT '========== CLIENTES_PAYSANDU - Verificación ===========' as titulo;
SELECT 
  'clientes_paysandu' as tabla,
  id,
  nombre,
  apellido,
  HEX(nombre) as hex_nombre
FROM clientes_paysandu
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%'
LIMIT 5;

SELECT '========== CLIENTES_SALTO - Verificación ===========' as titulo;
SELECT 
  'clientes_salto' as tabla,
  id,
  nombre,
  apellido,
  HEX(nombre) as hex_nombre
FROM clientes_salto
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%'
LIMIT 5;

SELECT '========== CLIENTES_TACUAREMBO - Verificación ===========' as titulo;
SELECT 
  'clientes_tacuarembo' as tabla,
  id,
  nombre,
  apellido,
  HEX(nombre) as hex_nombre
FROM clientes_tacuarembo
WHERE nombre LIKE '%Ã%' OR apellido LIKE '%Ã%' OR direccion LIKE '%Ã%'
LIMIT 5;

SELECT '========== VENDEDORES - Verificación ===========' as titulo;
SELECT 
  'vendedores' as tabla,
  id,
  nombre,
  cargo,
  sucursal,
  HEX(nombre) as hex_nombre
FROM vendedores
WHERE nombre LIKE '%Ã%' OR cargo LIKE '%Ã%' OR sucursal LIKE '%Ã%'
LIMIT 5;

SELECT '========== categorias_productos - Verificación ===========' as titulo;
SELECT 
  'categorias_productos' as tabla,
  id,
  tipo,
  valor,
  HEX(valor) as hex_valor
FROM categorias_productos
WHERE valor LIKE '%Ã%'
LIMIT 10;


