/**
 * Controlador para gestión de sucursales
 * Maneja la creación, listado y gestión de sucursales
 * Incluye creación automática de tablas clientes_[sucursal]
 */

import { Request, Response } from 'express';
import { executeQuery } from '../config/database';
import pool from '../config/database';

/**
 * Interfaz para Sucursal
 */
interface Sucursal {
  id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  ciudad?: string;
  activa: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Obtener todas las sucursales activas
 * GET /api/sucursales
 */
export const obtenerSucursales = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener todas las tablas que empiezan con "clientes_" (cada una representa una sucursal)
    const [tablas] = await pool.execute(
      `SELECT TABLE_NAME 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME LIKE 'clientes_%'
       ORDER BY TABLE_NAME ASC`
    );

    const tablasArray = tablas as { TABLE_NAME: string }[];
    
    // Mapear las tablas a sucursales y contar vendedores
    const sucursales = await Promise.all(
      tablasArray.map(async (tabla) => {
        // Extraer el nombre de la sucursal (quitar "clientes_")
        const nombreSucursal = tabla.TABLE_NAME.replace('clientes_', '');
        
        // Contar vendedores activos de esta sucursal
        const vendedores = await executeQuery<{ total: number }[]>(
          'SELECT COUNT(*) as total FROM vendedores WHERE sucursal = ? AND activo = 1',
          [nombreSucursal]
        );
        
        return {
          sucursal: nombreSucursal,
          total_vendedores: vendedores[0]?.total || 0
        };
      })
    );

    // Filtrar "administrador" (no es una sucursal física)
    const sucursalesFiltradas = sucursales.filter(
      s => s.sucursal.toLowerCase() !== 'administrador'
    );

