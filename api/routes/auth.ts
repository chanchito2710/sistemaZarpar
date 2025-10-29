/**
 * Rutas de Autenticación
 * Maneja login, logout, verificación de tokens y gestión de sesiones
 */
import { Router } from 'express';
import {
  login,
  logout,
  verificarToken,
  obtenerPerfil,
  cambiarPassword
} from '../controllers/authController.js';
import { verificarAutenticacion } from '../middleware/auth.js';

const router = Router();

/**
 * LOGIN - Autenticar usuario
 * POST /api/auth/login
 * Body: { email, password }
 * 
 * Retorna: { token, usuario }
 */
router.post('/login', login);

/**
 * LOGOUT - Cerrar sesión
 * POST /api/auth/logout
 * Headers: Authorization: Bearer <token>
 */
router.post('/logout', logout);

/**
 * VERIFICAR TOKEN - Validar si el token es válido
 * GET /api/auth/verificar
 * Headers: Authorization: Bearer <token>
 * 
 * Retorna: { valido: true, usuario }
 */
router.get('/verificar', verificarToken);

/**
 * OBTENER PERFIL - Obtener datos del usuario actual
 * GET /api/auth/perfil
 * Headers: Authorization: Bearer <token>
 * 
 * Requiere autenticación
 */
router.get('/perfil', verificarAutenticacion, obtenerPerfil);

/**
 * CAMBIAR CONTRASEÑA - Cambiar la contraseña del usuario actual
 * POST /api/auth/cambiar-password
 * Headers: Authorization: Bearer <token>
 * Body: { passwordActual, passwordNueva }
 * 
 * Requiere autenticación
 */
router.post('/cambiar-password', verificarAutenticacion, cambiarPassword);

export default router;
