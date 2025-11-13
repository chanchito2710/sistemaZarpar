-- =====================================================
-- Agregar tipo de movimiento 'egreso_devolucion' a movimientos_caja
-- Para registrar devoluciones en efectivo a clientes
-- =====================================================

USE zarparDataBase;

-- Agregar el nuevo tipo de movimiento al ENUM
-- Incluye todos los tipos existentes más el nuevo
ALTER TABLE movimientos_caja 
MODIFY COLUMN tipo_movimiento ENUM(
  'ingreso_venta',              -- Ingreso desde venta POS con efectivo
  'ingreso_cuenta_corriente',   -- Ingreso desde pago de cuenta corriente con efectivo
  'envio',                      -- Envío de dinero (salida)
  'ajuste_manual',              -- Ajuste manual por administrador
  'pago_comision',              -- Pago de comisión a vendedor
  'gasto',                      -- Gasto operativo
  'egreso_devolucion'           -- Devolución en efectivo a cliente (NUEVO)
) NOT NULL;

-- Verificar que se agregó correctamente
SHOW COLUMNS FROM movimientos_caja LIKE 'tipo_movimiento';

SELECT 'Tipo de movimiento egreso_devolucion agregado exitosamente' as mensaje;

