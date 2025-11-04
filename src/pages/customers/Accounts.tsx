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
  ShopOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WalletOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { cuentaCorrienteService, vendedoresService } from '../../services/api';
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
}

// Tipo de sucursal como string simple
type Sucursal = string;

/**
 * Componente Principal
 */
const Accounts: React.FC = () => {
  // Estados principales
  const [clientes, setClientes] = useState<ClienteCuentaCorriente[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSucursales, setLoadingSucursales] = useState<boolean>(false);
  
  // Filtros
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('todas');
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
  const [filtroSucursalHistorial, setFiltroSucursalHistorial] = useState<string>('todas');
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
      
      // Auto-seleccionar "todas" por defecto
      setSucursalSeleccionada('todas');
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
      await cuentaCorrienteService.registrarPago({
        sucursal: clienteSeleccionado.sucursal,
        cliente_id: clienteSeleccionado.cliente_id,
        cliente_nombre: clienteSeleccionado.cliente_nombre,
        monto: montoPago,
        metodo_pago: metodoPago,
        comprobante: comprobantePago || undefined,
        observaciones: observacionesPago || undefined
      });
      
      message.success('✅ Pago registrado exitosamente');
      setModalPagoVisible(false);
      
      // Recargar datos
      if (sucursalSeleccionada === 'todas') {
        cargarTodosLosClientes();
      } else {
        cargarClientes();
      }
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
    
    // Generar HTML para impresión
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Estado de Cuenta - ${cliente.cliente_nombre}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #1890ff;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #1890ff;
            font-size: 28px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .info {
            margin: 20px 0;
            display: flex;
            justify-content: space-between;
          }
          .info-section {
            flex: 1;
          }
          .info-label {
            font-weight: bold;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
          }
          .info-value {
            font-size: 16px;
            color: #333;
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background-color: #1890ff;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #eee;
            font-size: 14px;
          }
          tr:hover {
            background-color: #f5f5f5;
          }
          .total {
            margin-top: 30px;
            text-align: right;
            padding: 20px;
            background-color: #f0f2f5;
            border-radius: 8px;
          }
          .total-label {
            font-size: 18px;
            color: #666;
            margin-right: 20px;
          }
          .total-value {
            font-size: 28px;
            font-weight: bold;
            color: ${cliente.saldo_actual > 0 ? '#f5222d' : '#52c41a'};
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 2px solid #eee;
            padding-top: 20px;
          }
          .debe { color: #f5222d; font-weight: bold; }
          .haber { color: #52c41a; font-weight: bold; }
          .saldo { color: #1890ff; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ESTADO DE CUENTA CORRIENTE</h1>
          <p>Sistema ZARPAR - Gestión Comercial</p>
        </div>
        
        <div class="info">
          <div class="info-section">
            <div class="info-label">Cliente</div>
            <div class="info-value">${cliente.cliente_nombre}</div>
          </div>
          <div class="info-section">
            <div class="info-label">Sucursal</div>
            <div class="info-value">${cliente.sucursal ? cliente.sucursal.toUpperCase() : 'N/A'}</div>
          </div>
          <div class="info-section">
            <div class="info-label">Fecha de Emisión</div>
            <div class="info-value">${dayjs().format('DD/MM/YYYY HH:mm')}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th style="text-align: right;">Debe</th>
              <th style="text-align: right;">Haber</th>
              <th style="text-align: right;">Saldo</th>
            </tr>
          </thead>
          <tbody>
            ${movimientos.map(mov => `
              <tr>
                <td>${dayjs(mov.fecha_movimiento).format('DD/MM/YYYY HH:mm')}</td>
                <td>${mov.descripcion}</td>
                <td class="debe" style="text-align: right;">
                  ${parseFloat(mov.debe || 0) > 0 ? `$${parseFloat(mov.debe || 0).toFixed(2)}` : '-'}
                </td>
                <td class="haber" style="text-align: right;">
                  ${parseFloat(mov.haber || 0) > 0 ? `$${parseFloat(mov.haber || 0).toFixed(2)}` : '-'}
                </td>
                <td class="saldo" style="text-align: right;">
                  $${parseFloat(mov.saldo || 0).toFixed(2)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <span class="total-label">SALDO ACTUAL:</span>
          <span class="total-value">$${parseFloat(cliente.saldo_actual || 0).toFixed(2)}</span>
        </div>
        
        <div class="footer">
          <p>Documento generado automáticamente por Sistema ZARPAR</p>
          <p>Fecha: ${dayjs().format('DD/MM/YYYY HH:mm:ss')}</p>
        </div>
      </body>
      </html>
    `;
    
    // Abrir ventana de impresión
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
      ventana.focus();
      
      // Esperar a que se cargue el contenido
      setTimeout(() => {
        ventana.print();
      }, 500);
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
  const columnasMovimientos: ColumnsType<MovimientoCuentaCorriente> = [
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
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      ellipsis: true,
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
              <Text strong>Sucursal</Text>
              <Select
                value={sucursalSeleccionada}
                onChange={setSucursalSeleccionada}
                style={{ width: '100%' }}
                loading={loadingSucursales}
                placeholder="Seleccionar sucursal"
              >
                <Option key="todas" value="todas">Todas las Sucursales</Option>
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
            key="imprimir"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => clienteSeleccionado && handleImprimirEstado(clienteSeleccionado)}
            loading={loadingMovimientos}
          >
            Imprimir Estado
          </Button>,
        ]}
        width={900}
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
                scroll={{ x: 800 }}
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
                  <Text strong>Sucursal</Text>
                  <Select
                    value={filtroSucursalHistorial}
                    onChange={setFiltroSucursalHistorial}
                    style={{ width: '100%', marginTop: 8 }}
                  >
                    <Option value="todas">Todas las Sucursales</Option>
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

