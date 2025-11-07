/**
 * Controlador de Sueldos - Sistema Manual
 * Reemplaza el sistema automático de comisiones
 */

import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * Obtener todos los sueldos con filtros
 * GET /api/sueldos
 * Query params: ?fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD&sucursal=nombre&vendedor_id=id
 */
export const obtenerSueldos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_desde, fecha_hasta, sucursal, vendedor_id } = req.query;
    const userEmail = (req as any).user?.email;
    const esAdmin = userEmail === 'admin@zarparuy.com';
    
    let query = `
      SELECT 
        s.id,
        s.vendedor_id,
        s.sucursal,
        s.monto,
        s.fecha,
        s.notas,
        s.usuario_registro,
        s.created_at,
        v.nombre as vendedor_nombre,
        v.apellido as vendedor_apellido
      FROM sueldos s
      INNER JOIN vendedores v ON s.vendedor_id = v.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Si es usuario normal, filtrar por su sucursal
    if (!esAdmin && userEmail) {
      const sucursalUsuario = userEmail.split('@')[0];
      query += ` AND s.sucursal = ?`;
      params.push(sucursalUsuario);
    }
    
    // Filtros opcionales
    if (fecha_desde) {
      query += ` AND s.fecha >= ?`;
      params.push(fecha_desde);
    }
    
    if (fecha_hasta) {
      query += ` AND s.fecha <= ?`;
      params.push(fecha_hasta);
    }
    
    if (sucursal && esAdmin) {
      query += ` AND s.sucursal = ?`;
      params.push(sucursal);
    }
    
    if (vendedor_id) {
      query += ` AND s.vendedor_id = ?`;
      params.push(vendedor_id);
    }
    
    query += ` ORDER BY s.fecha DESC, s.created_at DESC`;
    
    const [sueldos] = await pool.execute<RowDataPacket[]>(query, params);
    
    res.json({
      success: true,
      data: sueldos,
      message: `${sueldos.length} registros encontrados`
    });
  } catch (error) {
    console.error('Error al obtener sueldos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sueldos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Crear nuevo registro de sueldo
 * POST /api/sueldos
 * Body: { vendedor_id, monto, fecha, notas? }
 */
export const crearSueldo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendedor_id, monto, fecha, notas } = req.body;
    const userEmail = (req as any).user?.email;
    
    // Validaciones
    if (!vendedor_id || !monto || !fecha) {
      res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: vendedor_id, monto, fecha'
      });
      return;
    }
    
    if (monto <= 0) {
      res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a 0'
      });
      return;
    }
    
    // Obtener datos del vendedor
    const [vendedorRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, nombre, apellido, sucursal FROM vendedores WHERE id = ?',
      [vendedor_id]
    );
    
    if (vendedorRows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado'
      });
      return;
    }
    
    const vendedor = vendedorRows[0];
    const sucursal = vendedor.sucursal;
    
    // 🔍 DEBUG: Ver valores antes del INSERT
    console.log('📊 Valores para INSERT:', {
      vendedor_id,
      sucursal,
      monto,
      fecha,
      notas: notas || null,
      userEmail: userEmail || null
    });
    
    // ========================================
    // TRANSACCIÓN: Registrar comisión + Descontar de caja
    // ========================================
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 1. Insertar registro de sueldo/comisión
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO sueldos (vendedor_id, sucursal, monto, fecha, notas, usuario_registro)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [vendedor_id, sucursal, monto, fecha, notas || null, userEmail || null]
      );
      
      const sueldoId = result.insertId;
      
      // 2. Obtener monto actual de la caja de esta sucursal
      const [cajaRows] = await connection.execute<RowDataPacket[]>(
        'SELECT id, monto_actual FROM caja WHERE sucursal = ?',
        [sucursal]
      );
      
      // Si no existe la caja para esta sucursal, crearla con saldo 0
      let montoAnterior = 0;
      if (cajaRows.length === 0) {
        await connection.execute(
          'INSERT INTO caja (sucursal, monto_actual) VALUES (?, 0)',
          [sucursal]
        );
      } else {
        montoAnterior = Number(cajaRows[0].monto_actual);
      }
      
      // Calcular nuevo monto (restamos porque es un egreso)
      const montoNuevo = montoAnterior - monto;
      
      // Validar que no quede en negativo (advertencia pero permitimos)
      if (montoNuevo < 0) {
        console.warn(`⚠️ ADVERTENCIA: Caja de ${sucursal} quedará en negativo: $${montoNuevo}`);
      }
      
      // 3. Actualizar el monto de la caja
      await connection.execute(
        'UPDATE caja SET monto_actual = ? WHERE sucursal = ?',
        [montoNuevo, sucursal]
      );
      
      // 4. Registrar movimiento en historial de caja
      await connection.execute(
        `INSERT INTO movimientos_caja 
         (sucursal, tipo_movimiento, monto, monto_anterior, monto_nuevo, concepto, usuario_email)
         VALUES (?, 'pago_comision', ?, ?, ?, ?, ?)`,
        [
          sucursal,
          -monto, // Negativo porque es un egreso
          montoAnterior,
          montoNuevo,
          `Pago de comisión a ${vendedor.nombre} ${vendedor.apellido || ''} - Sueldo #${sueldoId}`,
          userEmail || null
        ]
      );
      
      // Confirmar transacción
      await connection.commit();
      
      console.log(`✅ Comisión registrada y descontada de caja ${sucursal}: $${monto}`);
      
      res.status(201).json({
        success: true,
        message: `Comisión registrada y descontada de caja de ${sucursal.toUpperCase()}`,
        data: {
          id: sueldoId,
          vendedor_id,
          sucursal,
          monto,
          fecha,
          notas,
          caja: {
            monto_anterior: montoAnterior,
            monto_nuevo: montoNuevo,
            descontado: monto
          }
        }
      });
      
    } catch (error) {
      // Revertir transacción en caso de error
      await connection.rollback();
      throw error;
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al crear sueldo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear sueldo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Actualizar registro de sueldo
 * PUT /api/sueldos/:id
 * Body: { monto?, fecha?, notas? }
 */
export const actualizarSueldo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { monto, fecha, notas } = req.body;
    
    // Verificar que el sueldo existe
    const [sueldoRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM sueldos WHERE id = ?',
      [id]
    );
    
    if (sueldoRows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Sueldo no encontrado'
      });
      return;
    }
    
    // Construir query de actualización dinámica
    const updates: string[] = [];
    const params: any[] = [];
    
    if (monto !== undefined) {
      if (monto <= 0) {
        res.status(400).json({
          success: false,
          message: 'El monto debe ser mayor a 0'
        });
        return;
      }
      updates.push('monto = ?');
      params.push(monto);
    }
    
    if (fecha) {
      updates.push('fecha = ?');
      params.push(fecha);
    }
    
    if (notas !== undefined) {
      updates.push('notas = ?');
      params.push(notas);
    }
    
    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No hay datos para actualizar'
      });
      return;
    }
    
    params.push(id);
    
    await pool.execute(
      `UPDATE sueldos SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    res.json({
      success: true,
      message: 'Sueldo actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar sueldo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar sueldo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Eliminar registro de sueldo
 * DELETE /api/sueldos/:id
 */
export const eliminarSueldo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userEmail = (req as any).user?.email;
    const esAdmin = userEmail === 'admin@zarparuy.com';
    
    // Solo administradores pueden eliminar
    if (!esAdmin) {
      res.status(403).json({
        success: false,
        message: 'Solo administradores pueden eliminar registros de sueldos'
      });
      return;
    }
    
    // Verificar que existe
    const [sueldoRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM sueldos WHERE id = ?',
      [id]
    );
    
    if (sueldoRows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Sueldo no encontrado'
      });
      return;
    }
    
    await pool.execute('DELETE FROM sueldos WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Sueldo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar sueldo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar sueldo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener resumen de sueldos (totales por período)
 * GET /api/sueldos/resumen
 * Query params: ?fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD&sucursal=nombre
 */
export const obtenerResumenSueldos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_desde, fecha_hasta, sucursal } = req.query;
    const userEmail = (req as any).user?.email;
    const esAdmin = userEmail === 'admin@zarparuy.com';
    
    let query = `
      SELECT 
        s.sucursal,
        COUNT(DISTINCT s.id) as total_pagos,
        COUNT(DISTINCT s.vendedor_id) as total_vendedores,
        SUM(s.monto) as total_monto
      FROM sueldos s
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (!esAdmin && userEmail) {
      const sucursalUsuario = userEmail.split('@')[0];
      query += ` AND s.sucursal = ?`;
      params.push(sucursalUsuario);
    }
    
    if (fecha_desde) {
      query += ` AND s.fecha >= ?`;
      params.push(fecha_desde);
    }
    
    if (fecha_hasta) {
      query += ` AND s.fecha <= ?`;
      params.push(fecha_hasta);
    }
    
    if (sucursal && esAdmin) {
      query += ` AND s.sucursal = ?`;
      params.push(sucursal);
    }
    
    query += ` GROUP BY s.sucursal ORDER BY s.sucursal`;
    
    const [resumen] = await pool.execute<RowDataPacket[]>(query, params);
    
    res.json({
      success: true,
      data: resumen
    });
  } catch (error) {
    console.error('Error al obtener resumen de sueldos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen de sueldos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

