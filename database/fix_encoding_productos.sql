-- ================================================================
-- SCRIPT PARA CORREGIR ENCODING DE TIPOS EN PRODUCTOS
-- ================================================================
-- Problema: Los tipos tienen doble encoding UTF-8 (BaterÃ­a → Batería)
-- Solución: Actualizar todos los tipos con los valores correctos
-- ================================================================

USE zarparDataBase;

-- PASO 1: Ver el estado actual
SELECT 'ANTES DE LA CORRECCIÓN:' as estado;
SELECT DISTINCT tipo, COUNT(*) as cantidad
FROM productos
WHERE tipo IS NOT NULL
GROUP BY tipo
ORDER BY tipo;

-- PASO 2: Corregir todos los tipos mal escritos

-- Corregir "BaterÃ­a" → "Batería"
UPDATE productos 
SET tipo = 'Batería' 
WHERE tipo LIKE '%Bater%' OR tipo LIKE '%bater%';

-- Corregir "BotÃ³n" → "Botón"
UPDATE productos 
SET tipo = 'Botón' 
WHERE tipo LIKE '%Bot%' OR tipo LIKE '%bot%';

-- Asegurar mayúsculas correctas en el resto
UPDATE productos SET tipo = 'Display' WHERE tipo LIKE '%display%' OR tipo LIKE '%Display%';
UPDATE productos SET tipo = 'Flex' WHERE tipo LIKE '%flex%' OR tipo LIKE '%Flex%';
UPDATE productos SET tipo = 'Antena' WHERE tipo LIKE '%antena%' OR tipo LIKE '%Antena%';
UPDATE productos SET tipo = 'Placa Carga' WHERE tipo LIKE '%placa%' AND tipo LIKE '%carga%';

-- PASO 3: Ver el resultado después de la corrección
SELECT 'DESPUÉS DE LA CORRECCIÓN:' as estado;
SELECT DISTINCT tipo, COUNT(*) as cantidad
FROM productos
WHERE tipo IS NOT NULL
GROUP BY tipo
ORDER BY tipo;

-- PASO 4: Verificar con HEX que el encoding es correcto
SELECT 'VERIFICACIÓN DE ENCODING (HEX):' as estado;
SELECT 
  tipo,
  HEX(tipo) as hex_value,
  CASE
    WHEN tipo = 'Batería' AND HEX(tipo) = '4261746572C3AD61' THEN '✅ Correcto'
    WHEN tipo = 'Botón' AND HEX(tipo) = '426F74C3B36E' THEN '✅ Correcto'
    ELSE '⚠️ Revisar'
  END as estado_encoding
FROM productos
WHERE tipo IN ('Batería', 'Botón')
LIMIT 5;






