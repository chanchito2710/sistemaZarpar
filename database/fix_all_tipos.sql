-- ================================================================
-- SCRIPT MAESTRO PARA CORREGIR Y ESTANDARIZAR TIPOS DE PRODUCTOS
-- ================================================================
-- Problema: Tipos con encoding incorrecto y sin mayúsculas consistentes
-- Solución: Estandarizar en AMBAS tablas con formato correcto
-- ================================================================

USE zarparDataBase;

-- ==========================================
-- PARTE 1: VER ESTADO ACTUAL
-- ==========================================
SELECT '========== ESTADO ACTUAL ===========' as titulo;

SELECT 'categorias_productos (ANTES):' as tabla;
SELECT tipo, valor, HEX(valor) as hex_encoding
FROM categorias_productos
WHERE tipo = 'tipo'
ORDER BY valor;

SELECT 'productos (ANTES):' as tabla;
SELECT DISTINCT tipo, COUNT(*) as cantidad
FROM productos
WHERE tipo IS NOT NULL
GROUP BY tipo
ORDER BY tipo;

-- ==========================================
-- PARTE 2: CORREGIR categorias_productos
-- ==========================================
SELECT '========== CORRIGIENDO categorias_productos ===========' as titulo;

-- Corregir y estandarizar tipos (Primera letra mayúscula, con acentos)
UPDATE categorias_productos SET valor = 'Antena' WHERE tipo = 'tipo' AND valor LIKE '%antena%';
UPDATE categorias_productos SET valor = 'Batería' WHERE tipo = 'tipo' AND (valor LIKE '%Bateria%' OR valor LIKE '%bateria%');
UPDATE categorias_productos SET valor = 'Botón' WHERE tipo = 'tipo' AND (valor LIKE '%Boton%' OR valor LIKE '%boton%');
UPDATE categorias_productos SET valor = 'Display' WHERE tipo = 'tipo' AND valor LIKE '%display%';
UPDATE categorias_productos SET valor = 'Flex' WHERE tipo = 'tipo' AND valor LIKE '%flex%';
UPDATE categorias_productos SET valor = 'Herramienta' WHERE tipo = 'tipo' AND valor LIKE '%herramienta%';
UPDATE categorias_productos SET valor = 'Main Sub' WHERE tipo = 'tipo' AND valor LIKE '%main%';
UPDATE categorias_productos SET valor = 'Otro' WHERE tipo = 'tipo' AND valor LIKE '%otro%';
UPDATE categorias_productos SET valor = 'Placa Carga' WHERE tipo = 'tipo' AND valor LIKE '%placa%';

-- ==========================================
-- PARTE 3: CORREGIR productos
-- ==========================================
SELECT '========== CORRIGIENDO productos ===========' as titulo;

-- Actualizar tipos en productos para que coincidan con categorias_productos
UPDATE productos SET tipo = 'Antena' WHERE tipo LIKE '%antena%' OR tipo LIKE '%Antena%';
UPDATE productos SET tipo = 'Batería' WHERE tipo LIKE '%Bater%' OR tipo LIKE '%bater%';
UPDATE productos SET tipo = 'Botón' WHERE tipo LIKE '%Bot%' OR tipo LIKE '%bot%';
UPDATE productos SET tipo = 'Display' WHERE tipo LIKE '%display%' OR tipo LIKE '%Display%';
UPDATE productos SET tipo = 'Flex' WHERE tipo LIKE '%flex%' OR tipo LIKE '%Flex%';
UPDATE productos SET tipo = 'Herramienta' WHERE tipo LIKE '%herramienta%' OR tipo LIKE '%Herramienta%';
UPDATE productos SET tipo = 'Main Sub' WHERE tipo LIKE '%main%' OR tipo LIKE '%Main%';
UPDATE productos SET tipo = 'Otro' WHERE tipo LIKE '%otro%' OR tipo LIKE '%Otro%';
UPDATE productos SET tipo = 'Placa Carga' WHERE tipo LIKE '%placa%' AND tipo LIKE '%carga%';

-- ==========================================
-- PARTE 4: VERIFICAR RESULTADO FINAL
-- ==========================================
SELECT '========== RESULTADO FINAL ===========' as titulo;

SELECT 'categorias_productos (DESPUÉS):' as tabla;
SELECT tipo, valor, HEX(valor) as hex_encoding
FROM categorias_productos
WHERE tipo = 'tipo'
ORDER BY valor;

SELECT 'productos (DESPUÉS):' as tabla;
SELECT DISTINCT tipo, COUNT(*) as cantidad
FROM productos
WHERE tipo IS NOT NULL
GROUP BY tipo
ORDER BY tipo;

-- ==========================================
-- PARTE 5: VERIFICACIÓN DE ENCODING UTF-8
-- ==========================================
SELECT '========== VERIFICACIÓN DE ENCODING ===========' as titulo;

SELECT 
  valor as tipo,
  HEX(valor) as hex_value,
  CASE
    WHEN valor = 'Batería' AND HEX(valor) = '4261746572C3AD61' THEN '✅ UTF-8 Correcto'
    WHEN valor = 'Botón' AND HEX(valor) = '426F74C3B36E' THEN '✅ UTF-8 Correcto'
    WHEN HEX(valor) NOT LIKE '%C383%' AND HEX(valor) NOT LIKE '%C2AD%' THEN '✅ Sin doble encoding'
    ELSE '⚠️ Revisar'
  END as estado_encoding
FROM categorias_productos
WHERE tipo = 'tipo'
ORDER BY valor;






