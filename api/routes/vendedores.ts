/**
 * Rutas para gestión de vendedores
 * Define todos los endpoints relacionados con vendedores
 */

import { Router } from 'express';
import {
  obtenerVendedores,
  obtenerVendedoresPorSucursal,
  obtenerVendedorPorId,
  crearVendedor,
  actualizarVendedor,
  eliminarVendedor,
  obtenerSucursales
} from '../controllers/vendedoresController';
import { verificarAutenticacion, verificarAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/vendedores
 * @desc    Obtener todos los vendedores activos
 * @access  Public
 */
router.get('/', obtenerVendedores);

/**
 * @route   GET /api/vendedores/sucursales/lista
 * @desc    Obtener lista de sucursales disponibles
 * @access  Public
 */
router.get('/sucursales/lista', obtenerSucursales);

/**
 * @route   GET /api/vendedores/sucursal/:sucursal
 * @desc    Obtener vendedores por sucursal
 * @access  Public
 */
router.get('/sucursal/:sucursal', obtenerVendedoresPorSucursal);

/**
 * @route   GET /api/vendedores/:id
 * @desc    Obtener un vendedor específico por ID
 * @access  Public
 */
router.get('/:id', obtenerVendedorPorId);

/**
 * @route   POST /api/vendedores
 * @desc    Crear un nuevo vendedor
 * @access  Private (Solo Administradores)
 */
router.post('/', verificarAutenticacion, verificarAdmin, crearVendedor);

/**
 * @route   PUT /api/vendedores/:id
 * @desc    Actualizar un vendedor existente
 * @access  Private (Solo Administradores)
 */
router.put('/:id', verificarAutenticacion, verificarAdmin, actualizarVendedor);

/**
 * @route   DELETE /api/vendedores/:id
 * @desc    Eliminar (desactivar) un vendedor
 * @access  Private (Solo Administradores)
 */
router.delete('/:id', verificarAutenticacion, verificarAdmin, eliminarVendedor);

export default router;


