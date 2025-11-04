/**
 * Controlador de Transferencias de Inventario
 * Gestiona el flujo completo de transferencias entre sucursales
 * Sistema ZARPAR - 2 Fases: Envío + Confirmación
 */

import { Request, Response } from 'express';
import pool from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { tablaClientesExiste } from '../utils/database.js';

/**
 * ===================================
 * INTERFACES
 * ===================================
 */

interface Transferencia extends RowDataPacket {
  id: number;
  codigo: string;
  fecha_envio: Date;
  fecha_recepcion: Date | null;
  sucursal_origen: string;
  sucursal_destino: string;
  estado: 'pendiente' | 'en_transito' | 'recibida' | 'completada' | 'cancelada';
  usuario_envio: string;
  usuario_recepcion: string | null;
  total_productos: number;
  total_unidades: number;
  notas_envio: string | null;
  notas_recepcion: string | null;
  diferencias: string | null;
  created_at: Date;
  updated_at: Date;
}

interface TransferenciaDetalle extends RowDataPacket {
  id: number;
  transferencia_id: number;
  producto_id: number;
  producto_nombre: string;
  producto_marca: string;
  producto_tipo: string;
  cantidad_enviada: number;
  cantidad_recibida: number | null;
  cantidad_faltante: number;
  cantidad_sobrante: number;
  stock_origen_antes: number;
  stock_origen_despues: number;
  stock_destino_antes: number;
  stock_destino_despues: number | null;
  ventas_periodo: number;
  fecha_inicio_ventas: Date | null;
  fecha_fin_ventas: Date | null;
  created_at: Date;
}

interface ProductoTransferencia {
  producto_id: number;
  cantidad: number;
  ventas_periodo?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}

interface CrearTransferenciaInput {
  sucursal_destino: string;
  productos: ProductoTransferencia[];
  notas_envio?: string;
}

interface ConfirmarRecepcionInput {
  productos: {
    producto_id: number;
    cantidad_recibida: number;
  }[];
  notas_recepcion?: string;
}

/**
 * ===================================
 * HELPER: Ejecutar Query
 * ===================================
 */
const executeQuery = async <T extends RowDataPacket>(
  query: string,
  params: any[] = []
): Promise<T[]> => {
  const [rows] = await pool.execute<T[]>(query, params);
  return rows;
};

/**
 * ===================================
 * HELPER: Normalizar nombre sucursal
 * ===================================
 */
const normalizarSucursal = (sucursal: string): string => {
  return sucursal.toLowerCase().trim().replace(/\s+/g, '');
};

/**
 * ===================================
 * 1. CREAR TRANSFERENCIA (ENVIAR)
 * ===================================
 */
