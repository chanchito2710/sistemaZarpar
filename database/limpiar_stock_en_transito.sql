/**
 * Script para limpiar stock en tránsito
 * Mueve todo el stock_en_transito al stock real de cada sucursal
 * 
 * USO: Ejecutar UNA VEZ después de actualizar el código del backend
 * 
 * Ejecutar con:
 * docker exec -i zarpar-mysql mysql -u root -pzarpar2025 zarparDataBase < database/limpiar_stock_en_transito.sql
 */

USE zarparDataBase;

-- Mostrar stock en tránsito ANTES de limpiar
SELECT 
  ps.producto_id,
  p.nombre AS producto,
  ps.sucursal,
  ps.stock AS stock_actual,
  ps.stock_en_transito,
  (ps.stock + ps.stock_en_transito) AS stock_total_despues
FROM productos_sucursal ps
JOIN productos p ON ps.producto_id = p.id
WHERE ps.stock_en_transito > 0
ORDER BY ps.sucursal, p.nombre;

-- Mover stock_en_transito al stock real
UPDATE productos_sucursal
SET 
  stock = stock + COALESCE(stock_en_transito, 0),
  stock_en_transito = 0,
  updated_at = NOW()
WHERE stock_en_transito > 0;

-- Verificar que se limpió correctamente
SELECT 
  'Stock en tránsito limpiado correctamente' AS mensaje,
  COUNT(*) AS productos_actualizados
FROM productos_sucursal
WHERE stock_en_transito = 0;

-- Mostrar resultado final
SELECT 
  ps.producto_id,
  p.nombre AS producto,
  ps.sucursal,
  ps.stock AS stock_final,
  ps.stock_en_transito AS en_transito_final
FROM productos_sucursal ps
JOIN productos p ON ps.producto_id = p.id
ORDER BY ps.sucursal, p.nombre
LIMIT 20;

