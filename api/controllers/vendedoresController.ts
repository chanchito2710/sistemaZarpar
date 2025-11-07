/**
 * Controlador para gestión de vendedores
 * Maneja todas las operaciones relacionadas con vendedores del sistema
 */

import { Request, Response } from 'express';
import { executeQuery } from '../config/database';
import pool from '../config/database';

/**
 * Interfaz para el tipo Vendedor
 */
interface Vendedor {
  id: number;
  nombre: string;
  cargo: string;
  sucursal: string;
  telefono?: string;
  email?: string;
  fecha_ingreso?: Date;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Obtener todos los vendedores activos
 * GET /api/vendedores
 */
export const obtenerVendedores = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendedores = await executeQuery<Vendedor[]>(
      'SELECT * FROM vendedores WHERE activo = 1 ORDER BY nombre ASC'
    );

    res.json({
      success: true,
      data: vendedores,
      message: 'Vendedores obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener vendedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener vendedores',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener vendedores por sucursal
 * GET /api/vendedores/sucursal/:sucursal
 */
export const obtenerVendedoresPorSucursal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.params;

    if (!sucursal) {
      res.status(400).json({
        success: false,
        message: 'El parámetro sucursal es requerido'
      });
      return;
    }

    const vendedores = await executeQuery<Vendedor[]>(
      'SELECT * FROM vendedores WHERE sucursal = ? AND activo = 1 ORDER BY nombre ASC',
      [sucursal.toLowerCase()]
    );

    res.json({
      success: true,
      data: vendedores,
      message: `Vendedores de sucursal ${sucursal} obtenidos exitosamente`
    });
  } catch (error) {
    console.error('Error al obtener vendedores por sucursal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener vendedores por sucursal',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener un vendedor por ID
 * GET /api/vendedores/:id
 */
export const obtenerVendedorPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de vendedor inválido'
      });
      return;
    }

    const vendedores = await executeQuery<Vendedor[]>(
      'SELECT * FROM vendedores WHERE id = ?',
      [id]
    );

