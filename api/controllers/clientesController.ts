/**
 * Controlador para gestión de clientes
 * Maneja todas las operaciones relacionadas con clientes por sucursal
 */

import { Request, Response } from 'express';
import { executeQuery, pool } from '../config/database';
import { tablaClientesExiste } from '../utils/database.js';

/**
 * Interfaz para el tipo Cliente
 */
interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  nombre_fantasia?: string;
  rut?: string;
  direccion?: string;
  email?: string;
  razon_social?: string;
  telefono?: string;
  vendedor_id?: number;
  fecha_registro: Date;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interfaz para crear/actualizar cliente
 */
interface ClienteInput {
  nombre: string;
  apellido: string;
  telefono: string; // Campo requerido
  nombre_fantasia?: string;
  rut?: string;
  direccion?: string;
  email?: string;
  razon_social?: string;
  vendedor_id?: number;
}

/**
 * Validar nombre de sucursal y obtener nombre de tabla
 * DINÁMICO: Verifica que la tabla exista en la base de datos
 */
const obtenerNombreTabla = async (sucursal: string): Promise<string | null> => {
  try {
    const sucursalNormalizada = sucursal.toLowerCase().trim();
    const nombreTabla = `clientes_${sucursalNormalizada}`;
    
    // Usar función helper de database.ts para verificar existencia
    const existe = await tablaClientesExiste(sucursalNormalizada);
    
    if (existe) {
      console.log(`✅ Tabla ${nombreTabla} validada para operación de clientes`);
      // Retornar el nombre con backticks para seguridad SQL
      return `\`${nombreTabla}\``;
    }
    
    console.log(`❌ Tabla ${nombreTabla} NO existe`);
    return null;
  } catch (error) {
    console.error('❌ Error al verificar tabla de clientes:', error);
    return null;
  }
};

/**
 * Obtener clientes por sucursal
 * GET /api/clientes/sucursal/:sucursal
 */
