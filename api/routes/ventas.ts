/**
 * Rutas para gestión de ventas
 */

import { Router } from 'express';
import {
  crearVenta,
  obtenerVentasPorSucursal,
  obtenerDetalleVenta,
  obtenerVentasPorCliente,
  obtenerCuentaCorriente,
  registrarPagoCuentaCorriente,
  obtenerReportesVentas,
  obtenerClientesCuentaCorriente
} from '../controllers/ventasController';

const router = Router();

// ============================================================
// RUTAS DE VENTAS
// ============================================================

/**
 * POST /api/ventas
 * Crear una nueva venta
 */
router.post('/', crearVenta);

/**
 * GET /api/ventas/sucursal/:sucursal
 * Obtener ventas por sucursal (con filtros opcionales)
 * Query params: fecha_inicio, fecha_fin, cliente_id, metodo_pago, estado_pago
 */
router.get('/sucursal/:sucursal', obtenerVentasPorSucursal);

/**
 * GET /api/ventas/:id
 * Obtener detalle completo de una venta
 */
router.get('/:id', obtenerDetalleVenta);

/**
 * GET /api/ventas/cliente/:sucursal/:cliente_id
 * Obtener todas las ventas de un cliente específico
 */
router.get('/cliente/:sucursal/:cliente_id', obtenerVentasPorCliente);

// ============================================================
// RUTAS DE CUENTA CORRIENTE
// ============================================================

/**
 * GET /api/ventas/cuenta-corriente/:sucursal/:cliente_id
 * Obtener estado de cuenta corriente de un cliente
 */
router.get('/cuenta-corriente/:sucursal/:cliente_id', obtenerCuentaCorriente);

/**
 * GET /api/ventas/clientes-cuenta-corriente/:sucursal
 * Obtener todos los clientes con saldo en cuenta corriente
 */
router.get('/clientes-cuenta-corriente/:sucursal', obtenerClientesCuentaCorriente);

/**
 * POST /api/ventas/pago-cuenta-corriente
 * Registrar un pago en cuenta corriente
 */
router.post('/pago-cuenta-corriente', registrarPagoCuentaCorriente);

// ============================================================
// RUTAS DE REPORTES
// ============================================================

/**
 * GET /api/ventas/reportes/:sucursal
 * Obtener reportes de ventas por rango de fechas
 * Query params: fecha_inicio, fecha_fin
 */
router.get('/reportes/:sucursal', obtenerReportesVentas);

export default router;




