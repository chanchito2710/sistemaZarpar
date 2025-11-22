/**
 * Controlador de Limpieza de Datos de Prueba
 * Permite limpiar datos de desarrollo antes de ir a producción
 * ⚠️ USO EXCLUSIVO PARA DESARROLLO/TESTING
 */

import { type Request, type Response } from 'express';
import pool from '../config/database.js';
import type { ResultSetHeader } from 'mysql2';

/**
 * Limpiar datos de prueba de forma selectiva
 * POST /api/database/cleanup
 * Body: {
 *   sucursal: 'pando' | 'todas',
 *   opciones: {
 *     ventas: boolean,
 *     cuentaCorriente: boolean,
 *     clientes: boolean,
 *     movimientosCaja: boolean,
 *     comisiones: boolean,
 *     productos: boolean,
 *     movimientosInventario: boolean,
 *     transferencias: boolean,
 *     devoluciones: boolean,
 *     gastos: boolean,
 *     reportesEstadisticas: boolean,
 *   }
 * }
 */
export const limpiarDatos = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { sucursal, opciones } = req.body;
    
    console.log('🔍 [DEBUG] ========== INICIO LIMPIEZA DATOS ==========');
    console.log('🔍 [DEBUG] Request body completo:', JSON.stringify(req.body, null, 2));
    console.log('🔍 [DEBUG] Sucursal recibida:', sucursal);
    console.log('🔍 [DEBUG] Opciones recibidas:', JSON.stringify(opciones, null, 2));
    
    // Iniciar transacción para seguridad
    console.log('🔍 [DEBUG] Iniciando transacción SQL...');
    await connection.beginTransaction();
    console.log('✅ [DEBUG] Transacción iniciada correctamente');
    
    let resultados: string[] = [];
    
    // Obtener todas las sucursales si es 'todas'
    const sucursales: string[] = [];
    console.log('🔍 [DEBUG] Detectando sucursales...');
    if (sucursal === 'todas') {
      console.log('🔍 [DEBUG] Modo: TODAS las sucursales');
      const [tables] = await connection.execute<any[]>(
        "SHOW TABLES LIKE 'clientes_%'"
      );
      console.log('🔍 [DEBUG] Tablas encontradas:', tables.length);
      
      tables.forEach((table: any) => {
        const tableName = Object.values(table)[0] as string;
        const suc = tableName.replace('clientes_', '');
        sucursales.push(suc);
      });
      console.log('🔍 [DEBUG] Sucursales detectadas:', sucursales);
    } else {
      console.log('🔍 [DEBUG] Modo: Sucursal específica:', sucursal);
      sucursales.push(sucursal);
    }
    
    console.log('🔍 [DEBUG] Array de sucursales final:', sucursales);
    console.log('🔍 [DEBUG] Cantidad de sucursales:', sucursales.length);
    
    // LIMPIEZA POR MÓDULO
    console.log('🔍 [DEBUG] ========== INICIANDO LIMPIEZA POR MÓDULO ==========');
    
    // Verificar si hay sucursales antes de ejecutar queries con IN
    if (sucursales.length === 0) {
      console.log('⚠️ [DEBUG] NO SE ENCONTRARON SUCURSALES - Modo limpieza parcial');
      // Solo ejecutar limpiezas que no dependen de sucursales
      if (opciones.ventas) {
        const [resumenResult] = await connection.execute<ResultSetHeader>(
          `DELETE FROM ventas_diarias_resumen`
        );
        resultados.push(`✅ Resúmenes diarios eliminados: ${resumenResult.affectedRows}`);
      }
      
      if (opciones.comisiones) {
        const [histPagosResult] = await connection.execute<ResultSetHeader>(
          'DELETE FROM historial_pagos_comisiones'
        );
        const [remanentesResult] = await connection.execute<ResultSetHeader>(
          'DELETE FROM remanentes_comisiones'
        );
        resultados.push(`✅ Historial de pagos eliminado: ${histPagosResult.affectedRows}`);
        resultados.push(`✅ Remanentes eliminados: ${remanentesResult.affectedRows}`);
      }
      
      if (opciones.productos) {
        // Limpieza de productos sin depender de sucursal (ya que elimina todo)
        const [comisionesProductosResult] = await connection.execute<ResultSetHeader>(`DELETE FROM comisiones_vendedores`);
        const [ventasDetalleResult] = await connection.execute<ResultSetHeader>(`DELETE FROM ventas_detalle`);
        const [relacionesResult] = await connection.execute<ResultSetHeader>(`DELETE FROM productos_sucursal`);
        const [productosResult] = await connection.execute<ResultSetHeader>(`DELETE FROM productos`);
        
        resultados.push(`✅ Comisiones de productos eliminadas: ${comisionesProductosResult.affectedRows} registros`);
        resultados.push(`✅ Detalles de ventas eliminados: ${ventasDetalleResult.affectedRows} registros`);
        resultados.push(`✅ Relaciones productos-sucursal eliminadas: ${relacionesResult.affectedRows} registros`);
        resultados.push(`✅ Productos eliminados COMPLETAMENTE: ${productosResult.affectedRows} productos`);
      }
      
      if (opciones.transferencias) {
        const [historialTransfResult] = await connection.execute<ResultSetHeader>(
          `DELETE FROM historial_transferencias`
        );
        resultados.push(`✅ Historial de transferencias eliminado: ${historialTransfResult.affectedRows}`);
      }

      resultados.push('⚠️ No se detectaron sucursales (tablas clientes_*) para filtrar por sucursal.');
      
      await connection.commit();
      res.status(200).json({
        success: true,
        message: `Limpieza parcial completada (sin sucursales): ${resultados.length} operaciones`,
        data: { sucursales: [], resultados }
      });
      return;
    }

    // 1. Limpiar Ventas
    if (opciones.ventas) {
      console.log('🔍 [DEBUG] Opción 1: VENTAS activada');
      // Construir placeholders para el IN (??, ??, ??)
      const placeholders = sucursales.map(() => '?').join(', ');
      console.log('🔍 [DEBUG] Placeholders:', placeholders);
      console.log('🔍 [DEBUG] Ejecutando DELETE FROM ventas...');
      const [result] = await connection.execute<ResultSetHeader>(
        `DELETE FROM ventas WHERE sucursal IN (${placeholders})`,
        sucursales
      );
      console.log('✅ [DEBUG] Ventas eliminadas:', result.affectedRows);
      resultados.push(`✅ Ventas eliminadas: ${result.affectedRows}`);
      
      // Eliminar resúmenes diarios de ventas (tabla ventas_diarias_resumen)
      console.log('🔍 [DEBUG] Ejecutando DELETE FROM ventas_diarias_resumen...');
      const [resumenResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM ventas_diarias_resumen`
      );
      console.log('✅ [DEBUG] Resúmenes diarios eliminados:', resumenResult.affectedRows);
      resultados.push(`✅ Resúmenes diarios eliminados: ${resumenResult.affectedRows}`);
    } else {
      console.log('⏭️ [DEBUG] Opción 1: VENTAS - No activada, saltando...');
    }
    
    // 2. Limpiar Cuenta Corriente
    if (opciones.cuentaCorriente) {
      const placeholders = sucursales.map(() => '?').join(', ');
      
      // Eliminar movimientos de cuenta corriente
      const [movimientosResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM cuenta_corriente_movimientos WHERE sucursal IN (${placeholders})`,
        sucursales
      );
      resultados.push(`✅ Movimientos de cuenta corriente eliminados: ${movimientosResult.affectedRows}`);
      
      // Eliminar pagos de cuenta corriente
      const [pagosResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM pagos_cuenta_corriente WHERE sucursal IN (${placeholders})`,
        sucursales
      );
      resultados.push(`✅ Pagos de cuenta corriente eliminados: ${pagosResult.affectedRows}`);
      
      // Nota: resumen_cuenta_corriente es una VISTA, se actualiza automáticamente
      resultados.push(`✅ Resumen de cuenta corriente se actualizará automáticamente (es una vista)`);
    }
    
    // 3. Limpiar Clientes (por tabla de cada sucursal)
    if (opciones.clientes) {
      for (const suc of sucursales) {
        try {
          const [result] = await connection.execute<ResultSetHeader>(
            `DELETE FROM \`clientes_${suc}\``
          );
          resultados.push(`✅ Clientes de ${suc.toUpperCase()} eliminados: ${result.affectedRows}`);
        } catch (error: any) {
          if (error.code !== 'ER_NO_SUCH_TABLE') {
            throw error;
          }
        }
      }
    }
    
    // 4. Limpiar Movimientos de Caja
    if (opciones.movimientosCaja) {
      const placeholders = sucursales.map(() => '?').join(', ');
      
      // Eliminar movimientos
      const [movimientosResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM movimientos_caja WHERE sucursal IN (${placeholders})`,
        sucursales
      );
      
      // Resetear caja a 0
      const [cajaResult] = await connection.execute<ResultSetHeader>(
        `UPDATE caja SET monto_actual = 0 WHERE sucursal IN (${placeholders})`,
        sucursales
      );
      
      resultados.push(`✅ Movimientos de caja eliminados: ${movimientosResult.affectedRows}`);
      resultados.push(`✅ Cajas reseteadas a $0: ${cajaResult.affectedRows}`);
    }
    
    // 5. Limpiar Comisiones
    if (opciones.comisiones) {
      const placeholders = sucursales.map(() => '?').join(', ');
      
      // 🔹 PASO 1: Revertir movimientos de caja por pagos de comisiones
      // Obtener todos los movimientos de tipo 'pago_comision' de las sucursales
      const [movimientosPagoComision] = await connection.execute<any[]>(
        `SELECT sucursal, SUM(ABS(monto)) as total_revertir 
         FROM movimientos_caja 
         WHERE tipo_movimiento = 'pago_comision' 
         AND sucursal IN (${placeholders})
         GROUP BY sucursal`,
        sucursales
      );
      
      // Revertir el dinero a cada caja (sumar lo que se había restado)
      for (const mov of movimientosPagoComision) {
        const totalRevertir = Number(mov.total_revertir);
        
        await connection.execute<ResultSetHeader>(
          `UPDATE caja 
           SET monto_actual = monto_actual + ? 
           WHERE sucursal = ?`,
          [totalRevertir, mov.sucursal]
        );
        resultados.push(`✅ Revertido $${totalRevertir.toFixed(2)} a caja de ${mov.sucursal.toUpperCase()}`);
      }
      
      // 🔹 PASO 2: Eliminar movimientos de caja tipo 'pago_comision'
      const [movCajaResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM movimientos_caja 
         WHERE tipo_movimiento = 'pago_comision' 
         AND sucursal IN (${placeholders})`,
        sucursales
      );
      resultados.push(`✅ Movimientos de caja de comisiones eliminados: ${movCajaResult.affectedRows}`);
      
      // 🔹 PASO 3: Eliminar registros de pagos de comisiones (tabla sueldos)
      const [sueldosResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM sueldos WHERE sucursal IN (${placeholders})`,
        sucursales
      );
      resultados.push(`✅ Registros de pagos de comisiones eliminados: ${sueldosResult.affectedRows}`);
      
      // 🔹 PASO 4: Eliminar historial de pagos
      const [pagosResult] = await connection.execute<ResultSetHeader>(
        'DELETE FROM historial_pagos_comisiones'
      );
      
      // 🔹 PASO 5: Eliminar comisiones de vendedores
      const [comisionesResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM comisiones_vendedores WHERE sucursal IN (${placeholders})`,
        sucursales
      );
      
      // 🔹 PASO 6: Eliminar remanentes
      const [remanentesResult] = await connection.execute<ResultSetHeader>(
        'DELETE FROM remanentes_comisiones'
      );
      
      resultados.push(`✅ Comisiones de vendedores eliminadas: ${comisionesResult.affectedRows}`);
      resultados.push(`✅ Remanentes eliminados: ${remanentesResult.affectedRows}`);
      resultados.push(`✅ Historial de pagos eliminado: ${pagosResult.affectedRows}`);
    }
    
    // 6. ELIMINAR TODOS LOS PRODUCTOS (completo de la base de datos)
    if (opciones.productos) {
      // 🔹 PASO 1: Eliminar referencias en comisiones_vendedores (Foreign Key)
      const [comisionesProductosResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM comisiones_vendedores`
      );
      resultados.push(`✅ Comisiones de productos eliminadas: ${comisionesProductosResult.affectedRows} registros`);
      
      // 🔹 PASO 2: Eliminar referencias en ventas_detalle (Foreign Key)
      const [ventasDetalleResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM ventas_detalle`
      );
      resultados.push(`✅ Detalles de ventas eliminados: ${ventasDetalleResult.affectedRows} registros`);
      
      // 🔹 PASO 3: Eliminar TODAS las relaciones en productos_sucursal
      const [relacionesResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM productos_sucursal`
      );
      resultados.push(`✅ Relaciones productos-sucursal eliminadas: ${relacionesResult.affectedRows} registros`);
      
      // 🔹 PASO 4: Eliminar TODOS los productos de la tabla principal
      const [productosResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM productos`
      );
      resultados.push(`✅ Productos eliminados COMPLETAMENTE: ${productosResult.affectedRows} productos`);
    }
    
    // 7. Limpiar Movimientos de Inventario (historial_stock)
    if (opciones.movimientosInventario) {
      const placeholders = sucursales.map(() => '?').join(', ');
      
      const [historialResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM historial_stock WHERE sucursal IN (${placeholders})`,
        sucursales
      );
      resultados.push(`✅ Historial de movimientos de inventario eliminado: ${historialResult.affectedRows}`);
    }
    
    // 8. Limpiar Transferencias de mercadería entre sucursales
    if (opciones.transferencias) {
      const placeholders = sucursales.map(() => '?').join(', ');
      
      // Eliminar transferencias donde origen o destino está en las sucursales seleccionadas
      const [transferenciasResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM transferencias WHERE sucursal_origen IN (${placeholders}) OR sucursal_destino IN (${placeholders})`,
        [...sucursales, ...sucursales]
      );
      resultados.push(`✅ Transferencias eliminadas: ${transferenciasResult.affectedRows}`);
      
      // Eliminar historial de transferencias
      const [historialTransfResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM historial_transferencias`
      );
      resultados.push(`✅ Historial de transferencias eliminado: ${historialTransfResult.affectedRows}`);
    }
    
    // 9. Limpiar Devoluciones y Reemplazos
    if (opciones.devoluciones) {
      const placeholders = sucursales.map(() => '?').join(', ');
      
      const [devolucionesResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM devoluciones_reemplazos WHERE sucursal IN (${placeholders})`,
        sucursales
      );
      resultados.push(`✅ Devoluciones y reemplazos eliminados: ${devolucionesResult.affectedRows}`);
    }
    
    // 10. Limpiar Gastos
    if (opciones.gastos) {
      const placeholders = sucursales.map(() => '?').join(', ');
      
      const [gastosResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM gastos WHERE sucursal IN (${placeholders})`,
        sucursales
      );
      resultados.push(`✅ Gastos eliminados: ${gastosResult.affectedRows}`);
    }
    
    // 11. Limpiar Reportes y Estadísticas (página /inventory/log)
    // Esta opción borra TODO lo que aparece en la página de Ventas Globales
    // Para simplicidad y robustez, borra TODO sin filtrar por sucursal (como borrado maestro)
    if (opciones.reportesEstadisticas) {
      console.log('🔍 [DEBUG] ========== Opción 11: REPORTES Y ESTADÍSTICAS ==========');
      console.log('🔍 [DEBUG] Estado de otras opciones:', {
        ventas: opciones.ventas,
        gastos: opciones.gastos,
        movimientosCaja: opciones.movimientosCaja,
        devoluciones: opciones.devoluciones,
        comisiones: opciones.comisiones
      });
      
      // Borrar ventas (si no se borró ya)
      if (!opciones.ventas) {
        console.log('🔍 [DEBUG] Borrando VENTAS (no borradas previamente)...');
        try {
          const [ventasResult] = await connection.execute<ResultSetHeader>(
            `DELETE FROM ventas`
          );
          console.log('✅ [DEBUG] Ventas eliminadas:', ventasResult.affectedRows);
          resultados.push(`✅ [REPORTES] Ventas eliminadas: ${ventasResult.affectedRows}`);
        } catch (error: any) {
          console.error('❌ [DEBUG] Error al borrar ventas:', error.message);
          throw error;
        }
        
        console.log('🔍 [DEBUG] Borrando RESÚMENES DIARIOS...');
        try {
          const [resumenResult] = await connection.execute<ResultSetHeader>(
            `DELETE FROM ventas_diarias_resumen`
          );
          console.log('✅ [DEBUG] Resúmenes diarios eliminados:', resumenResult.affectedRows);
          resultados.push(`✅ [REPORTES] Resúmenes diarios eliminados: ${resumenResult.affectedRows}`);
        } catch (error: any) {
          console.error('❌ [DEBUG] Error al borrar resúmenes diarios:', error.message);
          throw error;
        }
      } else {
        console.log('⏭️ [DEBUG] Ventas ya borradas previamente, saltando...');
      }
      
      // Borrar gastos (si no se borró ya)
      if (!opciones.gastos) {
        console.log('🔍 [DEBUG] Borrando GASTOS (no borrados previamente)...');
        try {
          const [gastosResult] = await connection.execute<ResultSetHeader>(
            `DELETE FROM gastos`
          );
          console.log('✅ [DEBUG] Gastos eliminados:', gastosResult.affectedRows);
          resultados.push(`✅ [REPORTES] Gastos eliminados: ${gastosResult.affectedRows}`);
        } catch (error: any) {
          console.error('❌ [DEBUG] Error al borrar gastos:', error.message);
          throw error;
        }
      } else {
        console.log('⏭️ [DEBUG] Gastos ya borrados previamente, saltando...');
      }
      
      // Borrar movimientos de caja (si no se borró ya)
      if (!opciones.movimientosCaja) {
        console.log('🔍 [DEBUG] Borrando MOVIMIENTOS DE CAJA (no borrados previamente)...');
        try {
          const [movimientosResult] = await connection.execute<ResultSetHeader>(
            `DELETE FROM movimientos_caja`
          );
          console.log('✅ [DEBUG] Movimientos de caja eliminados:', movimientosResult.affectedRows);
          resultados.push(`✅ [REPORTES] Movimientos de caja eliminados: ${movimientosResult.affectedRows}`);
        } catch (error: any) {
          console.error('❌ [DEBUG] Error al borrar movimientos de caja:', error.message);
          throw error;
        }
      } else {
        console.log('⏭️ [DEBUG] Movimientos de caja ya borrados previamente, saltando...');
      }
      
      // Borrar devoluciones (si no se borró ya)
      if (!opciones.devoluciones) {
        console.log('🔍 [DEBUG] Borrando DEVOLUCIONES (no borradas previamente)...');
        try {
          const [devolucionesResult] = await connection.execute<ResultSetHeader>(
            `DELETE FROM devoluciones_reemplazos`
          );
          console.log('✅ [DEBUG] Devoluciones eliminadas:', devolucionesResult.affectedRows);
          resultados.push(`✅ [REPORTES] Devoluciones eliminadas: ${devolucionesResult.affectedRows}`);
        } catch (error: any) {
          console.error('❌ [DEBUG] Error al borrar devoluciones:', error.message);
          throw error;
        }
      } else {
        console.log('⏭️ [DEBUG] Devoluciones ya borradas previamente, saltando...');
      }
      
      // Borrar comisiones (si no se borró ya)
      if (!opciones.comisiones) {
        console.log('🔍 [DEBUG] Borrando COMISIONES (no borradas previamente)...');
        try {
          const [comisionesResult] = await connection.execute<ResultSetHeader>(
            `DELETE FROM comisiones_vendedores`
          );
          console.log('✅ [DEBUG] Comisiones eliminadas:', comisionesResult.affectedRows);
          resultados.push(`✅ [REPORTES] Comisiones eliminadas: ${comisionesResult.affectedRows}`);
        } catch (error: any) {
          console.error('❌ [DEBUG] Error al borrar comisiones:', error.message);
          throw error;
        }
      } else {
        console.log('⏭️ [DEBUG] Comisiones ya borradas previamente, saltando...');
      }
      
      console.log('✅ [DEBUG] Limpieza de Reportes y Estadísticas completada');
      resultados.push(`✅ Limpieza de Reportes y Estadísticas completada (borrado total)`);
    } else {
      console.log('⏭️ [DEBUG] Opción 11: REPORTES Y ESTADÍSTICAS - No activada, saltando...');
    }
    
    // Commit de la transacción
    console.log('🔍 [DEBUG] ========== FINALIZANDO LIMPIEZA ==========');
    console.log('🔍 [DEBUG] Resultados totales:', resultados.length);
    console.log('🔍 [DEBUG] Haciendo COMMIT de la transacción...');
    await connection.commit();
    console.log('✅ [DEBUG] COMMIT exitoso');
    
    console.log('✅ Limpieza completada exitosamente:', resultados);
    console.log('🔍 [DEBUG] Enviando respuesta exitosa al cliente...');
    
    res.status(200).json({
      success: true,
      message: `Limpieza completada: ${resultados.length} operaciones`,
      data: {
        sucursales: sucursales,
        resultados,
      },
    });
    
    console.log('✅ [DEBUG] Respuesta enviada correctamente');
    
  } catch (error: any) {
    // Rollback en caso de error
    console.error('❌❌❌ [DEBUG] ERROR CRÍTICO EN LIMPIEZA ❌❌❌');
    console.error('❌ [DEBUG] Tipo de error:', error.constructor.name);
    console.error('❌ [DEBUG] Mensaje:', error.message);
    console.error('❌ [DEBUG] Código SQL (si aplica):', error.code);
    console.error('❌ [DEBUG] errno (si aplica):', error.errno);
    console.error('❌ [DEBUG] Stack trace completo:', error.stack);
    
    console.log('🔍 [DEBUG] Haciendo ROLLBACK...');
    await connection.rollback();
    console.log('✅ [DEBUG] ROLLBACK completado');
    
    console.log('🔍 [DEBUG] Enviando error 500 al cliente...');
    res.status(500).json({
      success: false,
      message: 'Error al limpiar los datos',
      error: error.message,
      errorCode: error.code,
      errorDetails: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  } finally {
    console.log('🔍 [DEBUG] Liberando conexión de base de datos...');
    connection.release();
    console.log('✅ [DEBUG] Conexión liberada');
    console.log('🔍 [DEBUG] ========== FIN LIMPIEZA DATOS ==========');
  }
};

/**
 * 🔥 BORRADO MAESTRO - ELIMINA TODOS LOS DATOS DE PRUEBA
 * ⚠️ ADVERTENCIA: ESTA ACCIÓN ES IRREVERSIBLE
 * 
 * Borra COMPLETAMENTE:
 * - Todos los clientes de todas las sucursales
 * - Todas las ventas y detalles de ventas
 * - Todas las devoluciones y reemplazos
 * - Todas las transferencias de mercadería
 * - Todo el historial de envíos de dinero
 * - Todo el stock (lo pone en 0)
 * - Todo el stock de fallas (lo pone en 0)
 * - Todo el historial de movimientos de inventario
 * - Todos los gastos registrados
 * - Todas las comisiones pagadas
 * - Toda la cuenta corriente (movimientos y pagos)
 * - Toda la caja (la deja en $0 y borra historial)
 * 
 * POST /api/database/borrado-maestro
 */
export const borradoMaestro = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔥🔥🔥 INICIANDO BORRADO MAESTRO - IRREVERSIBLE 🔥🔥🔥');
    
    await connection.beginTransaction();
    
    const resultados: string[] = [];
    const errores: string[] = [];
    
    // Helper function para ejecutar queries de forma segura
    const ejecutarQuerySegura = async (descripcion: string, query: string, params: any[] = []) => {
      try {
        const [result] = await connection.execute<ResultSetHeader>(query, params);
        resultados.push(`✅ ${descripcion}: ${result.affectedRows} registros`);
        console.log(`✅ ${descripcion}: ${result.affectedRows}`);
      } catch (error: any) {
        const mensaje = `⚠️ ${descripcion}: ${error.message}`;
        errores.push(mensaje);
        console.warn(mensaje);
      }
    };
    
    // ========================================
    // PASO 1: OBTENER TODAS LAS SUCURSALES
    // ========================================
    const [tables] = await connection.execute<any[]>(
      "SHOW TABLES LIKE 'clientes_%'"
    );
    
    const sucursales: string[] = [];
    tables.forEach((table: any) => {
      const tableName = Object.values(table)[0] as string;
      const suc = tableName.replace('clientes_', '');
      sucursales.push(suc);
    });
    
    console.log(`📋 Sucursales encontradas: ${sucursales.join(', ')}`);
    resultados.push(`📋 Sucursales detectadas: ${sucursales.length} (${sucursales.join(', ')})`);
    
    // ========================================
    // PASO 2: BORRAR VENTAS Y DETALLES
    // ========================================
    console.log('🗑️ Borrando ventas...');
    await ejecutarQuerySegura('VENTAS eliminadas', 'DELETE FROM ventas');
    await ejecutarQuerySegura('RESÚMENES DIARIOS eliminados', 'DELETE FROM ventas_diarias_resumen');
    
    // ========================================
    // PASO 3: BORRAR DEVOLUCIONES Y REEMPLAZOS
    // ========================================
    console.log('🗑️ Borrando devoluciones y reemplazos...');
    await ejecutarQuerySegura('DEVOLUCIONES Y REEMPLAZOS eliminados', 'DELETE FROM devoluciones_reemplazos');
    
    // ========================================
    // PASO 4: BORRAR TRANSFERENCIAS DE MERCADERÍA
    // ========================================
    console.log('🗑️ Borrando transferencias...');
    await ejecutarQuerySegura('TRANSFERENCIAS eliminadas', 'DELETE FROM transferencias');
    await ejecutarQuerySegura('HISTORIAL DE TRANSFERENCIAS eliminado', 'DELETE FROM historial_transferencias');
    
    // ========================================
    // PASO 5: BORRAR MOVIMIENTOS DE CAJA
    // ========================================
    console.log('🗑️ Borrando movimientos de caja...');
    await ejecutarQuerySegura('MOVIMIENTOS DE CAJA eliminados', 'DELETE FROM movimientos_caja');
    
    // ========================================
    // PASO 6: RESETEAR CAJA A $0
    // ========================================
    console.log('🗑️ Reseteando cajas a $0...');
    await ejecutarQuerySegura('CAJAS reseteadas a $0', 'UPDATE caja SET monto_actual = 0.00');
    
    // ========================================
    // PASO 7: BORRAR STOCK E HISTORIAL
    // ========================================
    console.log('🗑️ Reseteando stock y borrando historial...');
    await ejecutarQuerySegura('STOCK reseteado a 0', 'UPDATE productos_sucursal SET stock = 0, stock_fallas = 0');
    await ejecutarQuerySegura('HISTORIAL DE STOCK eliminado', 'DELETE FROM historial_stock');
    
    // ========================================
    // PASO 8: BORRAR COMISIONES Y SUELDOS
    // ========================================
    console.log('🗑️ Borrando comisiones...');
    await ejecutarQuerySegura('SUELDOS/COMISIONES PAGADAS eliminadas', 'DELETE FROM sueldos');
    await ejecutarQuerySegura('COMISIONES DE VENDEDORES eliminadas', 'DELETE FROM comisiones_vendedores');
    await ejecutarQuerySegura('HISTORIAL DE PAGOS DE COMISIONES eliminado', 'DELETE FROM historial_pagos_comisiones');
    await ejecutarQuerySegura('REMANENTES DE COMISIONES eliminados', 'DELETE FROM remanentes_comisiones');
    
    // ========================================
    // PASO 9: BORRAR CUENTA CORRIENTE
    // ========================================
    console.log('🗑️ Borrando cuenta corriente...');
    await ejecutarQuerySegura('MOVIMIENTOS DE CUENTA CORRIENTE eliminados', 'DELETE FROM cuenta_corriente_movimientos');
    await ejecutarQuerySegura('PAGOS DE CUENTA CORRIENTE eliminados', 'DELETE FROM pagos_cuenta_corriente');
    
    // ========================================
    // PASO 10: BORRAR CLIENTES DE TODAS LAS SUCURSALES
    // ========================================
    console.log('🗑️ Borrando clientes de todas las sucursales...');
    let totalClientesBorrados = 0;
    for (const suc of sucursales) {
      try {
        const tablaClientes = `clientes_${suc}`;
        console.log(`  🗑️ Borrando de tabla: ${tablaClientes}`);
        
        const [result] = await connection.execute<ResultSetHeader>(
          `DELETE FROM \`${tablaClientes}\``
        );
        
        totalClientesBorrados += result.affectedRows;
        resultados.push(`✅ Clientes de ${suc.toUpperCase()}: ${result.affectedRows} eliminados`);
        console.log(`  ✅ Clientes de ${suc.toUpperCase()}: ${result.affectedRows} eliminados`);
      } catch (error: any) {
        const mensaje = `⚠️ No se pudo borrar clientes de ${suc}: ${error.message}`;
        errores.push(mensaje);
        console.warn(mensaje);
      }
    }
    
    // ========================================
    // PASO 11: BORRAR GASTOS (si existe la tabla)
    // ========================================
    console.log('🗑️ Borrando gastos...');
    await ejecutarQuerySegura('GASTOS eliminados', 'DELETE FROM gastos');
    
    // ========================================
    // COMMIT Y FINALIZACIÓN
    // ========================================
    await connection.commit();
    
    console.log('✅✅✅ BORRADO MAESTRO COMPLETADO ✅✅✅');
    console.log('Resultados:', resultados);
    if (errores.length > 0) {
      console.log('⚠️ Advertencias:', errores);
    }
    
    const mensaje = errores.length > 0
      ? '🔥 BORRADO MAESTRO COMPLETADO CON ADVERTENCIAS'
      : '🔥 BORRADO MAESTRO COMPLETADO - TODOS LOS DATOS ELIMINADOS';
    
    res.status(200).json({
      success: true,
      message: mensaje,
      data: {
        sucursales: sucursales.length,
        operaciones_exitosas: resultados.length,
        advertencias: errores.length,
        resultados,
        errores: errores.length > 0 ? errores : undefined,
      },
    });
    
  } catch (error: any) {
    await connection.rollback();
    console.error('❌ ERROR CRÍTICO EN BORRADO MAESTRO:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error crítico durante el borrado maestro',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  } finally {
    connection.release();
  }
};


