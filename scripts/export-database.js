/**
 * Script para exportar la base de datos a un archivo SQL
 * Este archivo se puede importar fácilmente en Hostinger
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3307';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'zarpar2025';
const DB_NAME = process.env.DB_NAME || 'zarparDataBase';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputFile = path.join(__dirname, '..', 'database', `backup_${timestamp}.sql`);

async function exportDatabase() {
  console.log('🚀 Iniciando exportación de base de datos...\n');
  console.log(`📊 Base de datos: ${DB_NAME}`);
  console.log(`📁 Archivo de salida: ${outputFile}\n`);

  try {
    // Construir comando mysqldump
    const command = `mysqldump -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > "${outputFile}"`;
    
    console.log('⏳ Exportando...');
    await execPromise(command);
    
    console.log('\n✅ ¡Exportación exitosa!\n');
    console.log('📋 Instrucciones para subir a Hostinger:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Ve a tu panel de Hostinger');
    console.log('2. Busca "Bases de Datos MySQL"');
    console.log('3. Haz clic en "phpMyAdmin"');
    console.log('4. Selecciona tu base de datos');
    console.log('5. Haz clic en la pestaña "Importar"');
    console.log(`6. Sube el archivo: ${path.basename(outputFile)}`);
    console.log('7. Haz clic en "Continuar"');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('💡 El archivo SQL contiene:');
    console.log('   - Estructura de todas las tablas');
    console.log('   - Todos tus datos (clientes y vendedores)');
    console.log('   - Configuraciones de índices y claves\n');
    
  } catch (error) {
    console.error('❌ Error al exportar:', error.message);
    console.error('\n💡 Soluciones:');
    console.error('1. Verifica que MySQL esté corriendo');
    console.error('2. Verifica que mysqldump esté instalado');
    console.error('3. Verifica las credenciales en .env\n');
    
    // Alternativa manual
    console.log('📝 Alternativa Manual:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Abre tu navegador en: http://localhost/phpmyadmin');
    console.log('   (o usa la interfaz que creamos en /admin/database)');
    console.log('2. Selecciona la base de datos "zarparDataBase"');
    console.log('3. Haz clic en "Exportar"');
    console.log('4. Método: Rápido');
    console.log('5. Formato: SQL');
    console.log('6. Haz clic en "Continuar"');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

exportDatabase();

