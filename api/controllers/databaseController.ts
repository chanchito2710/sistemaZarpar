/**
 * Controlador para gestión de base de datos
 * Permite interactuar con las tablas de forma genérica
 */

import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, FieldPacket, ResultSetHeader } from 'mysql2';

/**
 * Obtener lista de todas las tablas
 */
export const obtenerTablas = async (req: Request, res: Response): Promise<void> => {
  try {
    const [tables] = await pool.execute<RowDataPacket[]>('SHOW TABLES');
    
    const tableNames = tables.map(table => Object.values(table)[0] as string);
    
    res.json({
      success: true,
      data: tableNames,
      count: tableNames.length
    });
  } catch (error) {
    console.error('Error al obtener tablas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las tablas'
    });
  }
};

/**
 * Obtener estructura de una tabla
 */
export const obtenerEstructuraTabla = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableName } = req.params;
    
    // Validar nombre de tabla
    const [tables] = await pool.execute<RowDataPacket[]>('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0] as string);
    
    if (!tableNames.includes(tableName)) {
      res.status(404).json({
        success: false,
        error: 'Tabla no encontrada'
      });
      return;
    }
    
    // Obtener estructura
    const [columns] = await pool.execute<RowDataPacket[]>(`DESCRIBE \`${tableName}\``);
    
    // Obtener conteo de registros
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM \`${tableName}\``
    );
    const count = countResult[0].total;
    
    res.json({
      success: true,
      data: {
        tableName,
        columns,
        recordCount: count
      }
    });
  } catch (error) {
    console.error('Error al obtener estructura:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la estructura de la tabla'
    });
  }
};

/**
 * Obtener registros de una tabla con paginación
 */
export const obtenerRegistros = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableName } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    
    // Validar nombre de tabla
    const [tables] = await pool.execute<RowDataPacket[]>('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0] as string);
    
    if (!tableNames.includes(tableName)) {
      res.status(404).json({
        success: false,
        error: 'Tabla no encontrada'
      });
      return;
    }
    
    let query = `SELECT * FROM \`${tableName}\``;
    let countQuery = `SELECT COUNT(*) as total FROM \`${tableName}\``;
    const params: any[] = [];
    
    // Si hay búsqueda, agregar WHERE dinámico
    if (search && search.trim()) {
      const [columns] = await pool.execute<RowDataPacket[]>(`DESCRIBE \`${tableName}\``);
      const searchConditions = columns
        .map(col => `\`${col.Field}\` LIKE ?`)
        .join(' OR ');
      
      if (searchConditions) {
        query += ` WHERE ${searchConditions}`;
        countQuery += ` WHERE ${searchConditions}`;
        
        // Agregar parámetros de búsqueda
        columns.forEach(() => params.push(`%${search}%`));
      }
    }
    
    // Usar interpolación para LIMIT y OFFSET en lugar de placeholders
    query += ` LIMIT ${limit} OFFSET ${offset}`;
    
    // Obtener registros
    const [records] = await pool.execute<RowDataPacket[]>(query, params);
    
    // Obtener total
    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, params);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener registros:', error);
    console.error('Detalles:', (error as Error).message);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los registros',
      details: (error as Error).message
    });
  }
};

/**
 * Obtener un registro específico por ID
 */
export const obtenerRegistroPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableName, id } = req.params;
    
    // Validar nombre de tabla
    const [tables] = await pool.execute<RowDataPacket[]>('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0] as string);
    
    if (!tableNames.includes(tableName)) {
      res.status(404).json({
        success: false,
        error: 'Tabla no encontrada'
      });
      return;
    }
    
    const [records] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM \`${tableName}\` WHERE id = ?`,
      [id]
    );
    
    if (records.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Registro no encontrado'
      });
      return;
    }
    
    res.json({
      success: true,
      data: records[0]
    });
  } catch (error) {
    console.error('Error al obtener registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el registro'
    });
  }
};

/**
 * Actualizar un registro
 */
export const actualizarRegistro = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableName, id } = req.params;
    const updateData = req.body;
    
    // Validar nombre de tabla
    const [tables] = await pool.execute<RowDataPacket[]>('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0] as string);
    
    if (!tableNames.includes(tableName)) {
      res.status(404).json({
        success: false,
        error: 'Tabla no encontrada'
      });
      return;
    }
    
    // Filtrar campos a actualizar (excluir id, created_at, updated_at y campos vacíos)
    const excludedFields = ['id', 'created_at', 'updated_at'];
    const fields = Object.keys(updateData).filter(key => !excludedFields.includes(key));
    
    if (fields.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No hay campos para actualizar'
      });
      return;
    }
    
    // Construir query de actualización
    const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
    const values = fields.map(field => {
      // Convertir strings vacíos a null para campos que pueden ser nulos
      const value = updateData[field];
      if (value === '' || value === undefined) {
        return null;
      }
      return value;
    });
    
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE \`${tableName}\` SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    
    if (result.affectedRows === 0) {
      res.status(404).json({
        success: false,
        error: 'Registro no encontrado'
      });
      return;
    }
    
    // Obtener el registro actualizado
    const [updatedRecord] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM \`${tableName}\` WHERE id = ?`,
      [id]
    );
    
    res.json({
      success: true,
      message: 'Registro actualizado exitosamente',
      data: updatedRecord[0]
    });
  } catch (error) {
    console.error('Error al actualizar registro:', error);
    console.error('Detalles del error:', (error as Error).message);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el registro',
      details: (error as Error).message
    });
  }
};

