/**
 * Utilidades de Base de Datos
 * Funciones helpers reutilizables para operaciones dinámicas con la BD
 */

import pool from '../config/database.js';
import type { RowDataPacket } from 'mysql2';

/**
 * Interfaz para información de sucursales
 */
export interface SucursalInfo {
  sucursal: string;
  tabla_clientes: string;
}

/**
 * Obtener TODAS las tablas de clientes dinámicamente desde la base de datos
 * Busca todas las tablas que empiecen con "clientes_"
 * 
 * @returns Array de nombres de tablas de clientes
 * 
 * @example
 * const tablas = await obtenerTodasLasTablas();
 * // Resultado: ['clientes_pando', 'clientes_maldonado', 'clientes_soriano', ...]
 */
export const obtenerTodasLasTablas = async (): Promise<string[]> => {
  try {
    const [tablas] = await pool.execute<RowDataPacket[]>(
      `SELECT TABLE_NAME 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME LIKE 'clientes_%'
       ORDER BY TABLE_NAME`
    );

    const tablasClientes = tablas.map(row => row.TABLE_NAME as string);
    
    console.log(`📋 Tablas de clientes encontradas: ${tablasClientes.length}`);
    
    return tablasClientes;
  } catch (error) {
    console.error('❌ Error al obtener tablas de clientes:', error);
    // En caso de error, retornar array vacío
    return [];
  }
};

/**
 * Obtener TODAS las sucursales con su información
 * 
 * @returns Array de objetos con información de sucursales
 * 
 * @example
 * const sucursales = await obtenerTodasLasSucursales();
 * // Resultado: [
 * //   { sucursal: 'pando', tabla_clientes: 'clientes_pando' },
 * //   { sucursal: 'maldonado', tabla_clientes: 'clientes_maldonado' },
 * //   ...
 * // ]
 */
export const obtenerTodasLasSucursales = async (): Promise<SucursalInfo[]> => {
  try {
    const tablasClientes = await obtenerTodasLasTablas();
    
    const sucursales: SucursalInfo[] = tablasClientes.map(tabla => {
      // Extraer nombre de sucursal de "clientes_[nombre]"
      const nombreSucursal = tabla.replace('clientes_', '');
      
      return {
        sucursal: nombreSucursal,
        tabla_clientes: tabla
      };
    });
    
    return sucursales;
  } catch (error) {
    console.error('❌ Error al obtener sucursales:', error);
    return [];
  }
};

/**
 * Verificar si una tabla de clientes existe
 * 
 * @param nombreSucursal - Nombre de la sucursal (sin prefijo "clientes_")
 * @returns true si la tabla existe, false si no
 * 
 * @example
 * const existe = await tablaClientesExiste('pando');
 * // true si existe clientes_pando
 */
export const tablaClientesExiste = async (nombreSucursal: string): Promise<boolean> => {
  try {
    const nombreTabla = `clientes_${nombreSucursal.toLowerCase()}`;
    
    const [tablas] = await pool.execute<RowDataPacket[]>(
      `SELECT TABLE_NAME 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = ?`,
      [nombreTabla]
    );

    return tablas.length > 0;
  } catch (error) {
    console.error('❌ Error al verificar tabla de clientes:', error);
    return false;
  }
};

/**
 * Obtener nombre de tabla de clientes para una sucursal
 * 
 * @param nombreSucursal - Nombre de la sucursal
 * @returns Nombre de la tabla de clientes
 * 
 * @example
 * const tabla = obtenerNombreTablaClientes('pando');
 * // 'clientes_pando'
 */
export const obtenerNombreTablaClientes = (nombreSucursal: string): string => {
  return `clientes_${nombreSucursal.toLowerCase()}`;
};

/**
 * Obtener lista de nombres de sucursales (sin prefijo "clientes_")
 * 
 * @returns Array de nombres de sucursales
 * 
 * @example
 * const sucursales = await obtenerNombresSucursales();
 * // ['pando', 'maldonado', 'rivera', 'soriano', ...]
 */
export const obtenerNombresSucursales = async (): Promise<string[]> => {
  try {
    const sucursales = await obtenerTodasLasSucursales();
    return sucursales.map(s => s.sucursal);
  } catch (error) {
    console.error('❌ Error al obtener nombres de sucursales:', error);
    return [];
  }
};



















