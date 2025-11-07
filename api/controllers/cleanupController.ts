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
 *   }
 * }
 */
export const limpiarDatos = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { sucursal, opciones } = req.body;
    
    console.log('🗑️ Iniciando limpieza de datos:', { sucursal, opciones });
    
    // Iniciar transacción para seguridad
    await connection.beginTransaction();
    
    let resultados: string[] = [];
    
    // Obtener todas las sucursales si es 'todas'
    const sucursales: string[] = [];
    if (sucursal === 'todas') {
      const [tables] = await connection.execute<any[]>(
        "SHOW TABLES LIKE 'clientes_%'"
      );
      
      tables.forEach((table: any) => {
        const tableName = Object.values(table)[0] as string;
        const suc = tableName.replace('clientes_', '');
        sucursales.push(suc);
      });
    } else {
      sucursales.push(sucursal);
    }
    
    // LIMPIEZA POR MÓDULO
    
    // 1. Limpiar Ventas
    if (opciones.ventas) {
      // Construir placeholders para el IN (??, ??, ??)
      const placeholders = sucursales.map(() => '?').join(', ');
      const [result] = await connection.execute<ResultSetHeader>(
        `DELETE FROM ventas WHERE sucursal IN (${placeholders})`,
        sucursales
      );
      resultados.push(`✅ Ventas eliminadas: ${result.affectedRows}`);
      
      // Eliminar resúmenes diarios de ventas (tabla ventas_diarias_resumen)
      const [resumenResult] = await connection.execute<ResultSetHeader>(
        `DELETE FROM ventas_diarias_resumen`
      );
      resultados.push(`✅ Resúmenes diarios eliminados: ${resumenResult.affectedRows}`);
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
    
    // 6. Resetear Stock de Productos (NO elimina productos)
    if (opciones.productos) {
      const placeholders = sucursales.map(() => '?').join(', ');
      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE productos_sucursal SET stock = 0, stock_en_transito = 0 WHERE sucursal IN (${placeholders})`,
        sucursales
      );
      resultados.push(`✅ Stock reseteado a 0 en: ${result.affectedRows} registros`);
    }
    
    // Commit de la transacción
    await connection.commit();
    
    console.log('✅ Limpieza completada exitosamente:', resultados);
    
    res.status(200).json({
      success: true,
      message: `Limpieza completada: ${resultados.length} operaciones`,
      data: {
        sucursales: sucursales,
        resultados,
      },
    });
    
  } catch (error: any) {
    // Rollback en caso de error
    await connection.rollback();
    console.error('❌ Error en limpieza de datos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar los datos',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};


