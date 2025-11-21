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
    const configuracionesFiltradas = configuracionesExistentes.filter((config: any) => 
      sucursalesReales.includes(config.sucursal.toLowerCase())
    );
    
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
          updated_at: new Date(),
          updated_by: null
        });
      }
    }
    
    // ✅ 5. Ordenar por nombre de sucursal
    const configuracionesFinales = configuracionesFiltradas.sort((a: any, b: any) => 
      a.sucursal.localeCompare(b.sucursal)
    );
    
    console.log('🎯 [DESCUENTOS] Total configuraciones finales:', configuracionesFinales.length);

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
    const usuario = (req as any).user;

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








