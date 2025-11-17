/**
 * Sistema de Migraciones Automáticas
 * Ejecuta migraciones SQL al iniciar el servidor
 */

import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';

/**
 * Crear tabla de control de migraciones si no existe
 */
const crearTablaMigraciones = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS migraciones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL UNIQUE,
      ejecutada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_nombre (nombre)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  await pool.execute(query);
};

/**
 * Verificar si una migración ya fue ejecutada
 */
const migracionEjecutada = async (nombre: string): Promise<boolean> => {
  const [rows] = await pool.execute(
    'SELECT id FROM migraciones WHERE nombre = ?',
    [nombre]
  ) as any;
  
  return rows.length > 0;
};

/**
 * Registrar migración como ejecutada
 */
const registrarMigracion = async (nombre: string) => {
  await pool.execute(
    'INSERT INTO migraciones (nombre) VALUES (?)',
    [nombre]
  );
};

/**
 * Ejecutar migración SQL
 */
const ejecutarMigracion = async (nombre: string, sql: string) => {
  const connection = await pool.getConnection();
  
  try {
    // Dividir por ';' y ejecutar cada statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.length > 0) {
        await connection.execute(statement);
      }
    }
    
    await registrarMigracion(nombre);
    console.log(`✅ Migración ejecutada: ${nombre}`);
    
  } catch (error: any) {
    console.error(`❌ Error ejecutando migración ${nombre}:`, error.message);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Ejecutar migraciones pendientes
 */
export const ejecutarMigraciones = async () => {
  try {
    console.log('🔄 Verificando migraciones pendientes...');
    
    // Crear tabla de control
    await crearTablaMigraciones();
    
    // Ruta a las migraciones (desde la raíz del proyecto)
    const migracionesDir = path.join(process.cwd(), 'database/migrations');
    
    // Verificar si el directorio existe
    if (!fs.existsSync(migracionesDir)) {
      console.log('⚠️ No hay directorio de migraciones');
      return;
    }
    
    // Leer archivos .sql
    const archivos = fs.readdirSync(migracionesDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Ordenar alfabéticamente
    
    if (archivos.length === 0) {
      console.log('✅ No hay migraciones para ejecutar');
      return;
    }
    
    let ejecutadas = 0;
    
    for (const archivo of archivos) {
      const nombreMigracion = archivo.replace('.sql', '');
      
      // Verificar si ya fue ejecutada
      const yaEjecutada = await migracionEjecutada(nombreMigracion);
      
      if (yaEjecutada) {
        console.log(`⏭️ Migración ya ejecutada: ${nombreMigracion}`);
        continue;
      }
      
      // Leer contenido del archivo
      const rutaCompleta = path.join(migracionesDir, archivo);
      const sql = fs.readFileSync(rutaCompleta, 'utf-8');
      
      // Ejecutar migración
      await ejecutarMigracion(nombreMigracion, sql);
      ejecutadas++;
    }
    
    if (ejecutadas > 0) {
      console.log(`✅ Se ejecutaron ${ejecutadas} migraciones nuevas`);
    } else {
      console.log('✅ Todas las migraciones están al día');
    }
    
  } catch (error: any) {
    console.error('❌ Error en sistema de migraciones:', error.message);
    // No lanzar error para no detener el servidor
  }
};