    if (vendedores.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado'
      });
      return;
    }

    res.json({
      success: true,
      data: vendedores[0],
      message: 'Vendedor obtenido exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener vendedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener vendedor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Crear un nuevo vendedor
 * POST /api/vendedores
 * Requiere autenticación y permisos de administrador
 */
export const crearVendedor = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📥 Datos recibidos en backend:', req.body);
    
    const { nombre, cargo, sucursal, telefono, email, password } = req.body;

    // Validar campos requeridos
    if (!nombre || !cargo || !sucursal || !email || !password) {
      console.log('❌ Faltan campos requeridos');
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: nombre, cargo, sucursal, email, password'
      });
      return;
    }

    console.log('✅ Todos los campos requeridos presentes');

    // Validar que el email no exista ya
    const existentes = await executeQuery<Vendedor[]>(
      'SELECT * FROM vendedores WHERE email = ?',
      [email]
    );

    if (existentes.length > 0) {
      console.log('❌ Email ya existe:', email);
      res.status(400).json({
        success: false,
        message: 'Ya existe un vendedor con ese email'
      });
      return;
    }

    console.log('✅ Email disponible');

    // Crear vendedor
    const datosVendedor = {
      nombre,
      cargo,
      sucursal: sucursal.toLowerCase(),
      telefono: telefono || null,
      email,
      password
    };
    
    console.log('💾 Insertando vendedor con datos:', datosVendedor);
    
    const resultado = await executeQuery(
      `INSERT INTO vendedores (nombre, cargo, sucursal, telefono, email, password, activo) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [nombre, cargo, sucursal.toLowerCase(), telefono || null, email, password]
    );

    const vendedorCreado = {
      id: (resultado as any).insertId,
      nombre,
      cargo,
      sucursal: sucursal.toLowerCase(),
      email,
      telefono: telefono || null,
      activo: 1
    };

    console.log('✅ Vendedor creado exitosamente:', vendedorCreado);

    res.status(201).json({
      success: true,
      data: vendedorCreado,
      message: 'Vendedor creado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al crear vendedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear vendedor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Actualizar un vendedor existente
 * PUT /api/vendedores/:id
 * Requiere autenticación y permisos de administrador
 */
export const actualizarVendedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, cargo, sucursal, telefono, email, activo } = req.body;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de vendedor inválido'
      });
      return;
    }

    // Verificar que el vendedor existe
    const vendedores = await executeQuery<Vendedor[]>(
      'SELECT * FROM vendedores WHERE id = ?',
      [id]
    );

    if (vendedores.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado'
      });
      return;
    }

    // Construir query de actualización dinámicamente
    const campos: string[] = [];
    const valores: any[] = [];

    if (nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(nombre);
    }
    if (cargo !== undefined) {
      campos.push('cargo = ?');
      valores.push(cargo);
    }
    if (sucursal !== undefined) {
      campos.push('sucursal = ?');
      valores.push(sucursal.toLowerCase());
    }
    if (telefono !== undefined) {
      campos.push('telefono = ?');
      valores.push(telefono);
    }
    if (email !== undefined) {
      campos.push('email = ?');
      valores.push(email);
    }
    if (activo !== undefined) {
      campos.push('activo = ?');
      valores.push(activo ? 1 : 0);
    }

    if (campos.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
      return;
    }

    // Agregar updated_at
    campos.push('updated_at = NOW()');
    valores.push(id);

    await executeQuery(
      `UPDATE vendedores SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );

    // Obtener vendedor actualizado
    const vendedorActualizado = await executeQuery<Vendedor[]>(
      'SELECT * FROM vendedores WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: vendedorActualizado[0],
      message: 'Vendedor actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar vendedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar vendedor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Eliminar PERMANENTEMENTE un vendedor
 * DELETE /api/vendedores/:id
 * Requiere autenticación y permisos de administrador
 * 
 * ⚠️ ADVERTENCIA: Esta operación ELIMINA PERMANENTEMENTE el registro de la base de datos.
 * Si el vendedor tiene datos relacionados (clientes, ventas), se DESACTIVARÁ en vez de eliminarse.
 */
export const eliminarVendedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de vendedor inválido'
      });
      return;
    }

    // Verificar que el vendedor existe
    const vendedores = await executeQuery<Vendedor[]>(
      'SELECT * FROM vendedores WHERE id = ?',
      [id]
    );

    if (vendedores.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado'
      });
      return;
    }

    const vendedor = vendedores[0];

    // Intentar ELIMINAR PERMANENTEMENTE (HARD DELETE)
    try {
      await executeQuery(
        'DELETE FROM vendedores WHERE id = ?',
        [id]
      );

      console.log(`🗑️ Vendedor ELIMINADO PERMANENTEMENTE: ${vendedor.nombre} (ID: ${id})`);

      res.json({
        success: true,
        message: `Vendedor "${vendedor.nombre}" eliminado permanentemente de la base de datos`,
        data: {
          id: vendedor.id,
          nombre: vendedor.nombre,
          eliminado_permanentemente: true
        }
      });
      return;

    } catch (deleteError: any) {
      // Si falla por Foreign Key Constraint, hacer SOFT DELETE
      if (deleteError.code === 'ER_ROW_IS_REFERENCED_2' || deleteError.errno === 1451) {
        console.log(`⚠️ No se puede eliminar permanentemente a "${vendedor.nombre}" porque tiene datos relacionados. Haciendo soft delete...`);

        // Desactivar en vez de eliminar
    await executeQuery(
      'UPDATE vendedores SET activo = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
          message: `⚠️ El vendedor "${vendedor.nombre}" tiene clientes o ventas asociadas. Se ha DESACTIVADO en vez de eliminarse permanentemente para preservar el historial.`,
          data: {
            id: vendedor.id,
            nombre: vendedor.nombre,
            eliminado_permanentemente: false,
            desactivado: true,
            razon: 'Tiene datos relacionados (clientes o ventas)'
          }
        });
        return;
      }

      // Si es otro tipo de error, lanzarlo
      throw deleteError;
    }

  } catch (error: any) {
    console.error('❌ Error al eliminar vendedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar vendedor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener lista de todas las sucursales disponibles
 * GET /api/vendedores/sucursales/lista
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
    
    // Extraer nombres de sucursales (quitar "clientes_")
    const sucursales = tablasArray
      .map(tabla => tabla.TABLE_NAME.replace('clientes_', ''))
      .filter(nombre => nombre.toLowerCase() !== 'administrador'); // Filtrar "administrador"

    res.json({
      success: true,
      data: sucursales,
      message: 'Sucursales obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sucursales',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};



/**
 * Actualizar estado de comisiones de un vendedor
 * PUT /api/vendedores/:id/comisiones
 */
export const actualizarEstadoComisiones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { cobra_comisiones } = req.body;
    
    // Validar que cobra_comisiones sea un booleano o número (0 o 1)
    if (cobra_comisiones === undefined || cobra_comisiones === null) {
      res.status(400).json({
        success: false,
        message: 'El campo cobra_comisiones es requerido'
      });
      return;
    }
    
    const cobraComisionesValue = cobra_comisiones ? 1 : 0;
    
    // Verificar que el vendedor existe
    const queryVendedor = 'SELECT id, nombre FROM vendedores WHERE id = ?';
    const [vendedor] = await executeQuery<RowDataPacket[]>(queryVendedor, [id]);
    
    if (!vendedor) {
      res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado'
      });
      return;
    }
    
    // Actualizar el campo cobra_comisiones
    const queryUpdate = `
      UPDATE vendedores 
      SET cobra_comisiones = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await executeQuery<ResultSetHeader>(queryUpdate, [cobraComisionesValue, id]);
    
    res.status(200).json({
      success: true,
      message: cobraComisionesValue === 1 
        ? `${vendedor.nombre} ahora cobra comisiones` 
        : `${vendedor.nombre} ya NO cobra comisiones`,
      data: {
        id: Number(id),
        cobra_comisiones: cobraComisionesValue
      }
    });
    
  } catch (error) {
    console.error('Error al actualizar estado de comisiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de comisiones',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

