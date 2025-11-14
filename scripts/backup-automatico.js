/**
 * ====================================================
 * SISTEMA DE BACKUP AUTOMÁTICO DE BASE DE DATOS
 * Sistema Zarpar - Protección de Datos
 * ====================================================
 * 
 * Este script realiza backups automáticos de la base de datos
 * y los guarda con timestamp para recuperación posterior
 * 
 * USO:
 * - Manual: node scripts/backup-automatico.js
 * - Automático: Configurar como cron job
 * 
 * ====================================================
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====================================================
// CONFIGURACIÓN
// ====================================================

const CONFIG = {
  // Conexión MySQL
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || '3307',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || 'zarpar2025',
  DB_NAME: process.env.DB_NAME || 'zarparDataBase',
  
  // Docker container
  DOCKER_CONTAINER: 'zarpar-mysql',
  
  // Directorio de backups
  BACKUP_DIR: path.join(__dirname, '..', 'backups'),
  
  // Retención de backups (días)
  RETENTION_DAYS: 30,
  
  // Máximo de backups a mantener
  MAX_BACKUPS: 100
};

// ====================================================
// FUNCIONES AUXILIARES
// ====================================================

/**
 * Obtener timestamp formateado
 */
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

/**
 * Crear directorio de backups si no existe
 */
function ensureBackupDirectory() {
  if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
    fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true });
    console.log(`📁 Directorio de backups creado: ${CONFIG.BACKUP_DIR}`);
  }
}

/**
 * Obtener tamaño de archivo en formato legible
 */
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const bytes = stats.size;
  
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Limpiar backups antiguos
 */
function cleanOldBackups() {
  console.log('\n🧹 Limpiando backups antiguos...');
  
  try {
    const files = fs.readdirSync(CONFIG.BACKUP_DIR)
      .filter(file => file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(CONFIG.BACKUP_DIR, file),
        time: fs.statSync(path.join(CONFIG.BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Más reciente primero
    
    // Eliminar backups que excedan MAX_BACKUPS
    if (files.length > CONFIG.MAX_BACKUPS) {
      const toDelete = files.slice(CONFIG.MAX_BACKUPS);
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`  ❌ Eliminado (por cantidad): ${file.name}`);
      });
    }
    
    // Eliminar backups más antiguos que RETENTION_DAYS
    const retentionTime = Date.now() - (CONFIG.RETENTION_DAYS * 24 * 60 * 60 * 1000);
    files.forEach(file => {
      if (file.time < retentionTime && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log(`  ❌ Eliminado (por antigüedad): ${file.name}`);
      }
    });
    
    // Contar backups restantes
    const remainingFiles = fs.readdirSync(CONFIG.BACKUP_DIR)
      .filter(file => file.endsWith('.sql'));
    
    console.log(`  ✅ Backups actuales: ${remainingFiles.length}`);
    
  } catch (error) {
    console.error('  ⚠️ Error al limpiar backups:', error.message);
  }
}

/**
 * Verificar conexión con Docker
 */
async function checkDockerConnection() {
  try {
    const { stdout } = await execPromise('docker ps');
    if (!stdout.includes(CONFIG.DOCKER_CONTAINER)) {
      throw new Error(`Container ${CONFIG.DOCKER_CONTAINER} no está corriendo`);
    }
    return true;
  } catch (error) {
    throw new Error(`Error al conectar con Docker: ${error.message}`);
  }
}

// ====================================================
// FUNCIÓN PRINCIPAL DE BACKUP
// ====================================================

