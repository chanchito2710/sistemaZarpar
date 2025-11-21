import express from 'express';
import { verificarAutenticacion, verificarAdmin } from '../middleware/auth.js';
import {
  obtenerConfiguracionDescuentos,
  obtenerConfiguracionPorSucursal,
  actualizarConfiguracionDescuento,
  habilitarUnaVez,
  desactivarUnaVez
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

// Habilitar descuento "una vez" (solo admin)
router.post('/:sucursal/una-vez', verificarAdmin, habilitarUnaVez);

// Desactivar descuento "una vez" después de usarse (cualquier usuario puede desactivar)
router.delete('/:sucursal/una-vez', desactivarUnaVez);

export default router;








