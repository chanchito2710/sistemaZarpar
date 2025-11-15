/**
 * Controlador de Historial de Stock
 * Maneja consultas del historial de movimientos de inventario
 */

import { Request, Response } from 'express';
import { executeQuery } from '../config/database.js';
import { RowDataPacket } from 'mysql2';

/**
 * Obtener historial de movimientos de stock con filtros
 * GET /api/historial-stock
 */
export const obtenerHistorialStock = async (req: Request, res: Response) => {
  try {
    const {
      sucursal,
      fecha_desde,
      fecha_hasta,
      tipo_movimiento,
      producto_nombre,
      limit = '100'
    } = req.query;

    console.log('======================================');
    console.log('📊 INICIO - Consulta de historial');
    console.log('📊 Filtros recibidos:', req.query);
    console.log('📊 Sucursal:', sucursal);
    console.log('📊 Tipo movimiento:', tipo_movimiento);
    console.log('======================================');

    // Construir query base - stock_actual muestra el stock que quedó después del movimiento
    let query = `
      SELECT 
        h.id,
        h.sucursal,
        h.producto_id,
        h.producto_nombre,
        h.cliente_id,
        h.cliente_nombre,
        h.stock_anterior,
        h.stock_nuevo,
        h.stock_fallas_anterior,
        h.stock_fallas_nuevo,
        h.tipo_movimiento,
        h.referencia,
        h.usuario_email,
        h.observaciones,
        h.created_at,
        h.stock_nuevo as stock_actual,
        h.stock_fallas_nuevo as stock_fallas_actual
      FROM historial_stock h
      WHERE 1=1
    `;

    const params: any[] = [];

    // Filtro por sucursal
    if (sucursal && sucursal !== 'todas') {
      query += ` AND h.sucursal = ?`;
      params.push(sucursal);
    }

    // Filtro por rango de fechas
    if (fecha_desde) {
      query += ` AND DATE(h.created_at) >= ?`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND DATE(h.created_at) <= ?`;
      params.push(fecha_hasta);
    }

    // Filtro por tipo de movimiento
    if (tipo_movimiento) {
      query += ` AND h.tipo_movimiento = ?`;
      params.push(tipo_movimiento);
    }

    // Filtro por nombre de producto
    if (producto_nombre) {
      query += ` AND h.producto_nombre LIKE ?`;
      params.push(`%${producto_nombre}%`);
    }

    // Ordenar por más reciente primero
    query += ` ORDER BY h.created_at DESC`;

    // Limitar resultados
    const limitNumber = parseInt(limit as string, 10) || 100;
    query += ` LIMIT ${limitNumber}`;

    console.log('🔍 Query a ejecutar:', query);
    console.log('📝 Parámetros:', params);

    const movimientos = await executeQuery<RowDataPacket[]>(query, params);

    console.log('======================================');
    console.log(`✅ RESULTADO: ${movimientos.length} movimientos encontrados`);
    console.log('📋 Primeros 3 movimientos:', JSON.stringify(movimientos.slice(0, 3), null, 2));
    console.log('======================================');

    res.json({
      success: true,
      data: movimientos,
      total: movimientos.length
    });

  } catch (error) {
    console.error('❌ Error al obtener historial de stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial de movimientos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener estadísticas del historial
 * GET /api/historial-stock/estadisticas
 */
export const obtenerEstadisticas = async (req: Request, res: Response) => {
  try {
    const { sucursal, fecha_desde, fecha_hasta } = req.query;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (sucursal && sucursal !== 'todas') {
      whereClause += ' AND sucursal = ?';
      params.push(sucursal);
    }

    if (fecha_desde) {
      whereClause += ' AND DATE(created_at) >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      whereClause += ' AND DATE(created_at) <= ?';
      params.push(fecha_hasta);
    }

    const query = `
      SELECT 
        tipo_movimiento,
        COUNT(*) as cantidad,
        SUM(stock_nuevo - stock_anterior) as cambio_stock_neto,
        SUM(stock_fallas_nuevo - stock_fallas_anterior) as cambio_fallas_neto
      FROM historial_stock
      ${whereClause}
      GROUP BY tipo_movimiento
    `;

    const estadisticas = await executeQuery<RowDataPacket[]>(query, params);

    res.json({
      success: true,
      data: estadisticas
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};


