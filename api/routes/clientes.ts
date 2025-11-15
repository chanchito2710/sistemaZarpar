/**
 * Rutas para gestión de clientes
 * Define todos los endpoints relacionados con clientes por sucursal
 * TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
 */

import { Router } from 'express';
import {
  obtenerClientesPorSucursal,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  buscarClientes
} from '../controllers/clientesController.js';
import { 
  verificarAutenticacion, 
  verificarAccesoSucursal 
} from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/clientes/sucursal/:sucursal
 * @desc    Obtener todos los clientes de una sucursal
 * @access  Private (requiere autenticación y permiso de sucursal)
 */
router.get(
  '/sucursal/:sucursal',
  verificarAutenticacion,
  verificarAccesoSucursal,
  obtenerClientesPorSucursal
);

/**
 * @route   GET /api/clientes/sucursal/:sucursal/buscar
 * @desc    Buscar clientes por término de búsqueda
 * @access  Private (requiere autenticación y permiso de sucursal)
 */
router.get(
  '/sucursal/:sucursal/buscar',
  verificarAutenticacion,
  verificarAccesoSucursal,
  buscarClientes
);

/**
 * @route   GET /api/clientes/sucursal/:sucursal/:id
 * @desc    Obtener un cliente específico por ID
 * @access  Private (requiere autenticación y permiso de sucursal)
 */
router.get(
  '/sucursal/:sucursal/:id',
  verificarAutenticacion,
  verificarAccesoSucursal,
  obtenerClientePorId
);

/**
 * @route   POST /api/clientes/sucursal/:sucursal
 * @desc    Crear un nuevo cliente en una sucursal
 * @access  Private (requiere autenticación y permiso de sucursal)
 */
router.post(
  '/sucursal/:sucursal',
  verificarAutenticacion,
  verificarAccesoSucursal,
  crearCliente
);

/**
 * @route   PUT /api/clientes/sucursal/:sucursal/:id
 * @desc    Actualizar un cliente existente
 * @access  Private (requiere autenticación y permiso de sucursal)
 */
router.put(
  '/sucursal/:sucursal/:id',
  verificarAutenticacion,
  verificarAccesoSucursal,
  actualizarCliente
);

/**
 * @route   DELETE /api/clientes/sucursal/:sucursal/:id
 * @desc    Eliminar un cliente permanentemente
 * @access  Private (requiere autenticación y permiso de sucursal)
 */
router.delete(
  '/sucursal/:sucursal/:id',
  verificarAutenticacion,
  verificarAccesoSucursal,
  eliminarCliente
);

export default router;


