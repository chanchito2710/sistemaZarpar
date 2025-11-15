/**
 * Rutas para gestión de devoluciones y reemplazos
 */

import { Router } from 'express';
import { obtenerDevolucionesCliente, obtenerProductosVendidos } from '../controllers/ventasController';

const router = Router();

/**
 * GET /api/devoluciones/productos-vendidos
 * Obtener todos los productos vendidos con información de garantía
 * Query params: sucursal, fecha_desde, fecha_hasta (opcional)
 */
router.get('/productos-vendidos', obtenerProductosVendidos);

/**
 * GET /api/devoluciones/cliente/:sucursal/:cliente_id
 * Obtener devoluciones y reemplazos de un cliente
 * Query params: fecha_desde, fecha_hasta (opcional)
 */
router.get('/cliente/:sucursal/:cliente_id', obtenerDevolucionesCliente);

export default router;
