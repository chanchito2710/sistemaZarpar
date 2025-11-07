/**
 * Rutas para el Carrito de Transferencias
 * Requiere autenticación
 */

import express from 'express';
import { 
  obtenerCarrito, 
  agregarAlCarrito, 
  eliminarDelCarrito, 
  vaciarCarrito,
  obtenerResumenCarrito
} from '../controllers/carritoTransferenciasController.js';
import { verificarAutenticacion } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// Obtener resumen del carrito (debe ir antes de /)
router.get('/resumen', obtenerResumenCarrito);

// Obtener todo el carrito
router.get('/', obtenerCarrito);

// Agregar o actualizar item en el carrito
router.post('/', agregarAlCarrito);

// Eliminar item específico del carrito
router.delete('/:producto_id/:sucursal', eliminarDelCarrito);

// Vaciar completamente el carrito
router.delete('/', vaciarCarrito);

export default router;

