/**
 * Página de Cuentas Corrientes
 * Gestión de clientes deudores con cuenta corriente
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Row,
  Col,
  DatePicker,
  Select,
  Tag,
  message,
  Spin,
  Modal,
  InputNumber,
  Input,
  Descriptions,
  Statistic,
  Alert,
  Radio
} from 'antd';
import {
  DollarOutlined,
  ReloadOutlined,
  EyeOutlined,
  PrinterOutlined,
  FilePdfOutlined,
  ShopOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WalletOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cuentaCorrienteService, vendedoresService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './Accounts.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

/**
 * Interfaces
 */
interface ClienteCuentaCorriente {
  cliente_id: number;
  cliente_nombre: string;
  sucursal: string;
  total_debe: number;
  total_haber: number;
  saldo_actual: number;
  ultimo_movimiento: string;
}

interface ProductoVenta {
  producto_id: number;
  producto_nombre: string;
  producto_marca: string;
  producto_tipo: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface MovimientoCuentaCorriente {
  id: number;
  tipo: 'venta' | 'pago';
  debe: number;
  haber: number;
  saldo: number;
  descripcion: string;
  fecha_movimiento: string;
  venta_id?: number;
  pago_id?: number;
  comprobante?: string;
  productos?: ProductoVenta[];
  subtotal_venta?: number;
  descuento_venta?: number;
  total_venta?: number;
}

// Tipo de sucursal como string simple
type Sucursal = string;

/**
 * Componente Principal
 */
const Accounts: React.FC = () => {
  // Autenticación
  const { usuario } = useAuth();
  const esAdmin = usuario?.esAdmin || false;
  const sucursalUsuario = usuario?.sucursal?.toLowerCase() || '';
  
  // Estados principales
  const [clientes, setClientes] = useState<ClienteCuentaCorriente[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSucursales, setLoadingSucursales] = useState<boolean>(false);
  
  // Filtros
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>(
    esAdmin ? 'todas' : sucursalUsuario
  );
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(null);
  
  // Modal de pago
  const [modalPagoVisible, setModalPagoVisible] = useState<boolean>(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteCuentaCorriente | null>(null);
  const [montoPago, setMontoPago] = useState<number>(0);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [comprobantePago, setComprobantePago] = useState<string>('');
  const [observacionesPago, setObservacionesPago] = useState<string>('');
  const [procesandoPago, setProcesandoPago] = useState<boolean>(false);
  
  // Modal de detalle
  const [modalDetalleVisible, setModalDetalleVisible] = useState<boolean>(false);
  const [movimientos, setMovimientos] = useState<MovimientoCuentaCorriente[]>([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState<boolean>(false);

  // Modal de historial de pagos
  const [modalHistorialPagosVisible, setModalHistorialPagosVisible] = useState<boolean>(false);
  const [historialPagos, setHistorialPagos] = useState<any[]>([]);
  const [estadisticasPagos, setEstadisticasPagos] = useState<any>(null);
  const [loadingHistorialPagos, setLoadingHistorialPagos] = useState<boolean>(false);
  const [filtroSucursalHistorial, setFiltroSucursalHistorial] = useState<string>(
    esAdmin ? 'todas' : sucursalUsuario
  );
  const [filtroFechaDesdeHistorial, setFiltroFechaDesdeHistorial] = useState<Dayjs | null>(null);
  const [filtroFechaHastaHistorial, setFiltroFechaHastaHistorial] = useState<Dayjs | null>(null);

  /**
   * Efecto: cargar sucursales al montar
   */
  useEffect(() => {
    cargarSucursales();
  }, []);

  /**
   * Efecto: cargar clientes cuando cambia sucursal
   */
  useEffect(() => {
    if (sucursalSeleccionada && sucursalSeleccionada !== 'todas') {
      cargarClientes();
    } else if (sucursalSeleccionada === 'todas' && sucursales.length > 0) {
      cargarTodosLosClientes();
    }
  }, [sucursalSeleccionada, sucursales]);

  /**
   * Cargar sucursales disponibles
   */
  const cargarSucursales = async () => {
    setLoadingSucursales(true);
    try {
      const data = await vendedoresService.obtenerSucursales();
      setSucursales(data);
      
      // Auto-seleccionar según permisos
      if (esAdmin) {
        // Admin puede ver todas
      setSucursalSeleccionada('todas');
      } else {
        // Usuario normal solo su sucursal
        setSucursalSeleccionada(sucursalUsuario);
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      message.error('Error al cargar las sucursales');
    } finally {
      setLoadingSucursales(false);
    }
  };

  /**
   * Cargar clientes con saldo en cuenta corriente (una sucursal)
   */
  const cargarClientes = async () => {
    if (!sucursalSeleccionada || sucursalSeleccionada === 'todas') return;
    
    console.log('🔍 Cargando clientes para sucursal:', sucursalSeleccionada);
    setLoading(true);
    try {
      const data = await cuentaCorrienteService.obtenerClientesConSaldo(sucursalSeleccionada);
      console.log('📦 Datos recibidos:', data);
      
      // Filtrar por fechas si están seleccionadas
      let clientesFiltrados = data;
      if (fechaDesde || fechaHasta) {
        clientesFiltrados = data.filter((cliente: ClienteCuentaCorriente) => {
          const fechaMovimiento = dayjs(cliente.ultimo_movimiento);
          
          if (fechaDesde && fechaMovimiento.isBefore(fechaDesde, 'day')) {
            return false;
          }
          if (fechaHasta && fechaMovimiento.isAfter(fechaHasta, 'day')) {
            return false;
          }
          return true;
        });
      }
      
      // Ordenar por fecha de último movimiento (más reciente primero)
      clientesFiltrados.sort((a: ClienteCuentaCorriente, b: ClienteCuentaCorriente) => {
        return dayjs(b.ultimo_movimiento).valueOf() - dayjs(a.ultimo_movimiento).valueOf();
      });
      
      console.log('✅ Clientes filtrados y ordenados:', clientesFiltrados.length);
      setClientes(clientesFiltrados);
    } catch (error) {
      console.error('❌ Error al cargar clientes:', error);
      message.error(`Error al cargar los clientes de ${sucursalSeleccionada}`);
      setClientes([]); // Limpiar la lista en caso de error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar clientes de todas las sucursales
   */
  const cargarTodosLosClientes = async () => {
    setLoading(true);
    try {
      const promesas = sucursales.map(sucursal => 
        cuentaCorrienteService.obtenerClientesConSaldo(sucursal)
      );
      
      const resultados = await Promise.all(promesas);
      let todosLosClientes: ClienteCuentaCorriente[] = resultados.flat();
      
      // Filtrar por fechas si están seleccionadas
      if (fechaDesde || fechaHasta) {
        todosLosClientes = todosLosClientes.filter((cliente: ClienteCuentaCorriente) => {
          const fechaMovimiento = dayjs(cliente.ultimo_movimiento);
          
          if (fechaDesde && fechaMovimiento.isBefore(fechaDesde, 'day')) {
            return false;
          }
          if (fechaHasta && fechaMovimiento.isAfter(fechaHasta, 'day')) {
            return false;
          }
          return true;
        });
      }
      
      // Ordenar por fecha de último movimiento (más reciente primero)
      todosLosClientes.sort((a: ClienteCuentaCorriente, b: ClienteCuentaCorriente) => {
        return dayjs(b.ultimo_movimiento).valueOf() - dayjs(a.ultimo_movimiento).valueOf();
      });
      
      setClientes(todosLosClientes);
    } catch (error) {
      console.error('Error al cargar todos los clientes:', error);
      message.error('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aplicar filtros
   */
  const handleAplicarFiltros = () => {
    if (sucursalSeleccionada === 'todas') {
      cargarTodosLosClientes();
    } else {
      cargarClientes();
    }
  };

  /**
   * Limpiar filtros
   */
  const handleLimpiarFiltros = () => {
    setFechaDesde(null);
    setFechaHasta(null);
    setSucursalSeleccionada('todas');
  };

  /**
   * Cargar historial de pagos de cuenta corriente
   */
  const cargarHistorialPagos = async () => {
    setLoadingHistorialPagos(true);
    try {
      const filtros: any = {};
      
      if (filtroSucursalHistorial && filtroSucursalHistorial !== 'todas') {
        filtros.sucursal = filtroSucursalHistorial;
      }
      
      if (filtroFechaDesdeHistorial) {
        filtros.fechaDesde = filtroFechaDesdeHistorial.format('YYYY-MM-DD');
      }
      
      if (filtroFechaHastaHistorial) {
        filtros.fechaHasta = filtroFechaHastaHistorial.format('YYYY-MM-DD');
      }
      
      console.log('📊 Cargando historial de pagos con filtros:', filtros);
      
      const data = await cuentaCorrienteService.obtenerHistorialPagos(filtros);
      
      setHistorialPagos(data.pagos);
      setEstadisticasPagos(data.estadisticas);
      
      console.log(`✅ Historial cargado: ${data.pagos.length} pagos`);
    } catch (error) {
      console.error('❌ Error al cargar historial de pagos:', error);
      message.error('Error al cargar el historial de pagos');
    } finally {
      setLoadingHistorialPagos(false);
    }
  };

  /**
   * Efecto: cargar historial cuando se abre el modal
   */
  useEffect(() => {
    if (modalHistorialPagosVisible) {
      cargarHistorialPagos();
    }
  }, [modalHistorialPagosVisible]);

  /**
   * Abrir modal de pago
   */
  const handleAbrirModalPago = (cliente: ClienteCuentaCorriente) => {
    console.log('🔵 Abriendo modal de pago para cliente:', cliente);
    console.log('  - Cliente nombre:', cliente.cliente_nombre);
    console.log('  - Saldo actual:', cliente.saldo_actual);
    console.log('  - Sucursal:', cliente.sucursal);
    
    // Validar que el cliente tenga los datos necesarios
    if (!cliente || !cliente.cliente_id || !cliente.cliente_nombre) {
      console.error('❌ Cliente inválido:', cliente);
      message.error('Error: Datos del cliente incompletos');
      return;
    }
    
    setClienteSeleccionado(cliente);
    setMontoPago(0);
    setMetodoPago('efectivo');
    setComprobantePago('');
    setObservacionesPago('');
    setModalPagoVisible(true);
    
    console.log('✅ Modal de pago abierto correctamente');
  };

  /**
   * Registrar pago
   */
  const handleRegistrarPago = async () => {
    if (!clienteSeleccionado) return;
    
    // Validaciones
    if (montoPago <= 0) {
      message.error('El monto debe ser mayor a cero');
      return;
    }
    
    const saldoActual = parseFloat(clienteSeleccionado.saldo_actual as any || '0');
    if (montoPago > saldoActual) {
      message.warning(
        `El monto ingresado ($${montoPago.toFixed(2)}) es mayor al saldo actual ($${saldoActual.toFixed(2)}). Se registrará el pago completo.`
      );
    }
    
    setProcesandoPago(true);
    try {
      const response = await cuentaCorrienteService.registrarPago({
        sucursal: clienteSeleccionado.sucursal,
        cliente_id: clienteSeleccionado.cliente_id,
        cliente_nombre: clienteSeleccionado.cliente_nombre,
        monto: montoPago,
        metodo_pago: metodoPago,
        comprobante: comprobantePago || undefined,
        observaciones: observacionesPago || undefined
      });
      
      // Mostrar mensaje de éxito con detalles
      message.success('✅ Pago registrado exitosamente');
      
      // Mostrar información sobre comisiones si las hay
      if (response && response.comisiones) {
        const { cobradas, remanente } = response.comisiones;
        
        if (cobradas && cobradas.length > 0) {
          Modal.success({
            title: '💰 Comisiones Cobradas',
            content: (
              <div>
                <p><strong>Se cobraron las siguientes comisiones:</strong></p>
                <ul>
                  {cobradas.map((c: any, i: number) => (
                    <li key={i}>
                      {c.tipo} - {c.producto} (x{c.cantidad}): <strong>${c.monto.toFixed(2)}</strong>
                    </li>
                  ))}
                </ul>
                {remanente > 0 && (
                  <div style={{ marginTop: 16, padding: 12, background: '#fff7e6', borderRadius: 4 }}>
                    <p style={{ margin: 0 }}>
                      💾 <strong>Remanente guardado:</strong> ${remanente.toFixed(2)}
                      <br />
                      <small>Este monto se aplicará automáticamente en el próximo pago</small>
                    </p>
                  </div>
                )}
              </div>
            ),
            width: 600
          });
        } else if (remanente > 0) {
          message.info(`💾 Remanente de $${remanente.toFixed(2)} guardado para el próximo pago`);
        }
      }
      
      // Cerrar modal y limpiar datos
      setModalPagoVisible(false);
      setMontoPago(0);
      setMetodoPago('efectivo');
      setComprobantePago('');
      setObservacionesPago('');
      
      // Recargar datos SIEMPRE
      console.log('🔄 Recargando clientes después del pago...');
      if (sucursalSeleccionada === 'todas') {
        await cargarTodosLosClientes();
      } else {
        await cargarClientes();
      }
      
      // Si el modal de detalle está abierto, recargar también el detalle del cliente
      if (modalDetalleVisible && clienteSeleccionado) {
        console.log('🔄 Actualizando detalle del cliente...');
        try {
          const data = await cuentaCorrienteService.obtenerEstadoCuenta(
            clienteSeleccionado.sucursal,
            clienteSeleccionado.cliente_id
          );
          
          const movimientosOrdenados = data.movimientos.sort(
            (a: any, b: any) => {
              return dayjs(a.fecha_movimiento).valueOf() - dayjs(b.fecha_movimiento).valueOf();
            }
          );
          
          setMovimientos(movimientosOrdenados);
          
          // Actualizar también el cliente seleccionado con los nuevos datos
          const clientesActualizados = await cuentaCorrienteService.obtenerClientesConSaldo(
            clienteSeleccionado.sucursal
          );
          const clienteActualizado = clientesActualizados.find(
            (c: any) => c.cliente_id === clienteSeleccionado.cliente_id
          );
          
          if (clienteActualizado) {
            setClienteSeleccionado(clienteActualizado);
          }
          
          console.log('✅ Detalle del cliente actualizado');
        } catch (error) {
          console.error('Error al actualizar detalle:', error);
        }
      }
      
      console.log('✅ Clientes recargados exitosamente');
      
    } catch (error) {
      console.error('Error al registrar pago:', error);
      message.error('Error al registrar el pago');
    } finally {
      setProcesandoPago(false);
    }
  };

  /**
   * Abrir modal de detalle de cuenta
   */
  const handleVerDetalle = async (cliente: ClienteCuentaCorriente) => {
    setClienteSeleccionado(cliente);
    setModalDetalleVisible(true);
    setLoadingMovimientos(true);
    
    try {
      const data = await cuentaCorrienteService.obtenerEstadoCuenta(
        cliente.sucursal,
        cliente.cliente_id
      );
      
      // Ordenar movimientos por fecha (de más viejo a más nuevo)
      const movimientosOrdenados = data.movimientos.sort(
        (a: MovimientoCuentaCorriente, b: MovimientoCuentaCorriente) => {
          return dayjs(a.fecha_movimiento).valueOf() - dayjs(b.fecha_movimiento).valueOf();
        }
      );
      
      setMovimientos(movimientosOrdenados);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      message.error('Error al cargar el detalle de la cuenta');
    } finally {
      setLoadingMovimientos(false);
    }
  };

  /**
   * Imprimir estado de cuenta
   */
  const handleImprimirEstado = (cliente: ClienteCuentaCorriente) => {
    if (!movimientos || movimientos.length === 0) {
      message.warning('Primero debes ver el detalle de la cuenta');
      return;
    }
    
    try {
      // Crear documento PDF
      const doc = new jsPDF();
      const fechaActual = dayjs().format('DD/MM/YYYY HH:mm');
      let yPos = 20;
      
      // ========================================
      // 1. HEADER ELEGANTE CON DISEÑO CORPORATIVO
      // ========================================
      
      // Fondo azul para el header
      doc.setFillColor(24, 144, 255);
      doc.rect(0, 0, 210, 45, 'F');
      
      // Logo conceptual (círculo con iniciales)
      doc.setFillColor(255, 255, 255);
      doc.circle(20, 22, 8, 'F');
      doc.setTextColor(24, 144, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Z', 17, 25);
      
      // Título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('ZARPAR', 32, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Repuestos de Celulares', 32, 27);
      
      // Información de contacto
      doc.setFontSize(8);
      doc.text('www.zarparuy.com | contacto@zarparuy.com', 32, 32);
      
      // Título del documento (derecha)
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ESTADO DE CUENTA', 210, 20, { align: 'right' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${fechaActual}`, 210, 27, { align: 'right' });
      
      // Resetear color de texto
      doc.setTextColor(0, 0, 0);
      yPos = 55;
      
      // ========================================
      // 2. INFORMACIÓN DEL CLIENTE (CAJA CON BORDE)
      // ========================================
      
      // Caja de información
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.5);
      doc.roundedRect(14, yPos, 182, 28, 2, 2, 'S');
      
      // Título de la sección
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(14, yPos, 182, 8, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text('INFORMACIÓN DEL CLIENTE', 18, yPos + 5);
      
      doc.setTextColor(0, 0, 0);
      yPos += 13;
      
      // Datos del cliente en columnas
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Cliente:', 18, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(cliente.cliente_nombre, 42, yPos);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Sucursal:', 120, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(cliente.sucursal ? cliente.sucursal.toUpperCase() : 'N/A', 142, yPos);
      
      yPos += 8;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Cliente ID:', 18, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`#${cliente.cliente_id}`, 42, yPos);
      
      // Último movimiento
      doc.setFont('helvetica', 'bold');
      doc.text('Último movimiento:', 120, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(dayjs(cliente.ultimo_movimiento).format('DD/MM/YYYY'), 162, yPos);
      
      yPos += 15;
      
      // ========================================
      // 3. DETALLE DE MOVIMIENTOS
      // ========================================
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalle de Movimientos', 14, yPos);
      yPos += 8;
      
      // Procesar cada movimiento
      for (let i = 0; i < movimientos.length; i++) {
        const mov = movimientos[i];
        
        // Verificar si necesitamos nueva página
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        // ========================================
        // 3.1 MOVIMIENTO DE VENTA CON DETALLE
        // ========================================
        if (mov.tipo === 'venta' && mov.productos && mov.productos.length > 0) {
          // Encabezado del movimiento
          doc.setFillColor(245, 247, 250);
          doc.roundedRect(14, yPos, 182, 8, 1, 1, 'F');
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(59, 130, 246);
          doc.text(`📄 ${mov.descripcion}`, 18, yPos + 5);
          
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'normal');
          doc.text(dayjs(mov.fecha_movimiento).format('DD/MM/YYYY HH:mm'), 150, yPos + 5);
          
          doc.setTextColor(0, 0, 0);
          yPos += 12;
          
          // Tabla de productos
          const productosData = mov.productos.map((prod: ProductoVenta) => [
            prod.cantidad.toString(),
            `${prod.producto_nombre}\n${prod.producto_marca} | ${prod.producto_tipo}`,
            `$${parseFloat(String(prod.precio_unitario || 0)).toFixed(2)}`,
            `$${parseFloat(String(prod.subtotal || 0)).toFixed(2)}`
          ]);
          
          autoTable(doc, {
            startY: yPos,
            head: [['Cant.', 'Producto', 'P. Unit.', 'Subtotal']],
            body: productosData,
            theme: 'plain',
            headStyles: {
              fillColor: [255, 255, 255],
              textColor: [100, 100, 100],
              fontSize: 8,
              fontStyle: 'bold',
              lineWidth: 0.1,
              lineColor: [200, 200, 200]
            },
            bodyStyles: {
              fontSize: 8,
              cellPadding: 2
            },
            columnStyles: {
              0: { cellWidth: 15, halign: 'center' },
              1: { cellWidth: 110 },
              2: { cellWidth: 27, halign: 'right' },
              3: { cellWidth: 27, halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: 18, right: 18 },
            styles: {
              overflow: 'linebreak',
              cellWidth: 'wrap'
            }
          });
          
          yPos = (doc as any).lastAutoTable.finalY + 3;
          
          // Subtotal, descuento y total de la venta
          const subtotalVenta = parseFloat(String(mov.subtotal_venta || 0));
          const descuentoVenta = parseFloat(String(mov.descuento_venta || 0));
          const totalVenta = parseFloat(String(mov.total_venta || 0));
          
          // Línea separadora
          doc.setDrawColor(230, 230, 230);
          doc.line(18, yPos, 192, yPos);
          yPos += 5;
          
          // Resumen financiero
          doc.setFontSize(9);
          
          // Subtotal
          doc.setFont('helvetica', 'normal');
          doc.text('Subtotal:', 140, yPos);
          doc.text(`$${subtotalVenta.toFixed(2)}`, 192, yPos, { align: 'right' });
          yPos += 5;
          
          // Descuento (si existe)
          if (descuentoVenta > 0) {
            doc.setTextColor(245, 34, 45);
            doc.setFont('helvetica', 'bold');
            doc.text('Descuento:', 140, yPos);
            doc.text(`-$${descuentoVenta.toFixed(2)}`, 192, yPos, { align: 'right' });
            doc.setTextColor(0, 0, 0);
            yPos += 5;
          }
          
          // Total
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text('TOTAL:', 140, yPos);
          doc.setTextColor(59, 130, 246);
          doc.text(`$${totalVenta.toFixed(2)}`, 192, yPos, { align: 'right' });
          doc.setTextColor(0, 0, 0);
          yPos += 5;
          
          // Saldo acumulado
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 100, 100);
          doc.text('Saldo:', 140, yPos);
          const saldoVenta = parseFloat(String(mov.saldo || 0));
          const colorSaldo = saldoVenta > 0 ? [245, 34, 45] : [82, 196, 26];
          doc.setTextColor(colorSaldo[0], colorSaldo[1], colorSaldo[2]);
          doc.text(`$${saldoVenta.toFixed(2)}`, 192, yPos, { align: 'right' });
          doc.setTextColor(0, 0, 0);
          
          yPos += 12;
          
        } else if (mov.tipo === 'pago') {
          // ========================================
          // 3.2 MOVIMIENTO DE PAGO
          // ========================================
          
          doc.setFillColor(240, 255, 244);
          doc.roundedRect(14, yPos, 182, 12, 1, 1, 'F');
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(82, 196, 26);
          doc.text('💰 PAGO RECIBIDO', 18, yPos + 5);
          
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'normal');
          doc.text(dayjs(mov.fecha_movimiento).format('DD/MM/YYYY HH:mm'), 150, yPos + 5);
          
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(9);
          const montoPago = parseFloat(String(mov.haber || 0));
          doc.text(`Monto: $${montoPago.toFixed(2)}`, 18, yPos + 10);
          
          if (mov.comprobante) {
            doc.text(`Comprobante: ${mov.comprobante}`, 80, yPos + 10);
          }
          
          doc.setFont('helvetica', 'bold');
          doc.text('Saldo:', 150, yPos + 10);
          const saldoPago = parseFloat(String(mov.saldo || 0));
          const colorSaldoPago = saldoPago > 0 ? [245, 34, 45] : [82, 196, 26];
          doc.setTextColor(colorSaldoPago[0], colorSaldoPago[1], colorSaldoPago[2]);
          doc.text(`$${saldoPago.toFixed(2)}`, 192, yPos + 10, { align: 'right' });
          doc.setTextColor(0, 0, 0);
          
          yPos += 18;
        }
        
        // Línea separadora entre movimientos
        if (i < movimientos.length - 1) {
          doc.setDrawColor(220, 220, 220);
          doc.setLineDash([2, 2]);
          doc.line(14, yPos, 196, yPos);
          doc.setLineDash([]);
          yPos += 8;
        }
      }
      
      // ========================================
      // 4. RESUMEN FINAL
      // ========================================
      
      // Verificar espacio para el resumen
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }
      
      yPos += 10;
      
      // Caja de resumen final
      doc.setFillColor(24, 144, 255);
      doc.roundedRect(14, yPos, 182, 35, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN DE CUENTA', 105, yPos + 10, { align: 'center' });
      
      // Total debe
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Total Debe:', 30, yPos + 20);
      const totalDebe = parseFloat(String(cliente.total_debe || 0));
      doc.text(`$${totalDebe.toFixed(2)}`, 80, yPos + 20, { align: 'right' });
      
      // Total haber
      doc.text('Total Haber:', 110, yPos + 20);
      const totalHaber = parseFloat(String(cliente.total_haber || 0));
      doc.text(`$${totalHaber.toFixed(2)}`, 160, yPos + 20, { align: 'right' });
      
      // Saldo final
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SALDO ACTUAL:', 30, yPos + 30);
      
      const saldoActual = parseFloat(cliente.saldo_actual || 0);
      const textoSaldo = saldoActual > 0 ? `$${saldoActual.toFixed(2)} (DEBE)` : saldoActual < 0 ? `$${Math.abs(saldoActual).toFixed(2)} (A FAVOR)` : '$0.00';
      doc.text(textoSaldo, 185, yPos + 30, { align: 'right' });
      
      // ========================================
      // 5. FOOTER PROFESIONAL
      // ========================================
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Línea superior del footer
        doc.setDrawColor(24, 144, 255);
        doc.setLineWidth(0.5);
        doc.line(14, 280, 196, 280);
        
        // Texto del footer
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.setFont('helvetica', 'normal');
        doc.text(
          'Este documento es un estado de cuenta generado automáticamente por Sistema ZARPAR.',
          105,
          285,
          { align: 'center' }
        );
        doc.text(
          `Página ${i} de ${pageCount} | Generado el ${fechaActual}`,
          105,
          290,
          { align: 'center' }
        );
      }
      
      // ========================================
      // 6. GUARDAR PDF CON NOMBRE PERSONALIZADO
      // ========================================
      const nombreCliente = cliente.cliente_nombre.replace(/\s+/g, '_');
      const fechaDescarga = dayjs().format('DD-MM-YYYY');
      const nombreArchivo = `Estado_Cuenta_${nombreCliente}_${fechaDescarga}.pdf`;
      
      doc.save(nombreArchivo);
      
      message.success('✅ PDF generado correctamente con todos los detalles');
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      message.error('❌ Error al generar el PDF');
    }
  };

  /**
   * Columnas de la tabla
   */
  const columns: ColumnsType<ClienteCuentaCorriente> = [
    {
      title: 'Cliente',
      dataIndex: 'cliente_nombre',
      key: 'cliente_nombre',
      width: 200,
      render: (text: string) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Sucursal',
      dataIndex: 'sucursal',
      key: 'sucursal',
      width: 120,
      align: 'center',
      render: (text: string) => (
        <Tag color="blue" icon={<ShopOutlined />}>
          {text ? text.toUpperCase() : 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Total Debe',
      dataIndex: 'total_debe',
      key: 'total_debe',
      width: 120,
      align: 'right',
      render: (value: any) => {
        const numValue = parseFloat(value) || 0;
        return (
          <Text style={{ color: '#f5222d', fontWeight: 'bold' }}>
            ${numValue.toFixed(2)}
          </Text>
        );
      },
    },
    {
      title: 'Total Haber',
      dataIndex: 'total_haber',
      key: 'total_haber',
      width: 120,
      align: 'right',
      render: (value: any) => {
        const numValue = parseFloat(value) || 0;
        return (
          <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
            ${numValue.toFixed(2)}
          </Text>
        );
      },
    },
    {
      title: 'Saldo Actual',
      dataIndex: 'saldo_actual',
      key: 'saldo_actual',
      width: 130,
      align: 'right',
      render: (value: any) => {
        const numValue = parseFloat(value) || 0;
        return (
          <Text 
            style={{ 
              fontSize: '16px',
              fontWeight: 'bold',
              color: numValue > 0 ? '#f5222d' : '#52c41a'
            }}
          >
            ${numValue.toFixed(2)}
          </Text>
        );
      },
    },
    {
      title: 'Último Movimiento',
      dataIndex: 'ultimo_movimiento',
      key: 'ultimo_movimiento',
      width: 150,
      align: 'center',
      render: (fecha: string) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '12px' }}>
            {dayjs(fecha).format('DD/MM/YYYY')}
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {dayjs(fecha).format('HH:mm')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 200,
      align: 'center',
      fixed: 'right',
      render: (_: any, record: ClienteCuentaCorriente) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<DollarOutlined />}
            onClick={() => handleAbrirModalPago(record)}
          >
            Registrar Pago
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleVerDetalle(record)}
          >
            Ver Detalle
          </Button>
        </Space>
      ),
    },
  ];

  /**
   * Columnas de movimientos para el modal de detalle
   */
  const columnasMovimientos: ColumnsType<any> = [
    {
      title: 'Fecha',
      dataIndex: 'fecha_movimiento',
      key: 'fecha_movimiento',
      width: 150,
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 100,
      align: 'center',
      render: (tipo: string) => (
        <Tag color={tipo === 'venta' ? 'red' : 'green'}>
          {tipo === 'venta' ? 'Venta' : 'Pago'}
        </Tag>
      ),
    },
    {
      title: 'Detalle',
      dataIndex: 'productos',
      key: 'productos',
      render: (_: any, record: any) => {
        console.log('🔍 Renderizando detalle:', {
          tipo: record.tipo,
          productos: record.productos,
          descripcion: record.descripcion,
          descuento_venta: record.descuento_venta
        });
        
        // Si es un pago, mostrar la descripción
        if (record.tipo === 'pago') {
          return <Text>{record.descripcion}</Text>;
        }
        
        // Si es una venta, mostrar productos
        if (record.productos && Array.isArray(record.productos) && record.productos.length > 0) {
          return (
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {record.productos.map((producto: any, index: number) => (
                <div
                  key={index}
                  style={{
                    padding: '6px 10px',
                    background: '#f5f5f5',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Row justify="space-between">
                    <Col span={18}>
                      <Text strong style={{ fontSize: '12px', display: 'block' }}>
                        {producto.producto_nombre}
                      </Text>
                      {producto.producto_tipo && (
                        <Text style={{ fontSize: '10px', color: '#1890ff', display: 'block' }}>
                          {producto.producto_tipo}
                        </Text>
                      )}
                      {producto.producto_marca && (
                        <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>
                          {producto.producto_marca}
                        </Text>
                      )}
                      <Text type="secondary" style={{ fontSize: '10px' }}>
                        {producto.cantidad} x ${parseFloat(producto.precio_unitario || 0).toFixed(2)}
                      </Text>
                    </Col>
                    <Col span={6} style={{ textAlign: 'right' }}>
                      <Text strong style={{ fontSize: '12px', color: '#52c41a' }}>
                        ${parseFloat(producto.subtotal || 0).toFixed(2)}
                      </Text>
                    </Col>
                  </Row>
                </div>
              ))}
              {/* Mostrar descuento si existe */}
              {record.descuento_venta && parseFloat(record.descuento_venta) > 0 && (
                <div
                  style={{
                    padding: '4px 10px',
                    background: '#fff1f0',
                    borderRadius: '6px',
                    border: '1px solid #ffa39e',
                  }}
                >
                  <Row justify="space-between">
                    <Col>
                      <Text style={{ fontSize: '11px', color: '#cf1322' }}>
                        💰 Descuento aplicado
                      </Text>
                    </Col>
                    <Col>
                      <Text strong style={{ fontSize: '11px', color: '#cf1322' }}>
                        -${parseFloat(record.descuento_venta).toFixed(2)}
                      </Text>
                    </Col>
                  </Row>
                </div>
              )}
            </Space>
          );
        }
        
        return <Text type="secondary">{record.descripcion}</Text>;
      },
    },
    {
      title: 'Debe',
      dataIndex: 'debe',
      key: 'debe',
      width: 120,
      align: 'right',
      render: (value: any) => {
        const numValue = parseFloat(value) || 0;
        return numValue > 0 ? (
          <Text style={{ color: '#f5222d', fontWeight: 'bold' }}>
            ${numValue.toFixed(2)}
          </Text>
        ) : '-';
      },
    },
    {
      title: 'Haber',
      dataIndex: 'haber',
      key: 'haber',
      width: 120,
      align: 'right',
      render: (value: any) => {
        const numValue = parseFloat(value) || 0;
        return numValue > 0 ? (
          <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
            ${numValue.toFixed(2)}
          </Text>
        ) : '-';
      },
    },
    {
      title: 'Saldo',
      dataIndex: 'saldo',
      key: 'saldo',
      width: 120,
      align: 'right',
      render: (value: any) => {
        const numValue = parseFloat(value) || 0;
        return (
          <Text style={{ color: '#1890ff', fontWeight: 'bold' }}>
            ${numValue.toFixed(2)}
          </Text>
        );
      },
    },
  ];

  /**
   * Calcular estadísticas
   */
  const totalDeudores = clientes.length;
  const deudaTotal = clientes.reduce((sum, c) => sum + parseFloat(c.saldo_actual as any || '0'), 0);
  const deudaPromedio = totalDeudores > 0 ? deudaTotal / totalDeudores : 0;

  return (
    <div className="accounts-container">
      {/* Header */}
      <Card className="accounts-header">
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <WalletOutlined style={{ marginRight: 12, color: '#1890ff' }} />
              Cuentas Corrientes
            </Title>
            <Text type="secondary">
              Gestión de clientes con saldo pendiente
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                type="default"
                size="large"
                icon={<ClockCircleOutlined />}
                onClick={() => setModalHistorialPagosVisible(true)}
              >
                Historial de Pagos
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<ReloadOutlined />}
                onClick={handleAplicarFiltros}
                loading={loading}
              >
                Actualizar
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Total Deudores"
              value={totalDeudores}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Deuda Total"
              value={deudaTotal}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Deuda Promedio"
              value={deudaPromedio}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
              <Text strong>
                Sucursal
                {!esAdmin && (
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                    (Solo tu sucursal)
                  </Text>
                )}
              </Text>
              <Select
                value={sucursalSeleccionada}
                onChange={setSucursalSeleccionada}
                style={{ width: '100%' }}
                loading={loadingSucursales}
                placeholder="Seleccionar sucursal"
                disabled={!esAdmin}
              >
                {esAdmin && <Option key="todas" value="todas">Todas las Sucursales</Option>}
                {sucursales.map((sucursal, index) => (
                  <Option key={sucursal || `suc-${index}`} value={sucursal}>
                    {sucursal ? sucursal.toUpperCase() : 'N/A'}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={10}>
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
              <Text strong>Rango de Fechas (Último Movimiento)</Text>
              <RangePicker
                value={[fechaDesde, fechaHasta]}
                onChange={(dates) => {
                  setFechaDesde(dates ? dates[0] : null);
                  setFechaHasta(dates ? dates[1] : null);
                }}
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder={['Desde', 'Hasta']}
              />
            </Space>
          </Col>
          <Col xs={24} sm={6}>
            <Space style={{ marginTop: 20 }}>
              <Button
                type="primary"
                icon={<CalendarOutlined />}
                onClick={handleAplicarFiltros}
                loading={loading}
              >
                Aplicar Filtros
              </Button>
              <Button
                onClick={handleLimpiarFiltros}
              >
                Limpiar
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabla de clientes */}
      <Card>
        {!loading && clientes.length === 0 && (
          <Alert
            message="No hay clientes con saldo pendiente"
            description={
              sucursalSeleccionada === 'todas'
                ? 'No se encontraron clientes con deuda en ninguna sucursal'
                : `No se encontraron clientes con deuda en la sucursal ${sucursalSeleccionada?.toUpperCase()}`
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Table
          columns={columns}
          dataSource={clientes}
          loading={loading}
          rowKey={(record) => `${record.sucursal}-${record.cliente_id}`}
          size="small"
          scroll={{ x: 1000 }}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} clientes`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>

      {/* Modal de Registro de Pago */}
      {/* Calcular valores antes del render */}
      {(() => {
        // Variables seguras para el modal
        const saldoActual = clienteSeleccionado 
          ? parseFloat(String(clienteSeleccionado.saldo_actual || '0')) 
          : 0;
        const saldoRestante = saldoActual - montoPago;
        const esPagoTotal = montoPago >= saldoActual;
        const sucursalTexto = clienteSeleccionado?.sucursal 
          ? String(clienteSeleccionado.sucursal).toUpperCase() 
          : 'N/A';
        
        return (
          <Modal
            title={
              <Space>
                <DollarOutlined style={{ color: '#52c41a' }} />
                <span style={{ color: '#000000' }}>Registrar Pago - {clienteSeleccionado?.cliente_nombre || 'Cliente'}</span>
              </Space>
            }
            open={modalPagoVisible}
            onCancel={() => {
              console.log('🔵 Cerrando modal de pago');
              setModalPagoVisible(false);
            }}
            onOk={handleRegistrarPago}
            confirmLoading={procesandoPago}
            okText="Registrar Pago"
            cancelText="Cancelar"
            width={600}
            okButtonProps={{
              disabled: montoPago <= 0
            }}
          >
            {clienteSeleccionado ? (
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Información del cliente */}
                <Alert
                  message={
                    <Space direction="vertical" size={0}>
                      <Text strong>Saldo Actual: ${saldoActual.toFixed(2)}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Sucursal: {sucursalTexto}
                      </Text>
                    </Space>
                  }
                  type="info"
                  showIcon
                />

                {/* Monto del pago */}
                <div>
                  <Text strong>Monto del Pago *</Text>
                  <InputNumber
                    value={montoPago}
                    onChange={(val) => {
                      console.log('💵 Monto cambiado:', val);
                      setMontoPago(val || 0);
                    }}
                    style={{ width: '100%', marginTop: 8 }}
                    min={0}
                    max={saldoActual}
                    precision={2}
                    prefix="$"
                    size="large"
                    placeholder="Ingrese el monto"
                  />
                  <Space style={{ marginTop: 8 }}>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        console.log('💵 Pago total:', saldoActual);
                        setMontoPago(saldoActual);
                      }}
                    >
                      Pago Total (${saldoActual.toFixed(2)})
                    </Button>
                  </Space>
                </div>

                {/* Método de pago */}
                <div>
                  <Text strong>Método de Pago *</Text>
                  <Radio.Group
                    value={metodoPago}
                    onChange={(e) => {
                      console.log('💳 Método de pago cambiado:', e.target.value);
                      setMetodoPago(e.target.value);
                    }}
                    style={{ marginTop: 8, width: '100%' }}
                  >
                    <Space direction="vertical">
                      <Radio value="efectivo">💵 Efectivo</Radio>
                      <Radio value="transferencia">🏦 Transferencia</Radio>
                    </Space>
                  </Radio.Group>
                </div>

                {/* Comprobante (opcional) */}
                <div>
                  <Text strong>N° Comprobante (Opcional)</Text>
                  <Input
                    value={comprobantePago}
                    onChange={(e) => setComprobantePago(e.target.value)}
                    placeholder="Ej: TRF-123456"
                    style={{ marginTop: 8 }}
                  />
                </div>

                {/* Observaciones (opcional) */}
                <div>
                  <Text strong>Observaciones (Opcional)</Text>
                  <TextArea
                    value={observacionesPago}
                    onChange={(e) => setObservacionesPago(e.target.value)}
                    placeholder="Notas adicionales sobre el pago"
                    rows={3}
                    style={{ marginTop: 8 }}
                  />
                </div>

                {/* Resumen del pago */}
                {montoPago > 0 && (
                  <Alert
                    message="Resumen del Pago"
                    description={
                      <Space direction="vertical" size={0}>
                        <Text>Monto a pagar: <Text strong>${montoPago.toFixed(2)}</Text></Text>
                        <Text>
                          Saldo restante: 
                          <Text strong style={{ 
                            color: saldoRestante > 0 ? '#f5222d' : '#52c41a',
                            marginLeft: 4
                          }}>
                            ${saldoRestante.toFixed(2)}
                          </Text>
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px', marginTop: 4 }}>
                          {esPagoTotal
                            ? '✅ Pago total - La deuda quedará saldada' 
                            : '⚠️ Pago parcial - Quedará saldo pendiente'}
                        </Text>
                      </Space>
                    }
                    type={esPagoTotal ? 'success' : 'warning'}
                    showIcon
                  />
                )}
              </Space>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Cargando información del cliente...</Text>
                </div>
              </div>
            )}
          </Modal>
        );
      })()}

      {/* Modal de Detalle de Cuenta */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: '#1890ff' }} />
            <span>Detalle de Cuenta - {clienteSeleccionado?.cliente_nombre}</span>
          </Space>
        }
        open={modalDetalleVisible}
        onCancel={() => setModalDetalleVisible(false)}
        footer={[
          <Button key="cerrar" onClick={() => setModalDetalleVisible(false)}>
            Cerrar
          </Button>,
          <Button
            key="descargar"
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => clienteSeleccionado && handleImprimirEstado(clienteSeleccionado)}
            loading={loadingMovimientos}
          >
            Descargar PDF
          </Button>,
        ]}
        width={1100}
      >
        {clienteSeleccionado && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Resumen */}
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Cliente" span={2}>
                <Text strong>{clienteSeleccionado.cliente_nombre}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Sucursal">
                <Tag color="blue">{clienteSeleccionado.sucursal ? clienteSeleccionado.sucursal.toUpperCase() : 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Último Movimiento">
                {dayjs(clienteSeleccionado.ultimo_movimiento).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Total Debe">
                <Text style={{ color: '#f5222d', fontWeight: 'bold' }}>
                  ${parseFloat(String(clienteSeleccionado.total_debe || '0')).toFixed(2)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Total Haber">
                <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  ${parseFloat(String(clienteSeleccionado.total_haber || '0')).toFixed(2)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Saldo Actual" span={2}>
                <Text 
                  style={{ 
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: parseFloat(String(clienteSeleccionado.saldo_actual || '0')) > 0 ? '#f5222d' : '#52c41a'
                  }}
                >
                  ${parseFloat(String(clienteSeleccionado.saldo_actual || '0')).toFixed(2)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {/* Tabla de movimientos */}
            <div>
              <Text strong style={{ fontSize: '16px' }}>Historial de Movimientos</Text>
              <Table
                columns={columnasMovimientos}
                dataSource={movimientos}
                loading={loadingMovimientos}
                rowKey="id"
                size="small"
                scroll={{ x: 1200 }}
                pagination={{
                  defaultPageSize: 10,
                  showTotal: (total) => `Total: ${total} movimientos`,
                }}
                style={{ marginTop: 12 }}
              />
            </div>

            {/* Información de último pago */}
            {movimientos.length > 0 && movimientos[0].tipo === 'pago' && (
              <Alert
                message="Último Pago Registrado"
                description={
                  <Space direction="vertical" size={0}>
                    <Text>
                      <ClockCircleOutlined style={{ marginRight: 8 }} />
                      Fecha: {dayjs(movimientos[0].fecha_movimiento).format('DD/MM/YYYY HH:mm')}
                    </Text>
                    <Text>
                      <DollarOutlined style={{ marginRight: 8 }} />
                      Monto: ${parseFloat(movimientos[0].haber || 0).toFixed(2)}
                    </Text>
                    <Text>
                      {movimientos[0].descripcion}
                    </Text>
                  </Space>
                }
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
              />
            )}
          </Space>
        )}
      </Modal>

      {/* Modal de Historial de Pagos de Cuenta Corriente */}
      <Modal
        title={
          <Space>
            <ClockCircleOutlined style={{ color: '#1890ff' }} />
            <span style={{ color: '#000000' }}>Historial de Pagos - Cuenta Corriente</span>
          </Space>
        }
        open={modalHistorialPagosVisible}
        onCancel={() => setModalHistorialPagosVisible(false)}
        width={1200}
        footer={[
          <Button key="close" onClick={() => setModalHistorialPagosVisible(false)}>
            Cerrar
          </Button>,
        ]}
      >
        <Spin spinning={loadingHistorialPagos}>
          {/* Filtros */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <div>
                  <Text strong>
                    Sucursal
                    {!esAdmin && (
                      <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                        (Solo tu sucursal)
                      </Text>
                    )}
                  </Text>
                  <Select
                    value={filtroSucursalHistorial}
                    onChange={setFiltroSucursalHistorial}
                    style={{ width: '100%', marginTop: 8 }}
                    disabled={!esAdmin}
                  >
                    {esAdmin && <Option value="todas">Todas las Sucursales</Option>}
                    {sucursales.map((suc) => (
                      <Option key={suc} value={suc}>
                        {suc.toUpperCase()}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div>
                  <Text strong>Fecha Desde</Text>
                  <DatePicker
                    value={filtroFechaDesdeHistorial}
                    onChange={(date) => setFiltroFechaDesdeHistorial(date)}
                    format="DD/MM/YYYY"
                    style={{ width: '100%', marginTop: 8 }}
                    placeholder="Seleccionar fecha"
                  />
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div>
                  <Text strong>Fecha Hasta</Text>
                  <DatePicker
                    value={filtroFechaHastaHistorial}
                    onChange={(date) => setFiltroFechaHastaHistorial(date)}
                    format="DD/MM/YYYY"
                    style={{ width: '100%', marginTop: 8 }}
                    placeholder="Seleccionar fecha"
                  />
                </div>
              </Col>
            </Row>
            <Row style={{ marginTop: 12 }}>
              <Col span={24}>
                <Space>
                  <Button type="primary" icon={<ReloadOutlined />} onClick={cargarHistorialPagos}>
                    Aplicar Filtros
                  </Button>
                  <Button
                    onClick={() => {
                      setFiltroSucursalHistorial('todas');
                      setFiltroFechaDesdeHistorial(null);
                      setFiltroFechaHastaHistorial(null);
                      setTimeout(() => cargarHistorialPagos(), 100);
                    }}
                  >
                    Limpiar
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Estadísticas */}
          {estadisticasPagos && (
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Total Pagos"
                    value={estadisticasPagos.total_pagos || 0}
                    prefix={<DollarOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Total Cobrado"
                    value={parseFloat(estadisticasPagos.total_cobrado || 0)}
                    precision={2}
                    prefix="$"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Efectivo"
                    value={parseFloat(estadisticasPagos.total_efectivo || 0)}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Transferencia"
                    value={parseFloat(estadisticasPagos.total_transferencia || 0)}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* Tabla de pagos */}
          <Table
            columns={[
              {
                title: 'Fecha',
                dataIndex: 'fecha_pago',
                key: 'fecha_pago',
                width: 150,
                render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY HH:mm'),
                sorter: (a: any, b: any) => dayjs(a.fecha_pago).valueOf() - dayjs(b.fecha_pago).valueOf(),
              },
              {
                title: 'Cliente',
                dataIndex: 'cliente_nombre',
                key: 'cliente_nombre',
                width: 200,
              },
              {
                title: 'Sucursal',
                dataIndex: 'sucursal',
                key: 'sucursal',
                width: 120,
                render: (sucursal: string) => (
                  <Tag color="blue">{sucursal.toUpperCase()}</Tag>
                ),
              },
              {
                title: 'Monto',
                dataIndex: 'monto',
                key: 'monto',
                width: 120,
                align: 'right' as const,
                render: (monto: number) => (
                  <Text strong style={{ color: '#52c41a' }}>
                    ${parseFloat(String(monto || 0)).toFixed(2)}
                  </Text>
                ),
              },
              {
                title: 'Método',
                dataIndex: 'metodo_pago',
                key: 'metodo_pago',
                width: 120,
                render: (metodo: string) => (
                  <Tag color={metodo === 'efectivo' ? 'green' : 'blue'}>
                    {metodo === 'efectivo' ? '💵 Efectivo' : '🏦 Transferencia'}
                  </Tag>
                ),
              },
              {
                title: 'Comprobante',
                dataIndex: 'comprobante',
                key: 'comprobante',
                width: 150,
                render: (comprobante: string) => comprobante || '-',
              },
              {
                title: 'Observaciones',
                dataIndex: 'observaciones',
                key: 'observaciones',
                ellipsis: true,
                render: (obs: string) => obs || '-',
              },
              {
                title: 'Saldo Cliente',
                dataIndex: 'saldo_actual_cliente',
                key: 'saldo_actual_cliente',
                width: 130,
                align: 'right' as const,
                render: (saldo: number) => (
                  <Text style={{ color: parseFloat(String(saldo || 0)) > 0 ? '#f5222d' : '#52c41a' }}>
                    ${parseFloat(String(saldo || 0)).toFixed(2)}
                  </Text>
                ),
              },
            ]}
            dataSource={historialPagos}
            rowKey="id"
            size="small"
            scroll={{ x: 1000 }}
            pagination={{
              defaultPageSize: 15,
              showTotal: (total) => `Total: ${total} pagos`,
              showSizeChanger: true,
              pageSizeOptions: ['10', '15', '20', '50'],
            }}
          />
        </Spin>
      </Modal>
    </div>
  );
};

export default Accounts;

