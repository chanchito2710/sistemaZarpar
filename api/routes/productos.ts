/**
 * Rutas para gestión de productos
 * Define todos los endpoints relacionados con productos y su stock por sucursal
 * TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
 */

import { Router } from 'express';
import {
  obtenerProductos,
  obtenerProductosConSucursales,
  obtenerProductosPorSucursal,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  actualizarProductoSucursal,
  buscarProductos,
  obtenerCategorias,
  agregarCategoria,
  editarCategoria,
  eliminarCategoria,
  obtenerSucursalPrincipalEndpoint,
  prepararTransferencia,
  confirmarTransferencia,
  confirmarRecepcionManual,
  ajustarTransferencia,
  obtenerHistorialTransferencias,
  obtenerInventario,
  obtenerFiltrosProductos,
  eliminarProducto,
  eliminarProductosMultiple,
  obtenerAlertasStock,
  obtenerStockEnTransito,
  limpiarStockEnTransito
} from '../controllers/productosController.js';
import { verificarAutenticacion } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/productos/buscar
 * @desc    Buscar productos por término
 * @access  Private (requiere autenticación)
 * @query   q - Término de búsqueda
 * @query   sucursal (opcional) - Filtrar por sucursal
 */
router.get(
  '/buscar',
  verificarAutenticacion,
  buscarProductos
);

/**
 * @route   GET /api/productos/con-sucursales
 * @desc    Obtener TODOS los productos con información de TODAS las sucursales
 * @access  Private (requiere autenticación)
 * @returns Array de productos con array de sucursales para cada uno
 */
router.get(
  '/con-sucursales',
  verificarAutenticacion,
  obtenerProductosConSucursales
);

/**
 * ===================================
 * RUTAS ESPECÍFICAS (ANTES DE /:id)
 * ===================================
 */

/**
 * @route   GET /api/productos/sucursal-principal
 * @desc    Obtener la sucursal principal (identificada por es_principal = 1)
 * @access  Private (requiere autenticación)
 * @returns { sucursal: string } - Nombre de la sucursal principal
 */
router.get(
  '/sucursal-principal',
  verificarAutenticacion,
  obtenerSucursalPrincipalEndpoint
);

/**
 * @route   GET /api/productos/categorias/:tipo
 * @desc    Obtener categorías (marcas o tipos) para selectores
 * @access  Private (requiere autenticación)
 * @param   tipo - 'marca' o 'tipo'
 */
router.get(
  '/categorias/:tipo',
  verificarAutenticacion,
  obtenerCategorias
);

/**
 * @route   POST /api/productos/categorias
 * @desc    Agregar nueva categoría (marca, tipo o calidad)
 * @access  Private (requiere autenticación)
 * @body    { tipo: 'marca' | 'tipo' | 'calidad', valor: string }
 */
router.post(
  '/categorias',
  verificarAutenticacion,
  agregarCategoria
);

/**
 * @route   PUT /api/productos/categorias
 * @desc    Editar una categoría existente (marca, tipo o calidad)
 * @access  Private (requiere autenticación)
 * @body    { id: number, tipo: 'marca' | 'tipo' | 'calidad', valorNuevo: string }
 */
router.put(
  '/categorias',
  verificarAutenticacion,
  editarCategoria
);

/**
 * @route   DELETE /api/productos/categorias/:id/:tipo
 * @desc    Eliminar una categoría (marca, tipo o calidad)
 * @access  Private (requiere autenticación)
 * @param   id - ID de la categoría a eliminar
 * @param   tipo - 'marca' | 'tipo' | 'calidad'
 */
router.delete(
  '/categorias/:id/:tipo',
  verificarAutenticacion,
  eliminarCategoria
);

/**
 * @route   GET /api/productos/filtros
 * @desc    Obtener marcas y modelos únicos para los filtros
 * @access  Private (requiere autenticación)
 * @query   sucursal (opcional) - Filtrar por sucursal específica
 * @returns { marcas: string[], modelos: string[] }
 */
router.get(
  '/filtros',
  verificarAutenticacion,
  obtenerFiltrosProductos
);

/**
 * @route   GET /api/productos/inventario
 * @desc    Obtener inventario completo (productos con stock por sucursal en formato plano)
 * @access  Private (requiere autenticación)
 * @query   sucursal (opcional) - Filtrar por sucursal
 * @query   marca (opcional) - Filtrar por marca
 * @query   tipo (opcional) - Filtrar por tipo/modelo
 */
router.get(
  '/inventario',
  verificarAutenticacion,
  obtenerInventario
);

/**
 * @route   GET /api/productos/sucursal/:sucursal
 * @desc    Obtener productos de una sucursal con stock y precio
 * @access  Private (requiere autenticación)
 */
router.get(
  '/sucursal/:sucursal',
  verificarAutenticacion,
  obtenerProductosPorSucursal
);

/**
 * ===================================
 * TRANSFERENCIAS - HISTORIAL
 * ===================================
 */

/**
 * @route   GET /api/productos/stock-en-transito
 * @desc    Obtener todos los productos con stock en tránsito
 * @access  Private (requiere autenticación)
 * @returns Array de productos con stock_en_transito > 0
 */
router.get(
  '/stock-en-transito',
  verificarAutenticacion,
  obtenerStockEnTransito
);

/**
 * @route   POST /api/productos/limpiar-stock-transito
 * @desc    Limpiar stock en tránsito seleccionado (devolver a casa central)
 * @access  Private (requiere autenticación)
 * @body    { items: [{ producto_id: number, sucursal: string }] }
 */
router.post(
  '/limpiar-stock-transito',
  verificarAutenticacion,
  limpiarStockEnTransito
);

