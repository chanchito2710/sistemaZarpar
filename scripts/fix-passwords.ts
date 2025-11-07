/**
 * Script para regenerar contraseñas hasheadas correctamente con bcrypt
 * Esto soluciona el problema de usuarios que no pueden hacer login
 */

import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

// Configuración de la base de datos
const pool = mysql.createPool({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'zarpar2025',
  database: 'zarparDataBase',
  charset: 'utf8mb4'
});

// Usuarios con sus contraseñas en texto plano (SOLO para este script de inicialización)
const usuarios = [
  { email: 'admin@zarparuy.com', password: 'admin123' },
  { email: 'pando@zarparuy.com', password: 'pando123' },
  { email: 'maldonado@zarparuy.com', password: 'maldonado123' },
  { email: 'rivera@zarparuy.com', password: 'rivera123' },
  { email: 'melo@zarparuy.com', password: 'melo123' },
  { email: 'paysandu@zarparuy.com', password: 'paysandu123' },
  { email: 'salto@zarparuy.com', password: 'salto123' },
  { email: 'tacuarembo@zarparuy.com', password: 'tacuarembo123' }
];

async function regenerarPasswords() {
  console.log('🔐 Iniciando regeneración de contraseñas...\n');

  try {
    for (const usuario of usuarios) {
      console.log(`📝 Procesando: ${usuario.email}`);
      
      // Hashear la contraseña con bcrypt (10 rounds)
      const hashedPassword = await bcrypt.hash(usuario.password, 10);
      console.log(`   Hash generado: ${hashedPassword.substring(0, 30)}...`);
      
      // Actualizar en la base de datos
      const [result] = await pool.execute(
        'UPDATE vendedores SET password = ? WHERE email = ?',
        [hashedPassword, usuario.email]
      );
      
      console.log(`   ✅ Contraseña actualizada (filas afectadas: ${(result as any).affectedRows})\n`);
    }
    
    console.log('🎉 ¡Todas las contraseñas regeneradas exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('| Usuario           | Email                      | Contraseña     |');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    usuarios.forEach(u => {
      const nombre = u.email.split('@')[0].padEnd(17);
      const email = u.email.padEnd(26);
      const pass = u.password.padEnd(14);
      console.log(`| ${nombre} | ${email} | ${pass} |`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error al regenerar contraseñas:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar script
regenerarPasswords()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falló:', error);
    process.exit(1);
  });

