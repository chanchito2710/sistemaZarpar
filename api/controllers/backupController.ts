/**
 * 🎮 CONTROLADOR DE BACKUPS
 * 
 * Maneja las peticiones HTTP relacionadas con backups
 */

import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import {
  crearBackupManual,
  restaurarBackup,
  listarBackups,
  eliminarBackup,
  obtenerEstadisticas
} from '../services/backupService.js';

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');

/**
 * POST /api/backups/manual
 * Crear backup manual
 */
export const crearBackupManualHandler = async (req: Request, res: Response) => {
  try {
    const { nombre, nota } = req.body;
    const usuario: any = (req as any).user;
    
    // Validar nombre personalizado
    if (nombre && nombre.length > 255) {
      return res.status(400).json({
        success: false,
        error: 'El nombre es muy largo (máximo 255 caracteres)'
      });
    }
    
    // Validar caracteres peligrosos en nombre
    if (nombre && !/^[a-zA-Z0-9\sáéíóúñÑ\-_]+$/.test(nombre)) {
      return res.status(400).json({
        success: false,
        error: 'El nombre contiene caracteres no permitidos'
      });
    }
    
    // Validar nota
    if (nota && nota.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'La nota es muy larga (máximo 1000 caracteres)'
      });
    }
    
    // Crear backup
    const resultado = await crearBackupManual({
      nombre: nombre?.trim() || undefined,
      nota: nota?.trim() || undefined,
      usuario_email: usuario.email
    });
    
    res.json({
      success: true,
      message: 'Backup creado exitosamente',
      data: resultado
    });
    
  } catch (error: any) {
    console.error('Error al crear backup manual:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear backup',
      details: error.message
    });
  }
};

/**
 * GET /api/backups
 * Listar todos los backups
 */
export const listarBackupsHandler = async (req: Request, res: Response) => {
  try {
    console.log('📋 [BACKUPS] Iniciando listar backups...');
    const backups = await listarBackups();
    console.log(`✅ [BACKUPS] Backups obtenidos: ${backups.length}`);
    
    res.json({
      success: true,
      data: backups
    });
    
  } catch (error: any) {
    console.error('❌ [BACKUPS] Error al listar backups:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Error al listar backups',
      details: error.message
    });
  }
};

/**
 * POST /api/backups/restore/:filename
 * Restaurar backup
 */
export const restaurarBackupHandler = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const usuario: any = (req as any).user;
    
    // Validar que el archivo existe en la BD
    const backups = await listarBackups();
    const backupExiste = backups.find(b => b.filename === filename);
    
    if (!backupExiste) {
      return res.status(404).json({
        success: false,
        error: 'El backup no existe'
      });
    }
    
    // Restaurar
    await restaurarBackup(filename, usuario.email);
    
    res.json({
      success: true,
      message: 'Base de datos restaurada exitosamente',
      data: {
        filename,
        fecha_restauracion: new Date()
      }
    });
    
  } catch (error: any) {
    console.error('Error al restaurar backup:', error);
    res.status(500).json({
      success: false,
      error: 'Error al restaurar backup',
      details: error.message
    });
  }
};

/**
 * GET /api/backups/download/:filename
 * Descargar backup
 */
export const descargarBackupHandler = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(BACKUP_DIR, filename);
    
    // Verificar que existe
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        error: 'El backup no existe'
      });
    }
    
    // Enviar archivo
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Error al descargar backup:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Error al descargar backup'
          });
        }
      }
    });
    
  } catch (error: any) {
    console.error('Error al descargar backup:', error);
    res.status(500).json({
      success: false,
      error: 'Error al descargar backup',
      details: error.message
    });
  }
};

/**
 * DELETE /api/backups/:filename
 * Eliminar backup
 */
export const eliminarBackupHandler = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const usuario: any = (req as any).user;
    
    // Eliminar
    await eliminarBackup(filename, usuario.email);
    
    res.json({
      success: true,
      message: 'Backup eliminado exitosamente'
    });
    
  } catch (error: any) {
    console.error('Error al eliminar backup:', error);
    
    // Si es el error de "último backup", devolver 400
    if (error.message.includes('último backup')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al eliminar backup',
      details: error.message
    });
  }
};

/**
 * GET /api/backups/stats
 * Obtener estadísticas
 */
export const obtenerEstadisticasHandler = async (req: Request, res: Response) => {
  try {
    console.log('📊 [BACKUPS] Iniciando obtener estadísticas...');
    const stats = await obtenerEstadisticas();
    console.log('✅ [BACKUPS] Estadísticas obtenidas:', stats);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error: any) {
    console.error('❌ [BACKUPS] Error al obtener estadísticas:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
      details: error.message
    });
  }
};

