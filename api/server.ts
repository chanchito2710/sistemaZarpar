/**
 * local server entry file, for local development
 */
import app from './app.js';
import { testConnection } from './config/database.js';
import { inicializarCronJobs } from './services/cronService.js';
import { ejecutarMigraciones } from './utils/migraciones.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, async () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  
  // Verificar conexión a la base de datos
  await testConnection();
  
  // Ejecutar migraciones pendientes automáticamente
  await ejecutarMigraciones();
  
  // Verificar y crear columnas de descuentos si no existen (auto-fix para Railway)
  const { verificarColumnasDescuentos } = await import('./utils/verificarColumnasDescuentos.js');
  await verificarColumnasDescuentos();
  
  // Inicializar tareas programadas (Cron Jobs)
  inicializarCronJobs();
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;