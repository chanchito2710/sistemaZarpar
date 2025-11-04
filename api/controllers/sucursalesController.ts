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
 * Interfaz para Configuración de Sucursal
 */
interface ConfiguracionSucursal {
  id: number;
  sucursal: string;
  es_principal: boolean;
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
        
        // Obtener configuración de la sucursal (incluyendo si es principal)
        const config = await executeQuery<{ es_principal: number }[]>(
          'SELECT es_principal FROM configuracion_sucursales WHERE sucursal = ? LIMIT 1',
          [nombreSucursal]
        );
        
        return {
          sucursal: nombreSucursal,
          total_vendedores: vendedores[0]?.total || 0,
          es_principal: config[0]?.es_principal === 1 || false
        };
      })
    );

    // Filtrar "administrador" (no es una sucursal física)
    const sucursalesFiltradas = sucursales.filter(
      s => s.sucursal.toLowerCase() !== 'administrador'
    );

    // Ordenar: Principal primero, luego alfabético
    sucursalesFiltradas.sort((a, b) => {
      if (a.es_principal && !b.es_principal) return -1;
      if (!a.es_principal && b.es_principal) return 1;
      return a.sucursal.localeCompare(b.sucursal);
    });

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
 * IMPORTANTE: Crea una FK con nombre predecible para facilitar eliminación
 */
