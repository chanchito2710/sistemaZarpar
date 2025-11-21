import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket } from 'mysql2';

/**
 * Obtener análisis de productos para pedidos
 * Incluye: stock total, ventas globales, fallas
 */
export const obtenerAnalisisPedidos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    
    console.log('📊 Obteniendo análisis de productos para pedidos...');
    console.log('📅 Filtros:', { fecha_desde, fecha_hasta });

    // Construcción de filtros de fecha
    let ventasFechaCondicion = 'v.fecha_venta >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    
    const queryParams: any[] = [];
    
    if (fecha_desde && fecha_hasta) {
      ventasFechaCondicion = 'v.fecha_venta BETWEEN ? AND ?';
      queryParams.push(fecha_desde, fecha_hasta);
    }

    // Query para obtener todos los productos con stock agregado, ventas y fallas
    // NOTA: Las fallas no se filtran por fecha ya que no hay historial de registro de fallas
    // Solo se muestra el stock de fallas actual
    const query = `
      SELECT 
        p.id,
        p.nombre,
        p.marca,
        p.tipo,
        p.calidad,
        p.codigo_barras,
        
        -- Stock total de todas las sucursales
        COALESCE(SUM(ps.stock), 0) as stock_total,
        
        -- Ventas globales (filtradas por fecha)
        COALESCE(
          (SELECT COUNT(*) 
           FROM ventas_detalle vd 
           INNER JOIN ventas v ON vd.venta_id = v.id
           WHERE vd.producto_id = p.id 
           AND ${ventasFechaCondicion}
          ), 0
        ) as ventas_periodo,
        
        -- Fallas totales (stock de fallas actual, no histórico por fecha)
        COALESCE(SUM(ps.stock_fallas), 0) as fallas_periodo,
        
        -- Stock mínimo (tomamos el máximo de todos los configurados)
        COALESCE(MAX(ps.stock_minimo), 0) as stock_minimo
        
      FROM productos p
      LEFT JOIN productos_sucursal ps ON p.id = ps.producto_id
      WHERE p.activo = 1
      GROUP BY p.id, p.nombre, p.marca, p.tipo, p.calidad, p.codigo_barras
      ORDER BY p.tipo ASC, p.marca ASC, p.nombre ASC
    `;

    const [productos] = await pool.execute<RowDataPacket[]>(query, queryParams);

    console.log(`✅ Análisis obtenido: ${productos.length} productos`);

    res.status(200).json({
      success: true,
      data: productos,
      total: productos.length
    });

  } catch (error) {
    console.error('❌ Error al obtener análisis de pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener análisis de pedidos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Guardar notas de pedidos (localStorage en frontend)
 * Este endpoint es opcional si quieres persistir en BD
 */
export const guardarNotasPedidos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notas } = req.body;
    
    // Aquí podrías guardar en una tabla de pedidos si lo necesitas
    // Por ahora solo retornamos éxito
    
    res.status(200).json({
      success: true,
      message: 'Notas guardadas exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al guardar notas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar notas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

