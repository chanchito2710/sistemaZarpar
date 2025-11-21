import express from 'express';
import { verificarAutenticacion, verificarAdmin } from '../middleware/auth.js';
import { 
  obtenerAnalisisPedidos,
  guardarNotasPedidos
} from '../controllers/pedidosController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// Obtener análisis de productos para pedidos (solo admin)
router.get('/analisis', verificarAdmin, obtenerAnalisisPedidos);

// Guardar notas de pedidos (opcional, por si quieres persistir en BD)
router.post('/notas', verificarAdmin, guardarNotasPedidos);

export default router;

