/**
 * Verificar y crear columna una_vez_activo si no existe
 * Se ejecuta automáticamente al iniciar el servidor
 */

import { pool } from '../config/database.js';
import { RowDataPacket } from 'mysql2';

export const verificarColumnasDescuentos = async (): Promise<void> => {
  try {
    console.log('🔍 Verificando estructura de tabla configuracion_descuentos_sucursal...');
    
    // Verificar si la columna una_vez_activo existe
    const [columns] = await pool.execute<RowDataPacket[]>(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'zarparDataBase'
        AND TABLE_NAME = 'configuracion_descuentos_sucursal'
        AND COLUMN_NAME = 'una_vez_activo'
    `);
    
    if (columns.length === 0) {
      console.log('⚠️ Columna una_vez_activo NO existe. Creando automáticamente...');
      
      // Crear la columna automáticamente
      await pool.execute(`
        ALTER TABLE configuracion_descuentos_sucursal
        ADD COLUMN una_vez_activo TINYINT(1) DEFAULT 0 
        COMMENT 'Descuento habilitado SOLO para la próxima venta (0=NO, 1=SÍ)' 
        AFTER descuento_habilitado
      `);
      
      console.log('✅ Columna una_vez_activo creada exitosamente en Railway');
      
      // Registrar migración
      await pool.execute(`
        INSERT IGNORE INTO migraciones (nombre) 
        VALUES ('009_agregar_una_vez_descuentos.sql')
      `);
      
      console.log('✅ Migración registrada en tabla migraciones');
      
    } else {
      console.log('✅ Columna una_vez_activo ya existe');
    }
    
  } catch (error: any) {
    console.error('❌ Error al verificar/crear columna una_vez_activo:', error);
    console.error('❌ Código:', error.code);
    console.error('❌ Mensaje:', error.message);
    
    // No lanzar error para no detener el servidor
    // Solo loguearlo
  }
};