    res.json({
      success: true,
      data: sucursalesFiltradas,
      message: 'Sucursales obtenidas exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al obtener sucursales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sucursales',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Verificar si existe una tabla de clientes para una sucursal
 */
const verificarTablaClientes = async (nombreSucursal: string): Promise<boolean> => {
  try {
    const nombreTabla = `clientes_${nombreSucursal.toLowerCase()}`;
    
    const [tablas] = await pool.execute(
      `SELECT TABLE_NAME 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = ?`,
      [nombreTabla]
    );

    return (tablas as any[]).length > 0;
  } catch (error) {
    console.error('❌ Error al verificar tabla:', error);
    return false;
  }
};

/**
 * Crear tabla de clientes para una nueva sucursal
 */
const crearTablaClientes = async (nombreSucursal: string): Promise<void> => {
  const nombreTabla = `clientes_${nombreSucursal.toLowerCase()}`;
  
  // SQL para crear la tabla con estructura COMPLETA (idéntica a clientes_pando)
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS \`${nombreTabla}\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`nombre\` VARCHAR(100) NOT NULL COMMENT 'Nombre del cliente',
      \`apellido\` VARCHAR(100) NOT NULL COMMENT 'Apellido del cliente',
      \`nombre_fantasia\` VARCHAR(150) DEFAULT NULL COMMENT 'Nombre de fantasía o comercial',
      \`rut\` VARCHAR(20) DEFAULT NULL COMMENT 'RUT del cliente',
      \`direccion\` TEXT COMMENT 'Dirección completa',
      \`email\` VARCHAR(100) DEFAULT NULL COMMENT 'Email del cliente',
      \`razon_social\` VARCHAR(200) DEFAULT NULL COMMENT 'Razón social',
      \`telefono\` VARCHAR(20) DEFAULT NULL COMMENT 'Teléfono principal',
      \`vendedor_id\` INT DEFAULT NULL COMMENT 'ID del vendedor asignado',
      \`fecha_registro\` DATE NOT NULL DEFAULT (CURDATE()) COMMENT 'Fecha de registro',
      \`activo\` TINYINT(1) DEFAULT '1' COMMENT 'Estado del cliente',
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_nombre\` (\`nombre\`, \`apellido\`),
      KEY \`idx_vendedor\` (\`vendedor_id\`),
      KEY \`idx_rut\` (\`rut\`),
      CONSTRAINT \`${nombreTabla}_ibfk_1\` FOREIGN KEY (\`vendedor_id\`) REFERENCES \`vendedores\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
    COMMENT='Clientes de sucursal ${nombreSucursal}';
  `;

  await pool.execute(createTableSQL);
  console.log(`✅ Tabla ${nombreTabla} creada exitosamente con estructura completa`);
};

/**
 * Importar todos los productos a una nueva sucursal
 * Copia todos los productos activos con precio y stock inicial
 */
const importarProductosASucursal = async (nombreSucursal: string): Promise<number> => {
  try {
    console.log(`📦 Importando productos a sucursal: ${nombreSucursal}`);
    
    // Obtener todos los productos activos
    const productos = await executeQuery<{ id: number }[]>(
      'SELECT id FROM productos WHERE activo = 1'
    );

    if (productos.length === 0) {
      console.log('⚠️ No hay productos activos para importar');
      return 0;
    }

    console.log(`📋 ${productos.length} productos encontrados para importar`);

    // Obtener un producto de referencia de otra sucursal para copiar precios
    const productosReferencia = await executeQuery<{
      producto_id: number;
      precio: number;
      stock_minimo: number;
    }[]>(
      `SELECT producto_id, precio, stock_minimo 
       FROM productos_sucursal 
       WHERE sucursal = 'pando' AND activo = 1
       LIMIT ${productos.length}`
    );

    // Crear mapa de precios de referencia
    const preciosReferencia = new Map(
      productosReferencia.map(p => [p.producto_id, { 
        precio: p.precio, 
        stock_minimo: p.stock_minimo 
      }])
    );

    // Insertar cada producto en la nueva sucursal
    let productosImportados = 0;
    
    for (const producto of productos) {
      try {
        // Obtener precio y stock_minimo de referencia o usar valores por defecto
        const referencia = preciosReferencia.get(producto.id);
        const precio = referencia?.precio || 0;
        const stockMinimo = referencia?.stock_minimo || 10;

        await executeQuery(
          `INSERT INTO productos_sucursal 
           (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal, activo)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [producto.id, nombreSucursal.toLowerCase(), 0, precio, stockMinimo, 0, 1]
        );
        
        productosImportados++;
      } catch (error: any) {
        // Si el producto ya existe (duplicado), continuar
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ Producto ${producto.id} ya existe en ${nombreSucursal}`);
        } else {
          console.error(`❌ Error al importar producto ${producto.id}:`, error);
        }
      }
    }

    console.log(`✅ ${productosImportados} productos importados a ${nombreSucursal}`);
    return productosImportados;
  } catch (error) {
    console.error('❌ Error al importar productos:', error);
    throw error;
  }
};

/**
 * Crear una nueva sucursal
 * POST /api/sucursales
 * Requiere autenticación y permisos de administrador
 */
export const crearSucursal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, direccion, telefono, ciudad } = req.body;

