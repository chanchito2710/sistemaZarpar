/**
 * Rutas de Devoluciones y Reemplazos
 */

import { Router } from 'express';
import {
  obtenerProductosVendidos,
  procesarDevolucion,
  procesarReemplazo,
  obtenerStockFallas,
  obtenerStockFallasPorFecha,
  obtenerSaldosFavor,
  obtenerHistorialReemplazos,
  obtenerDetalleFallas,
  obtenerEstadisticasFallas
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

// Obtener stock de fallas histórico por fecha
router.get('/stock-fallas-historico', obtenerStockFallasPorFecha);

// Obtener saldos a favor
router.get('/saldos-favor', obtenerSaldosFavor);

// Obtener historial de reemplazos de un producto
router.get('/historial-reemplazos/:detalleId', obtenerHistorialReemplazos);

// Obtener detalle de fallas de un producto
router.get('/detalle-fallas/:productoId', obtenerDetalleFallas);

// Obtener estadísticas completas de fallas
router.get('/estadisticas-fallas', obtenerEstadisticasFallas);

export default router;
