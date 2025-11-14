/**
 * Rutas para Sueldos - Sistema Manual
 * Requiere autenticación
 */

import express from 'express';
import { 
  obtenerSueldos, 
  crearSueldo, 
  actualizarSueldo, 
  eliminarSueldo,
  obtenerResumenSueldos
} from '../controllers/sueldosController.js';
import { verificarAutenticacion } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// Obtener resumen (debe ir antes de /)
router.get('/resumen', obtenerResumenSueldos);

// Obtener todos los sueldos con filtros
router.get('/', obtenerSueldos);

// Crear nuevo sueldo
router.post('/', crearSueldo);

// Actualizar sueldo
router.put('/:id', actualizarSueldo);

// Eliminar sueldo (solo admin)
router.delete('/:id', eliminarSueldo);

export default router;






