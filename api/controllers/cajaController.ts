/**
 * Controlador de Gestión de Caja
 * Maneja el efectivo de cada sucursal
 */

import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { executeQuery } from '../config/database.js';

/**
 * Obtener saldo de caja de una sucursal
 * GET /api/caja/:sucursal
 */
export const obtenerCaja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.params;
    
    const query = 'SELECT * FROM caja WHERE sucursal = ?';
    const [caja] = await executeQuery<RowDataPacket[]>(query, [sucursal.toLowerCase()]);
    
    if (!caja) {
      res.status(404).json({
        success: false,
        message: 'Caja no encontrada para esta sucursal'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: caja
    });
    
  } catch (error) {
    console.error('Error al obtener caja:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de caja',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener todas las cajas (todas las sucursales) con últimos movimientos
 * GET /api/caja
 */
export const obtenerTodasLasCajas = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📦 Obteniendo todas las cajas con últimos movimientos...');
    
    // 1. Obtener todas las cajas
    const queryCajas = 'SELECT * FROM caja ORDER BY sucursal';
    const cajas = await executeQuery<RowDataPacket[]>(queryCajas);
    
    // 2. Para cada caja, obtener los últimos 3 movimientos
    const cajasConMovimientos = await Promise.all(
      (cajas || []).map(async (caja) => {
        const queryMovimientos = `
          SELECT 
            id,
            tipo_movimiento,
            monto,
            concepto,
            created_at
          FROM movimientos_caja
          WHERE sucursal = ?
          ORDER BY created_at DESC
          LIMIT 3
        `;
        
        const movimientos = await executeQuery<RowDataPacket[]>(
          queryMovimientos, 
          [caja.sucursal]
        );
        
        return {
          ...caja,
          ultimos_movimientos: movimientos || []
        };
      })
    );
    
    console.log('✅ Cajas obtenidas con movimientos:', cajasConMovimientos?.length || 0);
    
    res.status(200).json({
      success: true,
      data: cajasConMovimientos || []
    });
    
  } catch (error) {
    console.error('❌ Error al obtener cajas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cajas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener historial de movimientos de caja
 * GET /api/caja/movimientos
 * Query params: sucursal, fecha_desde, fecha_hasta, tipo_movimiento
 */
export const obtenerMovimientos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, fecha_desde, fecha_hasta, tipo_movimiento } = req.query;
    
    let whereConditions = ['1=1'];
    let params: any[] = [];
    
    if (sucursal && sucursal !== 'todas') {
      whereConditions.push('m.sucursal = ?');
      params.push(sucursal);
    }
    
    if (fecha_desde) {
      whereConditions.push('DATE(m.created_at) >= ?');
      params.push(fecha_desde);
    }
    
    if (fecha_hasta) {
      whereConditions.push('DATE(m.created_at) <= ?');
      params.push(fecha_hasta);
    }
    
    if (tipo_movimiento && tipo_movimiento !== 'todos') {
      whereConditions.push('m.tipo_movimiento = ?');
      params.push(tipo_movimiento);
    }
    
    const query = `
      SELECT 
        m.*,
        v.numero_venta,
        CASE 
          WHEN m.tipo_movimiento = 'ingreso_venta' THEN 'Ingreso por Venta'
          WHEN m.tipo_movimiento = 'ingreso_cuenta_corriente' THEN 'Ingreso por Pago CC'
          WHEN m.tipo_movimiento = 'envio' THEN 'Envío de Dinero'
          WHEN m.tipo_movimiento = 'ajuste_manual' THEN 'Ajuste Manual'
        END as tipo_movimiento_texto
      FROM movimientos_caja m
      LEFT JOIN ventas v ON v.id = m.venta_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY m.created_at DESC
      LIMIT 500
    `;
    
    console.log('🔍 Query movimientos:', query);
    console.log('🔍 Params:', params);
    
    const movimientos = await executeQuery<RowDataPacket[]>(query, params);
    
    console.log('✅ Movimientos obtenidos:', movimientos?.length || 0);
    
    res.status(200).json({
      success: true,
      data: movimientos || []
    });
    
  } catch (error) {
    console.error('❌ Error al obtener movimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos de caja',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Registrar envío de dinero
 * POST /api/caja/envio
 * Body: { sucursal, monto, concepto, usuario_id, usuario_email }
 */
export const registrarEnvio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, monto, concepto, usuario_id, usuario_email } = req.body;
    
    // Validaciones
    if (!sucursal || !monto || !concepto) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: sucursal, monto, concepto'
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
    
    // Obtener caja actual
    const [cajaActual] = await executeQuery<RowDataPacket[]>(
      'SELECT * FROM caja WHERE sucursal = ?',
      [sucursal.toLowerCase()]
    );
    
    if (!cajaActual) {
      res.status(404).json({
        success: false,
        message: 'Caja no encontrada'
      });
      return;
    }
    
    const montoActual = Number(cajaActual.monto_actual);
    
    // Verificar que hay suficiente dinero
    if (montoActual < monto) {
      res.status(400).json({
        success: false,
        message: `Saldo insuficiente. Disponible: $${montoActual.toFixed(2)}`
      });
      return;
    }
    
    const nuevoMonto = montoActual - Number(monto);
    
    // Actualizar caja
    await executeQuery(
      'UPDATE caja SET monto_actual = ? WHERE sucursal = ?',
      [nuevoMonto, sucursal.toLowerCase()]
    );
    
    // Registrar movimiento
    await executeQuery(
      `INSERT INTO movimientos_caja 
       (sucursal, tipo_movimiento, monto, monto_anterior, monto_nuevo, concepto, usuario_id, usuario_email)
       VALUES (?, 'envio', ?, ?, ?, ?, ?, ?)`,
      [sucursal.toLowerCase(), -monto, montoActual, nuevoMonto, concepto, usuario_id, usuario_email]
    );
    
    res.status(200).json({
      success: true,
      message: 'Envío registrado exitosamente',
      data: {
        monto_anterior: montoActual,
        monto_enviado: monto,
        monto_nuevo: nuevoMonto
      }
    });
    
  } catch (error) {
    console.error('Error al registrar envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar envío',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Registrar gasto en efectivo
 * POST /api/caja/gasto
 * Body: { sucursal, monto, motivo, notas, usuario_id, usuario_email }
 */
export const registrarGasto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, monto, motivo, notas, usuario_id, usuario_email } = req.body;
    
    // Validaciones
    if (!sucursal || !monto || !motivo) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: sucursal, monto, motivo'
      });
      return;
    }
    
    // Si el motivo es "Otro", las notas son obligatorias
    if (motivo.toLowerCase() === 'otro' && (!notas || notas.trim() === '')) {
      res.status(400).json({
        success: false,
        message: 'Si el motivo es "Otro", debes especificar las notas'
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
    
    console.log('💸 Registrando gasto:', { sucursal, monto, motivo, notas });
    
    // Obtener caja actual
    const [cajaActual] = await executeQuery<RowDataPacket[]>(
      'SELECT * FROM caja WHERE sucursal = ?',
      [sucursal.toLowerCase()]
    );
    
    if (!cajaActual) {
      res.status(404).json({
        success: false,
        message: 'Caja no encontrada'
      });
      return;
    }
    
    const montoActual = Number(cajaActual.monto_actual);
    
    // Verificar que hay suficiente dinero
    if (montoActual < monto) {
      res.status(400).json({
        success: false,
        message: `Saldo insuficiente. Disponible: $${montoActual.toFixed(2)}`
      });
      return;
    }
    
    const nuevoMonto = montoActual - Number(monto);
    
    // Actualizar caja
    await executeQuery(
      'UPDATE caja SET monto_actual = ? WHERE sucursal = ?',
      [nuevoMonto, sucursal.toLowerCase()]
    );
    
    // Construir concepto
    const concepto = motivo.toLowerCase() === 'otro' 
      ? `Gasto: ${notas}` 
      : `Gasto de ${motivo}${notas ? ` - ${notas}` : ''}`;
    
    // Registrar movimiento
    await executeQuery(
      `INSERT INTO movimientos_caja 
       (sucursal, tipo_movimiento, monto, monto_anterior, monto_nuevo, concepto, usuario_id, usuario_email)
       VALUES (?, 'gasto', ?, ?, ?, ?, ?, ?)`,
      [sucursal.toLowerCase(), -monto, montoActual, nuevoMonto, concepto, usuario_id, usuario_email]
    );
    
    console.log('✅ Gasto registrado exitosamente');
    
    res.status(200).json({
      success: true,
      message: `Gasto de ${motivo} registrado exitosamente`,
      data: {
        monto_anterior: montoActual,
        monto_gastado: monto,
        monto_nuevo: nuevoMonto,
        concepto
      }
    });
    
  } catch (error) {
    console.error('Error al registrar gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar gasto',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Ajustar caja manualmente (solo administrador)
 * PUT /api/caja/:sucursal/ajustar
 * Body: { monto_nuevo, concepto, usuario_id, usuario_email }
 */
export const ajustarCaja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.params;
    const { monto_nuevo, concepto, usuario_id, usuario_email } = req.body;
    
    // Validaciones
    if (monto_nuevo === undefined || !concepto) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: monto_nuevo, concepto'
      });
      return;
    }
    
    if (monto_nuevo < 0) {
      res.status(400).json({
        success: false,
        message: 'El monto no puede ser negativo'
      });
      return;
    }
    
    // Obtener caja actual
    const [cajaActual] = await executeQuery<RowDataPacket[]>(
      'SELECT * FROM caja WHERE sucursal = ?',
      [sucursal.toLowerCase()]
    );
    
    if (!cajaActual) {
      res.status(404).json({
        success: false,
        message: 'Caja no encontrada'
      });
      return;
    }
    
    const montoAnterior = Number(cajaActual.monto_actual);
    const diferencia = Number(monto_nuevo) - montoAnterior;
    
    // Actualizar caja
    await executeQuery(
      'UPDATE caja SET monto_actual = ? WHERE sucursal = ?',
      [monto_nuevo, sucursal.toLowerCase()]
    );
    
    // Registrar movimiento
    await executeQuery(
      `INSERT INTO movimientos_caja 
       (sucursal, tipo_movimiento, monto, monto_anterior, monto_nuevo, concepto, usuario_id, usuario_email)
       VALUES (?, 'ajuste_manual', ?, ?, ?, ?, ?, ?)`,
      [sucursal.toLowerCase(), diferencia, montoAnterior, monto_nuevo, concepto, usuario_id, usuario_email]
    );
    
    res.status(200).json({
      success: true,
      message: 'Caja ajustada exitosamente',
      data: {
        monto_anterior: montoAnterior,
        monto_nuevo: Number(monto_nuevo),
        diferencia: diferencia
      }
    });
    
  } catch (error) {
    console.error('Error al ajustar caja:', error);
    res.status(500).json({
      success: false,
      message: 'Error al ajustar caja',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Registrar ingreso a caja (usado internamente por ventas y pagos CC)
 * POST /api/caja/registrar-ingreso
 * Body: { sucursal, monto, tipo_movimiento, concepto, venta_id?, pago_cuenta_corriente_id?, usuario_id?, usuario_email? }
 */
export const registrarIngreso = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      sucursal,
      monto,
      tipo_movimiento,
      concepto,
      venta_id,
      pago_cuenta_corriente_id,
      usuario_id,
      usuario_email
    } = req.body;
    
    // Validaciones
    if (!sucursal || !monto || !tipo_movimiento || !concepto) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
      return;
    }
    
    // Obtener caja actual
    const [cajaActual] = await executeQuery<RowDataPacket[]>(
      'SELECT * FROM caja WHERE sucursal = ?',
      [sucursal.toLowerCase()]
    );
    
    if (!cajaActual) {
      res.status(404).json({
        success: false,
        message: 'Caja no encontrada'
      });
      return;
    }
    
    const montoActual = Number(cajaActual.monto_actual);
    const nuevoMonto = montoActual + Number(monto);
    
    // Actualizar caja
    await executeQuery(
      'UPDATE caja SET monto_actual = ? WHERE sucursal = ?',
      [nuevoMonto, sucursal.toLowerCase()]
    );
    
    // Registrar movimiento
    await executeQuery(
      `INSERT INTO movimientos_caja 
       (sucursal, tipo_movimiento, monto, monto_anterior, monto_nuevo, concepto, venta_id, pago_cuenta_corriente_id, usuario_id, usuario_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sucursal.toLowerCase(),
        tipo_movimiento,
        monto,
        montoActual,
        nuevoMonto,
        concepto,
        venta_id || null,
        pago_cuenta_corriente_id || null,
        usuario_id || null,
        usuario_email || null
      ]
    );
    
    res.status(200).json({
      success: true,
      message: 'Ingreso registrado exitosamente',
      data: {
        monto_anterior: montoActual,
        monto_ingreso: monto,
        monto_nuevo: nuevoMonto
      }
    });
    
  } catch (error) {
    console.error('Error al registrar ingreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar ingreso',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

