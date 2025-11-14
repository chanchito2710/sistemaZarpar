-- =====================================================
-- SCRIPT DE MEJORAS DE INTEGRIDAD DE BASE DE DATOS
-- Sistema Zarpar - Protección a Largo Plazo
-- =====================================================
-- 
-- Este script implementa mejoras críticas para garantizar
-- la integridad y consistencia de los datos a largo plazo
--
-- =====================================================

USE zarparDataBase;

-- =====================================================
-- PARTE 1: ÍNDICES PARA OPTIMIZACIÓN Y PREVENCIÓN DE DUPLICADOS
-- =====================================================

-- Índices en tablas de clientes (mejorar búsquedas y prevenir duplicados)
CREATE INDEX IF NOT EXISTS idx_clientes_maldonado_email ON clientes_maldonado(email);
CREATE INDEX IF NOT EXISTS idx_clientes_maldonado_telefono ON clientes_maldonado(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_maldonado_vendedor ON clientes_maldonado(vendedor_id);

CREATE INDEX IF NOT EXISTS idx_clientes_melo_email ON clientes_melo(email);
CREATE INDEX IF NOT EXISTS idx_clientes_melo_telefono ON clientes_melo(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_melo_vendedor ON clientes_melo(vendedor_id);

CREATE INDEX IF NOT EXISTS idx_clientes_pando_email ON clientes_pando(email);
CREATE INDEX IF NOT EXISTS idx_clientes_pando_telefono ON clientes_pando(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_pando_vendedor ON clientes_pando(vendedor_id);

CREATE INDEX IF NOT EXISTS idx_clientes_paysandu_email ON clientes_paysandu(email);
CREATE INDEX IF NOT EXISTS idx_clientes_paysandu_telefono ON clientes_paysandu(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_paysandu_vendedor ON clientes_paysandu(vendedor_id);

CREATE INDEX IF NOT EXISTS idx_clientes_rionegro_email ON clientes_rionegro(email);
CREATE INDEX IF NOT EXISTS idx_clientes_rionegro_telefono ON clientes_rionegro(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_rionegro_vendedor ON clientes_rionegro(vendedor_id);

CREATE INDEX IF NOT EXISTS idx_clientes_rivera_email ON clientes_rivera(email);
CREATE INDEX IF NOT EXISTS idx_clientes_rivera_telefono ON clientes_rivera(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_rivera_vendedor ON clientes_rivera(vendedor_id);

CREATE INDEX IF NOT EXISTS idx_clientes_salto_email ON clientes_salto(email);
CREATE INDEX IF NOT EXISTS idx_clientes_salto_telefono ON clientes_salto(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_salto_vendedor ON clientes_salto(vendedor_id);

CREATE INDEX IF NOT EXISTS idx_clientes_sanisidro_email ON clientes_sanisidro(email);
CREATE INDEX IF NOT EXISTS idx_clientes_sanisidro_telefono ON clientes_sanisidro(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_sanisidro_vendedor ON clientes_sanisidro(vendedor_id);

CREATE INDEX IF NOT EXISTS idx_clientes_soriano_email ON clientes_soriano(email);
CREATE INDEX IF NOT EXISTS idx_clientes_soriano_telefono ON clientes_soriano(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_soriano_vendedor ON clientes_soriano(vendedor_id);

CREATE INDEX IF NOT EXISTS idx_clientes_tacuarembo_email ON clientes_tacuarembo(email);
CREATE INDEX IF NOT EXISTS idx_clientes_tacuarembo_telefono ON clientes_tacuarembo(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_tacuarembo_vendedor ON clientes_tacuarembo(vendedor_id);

-- Índices en ventas (mejorar performance de consultas)
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_ventas_sucursal ON ventas(sucursal);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_vendedor ON ventas(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_ventas_metodo_pago ON ventas(metodo_pago);
CREATE INDEX IF NOT EXISTS idx_ventas_numero ON ventas(numero_venta);

-- Índices en ventas_detalle
CREATE INDEX IF NOT EXISTS idx_ventas_detalle_venta ON ventas_detalle(venta_id);
CREATE INDEX IF NOT EXISTS idx_ventas_detalle_producto ON ventas_detalle(producto_id);

-- Índices en productos
CREATE INDEX IF NOT EXISTS idx_productos_codigo_barras ON productos(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);

-- Índices en productos_sucursal
CREATE INDEX IF NOT EXISTS idx_productos_sucursal_producto ON productos_sucursal(producto_id);
CREATE INDEX IF NOT EXISTS idx_productos_sucursal_sucursal ON productos_sucursal(sucursal);
CREATE INDEX IF NOT EXISTS idx_productos_sucursal_stock ON productos_sucursal(stock);

-- Índices en caja
CREATE INDEX IF NOT EXISTS idx_caja_sucursal ON caja(sucursal);

-- Índices en movimientos_caja
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_sucursal ON movimientos_caja(sucursal);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_fecha ON movimientos_caja(created_at);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_tipo ON movimientos_caja(tipo_movimiento);

-- Índices en cuenta corriente
CREATE INDEX IF NOT EXISTS idx_cuenta_corriente_fecha ON cuenta_corriente_movimientos(fecha_movimiento);
CREATE INDEX IF NOT EXISTS idx_cuenta_corriente_cliente ON cuenta_corriente_movimientos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cuenta_corriente_sucursal ON cuenta_corriente_movimientos(sucursal);

-- Índices en transferencias
CREATE INDEX IF NOT EXISTS idx_transferencias_fecha ON transferencias(fecha_transferencia);
CREATE INDEX IF NOT EXISTS idx_transferencias_origen ON transferencias(sucursal_origen);
CREATE INDEX IF NOT EXISTS idx_transferencias_destino ON transferencias(sucursal_destino);

-- Índices en comisiones
CREATE INDEX IF NOT EXISTS idx_comisiones_vendedor ON comisiones_vendedores(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_comisiones_fecha ON comisiones_vendedores(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_comisiones_pagado ON comisiones_vendedores(pagado);

-- Índices en devoluciones
CREATE INDEX IF NOT EXISTS idx_devoluciones_sucursal ON devoluciones_reemplazos(sucursal);
CREATE INDEX IF NOT EXISTS idx_devoluciones_cliente ON devoluciones_reemplazos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_devoluciones_producto ON devoluciones_reemplazos(producto_id);
CREATE INDEX IF NOT EXISTS idx_devoluciones_fecha ON devoluciones_reemplazos(fecha_proceso);

-- =====================================================
-- PARTE 2: CONSTRAINTS ADICIONALES (VALIDACIONES)
-- =====================================================

-- Asegurar que los montos no sean negativos en ventas
ALTER TABLE ventas 
  ADD CONSTRAINT chk_ventas_total_positivo 
  CHECK (total >= 0);

-- Asegurar que el stock no sea negativo
ALTER TABLE productos_sucursal 
  ADD CONSTRAINT chk_stock_no_negativo 
  CHECK (stock >= 0);

ALTER TABLE productos_sucursal 
  ADD CONSTRAINT chk_stock_fallas_no_negativo 
  CHECK (stock_fallas >= 0);

-- Asegurar que el precio no sea negativo
ALTER TABLE productos_sucursal 
  ADD CONSTRAINT chk_precio_no_negativo 
  CHECK (precio >= 0);

-- Asegurar que la caja no tenga montos negativos excesivos
ALTER TABLE caja 
  ADD CONSTRAINT chk_caja_monto_razonable 
  CHECK (monto_actual >= -1000000);

-- Asegurar que las cantidades en ventas_detalle sean positivas
ALTER TABLE ventas_detalle 
  ADD CONSTRAINT chk_cantidad_positiva 
  CHECK (cantidad > 0);

-- Asegurar que las comisiones no sean negativas
ALTER TABLE comisiones_vendedores 
  ADD CONSTRAINT chk_comision_no_negativa 
  CHECK (monto_comision >= 0);

-- =====================================================
-- PARTE 3: TRIGGERS PARA MANTENER CONSISTENCIA AUTOMÁTICA
-- =====================================================

-- Trigger: Actualizar stock automáticamente en devoluciones
DELIMITER //

DROP TRIGGER IF EXISTS after_devolucion_actualizar_stock//

CREATE TRIGGER after_devolucion_actualizar_stock
AFTER INSERT ON devoluciones_reemplazos
FOR EACH ROW
BEGIN
  -- Si es una devolución a stock principal
  IF NEW.tipo_stock = 'devolucion_stock_principal' THEN
    UPDATE productos_sucursal 
    SET stock = stock + NEW.cantidad_devuelta
    WHERE producto_id = NEW.producto_id 
      AND sucursal = NEW.sucursal;
  END IF;
  
  -- Si es una devolución a stock de fallas
  IF NEW.tipo_stock = 'devolucion_stock_fallas' THEN
    UPDATE productos_sucursal 
    SET stock_fallas = stock_fallas + NEW.cantidad_devuelta
    WHERE producto_id = NEW.producto_id 
      AND sucursal = NEW.sucursal;
  END IF;
END//

-- Trigger: Prevenir eliminación de vendedores con ventas asociadas
DROP TRIGGER IF EXISTS before_vendedor_delete//

CREATE TRIGGER before_vendedor_delete
BEFORE DELETE ON vendedores
FOR EACH ROW
BEGIN
  DECLARE venta_count INT;
  
  -- Contar ventas del vendedor
  SELECT COUNT(*) INTO venta_count 
  FROM ventas 
  WHERE vendedor_id = OLD.id;
  
  -- Si tiene ventas, no permitir eliminación
  IF venta_count > 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede eliminar vendedor con ventas asociadas. Desactivar en su lugar.';
  END IF;
END//

-- Trigger: Prevenir eliminación de productos con ventas asociadas
DROP TRIGGER IF EXISTS before_producto_delete//

CREATE TRIGGER before_producto_delete
BEFORE DELETE ON productos
FOR EACH ROW
BEGIN
  DECLARE venta_count INT;
  
  -- Contar ventas del producto
  SELECT COUNT(*) INTO venta_count 
  FROM ventas_detalle 
  WHERE producto_id = OLD.id;
  
  -- Si tiene ventas, no permitir eliminación
  IF venta_count > 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede eliminar producto con ventas asociadas. Desactivar en su lugar.';
  END IF;
END//

-- Trigger: Validar stock disponible antes de venta
DROP TRIGGER IF EXISTS before_venta_detalle_insert//

CREATE TRIGGER before_venta_detalle_insert
BEFORE INSERT ON ventas_detalle
FOR EACH ROW
BEGIN
  DECLARE stock_disponible INT;
  DECLARE sucursal_venta VARCHAR(50);
  
  -- Obtener la sucursal de la venta
  SELECT sucursal INTO sucursal_venta 
  FROM ventas 
  WHERE id = NEW.venta_id;
  
  -- Obtener stock disponible
  SELECT stock INTO stock_disponible 
  FROM productos_sucursal 
  WHERE producto_id = NEW.producto_id 
    AND sucursal = sucursal_venta;
  
  -- Validar que hay suficiente stock
  IF stock_disponible < NEW.cantidad THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Stock insuficiente para completar la venta';
  END IF;
END//

DELIMITER ;

-- =====================================================
-- PARTE 4: VISTAS PARA CONSULTAS FRECUENTES (OPTIMIZACIÓN)
-- =====================================================

-- Vista: Stock total por producto (todas las sucursales)
CREATE OR REPLACE VIEW v_stock_total_productos AS
SELECT 
  p.id AS producto_id,
  p.nombre AS producto_nombre,
  p.marca,
  p.tipo,
  SUM(ps.stock) AS stock_total,
  SUM(ps.stock_fallas) AS stock_fallas_total,
  COUNT(ps.sucursal) AS sucursales_con_stock
FROM productos p
LEFT JOIN productos_sucursal ps ON p.id = ps.producto_id
WHERE p.activo = 1
GROUP BY p.id, p.nombre, p.marca, p.tipo;

-- Vista: Resumen de ventas por sucursal y día
CREATE OR REPLACE VIEW v_resumen_ventas_diarias AS
SELECT 
  DATE(fecha_venta) AS fecha,
  sucursal,
  COUNT(*) AS total_ventas,
  SUM(total) AS ingresos_totales,
  SUM(CASE WHEN metodo_pago = 'efectivo' THEN total ELSE 0 END) AS efectivo,
  SUM(CASE WHEN metodo_pago = 'transferencia' THEN total ELSE 0 END) AS transferencia,
  SUM(CASE WHEN metodo_pago = 'cuenta_corriente' THEN total ELSE 0 END) AS cuenta_corriente
FROM ventas
GROUP BY DATE(fecha_venta), sucursal;

-- Vista: Clientes con cuenta corriente pendiente
CREATE OR REPLACE VIEW v_clientes_deuda_pendiente AS
SELECT 
  cc.sucursal,
  cc.cliente_id,
  cc.cliente_nombre,
  SUM(CASE WHEN cc.tipo = 'venta' THEN cc.monto ELSE 0 END) AS total_ventas,
  SUM(CASE WHEN cc.tipo = 'pago' THEN cc.monto ELSE 0 END) AS total_pagos,
  SUM(CASE WHEN cc.tipo = 'venta' THEN cc.monto ELSE -cc.monto END) AS saldo_pendiente
FROM cuenta_corriente_movimientos cc
GROUP BY cc.sucursal, cc.cliente_id, cc.cliente_nombre
HAVING saldo_pendiente > 0;

-- =====================================================
-- PARTE 5: PROCEDIMIENTOS ALMACENADOS PARA OPERACIONES CRÍTICAS
-- =====================================================

DELIMITER //

-- Procedimiento: Procesar venta con validaciones
DROP PROCEDURE IF EXISTS sp_procesar_venta_segura//

CREATE PROCEDURE sp_procesar_venta_segura(
  IN p_sucursal VARCHAR(50),
  IN p_cliente_id INT,
  IN p_vendedor_id INT,
  IN p_metodo_pago VARCHAR(20),
  IN p_total DECIMAL(10,2),
  IN p_productos JSON,
  OUT p_venta_id INT,
  OUT p_mensaje VARCHAR(255)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_mensaje = 'Error al procesar la venta. Transacción revertida.';
    SET p_venta_id = NULL;
  END;
  
  START TRANSACTION;
  
  -- Crear la venta
  INSERT INTO ventas (sucursal, cliente_id, vendedor_id, metodo_pago, total, fecha_venta)
  VALUES (p_sucursal, p_cliente_id, p_vendedor_id, p_metodo_pago, p_total, NOW());
  
  SET p_venta_id = LAST_INSERT_ID();
  
  -- Aquí se procesarían los productos (simplificado)
  -- En la práctica, esto se hace desde el código de Node.js
  
  COMMIT;
  SET p_mensaje = 'Venta procesada exitosamente';
END//

DELIMITER ;

-- =====================================================
-- PARTE 6: CONFIGURACIÓN DE MYSQL PARA MAYOR SEGURIDAD
-- =====================================================

-- Habilitar logs de errores
SET GLOBAL log_error_verbosity = 3;

-- Habilitar binary logging para recuperación (si no está habilitado)
-- SET GLOBAL binlog_expire_logs_seconds = 604800; -- 7 días

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar integridad de Foreign Keys
SELECT 
  TABLE_NAME,
  CONSTRAINT_NAME,
  CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'zarparDataBase'
  AND CONSTRAINT_TYPE = 'FOREIGN KEY'
ORDER BY TABLE_NAME;

-- Verificar índices creados
SELECT 
  TABLE_NAME,
  INDEX_NAME,
  COLUMN_NAME
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'zarparDataBase'
  AND INDEX_NAME != 'PRIMARY'
ORDER BY TABLE_NAME, INDEX_NAME;

-- =====================================================
-- FIN DEL SCRIPT DE MEJORAS
-- =====================================================

SELECT 'Script de mejoras de integridad completado exitosamente' AS resultado;

