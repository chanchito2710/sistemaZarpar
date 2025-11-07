/**
 * Página de Gestión de Clientes con Ventas, Cuenta Corriente y Reportes
 * Sistema completo de análisis de ventas por cliente
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Select,
  DatePicker,
  Space,
  Typography,
  Tabs,
  message,
  Spin,
  Tag,
  Modal,
  Form,
  InputNumber,
  Input,
  Statistic,
  Badge,
  Divider,
  Empty
} from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  BarChartOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import {
  clientesService,
  ventasService,
  cuentaCorrienteService,
  vendedoresService,
  type Cliente,
  type Venta,
  type MovimientoCuentaCorriente,
  type ResumenCuentaCorriente,
  type ReporteVentas
} from '../../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

/**
 * Colores para gráficas
 */
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

/**
 * Componente Principal
 */
const Customers: React.FC = () => {
  const { usuario } = useAuth();

  // Estados generales
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('pando');
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabActiva, setTabActiva] = useState('1');

  // Estados de clientes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  // Estados de ventas
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [ventasCliente, setVentasCliente] = useState<Venta[]>([]);
  const [modalVentaVisible, setModalVentaVisible] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState<any>(null);

  // Estados de cuenta corriente
  const [clientesCuentaCorriente, setClientesCuentaCorriente] = useState<any[]>([]);
  const [estadoCuenta, setEstadoCuenta] = useState<{
    movimientos: MovimientoCuentaCorriente[];
    resumen: ResumenCuentaCorriente;
  } | null>(null);
  const [modalCuentaCorriente, setModalCuentaCorriente] = useState(false);
  const [modalPago, setModalPago] = useState(false);
  const [formPago] = Form.useForm();

  // Estados de reportes
  const [reportes, setReportes] = useState<ReporteVentas | null>(null);
  const [fechasReporte, setFechasReporte] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);

  /**
   * Cargar sucursales al iniciar
   */
  useEffect(() => {
    cargarSucursalesIniciales();
  }, []);

  /**
   * Auto-seleccionar sucursal según usuario
   */
  useEffect(() => {
    if (usuario && sucursales.length > 0) {
      if (usuario.esAdmin) {
        setSucursalSeleccionada('pando'); // Admin selecciona por defecto
      } else if (usuario.sucursal) {
        setSucursalSeleccionada(usuario.sucursal.toLowerCase());
      }
    }
  }, [usuario, sucursales]);

  /**
   * Cargar datos cuando cambia la sucursal
   */
  useEffect(() => {
    if (sucursalSeleccionada) {
      cargarDatos();
    }
  }, [sucursalSeleccionada]);

  /**
   * Cargar reportes cuando cambian las fechas
   */
  useEffect(() => {
    if (sucursalSeleccionada && tabActiva === '3') {
      cargarReportes();
    }
  }, [fechasReporte, sucursalSeleccionada, tabActiva]);

  /**
   * Cargar sucursales disponibles
   */
  const cargarSucursalesIniciales = async () => {
    try {
      const sucursalesData = await vendedoresService.obtenerSucursales();
      setSucursales(sucursalesData);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      message.error('Error al cargar sucursales');
    }
  };

  /**
   * Cargar todos los datos de la sucursal
   */
  const cargarDatos = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarClientes(),
        cargarVentas(),
        cargarClientesCuentaCorriente()
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar clientes de la sucursal
   */
  const cargarClientes = async () => {
    try {
      const data = await clientesService.obtenerPorSucursal(sucursalSeleccionada);
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      message.error('Error al cargar clientes');
    }
  };

  /**
   * Cargar ventas de la sucursal
   */
  const cargarVentas = async () => {
    try {
      const data = await ventasService.obtenerPorSucursal(sucursalSeleccionada);
      setVentas(data);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      message.error('Error al cargar ventas');
    }
  };

  /**
   * Cargar clientes con saldo en cuenta corriente
   */
  const cargarClientesCuentaCorriente = async () => {
    try {
      const data = await cuentaCorrienteService.obtenerClientesConSaldo(sucursalSeleccionada);
      setClientesCuentaCorriente(data);
    } catch (error) {
      console.error('Error al cargar cuenta corriente:', error);
    }
  };

  /**
   * Cargar ventas de un cliente específico
   */
  const cargarVentasCliente = async (clienteId: number) => {
    try {
      setLoading(true);
      const data = await ventasService.obtenerPorCliente(sucursalSeleccionada, clienteId);
      setVentasCliente(data);
    } catch (error) {
      console.error('Error al cargar ventas del cliente:', error);
      message.error('Error al cargar ventas del cliente');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ver detalle de una venta
   */
  const verDetalleVenta = async (ventaId: number) => {
    try {
      setLoading(true);
      const detalle = await ventasService.obtenerDetalle(ventaId);
      setVentaDetalle(detalle);
      setModalVentaVisible(true);
    } catch (error) {
      console.error('Error al cargar detalle de venta:', error);
      message.error('Error al cargar detalle de venta');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ver estado de cuenta de un cliente
   */
  const verEstadoCuenta = async (clienteId: number, clienteNombre: string) => {
    try {
      setLoading(true);
      const data = await cuentaCorrienteService.obtenerEstadoCuenta(sucursalSeleccionada, clienteId);
      setEstadoCuenta(data);
      
      // Encontrar el cliente
      const cliente = clientes.find(c => c.id === clienteId) || {
        id: clienteId,
        nombre: clienteNombre.split(' ')[0] || '',
        apellido: clienteNombre.split(' ').slice(1).join(' ') || '',
        fecha_registro: '',
        activo: true
      } as Cliente;
      
      setClienteSeleccionado(cliente);
      setModalCuentaCorriente(true);
    } catch (error) {
      console.error('Error al cargar estado de cuenta:', error);
      message.error('Error al cargar estado de cuenta');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registrar un pago en cuenta corriente
   */
  const registrarPago = async () => {
    if (!clienteSeleccionado) return;

    try {
      const values = await formPago.validateFields();
      setLoading(true);

      await cuentaCorrienteService.registrarPago({
        sucursal: sucursalSeleccionada,
        cliente_id: clienteSeleccionado.id,
        cliente_nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`,
        monto: values.monto,
        metodo_pago: values.metodo_pago,
        comprobante: values.comprobante,
        observaciones: values.observaciones
      });

      message.success('✅ Pago registrado exitosamente');
      formPago.resetFields();
      setModalPago(false);
      
      // Recargar datos
      await verEstadoCuenta(clienteSeleccionado.id, `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`);
      await cargarClientesCuentaCorriente();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      message.error('Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar reportes de ventas
   */
  const cargarReportes = async () => {
    if (!fechasReporte || fechasReporte.length !== 2) return;

    try {
      setLoading(true);
      const data = await ventasService.obtenerReportes(
        sucursalSeleccionada,
        fechasReporte[0].format('YYYY-MM-DD'),
        fechasReporte[1].format('YYYY-MM-DD')
      );
      setReportes(data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      message.error('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Columnas de la tabla de clientes con ventas
   */
  const columnasClientes = [
    {
      title: 'Cliente',
      key: 'cliente',
      render: (_: any, record: Cliente) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <div>
            <div><Text strong>{record.nombre} {record.apellido}</Text></div>
            {record.nombre_fantasia && <div><Text type="secondary" style={{ fontSize: 12 }}>{record.nombre_fantasia}</Text></div>}
          </div>
        </Space>
      )
    },
    {
      title: 'Contacto',
      key: 'contacto',
      render: (_: any, record: Cliente) => (
        <div>
          <div><Text>{record.email || '-'}</Text></div>
          <div><Text type="secondary">{record.telefono || '-'}</Text></div>
        </div>
      )
    },
    {
      title: 'RUT',
      dataIndex: 'rut',
      key: 'rut',
      render: (rut: string) => rut || '-'
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Cliente) => (
        <Space>
          <Button
            size="small"
            icon={<ShoppingOutlined />}
            onClick={() => {
              setClienteSeleccionado(record);
              cargarVentasCliente(record.id);
              setTabActiva('1');
            }}
          >
            Ver Ventas
          </Button>
          <Button
            size="small"
            icon={<CreditCardOutlined />}
            onClick={() => verEstadoCuenta(record.id, `${record.nombre} ${record.apellido}`)}
          >
            Cuenta Corriente
          </Button>
        </Space>
      )
    }
  ];

  /**
   * Columnas de la tabla de ventas
   */
  const columnasVentas = [
    {
      title: 'N° Venta',
      dataIndex: 'numero_venta',
      key: 'numero_venta',
      render: (numero: string) => <Text strong>{numero}</Text>
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente_nombre',
      key: 'cliente_nombre'
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_venta',
      key: 'fecha_venta',
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Método de Pago',
      dataIndex: 'metodo_pago',
      key: 'metodo_pago',
      render: (metodo: string) => {
        const config: any = {
          efectivo: { color: 'success', text: 'Efectivo' },
          transferencia: { color: 'processing', text: 'Transferencia' },
          cuenta_corriente: { color: 'warning', text: 'Cuenta Corriente' }
        };
        return <Tag color={config[metodo]?.color}>{config[metodo]?.text}</Tag>;
      }
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => <Text strong>${total.toFixed(2)}</Text>
    },
    {
      title: 'Estado',
      dataIndex: 'estado_pago',
      key: 'estado_pago',
      render: (estado: string) => {
        const config: any = {
          pagado: { color: 'success', text: '✅ Pagado' },
          pendiente: { color: 'error', text: '⏳ Pendiente' },
          parcial: { color: 'warning', text: '⚠️ Parcial' }
        };
        return <Tag color={config[estado]?.color}>{config[estado]?.text}</Tag>;
      }
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Venta) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => verDetalleVenta(record.id)}>
          Ver Detalle
        </Button>
      )
    }
  ];

  /**
   * Columnas de cuenta corriente
   */
  const columnasMovimientos = [
    {
      title: 'Fecha',
      dataIndex: 'fecha_movimiento',
      key: 'fecha_movimiento',
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo: string) => {
        const config: any = {
          venta: { color: 'orange', text: 'Venta' },
          pago: { color: 'green', text: 'Pago' },
          ajuste: { color: 'blue', text: 'Ajuste' }
        };
        return <Tag color={config[tipo]?.color}>{config[tipo]?.text}</Tag>;
      }
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion'
    },
    {
      title: 'Debe',
      dataIndex: 'debe',
      key: 'debe',
      render: (debe: number) => debe > 0 ? <Text type="danger">${debe.toFixed(2)}</Text> : '-'
    },
    {
      title: 'Haber',
      dataIndex: 'haber',
      key: 'haber',
      render: (haber: number) => haber > 0 ? <Text type="success">${haber.toFixed(2)}</Text> : '-'
    },
    {
      title: 'Saldo',
      dataIndex: 'saldo',
      key: 'saldo',
      render: (saldo: number) => (
        <Text strong style={{ color: saldo > 0 ? '#ff4d4f' : '#52c41a' }}>
          ${saldo.toFixed(2)}
        </Text>
      )
    }
  ];

  /**
   * Columnas clientes con deuda
   */
  const columnasClientesDeuda = [
    {
      title: 'Cliente',
      dataIndex: 'cliente_nombre',
      key: 'cliente_nombre',
      render: (nombre: string, record: any) => (
        <div>
          <Text strong>{nombre}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Última actualización: {dayjs(record.ultimo_movimiento).format('DD/MM/YYYY')}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Total Debe',
      dataIndex: 'total_debe',
      key: 'total_debe',
      render: (debe: number) => <Text type="danger">${debe.toFixed(2)}</Text>
    },
    {
      title: 'Total Haber',
      dataIndex: 'total_haber',
      key: 'total_haber',
      render: (haber: number) => <Text type="success">${haber.toFixed(2)}</Text>
    },
    {
      title: 'Saldo Actual',
      dataIndex: 'saldo_actual',
      key: 'saldo_actual',
      render: (saldo: number) => (
        <Text strong style={{ fontSize: 16, color: saldo > 0 ? '#ff4d4f' : '#52c41a' }}>
          ${saldo.toFixed(2)}
        </Text>
      )
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => verEstadoCuenta(record.cliente_id, record.cliente_nombre)}
          >
            Ver Detalle
          </Button>
          {record.saldo_actual > 0 && (
            <Button
              size="small"
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => {
                const cliente = clientes.find(c => c.id === record.cliente_id);
                setClienteSeleccionado(cliente || {
                  id: record.cliente_id,
                  nombre: record.cliente_nombre.split(' ')[0],
                  apellido: record.cliente_nombre.split(' ').slice(1).join(' '),
                  fecha_registro: '',
                  activo: true
                } as Cliente);
                setModalPago(true);
              }}
            >
              Registrar Pago
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Title level={2} style={{ margin: 0 }}>
                  <UserOutlined /> Gestión de Clientes y Ventas
                </Title>
                <Text type="secondary">Sistema completo de ventas, cuenta corriente y reportes</Text>
              </Col>
              <Col>
                <Space>
                  <Text>Sucursal:</Text>
                  <Select
                    value={sucursalSeleccionada}
                    onChange={setSucursalSeleccionada}
                    style={{ width: 200 }}
                    disabled={!usuario?.esAdmin}
                  >
                    {sucursales.map(sucursal => (
                      <Option key={sucursal} value={sucursal.toLowerCase()}>
                        {sucursal.charAt(0).toUpperCase() + sucursal.slice(1)}
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Tabs Principal */}
      <Card>
        <Tabs activeKey={tabActiva} onChange={setTabActiva}>
          {/* Tab 1: Ventas por Cliente */}
          <Tabs.TabPane
            tab={
              <span>
                <ShoppingOutlined />
                Ventas por Cliente
              </span>
            }
            key="1"
          >
            <Spin spinning={loading}>
              {clienteSeleccionado ? (
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Card size="small" style={{ background: '#f0f8ff' }}>
                    <Row gutter={16} align="middle">
                      <Col flex="auto">
                        <Title level={4} style={{ margin: 0 }}>
                          {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                        </Title>
                        {clienteSeleccionado.nombre_fantasia && (
                          <Text type="secondary">{clienteSeleccionado.nombre_fantasia}</Text>
                        )}
                      </Col>
                      <Col>
                        <Button onClick={() => {
                          setClienteSeleccionado(null);
                          setVentasCliente([]);
                        }}>
                          Volver a Clientes
                        </Button>
                      </Col>
                    </Row>
                  </Card>

                  <Table
                    dataSource={ventasCliente}
                    columns={columnasVentas}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                </Space>
              ) : (
                <>
                  <Title level={4}>Selecciona un cliente para ver sus ventas</Title>
                  <Table
                    dataSource={clientes}
                    columns={columnasClientes}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                </>
              )}
            </Spin>
          </Tabs.TabPane>

          {/* Tab 2: Cuenta Corriente */}
          <Tabs.TabPane
            tab={
              <span>
                <CreditCardOutlined />
                Cuenta Corriente
                {clientesCuentaCorriente.length > 0 && (
                  <Badge count={clientesCuentaCorriente.length} style={{ marginLeft: 8 }} />
                )}
              </span>
            }
            key="2"
          >
            <Spin spinning={loading}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Row gutter={16}>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="Clientes con Deuda"
                        value={clientesCuentaCorriente.length}
                        prefix={<UserOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="Total Adeudado"
                        value={clientesCuentaCorriente.reduce((sum, c) => sum + parseFloat(c.saldo_actual), 0)}
                        precision={2}
                        prefix="$"
                        valueStyle={{ color: '#cf1322' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="Total Pagado"
                        value={clientesCuentaCorriente.reduce((sum, c) => sum + parseFloat(c.total_haber), 0)}
                        precision={2}
                        prefix="$"
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Table
                  dataSource={clientesCuentaCorriente}
                  columns={columnasClientesDeuda}
                  rowKey="cliente_id"
                  pagination={{ pageSize: 10 }}
                />
              </Space>
            </Spin>
          </Tabs.TabPane>

          {/* Tab 3: Reportes */}
          <Tabs.TabPane
            tab={
              <span>
                <BarChartOutlined />
                Reportes
              </span>
            }
            key="3"
          >
            <Spin spinning={loading}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* Filtros de Fecha */}
                <Card size="small">
                  <Space>
                    <Text strong>Período:</Text>
                    <RangePicker
                      value={fechasReporte}
                      onChange={(dates) => dates && setFechasReporte(dates as [Dayjs, Dayjs])}
                      format="DD/MM/YYYY"
                    />
                    <Button type="primary" onClick={cargarReportes}>
                      Actualizar
                    </Button>
                  </Space>
                </Card>

                {reportes ? (
                  <>
                    {/* Estadísticas Generales */}
                    <Row gutter={16}>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="Total Ventas"
                            value={reportes.resumen.total_ventas}
                            prefix={<ShoppingOutlined />}
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="Total Vendido"
                            value={reportes.resumen.total_vendido}
                            precision={2}
                            prefix="$"
                            valueStyle={{ color: '#3f8600' }}
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="Descuentos"
                            value={reportes.resumen.total_descuentos}
                            precision={2}
                            prefix="$"
                            valueStyle={{ color: '#cf1322' }}
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="Promedio Venta"
                            value={reportes.resumen.promedio_venta}
                            precision={2}
                            prefix="$"
                          />
                        </Card>
                      </Col>
                    </Row>

                    {/* Gráficas */}
                    <Row gutter={16}>
                      {/* Ventas por Día */}
                      <Col span={12}>
                        <Card title="Ventas por Día">
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={reportes.ventas_por_dia}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="fecha" tickFormatter={(value) => dayjs(value).format('DD/MM')} />
                              <YAxis />
                              <Tooltip
                                formatter={(value: number) => `$${value.toFixed(2)}`}
                                labelFormatter={(label) => dayjs(label).format('DD/MM/YYYY')}
                              />
                              <Legend />
                              <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" strokeWidth={2} />
                              <Line type="monotone" dataKey="cantidad" stroke="#82ca9d" name="Cantidad" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </Card>
                      </Col>

                      {/* Métodos de Pago */}
                      <Col span={12}>
                        <Card title="Métodos de Pago">
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={reportes.metodos_pago}
                                dataKey="total"
                                nameKey="metodo_pago"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={({ metodo_pago, total }) => `${metodo_pago}: $${total.toFixed(0)}`}
                              >
                                {reportes.metodos_pago.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </Card>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      {/* Top Productos */}
                      <Col span={12}>
                        <Card title="Top 10 Productos Más Vendidos">
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={reportes.top_productos}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="producto_nombre" angle={-45} textAnchor="end" height={100} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="cantidad_vendida" fill="#8884d8" name="Cantidad" />
                            </BarChart>
                          </ResponsiveContainer>
                        </Card>
                      </Col>

                      {/* Top Clientes */}
                      <Col span={12}>
                        <Card title="Top 10 Clientes">
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={reportes.top_clientes}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="cliente_nombre" angle={-45} textAnchor="end" height={100} />
                              <YAxis />
                              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                              <Legend />
                              <Bar dataKey="total_gastado" fill="#82ca9d" name="Total Gastado" />
                            </BarChart>
                          </ResponsiveContainer>
                        </Card>
                      </Col>
                    </Row>
                  </>
                ) : (
                  <Empty description="Selecciona un rango de fechas y haz clic en Actualizar para ver los reportes" />
                )}
              </Space>
            </Spin>
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* Modal Detalle de Venta */}
      <Modal
        title={`Detalle de Venta - ${ventaDetalle?.numero_venta}`}
        open={modalVentaVisible}
        onCancel={() => setModalVentaVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVentaVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {ventaDetalle && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Cliente:</Text>
                  <div><Text strong>{ventaDetalle.cliente_nombre}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Vendedor:</Text>
                  <div><Text strong>{ventaDetalle.vendedor_nombre}</Text></div>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 12 }}>
                <Col span={12}>
                  <Text type="secondary">Fecha:</Text>
                  <div><Text>{dayjs(ventaDetalle.fecha_venta).format('DD/MM/YYYY HH:mm')}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Método de Pago:</Text>
                  <div>
                    <Tag color={
                      ventaDetalle.metodo_pago === 'efectivo' ? 'success' :
                      ventaDetalle.metodo_pago === 'transferencia' ? 'processing' : 'warning'
                    }>
                      {ventaDetalle.metodo_pago === 'efectivo' ? 'Efectivo' :
                       ventaDetalle.metodo_pago === 'transferencia' ? 'Transferencia' : 'Cuenta Corriente'}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </Card>

            <Table
              dataSource={ventaDetalle.productos}
              columns={[
                {
                  title: 'Producto',
                  dataIndex: 'producto_nombre',
                  key: 'producto_nombre'
                },
                {
                  title: 'Cantidad',
                  dataIndex: 'cantidad',
                  key: 'cantidad',
                  align: 'center'
                },
                {
                  title: 'Precio Unit.',
                  dataIndex: 'precio_unitario',
                  key: 'precio_unitario',
                  render: (precio: number) => `$${precio.toFixed(2)}`
                },
                {
                  title: 'Subtotal',
                  dataIndex: 'subtotal',
                  key: 'subtotal',
                  render: (subtotal: number) => <Text strong>${subtotal.toFixed(2)}</Text>
                }
              ]}
              rowKey="id"
              pagination={false}
              size="small"
            />

            <Card size="small" style={{ background: '#f0f8ff' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text>Subtotal:</Text>
                  <div><Text strong>${ventaDetalle.subtotal.toFixed(2)}</Text></div>
                </Col>
                <Col span={8}>
                  <Text>Descuento:</Text>
                  <div><Text type="success">${ventaDetalle.descuento.toFixed(2)}</Text></div>
                </Col>
                <Col span={8}>
                  <Text>Total:</Text>
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                      ${ventaDetalle.total.toFixed(2)}
                    </Title>
                  </div>
                </Col>
              </Row>
            </Card>
          </Space>
        )}
      </Modal>

      {/* Modal Estado de Cuenta Corriente */}
      <Modal
        title={`Estado de Cuenta - ${clienteSeleccionado?.nombre} ${clienteSeleccionado?.apellido}`}
        open={modalCuentaCorriente}
        onCancel={() => setModalCuentaCorriente(false)}
        footer={[
          <Button key="close" onClick={() => setModalCuentaCorriente(false)}>
            Cerrar
          </Button>
        ]}
        width={1000}
      >
        {estadoCuenta && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Total Debe"
                    value={estadoCuenta.resumen.total_debe}
                    precision={2}
                    prefix="$"
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Total Haber"
                    value={estadoCuenta.resumen.total_haber}
                    precision={2}
                    prefix="$"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Saldo Actual"
                    value={estadoCuenta.resumen.saldo_actual}
                    precision={2}
                    prefix="$"
                    valueStyle={{ color: estadoCuenta.resumen.saldo_actual > 0 ? '#cf1322' : '#3f8600' }}
                  />
                </Card>
              </Col>
            </Row>

            {estadoCuenta.resumen.saldo_actual > 0 && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalPago(true)}
                block
              >
                Registrar Pago
              </Button>
            )}

            <Table
              dataSource={estadoCuenta.movimientos}
              columns={columnasMovimientos}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Space>
        )}
      </Modal>

      {/* Modal Registrar Pago */}
      <Modal
        title="Registrar Pago en Cuenta Corriente"
        open={modalPago}
        onOk={registrarPago}
        onCancel={() => {
          setModalPago(false);
          formPago.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form form={formPago} layout="vertical">
          <Form.Item
            label="Monto"
            name="monto"
            rules={[{ required: true, message: 'Ingresa el monto del pago' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0.01}
              precision={2}
              prefix="$"
            />
          </Form.Item>

          <Form.Item
            label="Método de Pago"
            name="metodo_pago"
            rules={[{ required: true, message: 'Selecciona el método de pago' }]}
          >
            <Select>
              <Option value="efectivo">Efectivo</Option>
              <Option value="transferencia">Transferencia Bancaria</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Comprobante (Opcional)" name="comprobante">
            <Input placeholder="Número de comprobante o referencia" />
          </Form.Item>

          <Form.Item label="Observaciones (Opcional)" name="observaciones">
            <TextArea rows={3} placeholder="Observaciones adicionales" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;