/**
 * Crear un nuevo registro
 */
export const crearRegistro = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableName } = req.params;
    const newData = req.body;
    
    // Validar nombre de tabla
    const [tables] = await pool.execute<RowDataPacket[]>('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0] as string);
    
    if (!tableNames.includes(tableName)) {
      res.status(404).json({
        success: false,
        error: 'Tabla no encontrada'
      });
      return;
    }
    
    // Filtrar campos (excluir id, created_at, updated_at)
    const excludedFields = ['id', 'created_at', 'updated_at'];
    const fields = Object.keys(newData).filter(key => !excludedFields.includes(key));
    
    if (fields.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No hay datos para insertar'
      });
      return;
    }
    
    // Construir query de inserción
    const fieldList = fields.map(f => `\`${f}\``).join(', ');
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(field => {
      // Convertir strings vacíos a null para campos que pueden ser nulos
      const value = newData[field];
      if (value === '' || value === undefined) {
        return null;
      }
      return value;
    });
    
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO \`${tableName}\` (${fieldList}) VALUES (${placeholders})`,
      values
    );
    
    // Obtener el registro creado
    const [newRecord] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM \`${tableName}\` WHERE id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Registro creado exitosamente',
      data: newRecord[0]
    });
  } catch (error) {
    console.error('Error al crear registro:', error);
    console.error('Detalles del error:', (error as Error).message);
    res.status(500).json({
      success: false,
      error: 'Error al crear el registro',
      details: (error as Error).message
    });
  }
};

/**
 * Crear una nueva tabla
 */
export const crearTabla = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableName, columns } = req.body;
    
    if (!tableName || !columns || columns.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Nombre de tabla y columnas son requeridos'
      });
      return;
    }
    
    // Construir definición de columnas
    let columnDefinitions = columns.map((col: any) => {
      let definition = `\`${col.name}\` ${col.type}`;
      
      if (col.length) {
        definition += `(${col.length})`;
      }
      
      if (col.notNull) {
        definition += ' NOT NULL';
      }
      
      if (col.autoIncrement) {
        definition += ' AUTO_INCREMENT';
      }
      
      if (col.default !== undefined && col.default !== '') {
        definition += ` DEFAULT ${col.default}`;
      }
      
      return definition;
    }).join(', ');
    
    // Agregar primary key
    const primaryKey = columns.find((col: any) => col.primaryKey);
    if (primaryKey) {
      columnDefinitions += `, PRIMARY KEY (\`${primaryKey.name}\`)`;
    }
    
    const createTableQuery = `CREATE TABLE \`${tableName}\` (${columnDefinitions})`;
    
    await pool.execute(createTableQuery);
    
    res.status(201).json({
      success: true,
      message: `Tabla ${tableName} creada exitosamente`
    });
  } catch (error) {
    console.error('Error al crear tabla:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear la tabla',
      details: (error as Error).message
    });
  }
};

/**
 * Agregar columna a una tabla existente
 */
export const agregarColumna = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableName } = req.params;
    const { columnName, columnType, length, notNull, defaultValue, afterColumn } = req.body;
    
    // Validar nombre de tabla
    const [tables] = await pool.execute<RowDataPacket[]>('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0] as string);
    
    if (!tableNames.includes(tableName)) {
      res.status(404).json({
        success: false,
        error: 'Tabla no encontrada'
      });
      return;
    }
    
    // Construir definición de columna
    let columnDef = `\`${columnName}\` ${columnType}`;
    
    if (length) {
      columnDef += `(${length})`;
    }
    
    if (notNull) {
      columnDef += ' NOT NULL';
    }
    
    if (defaultValue !== undefined && defaultValue !== '') {
      if (defaultValue === 'CURRENT_TIMESTAMP') {
        columnDef += ' DEFAULT CURRENT_TIMESTAMP';
      } else if (defaultValue === 'NULL') {
        columnDef += ' DEFAULT NULL';
      } else {
        columnDef += ` DEFAULT '${defaultValue}'`;
      }
    }
    
    let query = `ALTER TABLE \`${tableName}\` ADD COLUMN ${columnDef}`;
    
    if (afterColumn) {
      query += ` AFTER \`${afterColumn}\``;
    }
    
    await pool.execute(query);
    
    res.json({
      success: true,
      message: `Columna ${columnName} agregada exitosamente`
    });
  } catch (error) {
    console.error('Error al agregar columna:', error);
    res.status(500).json({
      success: false,
      error: 'Error al agregar la columna',
      details: (error as Error).message
    });
  }
};

