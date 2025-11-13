-- Script para verificar y corregir encoding UTF-8 en la base de datos zarparDataBase
-- Este script asegura que todos los caracteres especiales (á, é, í, ó, ú, ñ) se vean correctamente

USE zarparDataBase;

-- Verificar el charset actual de la base de datos
SELECT 
  DEFAULT_CHARACTER_SET_NAME as charset_db,
  DEFAULT_COLLATION_NAME as collation_db
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'zarparDataBase';

-- Verificar el charset de la tabla productos
SELECT 
  TABLE_NAME,
  TABLE_COLLATION
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'zarparDataBase' 
AND TABLE_NAME = 'productos';

-- Ver los tipos actuales para verificar si hay corrupción
SELECT DISTINCT tipo 
FROM productos 
WHERE tipo IS NOT NULL 
ORDER BY tipo;

-- Si los datos están mal, este UPDATE los corregiría:
-- PERO SOLO EJECUTAR SI VERIFICAMOS QUE ESTÁN CORRUPTOS

-- UPDATE productos SET tipo = 'Batería' WHERE tipo LIKE '%Bater%' OR tipo LIKE '%bater%';
-- UPDATE productos SET tipo = 'Botón' WHERE tipo LIKE '%Bot%' OR tipo LIKE '%bot%';

-- Verificar después del fix
SELECT DISTINCT tipo 
FROM productos 
WHERE tipo IS NOT NULL 
ORDER BY tipo;






