/**
 * Rutas para gestión de base de datos
 */

import { Router } from 'express';
import {
  obtenerTablas,
  obtenerEstructuraTabla,
  obtenerRegistros,
  obtenerRegistroPorId,
  actualizarRegistro,
  crearRegistro,
  eliminarRegistro,
  crearTabla,
  agregarColumna,
  modificarColumna,
  eliminarColumna,
  eliminarTabla
} from '../controllers/databaseController.js';
import { limpiarDatos, borradoMaestro } from '../controllers/cleanupController.js';

const router = Router();

// ========== GESTIÓN DE TABLAS ==========

// Obtener lista de tablas
router.get('/tables', obtenerTablas);

// Crear nueva tabla
router.post('/tables', crearTabla);

// Eliminar tabla
router.delete('/tables/:tableName', eliminarTabla);

// Obtener estructura de una tabla
router.get('/tables/:tableName/structure', obtenerEstructuraTabla);

// ========== GESTIÓN DE COLUMNAS ==========

// Agregar columna a una tabla
router.post('/tables/:tableName/columns', agregarColumna);

// Modificar columna existente
router.put('/tables/:tableName/columns/:columnName', modificarColumna);

// Eliminar columna
router.delete('/tables/:tableName/columns/:columnName', eliminarColumna);

// ========== GESTIÓN DE REGISTROS ==========

// Obtener registros de una tabla (con paginación y búsqueda)
router.get('/tables/:tableName/records', obtenerRegistros);

// Obtener un registro específico
router.get('/tables/:tableName/records/:id', obtenerRegistroPorId);

// Crear un nuevo registro
router.post('/tables/:tableName/records', crearRegistro);

// Actualizar un registro
router.put('/tables/:tableName/records/:id', actualizarRegistro);

// Eliminar un registro
router.delete('/tables/:tableName/records/:id', eliminarRegistro);

// ========== LIMPIEZA DE DATOS ==========

// Limpiar datos de prueba (⚠️ USO EXCLUSIVO PARA DESARROLLO)
router.post('/cleanup', limpiarDatos);

// 🔥 BORRADO MAESTRO - ELIMINA TODOS LOS DATOS (⚠️ IRREVERSIBLE)
router.post('/borrado-maestro', borradoMaestro);

export default router;

