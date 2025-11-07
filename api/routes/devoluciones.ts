/**
 * Rutas de Devoluciones y Reemplazos
 */

import { Router } from 'express';
import {
  obtenerProductosVendidos,
  procesarDevolucion,
  procesarReemplazo,
  obtenerStockFallas,
  obtenerSaldosFavor
} from '../controllers/devolucionesController.js';
import { verificarAutenticacion } from '../middleware/auth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// Obtener productos vendidos con garantía
router.get('/productos-vendidos', obtenerProductosVendidos);

// Procesar devolución
router.post('/devolver', procesarDevolucion);

// Procesar reemplazo
router.post('/reemplazar', procesarReemplazo);

// Obtener stock de fallas
router.get('/stock-fallas', obtenerStockFallas);

// Obtener saldos a favor
router.get('/saldos-favor', obtenerSaldosFavor);

export default router;

