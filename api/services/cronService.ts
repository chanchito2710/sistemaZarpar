/**
 * Servicio de Tareas Programadas (Cron Jobs)
 * Maneja tareas automatizadas como guardar resúmenes diarios y backups automáticos
 */

import cron from 'node-cron';
import { executeQuery } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { crearBackupAutomatico } from './backupService.js';

/**
 * Guardar resumen diario de ventas
 * Se ejecuta automáticamente todos los días a las 8:30 AM (hora de Uruguay)
 */
const guardarResumenDiarioAutomatico = async () => {
  try {
    const fechaAyer = new Date();
    fechaAyer.setDate(fechaAyer.getDate() - 1); // Día anterior
    const fechaResumen = fechaAyer.toISOString().split('T')[0];

    console.log(`🕐 [CRON] Guardando resumen diario para: ${fechaResumen}`);

    // Obtener ventas del día anterior
    const query = `
      SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as total_ingresos
      FROM ventas
      WHERE DATE(fecha_venta) = ?
    `;

    const resultado = await executeQuery<RowDataPacket[]>(query, [fechaResumen]);
    const resumen = resultado[0];

    // Si no hay ventas, no guardar
    if (parseInt(resumen.total_ventas) === 0) {
      console.log(`ℹ️  [CRON] No hay ventas para ${fechaResumen}, omitiendo...`);
      return;
    }

    // Obtener por sucursal
    const queryPorSucursal = `
      SELECT 
        sucursal,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total
      FROM ventas
      WHERE DATE(fecha_venta) = ?
      GROUP BY sucursal
    `;

    const porSucursal = await executeQuery<RowDataPacket[]>(queryPorSucursal, [fechaResumen]);

    // Obtener por método de pago
    const queryPorMetodo = `
      SELECT 
        metodo_pago,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total
      FROM ventas
      WHERE DATE(fecha_venta) = ?
      GROUP BY metodo_pago
    `;

    const porMetodoPago = await executeQuery<RowDataPacket[]>(queryPorMetodo, [fechaResumen]);

    // Insertar o actualizar resumen
    const queryInsert = `
      INSERT INTO ventas_diarias_resumen 
        (fecha, total_ventas, total_ingresos, por_sucursal, por_metodo_pago)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        total_ventas = VALUES(total_ventas),
        total_ingresos = VALUES(total_ingresos),
        por_sucursal = VALUES(por_sucursal),
        por_metodo_pago = VALUES(por_metodo_pago)
    `;

    await executeQuery(queryInsert, [
      fechaResumen,
      resumen.total_ventas,
      resumen.total_ingresos,
      JSON.stringify(porSucursal),
      JSON.stringify(porMetodoPago)
    ]);

    console.log(`✅ [CRON] Resumen guardado: ${resumen.total_ventas} ventas - $${resumen.total_ingresos}`);

  } catch (error) {
    console.error('❌ [CRON] Error al guardar resumen diario:', error);
  }
};

/**
 * Inicializar tareas programadas
 */
export const inicializarCronJobs = () => {
  console.log('⏰ Inicializando tareas programadas...');

  // Tarea: Guardar resumen diario a las 8:30 AM (hora de Uruguay/UYT: UTC-3)
  // Cron expression: '30 8 * * *' = A las 8:30 AM todos los días
  // Timezone: 'America/Montevideo' (Uruguay)
  
  cron.schedule('30 8 * * *', () => {
    console.log('\n🕐 [CRON] Ejecutando tarea programada: Guardar resumen diario');
    guardarResumenDiarioAutomatico();
  }, {
    timezone: 'America/Montevideo'
  });

  console.log('✅ Tarea programada configurada: Guardar resumen diario a las 8:30 AM (Uruguay)');

  // Tarea: Backup automático de base de datos a las 3:00 AM (hora de Uruguay)
  // Cron expression: '0 3 * * *' = A las 3:00 AM todos los días
  cron.schedule('0 3 * * *', async () => {
    console.log('\n🗄️ [CRON] Ejecutando tarea programada: Backup automático de base de datos');
    try {
      await crearBackupAutomatico();
    } catch (error) {
      console.error('❌ [CRON] Error en backup automático:', error);
    }
  }, {
    timezone: 'America/Montevideo'
  });

  console.log('✅ Tarea programada configurada: Backup automático a las 3:00 AM (Uruguay)');

  // Opcional: También ejecutar al iniciar el servidor (para guardar el día anterior si no se hizo)
  console.log('🔄 Ejecutando verificación inicial...');
  setTimeout(() => {
    guardarResumenDiarioAutomatico();
  }, 5000); // Esperar 5 segundos después de que inicie el servidor
};

export default {
  inicializarCronJobs,
  guardarResumenDiarioAutomatico
};