/**
 * @route   GET /api/productos/alertas-stock
 * @desc    ⭐ Obtener alertas de stock bajo o agotado
 * @access  Private (requiere autenticación, solo admin)
 * @returns Array de productos con stock = 0 o stock < stock_minimo
 */
router.get(
  '/alertas-stock',
  verificarAutenticacion,
  obtenerAlertasStock
);

/**
 * @route   GET /api/productos/historial-transferencias
 * @desc    Obtener historial de transferencias con filtros opcionales
 * @access  Public (TEMPORALMENTE SIN AUTENTICACIÓN PARA DEBUG)
 * @query   fecha_desde, fecha_hasta, sucursal_destino (opcional)
 * @returns Array de transferencias históricas
 */
router.get(
  '/historial-transferencias',
  async (req, res, next) => {
    console.log('🔥 MIDDLEWARE: Request recibida para historial-transferencias');
    console.log('Headers:', req.headers);
    console.log('Query:', req.query);
    next();
  },
  // verificarAutenticacion, // TEMPORALMENTE COMENTADO PARA DEBUG
  obtenerHistorialTransferencias
);

/**
 * ===================================
 * RUTAS CON PARÁMETROS DINÁMICOS
 * ===================================
 */

/**
 * @route   GET /api/productos/:id
 * @desc    Obtener un producto específico con info de todas las sucursales
 * @access  Private (requiere autenticación)
 */
router.get(
  '/:id',
  verificarAutenticacion,
  obtenerProductoPorId
);

/**
 * @route   GET /api/productos
 * @desc    Obtener todos los productos (sin info de sucursal)
 * @access  Private (requiere autenticación)
 */
router.get(
  '/',
  verificarAutenticacion,
  obtenerProductos
);

/**
 * @route   POST /api/productos
 * @desc    Crear un nuevo producto
 * @access  Private (requiere autenticación)
 */
router.post(
  '/',
  verificarAutenticacion,
  crearProducto
);

/**
 * @route   PUT /api/productos/:id
 * @desc    Actualizar información básica de un producto
 * @access  Private (requiere autenticación)
 */
router.put(
  '/:id',
  verificarAutenticacion,
  actualizarProducto
);

/**
 * @route   PUT /api/productos/:id/sucursal/:sucursal
 * @desc    Actualizar stock y precio de un producto en una sucursal
 * @access  Private (requiere autenticación)
 */
router.put(
  '/:id/sucursal/:sucursal',
  verificarAutenticacion,
  actualizarProductoSucursal
);

/**
 * ===================================
 * RUTAS PARA ELIMINACIÓN DE PRODUCTOS
 * ===================================
 */

/**
 * @route   DELETE /api/productos/eliminar-multiple
 * @desc    Eliminar múltiples productos de forma permanente
 * @access  Private (requiere autenticación)
 * @body    { ids: number[] } - Array de IDs de productos a eliminar
 * @returns Confirmación de productos eliminados
 * 
 * IMPORTANTE: Esta ruta DEBE ir ANTES de DELETE /:id para evitar conflictos
 */
router.delete(
  '/eliminar-multiple',
  verificarAutenticacion,
  eliminarProductosMultiple
);

/**
 * @route   DELETE /api/productos/:id
 * @desc    Eliminar un producto de forma permanente
 * @access  Private (requiere autenticación)
 * @param   id - ID del producto a eliminar
 * @returns Confirmación de producto eliminado
 * 
 * ELIMINA:
 * - El producto de la tabla 'productos'
 * - Todos los registros relacionados en 'productos_sucursal'
 * - Sin posibilidad de recuperación (eliminación permanente)
 */
router.delete(
  '/:id',
  verificarAutenticacion,
  eliminarProducto
);

/**
 * ===================================
 * RUTAS PARA TRANSFERENCIAS DINÁMICAS
 * ===================================
 */

/**
 * @route   POST /api/productos/preparar-transferencia
 * @desc    Descontar stock de sucursal principal y agregarlo a stock_en_transito de destino
 * @access  Private (requiere autenticación)
 * @body    { producto_id: number, sucursal_destino: string, cantidad: number }
 * @returns Confirmación de transferencia preparada
 */
router.post(
  '/preparar-transferencia',
  verificarAutenticacion,
  prepararTransferencia
);

/**
 * @route   POST /api/productos/ajustar-transferencia
 * @desc    Ajustar cantidad en stock_en_transito (devolver sobrante a principal o descontar más)
 * @access  Private (requiere autenticación)
 * @body    { producto_id: number, sucursal_destino: string, cantidad_anterior: number, cantidad_nueva: number }
 * @returns Confirmación de ajuste
 */
router.post(
  '/ajustar-transferencia',
  verificarAutenticacion,
  ajustarTransferencia
);

/**
 * @route   POST /api/productos/confirmar-transferencia
 * @desc    Confirmar transferencia: pasar de stock_en_transito a stock real en destino
 * @access  Private (requiere autenticación)
 * @body    { transferencias: Array<{ producto_id: number, sucursal: string, cantidad: number }> }
 * @returns Confirmación de transferencias completadas
 */
router.post(
  '/confirmar-transferencia',
  verificarAutenticacion,
  confirmarTransferencia
);

/**
 * @route   POST /api/productos/confirmar-recepcion-manual
 * @desc    Confirmar recepción manual: limpiar indicador de recibidos_recientes
 * @access  Private (requiere autenticación)
 * @body    { producto_id: number, sucursal: string }
 * @returns Confirmación de recepción limpiada
 */
router.post(
  '/confirmar-recepcion-manual',
  verificarAutenticacion,
  confirmarRecepcionManual
);

export default router;

