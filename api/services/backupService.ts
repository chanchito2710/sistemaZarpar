/**
 * 🗄️ SERVICIO DE BACKUPS
 * 
 * Maneja toda la lógica de backups automáticos y manuales:
 * - Crear backups
 * - Restaurar backups
 * - Limpiar backups antiguos (> 7 días)
 * - Gestionar metadata
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { pool } from '../config/database.js';

const execAsync = promisify(exec);

// Configuración
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
const MAX_DAYS = 7;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3307';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'zarparDataBase';

// Asegurar que existe el directorio de backups
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`✅ Directorio de backups creado: ${BACKUP_DIR}`);
}

/**
 * Ejecutar mysqldump y crear archivo de backup
 * Usa Docker en desarrollo y mysqldump directo en producción
 */
async function ejecutarMysqlDump(filename: string): Promise<string> {
  const filepath = path.join(BACKUP_DIR, filename);
  
  // Detectar si estamos en desarrollo (Docker) o producción
  // En desarrollo: localhost o 127.0.0.1 con puerto 3307 = Docker
  const isLocalhost = DB_HOST === 'localhost' || DB_HOST === '127.0.0.1';
  const isDockerPort = DB_PORT === '3307' || DB_PORT === 3307;
  const isDocker = isLocalhost && isDockerPort;
  
  console.log(`🔍 Detección Docker: HOST=${DB_HOST}, PORT=${DB_PORT}, isDocker=${isDocker}`);
  
  let command: string;
  
  if (isDocker) {
    // En desarrollo: Usar Docker exec (sin redirección >)
    console.log('🐳 Usando Docker exec para mysqldump');
    command = `docker exec zarpar-mysql mysqldump -u ${DB_USER} -p${DB_PASSWORD} --default-character-set=utf8mb4 --single-transaction --routines --triggers --no-tablespaces --ignore-table=${DB_NAME}.backups_metadata --ignore-table=${DB_NAME}.backup_logs ${DB_NAME}`;
  } else {
    // En producción: Usar mysqldump directo (sin redirección >)
    console.log('☁️ Usando mysqldump directo (Railway)');
    command = `mysqldump -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} --default-character-set=utf8mb4 --single-transaction --routines --triggers --no-tablespaces --ignore-table=${DB_NAME}.backups_metadata --ignore-table=${DB_NAME}.backup_logs ${DB_NAME}`;
  }
  
  try {
    console.log(`📝 Ejecutando comando: ${command.replace(/-p[^ ]+/, '-p****')}`);
    
    // Ejecutar comando y capturar output (sin redirección shell)
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 100 * 1024 * 1024, // 100MB buffer para DBs grandes
    });
    
    // Escribir el output directamente al archivo
    fs.writeFileSync(filepath, stdout, 'utf8');
    
    if (stderr && !stderr.includes('Warning')) {
      console.warn(`⚠️ STDERR: ${stderr}`);
    }
    
    // Verificar que el archivo se creó y no está vacío
    const stats = fs.statSync(filepath);
    if (stats.size === 0) {
      throw new Error('El archivo de backup está vacío');
    }
    
    console.log(`✅ Backup creado: ${filepath} (${stats.size} bytes)`);
    return filepath;
    
  } catch (error: any) {
    console.error(`❌ Error en mysqldump:`, error);
    
    // Si hay error, eliminar el archivo parcial
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    throw new Error(`Error al crear backup: ${error.message}`);
  }
}

/**
 * Guardar metadata del backup en base de datos
 */
async function guardarMetadata(data: {
  filename: string;
  tipo: 'automatico' | 'manual';
  nombre_personalizado: string | null;
  nota: string | null;
  tamano_bytes: number;
  creado_por_email: string;
}): Promise<void> {
  await pool.execute(
    `INSERT INTO backups_metadata 
    (filename, tipo, nombre_personalizado, nota, tamano_bytes, creado_por_email)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.filename,
      data.tipo,
      data.nombre_personalizado,
      data.nota,
      data.tamano_bytes,
      data.creado_por_email
    ]
  );
}

/**
 * Registrar acción en log de auditoría
 */
async function registrarLog(data: {
  accion: 'crear' | 'restaurar' | 'eliminar' | 'descargar';
  backup_filename: string;
  usuario_email: string;
  exitoso: boolean;
  detalles?: string;
  duracion_segundos?: number;
}): Promise<void> {
  await pool.execute(
    `INSERT INTO backup_logs 
    (accion, backup_filename, usuario_email, exitoso, detalles, duracion_segundos)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.accion,
      data.backup_filename,
      data.usuario_email,
      data.exitoso,
      data.detalles || null,
      data.duracion_segundos || null
    ]
  );
}

