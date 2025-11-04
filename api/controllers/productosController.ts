/**
 * Controlador de Productos
 * Gestiona productos y su stock/precio por sucursal
 * Sistema ZARPAR
 */

import { Request, Response } from 'express';
import pool from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { tablaClientesExiste } from '../utils/database.js';

/**
 * Helper: Obtener sucursal principal dinámica
 */
const obtenerSucursalPrincipal = async (): Promise<string | null> => {
  const connection = await pool.getConnection();
  try {
    // Obtener sucursal principal desde configuracion_sucursales
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT sucursal FROM configuracion_sucursales WHERE es_principal = 1 LIMIT 1'
    );
    
    // Si hay sucursal principal, retornarla
    if (rows.length > 0) {
      return rows[0].sucursal;
    }
    
    // Si NO hay sucursal principal, retornar la primera sucursal de la BD
    const [firstRows] = await connection.query<RowDataPacket[]>(
      'SELECT sucursal FROM configuracion_sucursales ORDER BY sucursal ASC LIMIT 1'
    );
    
    return firstRows.length > 0 ? firstRows[0].sucursal : null;
  } finally {
    connection.release();
  }
};

/**
 * Interfaces
 */
interface Producto extends RowDataPacket {
  id: number;
  nombre: string;
  marca?: string;
  tipo?: string;
  calidad?: string;
  codigo_barras?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductoSucursal extends RowDataPacket {
  id: number;
  producto_id: number;
  sucursal: string;
  stock: number;
  precio: number;
  stock_minimo: number;
  es_stock_principal: boolean;
  activo: boolean;
  updated_at: string;
}

interface ProductoCompleto extends Producto {
  stock?: number;
  precio?: number;
  stock_minimo?: number;
  es_stock_principal?: boolean;
  tiene_stock_bajo?: boolean;
}

interface ProductoInput {
  nombre: string;
  marca?: string;
  tipo?: string;
  calidad?: string;
  codigo_barras?: string;
}

interface ProductoSucursalInput {
  stock: number;
  precio: number;
  stock_minimo?: number;
}

/**
 * Helper: Ejecutar query con manejo de errores
 */
const executeQuery = async <T extends RowDataPacket[] | ResultSetHeader>(
  query: string,
  params: any[] = []
): Promise<T> => {
  try {
    const [rows] = await pool.execute<T>(query, params);
    return rows;
  } catch (error) {
    console.error('Error en query:', error);
    throw error;
  }
};

/**
 * Helper: Validar sucursal (DINÁMICO)
 * Verifica si la sucursal existe consultando la tabla clientes_[sucursal]
 */
const validarSucursal = async (sucursal: string): Promise<boolean> => {
  try {
    const sucursalNormalizada = sucursal.toLowerCase().trim();
    
    // Verificar si existe la tabla clientes_[sucursal] dinámicamente
    const existe = await tablaClientesExiste(sucursalNormalizada);
    
    if (existe) {
      console.log(`✅ Sucursal "${sucursalNormalizada}" validada correctamente`);
    } else {
      console.log(`❌ Sucursal "${sucursalNormalizada}" NO existe`);
    }
    
    return existe;
  } catch (error) {
    console.error('❌ Error al validar sucursal:', error);
    return false;
  }
};

// ============================================
// CONTROLADORES
// ============================================

/**
 * Obtener todos los productos (sin información de sucursal)
 * GET /api/productos
 */
export const obtenerProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT 
        id, nombre, marca, tipo, calidad, 
        codigo_barras, activo, 
        created_at, updated_at
      FROM productos
      ORDER BY nombre ASC
    `;

    const productos = await executeQuery<Producto[]>(query);

    res.json({
      success: true,
      data: productos,
      count: productos.length
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener TODOS los productos con información de TODAS las sucursales
 * GET /api/productos/con-sucursales
 */
export const obtenerProductosConSucursales = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener todos los productos
    const queryProductos = `
      SELECT 
        id, nombre, marca, tipo, calidad, 
        codigo_barras, activo, 
        created_at, updated_at
      FROM productos
      WHERE activo = 1
      ORDER BY nombre ASC
    `;
    const productos = await executeQuery<Producto[]>(queryProductos);

    // Para cada producto, obtener información de todas las sucursales
    const productosConSucursales = await Promise.all(
      productos.map(async (producto) => {
        const querySucursales = `
          SELECT 
            sucursal,
            stock,
            precio,
            stock_minimo,
            es_stock_principal,
            activo,
            stock_en_transito,
            updated_at
          FROM productos_sucursal
          WHERE producto_id = ?
          ORDER BY 
            CASE 
              WHEN es_stock_principal = 1 THEN 0 
              ELSE 1 
            END,
            sucursal ASC
        `;
        const sucursales = await executeQuery<ProductoSucursal[]>(querySucursales, [producto.id]);

        return {
          ...producto,
          sucursales: sucursales
        };
      })
    );

    res.json({
      success: true,
      data: productosConSucursales,
      count: productosConSucursales.length
    });
  } catch (error) {
    console.error('Error al obtener productos con sucursales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos con sucursales',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener productos de una sucursal específica (con stock y precio)
 * GET /api/productos/sucursal/:sucursal
 */
export const obtenerProductosPorSucursal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.params;

    if (!sucursal) {
      res.status(400).json({
        success: false,
        message: 'El parámetro sucursal es requerido'
      });
      return;
    }

    const sucursalValida = await validarSucursal(sucursal);
    if (!sucursalValida) {
      res.status(400).json({
        success: false,
        message: `Sucursal inválida: "${sucursal}". La sucursal no existe en el sistema.`
      });
      return;
    }

    const query = `
      SELECT 
        p.id,
        p.nombre,
        p.marca,
        p.tipo,
        p.calidad,
        p.codigo_barras,
        ps.stock,
        ps.precio,
        ps.stock_minimo,
        ps.es_stock_principal,
        CASE 
          WHEN ps.stock <= ps.stock_minimo THEN 1 
          ELSE 0 
        END as tiene_stock_bajo,
        p.activo,
        p.created_at,
        p.updated_at
      FROM productos p
      INNER JOIN productos_sucursal ps ON p.id = ps.producto_id
      WHERE ps.sucursal = ?
      ORDER BY p.nombre ASC
    `;

    const productos = await executeQuery<ProductoCompleto[]>(query, [sucursal.toLowerCase()]);

    res.json({
      success: true,
      data: productos,
      count: productos.length,
      sucursal: sucursal.toLowerCase()
    });
  } catch (error) {
    console.error('Error al obtener productos por sucursal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos de la sucursal',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener un producto específico con información de todas las sucursales
 * GET /api/productos/:id
 */
export const obtenerProductoPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de producto inválido'
      });
      return;
    }

    // Obtener información del producto
    const queryProducto = `
      SELECT * FROM productos WHERE id = ?
    `;
    const productos = await executeQuery<Producto[]>(queryProducto, [id]);

    if (productos.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
      return;
    }

    // Obtener información de todas las sucursales para este producto
    const querySucursales = `
      SELECT 
        sucursal,
        stock,
        precio,
        stock_minimo,
        es_stock_principal,
        activo,
        updated_at
      FROM productos_sucursal
      WHERE producto_id = ?
      ORDER BY 
        CASE 
          WHEN es_stock_principal = 1 THEN 0 
          ELSE 1 
        END,
        sucursal ASC
    `;
    const sucursales = await executeQuery<ProductoSucursal[]>(querySucursales, [id]);

    res.json({
      success: true,
      data: {
        ...productos[0],
        sucursales: sucursales
      }
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Crear un nuevo producto
 * POST /api/productos
 */
export const crearProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const productoData: ProductoInput = req.body;

    // Validar datos requeridos
    if (!productoData.nombre) {
      res.status(400).json({
        success: false,
        message: 'El nombre del producto es requerido'
      });
      return;
    }

    // Validar código de barras único si se proporciona
    if (productoData.codigo_barras) {
      const queryCheck = `SELECT id FROM productos WHERE codigo_barras = ?`;
      const existente = await executeQuery<Producto[]>(queryCheck, [productoData.codigo_barras]);
      
      if (existente.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Ya existe un producto con ese código de barras'
        });
        return;
      }
    }

    // Insertar producto
    const query = `
      INSERT INTO productos 
      (nombre, marca, tipo, calidad, codigo_barras)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      productoData.nombre,
      productoData.marca || null,
      productoData.tipo || null,
      productoData.calidad || 'Media',
      productoData.codigo_barras || null
    ];

    const resultado = await executeQuery<ResultSetHeader>(query, params);
    const productoId = resultado.insertId;

    // 🆕 CREAR AUTOMÁTICAMENTE REGISTROS EN productos_sucursal PARA TODAS LAS SUCURSALES
    const sucursales = ['maldonado', 'pando', 'rivera', 'melo', 'paysandu', 'salto', 'tacuarembo'];
    
    const querySucursal = `
      INSERT INTO productos_sucursal 
      (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal)
      VALUES (?, ?, 0, 0, 10, ?)
    `;

    // Insertar en cada sucursal
    for (const sucursal of sucursales) {
      const esStockPrincipal = sucursal === 'maldonado'; // Maldonado es el stock principal
      await executeQuery(querySucursal, [productoId, sucursal, esStockPrincipal]);
    }

    // Obtener el producto recién creado
    const productoNuevo = await executeQuery<Producto[]>(
      `SELECT * FROM productos WHERE id = ?`,
      [productoId]
    );

    res.status(201).json({
      success: true,
      data: productoNuevo[0],
      message: 'Producto creado exitosamente y agregado a todas las sucursales'
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Actualizar información básica de un producto
 * PUT /api/productos/:id
 */
export const actualizarProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const productoData: Partial<ProductoInput> = req.body;

    if (isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de producto inválido'
      });
      return;
    }

    // Verificar que el producto existe
    const productoExistente = await executeQuery<Producto[]>(
      `SELECT * FROM productos WHERE id = ?`,
      [id]
    );

    if (productoExistente.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
      return;
    }

    // Validar código de barras único si se proporciona
    if (productoData.codigo_barras) {
      const queryCheck = `SELECT id FROM productos WHERE codigo_barras = ? AND id != ?`;
      const existente = await executeQuery<Producto[]>(queryCheck, [productoData.codigo_barras, id]);
      
      if (existente.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Ya existe otro producto con ese código de barras'
        });
        return;
      }
    }

    // Construir query dinámico
    const campos = [];
    const valores = [];

    if (productoData.nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(productoData.nombre);
    }
    if (productoData.marca !== undefined) {
      campos.push('marca = ?');
      valores.push(productoData.marca || null);
    }
    if (productoData.tipo !== undefined) {
      campos.push('tipo = ?');
      valores.push(productoData.tipo || null);
    }
    if (productoData.calidad !== undefined) {
      campos.push('calidad = ?');
      valores.push(productoData.calidad || null);
    }
    if (productoData.codigo_barras !== undefined) {
      campos.push('codigo_barras = ?');
      valores.push(productoData.codigo_barras || null);
    }

    if (campos.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
      return;
    }

    valores.push(id);

    const query = `
      UPDATE productos 
      SET ${campos.join(', ')}
      WHERE id = ?
    `;

    await executeQuery<ResultSetHeader>(query, valores);

    // Obtener producto actualizado
    const productoActualizado = await executeQuery<Producto[]>(
      `SELECT * FROM productos WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: productoActualizado[0],
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Actualizar stock y precio de un producto en una sucursal
 * PUT /api/productos/:id/sucursal/:sucursal
 */
export const actualizarProductoSucursal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, sucursal } = req.params;
    const data: Partial<ProductoSucursalInput> = req.body;

    if (isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de producto inválido'
      });
      return;
    }

    const sucursalValida = await validarSucursal(sucursal);
    if (!sucursalValida) {
      res.status(400).json({
        success: false,
        message: `Sucursal inválida: "${sucursal}". La sucursal no existe en el sistema.`
      });
      return;
    }

    // Verificar que el producto existe
    const productoExistente = await executeQuery<Producto[]>(
      `SELECT * FROM productos WHERE id = ?`,
      [id]
    );

    if (productoExistente.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
      return;
    }

    // Verificar si ya existe el registro en productos_sucursal
    const registroExistente = await executeQuery<ProductoSucursal[]>(
      `SELECT * FROM productos_sucursal WHERE producto_id = ? AND sucursal = ?`,
      [id, sucursal.toLowerCase()]
    );

    if (registroExistente.length === 0) {
      // Crear registro si no existe
      const queryInsert = `
        INSERT INTO productos_sucursal 
        (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const esStockPrincipal = sucursal.toLowerCase() === 'maldonado' ? 1 : 0;

      await executeQuery<ResultSetHeader>(queryInsert, [
        id,
        sucursal.toLowerCase(),
        data.stock || 0,
        data.precio || 0,
        data.stock_minimo || 10,
        esStockPrincipal
      ]);
    } else {
      // Actualizar registro existente
      const campos = [];
      const valores = [];

      if (data.stock !== undefined) {
        campos.push('stock = ?');
        valores.push(data.stock);
      }
      if (data.precio !== undefined) {
        campos.push('precio = ?');
        valores.push(data.precio);
      }
      if (data.stock_minimo !== undefined) {
        campos.push('stock_minimo = ?');
        valores.push(data.stock_minimo);
      }

      if (campos.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No hay campos para actualizar'
        });
        return;
      }

      valores.push(id, sucursal.toLowerCase());

      const query = `
        UPDATE productos_sucursal 
        SET ${campos.join(', ')}
        WHERE producto_id = ? AND sucursal = ?
      `;

      await executeQuery<ResultSetHeader>(query, valores);
    }

    // Obtener registro actualizado
    const registroActualizado = await executeQuery<ProductoSucursal[]>(
      `SELECT * FROM productos_sucursal WHERE producto_id = ? AND sucursal = ?`,
      [id, sucursal.toLowerCase()]
    );

    res.json({
      success: true,
      data: registroActualizado[0],
      message: 'Stock y precio actualizados exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar producto en sucursal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar stock y precio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Buscar productos por término
 * GET /api/productos/buscar?q=termino&sucursal=pando
 */
export const buscarProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, sucursal } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        message: 'El parámetro de búsqueda "q" es requerido'
      });
      return;
    }

    const termino = `%${q}%`;

    if (sucursal && typeof sucursal === 'string') {
      // Buscar con información de sucursal
      const sucursalValida = await validarSucursal(sucursal);
      if (!sucursalValida) {
        res.status(400).json({
          success: false,
          message: `Sucursal inválida: "${sucursal}". La sucursal no existe en el sistema.`
        });
        return;
      }

      const query = `
        SELECT 
          p.id, p.nombre, p.marca, p.tipo, p.calidad, 
          p.codigo_barras,
          ps.stock, ps.precio, ps.stock_minimo, 
          ps.es_stock_principal,
          CASE 
            WHEN ps.stock <= ps.stock_minimo THEN 1 
            ELSE 0 
          END as tiene_stock_bajo
        FROM productos p
        INNER JOIN productos_sucursal ps ON p.id = ps.producto_id
        WHERE ps.sucursal = ? 
          AND p.activo = 1 
          AND ps.activo = 1
          AND (
            p.nombre LIKE ? OR
            p.marca LIKE ? OR
            p.tipo LIKE ? OR
            p.codigo_barras LIKE ?
          )
        ORDER BY p.nombre ASC
        LIMIT 50
      `;

      const productos = await executeQuery<ProductoCompleto[]>(
        query,
        [sucursal.toLowerCase(), termino, termino, termino, termino]
      );

      res.json({
        success: true,
        data: productos,
        count: productos.length,
        sucursal: sucursal.toLowerCase()
      });
    } else {
      // Buscar solo productos (sin sucursal)
      const query = `
        SELECT 
          id, nombre, marca, tipo, calidad, 
          codigo_barras, activo
        FROM productos
        WHERE (
          nombre LIKE ? OR
          marca LIKE ? OR
          tipo LIKE ? OR
          codigo_barras LIKE ?
        )
        ORDER BY nombre ASC
        LIMIT 50
      `;

      const productos = await executeQuery<Producto[]>(
        query,
        [termino, termino, termino, termino]
      );

      res.json({
        success: true,
        data: productos,
        count: productos.length
      });
    }
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar productos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener categorías (marcas o tipos) para los selectores
 */
