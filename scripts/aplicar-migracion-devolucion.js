/**
 * Script para aplicar manualmente la migración de 'devolucion' en Railway
 * Ejecutar con: node scripts/aplicar-migracion-devolucion.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const aplicarMigracion = async () => {
  console.log('🔄 Conectando a la base de datos...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'zarparDataBase',
    charset: 'utf8mb4'
  });

  try {
    console.log('✅ Conectado a la base de datos');
    console.log('📊 Base de datos:', process.env.DB_NAME);
    console.log('🔧 Aplicando migración...');
    
    // Ejecutar ALTER TABLE
    await connection.query(`
      ALTER TABLE cuenta_corriente_movimientos 
      MODIFY COLUMN tipo ENUM('venta', 'pago', 'ajuste', 'devolucion') NOT NULL
    `);
    
    console.log('✅ Migración aplicada correctamente');
    
    // Verificar cambio
    const [rows] = await connection.query(`
      SHOW COLUMNS FROM cuenta_corriente_movimientos LIKE 'tipo'
    `);
    
    console.log('📋 Verificación:');
    console.log(rows[0]);
    
    if (rows[0].Type.includes('devolucion')) {
      console.log('✅ ¡ÉXITO! La columna ahora incluye "devolucion"');
    } else {
      console.log('❌ ERROR: La columna NO incluye "devolucion"');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
    console.log('🔌 Conexión cerrada');
  }
};

aplicarMigracion();

