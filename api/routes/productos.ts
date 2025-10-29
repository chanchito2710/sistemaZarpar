/**
 * Rutas para gestión de productos
 * Define todos los endpoints relacionados con productos y su stock por sucursal
 * TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
 */

import { Router } from 'express';
import {
  obtenerProductos,
  obtenerProductosPorSucursal,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  actualizarProductoSucursal,
  buscarProductos,
  obtenerCategorias,
  agregarCategoria
} from '../controllers/productosController.js';
import { verificarAutenticacion } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/productos/buscar
 * @desc    Buscar productos por término
 * @access  Private (requiere autenticación)
 * @query   q - Término de búsqueda
 * @query   sucursal (opcional) - Filtrar por sucursal
 */
router.get(
  '/buscar',
  verificarAutenticacion,
  buscarProductos
);

/**
 * @route   GET /api/productos/sucursal/:sucursal
 * @desc    Obtener productos de una sucursal con stock y precio
 * @access  Private (requiere autenticación)
 */
router.get(
  '/sucursal/:sucursal',
  verificarAutenticacion,
  obtenerProductosPorSucursal
);

/**
 * @route   GET /api/productos/:id
 * @desc    Obtener un producto específico con info de todas las sucursales
 * @access  Private (requiere autenticación)
 */
router.get(
  '/:id',
  verificarAutenticacion,
  obtenerProductoPorId
);

/**
 * @route   GET /api/productos
 * @desc    Obtener todos los productos (sin info de sucursal)
 * @access  Private (requiere autenticación)
 */
router.get(
  '/',
  verificarAutenticacion,
  obtenerProductos
);

/**
 * @route   POST /api/productos
 * @desc    Crear un nuevo producto
 * @access  Private (requiere autenticación)
 */
router.post(
  '/',
  verificarAutenticacion,
  crearProducto
);

/**
 * @route   PUT /api/productos/:id
 * @desc    Actualizar información básica de un producto
 * @access  Private (requiere autenticación)
 */
router.put(
  '/:id',
  verificarAutenticacion,
  actualizarProducto
);

/**
 * @route   PUT /api/productos/:id/sucursal/:sucursal
 * @desc    Actualizar stock y precio de un producto en una sucursal
 * @access  Private (requiere autenticación)
 */
router.put(
  '/:id/sucursal/:sucursal',
  verificarAutenticacion,
  actualizarProductoSucursal
);

/**
 * @route   GET /api/productos/categorias/:tipo
 * @desc    Obtener categorías (marcas o tipos) para selectores
 * @access  Private (requiere autenticación)
 * @param   tipo - 'marca' o 'tipo'
 */
router.get(
  '/categorias/:tipo',
  verificarAutenticacion,
  obtenerCategorias
);

/**
 * @route   POST /api/productos/categorias
 * @desc    Agregar nueva categoría (marca o tipo)
 * @access  Private (requiere autenticación)
 * @body    { tipo: 'marca' | 'tipo', valor: string }
 */
router.post(
  '/categorias',
  verificarAutenticacion,
  agregarCategoria
);

export default router;

