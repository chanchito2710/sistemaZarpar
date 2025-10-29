/**
 * Controlador para gestión de vendedores
 * Maneja todas las operaciones relacionadas con vendedores del sistema
 */

import { Request, Response } from 'express';
import { executeQuery } from '../config/database';

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


