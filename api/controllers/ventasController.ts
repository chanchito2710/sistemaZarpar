/**
 * Controlador para gestión de ventas
 * Maneja todas las operaciones relacionadas con ventas, cuenta corriente y reportes
 */

import { Request, Response } from 'express';
import { executeQuery } from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

/**
 * Interfaz para una venta
 */
interface Venta {
  id: number;
  numero_venta: string;
  sucursal: string;
  cliente_id: number;
  cliente_nombre: string;
  vendedor_id: number;
  vendedor_nombre: string;
  subtotal: number;
  descuento: number;
  total: number;
  metodo_pago: 'efectivo' | 'transferencia' | 'cuenta_corriente';
  estado_pago: 'pagado' | 'pendiente' | 'parcial';
  saldo_pendiente: number;
  fecha_venta: Date;
  fecha_vencimiento?: Date;
  observaciones?: string;
}

/**
 * Interfaz para detalle de venta
 */
interface VentaDetalle {
  producto_id: number;
  producto_nombre: string;
  producto_marca?: string;
  producto_codigo?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

/**
 * Interfaz para crear una venta
 */
interface CrearVentaInput {
  sucursal: string;
  cliente_id: number;
  cliente_nombre: string;
  vendedor_id: number;
  vendedor_nombre: string;
  subtotal: number;
  descuento: number;
  total: number;
  metodo_pago: 'efectivo' | 'transferencia' | 'cuenta_corriente';
  productos: VentaDetalle[];
  observaciones?: string;
  fecha_vencimiento?: string; // Para cuenta corriente
}

/**
 * Generar número de venta único
 */
const generarNumeroVenta = async (sucursal: string): Promise<string> => {
  const año = new Date().getFullYear();
  const sucursalUpper = sucursal.toUpperCase();
  
  // Buscar el último número de venta de esta sucursal y año
  const query = `
    SELECT numero_venta 
    FROM ventas 
    WHERE sucursal = ? AND YEAR(fecha_venta) = ?
    ORDER BY id DESC 
    LIMIT 1
  `;
  
  const resultado = await executeQuery<RowDataPacket[]>(query, [sucursal, año]);
  
  let siguienteNumero = 1;
  
  if (resultado.length > 0) {
    const ultimoNumero = resultado[0].numero_venta;
    // Formato: PANDO-2025-0001
    const partes = ultimoNumero.split('-');
    if (partes.length === 3) {
      siguienteNumero = parseInt(partes[2]) + 1;
    }
  }
  
  // Formatear con ceros a la izquierda (4 dígitos)
  const numeroFormateado = siguienteNumero.toString().padStart(4, '0');
  
  return `${sucursalUpper}-${año}-${numeroFormateado}`;
};

/**
 * Crear una nueva venta
 * POST /api/ventas
 */
export const crearVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const datos: CrearVentaInput = req.body;

