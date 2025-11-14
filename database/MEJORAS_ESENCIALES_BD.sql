-- =====================================================
-- SCRIPT DE MEJORAS ESENCIALES DE INTEGRIDAD
-- Sistema Zarpar - Protección a Largo Plazo
-- Versión: Segura y Compatible MySQL 8.0
-- =====================================================

USE zarparDataBase;

SELECT '🚀 Iniciando aplicación de mejoras de integridad...' AS estado;

-- =====================================================
-- PARTE 1: ÍNDICES CRÍTICOS EN VENTAS
-- =====================================================

SELECT '📊 Creando índices en tabla VENTAS...' AS estado;

ALTER TABLE ventas ADD INDEX idx_ventas_fecha (fecha_venta);
ALTER TABLE ventas ADD INDEX idx_ventas_sucursal (sucursal);
ALTER TABLE ventas ADD INDEX idx_ventas_vendedor (vendedor_id);
ALTER TABLE ventas ADD INDEX idx_ventas_metodo_pago (metodo_pago);

SELECT '✅ Índices de VENTAS creados' AS resultado;

-- =====================================================
-- PARTE 2: ÍNDICES EN PRODUCTOS
-- =====================================================

SELECT '📦 Creando índices en tabla PRODUCTOS...' AS estado;

ALTER TABLE productos ADD INDEX idx_productos_codigo_barras (codigo_barras);
ALTER TABLE productos ADD INDEX idx_productos_activo (activo);

ALTER TABLE productos_sucursal ADD INDEX idx_productos_sucursal_sucursal (sucursal);
ALTER TABLE productos_sucursal ADD INDEX idx_productos_sucursal_stock (stock);

SELECT '✅ Índices de PRODUCTOS creados' AS resultado;

-- =====================================================
-- PARTE 3: ÍNDICES EN CAJA Y MOVIMIENTOS
-- =====================================================

SELECT '💰 Creando índices en CAJA...' AS estado;

ALTER TABLE caja ADD INDEX idx_caja_sucursal (sucursal);
ALTER TABLE movimientos_caja ADD INDEX idx_movimientos_caja_sucursal (sucursal);
ALTER TABLE movimientos_caja ADD INDEX idx_movimientos_caja_fecha (created_at);
ALTER TABLE movimientos_caja ADD INDEX idx_movimientos_caja_tipo (tipo_movimiento);

SELECT '✅ Índices de CAJA creados' AS resultado;

-- =====================================================
-- PARTE 4: ÍNDICES EN COMISIONES
-- =====================================================

SELECT '💵 Creando índices en COMISIONES...' AS estado;

ALTER TABLE comisiones_vendedores ADD INDEX idx_comisiones_vendedor (vendedor_id);
ALTER TABLE comisiones_vendedores ADD INDEX idx_comisiones_fecha (fecha_venta);
ALTER TABLE comisiones_vendedores ADD INDEX idx_comisiones_pagado (pagado);

SELECT '✅ Índices de COMISIONES creados' AS resultado;

-- =====================================================
-- PARTE 5: ÍNDICES EN CUENTA CORRIENTE
-- =====================================================

SELECT '📝 Creando índices en CUENTA CORRIENTE...' AS estado;

ALTER TABLE cuenta_corriente_movimientos ADD INDEX idx_cuenta_corriente_fecha (fecha_movimiento);
ALTER TABLE cuenta_corriente_movimientos ADD INDEX idx_cuenta_corriente_cliente (cliente_id);
ALTER TABLE cuenta_corriente_movimientos ADD INDEX idx_cuenta_corriente_sucursal (sucursal);

SELECT '✅ Índices de CUENTA CORRIENTE creados' AS resultado;

-- =====================================================
-- PARTE 6: ÍNDICES EN DEVOLUCIONES
-- =====================================================

SELECT '🔄 Creando índices en DEVOLUCIONES...' AS estado;

ALTER TABLE devoluciones_reemplazos ADD INDEX idx_devoluciones_sucursal (sucursal);
ALTER TABLE devoluciones_reemplazos ADD INDEX idx_devoluciones_cliente (cliente_id);
ALTER TABLE devoluciones_reemplazos ADD INDEX idx_devoluciones_producto (producto_id);
ALTER TABLE devoluciones_reemplazos ADD INDEX idx_devoluciones_fecha (fecha_proceso);

SELECT '✅ Índices de DEVOLUCIONES creados' AS resultado;

-- =====================================================
-- PARTE 7: VISTAS OPTIMIZADAS
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

SELECT '✅ Vistas creadas' AS resultado;

-- =====================================================
-- PARTE 8: TRIGGERS DE PROTECCIÓN
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
    SET MESSAGE_TEXT = '❌ No se puede eliminar vendedor con ventas asociadas. Desactivar en su lugar.';
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
    SET MESSAGE_TEXT = '❌ No se puede eliminar producto con ventas asociadas. Desactivar en su lugar.';
  END IF;
END//

DELIMITER ;

SELECT '✅ Triggers de protección creados' AS resultado;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

SELECT '🔍 Verificando índices creados...' AS estado;

SELECT 
  TABLE_NAME,
  INDEX_NAME,
  COLUMN_NAME
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'zarparDataBase'
  AND INDEX_NAME LIKE 'idx_%'
  AND TABLE_NAME IN ('ventas', 'productos', 'caja', 'comisiones_vendedores', 'cuenta_corriente_movimientos', 'devoluciones_reemplazos')
ORDER BY TABLE_NAME, INDEX_NAME;

SELECT '🔍 Verificando vistas creadas...' AS estado;

SELECT 
  TABLE_NAME
FROM information_schema.VIEWS
WHERE TABLE_SCHEMA = 'zarparDataBase';

SELECT '🔍 Verificando triggers creados...' AS estado;

SELECT 
  TRIGGER_NAME,
  EVENT_MANIPULATION,
  EVENT_OBJECT_TABLE
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = 'zarparDataBase';

-- =====================================================
-- RESULTADO FINAL
-- =====================================================

SELECT '╔════════════════════════════════════════════════╗' AS resultado;
SELECT '║   ✅ MEJORAS APLICADAS EXITOSAMENTE           ║' AS resultado;
SELECT '╚════════════════════════════════════════════════╝' AS resultado;
SELECT '' AS resultado;
SELECT '📊 RESUMEN:' AS resultado;
SELECT '   • Índices: 20+ creados' AS resultado;
SELECT '   • Vistas: 2 creadas' AS resultado;
SELECT '   • Triggers: 2 creados' AS resultado;
SELECT '   • Protección: ACTIVA' AS resultado;
SELECT '' AS resultado;
SELECT '🛡️  Base de datos protegida y optimizada' AS resultado;