export const crearTransferencia = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { sucursal_destino, productos, notas_envio }: CrearTransferenciaInput = req.body;
    const usuario_envio = (req as any).user?.email || 'admin@zarparuy.com';
    
    // Validaciones básicas
    if (!sucursal_destino || !productos || productos.length === 0) {
      await connection.rollback();
      res.status(400).json({
        success: false,
        message: 'Datos incompletos: sucursal_destino y productos son requeridos'
      });
      return;
    }
    
    // Normalizar sucursal
    const sucursal_destino_norm = normalizarSucursal(sucursal_destino);
    const sucursal_origen_norm = 'maldonado'; // Siempre Casa Central
    
    // Verificar que la sucursal destino existe
    const existeSucursal = await tablaClientesExiste(sucursal_destino_norm);
    if (!existeSucursal) {
      await connection.rollback();
      res.status(400).json({
        success: false,
        message: `La sucursal "${sucursal_destino}" no existe`
      });
      return;
    }
    
    // Generar código único
    const [codigoResult] = await connection.execute<RowDataPacket[]>(
      'SELECT generar_codigo_transferencia() as codigo'
    );
    const codigo = codigoResult[0].codigo;
    
    // Calcular totales
    const total_productos = productos.length;
    const total_unidades = productos.reduce((sum, p) => sum + p.cantidad, 0);
    
    // Crear transferencia principal
    const [resultTransferencia] = await connection.execute<ResultSetHeader>(
      `INSERT INTO transferencias (
        codigo, fecha_envio, sucursal_origen, sucursal_destino,
        estado, usuario_envio, total_productos, total_unidades, notas_envio
      ) VALUES (?, NOW(), ?, ?, 'en_transito', ?, ?, ?, ?)`,
      [
        codigo,
        sucursal_origen_norm,
        sucursal_destino_norm,
        usuario_envio,
        total_productos,
        total_unidades,
        notas_envio || null
      ]
    );
    
    const transferencia_id = resultTransferencia.insertId;
    
    // Procesar cada producto
    for (const item of productos) {
      const { producto_id, cantidad, ventas_periodo, fecha_inicio, fecha_fin } = item;
      
      // Obtener información del producto
      const [productos_bd] = await connection.execute<RowDataPacket[]>(
        'SELECT nombre, marca, tipo FROM productos WHERE id = ?',
        [producto_id]
      );
      
      if (productos_bd.length === 0) {
        throw new Error(`Producto ${producto_id} no encontrado`);
      }
      
      const producto = productos_bd[0];
      
      // Obtener stock actual en origen (Maldonado)
      const [stockOrigen] = await connection.execute<RowDataPacket[]>(
        'SELECT stock FROM productos_sucursal WHERE producto_id = ? AND sucursal = ?',
        [producto_id, sucursal_origen_norm]
      );
      
      if (stockOrigen.length === 0 || stockOrigen[0].stock < cantidad) {
        throw new Error(
          `Stock insuficiente en Maldonado para ${producto.nombre}. ` +
          `Disponible: ${stockOrigen[0]?.stock || 0}, Solicitado: ${cantidad}`
        );
      }
      
      const stock_origen_antes = stockOrigen[0].stock;
      const stock_origen_despues = stock_origen_antes - cantidad;
      
      // Obtener stock actual en destino
      const [stockDestino] = await connection.execute<RowDataPacket[]>(
        'SELECT stock FROM productos_sucursal WHERE producto_id = ? AND sucursal = ?',
        [producto_id, sucursal_destino_norm]
      );
      
      const stock_destino_antes = stockDestino[0]?.stock || 0;
      
      // RESTAR stock de Casa Principal (Maldonado/Melo)
      await connection.execute(
        `UPDATE productos_sucursal 
         SET stock = stock - ?, updated_at = NOW()
         WHERE producto_id = ? AND sucursal = ?`,
        [cantidad, producto_id, sucursal_origen_norm]
      );
      
      // SUMAR a stock_en_transito en destino (para mostrar "🚚 En camino")
      // Verificar si existe registro de productos_sucursal para la sucursal destino
      if (stockDestino.length === 0) {
        // Crear registro si no existe
        await connection.execute(
          `INSERT INTO productos_sucursal 
           (producto_id, sucursal, stock, stock_en_transito, precio, stock_minimo, es_stock_principal, activo)
           VALUES (?, ?, 0, ?, 0, 10, 0, 1)`,
          [producto_id, sucursal_destino_norm, cantidad]
        );
      } else {
        // Actualizar stock_en_transito
        await connection.execute(
          `UPDATE productos_sucursal 
           SET stock_en_transito = COALESCE(stock_en_transito, 0) + ?,
               updated_at = NOW()
           WHERE producto_id = ? AND sucursal = ?`,
          [cantidad, producto_id, sucursal_destino_norm]
        );
      }
      
      // Crear detalle de transferencia
      await connection.execute(
        `INSERT INTO transferencias_detalle (
          transferencia_id, producto_id, producto_nombre, producto_marca, producto_tipo,
          cantidad_enviada, stock_origen_antes, stock_origen_despues,
          stock_destino_antes, ventas_periodo, fecha_inicio_ventas, fecha_fin_ventas
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transferencia_id,
          producto_id,
          producto.nombre,
          producto.marca || '',
          producto.tipo || '',
          cantidad,
          stock_origen_antes,
          stock_origen_despues,
          stock_destino_antes,
          ventas_periodo || 0,
          fecha_inicio || null,
          fecha_fin || null
        ]
      );
    }
    
    await connection.commit();
    
    console.log(`✅ Transferencia creada: ${codigo} → ${sucursal_destino_norm} (${total_unidades} unidades)`);
    
    res.status(201).json({
      success: true,
      message: 'Transferencia creada exitosamente',
      data: {
        id: transferencia_id,
        codigo,
        fecha_envio: new Date(),
        sucursal_destino: sucursal_destino_norm,
        estado: 'en_transito',
        total_productos,
        total_unidades
      }
    });
    
  } catch (error: any) {
    await connection.rollback();
    console.error('❌ Error al crear transferencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear transferencia',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * ===================================
 * 2. OBTENER TRANSFERENCIAS
 * ===================================
 */
export const obtenerTransferencias = async (req: Request, res: Response): Promise<void> => {
  try {
    const { estado, sucursal, desde, hasta } = req.query;
    
    let query = `
      SELECT 
        t.*,
        DATEDIFF(
          COALESCE(t.fecha_recepcion, NOW()), 
          t.fecha_envio
        ) as dias_en_transito
      FROM transferencias t
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Filtros opcionales
    if (estado && estado !== 'todas') {
      query += ' AND t.estado = ?';
      params.push(estado);
    }
    
    if (sucursal) {
      const sucursal_norm = normalizarSucursal(sucursal as string);
      query += ' AND t.sucursal_destino = ?';
      params.push(sucursal_norm);
    }
    
    if (desde) {
      query += ' AND DATE(t.fecha_envio) >= ?';
      params.push(desde);
    }
    
    if (hasta) {
      query += ' AND DATE(t.fecha_envio) <= ?';
      params.push(hasta);
    }
    
    query += ' ORDER BY t.fecha_envio DESC';
    
    const transferencias = await executeQuery<Transferencia>(query, params);
    
    res.json({
      success: true,
      data: transferencias
    });
    
  } catch (error: any) {
    console.error('❌ Error al obtener transferencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener transferencias',
      error: error.message
    });
  }
};

