-- ================================================================
-- AUDITORÍA COMPLETA DE ENCODING UTF-8 EN TODA LA BASE DE DATOS
-- ================================================================
-- Este script verifica TODAS las tablas y TODOS los campos
-- para detectar problemas de encoding UTF-8
-- ================================================================

USE zarparDataBase;

-- ==========================================
-- PARTE 1: VERIFICAR CHARSET DE LA BASE DE DATOS
-- ==========================================
SELECT '========== 1. CHARSET DE LA BASE DE DATOS ===========' as titulo;

SELECT 
  SCHEMA_NAME as base_datos,
  DEFAULT_CHARACTER_SET_NAME as charset,
  DEFAULT_COLLATION_NAME as collation
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'zarparDataBase';

-- ==========================================
-- PARTE 2: VERIFICAR CHARSET DE TODAS LAS TABLAS
-- ==========================================
SELECT '========== 2. CHARSET DE TODAS LAS TABLAS ===========' as titulo;

SELECT 
  TABLE_NAME as tabla,
  TABLE_COLLATION as collation,
  TABLE_ROWS as filas_aprox,
  CASE 
    WHEN TABLE_COLLATION LIKE '%utf8mb4%' THEN '✅'
    ELSE '⚠️'
  END as estado
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'zarparDataBase'
  AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- ==========================================
-- PARTE 3: VERIFICAR CAMPOS VARCHAR/TEXT DE TODAS LAS TABLAS
-- ==========================================
SELECT '========== 3. CAMPOS VARCHAR/TEXT EN TODAS LAS TABLAS ===========' as titulo;

SELECT 
  TABLE_NAME as tabla,
  COLUMN_NAME as campo,
  DATA_TYPE as tipo,
  CHARACTER_MAXIMUM_LENGTH as longitud_max,
  CHARACTER_SET_NAME as charset,
  COLLATION_NAME as collation,
  CASE 
    WHEN COLLATION_NAME LIKE '%utf8mb4%' THEN '✅'
    WHEN COLLATION_NAME IS NULL THEN 'N/A'
    ELSE '⚠️'
  END as estado
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'zarparDataBase'
  AND DATA_TYPE IN ('varchar', 'text', 'mediumtext', 'longtext', 'char', 'tinytext')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- ==========================================
-- PARTE 4: BUSCAR DATOS CORRUPTOS EN TABLAS CLAVE
-- ==========================================
SELECT '========== 4. VERIFICACIÓN DE DATOS CORRUPTOS ===========' as titulo;

-- Esta parte será completada con queries específicas por tabla






