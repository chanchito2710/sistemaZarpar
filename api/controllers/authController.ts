/**
 * Controlador de Autenticación
 * Maneja login, logout, verificación de tokens y permisos
 */

import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { obtenerTodasLasTablas } from '../utils/database.js';

// Interfaz para el usuario de la base de datos
interface VendedorDB extends RowDataPacket {
  id: number;
  nombre: string;
  cargo: string;
  sucursal: string;
  telefono: string | null;
  email: string;
  password: string;
  fecha_ingreso: Date | null;
  activo: boolean;
}

// Interfaz para el payload del JWT
interface JWTPayload {
  id: number;
  email: string;
  nombre: string;
  cargo: string;
  sucursal: string;
  esAdmin: boolean;
}

// Secret para JWT (debe estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'zarpar_secret_key_2025_change_in_production';
const JWT_EXPIRES_IN = '24h'; // Token válido por 24 horas

/**
 * LOGIN - Autenticar usuario
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔐 Intento de login:', req.body.email);
    const { email, password } = req.body;

    // Validar que se envíen email y password
    if (!email || !password) {
      console.log('❌ Email o password faltante');
      res.status(400).json({
        error: 'Email y contraseña son requeridos'
      });
      return;
    }

    // Buscar usuario por email en la base de datos
    console.log('🔍 Buscando usuario en BD...');
    const [usuarios] = await pool.execute<VendedorDB[]>(
      'SELECT * FROM `vendedores` WHERE `email` = ? AND `activo` = TRUE',
      [email]
    );
    console.log(`📊 Usuarios encontrados: ${usuarios.length}`);

    // Verificar si el usuario existe
    if (usuarios.length === 0) {
      console.log('❌ Usuario no encontrado');
      res.status(401).json({
        error: 'Credenciales inválidas'
      });
      return;
    }

    const usuario = usuarios[0];
    console.log('✅ Usuario encontrado:', usuario.email);

    // Verificar que el usuario tenga contraseña configurada
    if (!usuario.password) {
      console.log('❌ Usuario sin contraseña configurada');
      res.status(500).json({
        error: 'Usuario sin contraseña configurada. Contacte al administrador.'
      });
      return;
    }

    // Verificar la contraseña
    console.log('🔒 Verificando contraseña...');
    const passwordValida = await bcrypt.compare(password, usuario.password);
    console.log(`🔓 Contraseña válida: ${passwordValida}`);

    if (!passwordValida) {
      console.log('❌ Contraseña incorrecta');
      res.status(401).json({
        error: 'Credenciales inválidas'
      });
      return;
    }

    // Determinar si es administrador
    const esAdmin = usuario.email === 'admin@zarparuy.com';
    console.log(`👑 Es admin: ${esAdmin}`);

    // Preparar payload del token
    const payload: JWTPayload = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      cargo: usuario.cargo,
      sucursal: usuario.sucursal.toLowerCase(), // ✅ Normalizar a minúsculas
      esAdmin: esAdmin
    };

    // Generar token JWT
    console.log('🎫 Generando token JWT...');
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
    console.log('✅ Token generado');

    // Actualizar último acceso
    console.log('📝 Actualizando último acceso...');
    await pool.execute(
      'UPDATE `vendedores` SET `updated_at` = CURRENT_TIMESTAMP WHERE `id` = ?',
      [usuario.id]
    );

    // Determinar tablas de clientes accesibles
    let tablasClientes: string[] = [];
    
    console.log('📋 Obteniendo tablas de clientes...');
    if (esAdmin) {
      // Admin tiene acceso a TODAS las tablas de clientes (dinámico desde BD)
      tablasClientes = await obtenerTodasLasTablas();
      console.log(`🔑 Admin tiene acceso a ${tablasClientes.length} tablas de clientes:`, tablasClientes);
    } else {
      // Vendedor normal solo su tabla de clientes
      const sucursalLower = usuario.sucursal.toLowerCase();
      tablasClientes = [`clientes_${sucursalLower}`];
      console.log(`🔑 Vendedor tiene acceso a:`, tablasClientes);
    }

    // Responder con token y datos del usuario
    console.log('✅ Login exitoso, enviando respuesta');
    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        cargo: usuario.cargo,
        sucursal: usuario.sucursal.toLowerCase(), // ✅ Normalizar a minúsculas
        esAdmin: esAdmin,
        tablasClientes: tablasClientes,
        permisos: {
          verTodasSucursales: esAdmin,
          modificarUsuarios: esAdmin,
          verReportesGlobales: esAdmin,
          gestionarBaseDatos: esAdmin
        }
      }
    });
    console.log('🎉 Respuesta enviada correctamente');

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      error: 'Error al procesar el login'
    });
  }
};

/**
 * VERIFICAR TOKEN - Validar si el token es válido
 * GET /api/auth/verificar
 */
