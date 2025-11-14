-- =====================================================
-- APLICAR VISTAS Y TRIGGERS DE PROTECCIÓN
-- Sistema Zarpar
-- =====================================================

USE zarparDataBase;

-- =====================================================
-- VISTAS OPTIMIZADAS
-- =====================================================

SELECT '👁️  Creando vistas optimizadas...' AS estado;

-- Vista: Stock total por producto
CREATE OR REPLACE VIEW v_stock_total_productos AS
SELECT 
  p.id AS producto_id,
  p.nombre AS producto_nombre,
  p.marca,
  p.tipo,
  IFNULL(SUM(ps.stock), 0) AS stock_total,
  IFNULL(SUM(ps.stock_fallas), 0) AS stock_fallas_total,
  COUNT(DISTINCT ps.sucursal) AS sucursales_con_stock
FROM productos p
LEFT JOIN productos_sucursal ps ON p.id = ps.producto_id
WHERE p.activo = 1
GROUP BY p.id, p.nombre, p.marca, p.tipo;

-- Vista: Resumen de ventas diarias
CREATE OR REPLACE VIEW v_resumen_ventas_diarias AS
SELECT 
  DATE(fecha_venta) AS fecha,
  sucursal,
  COUNT(*) AS total_ventas,
  CAST(SUM(total) AS DECIMAL(10,2)) AS ingresos_totales,
  CAST(SUM(CASE WHEN metodo_pago = 'efectivo' THEN total ELSE 0 END) AS DECIMAL(10,2)) AS efectivo,
  CAST(SUM(CASE WHEN metodo_pago = 'transferencia' THEN total ELSE 0 END) AS DECIMAL(10,2)) AS transferencia,
  CAST(SUM(CASE WHEN metodo_pago = 'cuenta_corriente' THEN total ELSE 0 END) AS DECIMAL(10,2)) AS cuenta_corriente
FROM ventas
GROUP BY DATE(fecha_venta), sucursal;

SELECT '✅ Vistas creadas exitosamente' AS resultado;

-- =====================================================
-- TRIGGERS DE PROTECCIÓN
-- =====================================================

SELECT '🛡️  Creando triggers de protección...' AS estado;

DELIMITER //

-- Trigger: Prevenir eliminación de vendedores con ventas
DROP TRIGGER IF EXISTS before_vendedor_delete//

CREATE TRIGGER before_vendedor_delete
BEFORE DELETE ON vendedores
FOR EACH ROW
BEGIN
  DECLARE venta_count INT;
  
  SELECT COUNT(*) INTO venta_count 
  FROM ventas 
  WHERE vendedor_id = OLD.id;
  
  IF venta_count > 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede eliminar vendedor con ventas asociadas. Desactivar en su lugar.';
  END IF;
END//

-- Trigger: Prevenir eliminación de productos con ventas
DROP TRIGGER IF EXISTS before_producto_delete//

CREATE TRIGGER before_producto_delete
BEFORE DELETE ON productos
FOR EACH ROW
BEGIN
  DECLARE venta_count INT;
  
  SELECT COUNT(*) INTO venta_count 
  FROM ventas_detalle 
  WHERE producto_id = OLD.id;
  
  IF venta_count > 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede eliminar producto con ventas asociadas. Desactivar en su lugar.';
  END IF;
END//

DELIMITER ;

SELECT '✅ Triggers creados exitosamente' AS resultado;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT '🔍 Vistas creadas:' AS resultado;
SELECT TABLE_NAME FROM information_schema.VIEWS WHERE TABLE_SCHEMA = 'zarparDataBase';

SELECT '🔍 Triggers creados:' AS resultado;
SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE 
FROM information_schema.TRIGGERS 
WHERE TRIGGER_SCHEMA = 'zarparDataBase';

SELECT '✅ Todas las mejoras aplicadas exitosamente' AS resultado;

