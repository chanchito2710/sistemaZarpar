/**
 * ====================================================
 * RUTAS DE AUTENTICACIÓN - CON SEGURIDAD MÁXIMA
 * Maneja login, logout, verificación de tokens y gestión de sesiones
 * ====================================================
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
import { 
  loginLimiter, 
  // validateLogin, // Deshabilitado - causaba problemas
  criticalOperationsLimiter
} from '../middleware/security.js';

const router = Router();

/**
 * LOGIN - Autenticar usuario
 * POST /api/auth/login
 * Body: { email, password }
 * 
 * PROTECCIONES:
 * - Rate Limiting: 5 intentos por 15 minutos
 * - Logs de intentos fallidos
 * 
 * Retorna: { token, usuario }
 */
router.post('/login', loginLimiter, login);

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
 * PROTECCIONES:
 * - Rate Limiting: 20 intentos por 5 minutos
 * - Autenticación requerida
 * - Validación de passwords
 * 
 * Requiere autenticación
 */
router.post('/cambiar-password', criticalOperationsLimiter, verificarAutenticacion, cambiarPassword);

export default router;