/**
 * ===================================
 * 3. OBTENER DETALLE DE TRANSFERENCIA
 * ===================================
 */
export const obtenerDetalleTransferencia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Obtener transferencia
    const [transferencias] = await executeQuery<Transferencia>(
      'SELECT * FROM transferencias WHERE id = ?',
      [id]
    );
    
    if (transferencias.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Transferencia no encontrada'
      });
      return;
    }
    
    const transferencia = transferencias[0];
    
    // Obtener productos
    const productos = await executeQuery<TransferenciaDetalle>(
      'SELECT * FROM transferencias_detalle WHERE transferencia_id = ? ORDER BY producto_nombre',
      [id]
    );
    
    res.json({
      success: true,
      data: {
        ...transferencia,
        productos
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error al obtener detalle:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalle de transferencia',
      error: error.message
    });
  }
};

/**
 * ===================================
 * 4. CONFIRMAR RECEPCIÓN
 * ===================================
 */
export const confirmarRecepcion = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { productos, notas_recepcion }: ConfirmarRecepcionInput = req.body;
    const usuario_recepcion = (req as any).user?.email || 'usuario@zarparuy.com';
    
    // Obtener transferencia
    const [transferencias] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM transferencias WHERE id = ?',
      [id]
    );
    
    if (transferencias.length === 0) {
      await connection.rollback();
      res.status(404).json({
        success: false,
        message: 'Transferencia no encontrada'
      });
      return;
    }
    
    const transferencia = transferencias[0];
    
    // Validar estado
    if (transferencia.estado !== 'en_transito' && transferencia.estado !== 'recibida') {
      await connection.rollback();
      res.status(400).json({
        success: false,
        message: `No se puede confirmar una transferencia en estado "${transferencia.estado}"`
      });
      return;
    }
    
    const sucursal_destino = transferencia.sucursal_destino;
    const diferencias_detectadas: string[] = [];
    
    // Procesar cada producto
    for (const item of productos) {
      const { producto_id, cantidad_recibida } = item;
      
      // Obtener detalle de la transferencia
      const [detalles] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM transferencias_detalle WHERE transferencia_id = ? AND producto_id = ?',
        [id, producto_id]
      );
      
      if (detalles.length === 0) {
        throw new Error(`Producto ${producto_id} no está en esta transferencia`);
      }
      
      const detalle = detalles[0];
      const cantidad_enviada = detalle.cantidad_enviada;
      
      // Calcular diferencias
      const diferencia = cantidad_recibida - cantidad_enviada;
      const cantidad_faltante = diferencia < 0 ? Math.abs(diferencia) : 0;
      const cantidad_sobrante = diferencia > 0 ? diferencia : 0;
      
      if (diferencia !== 0) {
        diferencias_detectadas.push(
          `${detalle.producto_nombre}: ${diferencia > 0 ? '+' : ''}${diferencia}`
        );
      }
      
      // Obtener stock actual en destino
      const [stockActual] = await connection.execute<RowDataPacket[]>(
        'SELECT stock, stock_en_transito FROM productos_sucursal WHERE producto_id = ? AND sucursal = ?',
        [producto_id, sucursal_destino]
      );
      
      const stock_actual = stockActual[0]?.stock || 0;
      const stock_en_transito_actual = stockActual[0]?.stock_en_transito || 0;
      const stock_despues = stock_actual + cantidad_recibida;
      
      // SUMAR stock recibido al destino
      await connection.execute(
        `UPDATE productos_sucursal 
         SET stock = stock + ?,
             stock_en_transito = GREATEST(0, COALESCE(stock_en_transito, 0) - ?),
             updated_at = NOW()
         WHERE producto_id = ? AND sucursal = ?`,
        [cantidad_recibida, cantidad_enviada, producto_id, sucursal_destino]
      );
      
      // Actualizar detalle
      await connection.execute(
        `UPDATE transferencias_detalle 
         SET cantidad_recibida = ?,
             cantidad_faltante = ?,
             cantidad_sobrante = ?,
             stock_destino_despues = ?
         WHERE id = ?`,
        [cantidad_recibida, cantidad_faltante, cantidad_sobrante, stock_despues, detalle.id]
      );
    }
    
    // Actualizar transferencia
    const diferencias_texto = diferencias_detectadas.length > 0
      ? diferencias_detectadas.join(', ')
      : null;
    
    await connection.execute(
      `UPDATE transferencias 
       SET estado = 'completada',
           fecha_recepcion = NOW(),
           usuario_recepcion = ?,
           notas_recepcion = ?,
           diferencias = ?
       WHERE id = ?`,
      [usuario_recepcion, notas_recepcion || null, diferencias_texto, id]
    );
    
    await connection.commit();
    
    console.log(`✅ Transferencia confirmada: ${transferencia.codigo}`);
    if (diferencias_detectadas.length > 0) {
      console.log(`⚠️ Diferencias: ${diferencias_texto}`);
    }
    
    res.json({
      success: true,
      message: 'Recepción confirmada exitosamente',
      data: {
        id: transferencia.id,
        codigo: transferencia.codigo,
        estado: 'completada',
        fecha_recepcion: new Date(),
        diferencias: diferencias_detectadas
      }
    });
    
  } catch (error: any) {
    await connection.rollback();
    console.error('❌ Error al confirmar recepción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar recepción',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * ===================================
 * 5. CANCELAR TRANSFERENCIA
 * ===================================
 */
export const cancelarTransferencia = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    // Obtener transferencia
    const [transferencias] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM transferencias WHERE id = ?',
      [id]
    );
    
    if (transferencias.length === 0) {
      await connection.rollback();
      res.status(404).json({
        success: false,
        message: 'Transferencia no encontrada'
      });
      return;
    }
    
    const transferencia = transferencias[0];
    
    // Solo se puede cancelar si está pendiente o en tránsito
    if (transferencia.estado !== 'pendiente' && transferencia.estado !== 'en_transito') {
      await connection.rollback();
      res.status(400).json({
        success: false,
        message: `No se puede cancelar una transferencia en estado "${transferencia.estado}"`
      });
      return;
    }
    
    // Si está en tránsito, devolver stock
    if (transferencia.estado === 'en_transito') {
      // Obtener productos
      const [productos] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM transferencias_detalle WHERE transferencia_id = ?',
        [id]
      );
      
      for (const producto of productos) {
        // DEVOLVER stock a Maldonado
        await connection.execute(
          `UPDATE productos_sucursal 
           SET stock = stock + ?,
               updated_at = NOW()
           WHERE producto_id = ? AND sucursal = 'maldonado'`,
          [producto.cantidad_enviada, producto.producto_id]
        );
        
        // RESTAR de stock_en_transito en destino
        await connection.execute(
          `UPDATE productos_sucursal 
           SET stock_en_transito = GREATEST(0, COALESCE(stock_en_transito, 0) - ?),
               updated_at = NOW()
           WHERE producto_id = ? AND sucursal = ?`,
          [producto.cantidad_enviada, producto.producto_id, transferencia.sucursal_destino]
        );
      }
    }
    
    // Actualizar estado
    await connection.execute(
      'UPDATE transferencias SET estado = "cancelada", updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    await connection.commit();
    
    console.log(`❌ Transferencia cancelada: ${transferencia.codigo}`);
    
    res.json({
      success: true,
      message: 'Transferencia cancelada exitosamente',
      data: {
        id: transferencia.id,
        codigo: transferencia.codigo,
        estado: 'cancelada'
      }
    });
    
  } catch (error: any) {
    await connection.rollback();
    console.error('❌ Error al cancelar transferencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar transferencia',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * ===================================
 * 6. OBTENER VENTAS POR RANGO
 * ===================================
 */
export const obtenerVentasPorRango = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, desde, hasta } = req.query;
    
    if (!sucursal || !desde || !hasta) {
      res.status(400).json({
        success: false,
        message: 'Parámetros requeridos: sucursal, desde, hasta'
      });
      return;
    }
    
    const sucursal_norm = normalizarSucursal(sucursal as string);
    
    // Obtener ventas agrupadas por producto
    const ventas = await executeQuery<RowDataPacket>(
      `SELECT 
        vd.producto_id,
        p.nombre as producto_nombre,
        p.marca as producto_marca,
        SUM(vd.cantidad) as cantidad_vendida,
        ps.stock as stock_actual
       FROM ventas_detalle vd
       INNER JOIN ventas v ON vd.venta_id = v.id
       INNER JOIN productos p ON vd.producto_id = p.id
       LEFT JOIN productos_sucursal ps ON ps.producto_id = p.id AND ps.sucursal = ?
       WHERE v.sucursal = ?
         AND DATE(v.fecha_venta) BETWEEN ? AND ?
       GROUP BY vd.producto_id, p.nombre, p.marca, ps.stock
       HAVING cantidad_vendida > 0
       ORDER BY cantidad_vendida DESC`,
      [sucursal_norm, sucursal_norm, desde, hasta]
    );
    
    res.json({
      success: true,
      data: {
        sucursal: sucursal_norm,
        desde,
        hasta,
        ventas_por_producto: ventas
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error al obtener ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ventas',
      error: error.message
    });
  }
};