export const obtenerCategorias = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo } = req.params; // 'marca', 'tipo' o 'calidad'

    if (tipo !== 'marca' && tipo !== 'tipo' && tipo !== 'calidad') {
      res.status(400).json({
        success: false,
        message: 'Tipo inválido. Debe ser "marca", "tipo" o "calidad"'
      });
      return;
    }

    const query = `
      SELECT id, valor
      FROM categorias_productos
      WHERE tipo = ?
      ORDER BY valor ASC
    `;

    const categorias = await executeQuery<RowDataPacket[]>(query, [tipo]);

    res.json({
      success: true,
      data: categorias, // Devolver array con { id, valor }
      count: categorias.length
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Agregar nueva categoría (marca o tipo)
 */
export const agregarCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo, valor } = req.body;

    // Validaciones
    if (!tipo || !valor) {
      res.status(400).json({
        success: false,
        message: 'Tipo y valor son requeridos'
      });
      return;
    }

    if (tipo !== 'marca' && tipo !== 'tipo' && tipo !== 'calidad') {
      res.status(400).json({
        success: false,
        message: 'Tipo inválido. Debe ser "marca", "tipo" o "calidad"'
      });
      return;
    }

    if (typeof valor !== 'string' || valor.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'El valor debe ser un texto válido'
      });
      return;
    }

    const valorLimpio = valor.trim();

    // Insertar en la base de datos
    const query = `
      INSERT INTO categorias_productos (tipo, valor)
      VALUES (?, ?)
    `;

    const result = await executeQuery<ResultSetHeader>(query, [tipo, valorLimpio]);

    if (result.affectedRows > 0) {
      const nombreCategoria = tipo === 'marca' ? 'Marca' : tipo === 'tipo' ? 'Tipo' : 'Calidad';
      res.status(201).json({
        success: true,
        message: `${nombreCategoria} agregado exitosamente`,
        data: {
          id: result.insertId,
          tipo,
          valor: valorLimpio
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'No se pudo agregar la categoría'
      });
    }
  } catch (error: any) {
    console.error('Error al agregar categoría:', error);
    
    // Manejar error de duplicado
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        success: false,
        message: 'Esta categoría ya existe'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error al agregar categoría',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Editar una categoría existente (marca, tipo o calidad)
 * PUT /api/productos/categoria
 */
export const editarCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, tipo, valorNuevo } = req.body;

    // Validaciones
    if (!id || !tipo || !valorNuevo) {
      res.status(400).json({
        success: false,
        message: 'ID, tipo y valor nuevo son requeridos'
      });
      return;
    }

    if (tipo !== 'marca' && tipo !== 'tipo' && tipo !== 'calidad') {
      res.status(400).json({
        success: false,
        message: 'Tipo inválido. Debe ser "marca", "tipo" o "calidad"'
      });
      return;
    }

    if (typeof valorNuevo !== 'string' || valorNuevo.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'El valor nuevo debe ser un texto válido'
      });
      return;
    }

    const valorLimpio = valorNuevo.trim();

    // Actualizar en la base de datos
    const query = `
      UPDATE categorias_productos 
      SET valor = ? 
      WHERE id = ? AND tipo = ?
    `;

    const result = await executeQuery<ResultSetHeader>(query, [valorLimpio, id, tipo]);

    if (result.affectedRows > 0) {
      const nombreCategoria = tipo === 'marca' ? 'Marca' : tipo === 'tipo' ? 'Tipo' : 'Calidad';
      res.json({
        success: true,
        message: `${nombreCategoria} actualizado exitosamente`,
        data: {
          id,
          tipo,
          valor: valorLimpio
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
  } catch (error: any) {
    console.error('Error al editar categoría:', error);
    
    // Manejar error de duplicado
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        success: false,
        message: 'Ya existe una categoría con este nombre'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error al editar categoría',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Eliminar una categoría (marca, tipo o calidad)
 * DELETE /api/productos/categoria/:id/:tipo
 */
export const eliminarCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, tipo } = req.params;

    // Validaciones
    if (!id || !tipo) {
      res.status(400).json({
        success: false,
        message: 'ID y tipo son requeridos'
      });
      return;
    }

    if (tipo !== 'marca' && tipo !== 'tipo' && tipo !== 'calidad') {
      res.status(400).json({
        success: false,
        message: 'Tipo inválido. Debe ser "marca", "tipo" o "calidad"'
      });
      return;
    }

    // Verificar si la categoría está en uso
    const columna = tipo === 'marca' ? 'marca' : tipo === 'tipo' ? 'tipo' : 'calidad';
    const queryVerificar = `
      SELECT COUNT(*) as count, valor
      FROM categorias_productos cp
      LEFT JOIN productos p ON p.${columna} = cp.valor
      WHERE cp.id = ? AND cp.tipo = ?
      GROUP BY cp.valor
    `;
    
    const [categoriaInfo] = await executeQuery<RowDataPacket[]>(queryVerificar, [id, tipo]);
    
    if (!categoriaInfo) {
      res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
      return;
    }

    const valorCategoria = categoriaInfo.valor;
    
    // Verificar si hay productos usando esta categoría
    const queryProductos = `
      SELECT COUNT(*) as count 
      FROM productos 
      WHERE ${columna} = ? AND activo = 1
    `;
    
    const [productosUsando] = await executeQuery<RowDataPacket[]>(queryProductos, [valorCategoria]);
    
    if (productosUsando && productosUsando.count > 0) {
      const nombreCategoria = tipo === 'marca' ? 'marca' : tipo === 'tipo' ? 'tipo' : 'calidad';
      res.status(409).json({
        success: false,
        message: `No se puede eliminar esta ${nombreCategoria} porque ${productosUsando.count} producto(s) la están usando`
      });
      return;
    }

    // Eliminar de la base de datos
    const queryEliminar = `
      DELETE FROM categorias_productos 
      WHERE id = ? AND tipo = ?
    `;

    const result = await executeQuery<ResultSetHeader>(queryEliminar, [id, tipo]);

    if (result.affectedRows > 0) {
      const nombreCategoria = tipo === 'marca' ? 'Marca' : tipo === 'tipo' ? 'Tipo' : 'Calidad';
      res.json({
        success: true,
        message: `${nombreCategoria} eliminado exitosamente`
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar categoría',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * ===================================
 * ENDPOINTS PARA TRANSFERENCIAS DINÁMICAS
 * ===================================
 */

/**
 * GET /api/productos/sucursal-principal
 * Obtener la sucursal principal (es_stock_principal = 1)
 */
export const obtenerSucursalPrincipalEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const sucursalPrincipal = await obtenerSucursalPrincipal();
    
    if (!sucursalPrincipal) {
      res.status(404).json({
        success: false,
        message: 'No se encontró una sucursal principal configurada'
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        sucursal: sucursalPrincipal
      }
    });
  } catch (error) {
    console.error('Error al obtener sucursal principal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sucursal principal',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * POST /api/productos/preparar-transferencia
 * Descontar de sucursal principal y agregar a stock_en_transito
 * Body: { producto_id, sucursal_destino, cantidad }
 */
export const prepararTransferencia = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { producto_id, sucursal_destino, cantidad } = req.body;
    
    // Validaciones
    if (!producto_id || !sucursal_destino || !cantidad || cantidad <= 0) {
      res.status(400).json({
        success: false,
        message: 'Datos inválidos: producto_id, sucursal_destino y cantidad son requeridos'
      });
      return;
    }
    
    // Obtener sucursal principal dinámicamente
    const sucursalPrincipal = await obtenerSucursalPrincipal();
    
    if (!sucursalPrincipal) {
      res.status(404).json({
        success: false,
        message: 'No se encontró una sucursal principal configurada'
      });
      return;
    }
    
    await connection.beginTransaction();
    
    // 1. Verificar stock disponible en sucursal principal
    const [stockRows] = await connection.query<RowDataPacket[]>(
      'SELECT stock FROM productos_sucursal WHERE producto_id = ? AND sucursal = ?',
      [producto_id, sucursalPrincipal]
    );
    
    if (stockRows.length === 0) {
      await connection.rollback();
      res.status(404).json({
        success: false,
        message: `Producto no encontrado en sucursal principal (${sucursalPrincipal})`
      });
      return;
    }
    
    const stockDisponible = stockRows[0].stock;
    
    if (stockDisponible < cantidad) {
      await connection.rollback();
      res.status(400).json({
        success: false,
        message: `Stock insuficiente en ${sucursalPrincipal}. Disponible: ${stockDisponible}, Solicitado: ${cantidad}`
      });
      return;
    }
    
    // 2. Descontar de sucursal principal
    await connection.query(
      'UPDATE productos_sucursal SET stock = stock - ? WHERE producto_id = ? AND sucursal = ?',
      [cantidad, producto_id, sucursalPrincipal]
    );
    
    // 3. Agregar a stock_en_transito en sucursal destino
    await connection.query(
      'UPDATE productos_sucursal SET stock_en_transito = stock_en_transito + ? WHERE producto_id = ? AND sucursal = ?',
      [cantidad, producto_id, sucursal_destino]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: `Transferencia preparada: ${cantidad} unidades de ${sucursalPrincipal} a ${sucursal_destino}`,
      data: {
        producto_id,
        sucursal_origen: sucursalPrincipal,
        sucursal_destino,
        cantidad,
        stock_restante: stockDisponible - cantidad
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error al preparar transferencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al preparar transferencia',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    connection.release();
  }
};

/**
 * POST /api/productos/confirmar-transferencia
 * Pasar de stock_en_transito a stock real
 * Body: { transferencias: [{ producto_id, sucursal, cantidad }] }
 */
export const confirmarTransferencia = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { transferencias } = req.body;
    
    if (!Array.isArray(transferencias) || transferencias.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Datos inválidos: se requiere un array de transferencias'
      });
      return;
    }
    
    await connection.beginTransaction();
    
    // Obtener sucursal principal para el historial
    const sucursalOrigen = await obtenerSucursalPrincipal();
    const usuarioEmail = req.usuario?.email || 'sistema';
    
    for (const transfer of transferencias) {
      const { producto_id, sucursal, cantidad } = transfer;
      
      // Verificar que hay suficiente stock_en_transito
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT stock_en_transito FROM productos_sucursal WHERE producto_id = ? AND sucursal = ?',
        [producto_id, sucursal]
      );
      
      if (rows.length === 0 || rows[0].stock_en_transito < cantidad) {
        await connection.rollback();
        res.status(400).json({
          success: false,
          message: `Stock en tránsito insuficiente para producto ${producto_id} en ${sucursal}`
        });
        return;
      }
      
      // Obtener nombre del producto para el historial
      const [productoRows] = await connection.query<RowDataPacket[]>(
        'SELECT nombre FROM productos WHERE id = ?',
        [producto_id]
      );
      const productoNombre = productoRows.length > 0 ? productoRows[0].nombre : 'Desconocido';
      
      // Pasar de stock_en_transito a stock
      await connection.query(
        `UPDATE productos_sucursal 
         SET stock = stock + ?, 
             stock_en_transito = stock_en_transito - ? 
         WHERE producto_id = ? AND sucursal = ?`,
        [cantidad, cantidad, producto_id, sucursal]
      );
      
      // 📝 Guardar en historial de transferencias
      await connection.query(
        `INSERT INTO historial_transferencias 
         (producto_id, producto_nombre, sucursal_origen, sucursal_destino, cantidad, usuario_email) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [producto_id, productoNombre, sucursalOrigen, sucursal, cantidad, usuarioEmail]
      );
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: `${transferencias.length} transferencias confirmadas exitosamente`,
      data: { transferencias_confirmadas: transferencias.length }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error al confirmar transferencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar transferencia',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    connection.release();
  }
};

/**
 * POST /api/productos/ajustar-transferencia
 * Ajustar cantidad en stock_en_transito (devolver sobrante a principal o descontar más)
 * Body: { producto_id, sucursal_destino, cantidad_anterior, cantidad_nueva }
 */
export const ajustarTransferencia = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { producto_id, sucursal_destino, cantidad_anterior, cantidad_nueva } = req.body;
    
    if (!producto_id || !sucursal_destino || cantidad_anterior === undefined || cantidad_nueva === undefined) {
      res.status(400).json({
        success: false,
        message: 'Datos inválidos'
      });
      return;
    }
    
    const diferencia = cantidad_nueva - cantidad_anterior;
    
    if (diferencia === 0) {
      res.json({
        success: true,
        message: 'Sin cambios',
        data: { diferencia: 0 }
      });
      return;
    }
    
    const sucursalPrincipal = await obtenerSucursalPrincipal();
    
    if (!sucursalPrincipal) {
      res.status(404).json({
        success: false,
        message: 'No se encontró una sucursal principal'
      });
      return;
    }
    
    await connection.beginTransaction();
    
    if (diferencia > 0) {
      // Aumentar: descontar más de principal y agregar a en_transito
      const [stockRows] = await connection.query<RowDataPacket[]>(
        'SELECT stock FROM productos_sucursal WHERE producto_id = ? AND sucursal = ?',
        [producto_id, sucursalPrincipal]
      );
      
      if (stockRows.length === 0 || stockRows[0].stock < diferencia) {
        await connection.rollback();
        res.status(400).json({
          success: false,
          message: `Stock insuficiente en ${sucursalPrincipal}`
        });
        return;
      }
      
      await connection.query(
        'UPDATE productos_sucursal SET stock = stock - ? WHERE producto_id = ? AND sucursal = ?',
        [diferencia, producto_id, sucursalPrincipal]
      );
      
      await connection.query(
        'UPDATE productos_sucursal SET stock_en_transito = stock_en_transito + ? WHERE producto_id = ? AND sucursal = ?',
        [diferencia, producto_id, sucursal_destino]
      );
      
    } else {
      // Disminuir: devolver a principal y quitar de en_transito
      const cantidadDevolver = Math.abs(diferencia);
      
      await connection.query(
        'UPDATE productos_sucursal SET stock = stock + ? WHERE producto_id = ? AND sucursal = ?',
        [cantidadDevolver, producto_id, sucursalPrincipal]
      );
      
      await connection.query(
        'UPDATE productos_sucursal SET stock_en_transito = stock_en_transito - ? WHERE producto_id = ? AND sucursal = ?',
        [cantidadDevolver, producto_id, sucursal_destino]
      );
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: `Transferencia ajustada: ${diferencia > 0 ? '+' : ''}${diferencia} unidades`,
      data: {
        producto_id,
        sucursal_origen: sucursalPrincipal,
        sucursal_destino,
        diferencia,
        cantidad_nueva
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error al ajustar transferencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al ajustar transferencia',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    connection.release();
  }
};

/**
 * GET /api/productos/historial-transferencias
 * Obtener historial de transferencias con filtros opcionales
 * Query params: fecha_desde, fecha_hasta, sucursal_destino
 */
export const obtenerHistorialTransferencias = async (req: Request, res: Response): Promise<void> => {
  console.log('📋 Endpoint historial-transferencias llamado');
  console.log('Query params:', req.query);
  console.log('Headers:', req.headers.authorization);
  
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    const { fecha_desde, fecha_hasta, sucursal_destino } = req.query;
    
    let query = `
      SELECT 
        id,
        producto_id,
        producto_nombre,
        sucursal_origen,
        sucursal_destino,
        cantidad,
        usuario_email,
        fecha_envio
      FROM historial_transferencias
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Filtro por fecha desde
    if (fecha_desde) {
      query += ` AND fecha_envio >= ?`;
      params.push(fecha_desde);
      console.log('📅 Filtro fecha_desde:', fecha_desde);
    }
    
    // Filtro por fecha hasta
    if (fecha_hasta) {
      query += ` AND fecha_envio <= DATE_ADD(?, INTERVAL 1 DAY)`;
      params.push(fecha_hasta);
      console.log('📅 Filtro fecha_hasta:', fecha_hasta);
    }
    
    // Filtro por sucursal destino
    if (sucursal_destino && sucursal_destino !== 'todas') {
      query += ` AND sucursal_destino = ?`;
      params.push(sucursal_destino);
      console.log('🏢 Filtro sucursal_destino:', sucursal_destino);
    }
    
    query += ` ORDER BY fecha_envio DESC`;
    
    console.log('🔍 Query SQL:', query);
    console.log('🔍 Params:', params);
    
    const [rows] = await connection.query<RowDataPacket[]>(query, params);
    
    console.log('✅ Registros encontrados:', rows.length);
    
    res.status(200).json({
      success: true,
      data: rows,
      total: rows.length
    });
    
  } catch (error) {
    console.error('❌ Error al obtener historial de transferencias:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de transferencias',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * Obtener inventario completo (productos con stock por sucursal en formato plano)
 * GET /api/productos/inventario
 * Query params: sucursal, marca, tipo
 */
export const obtenerInventario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, marca, tipo } = req.query;

    let query = `
      SELECT 
        p.id as producto_id,
        p.nombre as producto,
        p.marca,
        p.tipo as modelo,
        ps.sucursal,
        ps.stock,
        ps.stock_en_transito as recibidos,
        ps.precio,
        ps.stock_minimo,
        ps.updated_at
      FROM productos p
      INNER JOIN productos_sucursal ps ON p.id = ps.producto_id
      WHERE p.activo = 1 AND ps.activo = 1
    `;

    const params: any[] = [];

    // Filtro por sucursal
    if (sucursal && sucursal !== 'all') {
      query += ` AND ps.sucursal = ?`;
      params.push(sucursal);
    }

    // Filtro por marca
    if (marca && marca !== 'all') {
      query += ` AND p.marca = ?`;
      params.push(marca);
    }

    // Filtro por tipo (modelo)
    if (tipo && tipo !== 'all') {
      query += ` AND p.tipo = ?`;
      params.push(tipo);
    }

    query += ` ORDER BY ps.sucursal ASC, p.marca ASC, p.nombre ASC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });

  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inventario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener marcas y modelos únicos de productos
 * GET /api/productos/filtros
 * Query params opcionales:
 *  - sucursal: filtrar por sucursal específica
 */
export const obtenerFiltrosProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.query;

    // Query para obtener marcas únicas
    let queryMarcas = `
      SELECT DISTINCT p.marca
      FROM productos p
      INNER JOIN productos_sucursal ps ON p.id = ps.producto_id
      WHERE p.activo = 1 AND ps.activo = 1 AND p.marca IS NOT NULL AND p.marca != ''
    `;

    // Query para obtener modelos (tipo) únicos
    let queryModelos = `
      SELECT DISTINCT p.tipo
      FROM productos p
      INNER JOIN productos_sucursal ps ON p.id = ps.producto_id
      WHERE p.activo = 1 AND ps.activo = 1 AND p.tipo IS NOT NULL AND p.tipo != ''
    `;

    const params: any[] = [];

    // Si se especifica sucursal, filtrar por ella
    if (sucursal && sucursal !== 'all') {
      queryMarcas += ` AND ps.sucursal = ?`;
      queryModelos += ` AND ps.sucursal = ?`;
      params.push(sucursal);
    }

    queryMarcas += ` ORDER BY p.marca ASC`;
    queryModelos += ` ORDER BY p.tipo ASC`;

    // Ejecutar ambas queries
    const [marcas] = await pool.query<RowDataPacket[]>(queryMarcas, params);
    const [modelos] = await pool.query<RowDataPacket[]>(queryModelos, params);

    // Extraer solo los valores
    const marcasUnicas = marcas.map(row => row.marca).filter(Boolean);
    const modelosUnicos = modelos.map(row => row.tipo).filter(Boolean);

    res.json({
      success: true,
      data: {
        marcas: marcasUnicas,
        modelos: modelosUnicos
      }
    });

  } catch (error) {
    console.error('Error al obtener filtros de productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener filtros de productos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

