import express from 'express';
import { verificarAutenticacion, verificarAdmin } from '../middleware/auth.js';
import {
  obtenerConfiguracionDescuentos,
  obtenerConfiguracionPorSucursal,
  actualizarConfiguracionDescuento,
  habilitarUnaVez,
  desactivarUnaVez
} from '../controllers/descuentosController.js';

const router = express.Router();

// 🚀 ENDPOINT PÚBLICO DE PRUEBA (sin autenticación)
router.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    mensaje: '✅ Rutas de descuentos funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// 🔍 ENDPOINT DE DIAGNÓSTICO PÚBLICO (temporal para debug Railway)
router.get('/debug/estructura-simple', async (req, res) => {
  try {
    const { pool } = await import('../config/database.js');
    
    // Verificar estructura de la tabla
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'zarparDataBase'
        AND TABLE_NAME = 'configuracion_descuentos_sucursal'
      ORDER BY ORDINAL_POSITION
    `);
    
    // Obtener datos actuales
    const [data] = await pool.execute(`
      SELECT sucursal, descuento_habilitado, una_vez_activo 
      FROM configuracion_descuentos_sucursal
      ORDER BY sucursal
    `);
    
    // Verificar si existe la columna una_vez_activo
    const tieneColumna = (columns as any[]).some((col: any) => col.COLUMN_NAME === 'una_vez_activo');
    
    res.status(200).json({
      success: true,
      tieneColumnaUnaVez: tieneColumna,
      estructura: columns,
      datos: data,
      totalSucursales: (data as any[]).length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
});

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// Obtener configuración de todas las sucursales (admin)
router.get('/', verificarAdmin, obtenerConfiguracionDescuentos);

// Obtener configuración de una sucursal específica (todos pueden ver su sucursal)
router.get('/:sucursal', obtenerConfiguracionPorSucursal);

// Actualizar configuración de descuento (solo admin)
router.put('/:sucursal', verificarAdmin, actualizarConfiguracionDescuento);

// Habilitar descuento "una vez"
// ✅ Admin → puede habilitar en cualquier sucursal
// ✅ Usuario de sucursal → solo puede habilitar en SU sucursal (validación en controlador)
router.post('/:sucursal/una-vez', habilitarUnaVez);

// Desactivar descuento "una vez"
// ✅ Admin → puede desactivar en cualquier sucursal
// ✅ Usuario de sucursal → solo puede desactivar en SU sucursal (validación en controlador)
router.delete('/:sucursal/una-vez', desactivarUnaVez);

export default router;








