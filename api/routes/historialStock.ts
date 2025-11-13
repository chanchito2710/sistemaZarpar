/**
 * Rutas API para Historial de Stock
 */

import express from 'express';
import { verificarAutenticacion } from '../middleware/auth.js';
import {
  obtenerHistorialStock,
  obtenerEstadisticas
} from '../controllers/historialStockController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

/**
 * GET /api/historial-stock
 * Obtener historial de movimientos con filtros
 */
router.get('/', obtenerHistorialStock);

/**
 * GET /api/historial-stock/estadisticas
 * Obtener estadísticas del historial
 */
router.get('/estadisticas', obtenerEstadisticas);

export default router;


