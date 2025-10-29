/**
 * Script para verificar la configuración del sistema ZARPAR
 * Ejecutar con: node scripts/check-setup.js
 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('\n🔍 Verificando configuración del Sistema ZARPAR...\n');

// Función para mostrar resultado
function showResult(check, status, message) {
  const icon = status ? '✅' : '❌';
  console.log(`${icon} ${check}: ${message}`);
}

// 1. Verificar Node.js
console.log('📦 Verificando Node.js...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].replace('v', ''));
showResult(
  'Node.js',
  majorVersion >= 18,
  `Versión ${nodeVersion} ${majorVersion >= 18 ? '(OK)' : '(Requiere v18 o superior)'}`
);

// 2. Verificar archivo .env
console.log('\n📄 Verificando archivo .env...');
const envPath = path.join(__dirname, '..', '.env');
const envExists = fs.existsSync(envPath);
showResult('.env', envExists, envExists ? 'Archivo encontrado' : 'Archivo NO encontrado');

if (envExists) {
  const requiredVars = ['PORT', 'DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(`${varName}=`);
    showResult(
      `  ${varName}`,
      hasVar,
      hasVar ? 'Configurado' : 'NO configurado'
    );
  });
}

// 3. Verificar dependencias
console.log('\n📦 Verificando dependencias...');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
const hasNodeModules = fs.existsSync(nodeModulesPath);
showResult(
  'node_modules',
  hasNodeModules,
  hasNodeModules ? 'Dependencias instaladas' : 'Ejecutar: npm install'
);

// 4. Verificar estructura de carpetas
console.log('\n📁 Verificando estructura del proyecto...');
const requiredFolders = ['api', 'src', 'database', 'public'];
requiredFolders.forEach(folder => {
  const folderPath = path.join(__dirname, '..', folder);
  const exists = fs.existsSync(folderPath);
  showResult(
    `  ${folder}/`,
    exists,
    exists ? 'OK' : 'Carpeta NO encontrada'
  );
});

// 5. Verificar conexión a MySQL
console.log('\n🗄️  Verificando conexión a MySQL...');
async function testMySQLConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    showResult('Conexión a MySQL', true, 'Conexión exitosa');
    
    // Verificar base de datos
    try {
      await connection.query(`USE ${process.env.DB_NAME || 'zarparEcommerce'}`);
      showResult('Base de datos', true, `${process.env.DB_NAME} encontrada`);
      
      // Contar tablas
      const [tables] = await connection.query('SHOW TABLES');
      const tableCount = tables.length;
      showResult(
        'Tablas',
        tableCount > 0,
        `${tableCount} tablas encontradas ${tableCount >= 30 ? '(OK)' : '(Ejecutar schema.sql)'}`
      );
      
    } catch (dbError) {
      showResult(
        'Base de datos',
        false,
        `${process.env.DB_NAME} NO encontrada - Ejecutar: mysql -u root -p < database/schema.sql`
      );
    }
    
    await connection.end();
  } catch (error) {
    showResult('Conexión a MySQL', false, `Error: ${error.message}`);
    console.log('\n💡 Sugerencias:');
    console.log('   1. Verifica que MySQL esté corriendo');
    console.log('   2. Verifica DB_USER y DB_PASSWORD en .env');
    console.log('   3. Verifica DB_HOST y DB_PORT en .env');
  }
}

await testMySQLConnection();

// 6. Verificar puertos disponibles
console.log('\n🔌 Verificando puertos...');
import net from 'net';

function checkPort(port, service) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        showResult(
          `Puerto ${port}`,
          false,
          `${service} - Puerto en uso`
        );
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      showResult(
        `Puerto ${port}`,
        true,
        `${service} - Disponible`
      );
      resolve(true);
    });
    
    server.listen(port);
  });
}

await checkPort(parseInt(process.env.PORT || '3456'), 'Backend');
await checkPort(5678, 'Frontend');

// Resumen final
console.log('\n' + '='.repeat(60));
console.log('📊 Resumen de Verificación');
console.log('='.repeat(60));

console.log('\n✨ Si todos los checks están en verde (✅), puedes ejecutar:');
console.log('   npm run dev\n');

console.log('❌ Si hay checks en rojo, revisa los mensajes de error arriba.\n');
console.log('📖 Para más ayuda, consulta: INSTALL.md\n');

