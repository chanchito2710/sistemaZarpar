/**
 * Utilidad para registrar automáticamente movimientos de stock
 * Se usa en ventas, devoluciones, reemplazos y ajustes manuales
 */

import { executeQuery } from '../config/database.js';

/**
 * Interface para registrar un movimiento de stock
 */
export interface RegistroMovimientoStock {
  sucursal: string;
  producto_id: number;
  producto_nombre: string;
  cliente_id?: number;
  cliente_nombre?: string;
  stock_anterior: number;
  stock_nuevo: number;
  stock_fallas_anterior: number;
  stock_fallas_nuevo: number;
  tipo_movimiento: 
    | 'venta' 
    | 'devolucion_stock_principal' 
    | 'devolucion_stock_fallas' 
    | 'reemplazo' 
    | 'ajuste_manual' 
    | 'transferencia_entrada' 
    | 'transferencia_salida';
  referencia?: string;
  usuario_email: string;
  observaciones?: string;
}

/**
 * Registrar un movimiento de stock en el historial
 * Esta función NO lanza errores para no interrumpir la operación principal
 */
export const registrarMovimientoStock = async (
  movimiento: RegistroMovimientoStock
): Promise<number> => {
  try {
    const query = `
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
        observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const resultado: any = await executeQuery(query, [
      movimiento.sucursal,
      movimiento.producto_id,
      movimiento.producto_nombre,
      movimiento.cliente_id || null,
      movimiento.cliente_nombre || null,
      movimiento.stock_anterior,
      movimiento.stock_nuevo,
      movimiento.stock_fallas_anterior,
      movimiento.stock_fallas_nuevo,
      movimiento.tipo_movimiento,
      movimiento.referencia || null,
      movimiento.usuario_email,
      movimiento.observaciones || null,
    ]);

    console.log(`✅ Movimiento registrado: ${movimiento.tipo_movimiento} - ${movimiento.producto_nombre}`);
    
    return resultado.insertId;
  } catch (error) {
    console.error('❌ Error al registrar movimiento de stock:', error);
    // NO lanzar el error para no interrumpir la operación principal
    return 0;
  }
};


