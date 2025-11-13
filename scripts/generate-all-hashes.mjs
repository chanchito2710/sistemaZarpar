/**
 * Script para generar hashes de contraseñas
 * Genera los hashes correctos para todas las contraseñas del sistema
 */

import bcrypt from 'bcryptjs';

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

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  GENERADOR DE HASHES DE CONTRASEÑAS');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

console.log('Generando hashes...');
console.log('');

const queries = [];

usuarios.forEach(usuario => {
  const hash = bcrypt.hashSync(usuario.password, 10);
  console.log(`✓ ${usuario.email}`);
  console.log(`  Contraseña: ${usuario.password}`);
  console.log(`  Hash: ${hash}`);
  console.log('');
  
  queries.push(`UPDATE \`vendedores\` SET \`password\` = '${hash}' WHERE \`email\` = '${usuario.email}';`);
});

console.log('═══════════════════════════════════════════════════════════');
console.log('  SCRIPT SQL GENERADO:');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log(queries.join('\n'));
console.log('');







