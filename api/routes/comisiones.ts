/**
 * Rutas de Comisiones
 * Endpoints para gestionar comisiones de vendedores
 */

import express from 'express';
import {
  obtenerConfiguracionComisiones,
  actualizarComision,
  sincronizarTiposProductos,
  obtenerResumenComisiones,
  obtenerDetalleComisiones,
  obtenerHistorialCambios,
  obtenerHistorialPagosComision,
  obtenerComisionesVendedor,
  establecerComisionPersonalizada,
  eliminarComisionPersonalizada,
  obtenerDetalleComisionesPorVentas,
  obtenerResumenPorTipo,
  obtenerRemanentes
} from '../controllers/comisionesController.js';
import { verificarAutenticacion } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

/**
 * GET /api/comisiones/configuracion
 * Obtener configuración de comisiones por tipo
 */
router.get('/configuracion', obtenerConfiguracionComisiones);

/**
 * PUT /api/comisiones/configuracion/:id
 * Actualizar monto de una comisión
 * Solo administradores
 */
router.put('/configuracion/:id', actualizarComision);

/**
 * POST /api/comisiones/sincronizar-tipos
 * Sincronizar nuevos tipos de productos
 * Solo administradores
 */
router.post('/sincronizar-tipos', sincronizarTiposProductos);

/**
 * GET /api/comisiones/resumen-vendedores
 * Obtener resumen de comisiones por vendedor
 * Query params: fecha_desde, fecha_hasta, sucursal, vendedor_id
 */
router.get('/resumen-vendedores', obtenerResumenComisiones);

/**
 * GET /api/comisiones/detalle-por-ventas
 * Obtener detalle de comisiones por venta individual (NO agrupadas)
 * Retorna cada venta con su comisión total
 * Query params: fecha_desde, fecha_hasta, sucursal, vendedor_id
 */
router.get('/detalle-por-ventas', obtenerDetalleComisionesPorVentas);

/**
 * GET /api/comisiones/resumen-por-tipo
 * ⭐ Obtener resumen de comisiones agrupadas por tipo de producto
 * Retorna: Display: 3 productos, Comisión: $450.00
 * Query params: fecha_desde, fecha_hasta, sucursal, vendedor_id
 */
router.get('/resumen-por-tipo', obtenerResumenPorTipo);

/**
 * GET /api/comisiones/remanentes
 * ⭐ Obtener remanentes de comisiones
 * Query params: sucursal, vendedor_id
 */
router.get('/remanentes', obtenerRemanentes);

/**
 * GET /api/comisiones/detalle-vendedor/:vendedor_id
 * Obtener detalle de comisiones de un vendedor
 * Query params: fecha_desde, fecha_hasta, sucursal
 */
router.get('/detalle-vendedor/:vendedor_id', obtenerDetalleComisiones);

/**
 * GET /api/comisiones/historial-cambios
 * Obtener historial de cambios en configuración
 * Solo administradores
 */
router.get('/historial-cambios', obtenerHistorialCambios);

/**
 * GET /api/comisiones/historial-pagos/:comision_id
 * Obtener historial de pagos de una comisión
 */
router.get('/historial-pagos/:comision_id', obtenerHistorialPagosComision);

/**
 * =====================================================
 * COMISIONES PERSONALIZADAS POR VENDEDOR
 * =====================================================
 */

/**
 * GET /api/comisiones/vendedor/:vendedor_id
 * Obtener comisiones personalizadas de un vendedor
 */
router.get('/vendedor/:vendedor_id', obtenerComisionesVendedor);

/**
 * POST /api/comisiones/vendedor/:vendedor_id
 * Establecer comisión personalizada para un vendedor
 * Solo administradores
 */
router.post('/vendedor/:vendedor_id', establecerComisionPersonalizada);

/**
 * DELETE /api/comisiones/vendedor/:vendedor_id/:tipo_producto
 * Eliminar comisión personalizada (volver a usar global)
 * Solo administradores
 */
router.delete('/vendedor/:vendedor_id/:tipo_producto', eliminarComisionPersonalizada);

export default router;

