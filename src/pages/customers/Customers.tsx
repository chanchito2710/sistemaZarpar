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
  Empty,
  Drawer,
  Alert,
  Descriptions,
  Popconfirm
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
  EyeOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  TagsOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined
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

// URL de la API - detecta automáticamente el entorno
const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
    ? '/api' 
    : 'http://localhost:3456/api');

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
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>(''); // ✅ Vacío inicialmente
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

  // Estados del Drawer de Análisis por Cliente
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [clienteAnalisis, setClienteAnalisis] = useState<Cliente | null>(null);
  const [tabDrawer, setTabDrawer] = useState('1');
  const [ventasGlobalesCliente, setVentasGlobalesCliente] = useState<any[]>([]);
  const [pagosCliente, setPagosCliente] = useState<any[]>([]);
  const [reemplazosCliente, setReemplazosCliente] = useState<any[]>([]);
  const [productosCliente, setProductosCliente] = useState<any[]>([]);
  const [saldoCuentaCorriente, setSaldoCuentaCorriente] = useState<number>(0);
  const [fechasFiltro, setFechasFiltro] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [loadingDrawer, setLoadingDrawer] = useState(false);
  const [buscadorClientes, setBuscadorClientes] = useState('');

  // Estados para edición de cliente
  const [modalEditarCliente, setModalEditarCliente] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null);
  const [formEditarCliente] = Form.useForm();

  // Cache para evitar recargar datos ya cargados
  const [tabsCargadas, setTabsCargadas] = useState<Set<string>>(new Set());

  /**
   * Cargar sucursales al iniciar
   */
  useEffect(() => {
    cargarSucursalesIniciales();
  }, []);

  /**
   * Auto-seleccionar sucursal según usuario
   * ✅ Se ejecuta apenas el usuario esté disponible
   */
  useEffect(() => {
    if (usuario && !sucursalSeleccionada) {
      if (usuario.esAdmin) {
        // Admin selecciona la primera sucursal disponible o 'pando' por defecto
        setSucursalSeleccionada(sucursales.length > 0 ? sucursales[0] : 'pando');
      } else if (usuario.sucursal) {
        // Usuario normal usa su sucursal
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
   * Abrir Drawer de Análisis del Cliente
   */
  const abrirAnalisisCliente = async (cliente: Cliente) => {
    setClienteAnalisis(cliente);
    setDrawerVisible(true);
    setTabDrawer('1');
    // Reiniciar cache cuando se abre un nuevo cliente
    setTabsCargadas(new Set());
    // Limpiar datos anteriores
    setVentasGlobalesCliente([]);
    setPagosCliente([]);
    setReemplazosCliente([]);
    setProductosCliente([]);
    setSaldoCuentaCorriente(0);
    // Solo cargar los datos de la primera pestaña (Ventas Globales)
    await cargarDatosTabActiva('1', cliente.id);
  };

  /**
   * Cargar datos solo de la pestaña activa (lazy loading con cache)
   */
  const cargarDatosTabActiva = async (tab: string, clienteId: number) => {
    console.log('🔍 [DEBUG cargarDatosTabActiva] Tab:', tab, 'Cliente ID:', clienteId);
    
    // Si ya cargamos esta pestaña, no volver a cargar
    if (tabsCargadas.has(tab)) {
      console.log('⚠️ [DEBUG] Tab ya cargada previamente, saltando...');
      return;
    }

    console.log('🔄 [DEBUG] Iniciando carga de tab, setLoadingDrawer(true)');
    setLoadingDrawer(true);
    try {
      switch (tab) {
        case '1': // Ventas Globales
          console.log('📊 [DEBUG] Cargando Ventas Globales...');
          await cargarVentasGlobalesCliente(clienteId);
          break;
        case '2': // Pagos
          console.log('💰 [DEBUG] Cargando Pagos...');
          await cargarPagosCliente(clienteId);
          break;
        case '3': // Reemplazos/Devoluciones
          console.log('🔄 [DEBUG] Cargando Reemplazos...');
          await cargarReemplazosCliente(clienteId);
          break;
        case '4': // Productos
          console.log('📦 [DEBUG] Cargando Productos...');
          await cargarProductosCliente(clienteId);
          console.log('💵 [DEBUG] Cargando Saldo Cuenta Corriente...');
          await cargarSaldoCuentaCorriente(clienteId);
          console.log('✅ [DEBUG] Productos y saldo cargados');
          break;
      }
      // Marcar esta pestaña como cargada
      console.log('✅ [DEBUG] Marcando tab como cargada');
      setTabsCargadas(prev => new Set(prev).add(tab));
    } catch (error) {
      console.error('❌ [DEBUG] Error al cargar datos del cliente:', error);
      message.error('Error al cargar datos del cliente');
    } finally {
      console.log('🏁 [DEBUG] Finally: setLoadingDrawer(false)');
      setLoadingDrawer(false);
    }
  };

  /**
   * Manejar cambio de pestaña en el drawer
   */
  const handleCambioTab = async (tab: string) => {
    setTabDrawer(tab);
    if (clienteAnalisis) {
      await cargarDatosTabActiva(tab, clienteAnalisis.id);
    }
  };

  /**
   * Cargar ventas globales del cliente
   */
  const cargarVentasGlobalesCliente = async (clienteId: number) => {
    try {
      console.log('🔍 [DEBUG Ventas Cliente] API_URL:', API_URL);
      const response = await fetch(
        `${API_URL}/ventas/cliente/${sucursalSeleccionada}/${clienteId}?fecha_desde=${fechasFiltro[0].format('YYYY-MM-DD')}&fecha_hasta=${fechasFiltro[1].format('YYYY-MM-DD')}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('🔍 [DEBUG] Ventas Response status:', response.status);
      const data = await response.json();
      setVentasGlobalesCliente(data.data || []);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    }
  };

  /**
   * Cargar pagos del cliente (contado + cuenta corriente)
   */
  const cargarPagosCliente = async (clienteId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/ventas/cliente/${sucursalSeleccionada}/${clienteId}/pagos?fecha_desde=${fechasFiltro[0].format('YYYY-MM-DD')}&fecha_hasta=${fechasFiltro[1].format('YYYY-MM-DD')}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      setPagosCliente(data.data || []);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
    }
  };

  /**
   * Cargar reemplazos y devoluciones del cliente
   */
  const cargarReemplazosCliente = async (clienteId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/devoluciones/cliente/${sucursalSeleccionada}/${clienteId}?fecha_desde=${fechasFiltro[0].format('YYYY-MM-DD')}&fecha_hasta=${fechasFiltro[1].format('YYYY-MM-DD')}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      setReemplazosCliente(data.data || []);
    } catch (error) {
      console.error('Error al cargar reemplazos:', error);
    }
  };

  /**
   * Cargar productos más vendidos al cliente
   */
  const cargarProductosCliente = async (clienteId: number) => {
    try {
      console.log('🔍 [DEBUG Productos Cliente] Iniciando carga de productos');
      console.log('🔍 [DEBUG] Hostname:', window.location.hostname);
      console.log('🔍 [DEBUG] API_URL:', API_URL);
      console.log('🔍 [DEBUG] Cliente ID:', clienteId);
      console.log('🔍 [DEBUG] Sucursal:', sucursalSeleccionada);
      
      const fullURL = `${API_URL}/ventas/cliente/${sucursalSeleccionada}/${clienteId}/productos?fecha_desde=${fechasFiltro[0].format('YYYY-MM-DD')}&fecha_hasta=${fechasFiltro[1].format('YYYY-MM-DD')}`;
      console.log('🔍 [DEBUG] Full URL:', fullURL);
      
      const response = await fetch(
        fullURL,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('🔍 [DEBUG] Response status:', response.status);
      console.log('🔍 [DEBUG] Response ok?', response.ok);
      const data = await response.json();
      console.log('🔍 [DEBUG] Data recibida:', data);
      console.log('🔍 [DEBUG] Productos array:', data.data);
      console.log('🔍 [DEBUG] Cantidad de productos:', data.data?.length || 0);
      
      setProductosCliente(data.data || []);
      console.log('✅ [DEBUG] Productos guardados en estado');
    } catch (error) {
      console.error('❌ [DEBUG] Error al cargar productos:', error);
      console.error('❌ [DEBUG] Error completo:', JSON.stringify(error, null, 2));
    }
  };

  /**
   * Cargar saldo de cuenta corriente del cliente
   */
  const cargarSaldoCuentaCorriente = async (clienteId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/cuenta-corriente/${sucursalSeleccionada}/cliente/${clienteId}/saldo`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      setSaldoCuentaCorriente(data.data?.saldo || 0);
    } catch (error) {
      console.error('Error al cargar saldo:', error);
    }
  };

  /**
   * Abrir modal de edición de cliente
   */
  const abrirModalEditarCliente = (cliente: Cliente) => {
    setClienteParaEditar(cliente);
    formEditarCliente.setFieldsValue({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      razon_social: cliente.razon_social,
      rut: cliente.rut,
      nombre_fantasia: cliente.nombre_fantasia
    });
    setModalEditarCliente(true);
  };

  /**
   * Actualizar datos del cliente
   */
  const handleActualizarCliente = async () => {
    try {
      const values = await formEditarCliente.validateFields();
      
      if (!clienteParaEditar) return;

      setLoading(true);

      await clientesService.actualizar(
        sucursalSeleccionada,
        clienteParaEditar.id,
        values
      );

      message.success('✅ Cliente actualizado exitosamente');
      
      // Recargar clientes
      await cargarClientes();
      
      // Cerrar modal
      setModalEditarCliente(false);
      formEditarCliente.resetFields();
      setClienteParaEditar(null);

    } catch (error: any) {
      console.error('Error al actualizar cliente:', error);
      message.error(error.message || 'Error al actualizar cliente');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar cliente permanentemente
   */
  const handleEliminarCliente = async (cliente: Cliente) => {
    try {
      setLoading(true);

      await clientesService.eliminar(sucursalSeleccionada, cliente.id);

      message.success(`🗑️ Cliente "${cliente.nombre} ${cliente.apellido}" eliminado permanentemente`);
      
      // Recargar clientes
      await cargarClientes();

    } catch (error: any) {
      console.error('Error al eliminar cliente:', error);
      message.error(error.message || 'Error al eliminar cliente');
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
            icon={<EditOutlined />}
            onClick={() => abrirModalEditarCliente(record)}
          />
          <Popconfirm
            title={
              <div style={{ maxWidth: 300 }}>
                <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
                  ⚠️ ¡ELIMINAR PERMANENTEMENTE!
                </div>
                <div>
                  ¿Estás seguro de eliminar a <strong>"{record.nombre} {record.apellido}"</strong>?
                </div>
              </div>
            }
            description={
              <Alert
                message="ADVERTENCIA: Esta acción es IRREVERSIBLE"
                description="El cliente será BORRADO PERMANENTEMENTE de la base de datos y NO SE PUEDE RECUPERAR. Todas sus ventas y datos asociados se mantendrán, pero el cliente será eliminado."
                type="error"
                showIcon
                style={{ marginTop: 12 }}
              />
            }
            onConfirm={() => handleEliminarCliente(record)}
            okText="🗑️ SÍ, ELIMINAR PERMANENTEMENTE"
            cancelText="❌ Cancelar"
            okButtonProps={{ 
              danger: true,
              size: 'large'
            }}
            cancelButtonProps={{
              size: 'large'
            }}
          >
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>
          <Button
            size="small"
            icon={<EyeOutlined />}
            type="primary"
            onClick={() => abrirAnalisisCliente(record)}
          >
            Ver Ventas
          </Button>
        </Space>
      )
    }
  ];

  // Filtrar clientes según búsqueda
  const clientesFiltrados = clientes.filter(cliente => {
    const textoBusqueda = buscadorClientes.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(textoBusqueda) ||
      cliente.apellido.toLowerCase().includes(textoBusqueda) ||
      (cliente.nombre_fantasia && cliente.nombre_fantasia.toLowerCase().includes(textoBusqueda)) ||
      (cliente.email && cliente.email.toLowerCase().includes(textoBusqueda)) ||
      (cliente.telefono && cliente.telefono.includes(textoBusqueda)) ||
      (cliente.rut && cliente.rut.includes(textoBusqueda))
    );
  });

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
                  <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                    <Title level={4}>Buscar Cliente</Title>
                    <Input
                      placeholder="Buscar por nombre, apellido, RUT, email o teléfono..."
                      prefix={<SearchOutlined />}
                      value={buscadorClientes}
                      onChange={(e) => setBuscadorClientes(e.target.value)}
                      size="large"
                      allowClear
                    />
                  </Space>
                  <Table
                    dataSource={clientesFiltrados}
                    columns={columnasClientes}
                    rowKey="id"
                    pagination={{ 
                      pageSize: 10,
                      showTotal: (total) => `Total: ${total} clientes`
                    }}
                  />
                </>
              )}
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

      {/* Drawer de Análisis Completo del Cliente */}
      <Drawer
        title={
          <Space>
            <UserOutlined style={{ color: '#1890ff' }} />
            <Text strong style={{ fontSize: 16 }}>
              Análisis Completo - {clienteAnalisis?.nombre} {clienteAnalisis?.apellido}
            </Text>
          </Space>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width="90%"
      >
        <Spin spinning={loadingDrawer}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Filtro de Fecha Global */}
            <Alert
              message="Filtro de Fecha Global"
              description={
                <Space>
                  <Text>Período:</Text>
                  <RangePicker
                    value={fechasFiltro}
                    onChange={(dates) => {
                      if (dates) {
                        setFechasFiltro(dates as [Dayjs, Dayjs]);
                      }
                    }}
                    format="DD/MM/YYYY"
                  />
                  <Button 
                    type="primary" 
                    icon={<CalendarOutlined />}
                    onClick={() => clienteAnalisis && cargarDatosDrawer(clienteAnalisis.id)}
                  >
                    Actualizar
                  </Button>
                </Space>
              }
              type="info"
              showIcon
            />

            {/* Tabs del Drawer */}
            <Tabs activeKey={tabDrawer} onChange={handleCambioTab}>
              {/* TAB 1: VENTAS GLOBALES */}
              <Tabs.TabPane
                tab={
                  <span>
                    <ShoppingOutlined />
                    Ventas Globales ({ventasGlobalesCliente.length})
                  </span>
                }
                key="1"
              >
                <Card>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                      <Statistic
                        title="Total Ventas"
                        value={ventasGlobalesCliente.length}
                        prefix={<ShoppingOutlined />}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Monto Total"
                        value={ventasGlobalesCliente.reduce((sum, v) => sum + Number(v.total || 0), 0)}
                        precision={2}
                        prefix="$"
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Promedio Venta"
                        value={ventasGlobalesCliente.length > 0 
                          ? ventasGlobalesCliente.reduce((sum, v) => sum + Number(v.total || 0), 0) / ventasGlobalesCliente.length 
                          : 0
                        }
                        precision={2}
                        prefix="$"
                      />
                    </Col>
                  </Row>

                  <Table
                    dataSource={ventasGlobalesCliente}
                    columns={[
                      {
                        title: 'N° Venta',
                        dataIndex: 'numero_venta',
                        key: 'numero_venta',
                        render: (numero: string) => <Text strong>{numero}</Text>
                      },
                      {
                        title: 'Fecha',
                        dataIndex: 'fecha_venta',
                        key: 'fecha_venta',
                        render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY HH:mm')
                      },
                      {
                        title: 'Método Pago',
                        dataIndex: 'metodo_pago',
                        key: 'metodo_pago',
                        render: (metodo: string) => {
                          const config: any = {
                            efectivo: { color: 'success', text: '💰 Efectivo' },
                            transferencia: { color: 'processing', text: '🏦 Transferencia' },
                            cuenta_corriente: { color: 'warning', text: '💳 Cuenta Corriente' }
                          };
                          return <Tag color={config[metodo]?.color}>{config[metodo]?.text || metodo}</Tag>;
                        }
                      },
                      {
                        title: 'Total',
                        dataIndex: 'total',
                        key: 'total',
                        render: (total: number) => <Text strong>${Number(total || 0).toFixed(2)}</Text>
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
                          return <Tag color={config[estado]?.color}>{config[estado]?.text || estado}</Tag>;
                        }
                      },
                      {
                        title: 'Acciones',
                        key: 'acciones',
                        render: (_: any, record: any) => (
                          <Button 
                            size="small" 
                            icon={<EyeOutlined />} 
                            onClick={() => verDetalleVenta(record.id)}
                          >
                            Ver
                          </Button>
                        )
                      }
                    ]}
                    rowKey="id"
                    pagination={{ pageSize: 10, showTotal: (total) => `Total: ${total} ventas` }}
                    size="small"
                  />
                </Card>
              </Tabs.TabPane>

              {/* TAB 2: PAGOS */}
              <Tabs.TabPane
                tab={
                  <span>
                    <CheckCircleOutlined />
                    Pagos ({pagosCliente.length})
                  </span>
                }
                key="2"
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {/* Saldo de Cuenta Corriente */}
                  {saldoCuentaCorriente > 0 && (
                    <Alert
                      message="Saldo de Cuenta Corriente"
                      description={
                        <Statistic
                          value={saldoCuentaCorriente}
                          precision={2}
                          prefix="$"
                          valueStyle={{ color: '#cf1322', fontSize: 24 }}
                          suffix="adeudado"
                        />
                      }
                      type="warning"
                      showIcon
                    />
                  )}

                  <Card title="Historial de Pagos">
                    <Table
                      dataSource={pagosCliente}
                      columns={[
                        {
                          title: 'Fecha',
                          dataIndex: 'fecha',
                          key: 'fecha',
                          render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY HH:mm')
                        },
                        {
                          title: 'Tipo',
                          dataIndex: 'tipo',
                          key: 'tipo',
                          render: (tipo: string) => {
                            const config: any = {
                              venta_contado: { color: 'green', text: '💰 Venta Contado' },
                              pago_cc: { color: 'blue', text: '💳 Pago C.C.' }
                            };
                            return <Tag color={config[tipo]?.color}>{config[tipo]?.text || tipo}</Tag>;
                          }
                        },
                        {
                          title: 'Monto',
                          dataIndex: 'monto',
                          key: 'monto',
                          render: (monto: number) => <Text strong>${Number(monto || 0).toFixed(2)}</Text>
                        },
                        {
                          title: 'Método',
                          dataIndex: 'metodo_pago',
                          key: 'metodo_pago',
                          render: (metodo: string) => metodo || '-'
                        },
                        {
                          title: 'Referencia',
                          dataIndex: 'referencia',
                          key: 'referencia'
                        }
                      ]}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                      size="small"
                      summary={(pageData) => {
                        const totalPagos = pageData.reduce((sum, record) => sum + Number(record.monto || 0), 0);
                        return (
                          <Table.Summary fixed>
                            <Table.Summary.Row>
                              <Table.Summary.Cell index={0} colSpan={2}>
                                <Text strong>Total Pagado:</Text>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={1}>
                                <Text strong style={{ color: '#3f8600' }}>${totalPagos.toFixed(2)}</Text>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={2} colSpan={2} />
                            </Table.Summary.Row>
                          </Table.Summary>
                        );
                      }}
                    />
                  </Card>
                </Space>
              </Tabs.TabPane>

              {/* TAB 3: REEMPLAZOS Y DEVOLUCIONES */}
              <Tabs.TabPane
                tab={
                  <span>
                    <SwapOutlined />
                    Reemplazos/Devoluciones ({reemplazosCliente.length})
                  </span>
                }
                key="3"
              >
                <Card>
                  <Table
                    dataSource={reemplazosCliente}
                    columns={[
                      {
                        title: 'Fecha',
                        dataIndex: 'fecha_proceso',
                        key: 'fecha_proceso',
                        render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY HH:mm')
                      },
                      {
                        title: 'Tipo',
                        dataIndex: 'tipo',
                        key: 'tipo',
                        render: (tipo: string) => {
                          const config: any = {
                            reemplazo: { color: 'blue', text: '🔄 Reemplazo' },
                            devolucion: { color: 'orange', text: '↩️ Devolución' }
                          };
                          return <Tag color={config[tipo]?.color}>{config[tipo]?.text || tipo}</Tag>;
                        }
                      },
                      {
                        title: 'Producto',
                        dataIndex: 'producto_nombre',
                        key: 'producto_nombre'
                      },
                      {
                        title: 'N° Venta',
                        dataIndex: 'numero_venta',
                        key: 'numero_venta',
                        render: (numero: string) => <Text code>{numero}</Text>
                      },
                      {
                        title: 'Cantidad',
                        dataIndex: 'cantidad_reemplazada',
                        key: 'cantidad_reemplazada',
                        align: 'center',
                        render: (cant: number) => <Badge count={cant || 1} showZero />
                      },
                      {
                        title: 'Método Devolución',
                        dataIndex: 'metodo_devolucion',
                        key: 'metodo_devolucion',
                        render: (metodo: string) => metodo ? (
                          metodo === 'cuenta_corriente' ? 
                            <Tag color="purple">💳 A Cuenta Corriente</Tag> : 
                            <Tag color="green">💰 Efectivo</Tag>
                        ) : '-'
                      },
                      {
                        title: 'Observaciones',
                        dataIndex: 'observaciones',
                        key: 'observaciones',
                        render: (obs: string) => obs || '-'
                      }
                    ]}
                    rowKey="id"
                    pagination={{ pageSize: 10, showTotal: (total) => `Total: ${total} registros` }}
                    size="small"
                  />
                </Card>
              </Tabs.TabPane>

              {/* TAB 4: PRODUCTOS MÁS VENDIDOS */}
              <Tabs.TabPane
                tab={
                  <span>
                    <TagsOutlined />
                    Productos ({productosCliente.length})
                  </span>
                }
                key="4"
              >
                <Card title="Productos Más Vendidos">
                  <Table
                    dataSource={productosCliente}
                    columns={[
                      {
                        title: '#',
                        key: 'index',
                        render: (_: any, __: any, index: number) => (
                          <Badge 
                            count={index + 1} 
                            style={{ 
                              backgroundColor: index < 3 ? '#faad14' : '#d9d9d9',
                              fontWeight: 'bold'
                            }} 
                          />
                        ),
                        width: 60
                      },
                      {
                        title: 'Producto',
                        dataIndex: 'producto_nombre',
                        key: 'producto_nombre',
                        render: (nombre: string, record: any) => (
                          <div>
                            <Text strong>{nombre}</Text>
                            <div>
                              <Space size="small">
                                {record.tipo && <Tag color="blue">{record.tipo}</Tag>}
                                {record.marca && <Tag color="green">{record.marca}</Tag>}
                              </Space>
                            </div>
                          </div>
                        )
                      },
                      {
                        title: 'Cantidad Vendida',
                        dataIndex: 'cantidad_vendida',
                        key: 'cantidad_vendida',
                        align: 'center',
                        render: (cant: number) => <Badge count={cant} showZero style={{ backgroundColor: '#52c41a' }} />
                      },
                      {
                        title: 'Total Vendido',
                        dataIndex: 'total_vendido',
                        key: 'total_vendido',
                        render: (total: number) => <Text strong>${Number(total || 0).toFixed(2)}</Text>
                      },
                      {
                        title: 'Precio Promedio',
                        key: 'precio_promedio',
                        render: (_: any, record: any) => {
                          const promedio = record.cantidad_vendida > 0 
                            ? Number(record.total_vendido) / Number(record.cantidad_vendida)
                            : 0;
                          return <Text>${promedio.toFixed(2)}</Text>;
                        }
                      }
                    ]}
                    rowKey={(record) => `${record.producto_id}_${record.producto_nombre}`}
                    pagination={{ 
                      pageSize: 20, 
                      showTotal: (total) => `Total: ${total} productos` 
                    }}
                    size="small"
                  />
                </Card>
              </Tabs.TabPane>
            </Tabs>
          </Space>
        </Spin>
      </Drawer>

      {/* MODAL DE EDICIÓN DE CLIENTE */}
      <Modal
        title="✏️ Editar Cliente"
        open={modalEditarCliente}
        onCancel={() => {
          setModalEditarCliente(false);
          formEditarCliente.resetFields();
          setClienteParaEditar(null);
        }}
        onOk={handleActualizarCliente}
        okText="💾 Guardar Cambios"
        cancelText="❌ Cancelar"
        width={600}
        confirmLoading={loading}
      >
        <Form
          form={formEditarCliente}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nombre"
                label="Nombre"
                rules={[{ required: true, message: 'El nombre es obligatorio' }]}
              >
                <Input placeholder="Nombre del cliente" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="apellido"
                label="Apellido"
                rules={[{ required: true, message: 'El apellido es obligatorio' }]}
              >
                <Input placeholder="Apellido del cliente" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'El email es obligatorio' },
              { type: 'email', message: 'Ingresa un email válido' }
            ]}
          >
            <Input placeholder="cliente@ejemplo.com" />
          </Form.Item>

          <Form.Item
            name="telefono"
            label="Teléfono"
            rules={[{ required: true, message: 'El teléfono es obligatorio' }]}
          >
            <Input placeholder="099 123 456" />
          </Form.Item>

          <Form.Item
            name="direccion"
            label="Dirección"
          >
            <Input placeholder="Calle y número" />
          </Form.Item>

          <Form.Item
            name="razon_social"
            label="Razón Social (Opcional)"
          >
            <Input placeholder="Razón social de la empresa" />
          </Form.Item>

          <Form.Item
            name="rut"
            label="RUT (Opcional)"
          >
            <Input placeholder="12-345678-9" />
          </Form.Item>

          <Form.Item
            name="nombre_fantasia"
            label="Nombre de Fantasía (Opcional)"
          >
            <Input placeholder="Nombre comercial" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;













