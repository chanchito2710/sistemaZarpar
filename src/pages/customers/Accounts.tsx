/**
 * Página de Cuentas Corrientes
 * Gestión de clientes deudores con cuenta corriente
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  Radio,
  Tooltip
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
  WalletOutlined,
  SearchOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cuentaCorrienteService, vendedoresService, cajaService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCaja } from '../../contexts/CajaContext';
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
  nombre_fantasia?: string; // Nombre de fantasía del cliente
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
  tipo: 'venta' | 'pago' | 'ajuste';
  debe: number;
  haber: number;
  saldo: number;
  descripcion?: string;
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
  
  // Contexto de caja para actualizar en tiempo real
  const { actualizarCaja } = useCaja();
  
  // Estados principales
  const [clientes, setClientes] = useState<ClienteCuentaCorriente[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSucursales, setLoadingSucursales] = useState<boolean>(false);
  const [montoCaja, setMontoCaja] = useState<number>(0);
  const [loadingCaja, setLoadingCaja] = useState<boolean>(false);
  
  // Filtros
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>(
    esAdmin ? 'todas' : sucursalUsuario
  );
  const [busquedaCliente, setBusquedaCliente] = useState<string>('');
  
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
  
  // Estado para trackear movimientos ocultos en el PDF
  const [movimientosOcultosParaPDF, setMovimientosOcultosParaPDF] = useState<Set<number>>(new Set());
  
  // Filtros de fecha para el PDF
  const [filtroFechaPDFDesde, setFiltroFechaPDFDesde] = useState<Dayjs | null>(null);
  const [filtroFechaPDFHasta, setFiltroFechaPDFHasta] = useState<Dayjs | null>(null);

  /**
   * Efecto: cargar sucursales al montar
   */
  useEffect(() => {
    cargarSucursales();
  }, []);

  /**
   * Efecto: cargar clientes y caja cuando cambia sucursal
   */
  useEffect(() => {
    if (sucursalSeleccionada && sucursalSeleccionada !== 'todas') {
      cargarClientes();
      cargarMontoCaja();
    } else if (sucursalSeleccionada === 'todas' && sucursales.length > 0) {
      cargarTodosLosClientes();
      setMontoCaja(0);
    }
  }, [sucursalSeleccionada, sucursales]);

  /**
   * Toggle visibilidad de movimiento en PDF
   */
  const toggleMovimientoParaPDF = (movimientoId: number) => {
    setMovimientosOcultosParaPDF((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(movimientoId)) {
        newSet.delete(movimientoId); // Si estaba oculto, mostrarlo
      } else {
        newSet.add(movimientoId); // Si estaba visible, ocultarlo
      }
      return newSet;
    });
  };

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
   * Cargar monto de caja de la sucursal seleccionada
   */
  const cargarMontoCaja = async () => {
    if (!sucursalSeleccionada || sucursalSeleccionada === 'todas') {
      setMontoCaja(0);
      return;
    }
    
    setLoadingCaja(true);
    try {
      const data = await cajaService.obtenerCaja(sucursalSeleccionada);
      setMontoCaja(data?.monto_actual || 0);
    } catch (error) {
      console.error('❌ Error al cargar monto de caja:', error);
      setMontoCaja(0);
    } finally {
      setLoadingCaja(false);
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
      
      // Ordenar por fecha de último movimiento (más reciente primero)
      const clientesOrdenados = data.sort((a: ClienteCuentaCorriente, b: ClienteCuentaCorriente) => {
        return dayjs(b.ultimo_movimiento).valueOf() - dayjs(a.ultimo_movimiento).valueOf();
      });
      
      console.log('✅ Clientes ordenados:', clientesOrdenados.length);
      setClientes(clientesOrdenados);
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
      
      // Actualizar caja si el pago fue en efectivo
      if (metodoPago === 'efectivo' && sucursalSeleccionada !== 'todas') {
        console.log('💰 Actualizando monto de caja después de pago en efectivo...');
        await cargarMontoCaja();
        
        // Disparar actualización de caja en el header usando contexto
        console.log('🔔 Disparando actualización de caja en header');
        actualizarCaja();
        console.log('✅ Actualización de caja disparada');
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
      
      // Recargar página automáticamente después de 1 segundo para actualizar todo
      console.log('🔄 Recargando página automáticamente...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
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
    
    // Limpiar movimientos ocultos al abrir nuevo detalle
    setMovimientosOcultosParaPDF(new Set());
    
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
   * Imprimir estado de cuenta - DISEÑO MINIMALISTA
   */
  const handleImprimirEstado = (cliente: ClienteCuentaCorriente) => {
    if (!movimientos || movimientos.length === 0) {
      message.warning('Primero debes ver el detalle de la cuenta');
      return;
    }
    
    try {
      const doc = new jsPDF();
      const fechaActual = dayjs().format('DD/MM/YYYY HH:mm');
      let yPos = 20;
      
      // ========================================
      // 1. HEADER PROFESIONAL
      // ========================================
      
      // Obtener logo personalizado si existe
      const logoEmpresa = localStorage.getItem('logoEmpresa');
      
      if (logoEmpresa) {
        // Si hay logo personalizado, mostrarlo con proporciones correctas
        try {
          // Crear una imagen temporal para obtener dimensiones originales
          const img = new Image();
          img.src = logoEmpresa;
          
          // Calcular dimensiones manteniendo proporción
          const maxWidth = 50;  // Ancho máximo en PDF
          const maxHeight = 20; // Alto máximo en PDF
          
          let width = img.width;
          let height = img.height;
          
          // Calcular escala para que quepa en el espacio máximo
          const scaleX = maxWidth / width;
          const scaleY = maxHeight / height;
          const scale = Math.min(scaleX, scaleY); // Usar la escala menor para que quepa
          
          // Aplicar escala
          width = width * scale;
          height = height * scale;
          
          // Centrar verticalmente si es necesario
          const yOffset = (maxHeight - height) / 2;
          
          doc.addImage(logoEmpresa, 'PNG', 14, 10 + yOffset, width, height);
          yPos = 10 + maxHeight + 5; // Ajustar yPos según altura máxima
        } catch (error) {
          console.error('Error al cargar logo en PDF:', error);
          // Si hay error, usar el texto por defecto
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('ZARPAR', 14, 18);
          
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text('Repuestos de Celulares', 14, 24);
          yPos = 20;
        }
      } else {
        // Logo y nombre empresa por defecto (izquierda)
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('ZARPAR', 14, 18);
        
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Repuestos de Celulares', 14, 24);
        yPos = 20;
      }
      
      // Título documento (derecha) - Alineado con el logo
      const tituloY = logoEmpresa ? 18 : 18;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('ESTADO DE CUENTA', 196, tituloY, { align: 'right' });
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(fechaActual, 196, tituloY + 6, { align: 'right' });
      
      // Asegurar que yPos esté debajo del título si es necesario
      if (yPos < tituloY + 10) {
        yPos = tituloY + 10;
      }
      
      // Línea separadora elegante
      const lineaY = yPos + 2;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(14, lineaY, 196, lineaY);
      
      yPos = lineaY + 8;
      
      // ========================================
      // 2. INFORMACIÓN DEL CLIENTE
      // ========================================
      
      // Nombre del cliente - MEJORA 1: Color AZUL y usar nombre fantasía si existe
      const nombreMostrar = cliente.nombre_fantasia || cliente.cliente_nombre;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 102, 204); // Azul
      doc.text(nombreMostrar, 14, yPos);
      
      // Información adicional en gris
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(`ID: ${cliente.cliente_id}`, 14, yPos + 5);
      doc.text(`${cliente.sucursal ? cliente.sucursal.toUpperCase() : 'N/A'}`, 60, yPos + 5);
      doc.text(`Último mov: ${dayjs(cliente.ultimo_movimiento).format('DD/MM/YYYY')}`, 110, yPos + 5);
      
      yPos += 12;
      
      // ========================================
      // 3. DETALLE DE MOVIMIENTOS - MINIMALISTA
      // ========================================
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Detalle de Movimientos', 14, yPos);
      yPos += 6;
      
      // Ordenar movimientos de más viejo a más nuevo
      const movimientosOrdenados = [...movimientos].sort((a, b) => {
        return dayjs(a.fecha_movimiento).diff(dayjs(b.fecha_movimiento));
      });
      
      // MEJORA 4: Filtrar solo ventas y pagos visibles (y no ocultos para PDF) + filtro de fechas
      const movimientosFiltrados = movimientosOrdenados.filter(mov => {
        // Excluir movimientos que el usuario marcó como ocultos
        if (movimientosOcultosParaPDF.has(mov.id)) {
          return false;
        }
        
        // Filtro de tipo
        if (mov.tipo !== 'venta' && mov.tipo !== 'pago') {
          return false;
        }
        
        // Filtro de fechas si están seleccionadas
        const fechaMov = dayjs(mov.fecha_movimiento);
        if (filtroFechaPDFDesde && fechaMov.isBefore(filtroFechaPDFDesde, 'day')) {
          return false;
        }
        if (filtroFechaPDFHasta && fechaMov.isAfter(filtroFechaPDFHasta, 'day')) {
          return false;
        }
        
        return true;
      });
      
      // Procesar cada movimiento de forma minimalista
      let saldoAcumulado = 0;
      
      for (let i = 0; i < movimientosFiltrados.length; i++) {
        const mov = movimientosFiltrados[i];
        
        // Verificar si necesitamos nueva página
        if (yPos > 265) {
          doc.addPage();
          yPos = 20;
        }
        
        // Calcular altura del renglón
        const numProductos = mov.tipo === 'venta' ? (mov.productos?.length || 0) : 0;
        const alturaReglon = mov.tipo === 'venta' ? 14 + numProductos * 3 : 8;
        
        // Color de fondo alternado claro (solo en renglones impares)
        const esImpar = i % 2 === 1;
        if (esImpar) {
          doc.setFillColor(248, 248, 248);
          doc.rect(14, yPos - 1, 182, alturaReglon, 'F');
        }
        
        // ========================================
        // VENTA - DISEÑO MINIMALISTA
        // ========================================
        if (mov.tipo === 'venta' && mov.productos && mov.productos.length > 0) {
          // Encabezado simple - CENTRADO VERTICALMENTE
          yPos += 3;
          
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(`Venta ${mov.descripcion}`, 16, yPos);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6);
          doc.setTextColor(120, 120, 120);
          doc.text(dayjs(mov.fecha_movimiento).format('DD/MM/YYYY'), 115, yPos);
          
          yPos += 3;
          
          // MEJORA 2: Lista de productos - 50% MÁS GRANDE con cantidad en negrita
          doc.setFontSize(9); // Era 6, ahora 9 (50% más grande)
          doc.setTextColor(60, 60, 60);
          for (const prod of mov.productos) {
            const cantidad = prod.cantidad;
            const nombre = `${prod.producto_nombre}`;
            const precio = `($${parseFloat(String(prod.precio_unitario || 0)).toFixed(2)})`;
            const subtotal = `$${parseFloat(String(prod.subtotal || 0)).toFixed(2)}`;
            
            // Cantidad en NEGRITA
            doc.setFont('helvetica', 'bold');
            doc.text(`${cantidad}x`, 20, yPos);
            
            // Resto normal
            doc.setFont('helvetica', 'normal');
            doc.text(`${nombre} ${precio}`, 29, yPos);
            
            // Subtotal en negrita
            doc.setFont('helvetica', 'bold');
            doc.text(subtotal, 194, yPos, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            yPos += 4.5; // Era 3, ahora 4.5 (50% más espacio)
          }
          
          // Cálculos
            const subtotalVenta = parseFloat(String(mov.subtotal_venta || 0));
            const descuentoVenta = parseFloat(String(mov.descuento_venta || 0));
          const totalVenta = parseFloat(String(mov.total_venta || 0));
          
          yPos += 1;
          
          // Subtotal y descuento
          doc.setFontSize(6);
            doc.setTextColor(120, 120, 120);
          doc.text('Subtotal:', 155, yPos);
          doc.text(`$${subtotalVenta.toFixed(2)}`, 194, yPos, { align: 'right' });
            
            if (descuentoVenta > 0) {
            yPos += 3;
            doc.text('Desc:', 155, yPos);
            doc.text(`-$${descuentoVenta.toFixed(2)}`, 194, yPos, { align: 'right' });
          }
          
          yPos += 3;
          
          // Total en rojo
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(220, 38, 38);
          doc.text('Total:', 155, yPos);
          doc.text(`$${totalVenta.toFixed(2)}`, 194, yPos, { align: 'right' });
          
          saldoAcumulado += totalVenta;
          
          // MEJORA 3: Mostrar saldo acumulado al lado de cada venta
          yPos += 4;
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('Saldo Acumulado:', 155, yPos);
          doc.setTextColor(59, 130, 246); // Azul
          doc.text(`$${saldoAcumulado.toFixed(2)}`, 194, yPos, { align: 'right' });
          
          doc.setTextColor(0, 0, 0);
          yPos += 2;
          
        } else if (mov.tipo === 'pago') {
          // ========================================
          // PAGO - DISEÑO MINIMALISTA
          // ========================================
          
          // Centrado vertical
          yPos += 3;
          
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('PAGO RECIBIDO', 16, yPos);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6);
          doc.setTextColor(120, 120, 120);
          doc.text(dayjs(mov.fecha_movimiento).format('DD/MM/YYYY'), 115, yPos);
          
          const montoPago = parseFloat(String(mov.haber || 0));
          saldoAcumulado -= montoPago;
          
          // Monto en verde - alineado
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(34, 197, 94);
          doc.text('Pago:', 155, yPos);
          doc.text(`-$${montoPago.toFixed(2)}`, 194, yPos, { align: 'right' });
          
          // MEJORA 3: Mostrar saldo acumulado después del pago
          yPos += 4;
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('Saldo Acumulado:', 155, yPos);
          doc.setTextColor(59, 130, 246); // Azul
          doc.text(`$${saldoAcumulado.toFixed(2)}`, 194, yPos, { align: 'right' });
          
          doc.setTextColor(0, 0, 0);
          yPos += 2;
        }
        
        // Línea separadora muy fina
        if (i < movimientosFiltrados.length - 1) {
          doc.setDrawColor(235, 235, 235);
          doc.setLineWidth(0.1);
          doc.line(14, yPos, 196, yPos);
          yPos += 2;
        }
      }
      
      // ========================================
      // 4. RESUMEN FINAL PROFESIONAL
      // ========================================
      
      yPos += 8;
      
      // Línea separadora doble
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(14, yPos, 196, yPos);
      doc.setLineWidth(0.1);
      doc.line(14, yPos + 1, 196, yPos + 1);
      
      yPos += 7;
      
      // Resumen elegante
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const saldoActual = Number(cliente.saldo_actual) || 0;
      doc.text('SALDO ACTUAL:', 14, yPos);
      
      // Color según el saldo
      doc.setFontSize(10);
      if (saldoActual > 0) {
        doc.setTextColor(220, 38, 38); // Rojo
        doc.text(`$${saldoActual.toFixed(2)}`, 194, yPos, { align: 'right' });
      } else if (saldoActual < 0) {
        doc.setTextColor(34, 197, 94); // Verde
        doc.text(`$${Math.abs(saldoActual).toFixed(2)} (a favor)`, 194, yPos, { align: 'right' });
      } else {
        doc.setTextColor(120, 120, 120); // Gris
        doc.text('$0.00', 194, yPos, { align: 'right' });
      }
      
      // ========================================
      // 5. GUARDAR PDF CON NOMBRE PERSONALIZADO
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
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'], // Siempre visible
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
      align: 'center',
      responsive: ['sm', 'md', 'lg', 'xl'], // Oculto en móviles muy pequeños
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
      align: 'right',
      responsive: ['md', 'lg', 'xl'], // Visible desde tablets
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
      align: 'right',
      responsive: ['md', 'lg', 'xl'], // Visible desde tablets
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
      align: 'right',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'], // Siempre visible (más importante)
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
      align: 'center',
      responsive: ['lg', 'xl'], // Visible solo en pantallas grandes
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
      align: 'center',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'], // Siempre visible
      render: (_: any, record: ClienteCuentaCorriente) => (
        <Space size="small" direction="vertical" style={{ width: '100%' }}>
          <Button
            type="primary"
            size="small"
            icon={<DollarOutlined />}
            onClick={() => handleAbrirModalPago(record)}
            block
          >
            Registrar Pago
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleVerDetalle(record)}
            block
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
      responsive: ['sm', 'md', 'lg', 'xl'], // Visible desde móviles grandes
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      align: 'center',
      responsive: ['sm', 'md', 'lg', 'xl'], // Visible desde móviles grandes
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
                  <Row justify="space-between" align="middle">
                    <Col span={18}>
                      <Space size={4} wrap={false} style={{ flexWrap: 'nowrap' }}>
                    <Text strong style={{ fontSize: '11px' }}>
                      {producto.producto_nombre}
                    </Text>
                    {producto.producto_tipo && (
                          <>
                            <Text type="secondary" style={{ fontSize: '10px' }}>•</Text>
                      <Text style={{ fontSize: '10px', color: '#1890ff' }}>
                              {producto.producto_tipo}
                      </Text>
                          </>
                    )}
                    {producto.producto_marca && (
                          <>
                            <Text type="secondary" style={{ fontSize: '10px' }}>•</Text>
                      <Text type="secondary" style={{ fontSize: '10px' }}>
                              {producto.producto_marca}
                      </Text>
                          </>
                    )}
                    <Text type="secondary" style={{ fontSize: '10px' }}>
                          ({producto.cantidad} x ${parseFloat(producto.precio_unitario || 0).toFixed(2)})
                    </Text>
                  </Space>
                    </Col>
                    <Col span={6} style={{ textAlign: 'right' }}>
                  <Text strong style={{ fontSize: '11px', color: '#52c41a' }}>
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
      align: 'right',
      responsive: ['md', 'lg', 'xl'], // Visible desde tablets
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
      align: 'right',
      responsive: ['md', 'lg', 'xl'], // Visible desde tablets
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
      align: 'right',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'], // Siempre visible (muy importante)
      render: (value: any) => {
        const numValue = parseFloat(value) || 0;
        return (
          <Text style={{ color: '#1890ff', fontWeight: 'bold' }}>
            ${numValue.toFixed(2)}
          </Text>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      align: 'center',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'], // Siempre visible
      className: 'no-print', // Clase para no imprimir en PDF
      render: (_: any, record: any) => {
        const estaOculto = movimientosOcultosParaPDF.has(record.id);
        return (
          <Tooltip 
            title={
              estaOculto 
                ? "Movimiento oculto en PDF - Click para mostrar" 
                : "Ocultar en PDF - Click para no incluir en el estado de cuenta"
            }
          >
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
              className="no-print" // Clase para no imprimir en PDF
              onClick={() => toggleMovimientoParaPDF(record.id)}
              style={{ 
                color: estaOculto ? '#ff4d4f' : '#1890ff',
                textDecoration: estaOculto ? 'line-through' : 'none',
                opacity: estaOculto ? 0.5 : 1
              }}
            />
          </Tooltip>
        );
      },
    },
  ];

  /**
   * Filtrar clientes por búsqueda
   */
  const clientesFiltrados = useMemo(() => {
    if (!busquedaCliente.trim()) {
      return clientes;
    }
    
    const busquedaLower = busquedaCliente.toLowerCase().trim();
    return clientes.filter((cliente) => 
      cliente.cliente_nombre.toLowerCase().includes(busquedaLower)
    );
  }, [clientes, busquedaCliente]);

  /**
   * Calcular estadísticas (basadas en clientes filtrados)
   */
  const totalDeudores = clientesFiltrados.length;
  const deudaTotal = clientesFiltrados.reduce((sum, c) => sum + parseFloat(c.saldo_actual as any || '0'), 0);
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
                onClick={() => {
                  if (sucursalSeleccionada === 'todas') {
                    cargarTodosLosClientes();
                  } else {
                    cargarClientes();
                  }
                }}
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
          <Card size="small" loading={loadingCaja}>
            <Statistic
              title={`Caja ${sucursalSeleccionada !== 'todas' ? sucursalSeleccionada.toUpperCase() : ''}`}
              value={montoCaja}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
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
          <Col xs={24} sm={16}>
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
              <Text strong>🔍 Buscar Cliente</Text>
              <Input
                placeholder="Buscar por nombre de cliente..."
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                allowClear
                style={{ width: '100%' }}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabla de clientes */}
      <Card>
        {!loading && clientesFiltrados.length === 0 && (
          <Alert
            message={busquedaCliente.trim() ? "No se encontraron resultados" : "No hay clientes con saldo pendiente"}
            description={
              busquedaCliente.trim()
                ? `No se encontraron clientes que coincidan con "${busquedaCliente}"`
                : sucursalSeleccionada === 'todas'
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
          dataSource={clientesFiltrados}
          loading={loading}
          rowKey={(record) => `${record.sucursal}-${record.cliente_id}`}
          size="small"
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
            <span style={{ color: '#000' }}>
              Detalle de Cuenta - {clienteSeleccionado?.nombre_fantasia || clienteSeleccionado?.cliente_nombre}
            </span>
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

            {/* MEJORA 4: Filtros de fecha para PDF */}
            <Card size="small" style={{ background: '#f0f7ff', border: '1px solid #91caff' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text strong>📅 Filtro de Fechas para PDF</Text>
                <Space wrap>
                  <Space>
                    <Text type="secondary">Desde:</Text>
                    <DatePicker
                      placeholder="Fecha inicial"
                      value={filtroFechaPDFDesde}
                      onChange={(date) => setFiltroFechaPDFDesde(date)}
                      format="DD/MM/YYYY"
                      style={{ width: 150 }}
                    />
                  </Space>
                  <Space>
                    <Text type="secondary">Hasta:</Text>
                    <DatePicker
                      placeholder="Fecha final"
                      value={filtroFechaPDFHasta}
                      onChange={(date) => setFiltroFechaPDFHasta(date)}
                      format="DD/MM/YYYY"
                      style={{ width: 150 }}
                    />
                  </Space>
                  {(filtroFechaPDFDesde || filtroFechaPDFHasta) && (
                    <Button
                      size="small"
                      onClick={() => {
                        setFiltroFechaPDFDesde(null);
                        setFiltroFechaPDFHasta(null);
                      }}
                    >
                      Limpiar Filtros
                    </Button>
                  )}
                </Space>
                <Alert
                  message="Estos filtros solo afectan el PDF generado, no la tabla mostrada aquí."
                  type="info"
                  showIcon
                  style={{ marginTop: 8 }}
                />
              </Space>
            </Card>

            {/* Tabla de movimientos */}
            <div>
              <Text strong style={{ fontSize: '16px' }}>Historial de Movimientos</Text>
              <Table
                columns={columnasMovimientos}
                dataSource={movimientos}
                loading={loadingMovimientos}
                rowKey="id"
                size="small"
                rowClassName={(record) => 
                  movimientosOcultosParaPDF.has(record.id) ? 'row-oculta-pdf' : ''
                }
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
                      Monto: ${Number(movimientos[0].haber || 0).toFixed(2)}
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
                responsive: ['sm', 'md', 'lg', 'xl'], // Visible desde móviles grandes
                render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY HH:mm'),
                sorter: (a: any, b: any) => dayjs(a.fecha_pago).valueOf() - dayjs(b.fecha_pago).valueOf(),
              },
              {
                title: 'Cliente',
                dataIndex: 'cliente_nombre',
                key: 'cliente_nombre',
                responsive: ['xs', 'sm', 'md', 'lg', 'xl'], // Siempre visible
              },
              {
                title: 'Sucursal',
                dataIndex: 'sucursal',
                key: 'sucursal',
                responsive: ['sm', 'md', 'lg', 'xl'], // Visible desde móviles grandes
                render: (sucursal: string) => (
                  <Tag color="blue">{sucursal.toUpperCase()}</Tag>
                ),
              },
              {
                title: 'Monto',
                dataIndex: 'monto',
                key: 'monto',
                align: 'right' as const,
                responsive: ['xs', 'sm', 'md', 'lg', 'xl'], // Siempre visible (muy importante)
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
                responsive: ['md', 'lg', 'xl'], // Visible desde tablets
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
                responsive: ['lg', 'xl'], // Visible solo en pantallas grandes
                render: (comprobante: string) => comprobante || '-',
              },
              {
                title: 'Observaciones',
                dataIndex: 'observaciones',
                key: 'observaciones',
                ellipsis: true,
                responsive: ['lg', 'xl'], // Visible solo en pantallas grandes
                render: (obs: string) => obs || '-',
              },
              {
                title: 'Saldo Cliente',
                dataIndex: 'saldo_actual_cliente',
                key: 'saldo_actual_cliente',
                align: 'right' as const,
                responsive: ['md', 'lg', 'xl'], // Visible desde tablets
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

