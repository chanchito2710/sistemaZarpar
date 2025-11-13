/**
 * Rutas de Gestión de Caja
 */

import { Router } from 'express';
import {
  obtenerCaja,
  obtenerTodasLasCajas,
  obtenerMovimientos,
  registrarEnvio,
  ajustarCaja,
  registrarIngreso,
  registrarGasto,
  registrarTransferencia
} from '../controllers/cajaController.js';
import { verificarAutenticacion, verificarAdmin } from '../middleware/auth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// Obtener todas las cajas
router.get('/', (req, res, next) => {
  console.log('🔵 Ruta alcanzada: GET /api/caja');
  next();
}, obtenerTodasLasCajas);

// Obtener historial de movimientos (DEBE IR ANTES de /:sucursal)
router.get('/movimientos/historial', obtenerMovimientos);

// Registrar envío de dinero (todos los usuarios)
router.post('/envio', registrarEnvio);

// Registrar gasto en efectivo (todos los usuarios)
router.post('/gasto', registrarGasto);

// Registrar transferencia entre sucursales (todos los usuarios)
router.post('/transferencia', registrarTransferencia);

// Registrar ingreso (uso interno desde ventas/pagos CC)
router.post('/registrar-ingreso', registrarIngreso);

// Ajustar caja manualmente (solo administrador)
router.put('/:sucursal/ajustar', verificarAdmin, ajustarCaja);

// Obtener caja de una sucursal específica (DEBE IR AL FINAL)
router.get('/:sucursal', obtenerCaja);

export default router;

