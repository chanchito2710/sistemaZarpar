/**
 * Controlador para gestión de ventas
 * Maneja todas las operaciones relacionadas con ventas, cuenta corriente y reportes
 */

import { Request, Response } from 'express';
import { executeQuery } from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { registrarMovimientoStock } from '../utils/historialStock.js';

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

      // Obtener stock actual antes de actualizar (para el historial)
      const queryStockActual = `
        SELECT stock, stock_fallas 
        FROM productos_sucursal
        WHERE producto_id = ? AND sucursal = ?
      `;
      
      const stockActual = await executeQuery<RowDataPacket[]>(queryStockActual, [
        producto.producto_id,
        datos.sucursal
      ]);

      const stockAnterior = stockActual[0]?.stock || 0;
      const stockFallasAnterior = stockActual[0]?.stock_fallas || 0;

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

      // 📝 Registrar movimiento en historial de stock
      await registrarMovimientoStock({
        sucursal: datos.sucursal,
        producto_id: producto.producto_id,
        producto_nombre: producto.producto_nombre,
        cliente_id: datos.cliente_id,
        cliente_nombre: datos.cliente_nombre,
        stock_anterior: stockAnterior,
        stock_nuevo: stockAnterior - producto.cantidad,
        stock_fallas_anterior: stockFallasAnterior,
        stock_fallas_nuevo: stockFallasAnterior,
        tipo_movimiento: 'venta',
        referencia: numeroVenta,
        usuario_email: (req as any).usuario?.email || 'sistema',
        observaciones: `Venta de ${producto.cantidad} unidad(es)`
      });
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

    // ==========================================
    // REGISTRAR COMISIONES
    // ==========================================
    
    // ⭐ VERIFICAR SI EL VENDEDOR COBRA COMISIONES
    const queryVendedor = 'SELECT cobra_comisiones FROM vendedores WHERE id = ?';
    const [vendedorData] = await executeQuery<RowDataPacket[]>(queryVendedor, [datos.vendedor_id]);
    
    // Si el vendedor NO cobra comisiones, saltar este paso
    if (!vendedorData || vendedorData.cobra_comisiones === 0) {
      console.log(`Vendedor ${datos.vendedor_id} no cobra comisiones. Omitiendo registro de comisiones.`);
    } else {
      // El vendedor SÍ cobra comisiones, proceder normalmente
      for (const producto of datos.productos) {
        // Obtener tipo del producto
        const queryProducto = 'SELECT tipo, nombre FROM productos WHERE id = ?';
        const [productoData] = await executeQuery<RowDataPacket[]>(queryProducto, [producto.producto_id]);
        
        if (productoData && productoData.tipo) {
        // ⭐ PRIMERO: Buscar comisión personalizada del vendedor
        const queryComisionPersonalizada = `
          SELECT monto_comision 
          FROM comisiones_por_vendedor 
          WHERE vendedor_id = ? AND tipo_producto = ? AND activo = 1
        `;
        const [comisionPersonalizada] = await executeQuery<RowDataPacket[]>(queryComisionPersonalizada, [
          datos.vendedor_id,
          productoData.tipo
        ]);
        
        // Si no tiene comisión personalizada, usar la global
        let comisionConfig = comisionPersonalizada;
        
        if (!comisionPersonalizada) {
          const queryComisionGlobal = `
            SELECT monto_comision 
            FROM configuracion_comisiones 
            WHERE tipo = ? AND activo = 1
          `;
          const [comisionGlobal] = await executeQuery<RowDataPacket[]>(queryComisionGlobal, [productoData.tipo]);
          comisionConfig = comisionGlobal;
        }
        
        if (comisionConfig && comisionConfig.monto_comision > 0) {
          const montoComision = comisionConfig.monto_comision * producto.cantidad;
          
          // Determinar estado de comisión según método de pago
          let estadoComision: 'pendiente' | 'pagada' = 'pagada';
          let montoCobrado = montoComision;
          let montoPendiente = 0;
          
          if (datos.metodo_pago === 'cuenta_corriente') {
            // Si es a crédito, la comisión queda pendiente
            estadoComision = 'pendiente';
            montoCobrado = 0;
            montoPendiente = montoComision;
          }
          
          // Registrar comisión
          const queryInsertComision = `
            INSERT INTO comisiones_vendedores (
              vendedor_id, venta_id, cliente_id, sucursal,
              producto_id, producto_nombre, tipo_producto, cantidad,
              monto_comision, monto_cobrado, monto_pendiente, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          await executeQuery<ResultSetHeader>(queryInsertComision, [
            datos.vendedor_id,
            ventaId,
            datos.cliente_id,
            datos.sucursal,
            producto.producto_id,
            productoData.nombre,
            productoData.tipo,
            producto.cantidad,
            montoComision,
            montoCobrado,
            montoPendiente,
            estadoComision
          ]);
        }
      }
      }
    }

    // 📦 REGISTRAR INGRESO A CAJA SI ES EFECTIVO
    if (datos.metodo_pago === 'efectivo') {
      try {
        // Obtener caja actual
        const [cajaActual] = await executeQuery<RowDataPacket[]>(
          'SELECT * FROM caja WHERE sucursal = ?',
          [datos.sucursal.toLowerCase()]
        );
        
        if (cajaActual) {
          const montoActual = Number(cajaActual.monto_actual);
          const nuevoMonto = montoActual + Number(datos.total);
          
          // Actualizar caja
          await executeQuery(
            'UPDATE caja SET monto_actual = ? WHERE sucursal = ?',
            [nuevoMonto, datos.sucursal.toLowerCase()]
          );
          
          // Registrar movimiento
          await executeQuery(
            `INSERT INTO movimientos_caja 
             (sucursal, tipo_movimiento, monto, monto_anterior, monto_nuevo, concepto, venta_id, usuario_id, usuario_email)
             VALUES (?, 'ingreso_venta', ?, ?, ?, ?, ?, ?, ?)`,
            [
              datos.sucursal.toLowerCase(),
              datos.total,
              montoActual,
              nuevoMonto,
              `Venta ${numeroVenta} - ${datos.cliente_nombre}`,
              ventaId,
              datos.vendedor_id,
              (req as any).user?.email || null
            ]
          );
        }
      } catch (cajaError) {
        console.error('⚠️ Error al registrar ingreso a caja:', cajaError);
        // No interrumpir la venta si falla el registro de caja
      }
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

    console.log(`🔍 [DETALLE VENTA] Solicitando detalle de venta ID: ${id}`);

    // Obtener venta principal
    const queryVenta = `
      SELECT 
        v.*,
        CAST(v.subtotal AS DECIMAL(10,2)) as subtotal,
        CAST(v.descuento AS DECIMAL(10,2)) as descuento,
        CAST(v.total AS DECIMAL(10,2)) as total
      FROM ventas v 
      WHERE v.id = ?
    `;
    const venta = await executeQuery<RowDataPacket[]>(queryVenta, [id]);

    console.log(`📦 [DETALLE VENTA] Venta encontrada:`, venta.length > 0 ? 'SÍ' : 'NO');

    if (venta.length === 0) {
      console.log(`❌ [DETALLE VENTA] Venta ID ${id} no encontrada`);
      res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
      return;
    }

    // Obtener detalles de productos vendidos con TODA la información
    const queryDetalle = `
      SELECT 
        vd.id,
        vd.venta_id,
        vd.producto_id,
        vd.cantidad,
        CAST(vd.precio_unitario AS DECIMAL(10,2)) as precio_venta,
        CAST(vd.subtotal AS DECIMAL(10,2)) as subtotal,
        vd.producto_nombre as nombre,
        p.tipo,
        p.marca,
        p.calidad,
        p.codigo_barras as codigo
      FROM ventas_detalle vd
      LEFT JOIN productos p ON vd.producto_id = p.id
      WHERE vd.venta_id = ?
      ORDER BY vd.id ASC
    `;
    
    console.log(`🔍 [DETALLE VENTA] Buscando productos para venta ID: ${id}`);
    const detalles = await executeQuery<RowDataPacket[]>(queryDetalle, [id]);
    console.log(`📦 [DETALLE VENTA] Productos encontrados: ${detalles.length}`);

    if (detalles.length > 0) {
      console.log('✅ [DETALLE VENTA] Primer producto:', detalles[0]);
    }

    // Normalizar datos de productos
    const productosNormalizados = detalles.map((prod: any) => ({
      ...prod,
      id: Number(prod.id) || 0,
      producto_id: Number(prod.producto_id) || 0,
      cantidad: Number(prod.cantidad) || 0,
      precio_venta: Number(prod.precio_venta) || 0,
      subtotal: Number(prod.subtotal) || 0,
    }));

    const respuesta = {
      ...venta[0],
      subtotal: Number(venta[0].subtotal) || 0,
      descuento: Number(venta[0].descuento) || 0,
      total: Number(venta[0].total) || 0,
      productos: productosNormalizados
    };

    console.log(`✅ [DETALLE VENTA] Respuesta enviada con ${productosNormalizados.length} productos`);

    res.status(200).json({
      success: true,
      data: respuesta
    });

  } catch (error) {
    console.error('❌ [DETALLE VENTA] Error:', error);
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

    // Obtener todos los movimientos (ordenados de más viejo a más nuevo)
    const queryMovimientos = `
      SELECT * FROM cuenta_corriente_movimientos
      WHERE sucursal = ? AND cliente_id = ?
      ORDER BY fecha_movimiento ASC
    `;

    const movimientos = await executeQuery<RowDataPacket[]>(queryMovimientos, [sucursal, cliente_id]);

    // Para cada movimiento de tipo 'venta', obtener los productos
    for (const mov of movimientos) {
      if (mov.tipo === 'venta' && mov.venta_id) {
        console.log(`🔍 Cargando productos para venta_id: ${mov.venta_id}`);
        
        // Obtener el detalle de la venta (incluyendo subtotal, descuento, total)
        const queryVenta = `
          SELECT subtotal, descuento, total
          FROM ventas
          WHERE id = ?
        `;
        const ventaInfoArray = await executeQuery<RowDataPacket[]>(queryVenta, [mov.venta_id]);
        const ventaInfo = ventaInfoArray.length > 0 ? ventaInfoArray[0] : null;
        
        // Obtener los productos de la venta
        const queryProductos = `
          SELECT 
            vd.producto_id,
            vd.producto_nombre,
            vd.producto_marca,
            p.tipo as producto_tipo,
            vd.cantidad,
            vd.precio_unitario,
            vd.subtotal
          FROM ventas_detalle vd
          LEFT JOIN productos p ON vd.producto_id = p.id
          WHERE vd.venta_id = ?
          ORDER BY vd.id ASC
        `;
        
        const productos = await executeQuery<RowDataPacket[]>(queryProductos, [mov.venta_id]);
        
        console.log(`📦 Productos encontrados: ${productos.length}`);
        if (productos.length > 0) {
          console.log('📦 Primer producto:', productos[0]);
        }
        
        // Agregar productos y datos de la venta al movimiento
        mov.productos = productos;
        if (ventaInfo) {
          mov.subtotal_venta = ventaInfo.subtotal;
          mov.descuento_venta = ventaInfo.descuento;
          mov.total_venta = ventaInfo.total;
          console.log(`💰 Descuento de venta: ${ventaInfo.descuento}`);
        }
      }
    }
    
    console.log(`📊 Total movimientos procesados: ${movimientos.length}`);

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
    const { sucursal, cliente_id, cliente_nombre, monto, metodo_pago, comprobante, observaciones, vendedor_id } = req.body;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💳 REGISTRAR PAGO DE CUENTA CORRIENTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Datos recibidos:', {
      sucursal,
      cliente_id,
      cliente_nombre,
      monto,
      metodo_pago,
      comprobante,
      vendedor_id_recibido: vendedor_id || 'NO ENVIADO'
    });

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
      SELECT id, saldo_pendiente, vendedor_id FROM ventas
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

    // ==========================================
    // ⭐ PROCESAR COMISIONES BASADO EN PRODUCTOS PAGADOS COMPLETAMENTE
    // ==========================================
    const comisionesCobradas: any[] = [];
    
    // 🔍 Si no se proporcionó vendedor_id, detectarlo automáticamente desde las comisiones pendientes
    let vendedorIdFinal = vendedor_id;
    
    if (!vendedorIdFinal) {
      const queryDetectarVendedor = `
        SELECT DISTINCT vendedor_id 
        FROM comisiones_vendedores 
        WHERE cliente_id = ? 
          AND sucursal = ? 
          AND estado = 'pendiente'
        LIMIT 1
      `;
      const vendedoresData = await executeQuery<RowDataPacket[]>(queryDetectarVendedor, [cliente_id, sucursal]);
      
      if (vendedoresData && vendedoresData.length > 0) {
        vendedorIdFinal = vendedoresData[0].vendedor_id;
        console.log(`🔍 Vendedor detectado automáticamente: ${vendedorIdFinal}`);
      } else {
        console.log('⚠️ No se encontró ningún vendedor con comisiones pendientes para este cliente');
      }
    }
    
    // Solo procesar comisiones si se encontró un vendedor Y el pago es en efectivo o transferencia
    if (vendedorIdFinal && (metodo_pago === 'efectivo' || metodo_pago === 'transferencia')) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💰 PROCESANDO COMISIONES PROPORCIONALES');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Obtener la deuda total y las comisiones pendientes del cliente
      const queryDeudaTotal = `
        SELECT 
          COALESCE(SUM(v.saldo_pendiente), 0) as deuda_total,
          COALESCE(SUM(cv.monto_comision), 0) as comisiones_totales
        FROM ventas v
        LEFT JOIN comisiones_vendedores cv ON cv.venta_id = v.id AND cv.estado = 'pendiente'
        WHERE v.sucursal = ? 
          AND v.cliente_id = ? 
          AND v.estado_pago != 'pagado'
          AND v.vendedor_id = ?
      `;
      
      const resultDeuda = await executeQuery<RowDataPacket[]>(queryDeudaTotal, [sucursal, cliente_id, vendedorIdFinal]);
      const deudaTotal = parseFloat(resultDeuda[0]?.deuda_total || 0);
      const comisionesTotales = parseFloat(resultDeuda[0]?.comisiones_totales || 0);
      
      console.log(`💵 Monto del pago: $${monto}`);
      console.log(`💰 Deuda total: $${deudaTotal.toFixed(2)}`);
      console.log(`🎯 Comisiones totales pendientes: $${comisionesTotales.toFixed(2)}`);
      
      if (deudaTotal > 0 && comisionesTotales > 0) {
        // Calcular el porcentaje pagado
        const porcentajePagado = monto / deudaTotal;
        const montoComisPorPagar = comisionesTotales * porcentajePagado;
        
        console.log(`📊 Porcentaje pagado: ${(porcentajePagado * 100).toFixed(2)}%`);
        console.log(`💰 Monto de comisiones a cobrar: $${montoComisPorPagar.toFixed(2)}`);
        
        // Obtener comisiones pendientes ordenadas por MAYOR comisión primero
        const queryComisionesPendientes = `
          SELECT 
            id as comision_id,
            tipo_producto,
            producto_nombre,
            cantidad,
            monto_comision
          FROM comisiones_vendedores
          WHERE vendedor_id = ?
            AND cliente_id = ?
            AND sucursal = ?
            AND estado = 'pendiente'
          ORDER BY 
            monto_comision DESC,
            id ASC
        `;
        
        const comisionesPendientes = await executeQuery<RowDataPacket[]>(queryComisionesPendientes, [vendedorIdFinal, cliente_id, sucursal]);
        
        console.log(`📦 Comisiones pendientes: ${comisionesPendientes.length}`);
        
        let montoRestanteComision = montoComisPorPagar;
        
        // Ir cubriendo comisiones en orden de prioridad (mayor comisión primero)
        for (const comision of comisionesPendientes) {
          const montoComision = parseFloat(comision.monto_comision);
          
          console.log(`\n📦 ${comision.tipo_producto} - ${comision.producto_nombre}`);
          console.log(`   💰 Comisión: $${montoComision.toFixed(2)}`);
          console.log(`   💳 Disponible: $${montoRestanteComision.toFixed(2)}`);
          
          if (montoRestanteComision >= montoComision) {
            // ✅ Alcanza para cubrir esta comisión COMPLETA
            montoRestanteComision -= montoComision;
            
            console.log(`   ✅ COMPLETA - Cobrado: $${montoComision.toFixed(2)}`);
            
            await executeQuery(`
              UPDATE comisiones_vendedores 
              SET 
                monto_cobrado = monto_comision,
                monto_pendiente = 0,
                estado = 'pagada',
                fecha_cobro = NOW(),
                pago_cuenta_corriente_id = ?
              WHERE id = ?
            `, [pagoId, comision.comision_id]);
            
            comisionesCobradas.push({
              tipo: comision.tipo_producto,
              producto: comision.producto_nombre,
              cantidad: comision.cantidad,
              monto: montoComision
            });
            
          } else if (montoRestanteComision > 0) {
            // ⚠️ Cubre PARCIALMENTE esta comisión
            const montoCobrado = montoRestanteComision;
            const montoPendiente = montoComision - montoCobrado;
            
            console.log(`   ⚠️ PARCIAL - Cobrado: $${montoCobrado.toFixed(2)} | Pendiente: $${montoPendiente.toFixed(2)}`);
            
            await executeQuery(`
              UPDATE comisiones_vendedores 
              SET 
                monto_cobrado = monto_cobrado + ?,
                monto_pendiente = ?,
                estado = 'parcial',
                pago_cuenta_corriente_id = ?
              WHERE id = ?
            `, [montoCobrado, montoPendiente, pagoId, comision.comision_id]);
            
            comisionesCobradas.push({
              tipo: comision.tipo_producto,
              producto: comision.producto_nombre,
              cantidad: comision.cantidad,
              monto: montoCobrado
            });
            
            montoRestanteComision = 0;
            break;
            
          } else {
            // ❌ No queda dinero
            console.log(`   ❌ SIN FONDOS - Queda pendiente`);
            break;
          }
        }
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Total comisiones cobradas: $${(montoComisPorPagar - montoRestanteComision).toFixed(2)}`);
        console.log(`📊 Comisiones procesadas: ${comisionesCobradas.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
    }

    // 📦 REGISTRAR INGRESO A CAJA SI ES EFECTIVO
    if (metodo_pago === 'efectivo') {
      try {
        // Obtener caja actual
        const [cajaActual] = await executeQuery<RowDataPacket[]>(
          'SELECT * FROM caja WHERE sucursal = ?',
          [sucursal.toLowerCase()]
        );
        
        if (cajaActual) {
          const montoActual = Number(cajaActual.monto_actual);
          const nuevoMontoCaja = montoActual + Number(monto);
          
          // Actualizar caja
          await executeQuery(
            'UPDATE caja SET monto_actual = ? WHERE sucursal = ?',
            [nuevoMontoCaja, sucursal.toLowerCase()]
          );
          
          // Registrar movimiento
          await executeQuery(
            `INSERT INTO movimientos_caja 
             (sucursal, tipo_movimiento, monto, monto_anterior, monto_nuevo, concepto, pago_cuenta_corriente_id, usuario_id, usuario_email)
             VALUES (?, 'ingreso_cuenta_corriente', ?, ?, ?, ?, ?, ?, ?)`,
            [
              sucursal.toLowerCase(),
              monto,
              montoActual,
              nuevoMontoCaja,
              `Pago cuenta corriente - ${cliente_nombre}${comprobante ? ` (${comprobante})` : ''}`,
              pagoId,
              vendedorIdFinal || null,
              (req as any).user?.email || null
            ]
          );
        }
      } catch (cajaError) {
        console.error('⚠️ Error al registrar ingreso a caja:', cajaError);
        // No interrumpir el pago si falla el registro de caja
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PAGO REGISTRADO EXITOSAMENTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Resumen final:');
    console.log(`   - Pago ID: ${pagoId}`);
    console.log(`   - Monto pagado: $${monto}`);
    console.log(`   - Saldo nuevo: $${nuevoSaldo.toFixed(2)}`);
    console.log(`   - Comisiones cobradas: ${comisionesCobradas.length}`);
    
    res.status(201).json({
      success: true,
      message: 'Pago registrado exitosamente',
      data: {
        pago_id: pagoId,
        monto,
        saldo_nuevo: nuevoSaldo,
        comisiones_cobradas: comisionesCobradas.length,
        detalle_comisiones: comisionesCobradas
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

    // Construir nombre de tabla de clientes dinámicamente
    const tablaClientes = `clientes_${sucursal.toLowerCase()}`;

    const query = `
      SELECT 
        cc.sucursal,
        cc.cliente_id,
        cc.cliente_nombre,
        c.nombre_fantasia,
        SUM(cc.debe) as total_debe,
        SUM(cc.haber) as total_haber,
        (SUM(cc.debe) - SUM(cc.haber)) as saldo_actual,
        MAX(cc.fecha_movimiento) as ultimo_movimiento
      FROM cuenta_corriente_movimientos cc
      LEFT JOIN \`${tablaClientes}\` c ON cc.cliente_id = c.id
      WHERE cc.sucursal = ?
      GROUP BY cc.sucursal, cc.cliente_id, cc.cliente_nombre, c.nombre_fantasia
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

/**
 * Obtener historial completo de ventas (TODAS las sucursales o filtradas)
 * GET /api/ventas/historial
 * Query params: 
 *   - sucursal (opcional): filtrar por sucursal específica
 *   - fecha_desde (opcional): fecha inicio (YYYY-MM-DD)
 *   - fecha_hasta (opcional): fecha fin (YYYY-MM-DD)
 *   - metodo_pago (opcional): efectivo | transferencia | cuenta_corriente
 *   - estado_pago (opcional): pagado | pendiente | parcial
 */
export const obtenerHistorialVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Endpoint /api/ventas/historial llamado');
    console.log('Query params:', req.query);

    const { sucursal, fecha_desde, fecha_hasta, metodo_pago, estado_pago, con_descuento } = req.query;

    // Query base: obtener ventas con cantidad de productos
    let query = `
      SELECT 
        v.id,
        v.numero_venta,
        v.sucursal,
        v.cliente_id,
        v.cliente_nombre,
        v.vendedor_id,
        v.vendedor_nombre,
        v.subtotal,
        v.descuento,
        v.total,
        v.metodo_pago,
        v.estado_pago,
        v.saldo_pendiente,
        v.fecha_venta,
        v.observaciones,
        COUNT(vd.id) as total_productos
      FROM ventas v
      LEFT JOIN ventas_detalle vd ON v.id = vd.venta_id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Filtro por sucursal
    if (sucursal && sucursal !== 'todas') {
      query += ` AND v.sucursal = ?`;
      params.push(sucursal);
      console.log('🏢 Filtro sucursal:', sucursal);
    }

    // Filtro por fecha desde
    if (fecha_desde) {
      query += ` AND DATE(v.fecha_venta) >= ?`;
      params.push(fecha_desde);
      console.log('📅 Filtro fecha_desde:', fecha_desde);
    }

    // Filtro por fecha hasta
    if (fecha_hasta) {
      query += ` AND DATE(v.fecha_venta) <= ?`;
      params.push(fecha_hasta);
      console.log('📅 Filtro fecha_hasta:', fecha_hasta);
    }

    // Filtro por método de pago
    if (metodo_pago && metodo_pago !== 'todos') {
      query += ` AND v.metodo_pago = ?`;
      params.push(metodo_pago);
      console.log('💳 Filtro metodo_pago:', metodo_pago);
    }

    // Filtro por estado de pago
    if (estado_pago && estado_pago !== 'todos') {
      query += ` AND v.estado_pago = ?`;
      params.push(estado_pago);
      console.log('✅ Filtro estado_pago:', estado_pago);
    }

    // Filtro por ventas con descuento
    if (con_descuento === 'true') {
      query += ` AND v.descuento > 0`;
      console.log('💰 Filtro con_descuento: true (solo ventas con descuentos)');
    }

    query += ` GROUP BY v.id ORDER BY v.fecha_venta DESC`;

    console.log('🔍 Query SQL:', query);
    console.log('🔍 Params:', params);

    const ventas = await executeQuery<RowDataPacket[]>(query, params);

    console.log('✅ Ventas encontradas:', ventas.length);

    res.status(200).json({
      success: true,
      data: ventas,
      count: ventas.length
    });

  } catch (error) {
    console.error('❌ Error al obtener historial de ventas:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');

    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de ventas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener historial de pagos de cuenta corriente
 * Filtra por sucursal y rango de fechas
 */
export const obtenerHistorialPagosCuentaCorriente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, fechaDesde, fechaHasta } = req.query;

    console.log('📋 Obteniendo historial de pagos cuenta corriente:', {
      sucursal,
      fechaDesde,
      fechaHasta
    });

    // Construir query con filtros dinámicos
    let query = `
      SELECT 
        p.*,
        COALESCE(
          (SELECT saldo_actual 
           FROM resumen_cuenta_corriente r 
           WHERE r.sucursal = p.sucursal 
           AND r.cliente_id = p.cliente_id 
           LIMIT 1),
          0
        ) as saldo_actual_cliente
      FROM pagos_cuenta_corriente p
      WHERE 1=1
    `;

    const params: any[] = [];

    // Filtro por sucursal
    if (sucursal && sucursal !== 'todas') {
      query += ` AND p.sucursal = ?`;
      params.push(sucursal);
    }

    // Filtro por fecha desde
    if (fechaDesde) {
      query += ` AND DATE(p.fecha_pago) >= ?`;
      params.push(fechaDesde);
    }

    // Filtro por fecha hasta
    if (fechaHasta) {
      query += ` AND DATE(p.fecha_pago) <= ?`;
      params.push(fechaHasta);
    }

    // Ordenar por fecha más reciente primero
    query += ` ORDER BY p.fecha_pago DESC`;

    const pagos = await executeQuery<RowDataPacket[]>(query, params);

    // Obtener estadísticas
    let statsQuery = `
      SELECT 
        COUNT(*) as total_pagos,
        SUM(monto) as total_cobrado,
        AVG(monto) as promedio_pago,
        SUM(CASE WHEN metodo_pago = 'efectivo' THEN monto ELSE 0 END) as total_efectivo,
        SUM(CASE WHEN metodo_pago = 'transferencia' THEN monto ELSE 0 END) as total_transferencia
      FROM pagos_cuenta_corriente
      WHERE 1=1
    `;

    const statsParams: any[] = [];

    if (sucursal && sucursal !== 'todas') {
      statsQuery += ` AND sucursal = ?`;
      statsParams.push(sucursal);
    }

    if (fechaDesde) {
      statsQuery += ` AND DATE(fecha_pago) >= ?`;
      statsParams.push(fechaDesde);
    }

    if (fechaHasta) {
      statsQuery += ` AND DATE(fecha_pago) <= ?`;
      statsParams.push(fechaHasta);
    }

    const stats = await executeQuery<RowDataPacket[]>(statsQuery, statsParams);

    console.log(`✅ Encontrados ${pagos.length} pagos`);

    res.json({
      success: true,
      data: {
        pagos,
        estadisticas: stats[0] || {
          total_pagos: 0,
          total_cobrado: 0,
          promedio_pago: 0,
          total_efectivo: 0,
          total_transferencia: 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener historial de pagos cuenta corriente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de pagos cuenta corriente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener últimas ventas para el Dashboard
 * GET /api/ventas/ultimas/:limit?sucursal=xxx
 */
export const obtenerUltimasVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const limitParam = req.params.limit;
    const limit = limitParam ? parseInt(limitParam) : 4;
    const { sucursal } = req.query;

    // Validar que limit sea un número válido
    if (isNaN(limit) || limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        message: 'Límite inválido. Debe ser un número entre 1 y 100'
      });
      return;
    }

    // Query para obtener las últimas ventas (con filtro opcional de sucursal)
    let query = `
      SELECT 
        v.id,
        v.numero_venta,
        v.sucursal,
        v.cliente_nombre,
        v.total,
        v.metodo_pago,
        v.fecha_venta
      FROM ventas v
    `;
    
    const params: any[] = [];
    
    // Si se proporciona sucursal, filtrar por ella
    if (sucursal && typeof sucursal === 'string' && sucursal !== 'todas') {
      query += ` WHERE v.sucursal = ?`;
      params.push(sucursal);
    }
    
    // NOTA: LIMIT no acepta placeholders en MySQL, debe ser literal
    // Ya validamos que limit es un número seguro (1-100)
    query += ` ORDER BY v.fecha_venta DESC LIMIT ${limit}`;

    const ventas = await executeQuery<RowDataPacket[]>(query, params);

    // Obtener primer producto para cada venta
    for (const venta of ventas) {
      const queryProducto = `
        SELECT producto_nombre
        FROM ventas_detalle
        WHERE venta_id = ?
        LIMIT 1
      `;
      const productos = await executeQuery<RowDataPacket[]>(queryProducto, [venta.id]);
      venta.primer_producto = productos.length > 0 ? productos[0].producto_nombre : null;
    }

    res.status(200).json({
      success: true,
      data: ventas,
      count: ventas.length
    });

  } catch (error) {
    console.error('Error al obtener últimas ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las últimas ventas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener ventas del día actual
 * GET /api/ventas/ventas-del-dia
 * Query params: sucursal (opcional) - Si se proporciona, filtra por sucursal
 */
export const obtenerVentasDelDia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal } = req.query;
    
    // Construir condición WHERE base
    let whereCondition = 'WHERE DATE(fecha_venta) = CURDATE()';
    const params: any[] = [];
    
    // Si se proporciona sucursal, agregar filtro
    if (sucursal && sucursal !== 'todas') {
      whereCondition += ' AND sucursal = ?';
      params.push(sucursal);
    }
    
    // Query para obtener ventas del día actual
    const query = `
      SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as total_ingresos,
        COALESCE(SUM(descuento), 0) as total_descuentos
      FROM ventas
      ${whereCondition}
    `;

    const resultado = await executeQuery<RowDataPacket[]>(query, params);
    const resumen = resultado[0];

    // Query para obtener ventas por sucursal del día
    const queryPorSucursal = `
      SELECT 
        sucursal,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total
      FROM ventas
      ${whereCondition}
      GROUP BY sucursal
    `;

    const porSucursal = await executeQuery<RowDataPacket[]>(queryPorSucursal, params);

    // Query para obtener ventas por método de pago del día
    const queryPorMetodo = `
      SELECT 
        metodo_pago,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total
      FROM ventas
      ${whereCondition}
      GROUP BY metodo_pago
    `;

    const porMetodoPago = await executeQuery<RowDataPacket[]>(queryPorMetodo, params);

    res.status(200).json({
      success: true,
      data: {
        total_ventas: parseInt(resumen.total_ventas),
        total_ingresos: parseFloat(resumen.total_ingresos),
        total_descuentos: parseFloat(resumen.total_descuentos),
        por_sucursal: porSucursal,
        por_metodo_pago: porMetodoPago
      }
    });

  } catch (error) {
    console.error('Error al obtener ventas del día:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las ventas del día',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Guardar resumen diario de ventas
 * POST /api/ventas/guardar-resumen-diario
 */
export const guardarResumenDiario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha } = req.body;
    const fechaResumen = fecha || new Date().toISOString().split('T')[0];

    // Obtener ventas del día especificado
    const query = `
      SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as total_ingresos
      FROM ventas
      WHERE DATE(fecha_venta) = ?
    `;

    const resultado = await executeQuery<RowDataPacket[]>(query, [fechaResumen]);
    const resumen = resultado[0];

    // Obtener por sucursal
    const queryPorSucursal = `
      SELECT 
        sucursal,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total
      FROM ventas
      WHERE DATE(fecha_venta) = ?
      GROUP BY sucursal
    `;

    const porSucursal = await executeQuery<RowDataPacket[]>(queryPorSucursal, [fechaResumen]);

    // Obtener por método de pago
    const queryPorMetodo = `
      SELECT 
        metodo_pago,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total
      FROM ventas
      WHERE DATE(fecha_venta) = ?
      GROUP BY metodo_pago
    `;

    const porMetodoPago = await executeQuery<RowDataPacket[]>(queryPorMetodo, [fechaResumen]);

    // Insertar o actualizar resumen
    const queryInsert = `
      INSERT INTO ventas_diarias_resumen 
        (fecha, total_ventas, total_ingresos, por_sucursal, por_metodo_pago)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        total_ventas = VALUES(total_ventas),
        total_ingresos = VALUES(total_ingresos),
        por_sucursal = VALUES(por_sucursal),
        por_metodo_pago = VALUES(por_metodo_pago)
    `;

    await executeQuery(queryInsert, [
      fechaResumen,
      resumen.total_ventas,
      resumen.total_ingresos,
      JSON.stringify(porSucursal),
      JSON.stringify(porMetodoPago)
    ]);

    res.status(200).json({
      success: true,
      message: 'Resumen diario guardado exitosamente',
      data: {
        fecha: fechaResumen,
        total_ventas: parseInt(resumen.total_ventas),
        total_ingresos: parseFloat(resumen.total_ingresos)
      }
    });

  } catch (error) {
    console.error('Error al guardar resumen diario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar el resumen diario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener historial de ventas diarias (Ventas Globales)
 * GET /api/ventas/ventas-globales
 */
export const obtenerVentasGlobales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_desde, fecha_hasta, sucursal } = req.query;

    let query = `
      SELECT 
        fecha,
        total_ventas,
        total_ingresos,
        por_sucursal,
        por_metodo_pago,
        created_at
      FROM ventas_diarias_resumen
      WHERE 1=1
    `;

    const params: any[] = [];

    // Filtro por fecha desde
    if (fecha_desde) {
      query += ` AND fecha >= ?`;
      params.push(fecha_desde);
    }

    // Filtro por fecha hasta
    if (fecha_hasta) {
      query += ` AND fecha <= ?`;
      params.push(fecha_hasta);
    }

    // Filtro por sucursal (buscar en JSON)
    if (sucursal && sucursal !== 'todas') {
      query += ` AND JSON_SEARCH(por_sucursal, 'one', ?, NULL, '$[*].sucursal') IS NOT NULL`;
      params.push(sucursal);
    }

    query += ` ORDER BY fecha DESC`;

    const resumenes = await executeQuery<RowDataPacket[]>(query, params);

    // Parsear JSON en los resultados
    // MySQL ya devuelve los campos JSON como objetos, solo parseamos si son strings
    const resumenesParseados = resumenes.map(r => ({
      ...r,
      por_sucursal: typeof r.por_sucursal === 'string' ? JSON.parse(r.por_sucursal || '[]') : (r.por_sucursal || []),
      por_metodo_pago: typeof r.por_metodo_pago === 'string' ? JSON.parse(r.por_metodo_pago || '[]') : (r.por_metodo_pago || [])
    }));

    res.status(200).json({
      success: true,
      data: resumenesParseados,
      count: resumenesParseados.length
    });

  } catch (error) {
    console.error('Error al obtener ventas globales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial de ventas globales',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener ventas detalladas con filtros (para reportes completos)
 * GET /api/ventas/ventas-detalladas
 * Query params: fecha_desde, fecha_hasta, sucursal
 */
export const obtenerVentasDetalladas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_desde, fecha_hasta, sucursal } = req.query;

    console.log('📊 [VENTAS DETALLADAS] Filtros recibidos:', { fecha_desde, fecha_hasta, sucursal });

    let query = `
      SELECT 
        v.id,
        v.numero_venta,
        v.fecha_venta,
        v.sucursal,
        CAST(v.total AS DECIMAL(10,2)) as total,
        v.metodo_pago,
        v.estado_pago,
        v.cliente_id,
        v.cliente_nombre,
        v.vendedor_id,
        v.vendedor_nombre,
        v.observaciones,
        (SELECT COUNT(*) FROM ventas_detalle WHERE venta_id = v.id) as cantidad_productos,
        (SELECT GROUP_CONCAT(DISTINCT p.tipo SEPARATOR ', ') 
         FROM ventas_detalle vd 
         INNER JOIN productos p ON vd.producto_id = p.id 
         WHERE vd.venta_id = v.id) as tipos_productos
      FROM ventas v
      WHERE 1=1
    `;

    const params: any[] = [];

    // Filtro por fecha desde
    if (fecha_desde) {
      query += ` AND DATE(v.fecha_venta) >= ?`;
      params.push(fecha_desde);
    }

    // Filtro por fecha hasta
    if (fecha_hasta) {
      query += ` AND DATE(v.fecha_venta) <= ?`;
      params.push(fecha_hasta);
    }

    // Filtro por sucursal
    if (sucursal && sucursal !== 'todas') {
      query += ` AND v.sucursal = ?`;
      params.push(sucursal);
    }

    query += ` ORDER BY v.fecha_venta DESC, v.id DESC`;

    console.log('🔍 [VENTAS DETALLADAS] Query SQL:', query);
    console.log('📝 [VENTAS DETALLADAS] Parámetros:', params);

    const ventas = await executeQuery<RowDataPacket[]>(query, params);

    console.log(`✅ [VENTAS DETALLADAS] Ventas encontradas: ${ventas.length}`);
    
    // Log de sucursales únicas encontradas
    const sucursalesEncontradas = [...new Set(ventas.map((v: any) => v.sucursal))];
    console.log('🏢 [VENTAS DETALLADAS] Sucursales con ventas:', sucursalesEncontradas);

    // Normalizar datos para asegurar tipos correctos
    const ventasNormalizadas = ventas.map((venta: any) => ({
      ...venta,
      id: Number(venta.id) || 0,
      total: Number(venta.total) || 0,
      cliente_id: Number(venta.cliente_id) || 0,
      vendedor_id: Number(venta.vendedor_id) || 0,
      cantidad_productos: Number(venta.cantidad_productos) || 0,
    }));

    res.status(200).json({
      success: true,
      data: ventasNormalizadas,
      count: ventasNormalizadas.length
    });

  } catch (error) {
    console.error('❌ [VENTAS DETALLADAS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ventas detalladas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener pagos de un cliente (efectivo desde ventas + pagos de cuenta corriente)
 * GET /api/ventas/cliente/:sucursal/:cliente_id/pagos
 */
export const obtenerPagosCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, cliente_id } = req.params;
    const { fecha_desde, fecha_hasta } = req.query;

    // 1. Pagos en efectivo desde ventas
    let queryVentas = `
      SELECT 
        v.id,
        v.numero_venta,
        v.fecha_venta as fecha,
        v.total as monto,
        'Venta en efectivo' as tipo,
        v.metodo_pago,
        v.observaciones
      FROM ventas v
      WHERE v.sucursal = ?
        AND v.cliente_id = ?
        AND v.metodo_pago IN ('efectivo', 'transferencia')
        AND v.estado_pago = 'pagado'
    `;

    const paramsVentas: any[] = [sucursal, cliente_id];

    if (fecha_desde) {
      queryVentas += ' AND v.fecha_venta >= ?';
      paramsVentas.push(fecha_desde);
    }

    if (fecha_hasta) {
      queryVentas += ' AND v.fecha_venta <= ?';
      paramsVentas.push(fecha_hasta);
    }

    queryVentas += ' ORDER BY v.fecha_venta DESC';

    // 2. Pagos de cuenta corriente
    let queryPagosCC = `
      SELECT 
        p.id,
        CONCAT('PAGO-', p.id) as numero_venta,
        p.fecha_pago as fecha,
        p.monto as monto,
        'Pago Cuenta Corriente' as tipo,
        p.metodo_pago,
        p.observaciones
      FROM pagos_cuenta_corriente p
      WHERE p.sucursal = ?
        AND p.cliente_id = ?
    `;

    const paramsPagosCC: any[] = [sucursal, cliente_id];

    if (fecha_desde) {
      queryPagosCC += ' AND p.fecha_pago >= ?';
      paramsPagosCC.push(fecha_desde);
    }

    if (fecha_hasta) {
      queryPagosCC += ' AND p.fecha_pago <= ?';
      paramsPagosCC.push(fecha_hasta);
    }

    queryPagosCC += ' ORDER BY p.fecha_pago DESC';

    // Ejecutar ambas queries
    const [pagosVentas, pagosCuentaCorriente] = await Promise.all([
      executeQuery<RowDataPacket[]>(queryVentas, paramsVentas),
      executeQuery<RowDataPacket[]>(queryPagosCC, paramsPagosCC)
    ]);

    // Combinar y ordenar todos los pagos
    const todosPagos = [...pagosVentas, ...pagosCuentaCorriente]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    res.status(200).json({
      success: true,
      data: todosPagos,
      count: todosPagos.length
    });

  } catch (error) {
    console.error('Error al obtener pagos del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos del cliente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener productos más comprados por un cliente
 * GET /api/ventas/cliente/:sucursal/:cliente_id/productos
 */
export const obtenerProductosCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, cliente_id } = req.params;
    const { fecha_desde, fecha_hasta } = req.query;

    let query = `
      SELECT 
        p.id as producto_id,
        p.nombre as producto_nombre,
        p.marca as producto_marca,
        p.tipo as producto_tipo,
        SUM(vd.cantidad) as total_cantidad,
        COUNT(DISTINCT v.id) as total_ventas,
        SUM(vd.subtotal) as total_vendido,
        AVG(vd.precio_unitario) as precio_promedio,
        MAX(v.fecha_venta) as ultima_compra
      FROM ventas v
      INNER JOIN ventas_detalle vd ON v.id = vd.venta_id
      INNER JOIN productos p ON vd.producto_id = p.id
      WHERE v.sucursal = ?
        AND v.cliente_id = ?
    `;

    const params: any[] = [sucursal, cliente_id];

    if (fecha_desde) {
      query += ' AND v.fecha_venta >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND v.fecha_venta <= ?';
      params.push(fecha_hasta);
    }

    query += `
      GROUP BY p.id, p.nombre, p.marca, p.tipo
      ORDER BY total_cantidad DESC
    `;

    const productos = await executeQuery<RowDataPacket[]>(query, params);

    res.status(200).json({
      success: true,
      data: productos,
      count: productos.length
    });

  } catch (error) {
    console.error('Error al obtener productos del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos del cliente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener saldo de cuenta corriente de un cliente
 * GET /api/cuenta-corriente/:sucursal/cliente/:cliente_id/saldo
 */
export const obtenerSaldoCuentaCorrienteCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, cliente_id } = req.params;

    const query = `
      SELECT 
        sucursal,
        cliente_id,
        cliente_nombre,
        saldo_actual as saldo,
        total_debe,
        total_haber,
        ultimo_movimiento
      FROM resumen_cuenta_corriente
      WHERE sucursal = ?
        AND cliente_id = ?
      LIMIT 1
    `;

    const [saldo] = await executeQuery<RowDataPacket[]>(query, [sucursal, cliente_id]);

    res.status(200).json({
      success: true,
      data: saldo || { saldo: 0, total_debe: 0, total_haber: 0 }
    });

  } catch (error) {
    console.error('Error al obtener saldo de cuenta corriente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener saldo de cuenta corriente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener devoluciones/reemplazos de un cliente
 * GET /api/devoluciones/cliente/:sucursal/:cliente_id
 * 
 * NOTA: Por ahora devuelve un array vacío. En el futuro se implementará
 * una tabla de devoluciones con su lógica completa.
 */
export const obtenerDevolucionesCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, cliente_id } = req.params;

    // TODO: Implementar tabla de devoluciones y su lógica
    // Por ahora devolver array vacío para que no falle el frontend
    
    res.status(200).json({
      success: true,
      data: [],
      count: 0,
      message: 'Funcionalidad de devoluciones en desarrollo'
    });

  } catch (error) {
    console.error('Error al obtener devoluciones del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener devoluciones del cliente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener productos vendidos con información de garantía
 * GET /api/devoluciones/productos-vendidos
 * Query params: sucursal, fecha_desde, fecha_hasta
 */
export const obtenerProductosVendidos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sucursal, fecha_desde, fecha_hasta } = req.query;

    // Construir query base
    let query = `
      SELECT 
        vd.id as detalle_id,
        v.id as venta_id,
        v.numero_venta,
        v.sucursal,
        v.cliente_id,
        v.cliente_nombre,
        v.fecha_venta,
        v.metodo_pago,
        vd.producto_id,
        p.nombre as nombre_producto,
        p.marca,
        p.tipo as tipo_producto,
        vd.cantidad,
        vd.precio_unitario,
        vd.subtotal,
        DATEDIFF(NOW(), v.fecha_venta) as dias_desde_venta,
        CASE 
          WHEN DATEDIFF(NOW(), v.fecha_venta) <= 30 THEN 'vigente'
          ELSE 'vencida'
        END as estado_garantia
      FROM ventas v
      INNER JOIN ventas_detalle vd ON v.id = vd.venta_id
      INNER JOIN productos p ON vd.producto_id = p.id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Filtro de sucursal
    if (sucursal && sucursal !== 'todas') {
      query += ' AND v.sucursal = ?';
      params.push(sucursal);
    }

    // Filtro de fechas
    if (fecha_desde) {
      query += ' AND v.fecha_venta >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND v.fecha_venta <= ?';
      params.push(fecha_hasta);
    }

    // Ordenar por fecha más reciente primero
    query += ' ORDER BY v.fecha_venta DESC, v.id DESC';

    const productosVendidos = await executeQuery<RowDataPacket[]>(query, params);

    res.status(200).json({
      success: true,
      data: productosVendidos,
      count: productosVendidos.length
    });

  } catch (error) {
    console.error('Error al obtener productos vendidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos vendidos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};





