/**
 * Rutas para gestión de transferencias de inventario
 * Define todos los endpoints relacionados con transferencias entre sucursales
 * TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
 */

import { Router } from 'express';
import {
  crearTransferencia,
  obtenerTransferencias,
  obtenerDetalleTransferencia,
  confirmarRecepcion,
  confirmarRecepcionDirecta,
  cancelarTransferencia,
  obtenerVentasPorRango,
  obtenerResumen
} from '../controllers/transferenciasController.js';
import { verificarAutenticacion } from '../middleware/auth.js';

const router = Router();

/**
 * ===========================================
 * TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
 * ===========================================
 */
router.use(verificarAutenticacion);

/**
 * @route   POST /api/transferencias
 * @desc    Crear nueva transferencia (enviar mercadería)
 * @access  Private (requiere autenticación)
 * @body    {
 *            sucursal_destino: string,
 *            productos: [{ producto_id, cantidad, ventas_periodo?, fecha_inicio?, fecha_fin? }],
 *            notas_envio?: string
 *          }
 * @returns {
 *            success: boolean,
 *            data: { id, codigo, fecha_envio, sucursal_destino, estado, total_productos, total_unidades }
 *          }
 */
router.post('/', crearTransferencia);

/**
 * @route   GET /api/transferencias
 * @desc    Obtener lista de transferencias con filtros
 * @access  Private (requiere autenticación)
 * @query   estado - "pendiente" | "en_transito" | "completada" | "cancelada" | "todas"
 * @query   sucursal - Nombre de la sucursal (opcional)
 * @query   desde - Fecha inicio (YYYY-MM-DD, opcional)
 * @query   hasta - Fecha fin (YYYY-MM-DD, opcional)
 * @returns { success: boolean, data: Transferencia[] }
 */
router.get('/', obtenerTransferencias);

/**
 * @route   GET /api/transferencias/resumen
 * @desc    Obtener estadísticas y resumen de transferencias
 * @access  Private (requiere autenticación)
 * @returns {
 *            success: boolean,
 *            data: {
 *              total_mes: number,
 *              en_transito: number,
 *              tiempo_promedio_dias: number,
 *              diferencias_detectadas: number,
 *              por_sucursal: []
 *            }
 *          }
 */
router.get('/resumen', obtenerResumen);

/**
 * @route   GET /api/transferencias/ventas
 * @desc    Obtener ventas por rango de fechas y sucursal
 * @access  Private (requiere autenticación)
 * @query   sucursal - Nombre de la sucursal (requerido)
 * @query   desde - Fecha inicio YYYY-MM-DD (requerido)
 * @query   hasta - Fecha fin YYYY-MM-DD (requerido)
 * @returns {
 *            success: boolean,
 *            data: {
 *              sucursal: string,
 *              desde: string,
 *              hasta: string,
 *              ventas_por_producto: []
 *            }
 *          }
 */
router.get('/ventas', obtenerVentasPorRango);

/**
 * @route   GET /api/transferencias/:id
 * @desc    Obtener detalle completo de una transferencia
 * @access  Private (requiere autenticación)
 * @param   id - ID de la transferencia
 * @returns {
 *            success: boolean,
 *            data: { ...transferencia, productos: [] }
 *          }
 */
router.get('/:id', obtenerDetalleTransferencia);

/**
 * @route   PUT /api/transferencias/:id/confirmar
 * @desc    Confirmar recepción de transferencia (suma stock a sucursal)
 * @access  Private (requiere autenticación)
 * @param   id - ID de la transferencia
 * @body    {
 *            productos: [{ producto_id, cantidad_recibida }],
 *            notas_recepcion?: string
 *          }
 * @returns {
 *            success: boolean,
 *            data: { id, codigo, estado, fecha_recepcion, diferencias: [] }
 *          }
 */
router.put('/:id/confirmar', confirmarRecepcion);

/**
 * @route   POST /api/transferencias/confirmar-recepcion
 * @desc    Confirmar recepción directa de stock en tránsito (para sucursales simples)
 * @access  Private (requiere autenticación)
 * @body    {
 *            producto_id: number,
 *            sucursal: string,
 *            cantidad: number
 *          }
 * @returns {
 *            success: boolean,
 *            data: { mensaje: string, stock_actualizado: number }
 *          }
 */
router.post('/confirmar-recepcion', confirmarRecepcionDirecta);

/**
 * @route   PUT /api/transferencias/:id/cancelar
 * @desc    Cancelar transferencia (devuelve stock a Maldonado si está en tránsito)
 * @access  Private (requiere autenticación)
 * @param   id - ID de la transferencia
 * @returns {
 *            success: boolean,
 *            data: { id, codigo, estado }
 *          }
 */
router.put('/:id/cancelar', cancelarTransferencia);

export default router;










