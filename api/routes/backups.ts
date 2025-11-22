/**
 * 🛣️ RUTAS DE BACKUPS
 * 
 * Todas las rutas requieren autenticación y permisos de administrador
 */

import express from 'express';
import { verificarAutenticacion } from '../middleware/auth.js';
import {
  crearBackupManualHandler,
  listarBackupsHandler,
  restaurarBackupHandler,
  descargarBackupHandler,
  eliminarBackupHandler,
  obtenerEstadisticasHandler
} from '../controllers/backupController.js';

const router = express.Router();

// Middleware: Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// Middleware: Verificar que el usuario es admin
router.use((req, res, next) => {
  const usuario: any = (req as any).usuario; // ✅ Corregido: era 'user', debe ser 'usuario'
  
  if (!usuario) {
    console.log('❌ Usuario no encontrado en req.usuario');
    return res.status(401).json({
      success: false,
      error: 'Usuario no autenticado',
      message: 'Por favor, inicia sesión'
    });
  }
  
  console.log('✅ Usuario autenticado:', usuario.email);
  
  if (usuario.email !== 'admin@zarparuy.com') {
    console.log('❌ Usuario no es admin:', usuario.email);
    return res.status(403).json({
      success: false,
      error: 'No tienes permisos para acceder a esta función',
      message: 'Solo el administrador puede gestionar backups'
    });
  }
  
  console.log('✅ Admin verificado:', usuario.email);
  next();
});

/**
 * POST /api/backups/manual
 * Crear backup manual con nombre y nota personalizada
 * 
 * Body:
 * {
 *   nombre?: string,  // Opcional, máx 255 caracteres
 *   nota?: string     // Opcional, máx 1000 caracteres
 * }
 */
router.post('/manual', crearBackupManualHandler);

/**
 * GET /api/backups
 * Listar todos los backups con metadata
 * 
 * Response:
 * {
 *   success: true,
 *   data: [
 *     {
 *       filename: string,
 *       tipo: 'automatico' | 'manual',
 *       nombre_personalizado: string | null,
 *       nota: string | null,
 *       tamano_bytes: number,
 *       tamano_formateado: string,
 *       creado_por_email: string,
 *       created_at: date,
 *       edad_dias: number,
 *       esUltimoBackup: boolean
 *     }
 *   ]
 * }
 */
router.get('/', listarBackupsHandler);

/**
 * POST /api/backups/restore/:filename
 * Restaurar backup específico
 * 
 * ⚠️ ADVERTENCIA: Sobrescribe la base de datos actual
 */
router.post('/restore/:filename', restaurarBackupHandler);

/**
 * GET /api/backups/download/:filename
 * Descargar archivo .sql del backup
 */
router.get('/download/:filename', descargarBackupHandler);

/**
 * DELETE /api/backups/:filename
 * Eliminar backup
 * 
 * ⚠️ No permite eliminar el último backup
 */
router.delete('/:filename', eliminarBackupHandler);

/**
 * GET /api/backups/stats
 * Obtener estadísticas de backups
 * 
 * Response:
 * {
 *   total_backups: number,
 *   tamano_total: string,
 *   ultimo_backup: date,
 *   automaticos: number,
 *   manuales: number,
 *   tamano_bd_actual: string,
 *   proximo_backup_automatico: date
 * }
 */
router.get('/stats', obtenerEstadisticasHandler);

export default router;

