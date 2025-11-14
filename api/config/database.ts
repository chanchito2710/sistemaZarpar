/**
 * Configuración de la conexión a MySQL
 * Este archivo gestiona la conexión con la base de datos zarparEcommerce
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Pool de conexiones a MySQL para optimizar el rendimiento
 * - Reutiliza conexiones existentes
 * - Gestiona automáticamente las conexiones
 * - Mejora el rendimiento en operaciones concurrentes
 * 
 * Configuración de conexión:
 * - Base de datos: zarparDataBase (Docker MySQL)
 * - Puerto: 3307 (mapeado desde el contenedor Docker)
 * - Contenedor: zarpar-mysql
 */
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3307'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'zarpar2025',
  database: process.env.DB_NAME || 'zarparDataBase',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 10000,
  charset: 'utf8mb4',
  dateStrings: true,
  typeCast: true,
  supportBigNumbers: true,
  bigNumberStrings: true
} as any);

/**
 * Función para verificar la conexión a la base de datos
 * Intenta establecer una conexión y retorna el estado
 * 
 * ⚡ Reintenta hasta 5 veces con delay de 2s si falla
 */
export async function testConnection(): Promise<boolean> {
  const maxRetries = 5;
  const retryDelay = 2000; // 2 segundos
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt}/${maxRetries} de conectar a MySQL...`);
      
      const connection = await pool.getConnection();
      
      // Asegurar que la conexión use UTF-8
      await connection.query("SET NAMES 'utf8mb4'");
      await connection.query("SET CHARACTER SET utf8mb4");
      await connection.query("SET character_set_connection=utf8mb4");
      
      console.log('✅ Conexión exitosa a MySQL');
      console.log('📦 Base de datos: zarparDataBase');
      console.log('🐳 Contenedor: zarpar-mysql (Puerto 3307)');
      console.log('🔤 Charset: utf8mb4');
      
      connection.release();
      return true;
      
    } catch (error: any) {
      console.log(`❌ Intento ${attempt} falló:`, error.code || error.message);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Esperando ${retryDelay/1000}s antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error('\n❌ Error: No se pudo conectar a MySQL después de', maxRetries, 'intentos');
        console.error('💡 Verifica que el contenedor Docker esté corriendo: docker ps');
        console.error('💡 O espera unos segundos más a que MySQL termine de iniciar\n');
        return false;
      }
    }
  }
  
  return false;
}

/**
 * Función para ejecutar queries de forma segura
 * @param query - Query SQL a ejecutar
 * @param params - Parámetros para la query (previene SQL injection)
 * 
 * ⚡ Maneja automáticamente reconexión si se pierde la conexión
 */
export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T> {
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T;
  } catch (error: any) {
    // Si la conexión se perdió, intentar reconectar una vez
    if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ETIMEDOUT') {
      console.log('🔄 Conexión perdida, reintentando...');
      try {
        const [rows] = await pool.execute(query, params);
        console.log('✅ Reconexión exitosa');
        return rows as T;
      } catch (retryError) {
        console.error('❌ Error en reintento:', retryError);
        throw retryError;
      }
    }
    console.error('Error ejecutando query:', error);
    throw error;
  }
}

/**
 * Función para cerrar el pool de conexiones
 * Útil para cerrar las conexiones al terminar el servidor
 */
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    console.log('🔌 Pool de conexiones cerrado correctamente');
  } catch (error) {
    console.error('Error cerrando el pool:', error);
  }
}

export default pool;


