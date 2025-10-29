/**
 * Rutas para gestión de vendedores
 * Define todos los endpoints relacionados con vendedores
 */

import { Router } from 'express';
import {
  obtenerVendedores,
  obtenerVendedoresPorSucursal,
  obtenerVendedorPorId
} from '../controllers/vendedoresController';

const router = Router();

/**
 * @route   GET /api/vendedores
 * @desc    Obtener todos los vendedores activos
 * @access  Public (cambiar a Private con autenticación)
 */
router.get('/', obtenerVendedores);

/**
 * @route   GET /api/vendedores/sucursal/:sucursal
 * @desc    Obtener vendedores por sucursal
 * @access  Public (cambiar a Private con autenticación)
 */
router.get('/sucursal/:sucursal', obtenerVendedoresPorSucursal);

/**
 * @route   GET /api/vendedores/:id
 * @desc    Obtener un vendedor específico por ID
 * @access  Public (cambiar a Private con autenticación)
 */
router.get('/:id', obtenerVendedorPorId);

export default router;


