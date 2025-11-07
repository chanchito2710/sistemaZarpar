/**
 * Controlador de Devoluciones y Reemplazos
 * Maneja garantías, devoluciones y stock de fallas
 */

import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

/**
 * Obtener productos vendidos con garantía vigente (3 meses)
 * GET /api/devoluciones/productos-vendidos
 */
export const obtenerProductosVendidos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, fecha_desde, fecha_hasta } = req.query;
    
    console.log('📦 Obteniendo productos vendidos con garantía:', { sucursal, fecha_desde, fecha_hasta });
    
    // Calcular fecha límite de garantía (3 meses atrás)
    const fechaLimiteGarantia = new Date();
    fechaLimiteGarantia.setMonth(fechaLimiteGarantia.getMonth() - 3);
    
    let query = `
      SELECT 
        vd.id as detalle_id,
        v.id as venta_id,
        v.numero_venta,
        v.sucursal,
        v.cliente_id,
        v.cliente_nombre,
        v.fecha_venta,
        v.metodo_pago,
        vd.producto_id,
        vd.producto_nombre as nombre_producto,
        vd.cantidad,
        vd.precio_unitario,
        vd.subtotal,
        p.tipo as tipo_producto,
        vd.producto_marca as marca,
        DATEDIFF(NOW(), v.fecha_venta) as dias_desde_venta,
        CASE 
          WHEN DATEDIFF(NOW(), v.fecha_venta) <= 90 THEN 'vigente'
          ELSE 'vencida'
        END as estado_garantia
      FROM ventas_detalle vd
      INNER JOIN ventas v ON vd.venta_id = v.id
      LEFT JOIN productos p ON vd.producto_id = p.id
      WHERE v.fecha_venta >= ?
    `;
    
    const params: any[] = [fechaLimiteGarantia];
    
    // Filtrar por sucursal si se proporciona
    if (sucursal && sucursal !== 'todas') {
      query += ` AND v.sucursal = ?`;
      params.push(sucursal);
    }
    
    // Filtrar por rango de fechas si se proporciona
    if (fecha_desde) {
      query += ` AND v.fecha_venta >= ?`;
      params.push(fecha_desde);
    }
    
    if (fecha_hasta) {
      query += ` AND v.fecha_venta <= ?`;
      params.push(fecha_hasta);
    }
    
    query += ` ORDER BY v.fecha_venta DESC, v.numero_venta, vd.id`;
    
    const [productos] = await pool.execute<RowDataPacket[]>(query, params);
    
    res.status(200).json({
      success: true,
      data: productos,
      total: productos.length
    });
    
  } catch (error) {
    console.error('❌ Error al obtener productos vendidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos vendidos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Procesar devolución de producto
 * POST /api/devoluciones/devolver
 */
export const procesarDevolucion = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const {
      detalle_id,
      venta_id,
      numero_venta,
      sucursal,
      producto_id,
      producto_nombre,
      cliente_id,
      cliente_nombre,
      metodo_devolucion, // 'cuenta_corriente' o 'saldo_favor'
      monto_devuelto,
      observaciones,
      procesado_por,
      fecha_venta
    } = req.body;
    
    console.log('💸 Procesando devolución:', { metodo_devolucion, monto_devuelto, cliente_nombre });
    
    await connection.beginTransaction();
    
    // Registrar la devolución
    const [devolucionResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO devoluciones_reemplazos 
       (sucursal, venta_id, numero_venta, producto_id, producto_nombre, cliente_id, cliente_nombre, tipo, metodo_devolucion, monto_devuelto, observaciones, procesado_por, fecha_venta)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'devolucion', ?, ?, ?, ?, ?)`,
      [sucursal, venta_id, numero_venta, producto_id, producto_nombre, cliente_id, cliente_nombre, metodo_devolucion, monto_devuelto, observaciones, procesado_por, fecha_venta]
    );
    
    if (metodo_devolucion === 'cuenta_corriente') {
      // Devolver a cuenta corriente del cliente
      await connection.execute(
        `INSERT INTO cuenta_corriente_movimientos 
         (sucursal, cliente_id, cliente_nombre, tipo, debe, haber, saldo, descripcion, fecha_movimiento)
         VALUES (?, ?, ?, 'pago', 0, ?, 0, ?, NOW())`,
        [sucursal, cliente_id, cliente_nombre, monto_devuelto, `Devolución de producto: ${producto_nombre} - ${observaciones || ''}`]
      );
      
    } else if (metodo_devolucion === 'saldo_favor') {
      // Crear o actualizar saldo a favor del cliente
      await connection.execute(
        `INSERT INTO saldos_favor_clientes (sucursal, cliente_id, cliente_nombre, saldo_actual)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE saldo_actual = saldo_actual + ?`,
        [sucursal, cliente_id, cliente_nombre, monto_devuelto, monto_devuelto]
      );
    }
    
    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: `Devolución procesada exitosamente (${metodo_devolucion})`,
      data: {
        devolucion_id: devolucionResult.insertId,
        metodo: metodo_devolucion,
        monto: monto_devuelto
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error al procesar devolución:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar devolución',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    connection.release();
  }
};

/**
 * Procesar reemplazo de producto
 * POST /api/devoluciones/reemplazar
 */
export const procesarReemplazo = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const {
      detalle_id,
      venta_id,
      numero_venta,
      sucursal,
      producto_id,
      producto_nombre,
      cliente_id,
      cliente_nombre,
      cantidad,
      observaciones,
      procesado_por,
      fecha_venta
    } = req.body;
    
    console.log('🔄 Procesando reemplazo:', { producto_nombre, cantidad, sucursal });
    
    await connection.beginTransaction();
    
    // Verificar stock disponible
    const [stockCheck] = await connection.execute<RowDataPacket[]>(
      `SELECT stock FROM productos_sucursal WHERE producto_id = ? AND sucursal = ?`,
      [producto_id, sucursal]
    );
    
    if (!stockCheck[0] || stockCheck[0].stock < cantidad) {
      await connection.rollback();
      res.status(400).json({
        success: false,
        message: `Stock insuficiente. Disponible: ${stockCheck[0]?.stock || 0}`
      });
      return;
    }
    
    // Bajar del stock real y sumar a stock_fallas
    await connection.execute(
      `UPDATE productos_sucursal 
       SET stock = stock - ?, stock_fallas = stock_fallas + ?
       WHERE producto_id = ? AND sucursal = ?`,
      [cantidad, cantidad, producto_id, sucursal]
    );
    
    // Registrar el reemplazo
    await connection.execute(
      `INSERT INTO devoluciones_reemplazos 
       (sucursal, venta_id, numero_venta, producto_id, producto_nombre, cliente_id, cliente_nombre, tipo, observaciones, procesado_por, fecha_venta)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'reemplazo', ?, ?, ?)`,
      [sucursal, venta_id, numero_venta, producto_id, producto_nombre, cliente_id, cliente_nombre, observaciones, procesado_por, fecha_venta]
    );
    
    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: 'Reemplazo procesado exitosamente',
      data: {
        stock_descontado: cantidad,
        stock_fallas_sumado: cantidad
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error al procesar reemplazo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar reemplazo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    connection.release();
  }
};

/**
 * Obtener stock de fallas
 * GET /api/devoluciones/stock-fallas
 */
export const obtenerStockFallas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.query;
    
    let query = `
      SELECT 
        p.id as producto_id,
        p.nombre,
        p.marca,
        p.tipo,
        p.codigo_barras,
        ps.sucursal,
        COALESCE(ps.stock_fallas, 0) as stock_fallas,
        ps.stock as stock_actual
      FROM productos p
      INNER JOIN productos_sucursal ps ON p.id = ps.producto_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (sucursal && sucursal !== 'todas') {
      query += ` AND ps.sucursal = ?`;
      params.push(sucursal);
    }
    
    // Ordenar: primero los que tienen fallas (mayor a menor), luego los que no tienen fallas
    query += ` ORDER BY ps.stock_fallas DESC, p.tipo, p.nombre`;
    
    const [productos] = await pool.execute<RowDataPacket[]>(query, params);
    
    res.status(200).json({
      success: true,
      data: productos,
      total: productos.length
    });
    
  } catch (error) {
    console.error('❌ Error al obtener stock de fallas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener stock de fallas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener saldos a favor de clientes
 * GET /api/devoluciones/saldos-favor
 */
export const obtenerSaldosFavor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.query;
    
    let query = `
      SELECT *
      FROM saldos_favor_clientes
      WHERE saldo_actual > 0
    `;
    
    const params: any[] = [];
    
    if (sucursal && sucursal !== 'todas') {
      query += ` AND sucursal = ?`;
      params.push(sucursal);
    }
    
    query += ` ORDER BY saldo_actual DESC, cliente_nombre`;
    
    const [saldos] = await pool.execute<RowDataPacket[]>(query, params);
    
    res.status(200).json({
      success: true,
      data: saldos,
      total: saldos.length
    });
    
  } catch (error) {
    console.error('❌ Error al obtener saldos a favor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener saldos a favor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