/**
 * Limpiar backups antiguos (> 7 días)
 */
export async function limpiarBackupsViejos(): Promise<number> {
  const maxAge = MAX_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let eliminados = 0;
  
  try {
    // Obtener todos los backups de la BD
    const [backups]: any = await pool.execute(
      'SELECT filename, created_at FROM backups_metadata ORDER BY created_at ASC'
    );
    
    for (const backup of backups) {
      const age = now - new Date(backup.created_at).getTime();
      
      if (age > maxAge) {
        // Eliminar archivo físico
        const filepath = path.join(BACKUP_DIR, backup.filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        
        // Eliminar metadata
        await pool.execute(
          'DELETE FROM backups_metadata WHERE filename = ?',
          [backup.filename]
        );
        
        eliminados++;
        console.log(`🗑️ Eliminado backup viejo: ${backup.filename}`);
      }
    }
    
    return eliminados;
  } catch (error: any) {
    console.error('Error al limpiar backups viejos:', error);
    throw error;
  }
}

/**
 * Crear backup automático (llamado por cron)
 */
export async function crearBackupAutomatico(): Promise<void> {
  const inicio = Date.now();
  
  try {
    console.log('🔄 Iniciando backup automático...');
    
    // Generar nombre de archivo con timestamp
    const fecha = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `backup_auto_${fecha}.sql`;
    
    // Crear backup
    const filepath = await ejecutarMysqlDump(filename);
    
    // Obtener tamaño del archivo
    const stats = fs.statSync(filepath);
    
    // Guardar metadata
    await guardarMetadata({
      filename,
      tipo: 'automatico',
      nombre_personalizado: null,
      nota: 'Backup automático programado',
      tamano_bytes: stats.size,
      creado_por_email: 'sistema'
    });
    
    // Registrar log
    const duracion = Math.round((Date.now() - inicio) / 1000);
    await registrarLog({
      accion: 'crear',
      backup_filename: filename,
      usuario_email: 'sistema',
      exitoso: true,
      detalles: `Backup automático creado. Tamaño: ${formatBytes(stats.size)}`,
      duracion_segundos: duracion
    });
    
    // Limpiar backups viejos
    const eliminados = await limpiarBackupsViejos();
    
    console.log(`✅ Backup automático creado: ${filename} (${formatBytes(stats.size)})`);
    if (eliminados > 0) {
      console.log(`🗑️ Eliminados ${eliminados} backups antiguos`);
    }
    
  } catch (error: any) {
    console.error('❌ Error en backup automático:', error);
    
    // Registrar log de error
    await registrarLog({
      accion: 'crear',
      backup_filename: 'error',
      usuario_email: 'sistema',
      exitoso: false,
      detalles: `Error: ${error.message}`
    });
    
    throw error;
  }
}

/**
 * Crear backup manual
 */
export async function crearBackupManual(data: {
  nombre?: string;
  nota?: string;
  usuario_email: string;
}): Promise<any> {
  const inicio = Date.now();
  
  try {
    // Generar nombre de archivo
    const fecha = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `backup_manual_${fecha}.sql`;
    
    // Crear backup
    const filepath = await ejecutarMysqlDump(filename);
    
    // Obtener tamaño
    const stats = fs.statSync(filepath);
    
    // Guardar metadata
    await guardarMetadata({
      filename,
      tipo: 'manual',
      nombre_personalizado: data.nombre || null,
      nota: data.nota || null,
      tamano_bytes: stats.size,
      creado_por_email: data.usuario_email
    });
    
    // Registrar log
    const duracion = Math.round((Date.now() - inicio) / 1000);
    await registrarLog({
      accion: 'crear',
      backup_filename: filename,
      usuario_email: data.usuario_email,
      exitoso: true,
      detalles: `Backup manual creado${data.nombre ? `: ${data.nombre}` : ''}`,
      duracion_segundos: duracion
    });
    
    // Limpiar backups viejos
    await limpiarBackupsViejos();
    
    return {
      filename,
      nombre: data.nombre || filename,
      tamano: formatBytes(stats.size),
      fecha: new Date()
    };
    
  } catch (error: any) {
    // Registrar log de error
    await registrarLog({
      accion: 'crear',
      backup_filename: 'error',
      usuario_email: data.usuario_email,
      exitoso: false,
      detalles: `Error: ${error.message}`
    });
    
    throw error;
  }
}

/**
 * Restaurar backup
 * Usa Docker en desarrollo y mysql directo en producción
 */
export async function restaurarBackup(filename: string, usuario_email: string): Promise<void> {
  const inicio = Date.now();
  const filepath = path.join(BACKUP_DIR, filename);
  
  try {
    console.log(`🔄 Iniciando restauración de backup: ${filename}`);
    
    // Verificar que existe el archivo
    if (!fs.existsSync(filepath)) {
      throw new Error('El archivo de backup no existe');
    }
    
    // Detectar si estamos en desarrollo (Docker) o producción
    const isLocalhost = DB_HOST === 'localhost' || DB_HOST === '127.0.0.1';
    const isDockerPort = DB_PORT === '3307' || DB_PORT === 3307;
    const isDocker = isLocalhost && isDockerPort;
    
    console.log(`🔍 Detección Docker (restaurar): HOST=${DB_HOST}, PORT=${DB_PORT}, isDocker=${isDocker}`);
    
    // Leer el contenido del archivo SQL
    const sqlContent = fs.readFileSync(filepath, 'utf8');
    console.log(`📄 Archivo SQL leído: ${sqlContent.length} caracteres`);
    
    let command: string;
    
    if (isDocker) {
      // En desarrollo: Usar Docker exec con stdin
      console.log('🐳 Usando Docker exec para restaurar');
      command = `docker exec -i zarpar-mysql mysql -u ${DB_USER} -p${DB_PASSWORD} --default-character-set=utf8mb4 ${DB_NAME}`;
    } else {
      // En producción: Usar mysql directo con stdin
      console.log('☁️ Usando mysql directo (Railway) para restaurar');
      command = `mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} --default-character-set=utf8mb4 ${DB_NAME}`;
    }
    
    console.log(`📝 Ejecutando restauración...`);
    
    // Ejecutar comando pasando el SQL por stdin
    await new Promise<void>((resolve, reject) => {
      const childProcess = exec(command, { maxBuffer: 100 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Error en restauración:`, error);
          console.error(`STDERR:`, stderr);
          reject(new Error(`Error al restaurar: ${error.message}\n${stderr}`));
        } else {
          if (stderr && !stderr.includes('Warning')) {
            console.warn(`⚠️ STDERR:`, stderr);
          }
          console.log(`✅ Restauración completada`);
          resolve();
        }
      });
      
      // Escribir el contenido SQL al stdin del proceso
      if (childProcess.stdin) {
        childProcess.stdin.write(sqlContent);
        childProcess.stdin.end();
      } else {
        reject(new Error('No se pudo escribir al stdin del proceso'));
      }
    });
    
    // Registrar log
    const duracion = Math.round((Date.now() - inicio) / 1000);
    await registrarLog({
      accion: 'restaurar',
      backup_filename: filename,
      usuario_email,
      exitoso: true,
      detalles: 'Base de datos restaurada exitosamente',
      duracion_segundos: duracion
    });
    
    console.log(`✅ Backup restaurado: ${filename} (${duracion}s)`);
    
  } catch (error: any) {
    console.error(`❌ Error al restaurar backup:`, error);
    
    // Registrar log de error
    await registrarLog({
      accion: 'restaurar',
      backup_filename: filename,
      usuario_email,
      exitoso: false,
      detalles: `Error: ${error.message}`
    });
    
    throw new Error(`Error al restaurar backup: ${error.message}`);
  }
}

/**
 * Listar todos los backups con metadata
 */
export async function listarBackups(): Promise<any[]> {
  try {
    console.log('🔍 [SERVICE] Ejecutando query para listar backups...');
    const [backups]: any = await pool.execute(`
      SELECT 
        filename,
        tipo,
        nombre_personalizado,
        nota,
        tamano_bytes,
        creado_por_email,
        created_at
      FROM backups_metadata
      ORDER BY created_at DESC
    `);
    
    console.log(`📦 [SERVICE] Backups encontrados en BD: ${backups.length}`);
    
    // Contar total para saber cuál es el último
    const totalBackups = backups.length;
    
    const resultado = backups.map((backup: any, index: number) => ({
      ...backup,
      tamano_formateado: formatBytes(backup.tamano_bytes),
      edad_dias: Math.floor((Date.now() - new Date(backup.created_at).getTime()) / (24 * 60 * 60 * 1000)),
      esUltimoBackup: index === 0 // El primero es el más reciente
    }));
    
    console.log('✅ [SERVICE] Backups procesados correctamente');
    return resultado;
    
  } catch (error: any) {
    console.error('❌ [SERVICE] Error al listar backups:', error);
    console.error('Mensaje:', error.message);
    console.error('SQL State:', error.sqlState);
    console.error('SQL Message:', error.sqlMessage);
    throw error;
  }
}

/**
 * Eliminar backup
 */
export async function eliminarBackup(filename: string, usuario_email: string): Promise<void> {
  try {
    // Verificar que no sea el último backup
    const [count]: any = await pool.execute(
      'SELECT COUNT(*) as total FROM backups_metadata'
    );
    
    if (count[0].total <= 1) {
      throw new Error('No puedes eliminar el último backup');
    }
    
    // Eliminar archivo físico
    const filepath = path.join(BACKUP_DIR, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    
    // Eliminar metadata
    await pool.execute(
      'DELETE FROM backups_metadata WHERE filename = ?',
      [filename]
    );
    
    // Registrar log
    await registrarLog({
      accion: 'eliminar',
      backup_filename: filename,
      usuario_email,
      exitoso: true,
      detalles: 'Backup eliminado manualmente'
    });
    
    console.log(`🗑️ Backup eliminado: ${filename}`);
    
  } catch (error: any) {
    // Registrar log de error
    await registrarLog({
      accion: 'eliminar',
      backup_filename: filename,
      usuario_email,
      exitoso: false,
      detalles: `Error: ${error.message}`
    });
    
    throw error;
  }
}

/**
 * Obtener estadísticas de backups
 */
export async function obtenerEstadisticas(): Promise<any> {
  try {
    console.log('📊 [SERVICE] Obteniendo estadísticas de backups...');
    const [stats]: any = await pool.execute(`
      SELECT 
        COUNT(*) as total_backups,
        SUM(tamano_bytes) as tamano_total,
        MAX(created_at) as ultimo_backup,
        SUM(CASE WHEN tipo = 'automatico' THEN 1 ELSE 0 END) as automaticos,
        SUM(CASE WHEN tipo = 'manual' THEN 1 ELSE 0 END) as manuales
      FROM backups_metadata
    `);
    
    console.log('📈 [SERVICE] Stats de backups:', stats[0]);
    
    // Obtener tamaño de la base de datos actual
    console.log('💾 [SERVICE] Obteniendo tamaño de BD...');
    const [dbSize]: any = await pool.execute(`
      SELECT 
        SUM(data_length + index_length) as size
      FROM information_schema.tables
      WHERE table_schema = ?
    `, [DB_NAME]);
    
    console.log('💽 [SERVICE] Tamaño BD:', dbSize[0]);
    
    const resultado = {
      total_backups: stats[0].total_backups || 0,
      tamano_total: formatBytes(stats[0].tamano_total || 0),
      tamano_total_bytes: stats[0].tamano_total || 0,
      ultimo_backup: stats[0].ultimo_backup,
      automaticos: stats[0].automaticos || 0,
      manuales: stats[0].manuales || 0,
      tamano_bd_actual: formatBytes(dbSize[0].size || 0),
      tamano_bd_bytes: dbSize[0].size || 0,
      proximo_backup_automatico: getProximoBackup()
    };
    
    console.log('✅ [SERVICE] Estadísticas generadas:', resultado);
    return resultado;
    
  } catch (error: any) {
    console.error('❌ [SERVICE] Error al obtener estadísticas:', error);
    console.error('Mensaje:', error.message);
    console.error('SQL State:', error.sqlState);
    console.error('SQL Message:', error.sqlMessage);
    throw error;
  }
}

/**
 * Formatear bytes a formato legible
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calcular próximo backup automático
 */
function getProximoBackup(): Date {
  const now = new Date();
  const proximo = new Date();
  proximo.setHours(3, 0, 0, 0);
  
  // Si ya pasaron las 3 AM, el próximo es mañana
  if (now.getHours() >= 3) {
    proximo.setDate(proximo.getDate() + 1);
  }
  
  return proximo;
}

/**
 * 🤖 INICIAR CRON JOB - Backup automático cada día a las 3 AM
 */
export function iniciarCronBackups(): void {
  // Cron: 0 3 * * * = Todos los días a las 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('⏰ Cron activado - Iniciando backup automático...');
    try {
      await crearBackupAutomatico();
    } catch (error) {
      console.error('❌ Error en cron de backup:', error);
    }
  }, {
    timezone: "America/Montevideo" // Hora de Uruguay
  });
  
  console.log('🤖 Cron de backups automáticos iniciado (3:00 AM diario)');
}

