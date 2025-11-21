/**
 * Rutas para gestión de devoluciones y reemplazos
 */

import { Router } from 'express';
import { obtenerDevolucionesCliente } from '../controllers/ventasController.js';
import { 
  obtenerProductosVendidos,
  procesarDevolucion, 
  procesarReemplazo,
  obtenerStockFallas,
  obtenerSaldosFavor,
  obtenerHistorialReemplazos,
  obtenerDetalleFallas,
  obtenerEstadisticasFallas,
  obtenerListadoDevoluciones
} from '../controllers/devolucionesController.js';

const router = Router();

/**
 * GET /api/devoluciones/productos-vendidos
 * Obtener todos los productos vendidos con información de garantía
 * Query params: sucursal, fecha_desde, fecha_hasta (opcional)
 */
router.get('/productos-vendidos', obtenerProductosVendidos);

/**
 * POST /api/devoluciones/devolver
 * Procesar devolución de producto (con o sin efectivo)
 */
router.post('/devolver', procesarDevolucion);

/**
 * POST /api/devoluciones/reemplazar
 * Procesar reemplazo de producto (garantía)
 */
router.post('/reemplazar', procesarReemplazo);

/**
 * GET /api/devoluciones/stock-fallas
 * Obtener stock de productos con fallas
 * Query params: sucursal (opcional)
 */
router.get('/stock-fallas', obtenerStockFallas);

/**
 * GET /api/devoluciones/saldos-favor
 * Obtener saldos a favor de clientes
 * Query params: sucursal (opcional)
 */
router.get('/saldos-favor', obtenerSaldosFavor);

/**
 * GET /api/devoluciones/historial-reemplazos/:detalleId
 * Obtener historial de reemplazos de un producto vendido
 */
router.get('/historial-reemplazos/:detalleId', obtenerHistorialReemplazos);

/**
 * GET /api/devoluciones/detalle-fallas/:productoId
 * Obtener detalle de fallas de un producto específico
 * Query params: sucursal (opcional)
 */
router.get('/detalle-fallas/:productoId', obtenerDetalleFallas);

/**
 * GET /api/devoluciones/listado
 * Obtener listado de todas las devoluciones con filtros
 * Query params: sucursal, fecha_desde, fecha_hasta, metodo_devolucion (opcionales)
 */
router.get('/listado', obtenerListadoDevoluciones);

/**
 * GET /api/devoluciones/estadisticas-fallas
 * Obtener estadísticas completas de fallas
 * Query params: sucursal, fechaInicio, fechaFin (opcionales)
 */
router.get('/estadisticas-fallas', obtenerEstadisticasFallas);

/**
 * GET /api/devoluciones/cliente/:sucursal/:cliente_id
 * Obtener devoluciones y reemplazos de un cliente
 * Query params: fecha_desde, fecha_hasta (opcional)
 */
router.get('/cliente/:sucursal/:cliente_id', obtenerDevolucionesCliente);

export default router;