    // Validar campo requerido
    if (!nombre || nombre.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'El nombre de la sucursal es requerido'
      });
      return;
    }

    // Normalizar nombre (lowercase, sin espacios extras)
    const nombreNormalizado = nombre.trim().toLowerCase();

    // Validar que el nombre solo contenga letras (sin caracteres especiales)
    if (!/^[a-záéíóúñ]+$/.test(nombreNormalizado)) {
      res.status(400).json({
        success: false,
        message: 'El nombre de la sucursal solo puede contener letras (sin espacios ni caracteres especiales)'
      });
      return;
    }

    // Verificar si ya existe una sucursal con ese nombre
    const sucursalesExistentes = await executeQuery<{ sucursal: string }[]>(
      'SELECT sucursal FROM vendedores WHERE sucursal = ? LIMIT 1',
      [nombreNormalizado]
    );

    if (sucursalesExistentes.length > 0) {
      res.status(400).json({
        success: false,
        message: `Ya existe una sucursal con el nombre "${nombreNormalizado}"`
      });
      return;
    }

    // Verificar si existe tabla de clientes
    const existeTabla = await verificarTablaClientes(nombreNormalizado);

    // Si no existe, crear la tabla
    if (!existeTabla) {
      await crearTablaClientes(nombreNormalizado);
      console.log(`✅ Nueva tabla de clientes creada: clientes_${nombreNormalizado}`);
    }

    // Importar productos a la nueva sucursal
    console.log(`📦 Iniciando importación de productos para ${nombreNormalizado}...`);
    const productosImportados = await importarProductosASucursal(nombreNormalizado);

    res.status(201).json({
      success: true,
      data: {
        nombre: nombreNormalizado,
        direccion: direccion || null,
        telefono: telefono || null,
        ciudad: ciudad || null,
        tabla_clientes: `clientes_${nombreNormalizado}`,
        tabla_creada: !existeTabla,
        productos_importados: productosImportados
      },
      message: `Sucursal "${nombreNormalizado}" creada exitosamente${!existeTabla ? ' (incluida tabla de clientes)' : ''}. ${productosImportados} productos importados.`
    });
  } catch (error) {
    console.error('❌ Error al crear sucursal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear sucursal',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Eliminar una sucursal (requiere que no tenga vendedores asociados)
 * DELETE /api/sucursales/:nombre
 * Requiere autenticación y permisos de administrador
 */
export const eliminarSucursal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre } = req.params;

    if (!nombre) {
      res.status(400).json({
        success: false,
        message: 'El nombre de la sucursal es requerido'
      });
      return;
    }

    const nombreNormalizado = nombre.toLowerCase();

    // Verificar si hay vendedores activos en esta sucursal
    const vendedores = await executeQuery<{ total: number }[]>(
      'SELECT COUNT(*) as total FROM vendedores WHERE sucursal = ? AND activo = 1',
      [nombreNormalizado]
    );

    if (vendedores[0].total > 0) {
      res.status(400).json({
        success: false,
        message: `No se puede eliminar la sucursal "${nombreNormalizado}" porque tiene ${vendedores[0].total} vendedor(es) activo(s)`
      });
      return;
    }

    // IMPORTANTE: NO eliminamos la tabla de clientes automáticamente por seguridad
    // El administrador debe hacerlo manualmente si está seguro

    res.json({
      success: true,
      message: `Sucursal "${nombreNormalizado}" lista para eliminar. NOTA: La tabla clientes_${nombreNormalizado} debe eliminarse manualmente si es necesario.`,
      data: {
        sucursal: nombreNormalizado,
        tabla_clientes: `clientes_${nombreNormalizado}`
      }
    });
  } catch (error) {
    console.error('❌ Error al eliminar sucursal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar sucursal',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener estadísticas de una sucursal
 * GET /api/sucursales/:nombre/stats
 */
export const obtenerEstadisticasSucursal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre } = req.params;
    const nombreNormalizado = nombre.toLowerCase();

    // Total de vendedores
    const vendedores = await executeQuery<{ total: number }[]>(
      'SELECT COUNT(*) as total FROM vendedores WHERE sucursal = ? AND activo = 1',
      [nombreNormalizado]
    );

    // Total de clientes
    const nombreTabla = `clientes_${nombreNormalizado}`;
    let totalClientes = 0;
    
    try {
      const clientes = await executeQuery<{ total: number }[]>(
        `SELECT COUNT(*) as total FROM \`${nombreTabla}\` WHERE activo = 1`
      );
      totalClientes = clientes[0]?.total || 0;
    } catch (error) {
      console.log(`⚠️ No se pudo obtener clientes de ${nombreTabla}`);
    }

    res.json({
      success: true,
      data: {
        sucursal: nombreNormalizado,
        total_vendedores: vendedores[0].total,
        total_clientes: totalClientes,
        tabla_clientes: nombreTabla
      },
      message: 'Estadísticas obtenidas exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

