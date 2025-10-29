/**
 * Middleware de Autenticación
 * Verifica tokens JWT y permisos de usuarios
 */

import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import type { RowDataPacket } from 'mysql2';

// Secret para JWT (debe coincidir con el del controlador)
const JWT_SECRET = process.env.JWT_SECRET || 'zarpar_secret_key_2025_change_in_production';

// Interfaz para el payload del JWT
interface JWTPayload {
  id: number;
  email: string;
  nombre: string;
  cargo: string;
  sucursal: string;
  esAdmin: boolean;
}

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: JWTPayload;
    }
  }
}

/**
 * Middleware para verificar autenticación
 * Verifica que el usuario tenga un token JWT válido
 */
export const verificarAutenticacion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Token no proporcionado. Por favor, inicia sesión.'
      });
      return;
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Opcional: Verificar que el usuario sigue activo en la base de datos
    const [usuarios] = await pool.execute<RowDataPacket[]>(
      'SELECT `id`, `activo` FROM `vendedores` WHERE `id` = ?',
      [decoded.id]
    );

    if (usuarios.length === 0 || !usuarios[0].activo) {
      res.status(401).json({
        error: 'Usuario no encontrado o inactivo'
      });
      return;
    }

    // Agregar información del usuario al objeto request
    req.usuario = decoded;

    // Continuar con la siguiente función
    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Token inválido'
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token expirado. Por favor, inicia sesión nuevamente.'
      });
      return;
    }

    console.error('❌ Error en middleware de autenticación:', error);
    res.status(500).json({
      error: 'Error al verificar autenticación'
    });
  }
};

/**
 * Middleware para verificar que el usuario sea ADMINISTRADOR
 * Debe usarse DESPUÉS de verificarAutenticacion
 */
export const verificarAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Verificar que existe la información del usuario (agregada por verificarAutenticacion)
    if (!req.usuario) {
      res.status(401).json({
        error: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar si es administrador
    if (!req.usuario.esAdmin && req.usuario.email !== 'admin@zarparuy.com') {
      res.status(403).json({
        error: 'Acceso denegado. Solo administradores pueden realizar esta acción.'
      });
      return;
    }

    // Continuar con la siguiente función
    next();

  } catch (error) {
    console.error('❌ Error en middleware de verificación de admin:', error);
    res.status(500).json({
      error: 'Error al verificar permisos de administrador'
    });
  }
};

/**
 * Middleware para verificar acceso a una sucursal específica
 * Debe usarse DESPUÉS de verificarAutenticacion
 * 
 * Los administradores tienen acceso a TODAS las sucursales
 * Los vendedores normales solo a su sucursal
 */
export const verificarAccesoSucursal = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Verificar que existe la información del usuario
    if (!req.usuario) {
      res.status(401).json({
        error: 'Usuario no autenticado'
      });
      return;
    }

    // Si es administrador, tiene acceso a todas las sucursales
    if (req.usuario.esAdmin || req.usuario.email === 'admin@zarparuy.com') {
      next();
      return;
    }

    // Obtener la sucursal solicitada (puede venir en params, query o body)
    const sucursalSolicitada = 
      req.params.sucursal || 
      req.query.sucursal || 
      req.body.sucursal;

    // Si no se especifica sucursal, permitir (se usará la del usuario)
    if (!sucursalSolicitada) {
      next();
      return;
    }

    // Normalizar nombres (lowercase y sin tildes)
    const sucursalUsuario = req.usuario.sucursal.toLowerCase();
    const sucursalSolicitadaNorm = String(sucursalSolicitada).toLowerCase();

    // Verificar que el vendedor solo acceda a su sucursal
    if (sucursalUsuario !== sucursalSolicitadaNorm) {
      res.status(403).json({
        error: `Acceso denegado. Solo puedes acceder a datos de la sucursal ${req.usuario.sucursal}`
      });
      return;
    }

    // Continuar con la siguiente función
    next();

  } catch (error) {
    console.error('❌ Error en middleware de verificación de sucursal:', error);
    res.status(500).json({
      error: 'Error al verificar permisos de sucursal'
    });
  }
};

/**
 * Middleware para verificar acceso a una tabla de clientes específica
 * Debe usarse DESPUÉS de verificarAutenticacion
 * 
 * Los administradores pueden acceder a TODAS las tablas de clientes
 * Los vendedores solo a su tabla de clientes (clientes_[sucursal])
 */
export const verificarAccesoTablaClientes = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Verificar que existe la información del usuario
    if (!req.usuario) {
      res.status(401).json({
        error: 'Usuario no autenticado'
      });
      return;
    }

    // Si es administrador, tiene acceso a todas las tablas
    if (req.usuario.esAdmin || req.usuario.email === 'admin@zarparuy.com') {
      next();
      return;
    }

    // Obtener la tabla solicitada (puede venir en params, query o body)
    const tablaSolicitada = 
      req.params.tabla || 
      req.query.tabla || 
      req.body.tabla;

    // Si no se especifica tabla, permitir (se usará la del usuario)
    if (!tablaSolicitada) {
      next();
      return;
    }

    // Construir el nombre de la tabla del usuario
    const sucursalUsuario = req.usuario.sucursal.toLowerCase();
    const tablaUsuario = `clientes_${sucursalUsuario}`;
    const tablaSolicitadaNorm = String(tablaSolicitada).toLowerCase();

    // Verificar que el vendedor solo acceda a su tabla de clientes
    if (tablaUsuario !== tablaSolicitadaNorm) {
      res.status(403).json({
        error: `Acceso denegado. Solo puedes acceder a la tabla ${tablaUsuario}`
      });
      return;
    }

    // Continuar con la siguiente función
    next();

  } catch (error) {
    console.error('❌ Error en middleware de verificación de tabla:', error);
    res.status(500).json({
      error: 'Error al verificar permisos de tabla'
    });
  }
};

/**
 * Función auxiliar para extraer el token del header
 */
export const extraerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * Función auxiliar para verificar si un usuario es administrador
 */
export const esAdministrador = (email: string): boolean => {
  return email === 'admin@zarparuy.com';
};

/**
 * Función auxiliar para obtener la tabla de clientes de un usuario
 */
export const obtenerTablaClientes = (sucursal: string): string => {
  const sucursalLower = sucursal.toLowerCase();
  return `clientes_${sucursalLower}`;
};

/**
 * Función auxiliar para obtener todas las tablas de clientes (para admin)
 */
export const obtenerTodasLasTablas = (): string[] => {
  return [
    'clientes_pando',
    'clientes_maldonado',
    'clientes_rivera',
    'clientes_melo',
    'clientes_paysandu',
    'clientes_salto',
    'clientes_tacuarembo'
  ];
};