export const obtenerClientesPorSucursal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.params;

    if (!sucursal) {
      res.status(400).json({
        success: false,
        message: 'El parámetro sucursal es requerido'
      });
      return;
    }

    const nombreTabla = await obtenerNombreTabla(sucursal);

    if (!nombreTabla) {
      res.status(400).json({
        success: false,
        message: `Sucursal inválida: "${sucursal}". Verifica que la tabla clientes_${sucursal.toLowerCase()} exista.`
      });
      return;
    }

    // Query con JOIN para obtener información del vendedor
    const query = `
      SELECT 
        c.*,
        v.nombre as vendedor_nombre,
        v.cargo as vendedor_cargo
      FROM ${nombreTabla} c
      LEFT JOIN vendedores v ON c.vendedor_id = v.id
      WHERE c.activo = 1
      ORDER BY c.nombre ASC, c.apellido ASC
    `;

    const clientes = await executeQuery<Cliente[]>(query);

    res.json({
      success: true,
      data: clientes,
      count: clientes.length,
      message: `Clientes de sucursal ${sucursal} obtenidos exitosamente`
    });
  } catch (error) {
    console.error('Error al obtener clientes por sucursal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener un cliente específico por ID y sucursal
 * GET /api/clientes/sucursal/:sucursal/:id
 */
export const obtenerClientePorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, id } = req.params;

    if (!sucursal || !id) {
      res.status(400).json({
        success: false,
        message: 'Sucursal e ID son requeridos'
      });
      return;
    }

    if (isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
      return;
    }

    const nombreTabla = await obtenerNombreTabla(sucursal);

    if (!nombreTabla) {
      res.status(400).json({
        success: false,
        message: 'Sucursal inválida'
      });
      return;
    }

    const query = `
      SELECT 
        c.*,
        v.nombre as vendedor_nombre,
        v.cargo as vendedor_cargo
      FROM ${nombreTabla} c
      LEFT JOIN vendedores v ON c.vendedor_id = v.id
      WHERE c.id = ?
    `;

    const clientes = await executeQuery<Cliente[]>(query, [id]);

    if (clientes.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
      return;
    }

    res.json({
      success: true,
      data: clientes[0],
      message: 'Cliente obtenido exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Crear un nuevo cliente en una sucursal específica
 * POST /api/clientes/sucursal/:sucursal
 */
export const crearCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.params;
    const clienteData: ClienteInput = req.body;

    // Validar sucursal
    const nombreTabla = await obtenerNombreTabla(sucursal);

    if (!nombreTabla) {
      res.status(400).json({
        success: false,
        message: 'Sucursal inválida'
      });
      return;
    }

    // Validar datos requeridos
    if (!clienteData.nombre || !clienteData.apellido) {
      res.status(400).json({
        success: false,
        message: 'Nombre y apellido son campos requeridos'
      });
      return;
    }

    // Validar teléfono (ahora es requerido)
    if (!clienteData.telefono || clienteData.telefono.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'El teléfono es un campo requerido'
      });
      return;
    }

    // Validar longitud del teléfono
    if (clienteData.telefono.length < 8 || clienteData.telefono.length > 20) {
      res.status(400).json({
        success: false,
        message: 'El teléfono debe tener entre 8 y 20 caracteres'
      });
      return;
    }

    // Validar email si se proporciona
    if (clienteData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clienteData.email)) {
        res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
        return;
      }
    }

    // Preparar query de inserción
    const query = `
      INSERT INTO ${nombreTabla} 
      (nombre, apellido, nombre_fantasia, rut, direccion, email, razon_social, telefono, vendedor_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      clienteData.nombre,
      clienteData.apellido,
      clienteData.nombre_fantasia || null,
      clienteData.rut || null,
      clienteData.direccion || null,
      clienteData.email || null,
      clienteData.razon_social || null,
      clienteData.telefono, // Ahora es requerido, no puede ser null
      clienteData.vendedor_id || null
    ];

    const resultado: any = await executeQuery(query, params);

    // Obtener el cliente recién creado
    const clienteNuevo = await executeQuery<Cliente[]>(
      `SELECT * FROM ${nombreTabla} WHERE id = ?`,
      [resultado.insertId]
    );

    res.status(201).json({
      success: true,
      data: clienteNuevo[0],
      message: 'Cliente creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Actualizar un cliente existente
 * PUT /api/clientes/sucursal/:sucursal/:id
 */
export const actualizarCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, id } = req.params;
    const clienteData: Partial<ClienteInput> = req.body;

    // Validar sucursal
    const nombreTabla = await obtenerNombreTabla(sucursal);

    if (!nombreTabla) {
      res.status(400).json({
        success: false,
        message: 'Sucursal inválida'
      });
      return;
    }

    if (isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
      return;
    }

    // Verificar que el cliente existe
    const clienteExistente = await executeQuery<Cliente[]>(
      `SELECT * FROM ${nombreTabla} WHERE id = ?`,
      [id]
    );

    if (clienteExistente.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
      return;
    }

    // Construir query de actualización dinámica
    const camposActualizar: string[] = [];
    const valores: any[] = [];

    if (clienteData.nombre !== undefined) {
      camposActualizar.push('nombre = ?');
      valores.push(clienteData.nombre);
    }
    if (clienteData.apellido !== undefined) {
      camposActualizar.push('apellido = ?');
      valores.push(clienteData.apellido);
    }
    if (clienteData.nombre_fantasia !== undefined) {
      camposActualizar.push('nombre_fantasia = ?');
      valores.push(clienteData.nombre_fantasia);
    }
    if (clienteData.rut !== undefined) {
      camposActualizar.push('rut = ?');
      valores.push(clienteData.rut);
    }
    if (clienteData.direccion !== undefined) {
      camposActualizar.push('direccion = ?');
      valores.push(clienteData.direccion);
    }
    if (clienteData.email !== undefined) {
      camposActualizar.push('email = ?');
      valores.push(clienteData.email);
    }
    if (clienteData.razon_social !== undefined) {
      camposActualizar.push('razon_social = ?');
      valores.push(clienteData.razon_social);
    }
    if (clienteData.telefono !== undefined) {
      camposActualizar.push('telefono = ?');
      valores.push(clienteData.telefono);
    }
    if (clienteData.vendedor_id !== undefined) {
      camposActualizar.push('vendedor_id = ?');
      valores.push(clienteData.vendedor_id);
    }

    if (camposActualizar.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
      return;
    }

    valores.push(id);

    const query = `
      UPDATE ${nombreTabla}
      SET ${camposActualizar.join(', ')}
      WHERE id = ?
    `;

    await executeQuery(query, valores);

    // Obtener el cliente actualizado
    const clienteActualizado = await executeQuery<Cliente[]>(
      `SELECT * FROM ${nombreTabla} WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: clienteActualizado[0],
      message: 'Cliente actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cliente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Buscar clientes por nombre, apellido, RUT o email
 * GET /api/clientes/sucursal/:sucursal/buscar?q=termino
 */
export const buscarClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.params;
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Término de búsqueda requerido (parámetro q)'
      });
      return;
    }

    const nombreTabla = await obtenerNombreTabla(sucursal);

    if (!nombreTabla) {
      res.status(400).json({
        success: false,
        message: 'Sucursal inválida'
      });
      return;
    }

    const termino = `%${q}%`;

    const query = `
      SELECT 
        c.*,
        v.nombre as vendedor_nombre
      FROM ${nombreTabla} c
      LEFT JOIN vendedores v ON c.vendedor_id = v.id
      WHERE c.activo = 1 
        AND (
          c.nombre LIKE ? 
          OR c.apellido LIKE ? 
          OR c.email LIKE ? 
          OR c.rut LIKE ?
          OR c.nombre_fantasia LIKE ?
        )
      ORDER BY c.nombre ASC, c.apellido ASC
      LIMIT 50
    `;

    const clientes = await executeQuery<Cliente[]>(
      query,
      [termino, termino, termino, termino, termino]
    );

    res.json({
      success: true,
      data: clientes,
      count: clientes.length,
      message: `Búsqueda completada: ${clientes.length} resultados`
    });
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar clientes',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};