    // Validaciones
    if (!datos.sucursal || !datos.cliente_id || !datos.vendedor_id) {
      res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: sucursal, cliente_id, vendedor_id'
      });
      return;
    }

    if (!datos.productos || datos.productos.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Debe incluir al menos un producto'
      });
      return;
    }

    // Validar método de pago
    const metodosValidos = ['efectivo', 'transferencia', 'cuenta_corriente'];
    if (!metodosValidos.includes(datos.metodo_pago)) {
      res.status(400).json({
        success: false,
        message: 'Método de pago inválido'
      });
      return;
    }

    // Generar número de venta
    const numeroVenta = await generarNumeroVenta(datos.sucursal);

    // Determinar estado de pago y saldo pendiente
    let estadoPago: 'pagado' | 'pendiente' | 'parcial' = 'pagado';
    let saldoPendiente = 0;

    if (datos.metodo_pago === 'cuenta_corriente') {
      estadoPago = 'pendiente';
      saldoPendiente = datos.total;
    }

    // Insertar venta principal
    const queryVenta = `
      INSERT INTO ventas (
        numero_venta, sucursal, cliente_id, cliente_nombre,
        vendedor_id, vendedor_nombre, subtotal, descuento, total,
        metodo_pago, estado_pago, saldo_pendiente, fecha_venta,
        fecha_vencimiento, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
    `;

    const resultadoVenta = await executeQuery<ResultSetHeader>(queryVenta, [
      numeroVenta,
      datos.sucursal,
      datos.cliente_id,
      datos.cliente_nombre,
      datos.vendedor_id,
      datos.vendedor_nombre,
      datos.subtotal,
      datos.descuento,
      datos.total,
      datos.metodo_pago,
      estadoPago,
      saldoPendiente,
      datos.fecha_vencimiento || null,
      datos.observaciones || null
    ]);

    const ventaId = resultadoVenta.insertId;

    // Insertar detalles de la venta
    for (const producto of datos.productos) {
      const queryDetalle = `
        INSERT INTO ventas_detalle (
          venta_id, producto_id, producto_nombre, producto_marca,
          producto_codigo, cantidad, precio_unitario, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await executeQuery(queryDetalle, [
        ventaId,
        producto.producto_id,
        producto.producto_nombre,
        producto.producto_marca || null,
        producto.producto_codigo || null,
        producto.cantidad,
        producto.precio_unitario,
        producto.subtotal
      ]);

      // Actualizar stock del producto en productos_sucursal
      const queryUpdateStock = `
        UPDATE productos_sucursal
        SET stock = stock - ?
        WHERE producto_id = ? AND sucursal = ?
      `;

      await executeQuery(queryUpdateStock, [
        producto.cantidad,
        producto.producto_id,
        datos.sucursal
      ]);
    }

    // Si es cuenta corriente, registrar movimiento
    if (datos.metodo_pago === 'cuenta_corriente') {
      // Calcular saldo actual del cliente
      const querySaldoActual = `
        SELECT COALESCE(SUM(debe) - SUM(haber), 0) as saldo
        FROM cuenta_corriente_movimientos
        WHERE sucursal = ? AND cliente_id = ?
      `;
      const resultadoSaldo = await executeQuery<RowDataPacket[]>(querySaldoActual, [
        datos.sucursal,
        datos.cliente_id
      ]);

      const saldoAnterior = resultadoSaldo.length > 0 ? parseFloat(resultadoSaldo[0].saldo) : 0;
      const nuevoSaldo = saldoAnterior + datos.total;

      const queryMovimiento = `
        INSERT INTO cuenta_corriente_movimientos (
          sucursal, cliente_id, cliente_nombre, tipo,
          debe, haber, saldo, venta_id, descripcion, fecha_movimiento
        ) VALUES (?, ?, ?, 'venta', ?, 0, ?, ?, ?, NOW())
      `;

      await executeQuery(queryMovimiento, [
        datos.sucursal,
        datos.cliente_id,
        datos.cliente_nombre,
        datos.total,
        nuevoSaldo,
        ventaId,
        `Venta ${numeroVenta}`
      ]);
    }

    res.status(201).json({
      success: true,
      message: 'Venta creada exitosamente',
      data: {
        id: ventaId,
        numero_venta: numeroVenta,
        metodo_pago: datos.metodo_pago,
        total: datos.total,
        estado_pago: estadoPago
      }
    });

  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la venta',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener ventas por sucursal (con filtros opcionales)
 * GET /api/ventas/sucursal/:sucursal
 */
export const obtenerVentasPorSucursal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.params;
    const { fecha_inicio, fecha_fin, cliente_id, metodo_pago, estado_pago } = req.query;

    let query = `
      SELECT 
        v.*,
        COUNT(vd.id) as total_productos
      FROM ventas v
      LEFT JOIN ventas_detalle vd ON v.id = vd.venta_id
      WHERE v.sucursal = ?
    `;

    const params: any[] = [sucursal];

    // Filtros opcionales
    if (fecha_inicio) {
      query += ` AND DATE(v.fecha_venta) >= ?`;
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ` AND DATE(v.fecha_venta) <= ?`;
      params.push(fecha_fin);
    }

    if (cliente_id) {
      query += ` AND v.cliente_id = ?`;
      params.push(cliente_id);
    }

    if (metodo_pago) {
      query += ` AND v.metodo_pago = ?`;
      params.push(metodo_pago);
    }

    if (estado_pago) {
      query += ` AND v.estado_pago = ?`;
      params.push(estado_pago);
    }

    query += ` GROUP BY v.id ORDER BY v.fecha_venta DESC`;

    const ventas = await executeQuery<RowDataPacket[]>(query, params);

    res.status(200).json({
      success: true,
      data: ventas,
      count: ventas.length
    });

  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las ventas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener detalle completo de una venta
 * GET /api/ventas/:id
 */
export const obtenerDetalleVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Obtener venta principal
    const queryVenta = `SELECT * FROM ventas WHERE id = ?`;
    const venta = await executeQuery<RowDataPacket[]>(queryVenta, [id]);

    if (venta.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
      return;
    }

    // Obtener detalles de productos
    const queryDetalle = `SELECT * FROM ventas_detalle WHERE venta_id = ?`;
    const detalles = await executeQuery<RowDataPacket[]>(queryDetalle, [id]);

    res.status(200).json({
      success: true,
      data: {
        ...venta[0],
        productos: detalles
      }
    });

  } catch (error) {
    console.error('Error al obtener detalle de venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el detalle de la venta',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener ventas por cliente
 * GET /api/ventas/cliente/:sucursal/:cliente_id
 */
export const obtenerVentasPorCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, cliente_id } = req.params;

    const query = `
      SELECT 
        v.*,
        COUNT(vd.id) as total_productos
      FROM ventas v
      LEFT JOIN ventas_detalle vd ON v.id = vd.venta_id
      WHERE v.sucursal = ? AND v.cliente_id = ?
      GROUP BY v.id
      ORDER BY v.fecha_venta DESC
    `;

    const ventas = await executeQuery<RowDataPacket[]>(query, [sucursal, cliente_id]);

    res.status(200).json({
      success: true,
      data: ventas,
      count: ventas.length
    });

  } catch (error) {
    console.error('Error al obtener ventas del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las ventas del cliente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener estado de cuenta corriente de un cliente
 * GET /api/ventas/cuenta-corriente/:sucursal/:cliente_id
 */
export const obtenerCuentaCorriente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, cliente_id } = req.params;

    // Obtener todos los movimientos
    const queryMovimientos = `
      SELECT * FROM cuenta_corriente_movimientos
      WHERE sucursal = ? AND cliente_id = ?
      ORDER BY fecha_movimiento DESC
    `;

    const movimientos = await executeQuery<RowDataPacket[]>(queryMovimientos, [sucursal, cliente_id]);

    // Calcular saldo actual
    const querySaldo = `
      SELECT 
        COALESCE(SUM(debe), 0) as total_debe,
        COALESCE(SUM(haber), 0) as total_haber,
        COALESCE(SUM(debe) - SUM(haber), 0) as saldo_actual
      FROM cuenta_corriente_movimientos
      WHERE sucursal = ? AND cliente_id = ?
    `;

    const saldo = await executeQuery<RowDataPacket[]>(querySaldo, [sucursal, cliente_id]);

    res.status(200).json({
      success: true,
      data: {
        movimientos,
        resumen: saldo[0]
      }
    });

  } catch (error) {
    console.error('Error al obtener cuenta corriente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la cuenta corriente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Registrar un pago en cuenta corriente
 * POST /api/ventas/pago-cuenta-corriente
 */
export const registrarPagoCuentaCorriente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, cliente_id, cliente_nombre, monto, metodo_pago, comprobante, observaciones } = req.body;

    // Validaciones
    if (!sucursal || !cliente_id || !monto || !metodo_pago) {
      res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
      return;
    }

    if (monto <= 0) {
      res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a cero'
      });
      return;
    }

    // Registrar el pago
    const queryPago = `
      INSERT INTO pagos_cuenta_corriente (
        sucursal, cliente_id, cliente_nombre, monto, metodo_pago,
        comprobante, observaciones, fecha_pago
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const resultadoPago = await executeQuery<ResultSetHeader>(queryPago, [
      sucursal,
      cliente_id,
      cliente_nombre,
      monto,
      metodo_pago,
      comprobante || null,
      observaciones || null
    ]);

    const pagoId = resultadoPago.insertId;

    // Calcular saldo actual
    const querySaldoActual = `
      SELECT COALESCE(SUM(debe) - SUM(haber), 0) as saldo
      FROM cuenta_corriente_movimientos
      WHERE sucursal = ? AND cliente_id = ?
    `;

    const resultadoSaldo = await executeQuery<RowDataPacket[]>(querySaldoActual, [sucursal, cliente_id]);
    const saldoAnterior = resultadoSaldo.length > 0 ? parseFloat(resultadoSaldo[0].saldo) : 0;
    const nuevoSaldo = saldoAnterior - monto;

    // Registrar movimiento en cuenta corriente
    const queryMovimiento = `
      INSERT INTO cuenta_corriente_movimientos (
        sucursal, cliente_id, cliente_nombre, tipo,
        debe, haber, saldo, pago_id, descripcion, fecha_movimiento
      ) VALUES (?, ?, ?, 'pago', 0, ?, ?, ?, ?, NOW())
    `;

    await executeQuery(queryMovimiento, [
      sucursal,
      cliente_id,
      cliente_nombre,
      monto,
      nuevoSaldo,
      pagoId,
      `Pago ${metodo_pago}${comprobante ? ` - ${comprobante}` : ''}`
    ]);

    // Actualizar ventas pendientes (aplicar pago a las más antiguas)
    const queryVentasPendientes = `
      SELECT id, saldo_pendiente FROM ventas
      WHERE sucursal = ? AND cliente_id = ? AND estado_pago != 'pagado'
      ORDER BY fecha_venta ASC
    `;

    const ventasPendientes = await executeQuery<RowDataPacket[]>(queryVentasPendientes, [sucursal, cliente_id]);

    let montoPendiente = monto;

    for (const venta of ventasPendientes) {
      if (montoPendiente <= 0) break;

      const saldoVenta = parseFloat(venta.saldo_pendiente);

      if (montoPendiente >= saldoVenta) {
        // Pagar la venta completa
        await executeQuery(`UPDATE ventas SET estado_pago = 'pagado', saldo_pendiente = 0 WHERE id = ?`, [venta.id]);
        montoPendiente -= saldoVenta;
      } else {
        // Pago parcial
        const nuevoSaldoVenta = saldoVenta - montoPendiente;
        await executeQuery(
          `UPDATE ventas SET estado_pago = 'parcial', saldo_pendiente = ? WHERE id = ?`,
          [nuevoSaldoVenta, venta.id]
        );
        montoPendiente = 0;
      }
    }

    res.status(201).json({
      success: true,
      message: 'Pago registrado exitosamente',
      data: {
        pago_id: pagoId,
        monto,
        saldo_nuevo: nuevoSaldo
      }
    });

  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar el pago',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener reportes de ventas por rango de fechas
 * GET /api/ventas/reportes/:sucursal
 */
export const obtenerReportesVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    // Validaciones
    if (!fecha_inicio || !fecha_fin) {
      res.status(400).json({
        success: false,
        message: 'Se requieren fecha_inicio y fecha_fin'
      });
      return;
    }

    // Resumen general
    const queryResumen = `
      SELECT 
        COUNT(*) as total_ventas,
        SUM(total) as total_vendido,
        SUM(descuento) as total_descuentos,
        AVG(total) as promedio_venta
      FROM ventas
      WHERE sucursal = ? 
        AND DATE(fecha_venta) BETWEEN ? AND ?
    `;

    const resumen = await executeQuery<RowDataPacket[]>(queryResumen, [sucursal, fecha_inicio, fecha_fin]);

    // Ventas por método de pago
    const queryMetodosPago = `
      SELECT 
        metodo_pago,
        COUNT(*) as cantidad,
        SUM(total) as total
      FROM ventas
      WHERE sucursal = ? 
        AND DATE(fecha_venta) BETWEEN ? AND ?
      GROUP BY metodo_pago
    `;

    const metodosPago = await executeQuery<RowDataPacket[]>(queryMetodosPago, [sucursal, fecha_inicio, fecha_fin]);

    // Ventas por día
    const queryPorDia = `
      SELECT 
        DATE(fecha_venta) as fecha,
        COUNT(*) as cantidad,
        SUM(total) as total
      FROM ventas
      WHERE sucursal = ? 
        AND DATE(fecha_venta) BETWEEN ? AND ?
      GROUP BY DATE(fecha_venta)
      ORDER BY fecha ASC
    `;

    const ventasPorDia = await executeQuery<RowDataPacket[]>(queryPorDia, [sucursal, fecha_inicio, fecha_fin]);

    // Top productos vendidos
    const queryTopProductos = `
      SELECT 
        vd.producto_nombre,
        vd.producto_marca,
        SUM(vd.cantidad) as cantidad_vendida,
        SUM(vd.subtotal) as total_vendido
      FROM ventas_detalle vd
      INNER JOIN ventas v ON vd.venta_id = v.id
      WHERE v.sucursal = ? 
        AND DATE(v.fecha_venta) BETWEEN ? AND ?
      GROUP BY vd.producto_id, vd.producto_nombre, vd.producto_marca
      ORDER BY cantidad_vendida DESC
      LIMIT 10
    `;

    const topProductos = await executeQuery<RowDataPacket[]>(queryTopProductos, [sucursal, fecha_inicio, fecha_fin]);

    // Top clientes
    const queryTopClientes = `
      SELECT 
        cliente_id,
        cliente_nombre,
        COUNT(*) as total_compras,
        SUM(total) as total_gastado
      FROM ventas
      WHERE sucursal = ? 
        AND DATE(fecha_venta) BETWEEN ? AND ?
      GROUP BY cliente_id, cliente_nombre
      ORDER BY total_gastado DESC
      LIMIT 10
    `;

    const topClientes = await executeQuery<RowDataPacket[]>(queryTopClientes, [sucursal, fecha_inicio, fecha_fin]);

    res.status(200).json({
      success: true,
      data: {
        periodo: {
          desde: fecha_inicio,
          hasta: fecha_fin
        },
        resumen: resumen[0],
        metodos_pago: metodosPago,
        ventas_por_dia: ventasPorDia,
        top_productos: topProductos,
        top_clientes: topClientes
      }
    });

  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los reportes',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener todos los clientes con su estado de cuenta corriente
 * GET /api/ventas/clientes-cuenta-corriente/:sucursal
 */
export const obtenerClientesCuentaCorriente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.params;

    const query = `
      SELECT 
        sucursal,
        cliente_id,
        cliente_nombre,
        SUM(debe) as total_debe,
        SUM(haber) as total_haber,
        (SUM(debe) - SUM(haber)) as saldo_actual,
        MAX(fecha_movimiento) as ultimo_movimiento
      FROM cuenta_corriente_movimientos
      WHERE sucursal = ?
      GROUP BY sucursal, cliente_id, cliente_nombre
      HAVING saldo_actual != 0
      ORDER BY saldo_actual DESC
    `;

    const clientes = await executeQuery<RowDataPacket[]>(query, [sucursal]);

    res.status(200).json({
      success: true,
      data: clientes,
      count: clientes.length
    });

  } catch (error) {
    console.error('Error al obtener clientes con cuenta corriente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los clientes',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};





