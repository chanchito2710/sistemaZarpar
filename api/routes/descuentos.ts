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

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// Obtener configuración de todas las sucursales (admin)
router.get('/', verificarAdmin, obtenerConfiguracionDescuentos);

// Obtener configuración de una sucursal específica (todos pueden ver su sucursal)
router.get('/:sucursal', obtenerConfiguracionPorSucursal);

// Actualizar configuración de descuento (solo admin)
router.put('/:sucursal', verificarAdmin, actualizarConfiguracionDescuento);

// Habilitar descuento "una vez" (solo admin)
router.post('/:sucursal/una-vez', verificarAdmin, habilitarUnaVez);

// Desactivar descuento "una vez" después de usarse (cualquier usuario puede desactivar)
router.delete('/:sucursal/una-vez', desactivarUnaVez);

// 🔍 ENDPOINT DE DIAGNÓSTICO (temporal para debug)
router.get('/debug/estructura', verificarAdmin, async (req, res) => {
  try {
    const { pool } = await import('../config/database.js');
    
    // Verificar estructura de la tabla
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'zarparDataBase'
        AND TABLE_NAME = 'configuracion_descuentos_sucursal'
      ORDER BY ORDINAL_POSITION
    `);
    
    // Obtener datos actuales
    const [data] = await pool.execute(`
      SELECT * FROM configuracion_descuentos_sucursal
      ORDER BY sucursal
    `);
    
    res.status(200).json({
      success: true,
      estructura: columns,
      datos: data,
      mensaje: 'Revisa si existe la columna una_vez_activo'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🧪 ENDPOINT DE PRUEBA: Habilitar una vez FORZADO (sin verificación)
router.post('/debug/test-una-vez/:sucursal', verificarAdmin, async (req, res) => {
  try {
    const { pool } = await import('../config/database.js');
    const { sucursal } = req.params;
    
    console.log(`🧪 [TEST] Intentando habilitar una_vez para: ${sucursal}`);
    
    // Intentar UPDATE directo
    const [result] = await pool.execute(`
      UPDATE configuracion_descuentos_sucursal 
      SET una_vez_activo = 1 
      WHERE sucursal = ?
    `, [sucursal.toLowerCase()]);
    
    console.log(`🧪 [TEST] Resultado UPDATE:`, result);
    
    // Verificar que se actualizó
    const [verificacion] = await pool.execute(`
      SELECT * FROM configuracion_descuentos_sucursal 
      WHERE sucursal = ?
    `, [sucursal.toLowerCase()]);
    
    console.log(`🧪 [TEST] Datos después de UPDATE:`, verificacion);
    
    res.status(200).json({
      success: true,
      sucursal: sucursal.toLowerCase(),
      resultado: result,
      datosActuales: verificacion,
      mensaje: 'UPDATE ejecutado. Revisa si una_vez_activo = 1'
    });
  } catch (error: any) {
    console.error('🧪 [TEST] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      errno: error.errno
    });
  }
});

export default router;








