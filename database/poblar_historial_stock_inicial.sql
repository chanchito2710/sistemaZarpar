-- =============================================
-- POBLAR HISTORIAL DE STOCK CON DATOS HISTÓRICOS
-- Este script genera registros en historial_stock basados en ventas existentes
-- =============================================

USE zarparDataBase;

SET @usuario_sistema = 'sistema@zarparuy.com';

-- =============================================
-- 1. INSERTAR MOVIMIENTOS DE VENTAS HISTÓRICAS
-- =============================================
INSERT INTO historial_stock (
  sucursal,
  producto_id,
  producto_nombre,
  cliente_id,
  cliente_nombre,
  stock_anterior,
  stock_nuevo,
  stock_fallas_anterior,
  stock_fallas_nuevo,
  tipo_movimiento,
  referencia,
  usuario_email,
  observaciones,
  created_at
)
SELECT 
  v.sucursal,
  vd.producto_id,
  vd.producto_nombre,
  v.cliente_id,
  v.cliente_nombre,
  0 as stock_anterior, -- No podemos saber el stock exacto en ese momento
  0 as stock_nuevo,     -- Tampoco podemos calcularlo retroactivamente con precisión
  0 as stock_fallas_anterior,
  0 as stock_fallas_nuevo,
  'venta' as tipo_movimiento,
  v.numero_venta as referencia,
  COALESCE(LOWER(CONCAT(v.sucursal, '@zarparuy.com')), @usuario_sistema) as usuario_email,
  CONCAT('Venta de ', vd.cantidad, ' unidad(es) - Registro histórico') as observaciones,
  v.created_at
FROM ventas v
INNER JOIN ventas_detalle vd ON v.id = vd.venta_id
WHERE v.created_at IS NOT NULL
ORDER BY v.created_at ASC;

-- =============================================
-- 2. INSERTAR MOVIMIENTOS DE DEVOLUCIONES Y REEMPLAZOS HISTÓRICOS
-- =============================================
INSERT INTO historial_stock (
  sucursal,
  producto_id,
  producto_nombre,
  cliente_id,
  cliente_nombre,
  stock_anterior,
  stock_nuevo,
  stock_fallas_anterior,
  stock_fallas_nuevo,
  tipo_movimiento,
  referencia,
  usuario_email,
  observaciones,
  created_at
)
SELECT 
  dr.sucursal,
  dr.producto_id,
  dr.producto_nombre,
  dr.cliente_id,
  dr.cliente_nombre,
  0 as stock_anterior,
  0 as stock_nuevo,
  0 as stock_fallas_anterior,
  0 as stock_fallas_nuevo,
  CASE 
    WHEN dr.tipo = 'reemplazo' THEN 'reemplazo'
    WHEN dr.tipo = 'devolucion' THEN 'devolucion_stock_fallas'
    ELSE 'reemplazo'
  END as tipo_movimiento,
  dr.numero_venta as referencia,
  COALESCE(LOWER(CONCAT(dr.sucursal, '@zarparuy.com')), @usuario_sistema) as usuario_email,
  CONCAT(
    CASE 
      WHEN dr.tipo = 'reemplazo' THEN 'Reemplazo'
      WHEN dr.tipo = 'devolucion' THEN 'Devolución'
      ELSE 'Movimiento'
    END,
    ' de ', COALESCE(dr.cantidad_reemplazada, 1), ' unidad(es) - ',
    COALESCE(dr.observaciones, 'Registro histórico')
  ) as observaciones,
  dr.created_at
FROM devoluciones_reemplazos dr
WHERE dr.created_at IS NOT NULL
ORDER BY dr.created_at ASC;

-- =============================================
-- VERIFICAR RESULTADOS
-- =============================================
SELECT 
  tipo_movimiento,
  COUNT(*) as cantidad,
  MIN(created_at) as primera_fecha,
  MAX(created_at) as ultima_fecha
FROM historial_stock
GROUP BY tipo_movimiento
ORDER BY tipo_movimiento;

SELECT '✅ Historial de stock poblado exitosamente' as mensaje;

