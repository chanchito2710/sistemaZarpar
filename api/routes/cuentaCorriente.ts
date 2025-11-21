import express from 'express';
import { 
  registrarSaldoInicial,
  obtenerSaldoCuentaCorriente
} from '../controllers/cuentaCorrienteController.js';
import { verificarAutenticacion, verificarAdmin } from '../middleware/auth.js';
import { pool } from '../config/database.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

/**
 * POST /api/cuenta-corriente/saldo-inicial
 * Registrar saldo inicial de cuenta corriente (migración desde sistema anterior)
 * SOLO ADMINISTRADOR
 */
router.post('/saldo-inicial', verificarAdmin, registrarSaldoInicial);

/**
 * GET /api/cuenta-corriente/saldo/:sucursal/:cliente_id
 * Obtener saldo actual de cuenta corriente de un cliente
 */
router.get('/saldo/:sucursal/:cliente_id', obtenerSaldoCuentaCorriente);

/**
 * GET /api/cuenta-corriente/ajustes-manuales
 * Obtener historial de ajustes manuales de cuenta corriente
 * Query params: fecha_desde, fecha_hasta, sucursal
 */
router.get('/ajustes-manuales', async (req: any, res: any) => {
  try {
    const { fecha_desde, fecha_hasta, sucursal } = req.query;
    
    let query = `
      SELECT 
        id, sucursal, cliente_id, cliente_nombre, tipo, 
        debe, haber, saldo, descripcion, fecha_movimiento
      FROM cuenta_corriente_movimientos
      WHERE tipo = 'ajuste'
    `;
    
    const params: any[] = [];
    
    if (sucursal && sucursal !== 'todas') {
      query += ' AND sucursal = ?';
      params.push(sucursal.toLowerCase());
    }
    
    if (fecha_desde) {
      query += ' AND DATE(fecha_movimiento) >= ?';
      params.push(fecha_desde);
    }
    
    if (fecha_hasta) {
      query += ' AND DATE(fecha_movimiento) <= ?';
      params.push(fecha_hasta);
    }
    
    query += ' ORDER BY fecha_movimiento DESC';
    
    const [results] = await pool.execute(query, params);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error al obtener ajustes manuales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ajustes manuales',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;

