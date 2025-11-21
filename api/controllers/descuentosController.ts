import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database.js';

// Obtener configuración de descuentos de todas las sucursales (100% DINÁMICO)
export const obtenerConfiguracionDescuentos = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📊 [DESCUENTOS] Obteniendo configuración dinámica...');
    
    // ✅ 1. Obtener TODAS las sucursales dinámicamente desde la BD
    const { obtenerNombresSucursales } = await import('../utils/database.js');
    const sucursalesReales = await obtenerNombresSucursales();
    
    console.log('🏪 [DESCUENTOS] Sucursales reales encontradas:', sucursalesReales);
    
    // ✅ 2. Obtener configuraciones existentes
    const [configuracionesExistentes] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM configuracion_descuentos_sucursal'
    );
    
    console.log('📋 [DESCUENTOS] Configuraciones existentes:', configuracionesExistentes.length);
    
    // ✅ 3. Filtrar SOLO las configuraciones de sucursales que realmente existen
    // Convertir a array genérico para poder agregar nuevos objetos
    const configuracionesFiltradas: any[] = configuracionesExistentes
      .filter((config: any) => sucursalesReales.includes(config.sucursal.toLowerCase()))
      .map(config => ({
        id: config.id,
        sucursal: config.sucursal,
        descuento_habilitado: config.descuento_habilitado,
        una_vez_activo: config.una_vez_activo || 0, // ⭐ Incluir campo una_vez_activo
        updated_at: config.updated_at,
        updated_by: config.updated_by
      }));
    
    console.log('✅ [DESCUENTOS] Configuraciones filtradas:', configuracionesFiltradas.length);
    
    // ✅ 4. Agregar sucursales faltantes con configuración por defecto (deshabilitado)
    const sucursalesConConfiguracion = configuracionesFiltradas.map((c: any) => c.sucursal.toLowerCase());
    const sucursalesFaltantes = sucursalesReales.filter(s => !sucursalesConConfiguracion.includes(s));
    
    if (sucursalesFaltantes.length > 0) {
      console.log('🆕 [DESCUENTOS] Creando configuración para sucursales nuevas:', sucursalesFaltantes);
      
      // Insertar configuraciones para sucursales nuevas
      for (const sucursal of sucursalesFaltantes) {
        await pool.execute(
          `INSERT IGNORE INTO configuracion_descuentos_sucursal 
           (sucursal, descuento_habilitado) VALUES (?, 0)`,
          [sucursal]
        );
        
        // Agregar a la lista de configuraciones
        configuracionesFiltradas.push({
          sucursal,
          descuento_habilitado: 0,
          una_vez_activo: 0, // ⭐ Incluir campo una_vez_activo
          updated_at: new Date(),
          updated_by: null
        });
      }
    }
    
    // ✅ 5. Ordenar por nombre de sucursal
    const configuracionesFinales = configuracionesFiltradas.sort((a, b) => 
      a.sucursal.localeCompare(b.sucursal)
    );
    
    console.log('🎯 [DESCUENTOS] Total configuraciones finales:', configuracionesFinales.length);
    console.log('📋 [DESCUENTOS] Datos a enviar:', JSON.stringify(configuracionesFinales, null, 2));

    res.status(200).json({
      success: true,
      data: configuracionesFinales
    });
  } catch (error) {
    console.error('❌ Error al obtener configuración de descuentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración de descuentos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Obtener configuración de descuento de una sucursal específica
export const obtenerConfiguracionPorSucursal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.params;

    if (!sucursal) {
      res.status(400).json({
        success: false,
        message: 'Sucursal requerida'
      });
      return;
    }

    const [configuracion] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM configuracion_descuentos_sucursal WHERE sucursal = ?',
      [sucursal.toLowerCase()]
    );

    if (configuracion.length === 0) {
      // Si no existe, crear con descuento deshabilitado por defecto
      await pool.execute(
        'INSERT INTO configuracion_descuentos_sucursal (sucursal, descuento_habilitado) VALUES (?, 0)',
        [sucursal.toLowerCase()]
      );

      res.status(200).json({
        success: true,
        data: {
          sucursal: sucursal.toLowerCase(),
          descuento_habilitado: 0
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: configuracion[0]
    });
  } catch (error) {
    console.error('❌ Error al obtener configuración de descuento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración de descuento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Actualizar configuración de descuento de una sucursal
export const actualizarConfiguracionDescuento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.params;
    const { descuento_habilitado } = req.body;
    const usuario = (req as any).usuario; // ✅ CORREGIDO: req.usuario (no req.user)

    if (!sucursal) {
      res.status(400).json({
        success: false,
        message: 'Sucursal requerida'
      });
      return;
    }

    if (typeof descuento_habilitado !== 'boolean' && typeof descuento_habilitado !== 'number') {
      res.status(400).json({
        success: false,
        message: 'Estado de descuento inválido'
      });
      return;
    }

    // Verificar si la configuración existe
    const [existe] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM configuracion_descuentos_sucursal WHERE sucursal = ?',
      [sucursal.toLowerCase()]
    );

    const habilitado = descuento_habilitado ? 1 : 0;

    if (existe.length === 0) {
      // Crear si no existe
      await pool.execute(
        'INSERT INTO configuracion_descuentos_sucursal (sucursal, descuento_habilitado, updated_by) VALUES (?, ?, ?)',
        [sucursal.toLowerCase(), habilitado, usuario?.email || null]
      );
    } else {
      // Actualizar si existe
      await pool.execute(
        'UPDATE configuracion_descuentos_sucursal SET descuento_habilitado = ?, updated_by = ? WHERE sucursal = ?',
        [habilitado, usuario?.email || null, sucursal.toLowerCase()]
      );
    }

    console.log(`✅ Descuento ${habilitado ? 'HABILITADO' : 'DESHABILITADO'} para ${sucursal.toUpperCase()}`);

    res.status(200).json({
      success: true,
      message: `Descuento ${habilitado ? 'habilitado' : 'deshabilitado'} para ${sucursal.toUpperCase()}`,
      data: {
        sucursal: sucursal.toLowerCase(),
        descuento_habilitado: habilitado
      }
    });
  } catch (error) {
    console.error('❌ Error al actualizar configuración de descuento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración de descuento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Habilitar descuento "una vez" para una sucursal
export const habilitarUnaVez = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.params;
    const usuario = (req as any).usuario; // ✅ CORREGIDO: req.usuario (no req.user)

    if (!sucursal) {
      res.status(400).json({
        success: false,
        message: 'Sucursal requerida'
      });
      return;
    }

    console.log('🔍 [DEBUG] Usuario recibido en controlador:', usuario);
    console.log('🔍 [DEBUG] Email del usuario:', usuario?.email);
    console.log('🔍 [DEBUG] Sucursal solicitada:', sucursal);

    // ✅ VALIDACIÓN DE PERMISOS: Verificar si el usuario tiene permiso para habilitar descuento en esta sucursal
    const esAdmin = usuario?.email === 'admin@zarparuy.com';
    
    if (!esAdmin) {
      // Si NO es admin, solo puede habilitar descuento en SU propia sucursal
      const sucursalDelUsuario = usuario?.email?.split('@')[0].toLowerCase(); // Ej: maldonado@zarparuy.com → maldonado
      
      if (sucursalDelUsuario !== sucursal.toLowerCase()) {
        console.log(`❌ Usuario ${usuario?.email} intentó habilitar descuento en ${sucursal} (no autorizado)`);
        res.status(403).json({
          success: false,
          message: `No tienes permiso para habilitar descuentos en la sucursal ${sucursal.toUpperCase()}. Solo puedes gestionar descuentos de tu propia sucursal (${sucursalDelUsuario?.toUpperCase()}).`
        });
        return;
      }
    }

    console.log(`🎯 Habilitando descuento UNA VEZ para ${sucursal.toUpperCase()} (por ${usuario?.email})`);

    // Verificar si la configuración existe
    const [existe] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM configuracion_descuentos_sucursal WHERE sucursal = ?',
      [sucursal.toLowerCase()]
    );

    if (existe.length === 0) {
      // Crear si no existe (con una_vez_activo = 1)
      await pool.execute(
        'INSERT INTO configuracion_descuentos_sucursal (sucursal, descuento_habilitado, una_vez_activo, updated_by) VALUES (?, 0, 1, ?)',
        [sucursal.toLowerCase(), usuario?.email || null]
      );
    } else {
      // Actualizar si existe (activar una_vez_activo)
      await pool.execute(
        'UPDATE configuracion_descuentos_sucursal SET una_vez_activo = 1, updated_by = ? WHERE sucursal = ?',
        [usuario?.email || null, sucursal.toLowerCase()]
      );
    }

    console.log(`✅ Descuento UNA VEZ habilitado para ${sucursal.toUpperCase()}`);

    res.status(200).json({
      success: true,
      message: `Descuento habilitado UNA VEZ para ${sucursal.toUpperCase()}. Se desactivará automáticamente después del primer uso.`,
      data: {
        sucursal: sucursal.toLowerCase(),
        una_vez_activo: 1
      }
    });
  } catch (error: any) {
    console.error('❌ Error al habilitar descuento una vez:', error);
    console.error('❌ Código de error:', error.code);
    console.error('❌ Errno:', error.errno);
    console.error('❌ SQL State:', error.sqlState);
    console.error('❌ SQL Message:', error.sqlMessage);
    
    // Si es error de columna inexistente, dar mensaje específico
    if (error.errno === 1054 || error.code === 'ER_BAD_FIELD_ERROR') {
      res.status(500).json({
        success: false,
        message: '⚠️ La columna una_vez_activo NO existe en la base de datos. Debes ejecutar la migración SQL en Railway.',
        error: 'Columna una_vez_activo no encontrada',
        instrucciones: 'Ejecuta el SQL de database/EJECUTAR_EN_RAILWAY_UNA_VEZ.sql en Railway MySQL Data tab'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al habilitar descuento una vez',
      error: error instanceof Error ? error.message : 'Error desconocido',
      detalles: {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState
      }
    });
  }
};

// Desactivar descuento "una vez" (después de usarse o manualmente)
export const desactivarUnaVez = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.params;
    const usuario = (req as any).usuario; // ✅ CORREGIDO: req.usuario (no req.user)

    if (!sucursal) {
      res.status(400).json({
        success: false,
        message: 'Sucursal requerida'
      });
      return;
    }

    console.log('🔍 [DEBUG] Usuario recibido en desactivarUnaVez:', usuario);
    console.log('🔍 [DEBUG] Email del usuario:', usuario?.email);
    console.log('🔍 [DEBUG] Sucursal solicitada:', sucursal);

    // ✅ VALIDACIÓN DE PERMISOS: Verificar si el usuario tiene permiso para desactivar descuento en esta sucursal
    const esAdmin = usuario?.email === 'admin@zarparuy.com';
    
    if (!esAdmin) {
      // Si NO es admin, solo puede desactivar descuento en SU propia sucursal
      const sucursalDelUsuario = usuario?.email?.split('@')[0].toLowerCase();
      
      if (sucursalDelUsuario !== sucursal.toLowerCase()) {
        console.log(`❌ Usuario ${usuario?.email} intentó desactivar descuento en ${sucursal} (no autorizado)`);
        res.status(403).json({
          success: false,
          message: `No tienes permiso para desactivar descuentos en la sucursal ${sucursal.toUpperCase()}. Solo puedes gestionar descuentos de tu propia sucursal (${sucursalDelUsuario?.toUpperCase()}).`
        });
        return;
      }
    }

    console.log(`🔄 Desactivando descuento UNA VEZ para ${sucursal.toUpperCase()} (por ${usuario?.email})`);

    await pool.execute(
      'UPDATE configuracion_descuentos_sucursal SET una_vez_activo = 0 WHERE sucursal = ?',
      [sucursal.toLowerCase()]
    );

    console.log(`✅ Descuento UNA VEZ desactivado para ${sucursal.toUpperCase()}`);

    res.status(200).json({
      success: true,
      message: `Descuento de uso único desactivado para ${sucursal.toUpperCase()}`,
      data: {
        sucursal: sucursal.toLowerCase(),
        una_vez_activo: 0
      }
    });
  } catch (error) {
    console.error('❌ Error al desactivar descuento una vez:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar descuento una vez',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};








