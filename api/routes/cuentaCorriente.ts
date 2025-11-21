import express from 'express';
import { 
  registrarSaldoInicial,
  obtenerSaldoCuentaCorriente
} from '../controllers/cuentaCorrienteController.js';
import { verificarAutenticacion } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

/**
 * POST /api/cuenta-corriente/saldo-inicial
 * Registrar saldo inicial de cuenta corriente (migración desde sistema anterior)
 */
router.post('/saldo-inicial', registrarSaldoInicial);

/**
 * GET /api/cuenta-corriente/saldo/:sucursal/:cliente_id
 * Obtener saldo actual de cuenta corriente de un cliente
 */
router.get('/saldo/:sucursal/:cliente_id', obtenerSaldoCuentaCorriente);

export default router;