export const verificarToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // El token viene en el header Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Token no proporcionado'
      });
      return;
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Buscar usuario en la base de datos para verificar que sigue activo
    const [usuarios] = await pool.execute<VendedorDB[]>(
      'SELECT * FROM `vendedores` WHERE `id` = ? AND `activo` = TRUE',
      [decoded.id]
    );

    if (usuarios.length === 0) {
      res.status(401).json({
        error: 'Usuario no encontrado o inactivo'
      });
      return;
    }

    const usuario = usuarios[0];
    const esAdmin = usuario.email === 'admin@zarparuy.com';

    // Determinar tablas de clientes accesibles
    let tablasClientes: string[] = [];
    
    if (esAdmin) {
      // Admin tiene acceso a TODAS las tablas de clientes (dinámico desde BD)
      tablasClientes = await obtenerTodasLasTablas();
    } else {
      const sucursalLower = usuario.sucursal.toLowerCase();
      tablasClientes = [`clientes_${sucursalLower}`];
    }

    res.json({
      valido: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        cargo: usuario.cargo,
        sucursal: usuario.sucursal,
        esAdmin: esAdmin,
        tablasClientes: tablasClientes,
        permisos: {
          verTodasSucursales: esAdmin,
          modificarUsuarios: esAdmin,
          verReportesGlobales: esAdmin,
          gestionarBaseDatos: esAdmin
        }
      }
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Token inválido'
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token expirado'
      });
      return;
    }

    console.error('❌ Error al verificar token:', error);
    res.status(500).json({
      error: 'Error al verificar token'
    });
  }
};

/**
 * LOGOUT - Cerrar sesión
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // En un sistema con JWT, el logout es manejado principalmente por el frontend
    // eliminando el token del localStorage. Pero podríamos registrar el logout.
    
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        console.log(`📝 Usuario ${decoded.email} cerró sesión`);
      } catch (error) {
        // Token inválido o expirado, pero aún así respondemos con éxito
      }
    }

    res.json({
      mensaje: 'Sesión cerrada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en logout:', error);
    res.status(500).json({
      error: 'Error al cerrar sesión'
    });
  }
};

/**
 * OBTENER PERFIL - Obtener datos del usuario actual
 * GET /api/auth/perfil
 */
export const obtenerPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Token no proporcionado'
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Buscar usuario completo
    const [usuarios] = await pool.execute<VendedorDB[]>(
      'SELECT * FROM `vendedores` WHERE `id` = ? AND `activo` = TRUE',
      [decoded.id]
    );

    if (usuarios.length === 0) {
      res.status(404).json({
        error: 'Usuario no encontrado'
      });
      return;
    }

    const usuario = usuarios[0];
    const esAdmin = usuario.email === 'admin@zarparuy.com';

    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      cargo: usuario.cargo,
      sucursal: usuario.sucursal,
      telefono: usuario.telefono,
      fecha_ingreso: usuario.fecha_ingreso,
      esAdmin: esAdmin,
      activo: usuario.activo
    });

  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    res.status(500).json({
      error: 'Error al obtener perfil del usuario'
    });
  }
};

/**
 * CAMBIAR CONTRASEÑA - Permite al usuario cambiar su contraseña
 * POST /api/auth/cambiar-password
 */
export const cambiarPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Token no proporcionado'
      });
      return;
    }

    if (!passwordActual || !passwordNueva) {
      res.status(400).json({
        error: 'Contraseña actual y nueva son requeridas'
      });
      return;
    }

    if (passwordNueva.length < 6) {
      res.status(400).json({
        error: 'La contraseña nueva debe tener al menos 6 caracteres'
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Buscar usuario
    const [usuarios] = await pool.execute<VendedorDB[]>(
      'SELECT * FROM `vendedores` WHERE `id` = ? AND `activo` = TRUE',
      [decoded.id]
    );

    if (usuarios.length === 0) {
      res.status(404).json({
        error: 'Usuario no encontrado'
      });
      return;
    }

    const usuario = usuarios[0];

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(passwordActual, usuario.password);

    if (!passwordValida) {
      res.status(401).json({
        error: 'Contraseña actual incorrecta'
      });
      return;
    }

    // Encriptar nueva contraseña
    const nuevaPasswordHash = await bcrypt.hash(passwordNueva, 10);

    // Actualizar en la base de datos
    await pool.execute(
      'UPDATE `vendedores` SET `password` = ? WHERE `id` = ?',
      [nuevaPasswordHash, usuario.id]
    );

    console.log(`✅ Usuario ${usuario.email} cambió su contraseña`);

    res.json({
      mensaje: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al cambiar contraseña:', error);
    res.status(500).json({
      error: 'Error al cambiar contraseña'
    });
  }
};

