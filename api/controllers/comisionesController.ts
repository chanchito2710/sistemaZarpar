/**
 * Controller de Comisiones
 * Maneja la configuración y consulta de comisiones de vendedores
 */

import { Request, Response } from 'express';
import { executeQuery } from '../config/database.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * Obtener configuración de comisiones por tipo de producto
 * GET /api/comisiones/configuracion
 */
export const obtenerConfiguracionComisiones = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT * FROM configuracion_comisiones 
      WHERE activo = 1 
      ORDER BY monto_comision DESC
    `;
    
    const configuracion = await executeQuery<RowDataPacket[]>(query);
    
    res.status(200).json({
      success: true,
      data: configuracion
    });
    
  } catch (error) {
    console.error('Error al obtener configuración de comisiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración de comisiones',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Actualizar monto de comisión
 * PUT /api/comisiones/configuracion/:id
 */
export const actualizarComision = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { monto_comision } = req.body;
    const usuario = (req as any).user; // Del token JWT
    
    // Validar monto
    if (!monto_comision || isNaN(monto_comision) || monto_comision < 0) {
      res.status(400).json({
        success: false,
        message: 'Monto de comisión inválido'
      });
      return;
    }
    
    // Obtener configuración actual
    const queryActual = 'SELECT * FROM configuracion_comisiones WHERE id = ?';
    const [configActual] = await executeQuery<RowDataPacket[]>(queryActual, [id]);
    
    if (!configActual) {
      res.status(404).json({
        success: false,
        message: 'Configuración de comisión no encontrada'
      });
      return;
    }
    
    // Actualizar monto
    const queryUpdate = 'UPDATE configuracion_comisiones SET monto_comision = ? WHERE id = ?';
    await executeQuery<ResultSetHeader>(queryUpdate, [monto_comision, id]);
    
    // Registrar en historial de cambios
    const queryHistorial = `
      INSERT INTO historial_cambios_comisiones 
      (configuracion_comision_id, tipo, monto_anterior, monto_nuevo, usuario_id, usuario_email)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await executeQuery<ResultSetHeader>(queryHistorial, [
      id,
      configActual.tipo,
      configActual.monto_comision,
      monto_comision,
      usuario?.id || null,
      usuario?.email || null
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Comisión actualizada correctamente',
      data: {
        id,
        tipo: configActual.tipo,
        monto_anterior: configActual.monto_comision,
        monto_nuevo: monto_comision
      }
    });
    
  } catch (error) {
    console.error('Error al actualizar comisión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar comisión',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Sincronizar tipos de productos con configuración de comisiones
 * POST /api/comisiones/sincronizar-tipos
 */
export const sincronizarTiposProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      INSERT IGNORE INTO configuracion_comisiones (tipo, monto_comision)
      SELECT DISTINCT p.tipo, 0 
      FROM productos p
      WHERE p.tipo IS NOT NULL 
        AND p.tipo != ''
        AND p.tipo NOT IN (SELECT tipo FROM configuracion_comisiones)
    `;
    
    const result = await executeQuery<ResultSetHeader>(query);
    
    res.status(200).json({
      success: true,
      message: `${result.affectedRows} tipo(s) de producto sincronizado(s)`,
      data: {
        tipos_nuevos: result.affectedRows
      }
    });
    
  } catch (error) {
    console.error('Error al sincronizar tipos de productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al sincronizar tipos de productos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener resumen de comisiones por vendedor y sucursal
 * GET /api/comisiones/resumen-vendedores
 */
export const obtenerResumenComisiones = async (req: Request, res: Response): Promise<void> => {
  try {
    // Primero verificar si hay comisiones registradas
    const checkQuery = 'SELECT COUNT(*) as total FROM comisiones_vendedores';
    const [checkResult] = await executeQuery<RowDataPacket[]>(checkQuery);
    
    if (!checkResult || checkResult.total === 0) {
      // No hay comisiones registradas, retornar array vacío
      res.status(200).json({
        success: true,
        data: [],
        message: 'No hay comisiones registradas'
      });
      return;
    }
    
    const { fecha_desde, fecha_hasta, sucursal, vendedor_id } = req.query;
    
    let whereConditions = ['1=1'];
    let params: any[] = [];
    
    if (fecha_desde) {
      whereConditions.push('DATE(cv.fecha_comision) >= ?');
      params.push(fecha_desde);
    }
    
    if (fecha_hasta) {
      whereConditions.push('DATE(cv.fecha_comision) <= ?');
      params.push(fecha_hasta);
    }
    
    if (sucursal && sucursal !== 'todas') {
      whereConditions.push('cv.sucursal = ?');
      params.push(sucursal);
    }
    
    if (vendedor_id) {
      whereConditions.push('cv.vendedor_id = ?');
      params.push(vendedor_id);
    }
    
    // Obtener resumen por vendedor y sucursal
    const queryResumen = `
      SELECT 
        v.id as vendedor_id,
        v.nombre as vendedor_nombre,
        COALESCE(v.apellido, '') as vendedor_apellido,
        v.email as vendedor_email,
        cv.sucursal,
        COALESCE(SUM(cv.monto_comision), 0) as total_generado,
        COALESCE(SUM(cv.monto_cobrado), 0) as total_cobrado,
        COALESCE(SUM(cv.monto_pendiente), 0) as total_pendiente,
        COUNT(CASE WHEN cv.estado = 'pagada' THEN 1 END) as comisiones_pagadas,
        COUNT(CASE WHEN cv.estado IN ('pendiente', 'parcial') THEN 1 END) as comisiones_pendientes
      FROM comisiones_vendedores cv
      INNER JOIN vendedores v ON v.id = cv.vendedor_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY v.id, cv.sucursal
      ORDER BY cv.sucursal, v.nombre, COALESCE(v.apellido, '')
    `;
    
    const resumen = await executeQuery<RowDataPacket[]>(queryResumen, params);
    
    // Si no hay comisiones para los filtros, retornar array vacío
    if (!resumen || resumen.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        message: 'No hay comisiones para los filtros seleccionados'
      });
      return;
    }
    
    // Obtener remanentes por vendedor
    const queryRemanentes = `
      SELECT 
        vendedor_id,
        COALESCE(SUM(monto_remanente), 0) as total_remanente
      FROM remanentes_comisiones
      GROUP BY vendedor_id
    `;
    
    const remanentes = await executeQuery<RowDataPacket[]>(queryRemanentes);
    
    // Combinar datos
    const resultado = resumen.map(r => ({
      ...r,
      remanente: remanentes.find(rem => rem.vendedor_id === r.vendedor_id)?.total_remanente || 0
    }));
    
    res.status(200).json({
      success: true,
      data: resultado
    });
    
  } catch (error) {
    console.error('Error al obtener resumen de comisiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen de comisiones',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener detalle de comisiones de un vendedor
 * GET /api/comisiones/detalle-vendedor/:vendedor_id
 */
export const obtenerDetalleComisiones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendedor_id } = req.params;
    const { fecha_desde, fecha_hasta, sucursal } = req.query;
    
    let whereConditions = ['cv.vendedor_id = ?'];
    let params: any[] = [vendedor_id];
    
    if (fecha_desde) {
      whereConditions.push('DATE(cv.fecha_comision) >= ?');
      params.push(fecha_desde);
    }
    
    if (fecha_hasta) {
      whereConditions.push('DATE(cv.fecha_comision) <= ?');
      params.push(fecha_hasta);
    }
    
    if (sucursal && sucursal !== 'todas') {
      whereConditions.push('cv.sucursal = ?');
      params.push(sucursal);
    }
    
    const query = `
      SELECT 
        cv.*,
        IFNULL(v.cliente_nombre, 'N/A') as cliente_nombre,
        CASE 
          WHEN cv.estado = 'pagada' THEN 'Pagada'
          WHEN cv.estado = 'parcial' THEN 'Parcial'
          WHEN cv.estado = 'pendiente' THEN 'Pendiente'
          ELSE 'Cancelada'
        END as estado_texto
      FROM comisiones_vendedores cv
      LEFT JOIN ventas v ON v.id = cv.venta_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY cv.fecha_comision DESC, cv.id DESC
    `;
    
    const comisiones = await executeQuery<RowDataPacket[]>(query, params);
    
    res.status(200).json({
      success: true,
      data: comisiones || [],
      message: !comisiones || comisiones.length === 0 ? 'No hay comisiones para este vendedor' : undefined
    });
    
  } catch (error) {
    console.error('Error al obtener detalle de comisiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalle de comisiones',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener historial de cambios en configuración
 * GET /api/comisiones/historial-cambios
 */
export const obtenerHistorialCambios = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT 
        h.*,
        v.nombre as usuario_nombre,
        v.apellido as usuario_apellido
      FROM historial_cambios_comisiones h
      LEFT JOIN vendedores v ON v.id = h.usuario_id
      ORDER BY h.fecha_cambio DESC
      LIMIT 100
    `;
    
    const historial = await executeQuery<RowDataPacket[]>(query);
    
    res.status(200).json({
      success: true,
      data: historial
    });
    
  } catch (error) {
    console.error('Error al obtener historial de cambios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de cambios',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener historial de pagos de una comisión específica
 * GET /api/comisiones/historial-pagos/:comision_id
 */
export const obtenerHistorialPagosComision = async (req: Request, res: Response): Promise<void> => {
  try {
    const { comision_id } = req.params;
    
    const query = `
      SELECT * FROM historial_pagos_comisiones
      WHERE comision_id = ?
      ORDER BY fecha_pago DESC
    `;
    
    const historial = await executeQuery<RowDataPacket[]>(query, [comision_id]);
    
    res.status(200).json({
      success: true,
      data: historial
    });
    
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de pagos de comisión',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};



/**
 * =====================================================
 * COMISIONES PERSONALIZADAS POR VENDEDOR
 * =====================================================
 */

/**
 * Obtener comisiones personalizadas de un vendedor
 * GET /api/comisiones/vendedor/:vendedor_id
 */
export const obtenerComisionesVendedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendedor_id } = req.params;
    
    // Obtener todas las comisiones globales
    const queryGlobal = `
      SELECT tipo, monto_comision 
      FROM configuracion_comisiones 
      WHERE activo = 1
      ORDER BY monto_comision DESC
    `;
    const comisionesGlobales = await executeQuery<RowDataPacket[]>(queryGlobal);
    
    // Obtener comisiones personalizadas del vendedor
    const queryPersonalizada = `
      SELECT tipo_producto, monto_comision 
      FROM comisiones_por_vendedor 
      WHERE vendedor_id = ? AND activo = 1
    `;
    const comisionesPersonalizadas = await executeQuery<RowDataPacket[]>(queryPersonalizada, [vendedor_id]);
    
    // Mapear comisiones personalizadas para acceso rápido
    const personalizadasMap = new Map();
    comisionesPersonalizadas.forEach(c => {
      personalizadasMap.set(c.tipo_producto, c.monto_comision);
    });
    
    // Combinar: si tiene personalizada, usar esa; si no, usar global
    const comisionesFinales = comisionesGlobales.map(global => ({
      tipo: global.tipo,
      monto_global: global.monto_comision,
      monto_personalizado: personalizadasMap.get(global.tipo) || null,
      monto_activo: personalizadasMap.get(global.tipo) || global.monto_comision,
      tiene_personalizada: personalizadasMap.has(global.tipo)
    }));
    
    res.status(200).json({
      success: true,
      data: comisionesFinales
    });
    
  } catch (error) {
    console.error('Error al obtener comisiones del vendedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener comisiones del vendedor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Establecer comisión personalizada para un vendedor
 * POST /api/comisiones/vendedor/:vendedor_id
 */
export const establecerComisionPersonalizada = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendedor_id } = req.params;
    const { tipo_producto, monto_comision } = req.body;
    
    // Validaciones
    if (!tipo_producto) {
      res.status(400).json({
        success: false,
        message: 'El tipo de producto es requerido'
      });
      return;
    }
    
    if (monto_comision === undefined || monto_comision === null || isNaN(monto_comision) || monto_comision < 0) {
      res.status(400).json({
        success: false,
        message: 'El monto de comisión debe ser un número mayor o igual a 0'
      });
      return;
    }
    
    // Verificar que el vendedor existe
    const queryVendedor = 'SELECT id, nombre, apellido FROM vendedores WHERE id = ?';
    const [vendedor] = await executeQuery<RowDataPacket[]>(queryVendedor, [vendedor_id]);
    
    if (!vendedor) {
      res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado'
      });
      return;
    }
    
    // Insertar o actualizar comisión personalizada
    const query = `
      INSERT INTO comisiones_por_vendedor (vendedor_id, tipo_producto, monto_comision, activo)
      VALUES (?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE 
        monto_comision = VALUES(monto_comision),
        activo = 1,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    await executeQuery<ResultSetHeader>(query, [vendedor_id, tipo_producto, monto_comision]);
    
    res.status(200).json({
      success: true,
      message: `Comisión personalizada establecida para ${vendedor.nombre} ${vendedor.apellido}`,
      data: {
        vendedor_id: Number(vendedor_id),
        tipo_producto,
        monto_comision: Number(monto_comision)
      }
    });
    
  } catch (error) {
    console.error('Error al establecer comisión personalizada:', error);
    res.status(500).json({
      success: false,
      message: 'Error al establecer comisión personalizada',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Eliminar comisión personalizada de un vendedor (volver a usar la global)
 * DELETE /api/comisiones/vendedor/:vendedor_id/:tipo_producto
 */
export const eliminarComisionPersonalizada = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendedor_id, tipo_producto } = req.params;
    
    // Eliminar comisión personalizada
    const query = `
      DELETE FROM comisiones_por_vendedor 
      WHERE vendedor_id = ? AND tipo_producto = ?
    `;
    
    const result = await executeQuery<ResultSetHeader>(query, [vendedor_id, tipo_producto]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'No se encontró comisión personalizada para eliminar'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Comisión personalizada eliminada. Ahora usará la comisión global.',
      data: {
        vendedor_id: Number(vendedor_id),
        tipo_producto
      }
    });
    
  } catch (error) {
    console.error('Error al eliminar comisión personalizada:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar comisión personalizada',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener detalle de comisiones por venta individual
 * GET /api/comisiones/detalle-por-ventas
 * 
 * Retorna CADA VENTA individual con sus comisiones (no agrupadas)
 * Última venta arriba (más reciente primero)
 */
export const obtenerDetalleComisionesPorVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_desde, fecha_hasta, sucursal, vendedor_id } = req.query;
    
    let whereConditions = ['1=1'];
    let params: any[] = [];
    
    if (fecha_desde) {
      whereConditions.push('DATE(v.fecha_venta) >= ?');
      params.push(fecha_desde);
    }
    
    if (fecha_hasta) {
      whereConditions.push('DATE(v.fecha_venta) <= ?');
      params.push(fecha_hasta);
    }
    
    if (sucursal && sucursal !== 'todas') {
      whereConditions.push('v.sucursal = ?');
      params.push(sucursal);
    }
    
    if (vendedor_id) {
      whereConditions.push('v.vendedor_id = ?');
      params.push(vendedor_id);
    }
    
    // Obtener detalle de comisiones por venta
    // Agrupamos por venta_id para sumar todas las comisiones de esa venta
    const query = `
      SELECT 
        v.id as venta_id,
        v.numero_venta,
        v.cliente_nombre,
        v.fecha_venta,
        v.sucursal,
        v.vendedor_id,
        vend.nombre as vendedor_nombre,
        vend.apellido as vendedor_apellido,
        v.total as total_venta,
        COALESCE(SUM(cv.monto_comision), 0) as total_comision,
        COALESCE(SUM(cv.monto_cobrado), 0) as monto_cobrado,
        COALESCE(SUM(cv.monto_pendiente), 0) as monto_pendiente,
        COUNT(cv.id) as cantidad_productos,
        CASE 
          WHEN SUM(cv.monto_pendiente) = 0 THEN 'pagada'
          WHEN SUM(cv.monto_cobrado) > 0 AND SUM(cv.monto_pendiente) > 0 THEN 'parcial'
          ELSE 'pendiente'
        END as estado_comision
      FROM ventas v
      INNER JOIN vendedores vend ON vend.id = v.vendedor_id
      LEFT JOIN comisiones_vendedores cv ON cv.venta_id = v.id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY v.id
      ORDER BY v.fecha_venta DESC, v.id DESC
    `;
    
    const ventas = await executeQuery<RowDataPacket[]>(query, params);
    
    res.status(200).json({
      success: true,
      data: ventas || [],
      message: !ventas || ventas.length === 0 ? 'No hay ventas con comisiones' : undefined
    });
    
  } catch (error) {
    console.error('Error al obtener detalle de comisiones por ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalle de comisiones por ventas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * ⭐ Obtener resumen de comisiones agrupadas por tipo de producto
 * GET /api/comisiones/resumen-por-tipo
 * 
 * Retorna: Display: 3 productos, Comisión: $450.00
 *          Batería: 4 productos, Comisión: $600.00
 */
export const obtenerResumenPorTipo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_desde, fecha_hasta, sucursal, vendedor_id } = req.query;
    
    let whereConditions = ['1=1'];
    let params: any[] = [];
    
    if (fecha_desde) {
      whereConditions.push('DATE(cv.fecha_comision) >= ?');
      params.push(fecha_desde);
    }
    
    if (fecha_hasta) {
      whereConditions.push('DATE(cv.fecha_comision) <= ?');
      params.push(fecha_hasta);
    }
    
    if (sucursal && sucursal !== 'todas') {
      whereConditions.push('cv.sucursal = ?');
      params.push(sucursal);
    }
    
    if (vendedor_id) {
      whereConditions.push('cv.vendedor_id = ?');
      params.push(vendedor_id);
    }
    
    // Agrupar por tipo de producto con información de pagos
    // ⭐ SOLO mostrar tipos donde YA COBRASTE (estado='pagada' Y monto_cobrado > 0)
    const query = `
      SELECT 
        cv.tipo_producto as tipo,
        SUM(cv.cantidad) as cantidad_total,
        COALESCE(SUM(cv.monto_comision), 0) as comision_total,
        COALESCE(SUM(cv.monto_cobrado), 0) as monto_cobrado,
        COALESCE(SUM(cv.monto_pendiente), 0) as monto_pendiente,
        COUNT(DISTINCT cv.venta_id) as cantidad_ventas
      FROM comisiones_vendedores cv
      WHERE ${whereConditions.join(' AND ')}
        AND cv.estado = 'pagada'
        AND cv.monto_cobrado > 0
      GROUP BY cv.tipo_producto
      ORDER BY monto_cobrado DESC
    `;
    
    const resumen = await executeQuery<RowDataPacket[]>(query, params);
    
    res.status(200).json({
      success: true,
      data: resumen || [],
      message: !resumen || resumen.length === 0 ? 'No hay comisiones para los filtros seleccionados' : undefined
    });
    
  } catch (error) {
    console.error('Error al obtener resumen por tipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen de comisiones por tipo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener remanentes de comisiones por vendedor/sucursal
 * GET /api/comisiones/remanentes
 * Query params: sucursal, vendedor_id
 */
export const obtenerRemanentes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, vendedor_id } = req.query;
    
    let whereConditions = ['r.monto_remanente > 0'];
    let params: any[] = [];
    
    if (sucursal && sucursal !== 'todas') {
      whereConditions.push('r.sucursal = ?');
      params.push(sucursal);
    }
    
    if (vendedor_id) {
      whereConditions.push('r.vendedor_id = ?');
      params.push(vendedor_id);
    }
    
    const query = `
      SELECT 
        r.*,
        v.nombre as vendedor_nombre,
        v.apellido as vendedor_apellido
      FROM remanentes_comisiones r
      LEFT JOIN vendedores v ON v.id = r.vendedor_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY r.monto_remanente DESC
    `;
    
    const remanentes = await executeQuery<RowDataPacket[]>(query, params);
    
    // Calcular total (seguro incluso si está vacío)
    const total = Array.isArray(remanentes) && remanentes.length > 0
      ? remanentes.reduce((sum, r) => sum + parseFloat(r.monto_remanente || 0), 0)
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        remanentes: remanentes || [],
        total,
        count: remanentes ? remanentes.length : 0
      }
    });
    
  } catch (error) {
    console.error('❌ Error al obtener remanentes:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Si la tabla no existe, retornar vacío en vez de error
    res.status(200).json({
      success: true,
      data: {
        remanentes: [],
        total: 0,
        count: 0
      }
    });
  }
};