/**
 * Modificar columna existente
 */
export const modificarColumna = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableName, columnName } = req.params;
    const { newName, columnType, length, notNull, defaultValue } = req.body;
    
    // Validar nombre de tabla
    const [tables] = await pool.execute<RowDataPacket[]>('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0] as string);
    
    if (!tableNames.includes(tableName)) {
      res.status(404).json({
        success: false,
        error: 'Tabla no encontrada'
      });
      return;
    }
    
    // Construir definición de columna
    const finalName = newName || columnName;
    let columnDef = `\`${finalName}\` ${columnType}`;
    
    if (length) {
      columnDef += `(${length})`;
    }
    
    if (notNull) {
      columnDef += ' NOT NULL';
    }
    
    if (defaultValue !== undefined && defaultValue !== '') {
      if (defaultValue === 'CURRENT_TIMESTAMP') {
        columnDef += ' DEFAULT CURRENT_TIMESTAMP';
      } else if (defaultValue === 'NULL') {
        columnDef += ' DEFAULT NULL';
      } else {
        columnDef += ` DEFAULT '${defaultValue}'`;
      }
    }
    
    const query = `ALTER TABLE \`${tableName}\` CHANGE \`${columnName}\` ${columnDef}`;
    
    await pool.execute(query);
    
    res.json({
      success: true,
      message: `Columna ${columnName} modificada exitosamente`
    });
  } catch (error) {
    console.error('Error al modificar columna:', error);
    res.status(500).json({
      success: false,
      error: 'Error al modificar la columna',
      details: (error as Error).message
    });
  }
};

/**
 * Eliminar columna
 */
export const eliminarColumna = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableName, columnName } = req.params;
    
    // Validar nombre de tabla
    const [tables] = await pool.execute<RowDataPacket[]>('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0] as string);
    
    if (!tableNames.includes(tableName)) {
      res.status(404).json({
        success: false,
        error: 'Tabla no encontrada'
      });
      return;
    }
    
    await pool.execute(`ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``);
    
    res.json({
      success: true,
      message: `Columna ${columnName} eliminada exitosamente`
    });
  } catch (error) {
    console.error('Error al eliminar columna:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar la columna',
      details: (error as Error).message
    });
  }
};

/**
 * Eliminar tabla completa
 */
export const eliminarTabla = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableName } = req.params;
    
    // Validar nombre de tabla
    const [tables] = await pool.execute<RowDataPacket[]>('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0] as string);
    
    if (!tableNames.includes(tableName)) {
      res.status(404).json({
        success: false,
        error: 'Tabla no encontrada'
      });
      return;
    }
    
    await pool.execute(`DROP TABLE \`${tableName}\``);
    
    res.json({
      success: true,
      message: `Tabla ${tableName} eliminada exitosamente`
    });
  } catch (error) {
    console.error('Error al eliminar tabla:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar la tabla',
      details: (error as Error).message
    });
  }
};

/**
 * Eliminar un registro (soft delete - cambiar activo a 0)
 */
export const eliminarRegistro = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableName, id } = req.params;
    
    // Validar nombre de tabla
    const [tables] = await pool.execute<RowDataPacket[]>('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0] as string);
    
    if (!tableNames.includes(tableName)) {
      res.status(404).json({
        success: false,
        error: 'Tabla no encontrada'
      });
      return;
    }
    
    // 🔹 SOFT DELETE para tabla vendedores (tiene foreign keys)
    if (tableName === 'vendedores') {
      // Marcar como inactivo en lugar de eliminar
      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE \`${tableName}\` SET activo = 0 WHERE id = ?`,
        [id]
      );
      
      if (result.affectedRows === 0) {
        res.status(404).json({
          success: false,
          error: 'Registro no encontrado'
        });
        return;
      }
      
      res.json({
        success: true,
        message: '✅ Vendedor desactivado exitosamente (soft delete)'
      });
      return;
    }
    
    // ⚠️ HARD DELETE - Eliminación permanente para otras tablas
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `DELETE FROM \`${tableName}\` WHERE id = ?`,
        [id]
      );
      
      if (result.affectedRows === 0) {
        res.status(404).json({
          success: false,
          error: 'Registro no encontrado'
        });
        return;
      }
      
      res.json({
        success: true,
        message: '⚠️ Registro eliminado permanentemente'
      });
    } catch (deleteError: any) {
      // Si falla por foreign key constraint
      if (deleteError.code === 'ER_ROW_IS_REFERENCED_2') {
        res.status(400).json({
          success: false,
          error: 'No se puede eliminar este registro porque está siendo referenciado por otros registros',
          details: 'Este registro tiene relaciones activas con otros datos del sistema'
        });
      } else {
        throw deleteError;
      }
    }
  } catch (error: any) {
    console.error('Error al eliminar registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar el registro',
      details: error.message
    });
  }
};

