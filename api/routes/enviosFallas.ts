/**
 * Rutas: Envíos de Stock de Fallas
 */

import express from 'express';
import { verificarAutenticacion } from '../middleware/auth.js';
import {
  registrarEnvioFallas,
  obtenerHistorialEnvios,
  obtenerDetalleEnvio
} from '../controllers/enviosFallasController.js';

const router = express.Router();

// ========================================
// Todas las rutas requieren autenticación
// ========================================
router.use(verificarAutenticacion);

// ========================================
// RUTAS PÚBLICAS (para usuarios autenticados)
// ========================================

/**
 * POST /api/envios-fallas
 * Registrar un envío de stock de fallas
 * Body: { sucursal, observaciones }
 */
router.post('/', registrarEnvioFallas);

/**
 * GET /api/envios-fallas/historial
 * Obtener historial de envíos con filtros
 * Query params: sucursal, fecha_desde, fecha_hasta
 */
router.get('/historial', obtenerHistorialEnvios);

/**
 * GET /api/envios-fallas/:id
 * Obtener detalle de un envío específico
 */
router.get('/:id', obtenerDetalleEnvio);

export default router;