/**
 * ===================================
 * 7. OBTENER RESUMEN/ESTADÍSTICAS
 * ===================================
 */
export const obtenerResumen = async (req: Request, res: Response): Promise<void> => {
  try {
    // Total transferencias del mes
    const [totalMes] = await executeQuery<RowDataPacket>(
      `SELECT COUNT(*) as total 
       FROM transferencias 
       WHERE MONTH(fecha_envio) = MONTH(NOW()) 
         AND YEAR(fecha_envio) = YEAR(NOW())`
    );
    
    // En tránsito
    const [enTransito] = await executeQuery<RowDataPacket>(
      "SELECT COUNT(*) as total FROM transferencias WHERE estado = 'en_transito'"
    );
    
    // Tiempo promedio de recepción
    const [tiempoPromedio] = await executeQuery<RowDataPacket>(
      `SELECT AVG(DATEDIFF(fecha_recepcion, fecha_envio)) as dias_promedio
       FROM transferencias
       WHERE estado = 'completada' AND fecha_recepcion IS NOT NULL`
    );
    
    // Diferencias detectadas
    const [diferencias] = await executeQuery<RowDataPacket>(
      `SELECT COUNT(*) as total 
       FROM transferencias 
       WHERE diferencias IS NOT NULL 
         AND estado = 'completada'`
    );
    
    // Por sucursal (este mes)
    const porSucursal = await executeQuery<RowDataPacket>(
      `SELECT 
        sucursal_destino,
        COUNT(*) as total_transferencias,
        SUM(total_unidades) as total_unidades
       FROM transferencias
       WHERE MONTH(fecha_envio) = MONTH(NOW())
         AND YEAR(fecha_envio) = YEAR(NOW())
       GROUP BY sucursal_destino
       ORDER BY total_unidades DESC`
    );
    
    res.json({
      success: true,
      data: {
        total_mes: totalMes[0]?.total || 0,
        en_transito: enTransito[0]?.total || 0,
        tiempo_promedio_dias: Math.round(tiempoPromedio[0]?.dias_promedio || 0),
        diferencias_detectadas: diferencias[0]?.total || 0,
        por_sucursal: porSucursal
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error al obtener resumen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen',
      error: error.message
    });
  }
};




