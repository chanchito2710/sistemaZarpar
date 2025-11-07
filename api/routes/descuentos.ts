import express from 'express';
import { verificarAutenticacion, verificarAdmin } from '../middleware/auth.js';
import {
  obtenerConfiguracionDescuentos,
  obtenerConfiguracionPorSucursal,
  actualizarConfiguracionDescuento
} from '../controllers/descuentosController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// Obtener configuración de todas las sucursales (admin)
router.get('/', verificarAdmin, obtenerConfiguracionDescuentos);

// Obtener configuración de una sucursal específica (todos pueden ver su sucursal)
router.get('/:sucursal', obtenerConfiguracionPorSucursal);

// Actualizar configuración de descuento (solo admin)
router.put('/:sucursal', verificarAdmin, actualizarConfiguracionDescuento);

export default router;

