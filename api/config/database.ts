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
  connectionLimit: 10, // Máximo de conexiones simultáneas
  queueLimit: 0, // Sin límite de cola
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Timeouts para evitar bloqueos
  connectTimeout: 60000, // 60 segundos para conectar
  acquireTimeout: 60000, // 60 segundos para adquirir conexión del pool
  timeout: 60000, // 60 segundos para queries
  // Configuración de encoding UTF-8 para soportar acentos y caracteres especiales
  charset: 'utf8mb4',
  // Asegurar que la conexión use UTF-8
  connectAttributes: {
    charset: 'utf8mb4'
  },
  // ⚡ SOLUCIÓN AL ERROR "Connection lost":
  // Eliminar y recrear conexiones perdidas automáticamente
  maxIdle: 10, // Máximo de conexiones idle antes de cerrar
  idleTimeout: 60000, // 60 segundos antes de cerrar conexión idle
  
  // Configuración avanzada para manejar conexiones perdidas
  dateStrings: true, // Retornar fechas como strings
  typeCast: true, // Conversión automática de tipos
  supportBigNumbers: true,
  bigNumberStrings: true
});

/**
 * Función para verificar la conexión a la base de datos
 * Intenta establecer una conexión y retorna el estado
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    // Asegurar que la conexión use UTF-8
    await connection.query("SET NAMES 'utf8mb4'");
    await connection.query("SET CHARACTER SET utf8mb4");
    await connection.query("SET character_set_connection=utf8mb4");
    console.log('✅ Conexión exitosa a MySQL - Base de datos: zarparDataBase');
    console.log('📦 Contenedor Docker: zarpar-mysql (Puerto 3307)');
    console.log('🔤 Charset: utf8mb4 (soporta acentos y emojis)');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error);
    console.error('💡 Verifica que el contenedor Docker esté corriendo: docker ps');
    return false;
  }
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


