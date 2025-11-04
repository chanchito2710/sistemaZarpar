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
  obtenerClientesCuentaCorriente,
  obtenerHistorialVentas,
  obtenerHistorialPagosCuentaCorriente,
  obtenerUltimasVentas,
  obtenerVentasDelDia,
  guardarResumenDiario,
  obtenerVentasGlobales
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
 * GET /api/ventas/historial
 * Obtener historial completo de ventas (todas las sucursales o filtradas)
 * Query params: sucursal, fecha_desde, fecha_hasta, metodo_pago, estado_pago
 * ⚠️ IMPORTANTE: Esta ruta debe ir ANTES de /sucursal/:sucursal 
 * para que Express no interprete "historial" como nombre de sucursal
 */
router.get('/historial', obtenerHistorialVentas);

/**
 * GET /api/ventas/historial-pagos-cuenta-corriente
 * Obtener historial de pagos de cuenta corriente
 * Query params: sucursal, fechaDesde, fechaHasta
 * ⚠️ IMPORTANTE: Esta ruta debe ir ANTES de /:id
 * para que Express no interprete la ruta como un ID
 */
router.get('/historial-pagos-cuenta-corriente', obtenerHistorialPagosCuentaCorriente);

/**
 * GET /api/ventas/ultimas/:limit?
 * Obtener las últimas ventas (para dashboard)
 * Params: limit (opcional, default 4)
 * ⚠️ IMPORTANTE: Esta ruta debe ir ANTES de /:id
 */
router.get('/ultimas/:limit?', obtenerUltimasVentas);

/**
 * GET /api/ventas/ventas-del-dia
 * Obtener ventas del día actual (todas las sucursales)
 * ⚠️ IMPORTANTE: Esta ruta debe ir ANTES de /:id
 */
router.get('/ventas-del-dia', obtenerVentasDelDia);

/**
 * POST /api/ventas/guardar-resumen-diario
 * Guardar resumen diario de ventas (para el cron job)
 */
router.post('/guardar-resumen-diario', guardarResumenDiario);

/**
 * GET /api/ventas/ventas-globales
 * Obtener historial de ventas diarias con filtros
 * Query params: fecha_desde, fecha_hasta, sucursal
 * ⚠️ IMPORTANTE: Esta ruta debe ir ANTES de /:id
 */
router.get('/ventas-globales', obtenerVentasGlobales);

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







