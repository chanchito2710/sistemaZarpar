/**
 * Controlador: Envíos de Stock de Fallas
 * 
 * Gestiona el envío de productos con fallas desde las sucursales
 * y mantiene un historial detallado de cada envío.
 */

import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * Helper: Ejecutar query con manejo de errores
 */
const executeQuery = async <T extends RowDataPacket[] | ResultSetHeader>(
  query: string,
  params: any[] = []
): Promise<T> => {
  try {
    const [rows] = await pool.execute<T>(query, params);
    return rows;
  } catch (error) {
    console.error('❌ Error en query:', error);
    throw error;
  }
};

/**
 * Registrar envío de stock de fallas
 * POST /api/envios-fallas
 */
export const registrarEnvioFallas = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { sucursal, observaciones } = req.body;
    const userEmail = (req as any).user?.email || 'sistema';
    
    console.log('📦 ===== REGISTRAR ENVÍO DE FALLAS =====');
    console.log('📊 Sucursal recibida:', sucursal);
    console.log('📧 Usuario:', userEmail);
    console.log('📝 Observaciones:', observaciones);
    
    if (!sucursal) {
      res.status(400).json({
        success: false,
        message: 'La sucursal es requerida'
      });
      return;
    }
    
    await connection.beginTransaction();
    
    // 1. Obtener productos con stock_fallas > 0 de la sucursal
    const queryProductosFallas = `
      SELECT 
        ps.producto_id,
        p.nombre as producto_nombre,
        p.marca as producto_marca,
        p.tipo as producto_tipo,
        ps.stock_fallas as cantidad
      FROM productos_sucursal ps
      INNER JOIN productos p ON ps.producto_id = p.id
      WHERE ps.sucursal = ?
        AND ps.stock_fallas > 0
        AND p.activo = 1
        AND ps.activo = 1
      ORDER BY p.nombre ASC
    `;
    
    console.log('🔍 Buscando productos con fallas en sucursal:', sucursal.toLowerCase());
    
    const productosFallas = await executeQuery<RowDataPacket[]>(
      queryProductosFallas,
      [sucursal.toLowerCase()]
    );
    
    console.log('📊 Productos con fallas encontrados:', productosFallas.length);
    
    if (productosFallas.length === 0) {
      await connection.rollback();
      console.log('⚠️ No hay productos con stock de fallas para enviar en:', sucursal);
      res.status(400).json({
        success: false,
        message: 'No hay productos con stock de fallas para enviar'
      });
      return;
    }
    
    // 2. Calcular totales
    const totalProductos = productosFallas.length;
    const totalUnidades = productosFallas.reduce((sum, p) => sum + Number(p.cantidad), 0);
    
    // 3. Insertar registro de envío
    const queryEnvio = `
      INSERT INTO historial_envios_fallas 
      (sucursal, usuario_email, total_productos, total_unidades, observaciones)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const resultEnvio = await executeQuery<ResultSetHeader>(queryEnvio, [
      sucursal.toLowerCase(),
      userEmail,
      totalProductos,
      totalUnidades,
      observaciones || null
    ]);
    
    const envioId = resultEnvio.insertId;
    
    // 4. Insertar detalle de cada producto
    const queryDetalle = `
      INSERT INTO historial_envios_fallas_detalle 
      (envio_id, producto_id, producto_nombre, producto_marca, producto_tipo, cantidad)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    for (const producto of productosFallas) {
      await executeQuery(queryDetalle, [
        envioId,
        producto.producto_id,
        producto.producto_nombre,
        producto.producto_marca || null,
        producto.producto_tipo || null,
        producto.cantidad
      ]);
    }
    
    // 5. Poner en cero el stock_fallas de todos los productos de la sucursal
    const queryActualizarStock = `
      UPDATE productos_sucursal
      SET stock_fallas = 0
      WHERE sucursal = ?
        AND stock_fallas > 0
    `;
    
    await executeQuery(queryActualizarStock, [sucursal.toLowerCase()]);
    
    await connection.commit();
    
    console.log(`✅ Envío de fallas registrado: ${totalProductos} productos, ${totalUnidades} unidades - Sucursal: ${sucursal}`);
    
    res.json({
      success: true,
      message: `Envío registrado exitosamente: ${totalProductos} productos, ${totalUnidades} unidades`,
      data: {
        envio_id: envioId,
        sucursal,
        total_productos: totalProductos,
        total_unidades: totalUnidades,
        productos: productosFallas
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error al registrar envío de fallas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar envío de fallas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    connection.release();
  }
};

/**
 * Obtener historial de envíos de fallas
 * GET /api/envios-fallas/historial
 */
export const obtenerHistorialEnvios = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, fecha_desde, fecha_hasta } = req.query;
    
    let query = `
      SELECT 
        e.id,
        e.sucursal,
        e.fecha_envio,
        e.usuario_email,
        e.total_productos,
        e.total_unidades,
        e.observaciones,
        e.created_at
      FROM historial_envios_fallas e
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Filtrar por sucursal
    if (sucursal && sucursal !== 'todas') {
      query += ' AND e.sucursal = ?';
      params.push((sucursal as string).toLowerCase());
    }
    
    // Filtrar por rango de fechas
    if (fecha_desde) {
      query += ' AND DATE(e.fecha_envio) >= ?';
      params.push(fecha_desde);
    }
    
    if (fecha_hasta) {
      query += ' AND DATE(e.fecha_envio) <= ?';
      params.push(fecha_hasta);
    }
    
    query += ' ORDER BY e.fecha_envio DESC LIMIT 100';
    
    const envios = await executeQuery<RowDataPacket[]>(query, params);
    
    res.json({
      success: true,
      data: envios,
      count: envios.length
    });
    
  } catch (error) {
    console.error('❌ Error al obtener historial de envíos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de envíos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener detalle de un envío específico
 * GET /api/envios-fallas/:id
 */
export const obtenerDetalleEnvio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // 1. Obtener información del envío
    const queryEnvio = `
      SELECT 
        e.id,
        e.sucursal,
        e.fecha_envio,
        e.usuario_email,
        e.total_productos,
        e.total_unidades,
        e.observaciones,
        e.created_at
      FROM historial_envios_fallas e
      WHERE e.id = ?
    `;
    
    const envios = await executeQuery<RowDataPacket[]>(queryEnvio, [id]);
    
    if (envios.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Envío no encontrado'
      });
      return;
    }
    
    const envio = envios[0];
    
    // 2. Obtener detalle de productos
    const queryDetalle = `
      SELECT 
        d.id,
        d.producto_id,
        d.producto_nombre,
        d.producto_marca,
        d.producto_tipo,
        d.cantidad,
        d.created_at
      FROM historial_envios_fallas_detalle d
      WHERE d.envio_id = ?
      ORDER BY d.producto_nombre ASC
    `;
    
    const detalle = await executeQuery<RowDataPacket[]>(queryDetalle, [id]);
    
    res.json({
      success: true,
      data: {
        ...envio,
        productos: detalle
      }
    });
    
  } catch (error) {
    console.error('❌ Error al obtener detalle de envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalle de envío',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