async function realizarBackup() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   🔄 BACKUP AUTOMÁTICO DE BASE DE DATOS      ║');
  console.log('║   Sistema Zarpar - Protección de Datos        ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  const startTime = Date.now();
  
  try {
    // 1. Verificar Docker
    console.log('🐳 Verificando conexión con Docker...');
    await checkDockerConnection();
    console.log('  ✅ Docker conectado correctamente\n');
    
    // 2. Crear directorio de backups
    console.log('📁 Verificando directorio de backups...');
    ensureBackupDirectory();
    console.log('  ✅ Directorio listo\n');
    
    // 3. Generar nombre de archivo
    const timestamp = getTimestamp();
    const filename = `backup_${CONFIG.DB_NAME}_${timestamp}.sql`;
    const filepath = path.join(CONFIG.BACKUP_DIR, filename);
    
    console.log('💾 Realizando backup...');
    console.log(`  📄 Archivo: ${filename}`);
    
    // 4. Ejecutar mysqldump
    const dumpCommand = `docker exec ${CONFIG.DOCKER_CONTAINER} mysqldump -u ${CONFIG.DB_USER} -p${CONFIG.DB_PASSWORD} --default-character-set=utf8mb4 --single-transaction --routines --triggers --events ${CONFIG.DB_NAME}`;
    
    const { stdout } = await execPromise(dumpCommand);
    
    // 5. Guardar archivo
    fs.writeFileSync(filepath, stdout, 'utf8');
    
    // 6. Verificar archivo creado
    if (!fs.existsSync(filepath)) {
      throw new Error('El archivo de backup no se creó correctamente');
    }
    
    const fileSize = getFileSize(filepath);
    console.log(`  ✅ Backup completado: ${fileSize}\n`);
    
    // 7. Limpiar backups antiguos
    cleanOldBackups();
    
    // 8. Resumen final
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║   ✅ BACKUP COMPLETADO EXITOSAMENTE           ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log(`\n📊 RESUMEN:`);
    console.log(`   • Archivo: ${filename}`);
    console.log(`   • Tamaño: ${fileSize}`);
    console.log(`   • Duración: ${duration}s`);
    console.log(`   • Ubicación: ${CONFIG.BACKUP_DIR}\n`);
    
    return {
      success: true,
      filename,
      filepath,
      fileSize,
      duration
    };
    
  } catch (error) {
    console.error('\n❌ ERROR AL REALIZAR BACKUP:');
    console.error(`   ${error.message}\n`);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// ====================================================
// FUNCIÓN DE RESTAURACIÓN
// ====================================================

async function restaurarBackup(backupFile) {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   🔄 RESTAURACIÓN DE BACKUP                   ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  try {
    const filepath = path.join(CONFIG.BACKUP_DIR, backupFile);
    
    if (!fs.existsSync(filepath)) {
      throw new Error(`Archivo de backup no encontrado: ${backupFile}`);
    }
    
    console.log(`📄 Restaurando desde: ${backupFile}`);
    console.log('⚠️  ADVERTENCIA: Esto sobrescribirá la base de datos actual\n');
    
    // Ejecutar restauración
    const restoreCommand = `docker exec -i ${CONFIG.DOCKER_CONTAINER} mysql -u ${CONFIG.DB_USER} -p${CONFIG.DB_PASSWORD} --default-character-set=utf8mb4 ${CONFIG.DB_NAME}`;
    
    const fileContent = fs.readFileSync(filepath, 'utf8');
    
    await execPromise(`echo "${fileContent}" | ${restoreCommand}`);
    
    console.log('✅ Restauración completada exitosamente\n');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ ERROR AL RESTAURAR BACKUP:');
    console.error(`   ${error.message}\n`);
    
    return { success: false, error: error.message };
  }
}

// ====================================================
// LISTAR BACKUPS DISPONIBLES
// ====================================================

function listarBackups() {
  console.log('📋 BACKUPS DISPONIBLES:\n');
  
  try {
    if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
      console.log('  ⚠️ No hay directorio de backups todavía\n');
      return [];
    }
    
    const files = fs.readdirSync(CONFIG.BACKUP_DIR)
      .filter(file => file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(CONFIG.BACKUP_DIR, file),
        size: getFileSize(path.join(CONFIG.BACKUP_DIR, file)),
        date: fs.statSync(path.join(CONFIG.BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.date - a.date);
    
    if (files.length === 0) {
      console.log('  ⚠️ No hay backups disponibles\n');
      return [];
    }
    
    files.forEach((file, index) => {
      const dateStr = file.date.toLocaleString('es-UY');
      console.log(`  ${index + 1}. ${file.name}`);
      console.log(`     📅 ${dateStr} | 📦 ${file.size}\n`);
    });
    
    return files;
    
  } catch (error) {
    console.error('❌ Error al listar backups:', error.message);
    return [];
  }
}

// ====================================================
// CLI - INTERFAZ DE LÍNEA DE COMANDOS
// ====================================================

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'backup':
  case undefined:
    // Realizar backup
    realizarBackup();
    break;
    
  case 'list':
    // Listar backups
    listarBackups();
    break;
    
  case 'restore':
    // Restaurar backup
    const backupFile = args[1];
    if (!backupFile) {
      console.error('❌ Error: Debes especificar el archivo de backup');
      console.log('Uso: node scripts/backup-automatico.js restore <archivo>\n');
      listarBackups();
    } else {
      restaurarBackup(backupFile);
    }
    break;
    
  case 'help':
    console.log('\n📖 USO DEL SCRIPT DE BACKUP:\n');
    console.log('  node scripts/backup-automatico.js backup    - Realizar backup');
    console.log('  node scripts/backup-automatico.js list      - Listar backups');
    console.log('  node scripts/backup-automatico.js restore <archivo> - Restaurar backup\n');
    break;
    
  default:
    console.error(`❌ Comando desconocido: ${command}`);
    console.log('Usa "help" para ver los comandos disponibles\n');
}

export { realizarBackup, restaurarBackup, listarBackups };

