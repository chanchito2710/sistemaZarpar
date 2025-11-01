/**
 * Rutas para gestión de sucursales
 * Define todos los endpoints relacionados con sucursales
 */

import { Router } from 'express';
import {
  obtenerSucursales,
  crearSucursal,
  eliminarSucursal,
  obtenerEstadisticasSucursal
} from '../controllers/sucursalesController';
import { verificarAutenticacion, verificarAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/sucursales
 * @desc    Obtener todas las sucursales activas
 * @access  Public
 */
router.get('/', obtenerSucursales);

/**
 * @route   GET /api/sucursales/:nombre/stats
 * @desc    Obtener estadísticas de una sucursal específica
 * @access  Private (Autenticado)
 */
router.get('/:nombre/stats', verificarAutenticacion, obtenerEstadisticasSucursal);

/**
 * @route   POST /api/sucursales
 * @desc    Crear una nueva sucursal (crea automáticamente tabla clientes_[sucursal])
 * @access  Private (Solo Administradores)
 */
router.post('/', verificarAutenticacion, verificarAdmin, crearSucursal);

/**
 * @route   DELETE /api/sucursales/:nombre
 * @desc    Eliminar una sucursal (requiere que no tenga vendedores)
 * @access  Private (Solo Administradores)
 */
router.delete('/:nombre', verificarAutenticacion, verificarAdmin, eliminarSucursal);

export default router;



