/**
 * Controlador para el Carrito de Transferencias
 * Gestiona las transferencias pendientes que persisten en la base de datos
 */

import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * Obtener todo el carrito del usuario
 * GET /api/carrito-transferencias
 */
export const obtenerCarrito = async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = (req as any).user?.email;
    
    const [carrito] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        ct.id,
        ct.producto_id,
        ct.sucursal_destino,
        ct.cantidad,
        p.nombre as producto_nombre,
        p.marca as producto_marca
       FROM transferencias_carrito ct
       INNER JOIN productos p ON ct.producto_id = p.id
       WHERE ct.usuario_email = ?
       ORDER BY ct.created_at DESC`,
      [userEmail]
    );
    
    res.json({
      success: true,
      data: carrito,
      message: `${carrito.length} items en el carrito`
    });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener carrito',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Agregar o actualizar item en el carrito
 * POST /api/carrito-transferencias
 * Body: { producto_id, sucursal_destino, cantidad }
 */
export const agregarAlCarrito = async (req: Request, res: Response): Promise<void> => {
  try {
    const { producto_id, sucursal_destino, cantidad } = req.body;
    const userEmail = (req as any).user?.email;
    
    // Validaciones
    if (!producto_id || !sucursal_destino || cantidad === undefined) {
      res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: producto_id, sucursal_destino, cantidad'
      });
      return;
    }
    
    if (cantidad < 0) {
      res.status(400).json({
        success: false,
        message: 'La cantidad no puede ser negativa'
      });
      return;
    }
    
    // Si cantidad es 0, eliminar del carrito
    if (cantidad === 0) {
      await pool.execute(
        'DELETE FROM transferencias_carrito WHERE producto_id = ? AND sucursal_destino = ? AND usuario_email = ?',
        [producto_id, sucursal_destino, userEmail]
      );
      
      res.json({
        success: true,
        message: 'Item eliminado del carrito',
        data: { producto_id, sucursal_destino, cantidad: 0 }
      });
      return;
    }
    
    // Insertar o actualizar (ON DUPLICATE KEY UPDATE)
    await pool.execute(
      `INSERT INTO transferencias_carrito 
       (producto_id, sucursal_destino, cantidad, usuario_email) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       cantidad = VALUES(cantidad),
       updated_at = CURRENT_TIMESTAMP`,
      [producto_id, sucursal_destino, cantidad, userEmail]
    );
    
    res.json({
      success: true,
      message: 'Item agregado/actualizado en el carrito',
      data: { producto_id, sucursal_destino, cantidad }
    });
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar al carrito',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Eliminar item específico del carrito
 * DELETE /api/carrito-transferencias/:producto_id/:sucursal
 */
export const eliminarDelCarrito = async (req: Request, res: Response): Promise<void> => {
  try {
    const { producto_id, sucursal } = req.params;
    const userEmail = (req as any).user?.email;
    
    await pool.execute(
      'DELETE FROM transferencias_carrito WHERE producto_id = ? AND sucursal_destino = ? AND usuario_email = ?',
      [producto_id, sucursal, userEmail]
    );
    
    res.json({
      success: true,
      message: 'Item eliminado del carrito'
    });
  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar del carrito',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Vaciar completamente el carrito (después de confirmar envío)
 * DELETE /api/carrito-transferencias
 */
export const vaciarCarrito = async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = (req as any).user?.email;
    
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM transferencias_carrito WHERE usuario_email = ?',
      [userEmail]
    );
    
    res.json({
      success: true,
      message: `Carrito vaciado. ${result.affectedRows} items eliminados`,
      data: { items_eliminados: result.affectedRows }
    });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al vaciar carrito',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener resumen del carrito (total de items y unidades)
 * GET /api/carrito-transferencias/resumen
 */
export const obtenerResumenCarrito = async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = (req as any).user?.email;
    
    const [resumen] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(DISTINCT producto_id) as total_productos,
        COUNT(DISTINCT sucursal_destino) as total_sucursales,
        SUM(cantidad) as total_unidades
       FROM transferencias_carrito
       WHERE usuario_email = ?`,
      [userEmail]
    );
    
    res.json({
      success: true,
      data: resumen[0] || { total_productos: 0, total_sucursales: 0, total_unidades: 0 }
    });
  } catch (error) {
    console.error('Error al obtener resumen del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen del carrito',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};





