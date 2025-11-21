import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * Registrar saldo inicial de cuenta corriente (para migración desde sistema anterior)
 * POST /api/cuenta-corriente/saldo-inicial
 */
export const registrarSaldoInicial = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { sucursal, cliente_id, cliente_nombre, monto, concepto } = req.body;
    const usuario = (req as any).usuario;

    // Validaciones
    if (!sucursal || !cliente_id || !cliente_nombre || monto === undefined || monto === null) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: sucursal, cliente_id, cliente_nombre, monto'
      });
      return;
    }

    if (monto === 0) {
      res.status(400).json({
        success: false,
        message: 'El monto no puede ser cero'
      });
      return;
    }

    console.log('💳 Registrando saldo inicial de cuenta corriente...');
    console.log('Datos:', { sucursal, cliente_id, cliente_nombre, monto, concepto });

    await connection.beginTransaction();

    // Determinar DEBE y HABER según signo del monto
    // Monto positivo = Cliente DEBE (deuda)
    // Monto negativo = Cliente tiene SALDO A FAVOR (crédito/haber)
    const montoAbsoluto = Math.abs(monto);
    const debe = monto > 0 ? montoAbsoluto : 0;
    const haber = monto < 0 ? montoAbsoluto : 0;
    const saldo = monto; // El saldo es el monto directamente (positivo=debe, negativo=a favor)

    // Registrar movimiento en cuenta_corriente_movimientos
    const [movimientoResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO cuenta_corriente_movimientos 
       (sucursal, cliente_id, cliente_nombre, tipo, debe, haber, saldo, descripcion, fecha_movimiento)
       VALUES (?, ?, ?, 'ajuste', ?, ?, ?, ?, NOW())`,
      [
        sucursal,
        cliente_id,
        cliente_nombre,
        debe,
        haber,
        saldo,
        concepto || 'Migración de saldo desde sistema anterior'
      ]
    );

    console.log(`✅ Movimiento registrado con ID: ${movimientoResult.insertId}`);
    console.log(`📊 Debe: $${debe}, Haber: $${haber}, Saldo: $${saldo}`);

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Saldo inicial registrado exitosamente',
      data: {
        movimiento_id: movimientoResult.insertId,
        debe,
        haber,
        saldo
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error al registrar saldo inicial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar saldo inicial de cuenta corriente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    connection.release();
  }
};

/**
 * Obtener saldo actual de cuenta corriente de un cliente
 * GET /api/cuenta-corriente/saldo/:sucursal/:cliente_id
 */
export const obtenerSaldoCuentaCorriente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, cliente_id } = req.params;

    if (!sucursal || !cliente_id) {
      res.status(400).json({
        success: false,
        message: 'Faltan parámetros: sucursal y cliente_id'
      });
      return;
    }

    // Obtener el saldo actual desde la vista resumen_cuenta_corriente
    const [saldoRows] = await pool.execute<RowDataPacket[]>(
      `SELECT saldo_actual 
       FROM resumen_cuenta_corriente 
       WHERE sucursal = ? AND cliente_id = ?`,
      [sucursal, cliente_id]
    );

    const saldo = saldoRows.length > 0 ? saldoRows[0].saldo_actual : 0;

    res.status(200).json({
      success: true,
      data: {
        sucursal,
        cliente_id,
        saldo_actual: saldo
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener saldo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener saldo de cuenta corriente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

