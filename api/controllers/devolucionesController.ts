/**
 * Controlador de Devoluciones y Reemplazos
 * Maneja garantías, devoluciones y stock de fallas
 */

import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { registrarMovimientoStock } from '../utils/historialStock.js';

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
        END as estado_garantia,
        (
          SELECT dr.tipo 
          FROM devoluciones_reemplazos dr 
          WHERE dr.venta_detalle_id = vd.id 
          ORDER BY dr.fecha_proceso DESC 
          LIMIT 1
        ) as tipo_devolucion,
        (
          SELECT dr.metodo_devolucion 
          FROM devoluciones_reemplazos dr 
          WHERE dr.venta_detalle_id = vd.id 
          ORDER BY dr.fecha_proceso DESC 
          LIMIT 1
        ) as metodo_devolucion,
        (
          SELECT dr.fecha_proceso 
          FROM devoluciones_reemplazos dr 
          WHERE dr.venta_detalle_id = vd.id 
          ORDER BY dr.fecha_proceso DESC 
          LIMIT 1
        ) as fecha_devolucion
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
      tipo_stock, // 'principal' o 'mermas'
      procesado_por,
      fecha_venta
    } = req.body;
    
    console.log('💸 Procesando devolución:', { 
      metodo_devolucion, 
      monto_devuelto, 
      cliente_nombre,
      tipo_stock 
    });
    
    await connection.beginTransaction();
    
    // Convertir undefined a null para MySQL
    const observacionesNormalizadas = observaciones || null;
    const procesadoPorNormalizado = procesado_por || null;
    
    // Convertir fecha ISO a formato MySQL (YYYY-MM-DD HH:MM:SS)
    let fechaVentaMySQL = fecha_venta;
    if (fecha_venta && typeof fecha_venta === 'string') {
      const fechaObj = new Date(fecha_venta);
      if (!isNaN(fechaObj.getTime())) {
        fechaVentaMySQL = fechaObj.toISOString().slice(0, 19).replace('T', ' ');
      }
    }
    
    // Registrar la devolución
    const [devolucionResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO devoluciones_reemplazos 
       (sucursal, venta_id, venta_detalle_id, numero_venta, producto_id, producto_nombre, cliente_id, cliente_nombre, tipo, metodo_devolucion, monto_devuelto, observaciones, procesado_por, fecha_venta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'devolucion', ?, ?, ?, ?, ?)`,
      [
        sucursal, 
        venta_id, 
        detalle_id, 
        numero_venta, 
        producto_id, 
        producto_nombre, 
        cliente_id, 
        cliente_nombre, 
        metodo_devolucion, 
        monto_devuelto, 
        observacionesNormalizadas, 
        procesadoPorNormalizado, 
        fechaVentaMySQL
      ]
    );
    
    // Obtener stock actual antes de actualizar (para el historial)
    const [stockActual] = await connection.execute<RowDataPacket[]>(
      `SELECT stock, stock_fallas FROM productos_sucursal 
       WHERE producto_id = ? AND sucursal = ?`,
      [producto_id, sucursal]
    );
    
    const stockAnterior = stockActual[0]?.stock || 0;
    const stockFallasAnterior = stockActual[0]?.stock_fallas || 0;
    
    // Actualizar stock según el tipo de devolución
    console.log(`📦 Actualizando stock del producto devuelto (destino: ${tipo_stock})...`);
    
    if (tipo_stock === 'principal') {
      // Devolver al stock principal (producto en buen estado)
      await connection.execute(
        `UPDATE productos_sucursal 
         SET stock = stock + 1
         WHERE producto_id = ? AND sucursal = ?`,
        [producto_id, sucursal]
      );
      console.log(`✅ Stock Principal: +1 para producto ${producto_id} en ${sucursal}`);
      
      // 📝 Registrar movimiento en historial de stock
      await registrarMovimientoStock({
        sucursal: sucursal,
        producto_id: producto_id,
        producto_nombre: producto_nombre,
        cliente_id: cliente_id,
        cliente_nombre: cliente_nombre,
        stock_anterior: stockAnterior,
        stock_nuevo: stockAnterior + 1,
        stock_fallas_anterior: stockFallasAnterior,
        stock_fallas_nuevo: stockFallasAnterior,
        tipo_movimiento: 'devolucion_stock_principal',
        referencia: numero_venta,
        usuario_email: (req as any).usuario?.email || 'sistema',
        observaciones: `Devolución a stock principal - ${observaciones || 'Sin observaciones'}`
      });
      
    } else if (tipo_stock === 'mermas') {
      // Enviar a stock de mermas/fallas (producto defectuoso)
      await connection.execute(
        `UPDATE productos_sucursal 
         SET stock_fallas = stock_fallas + 1
         WHERE producto_id = ? AND sucursal = ?`,
        [producto_id, sucursal]
      );
      console.log(`✅ Stock de Mermas (Fallas): +1 para producto ${producto_id} en ${sucursal}`);
      
      // 📝 Registrar movimiento en historial de stock
      await registrarMovimientoStock({
        sucursal: sucursal,
        producto_id: producto_id,
        producto_nombre: producto_nombre,
        cliente_id: cliente_id,
        cliente_nombre: cliente_nombre,
        stock_anterior: stockAnterior,
        stock_nuevo: stockAnterior,
        stock_fallas_anterior: stockFallasAnterior,
        stock_fallas_nuevo: stockFallasAnterior + 1,
        tipo_movimiento: 'devolucion_stock_fallas',
        referencia: numero_venta,
        usuario_email: (req as any).usuario?.email || 'sistema',
        observaciones: `Devolución a stock de fallas - ${observaciones || 'Sin observaciones'}`
      });
      
    } else {
      throw new Error('Tipo de stock inválido. Debe ser "principal" o "mermas"');
    }
    
    if (metodo_devolucion === 'cuenta_corriente') {
      // Devolver a cuenta corriente del cliente (genera un HABER = crédito a favor del cliente)
      console.log('💳 Agregando crédito a cuenta corriente del cliente...');
      
      await connection.execute(
        `INSERT INTO cuenta_corriente_movimientos 
         (sucursal, cliente_id, cliente_nombre, tipo, debe, haber, saldo, descripcion, fecha_movimiento)
         VALUES (?, ?, ?, 'pago', 0, ?, 0, ?, NOW())`,
        [sucursal, cliente_id, cliente_nombre, monto_devuelto, `DEVOLUCIÓN - ${producto_nombre}${observaciones ? ' - ' + observaciones : ''}`]
      );
      
      console.log(`✅ Crédito de $${monto_devuelto} agregado a cuenta corriente de ${cliente_nombre}`);
      
    } else if (metodo_devolucion === 'saldo_favor') {
      // Devolver efectivo - Descontar de caja y registrar movimiento
      console.log('💵 Devolución en efectivo - Actualizando caja...');
      
      // Obtener monto actual de caja
      const [cajaRows] = await connection.execute<RowDataPacket[]>(
        'SELECT monto_actual FROM caja WHERE sucursal = ?',
        [sucursal]
      );
      
      const montoAnterior = cajaRows[0]?.monto_actual || 0;
      const montoNuevo = montoAnterior - monto_devuelto;
      
      // Actualizar caja (restar el monto devuelto)
      await connection.execute(
        'UPDATE caja SET monto_actual = ? WHERE sucursal = ?',
        [montoNuevo, sucursal]
      );
      
      // Registrar movimiento en historial de caja
      await connection.execute(
        `INSERT INTO movimientos_caja 
         (sucursal, tipo_movimiento, monto, monto_anterior, monto_nuevo, concepto, usuario_email) 
         VALUES (?, 'egreso_devolucion', ?, ?, ?, ?, ?)`,
        [
          sucursal,
          monto_devuelto,
          montoAnterior,
          montoNuevo,
          `Devolución en efectivo - ${producto_nombre} - Cliente: ${cliente_nombre}`,
          procesado_por || 'sistema'
        ]
      );
      
      console.log(`✅ Caja actualizada: $${montoAnterior} → $${montoNuevo} (Egreso: $${monto_devuelto})`);
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
    
    // Convertir undefined a null para MySQL
    const observacionesNormalizadas = observaciones || null;
    const procesadoPorNormalizado = procesado_por || null;
    
    // Convertir fecha ISO a formato MySQL (YYYY-MM-DD HH:MM:SS)
    let fechaVentaMySQL = fecha_venta;
    if (fecha_venta && typeof fecha_venta === 'string') {
      const fechaObj = new Date(fecha_venta);
      if (!isNaN(fechaObj.getTime())) {
        fechaVentaMySQL = fechaObj.toISOString().slice(0, 19).replace('T', ' ');
      }
    }
    
    // Verificar stock disponible y obtener stock actual
    const [stockCheck] = await connection.execute<RowDataPacket[]>(
      `SELECT stock, stock_fallas FROM productos_sucursal WHERE producto_id = ? AND sucursal = ?`,
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
    
    const stockAnterior = stockCheck[0].stock;
    const stockFallasAnterior = stockCheck[0].stock_fallas;
    
    // Bajar del stock real y sumar a stock_fallas
    await connection.execute(
      `UPDATE productos_sucursal 
       SET stock = stock - ?, stock_fallas = stock_fallas + ?
       WHERE producto_id = ? AND sucursal = ?`,
      [cantidad, cantidad, producto_id, sucursal]
    );
    
    // 📝 Registrar movimiento en historial de stock
    await registrarMovimientoStock({
      sucursal: sucursal,
      producto_id: producto_id,
      producto_nombre: producto_nombre,
      cliente_id: cliente_id,
      cliente_nombre: cliente_nombre,
      stock_anterior: stockAnterior,
      stock_nuevo: stockAnterior - cantidad,
      stock_fallas_anterior: stockFallasAnterior,
      stock_fallas_nuevo: stockFallasAnterior + cantidad,
      tipo_movimiento: 'reemplazo',
      referencia: numero_venta,
      usuario_email: (req as any).usuario?.email || 'sistema',
      observaciones: `Reemplazo de ${cantidad} unidad(es) - ${observaciones || 'Sin observaciones'}`
    });
    
    // Registrar el reemplazo
    await connection.execute(
      `INSERT INTO devoluciones_reemplazos 
       (sucursal, venta_id, venta_detalle_id, numero_venta, producto_id, producto_nombre, cliente_id, cliente_nombre, tipo, observaciones, procesado_por, fecha_venta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'reemplazo', ?, ?, ?)`,
      [
        sucursal, 
        venta_id, 
        detalle_id,
        numero_venta, 
        producto_id, 
        producto_nombre, 
        cliente_id, 
        cliente_nombre, 
        observacionesNormalizadas, 
        procesadoPorNormalizado, 
        fechaVentaMySQL
      ]
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
 * Obtener stock de fallas histórico por fecha
 * GET /api/devoluciones/stock-fallas-historico
 */
export const obtenerStockFallasPorFecha = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, fecha } = req.query;
    
    if (!fecha) {
      res.status(400).json({
        success: false,
        message: 'La fecha es requerida'
      });
      return;
    }
    
    console.log('📅 Consultando stock de fallas histórico:', { sucursal, fecha });
    
    // Query para obtener el último movimiento de cada producto antes o igual a la fecha
    let query = `
      SELECT 
        p.id as producto_id,
        p.nombre,
        p.marca,
        p.tipo,
        p.codigo_barras,
        hs.sucursal,
        COALESCE(hs.stock_fallas_nuevo, 0) as stock_fallas,
        COALESCE(hs.stock_nuevo, 0) as stock_actual
      FROM productos p
      LEFT JOIN (
        SELECT 
          h1.producto_id,
          h1.sucursal,
          h1.stock_fallas_nuevo,
          h1.stock_nuevo,
          h1.created_at
        FROM historial_stock h1
        INNER JOIN (
          SELECT 
            producto_id, 
            sucursal, 
            MAX(created_at) as max_fecha
          FROM historial_stock
          WHERE DATE(created_at) <= ?
          GROUP BY producto_id, sucursal
        ) h2 ON h1.producto_id = h2.producto_id 
           AND h1.sucursal = h2.sucursal 
           AND h1.created_at = h2.max_fecha
      ) hs ON p.id = hs.producto_id
      WHERE 1=1
    `;
    
    const params: any[] = [fecha];
    
    if (sucursal && sucursal !== 'todas') {
      query += ` AND (hs.sucursal = ? OR hs.sucursal IS NULL)`;
      params.push(sucursal);
    }
    
    // Filtrar solo los que tienen historial para la sucursal
    if (sucursal && sucursal !== 'todas') {
      query += ` AND hs.sucursal IS NOT NULL`;
    }
    
    // Ordenar: primero los que tienen fallas (mayor a menor)
    query += ` ORDER BY stock_fallas DESC, p.tipo, p.nombre`;
    
    const [productos] = await pool.execute<RowDataPacket[]>(query, params);
    
    console.log(`✅ Encontrados ${productos.length} productos con historial hasta ${fecha}`);
    
    res.status(200).json({
      success: true,
      data: productos,
      total: productos.length,
      fecha: fecha
    });
    
  } catch (error) {
    console.error('❌ Error al obtener stock de fallas histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener stock de fallas histórico',
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

/**
 * Obtener historial de reemplazos de un producto vendido
 * GET /api/devoluciones/historial-reemplazos/:detalleId
 */
export const obtenerHistorialReemplazos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { detalleId } = req.params;
    
    console.log('📜 Obteniendo historial de reemplazos para detalle:', detalleId);
    
    const query = `
      SELECT 
        dr.id,
        dr.tipo,
        dr.metodo_devolucion,
        dr.monto_devuelto,
        dr.cantidad_reemplazada,
        dr.fecha_proceso,
        dr.procesado_por,
        dr.observaciones,
        dr.numero_venta,
        dr.sucursal,
        dr.producto_nombre,
        dr.cliente_nombre
      FROM devoluciones_reemplazos dr
      WHERE dr.venta_detalle_id = ?
        AND dr.tipo = 'reemplazo'
      ORDER BY dr.fecha_proceso DESC
    `;
    
    const [reemplazos] = await pool.execute<RowDataPacket[]>(query, [detalleId]);
    
    console.log(`✅ ${reemplazos.length} reemplazos encontrados para detalle ${detalleId}`);
    
    res.status(200).json({
      success: true,
      data: reemplazos,
      total: reemplazos.length
    });
    
  } catch (error) {
    console.error('❌ Error al obtener historial de reemplazos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de reemplazos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener detalle de fallas de un producto específico
 * GET /api/devoluciones/detalle-fallas/:productoId
 * Query params: sucursal (opcional)
 */
export const obtenerDetalleFallas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productoId } = req.params;
    const { sucursal } = req.query;
    
    console.log('🔍 Obteniendo detalle de fallas para producto:', productoId, 'Sucursal:', sucursal || 'TODAS');
    
    // Query simplificada: buscar TODAS las devoluciones/reemplazos del producto
    let query = `
      SELECT 
        dr.id,
        dr.venta_detalle_id,
        dr.tipo,
        dr.metodo_devolucion,
        dr.monto_devuelto,
        dr.cantidad_reemplazada,
        dr.fecha_proceso,
        dr.procesado_por,
        dr.observaciones,
        dr.numero_venta,
        dr.sucursal,
        dr.producto_nombre,
        dr.cliente_nombre,
        v.fecha_venta,
        v.cliente_id,
        vd.producto_id
      FROM devoluciones_reemplazos dr
      INNER JOIN ventas_detalle vd ON dr.venta_detalle_id = vd.id
      INNER JOIN ventas v ON vd.venta_id = v.id
      WHERE vd.producto_id = ?
    `;
    
    const params: any[] = [productoId];
    
    // Filtrar por sucursal si se especifica
    if (sucursal && sucursal !== 'todas') {
      query += ' AND dr.sucursal = ?';
      params.push(sucursal);
    }
    
    query += ' ORDER BY dr.fecha_proceso DESC';
    
    console.log('📊 Query SQL:', query);
    console.log('📊 Params:', params);
    
    const [fallas] = await pool.execute<RowDataPacket[]>(query, params);
    
    console.log(`✅ ${fallas.length} fallas encontradas para producto ${productoId}`);
    
    res.status(200).json({
      success: true,
      data: fallas,
      total: fallas.length
    });
    
  } catch (error) {
    console.error('❌ Error al obtener detalle de fallas:', error);
    console.error('❌ Stack:', error instanceof Error ? error.stack : 'No stack');
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalle de fallas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener estadísticas completas de fallas
 * GET /api/devoluciones/estadisticas-fallas
 * Query params: sucursal (opcional)
 */
export const obtenerEstadisticasFallas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, fechaInicio, fechaFin } = req.query;
    
    console.log('📊 Obteniendo estadísticas de fallas:', { 
      sucursal: sucursal || 'TODAS', 
      fechaInicio, 
      fechaFin 
    });
    
    let whereClause = '1=1';
    const params: any[] = [];
    
    if (sucursal && sucursal !== 'todas') {
      whereClause += ' AND dr.sucursal = ?';
      params.push(sucursal);
    }
    
    // Filtrar por rango de fechas
    if (fechaInicio) {
      whereClause += ' AND DATE(dr.fecha_proceso) >= ?';
      params.push(fechaInicio);
    }
    
    if (fechaFin) {
      whereClause += ' AND DATE(dr.fecha_proceso) <= ?';
      params.push(fechaFin);
    }
    
    // 1. Producto que más falló
    const queryProductosMasFallaron = `
      SELECT 
        vd.producto_id,
        dr.producto_nombre,
        p.marca,
        p.tipo,
        COUNT(*) as total_fallas,
        SUM(CASE WHEN dr.tipo = 'devolucion' THEN 1 ELSE 0 END) as devoluciones,
        SUM(CASE WHEN dr.tipo = 'reemplazo' THEN 1 ELSE 0 END) as reemplazos,
        SUM(dr.monto_devuelto) as total_monto_devuelto
      FROM devoluciones_reemplazos dr
      INNER JOIN ventas_detalle vd ON dr.venta_detalle_id = vd.id
      LEFT JOIN productos p ON vd.producto_id = p.id
      WHERE ${whereClause}
      GROUP BY vd.producto_id, dr.producto_nombre, p.marca, p.tipo
      ORDER BY total_fallas DESC
      LIMIT 10
    `;
    
    // 2. Sucursales con más fallas
    const querySucursalesMasFallas = `
      SELECT 
        dr.sucursal,
        COUNT(*) as total_fallas,
        COUNT(DISTINCT vd.producto_id) as productos_diferentes,
        COUNT(DISTINCT v.cliente_id) as clientes_afectados,
        SUM(dr.monto_devuelto) as total_monto_devuelto
      FROM devoluciones_reemplazos dr
      INNER JOIN ventas_detalle vd ON dr.venta_detalle_id = vd.id
      INNER JOIN ventas v ON vd.venta_id = v.id
      WHERE ${whereClause}
      GROUP BY dr.sucursal
      ORDER BY total_fallas DESC
    `;
    
    // 3. Clientes con más fallas
    const queryClientesMasFallas = `
      SELECT 
        v.cliente_id,
        dr.cliente_nombre,
        dr.sucursal,
        COUNT(*) as total_fallas,
        COUNT(DISTINCT vd.producto_id) as productos_diferentes,
        SUM(dr.monto_devuelto) as total_monto_devuelto,
        MAX(dr.fecha_proceso) as ultima_falla
      FROM devoluciones_reemplazos dr
      INNER JOIN ventas_detalle vd ON dr.venta_detalle_id = vd.id
      INNER JOIN ventas v ON vd.venta_id = v.id
      WHERE ${whereClause}
      GROUP BY v.cliente_id, dr.cliente_nombre, dr.sucursal
      ORDER BY total_fallas DESC
      LIMIT 20
    `;
    
    // 4. Fallas por cliente con detalle de productos
    const queryFallasPorCliente = `
      SELECT 
        v.cliente_id,
        dr.cliente_nombre,
        dr.sucursal,
        vd.producto_id,
        dr.producto_nombre,
        p.marca,
        p.tipo,
        COUNT(*) as veces_fallado,
        MAX(dr.fecha_proceso) as ultima_falla,
        SUM(dr.monto_devuelto) as monto_total
      FROM devoluciones_reemplazos dr
      INNER JOIN ventas_detalle vd ON dr.venta_detalle_id = vd.id
      INNER JOIN ventas v ON vd.venta_id = v.id
      LEFT JOIN productos p ON vd.producto_id = p.id
      WHERE ${whereClause}
      GROUP BY v.cliente_id, dr.cliente_nombre, dr.sucursal, vd.producto_id, dr.producto_nombre, p.marca, p.tipo
      ORDER BY dr.cliente_nombre, veces_fallado DESC
    `;
    
    // 5. Resumen general
    const queryResumenGeneral = `
      SELECT 
        COUNT(*) as total_fallas,
        COUNT(DISTINCT vd.producto_id) as productos_diferentes,
        COUNT(DISTINCT v.cliente_id) as clientes_afectados,
        COUNT(DISTINCT dr.sucursal) as sucursales_con_fallas,
        SUM(CASE WHEN dr.tipo = 'devolucion' THEN 1 ELSE 0 END) as total_devoluciones,
        SUM(CASE WHEN dr.tipo = 'reemplazo' THEN 1 ELSE 0 END) as total_reemplazos,
        SUM(dr.monto_devuelto) as monto_total_devuelto,
        AVG(dr.monto_devuelto) as monto_promedio_devuelto
      FROM devoluciones_reemplazos dr
      INNER JOIN ventas_detalle vd ON dr.venta_detalle_id = vd.id
      INNER JOIN ventas v ON vd.venta_id = v.id
      WHERE ${whereClause}
    `;
    
    // Ejecutar todas las consultas en paralelo
    const [
      productosMasFallaron,
      sucursalesMasFallas,
      clientesMasFallas,
      fallasPorCliente,
      resumenGeneral
    ] = await Promise.all([
      pool.execute<RowDataPacket[]>(queryProductosMasFallaron, params),
      pool.execute<RowDataPacket[]>(querySucursalesMasFallas, params),
      pool.execute<RowDataPacket[]>(queryClientesMasFallas, params),
      pool.execute<RowDataPacket[]>(queryFallasPorCliente, params),
      pool.execute<RowDataPacket[]>(queryResumenGeneral, params)
    ]);
    
    console.log('✅ Estadísticas de fallas calculadas exitosamente');
    
    res.status(200).json({
      success: true,
      data: {
        resumen: resumenGeneral[0][0] || {},
        productosMasFallaron: productosMasFallaron[0] || [],
        sucursalesMasFallas: sucursalesMasFallas[0] || [],
        clientesMasFallas: clientesMasFallas[0] || [],
        fallasPorCliente: fallasPorCliente[0] || []
      }
    });
    
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de fallas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de fallas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