const crearTablaClientes = async (nombreSucursal: string): Promise<void> => {
  const nombreTabla = `clientes_${nombreSucursal.toLowerCase()}`;
  const nombreFK = `fk_${nombreTabla}_vendedor`;
  
  console.log(`📝 Creando tabla ${nombreTabla} con FK: ${nombreFK}`);
  
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
      CONSTRAINT \`${nombreFK}\` FOREIGN KEY (\`vendedor_id\`) REFERENCES \`vendedores\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
    COMMENT='Clientes de sucursal ${nombreSucursal}';
  `;

  await pool.execute(createTableSQL);
  console.log(`✅ Tabla ${nombreTabla} creada exitosamente con FK: ${nombreFK}`);
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
 * Eliminar una sucursal PERMANENTEMENTE
 * DELETE /api/sucursales/:nombre
 * Requiere autenticación y permisos de administrador
 * 
 * PROCESO DE ELIMINACIÓN (en orden):
 * 1. Verifica que NO tenga vendedores activos (si tiene, rechaza)
 * 2. Elimina productos de productos_sucursal
 * 3. Detecta y elimina TODAS las foreign keys de la tabla de clientes
 * 4. Elimina la tabla de clientes completa (DROP TABLE)
 * 5. Elimina vendedores inactivos de la sucursal
 * 
 * IMPORTANTE: Esta implementación es robusta y maneja correctamente:
 * - Foreign keys con nombres generados automáticamente por MySQL
 * - Foreign keys con nombres personalizados
 * - Múltiples foreign keys en una tabla
 * - Errores parciales (continúa eliminando lo posible)
 * 
 * NO usa SET FOREIGN_KEY_CHECKS = 0 (solución temporal)
 * En su lugar, detecta y elimina FKs de forma explícita
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
    const nombreTabla = `clientes_${nombreNormalizado}`;

    console.log(`🗑️ Iniciando eliminación de sucursal: ${nombreNormalizado}`);

    // 1. Verificar si hay vendedores activos en esta sucursal
    const vendedores = await executeQuery<{ total: number }[]>(
      'SELECT COUNT(*) as total FROM vendedores WHERE sucursal = ? AND activo = 1',
      [nombreNormalizado]
    );

    if (vendedores[0].total > 0) {
      console.log(`⚠️ Sucursal ${nombreNormalizado} tiene ${vendedores[0].total} vendedor(es) activo(s)`);
      res.status(400).json({
        success: false,
        message: `❌ No se puede eliminar la sucursal "${nombreNormalizado.toUpperCase()}" porque tiene ${vendedores[0].total} vendedor(es) activo(s). Por favor, elimina o reasigna los vendedores primero.`
      });
      return;
    }

    // 2. Verificar si la tabla de clientes existe y tiene datos
    let totalClientes = 0;
    let tablaExiste = false;

    try {
      const clientes = await executeQuery<{ total: number }[]>(
        `SELECT COUNT(*) as total FROM \`${nombreTabla}\``
      );
      totalClientes = clientes[0]?.total || 0;
      tablaExiste = true;
      console.log(`📊 La tabla ${nombreTabla} tiene ${totalClientes} cliente(s)`);
    } catch (error: any) {
      // Si la tabla no existe, está bien, continuamos
      if (error.code !== 'ER_NO_SUCH_TABLE') {
        throw error;
      }
      console.log(`⚠️ La tabla ${nombreTabla} no existe`);
    }

    // 3. Contar productos de esta sucursal
    const productos = await executeQuery<{ total: number }[]>(
      'SELECT COUNT(*) as total FROM productos_sucursal WHERE sucursal = ?',
      [nombreNormalizado]
    );
    const totalProductos = productos[0]?.total || 0;
    console.log(`📦 La sucursal ${nombreNormalizado} tiene ${totalProductos} producto(s) asignado(s)`);

    // ELIMINACIÓN EN ORDEN:

    // 4. Eliminar productos de la sucursal
    if (totalProductos > 0) {
      try {
        await executeQuery(
          'DELETE FROM productos_sucursal WHERE sucursal = ?',
          [nombreNormalizado]
        );
        console.log(`✅ ${totalProductos} producto(s) eliminado(s) de ${nombreNormalizado}`);
      } catch (error: any) {
        console.error(`⚠️ Error al eliminar productos: ${error.message}`);
        // Continuar de todas formas
      }
    }

    // 5. Eliminar la tabla de clientes (si existe)
    if (tablaExiste) {
      try {
        console.log(`🔍 Buscando foreign keys en tabla ${nombreTabla}...`);
        
        // Obtener todas las foreign keys de la tabla
        const [constraints] = await pool.execute(
          `SELECT CONSTRAINT_NAME 
           FROM information_schema.TABLE_CONSTRAINTS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = ? 
           AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
          [nombreTabla]
        );

        const fks = constraints as { CONSTRAINT_NAME: string }[];
        console.log(`📋 Encontradas ${fks.length} foreign key(s) en ${nombreTabla}`);
        
        // Eliminar cada foreign key de forma ordenada
        for (const fk of fks) {
          try {
            console.log(`🗑️ Eliminando FK: ${fk.CONSTRAINT_NAME}`);
            await pool.execute(
              `ALTER TABLE \`${nombreTabla}\` DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``
            );
            console.log(`✅ FK ${fk.CONSTRAINT_NAME} eliminada exitosamente`);
          } catch (fkError: any) {
            console.error(`⚠️ Error al eliminar FK ${fk.CONSTRAINT_NAME}:`, fkError.message);
            // Si falla, intentar continuar con las demás
          }
        }

        // Ahora eliminar la tabla (sin foreign keys)
        console.log(`🗑️ Eliminando tabla ${nombreTabla}...`);
        await pool.execute(`DROP TABLE IF EXISTS \`${nombreTabla}\``);
        console.log(`✅ Tabla ${nombreTabla} eliminada PERMANENTEMENTE`);
        
      } catch (error: any) {
        console.error(`❌ Error al eliminar tabla ${nombreTabla}:`, error);
        throw new Error(`No se pudo eliminar la tabla ${nombreTabla}: ${error.message}`);
      }
    }

    // 6. Eliminar vendedores inactivos de la sucursal (si los hay)
    const vendedoresInactivos = await executeQuery<{ total: number }[]>(
      'SELECT COUNT(*) as total FROM vendedores WHERE sucursal = ? AND activo = 0',
      [nombreNormalizado]
    );

    if (vendedoresInactivos[0].total > 0) {
      await executeQuery(
        'DELETE FROM vendedores WHERE sucursal = ? AND activo = 0',
        [nombreNormalizado]
      );
      console.log(`✅ ${vendedoresInactivos[0].total} vendedor(es) inactivo(s) eliminado(s)`);
    }

    console.log(`🎉 Sucursal ${nombreNormalizado} ELIMINADA PERMANENTEMENTE`);

    res.json({
      success: true,
      message: `🗑️ Sucursal "${nombreNormalizado.toUpperCase()}" eliminada PERMANENTEMENTE de la base de datos`,
      data: {
        sucursal: nombreNormalizado,
        tabla_clientes_eliminada: tablaExiste,
        clientes_eliminados: totalClientes,
        productos_eliminados: totalProductos,
        vendedores_inactivos_eliminados: vendedoresInactivos[0].total,
        eliminado_permanentemente: true
      }
    });
  } catch (error: any) {
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

/**
 * Obtener la sucursal principal (Casa Central)
 * GET /api/sucursales/principal
 */
export const obtenerSucursalPrincipal = async (req: Request, res: Response): Promise<void> => {
  try {
    const sucursalPrincipal = await executeQuery<ConfiguracionSucursal[]>(
      'SELECT * FROM configuracion_sucursales WHERE es_principal = 1 AND activa = 1 LIMIT 1'
    );

    if (sucursalPrincipal.length === 0) {
      // Si no hay ninguna principal, establecer Maldonado por defecto
      console.log('⚠️ No hay sucursal principal configurada, estableciendo Maldonado...');
      
      await executeQuery(
        'INSERT INTO configuracion_sucursales (sucursal, es_principal, activa) VALUES (?, 1, 1) ON DUPLICATE KEY UPDATE es_principal = 1',
        ['maldonado']
      );
      
      const nuevaPrincipal = await executeQuery<ConfiguracionSucursal[]>(
        'SELECT * FROM configuracion_sucursales WHERE sucursal = ? LIMIT 1',
        ['maldonado']
      );
      
      res.json({
        success: true,
        data: nuevaPrincipal[0],
        message: 'Sucursal principal establecida (Maldonado por defecto)'
      });
      return;
    }

    res.json({
      success: true,
      data: sucursalPrincipal[0],
      message: 'Sucursal principal obtenida exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al obtener sucursal principal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sucursal principal',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Establecer una sucursal como principal (Casa Central)
 * PUT /api/sucursales/:nombre/principal
 * Requiere autenticación y permisos de administrador
 * 
 * IMPORTANTE: Solo puede haber UNA sucursal principal a la vez
 * Al establecer una nueva, automáticamente se quita el flag de la anterior
 */
export const establecerSucursalPrincipal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre } = req.params;
    const nombreNormalizado = nombre.toLowerCase();

    console.log(`🏠 Estableciendo ${nombreNormalizado} como casa principal...`);

    // Verificar que la sucursal existe (tiene tabla de clientes)
    const nombreTabla = `clientes_${nombreNormalizado}`;
    const [tablas] = await pool.execute(
      `SELECT TABLE_NAME 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = ?`,
      [nombreTabla]
    );

    if ((tablas as any[]).length === 0) {
      res.status(404).json({
        success: false,
        message: `La sucursal "${nombreNormalizado}" no existe en el sistema`
      });
      return;
    }

    // Obtener la sucursal principal actual (si existe)
    const principalActual = await executeQuery<ConfiguracionSucursal[]>(
      'SELECT sucursal FROM configuracion_sucursales WHERE es_principal = 1 LIMIT 1'
    );

    // Si ya es la principal, no hacer nada
    if (principalActual.length > 0 && principalActual[0].sucursal === nombreNormalizado) {
      res.json({
        success: true,
        data: {
          sucursal: nombreNormalizado,
          es_principal: true,
          era_principal: true
        },
        message: `"${nombreNormalizado.toUpperCase()}" ya es la Casa Principal`
      });
      return;
    }

    // Quitar el flag de principal a todas las sucursales
    await executeQuery(
      'UPDATE configuracion_sucursales SET es_principal = 0'
    );

    // Insertar o actualizar la nueva sucursal principal
    await executeQuery(
      `INSERT INTO configuracion_sucursales (sucursal, es_principal, activa)
       VALUES (?, 1, 1)
       ON DUPLICATE KEY UPDATE es_principal = 1, activa = 1`,
      [nombreNormalizado]
    );

    console.log(`✅ ${nombreNormalizado.toUpperCase()} establecida como casa principal`);

    res.json({
      success: true,
      data: {
        sucursal_anterior: principalActual.length > 0 ? principalActual[0].sucursal : null,
        sucursal_nueva: nombreNormalizado,
        es_principal: true
      },
      message: `🏠 "${nombreNormalizado.toUpperCase()}" ahora es la Casa Principal del sistema`
    });
  } catch (error) {
    console.error('❌ Error al establecer sucursal principal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al establecer sucursal principal',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

