/**
 * Página de Ventas Globales - Reportes y Análisis Completo
 * Vista detallada de ventas individuales con gráficas y estadísticas
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Row,
  Col,
  DatePicker,
  Select,
  Tag,
  message,
  Statistic,
  Typography,
  Empty,
  Tooltip,
  Progress,
  Badge,
  Modal,
  Descriptions,
  Divider,
  Tabs,
} from 'antd';
import {
  ReloadOutlined,
  CalendarOutlined,
  ShopOutlined,
  DollarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  CrownOutlined,
  FireOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  CreditCardOutlined,
  EyeOutlined,
  UserOutlined,
  TagsOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  BankOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { ventasService, vendedoresService } from '../services/api';
import './GlobalSales.css';

// URL de la API - detecta automáticamente el entorno
const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
    ? '/api' 
    : 'http://localhost:3456/api');

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

/**
 * Interfaces
 */
interface VentaDetallada {
  id: number;
  numero_venta: string;
  fecha_venta: string;
  sucursal: string;
  total: number;
  metodo_pago: string;
  estado_pago: string;
  cliente_id: number;
  cliente_nombre: string;
  vendedor_id: number;
  vendedor_nombre: string;
  observaciones: string;
  cantidad_productos: number;
  tipos_productos: string;
}

interface SucursalStats {
  sucursal: string;
  total_ventas: number;
  total_ingresos: number;
  porcentaje: number;
}

/**
 * Función para formatear dinero sin decimales y sin ceros al inicio
 * Maneja valores inválidos y los convierte a 0
 */
const formatearDinero = (valor: number | string | null | undefined): string => {
  const numero = Number(valor);
  if (isNaN(numero) || numero === null || numero === undefined) {
    return '$0';
  }
  return `$${Math.round(numero).toLocaleString('es-UY')}`;
};

/**
 * Componente Principal
 */
const GlobalSales: React.FC = () => {
  // Estados para filtros
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(null);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('todas');

  // Estados de datos
  const [ventas, setVentas] = useState<VentaDetallada[]>([]);
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  // Modal de detalle
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaDetallada | null>(null);
  const [detalleVenta, setDetalleVenta] = useState<any>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  
  // Modal de productos vendidos (nuevo modal separado)
  const [modalProductosVisible, setModalProductosVisible] = useState(false);
  
  // Modal de métodos de pago
  const [modalMetodosPagoVisible, setModalMetodosPagoVisible] = useState(false);
  const [gastos, setGastos] = useState<any[]>([]);
  const [envios, setEnvios] = useState<any[]>([]);
  const [comisiones, setComisiones] = useState<any[]>([]);
  const [loadingGastos, setLoadingGastos] = useState(false);
  const [loadingEnvios, setLoadingEnvios] = useState(false);
  const [loadingComisiones, setLoadingComisiones] = useState(false);
  
  // Filtros de fecha específicos para cada tab del modal
  const [fechaGastosDesde, setFechaGastosDesde] = useState<Dayjs | null>(fechaDesde);
  const [fechaGastosHasta, setFechaGastosHasta] = useState<Dayjs | null>(fechaHasta);
  const [conceptoGastos, setConceptoGastos] = useState<string>('todos');
  const [fechaEnviosDesde, setFechaEnviosDesde] = useState<Dayjs | null>(fechaDesde);
  const [fechaEnviosHasta, setFechaEnviosHasta] = useState<Dayjs | null>(fechaHasta);
  const [fechaComisionesDesde, setFechaComisionesDesde] = useState<Dayjs | null>(fechaDesde);
  const [fechaComisionesHasta, setFechaComisionesHasta] = useState<Dayjs | null>(fechaHasta);
  
  // Filtros de fecha para tabs de métodos de pago
  const [fechaEfectivoDesde, setFechaEfectivoDesde] = useState<Dayjs | null>(fechaDesde);
  const [fechaEfectivoHasta, setFechaEfectivoHasta] = useState<Dayjs | null>(fechaHasta);
  const [fechaTransferenciaDesde, setFechaTransferenciaDesde] = useState<Dayjs | null>(fechaDesde);
  const [fechaTransferenciaHasta, setFechaTransferenciaHasta] = useState<Dayjs | null>(fechaHasta);
  const [fechaCuentaCorrienteDesde, setFechaCuentaCorrienteDesde] = useState<Dayjs | null>(fechaDesde);
  const [fechaCuentaCorrienteHasta, setFechaCuentaCorrienteHasta] = useState<Dayjs | null>(fechaHasta);
  
  // Ventas filtradas por método de pago y fecha
  const [ventasEfectivo, setVentasEfectivo] = useState<VentaDetallada[]>([]);
  const [ventasTransferencia, setVentasTransferencia] = useState<VentaDetallada[]>([]);
  const [ventasCuentaCorriente, setVentasCuentaCorriente] = useState<VentaDetallada[]>([]);

  /**
   * Cargar sucursales al montar
   */
  useEffect(() => {
    cargarSucursales();
  }, []);

  /**
   * Cargar ventas al montar
   */
  useEffect(() => {
    cargarVentas();
  }, []);

  /**
   * Cargar sucursales desde la API
   */
  const cargarSucursales = async () => {
    setLoadingSucursales(true);
    try {
      const sucursalesData = await vendedoresService.obtenerSucursales();
      setSucursales(sucursalesData);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      message.error('Error al cargar sucursales');
    } finally {
      setLoadingSucursales(false);
    }
  };

  /**
   * Cargar gastos filtrados por sucursal y fecha
   */
  const cargarGastos = async (usarFiltrosEspecificos = false) => {
    setLoadingGastos(true);
    try {
      const token = localStorage.getItem('token');
      
      // Construir URL con parámetros
      let url = `${API_URL}/caja/movimientos/historial?tipo_movimiento=gasto`;
      
      if (sucursalSeleccionada && sucursalSeleccionada !== 'todas') {
        url += `&sucursal=${sucursalSeleccionada.toLowerCase()}`;
      }
      
      // Usar filtros específicos del tab o los globales
      const desde = usarFiltrosEspecificos ? fechaGastosDesde : fechaDesde;
      const hasta = usarFiltrosEspecificos ? fechaGastosHasta : fechaHasta;
      
      if (desde) {
        url += `&fecha_desde=${desde.format('YYYY-MM-DD')}`;
      }
      
      if (hasta) {
        url += `&fecha_hasta=${hasta.format('YYYY-MM-DD')}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        let gastosFiltrados = data.data || [];
        
        // Filtrar por concepto si está seleccionado
        if (usarFiltrosEspecificos && conceptoGastos && conceptoGastos !== 'todos') {
          gastosFiltrados = gastosFiltrados.filter((g: any) => 
            g.concepto && g.concepto.toLowerCase().includes(conceptoGastos.toLowerCase())
          );
        }
        
        setGastos(gastosFiltrados);
      }
    } catch (error) {
      console.error('Error al cargar gastos:', error);
      message.error('Error al cargar gastos');
    } finally {
      setLoadingGastos(false);
    }
  };
  
  /**
   * Cargar envíos de dinero filtrados por sucursal y fecha
   */
  const cargarEnvios = async (usarFiltrosEspecificos = false) => {
    setLoadingEnvios(true);
    try {
      const token = localStorage.getItem('token');
      const filtros: any = {
        tipo_movimiento: 'envio'
      };
      
      if (sucursalSeleccionada && sucursalSeleccionada !== 'todas') {
        filtros.sucursal = sucursalSeleccionada;
      }
      
      // Usar filtros específicos del tab o los globales
      const desde = usarFiltrosEspecificos ? fechaEnviosDesde : fechaDesde;
      const hasta = usarFiltrosEspecificos ? fechaEnviosHasta : fechaHasta;
      
      if (desde) {
        filtros.fecha_desde = desde.format('YYYY-MM-DD');
      }
      
      if (hasta) {
        filtros.fecha_hasta = hasta.format('YYYY-MM-DD');
      }
      
      const response = await fetch(
        `${API_URL}/caja/movimientos/historial?${new URLSearchParams(filtros)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setEnvios(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar envíos:', error);
      message.error('Error al cargar envíos de dinero');
    } finally {
      setLoadingEnvios(false);
    }
  };
  
  /**
   * Cargar comisiones filtradas por sucursal y fecha
   */
  const cargarComisiones = async (usarFiltrosEspecificos = false) => {
    setLoadingComisiones(true);
    try {
      const token = localStorage.getItem('token');
      const filtros: any = {};
      
      // Usar filtros específicos del tab o los globales
      const desde = usarFiltrosEspecificos ? fechaComisionesDesde : fechaDesde;
      const hasta = usarFiltrosEspecificos ? fechaComisionesHasta : fechaHasta;
      
      if (desde) {
        filtros.fecha_desde = desde.format('YYYY-MM-DD');
      }
      
      if (hasta) {
        filtros.fecha_hasta = hasta.format('YYYY-MM-DD');
      }
      
      const response = await fetch(
        `${API_URL}/sueldos?${new URLSearchParams(filtros)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      
      if (data.success) {
        let comisionesFiltradas = data.data || [];
        
        // Filtrar por sucursal si está seleccionada
        if (sucursalSeleccionada && sucursalSeleccionada !== 'todas') {
          comisionesFiltradas = comisionesFiltradas.filter(
            (c: any) => c.sucursal.toLowerCase() === sucursalSeleccionada.toLowerCase()
          );
        }
        
        setComisiones(comisionesFiltradas);
      }
    } catch (error) {
      console.error('Error al cargar comisiones:', error);
      message.error('Error al cargar comisiones');
    } finally {
      setLoadingComisiones(false);
    }
  };

  /**
   * Cargar ventas detalladas con filtros
   */
  const cargarVentas = async () => {
    setLoading(true);
    try {
      const filtros: any = {};

      if (sucursalSeleccionada && sucursalSeleccionada !== 'todas') {
        filtros.sucursal = sucursalSeleccionada;
      }

      if (fechaDesde) {
        filtros.fecha_desde = fechaDesde.format('YYYY-MM-DD');
      }

      if (fechaHasta) {
        filtros.fecha_hasta = fechaHasta.format('YYYY-MM-DD');
      }

      console.log('📊 Cargando ventas con filtros:', filtros);
      const ventasData = await ventasService.obtenerVentasDetalladas(filtros);
      console.log('✅ Ventas recibidas del backend:', ventasData.length, 'ventas');
      
      // Log de sucursales encontradas
      const sucursalesEncontradas = [...new Set(ventasData.map((v: any) => v.sucursal))];
      console.log('🏢 Sucursales con ventas:', sucursalesEncontradas);
      
      // Asegurar que todos los valores numéricos sean números válidos
      const ventasNormalizadas = ventasData.map((venta: any) => ({
        ...venta,
        total: Number(venta.total) || 0,
        cantidad_productos: Number(venta.cantidad_productos) || 0,
        cliente_id: Number(venta.cliente_id) || 0,
        vendedor_id: Number(venta.vendedor_id) || 0,
        id: Number(venta.id) || 0,
      }));
      
      setVentas(ventasNormalizadas);

      if (ventasNormalizadas.length === 0) {
        message.info('No se encontraron ventas con los filtros aplicados');
      } else {
        console.log('✅ Ventas cargadas exitosamente:', ventasNormalizadas.length);
      }
    } catch (error) {
      console.error('❌ Error al cargar ventas:', error);
      message.error('Error al cargar el historial de ventas');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtrar ventas por método de pago y rango de fechas específico
   */
  const filtrarVentasPorMetodo = (
    metodo: string,
    usarFiltrosEspecificos: boolean,
    fechaDesdeEspecifica: Dayjs | null,
    fechaHastaEspecifica: Dayjs | null
  ): VentaDetallada[] => {
    let ventasFiltradas = ventas.filter(v => v.metodo_pago === metodo);
    
    if (usarFiltrosEspecificos) {
      if (fechaDesdeEspecifica) {
        ventasFiltradas = ventasFiltradas.filter(v => {
          const fechaVenta = dayjs(v.fecha_venta);
          return fechaVenta.isAfter(fechaDesdeEspecifica, 'day') || fechaVenta.isSame(fechaDesdeEspecifica, 'day');
        });
      }
      
      if (fechaHastaEspecifica) {
        ventasFiltradas = ventasFiltradas.filter(v => {
          const fechaVenta = dayjs(v.fecha_venta);
          return fechaVenta.isBefore(fechaHastaEspecifica, 'day') || fechaVenta.isSame(fechaHastaEspecifica, 'day');
        });
      }
    }
    
    return ventasFiltradas;
  };

  /**
   * Aplicar filtros de efectivo
   */
  const aplicarFiltrosEfectivo = (usarFiltrosEspecificos = false) => {
    const ventasFiltradas = filtrarVentasPorMetodo(
      'efectivo',
      usarFiltrosEspecificos,
      fechaEfectivoDesde,
      fechaEfectivoHasta
    );
    setVentasEfectivo(ventasFiltradas);
  };

  /**
   * Aplicar filtros de transferencia
   */
  const aplicarFiltrosTransferencia = (usarFiltrosEspecificos = false) => {
    const ventasFiltradas = filtrarVentasPorMetodo(
      'transferencia',
      usarFiltrosEspecificos,
      fechaTransferenciaDesde,
      fechaTransferenciaHasta
    );
    setVentasTransferencia(ventasFiltradas);
  };

  /**
   * Aplicar filtros de cuenta corriente
   */
  const aplicarFiltrosCuentaCorriente = (usarFiltrosEspecificos = false) => {
    const ventasFiltradas = filtrarVentasPorMetodo(
      'cuenta_corriente',
      usarFiltrosEspecificos,
      fechaCuentaCorrienteDesde,
      fechaCuentaCorrienteHasta
    );
    setVentasCuentaCorriente(ventasFiltradas);
  };

  /**
   * Inicializar filtros de métodos de pago cuando se cargan las ventas
   */
  useEffect(() => {
    if (ventas.length > 0) {
      setVentasEfectivo(ventas.filter(v => v.metodo_pago === 'efectivo'));
      setVentasTransferencia(ventas.filter(v => v.metodo_pago === 'transferencia'));
      setVentasCuentaCorriente(ventas.filter(v => v.metodo_pago === 'cuenta_corriente'));
    }
  }, [ventas]);

  /**
   * Manejar cambio de rango de fechas
   */
  const handleRangeFechasChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      setFechaDesde(dates[0]);
      setFechaHasta(dates[1]);
    } else {
      setFechaDesde(null);
      setFechaHasta(null);
    }
  };

  /**
   * Abrir modal de detalle de venta
   */
  const handleVerDetalle = async (venta: VentaDetallada) => {
    console.log('🔍 Abriendo detalle de venta:', venta);
    setVentaSeleccionada(venta);
    setModalDetalleVisible(true);
    setLoadingDetalle(true);
    setDetalleVenta(null); // Reset anterior

    try {
      console.log('📡 Solicitando detalle de venta ID:', venta.id);
      const detalle = await ventasService.obtenerDetalle(venta.id);
      console.log('✅ Detalle recibido:', detalle);
      console.log('📦 Productos en detalle:', detalle.productos);
      setDetalleVenta(detalle);
      
      if (!detalle.productos || detalle.productos.length === 0) {
        message.warning('Esta venta no tiene productos registrados');
      }
    } catch (error) {
      console.error('❌ Error al cargar detalle de venta:', error);
      message.error('Error al cargar el detalle de la venta');
    } finally {
      setLoadingDetalle(false);
    }
  };

  /**
   * Calcular estadísticas por sucursal
   */
  const calcularEstadisticasPorSucursal = (): SucursalStats[] => {
    const sucursalMap = new Map<string, { ventas: number; ingresos: number }>();

    ventas.forEach((venta) => {
      if (!venta.sucursal) return; // Saltar si no hay sucursal
      
      const current = sucursalMap.get(venta.sucursal) || { ventas: 0, ingresos: 0 };
      const totalVenta = Number(venta.total) || 0;
      
      sucursalMap.set(venta.sucursal, {
        ventas: current.ventas + 1,
        ingresos: current.ingresos + totalVenta,
      });
    });

    const totalIngresos = Array.from(sucursalMap.values()).reduce((sum, s) => {
      const ingresos = Number(s.ingresos) || 0;
      return sum + ingresos;
    }, 0);

    return Array.from(sucursalMap.entries())
      .map(([sucursal, data]) => ({
        sucursal,
        total_ventas: data.ventas,
        total_ingresos: data.ingresos,
        porcentaje: totalIngresos > 0 ? (data.ingresos / totalIngresos) * 100 : 0,
      }))
      .sort((a, b) => b.total_ingresos - a.total_ingresos);
  };

  /**
   * Calcular totales generales
   */
  const totalVentasGlobal = ventas.length;
  const totalIngresosGlobal = ventas.reduce((sum, v) => {
    const total = Number(v.total) || 0;
    return sum + total;
  }, 0);
  const promedioVenta = totalVentasGlobal > 0 ? totalIngresosGlobal / totalVentasGlobal : 0;
  const sucursalesStats = calcularEstadisticasPorSucursal();
  const sucursalTop = sucursalesStats.length > 0 ? sucursalesStats[0] : null;

  /**
   * Calcular método de pago más usado
   */
  const metodosPagoMap = new Map<string, number>();
  ventas.forEach((venta) => {
    if (!venta.metodo_pago) return;
    const current = metodosPagoMap.get(venta.metodo_pago) || 0;
    const totalVenta = Number(venta.total) || 0;
    metodosPagoMap.set(venta.metodo_pago, current + totalVenta);
  });
  const metodoPagoTop = Array.from(metodosPagoMap.entries()).sort((a, b) => b[1] - a[1])[0];

  /**
   * Calcular ventas pagadas vs pendientes
   */
  const ventasPagadas = ventas.filter(v => v.estado_pago === 'pagado').length;
  const ventasPendientes = ventas.filter(v => v.estado_pago === 'pendiente').length;
  const porcentajePagadas = totalVentasGlobal > 0 && !isNaN(totalVentasGlobal) && !isNaN(ventasPagadas) 
    ? (ventasPagadas / totalVentasGlobal) * 100 
    : 0;

  /**
   * Columnas de la tabla
   */
  const columns: ColumnsType<VentaDetallada> = [
    {
      title: 'N° Venta',
      dataIndex: 'numero_venta',
      key: 'numero_venta',
      width: 140,
      render: (numero: string) => (
        <Text strong style={{ fontSize: 11, fontFamily: 'monospace' }}>
          {numero}
        </Text>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any,
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_venta',
      key: 'fecha_venta',
      width: 100,
      render: (fecha: string) => (
        <Text style={{ fontSize: 11 }}>
          {dayjs(fecha).format('DD/MM/YYYY')}
        </Text>
      ),
      sorter: (a, b) => dayjs(a.fecha_venta).unix() - dayjs(b.fecha_venta).unix(),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any,
    },
    {
      title: 'Hora',
      dataIndex: 'fecha_venta',
      key: 'hora',
      width: 70,
      render: (fecha: string) => (
        <Text style={{ fontSize: 11, color: '#8c8c8c' }}>
          {dayjs(fecha).format('HH:mm')}
        </Text>
      ),
      responsive: ['md', 'lg', 'xl'] as any,
    },
    {
      title: 'Sucursal',
      dataIndex: 'sucursal',
      key: 'sucursal',
      width: 100,
      render: (sucursal: string) => (
        <Tag color="blue" style={{ fontSize: 10 }}>
          {sucursal.toUpperCase()}
        </Tag>
      ),
      responsive: ['sm', 'md', 'lg', 'xl'] as any,
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente_nombre',
      key: 'cliente_nombre',
      width: 140,
      ellipsis: true,
      render: (nombre: string) => (
        <Tooltip title={nombre}>
          <Text style={{ fontSize: 11 }}>
            <UserOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            {nombre}
          </Text>
        </Tooltip>
      ),
      responsive: ['md', 'lg', 'xl'] as any,
    },
    {
      title: 'Vendedor',
      dataIndex: 'vendedor_nombre',
      key: 'vendedor_nombre',
      width: 120,
      ellipsis: true,
      render: (nombre: string) => (
        <Tooltip title={nombre}>
          <Text style={{ fontSize: 11, color: '#52c41a' }}>
            {nombre}
          </Text>
        </Tooltip>
      ),
      responsive: ['lg', 'xl'] as any,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 100,
      align: 'right',
      render: (total: number) => (
        <Text strong style={{ color: '#52c41a', fontSize: 13 }}>
          {formatearDinero(total)}
        </Text>
      ),
      sorter: (a, b) => a.total - b.total,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any,
    },
    {
      title: 'Método',
      dataIndex: 'metodo_pago',
      key: 'metodo_pago',
      width: 110,
      render: (metodo: string) => {
        const colores: Record<string, string> = {
          efectivo: 'green',
          transferencia: 'blue',
          cuenta_corriente: 'orange',
        };
        return (
          <Tag color={colores[metodo] || 'default'} style={{ fontSize: 10 }}>
            {metodo.replace('_', ' ').toUpperCase()}
          </Tag>
        );
      },
      responsive: ['md', 'lg', 'xl'] as any,
    },
    {
      title: 'Estado',
      dataIndex: 'estado_pago',
      key: 'estado_pago',
      width: 90,
      render: (estado: string) => (
        <Tag
          icon={estado === 'pagado' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          color={estado === 'pagado' ? 'success' : 'warning'}
          style={{ fontSize: 10 }}
        >
          {estado.toUpperCase()}
        </Tag>
      ),
      responsive: ['lg', 'xl'] as any,
    },
    {
      title: 'Productos',
      dataIndex: 'cantidad_productos',
      key: 'cantidad_productos',
      width: 80,
      align: 'center',
      render: (cantidad: number) => (
        <Badge count={cantidad} showZero style={{ backgroundColor: '#52c41a' }} />
      ),
      responsive: ['sm', 'md', 'lg', 'xl'] as any,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_: any, record: VentaDetallada) => (
        <Tooltip title="Ver detalle completo">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleVerDetalle(record)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          />
        </Tooltip>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any,
    },
  ];

  return (
    <div className="global-sales-container">
      {/* Header con gradiente */}
      <div className="global-sales-header">
        <div>
          <Title level={2} style={{ margin: 0, color: 'white' }}>
            <BarChartOutlined /> Reporte de Ventas Globales
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
            Análisis detallado de todas las ventas con gráficas y comparación entre sucursales
          </Text>
        </div>
      </div>

      {/* Filtros Compactos */}
      <Card className="filters-card" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <Text strong style={{ fontSize: 11 }}>
                <CalendarOutlined /> Rango de Fechas
              </Text>
              <RangePicker
                value={[fechaDesde, fechaHasta]}
                onChange={handleRangeFechasChange}
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                size="middle"
                placeholder={['Desde', 'Hasta']}
              />
            </Space>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <Text strong style={{ fontSize: 11 }}>
                <ShopOutlined /> Sucursal
              </Text>
              <Select
                value={sucursalSeleccionada}
                onChange={setSucursalSeleccionada}
                style={{ width: '100%' }}
                size="middle"
                loading={loadingSucursales}
              >
                <Option value="todas">📊 Todas las Sucursales</Option>
                {sucursales.map((sucursal) => (
                  <Option key={sucursal} value={sucursal}>
                    {sucursal.toUpperCase()}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <div style={{ paddingTop: 18 }}>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={cargarVentas}
                loading={loading}
                block
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  height: 36,
                  fontWeight: 600,
                }}
              >
                Buscar
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Estadísticas Principales - Destacadas */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card className="stat-card stat-card-sales">
            <Statistic
              title={<span style={{ fontSize: 11 }}>Total Ventas</span>}
              value={totalVentasGlobal || 0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: 24, fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="stat-card stat-card-revenue">
            <div style={{ padding: '8px 0' }}>
              <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>Ingresos Totales</div>
              <div style={{ color: '#52c41a', fontSize: 20, fontWeight: 700 }}>
                {formatearDinero(totalIngresosGlobal)}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="stat-card stat-card-average">
            <div style={{ padding: '8px 0' }}>
              <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>Promedio por Venta</div>
              <div style={{ color: '#722ed1', fontSize: 20, fontWeight: 700 }}>
                {formatearDinero(promedioVenta)}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="stat-card stat-card-paid">
            <div style={{ padding: '8px 0' }}>
              <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>Ventas Pagadas</div>
              <div style={{ color: '#52c41a', fontSize: 20, fontWeight: 700 }}>
                {(porcentajePagadas || 0).toFixed(0)}%
                <Text style={{ fontSize: 12, marginLeft: 8, color: '#8c8c8c', fontWeight: 400 }}>
                  ({ventasPagadas || 0}/{totalVentasGlobal || 0})
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Gráficas Visuales */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {/* Sucursal Líder */}
        {sucursalTop && (
          <Col xs={24} md={12}>
            <Card className="highlight-card highlight-card-top">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 8 }}>
                    <CrownOutlined style={{ fontSize: 20, color: '#faad14', marginRight: 8 }} />
                    <Text strong style={{ fontSize: 12 }}>Sucursal Líder</Text>
                  </div>
                  <Title level={3} style={{ margin: 0, color: '#faad14' }}>
                    {sucursalTop.sucursal.toUpperCase()}
                  </Title>
                  <Text style={{ fontSize: 13 }}>
                    {formatearDinero(sucursalTop.total_ingresos)}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="gold">{sucursalTop.total_ventas || 0} ventas</Tag>
                    <Tag color="gold">{(sucursalTop.porcentaje || 0).toFixed(1)}% del total</Tag>
                  </div>
                </div>
                <TrophyOutlined style={{ fontSize: 48, color: '#faad14', opacity: 0.3 }} />
              </div>
            </Card>
          </Col>
        )}

        {/* Botón de Métodos de Pago */}
        <Col xs={24} md={12}>
          <Button
            size="large"
            block
            onClick={() => {
              setModalMetodosPagoVisible(true);
              cargarGastos();
              cargarEnvios();
              cargarComisiones();
            }}
            style={{
              height: '100%',
              minHeight: 120,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              fontSize: 16,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 8,
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
          >
            <CreditCardOutlined style={{ fontSize: 32 }} />
            <span>Desglose Detallado</span>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
              Ver detalles por método
            </Text>
          </Button>
        </Col>
      </Row>

      {/* Ranking de Sucursales con Gráfica de Barras */}
      {sucursalesStats.length > 0 && (
        <Card
          title={
            <span>
              <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
              <Text strong>Comparación por Sucursales</Text>
            </span>
          }
          style={{ marginBottom: 16 }}
          className="ranking-card"
        >
          <Row gutter={[12, 12]}>
            {sucursalesStats.map((sucursal, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={sucursal.sucursal}>
                <div className="sucursal-rank-item">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Badge
                        count={index + 1}
                        style={{
                          backgroundColor: index === 0 ? '#faad14' : index === 1 ? '#bfbfbf' : '#d48806',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      />
                      <Text strong style={{ marginLeft: 12, fontSize: 13 }}>
                        {sucursal.sucursal.toUpperCase()}
                      </Text>
                    </div>
                    {index === 0 && <RiseOutlined style={{ color: '#52c41a', fontSize: 16 }} />}
                  </div>
                  
                  {/* Título del porcentaje */}
                  <div style={{ marginTop: 8, marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, color: '#8c8c8c', fontWeight: 500 }}>
                      Porcentaje en Venta Global
                    </Text>
                  </div>
                  
                  <Progress
                    percent={sucursal.porcentaje || 0}
                    strokeColor={{
                      '0%': index === 0 ? '#faad14' : '#1890ff',
                      '100%': index === 0 ? '#fa541c' : '#096dd9',
                    }}
                    size="small"
                    format={(percent) => `${(percent || 0).toFixed(0)}%`}
                  />
                  <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 11, color: '#8c8c8c' }}>
                      {sucursal.total_ventas} ventas
                    </Text>
                    <Text strong style={{ fontSize: 12, color: '#52c41a' }}>
                      {formatearDinero(sucursal.total_ingresos)}
                    </Text>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Tabla de Ventas Detalladas */}
      <Card
        title={
          <span>
            <LineChartOutlined style={{ marginRight: 8 }} />
            Historial Detallado de Ventas ({ventas.length} ventas)
          </span>
        }
        className="table-card"
      >
        {!loading && ventas.length === 0 ? (
          <Empty description="No hay ventas registradas" />
        ) : (
          <Table
            columns={columns}
            dataSource={ventas}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total}`,
              pageSizeOptions: ['10', '20', '50', '100'],
              simple: window.innerWidth < 768,
            }}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>

      {/* Modal de Detalle de Venta */}
      <Modal
        title={
          <span>
            <EyeOutlined style={{ marginRight: 8 }} />
            Detalle Completo de Venta
          </span>
        }
        open={modalDetalleVisible}
        onCancel={() => setModalDetalleVisible(false)}
        footer={null}
        width={800}
        className="modal-detalle-venta"
      >
        {ventaSeleccionada && (
          <>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="N° Venta" span={2}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontFamily: 'monospace' }}>
                    {ventaSeleccionada.numero_venta}
                  </Text>
                  {ventaSeleccionada.cantidad_productos > 0 && (
                    <Tooltip title="Ver productos vendidos en detalle">
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        size="small"
                        style={{ color: '#667eea', fontWeight: 600 }}
                        onClick={() => {
                          // Abrir modal de productos
                          setModalProductosVisible(true);
                        }}
                      >
                        Ver {ventaSeleccionada.cantidad_productos} producto(s)
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Fecha">
                {dayjs(ventaSeleccionada.fecha_venta).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Sucursal">
                <Tag color="blue">{ventaSeleccionada.sucursal.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cliente">
                {ventaSeleccionada.cliente_nombre}
              </Descriptions.Item>
              <Descriptions.Item label="Vendedor">
                {ventaSeleccionada.vendedor_nombre}
              </Descriptions.Item>
              <Descriptions.Item label="Método de Pago">
                <Tag color="green">
                  {ventaSeleccionada.metodo_pago.replace('_', ' ').toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Estado de Pago">
                <Tag color={ventaSeleccionada.estado_pago === 'pagado' ? 'success' : 'warning'}>
                  {ventaSeleccionada.estado_pago.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Subtotal">
                <Text style={{ fontSize: 14 }}>
                  {formatearDinero((ventaSeleccionada as any).subtotal || ventaSeleccionada.total)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Descuento">
                {(ventaSeleccionada as any).descuento && Number((ventaSeleccionada as any).descuento) > 0 ? (
                  <Tag color="orange" style={{ fontSize: 12 }}>
                    -{formatearDinero((ventaSeleccionada as any).descuento)}
                  </Tag>
                ) : (
                  <Text style={{ fontSize: 11, color: '#999' }}>-</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Total" span={2}>
                <Text strong style={{ color: '#52c41a', fontSize: 18 }}>
                  {formatearDinero(ventaSeleccionada.total)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {ventaSeleccionada.observaciones && (
              <>
                <Divider />
                <div>
                  <Text strong>Observaciones:</Text>
                  <div style={{ marginTop: 8, padding: 8, background: '#fafafa', borderRadius: 4 }}>
                    <Text>{ventaSeleccionada.observaciones}</Text>
                  </div>
                </div>
              </>
            )}

          </>
        )}
      </Modal>

      {/* Modal de Productos Vendidos (Nuevo modal separado) */}
      <Modal
        title={
          <span>
            <TagsOutlined style={{ marginRight: 8, color: '#667eea' }} />
            Productos Vendidos - {ventaSeleccionada?.numero_venta}
          </span>
        }
        open={modalProductosVisible}
        onCancel={() => setModalProductosVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalProductosVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={900}
        className="modal-productos-venta"
      >
        {loadingDetalle && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text>Cargando productos vendidos...</Text>
          </div>
        )}

        {detalleVenta && detalleVenta.productos && detalleVenta.productos.length > 0 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                Total de productos: <Text strong>{detalleVenta.productos.length}</Text>
              </Text>
            </div>
            
            <Table
              dataSource={detalleVenta.productos}
              rowKey="id"
              size="middle"
              pagination={false}
              bordered
              columns={[
                {
                  title: 'Producto',
                  dataIndex: 'nombre',
                  key: 'nombre',
                  width: '40%',
                  render: (nombre: string, record: any) => (
                    <div>
                      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
                        {nombre || 'Sin nombre'}
                      </Text>
                      {(record.tipo || record.marca || record.calidad) && (
                        <Space size={4} wrap>
                          {record.tipo && (
                            <Tag color="blue" style={{ fontSize: 11, margin: 0 }}>
                              {record.tipo}
                            </Tag>
                          )}
                          {record.marca && (
                            <Tag color="green" style={{ fontSize: 11, margin: 0 }}>
                              {record.marca}
                            </Tag>
                          )}
                          {record.calidad && (
                            <Tag color="purple" style={{ fontSize: 11, margin: 0 }}>
                              {record.calidad}
                            </Tag>
                          )}
                        </Space>
                      )}
                    </div>
                  ),
                },
                {
                  title: 'Cantidad',
                  dataIndex: 'cantidad',
                  key: 'cantidad',
                  align: 'center',
                  width: '15%',
                  render: (cantidad: number) => (
                    <Badge 
                      count={cantidad || 0} 
                      showZero 
                      style={{ 
                        backgroundColor: '#52c41a',
                        fontSize: 14,
                        fontWeight: 'bold'
                      }} 
                    />
                  ),
                },
                {
                  title: 'Precio Unitario',
                  dataIndex: 'precio_venta',
                  key: 'precio_venta',
                  align: 'right',
                  width: '20%',
                  render: (precio: number) => (
                    <Text style={{ fontSize: 13 }}>
                      {formatearDinero(precio)}
                    </Text>
                  ),
                },
                {
                  title: 'Subtotal',
                  dataIndex: 'subtotal',
                  key: 'subtotal',
                  align: 'right',
                  width: '25%',
                  render: (subtotal: number) => (
                    <Text strong style={{ color: '#52c41a', fontSize: 15 }}>
                      {formatearDinero(subtotal)}
                    </Text>
                  ),
                },
              ]}
              summary={(pageData) => {
                const totalCantidad = pageData.reduce((sum, record) => {
                  return sum + (Number(record.cantidad) || 0);
                }, 0);
                const total = pageData.reduce((sum, record) => {
                  return sum + (Number(record.subtotal) || 0);
                }, 0);
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{ backgroundColor: '#f0f5ff' }}>
                      <Table.Summary.Cell index={0} align="right">
                        <Text strong style={{ fontSize: 14 }}>TOTAL:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="center">
                        <Badge 
                          count={totalCantidad} 
                          showZero 
                          style={{ 
                            backgroundColor: '#1890ff',
                            fontSize: 14,
                            fontWeight: 'bold'
                          }} 
                        />
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                      <Table.Summary.Cell index={3} align="right">
                        <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                          {formatearDinero(total)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </>
        )}

        {detalleVenta && (!detalleVenta.productos || detalleVenta.productos.length === 0) && !loadingDetalle && (
          <Empty 
            description="No se encontraron productos vendidos"
            style={{ padding: '40px 0' }}
          />
        )}
      </Modal>

      {/* Modal de Métodos de Pago */}
      <Modal
        title={
          <span>
            <CreditCardOutlined style={{ marginRight: 8, color: '#667eea' }} />
            <span style={{ color: '#000' }}>Desglose Detallado</span>
          </span>
        }
        open={modalMetodosPagoVisible}
        onCancel={() => setModalMetodosPagoVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalMetodosPagoVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={1100}
        className="modal-metodos-pago"
      >
        <Tabs
          defaultActiveKey="efectivo"
          items={[
            {
              key: 'efectivo',
              label: (
                <span>
                  <DollarOutlined />
                  {' '}Efectivo ({ventas.filter(v => v.metodo_pago === 'efectivo').length})
                </span>
              ),
              children: (
                <div>
                  {/* Filtros de fecha para efectivo */}
                  <div style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      <Text strong style={{ fontSize: 13, color: '#595959' }}>
                        📅 Filtrar por Fecha
                      </Text>
                      <Space>
                        <DatePicker.RangePicker
                          value={[fechaEfectivoDesde, fechaEfectivoHasta]}
                          onChange={(dates) => {
                            setFechaEfectivoDesde(dates ? dates[0] : null);
                            setFechaEfectivoHasta(dates ? dates[1] : null);
                          }}
                          format="DD/MM/YYYY"
                          placeholder={['Desde', 'Hasta']}
                          style={{ width: 280 }}
                        />
                        <Button
                          type="primary"
                          icon={<CalendarOutlined />}
                          onClick={() => aplicarFiltrosEfectivo(true)}
                          style={{ background: '#52c41a', borderColor: '#52c41a' }}
                        >
                          Filtrar
                        </Button>
                        <Button
                          onClick={() => {
                            setFechaEfectivoDesde(fechaDesde);
                            setFechaEfectivoHasta(fechaHasta);
                            aplicarFiltrosEfectivo(false);
                          }}
                        >
                          Restablecer
                        </Button>
                      </Space>
                    </Space>
                  </div>
                  
                  {/* Estadísticas */}
                  <div style={{ marginBottom: 16 }}>
                    <Space size="large">
                      <Statistic
                        title="Total en Efectivo"
                        value={formatearDinero(
                          ventasEfectivo.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
                        )}
                        valueStyle={{ color: '#52c41a' }}
                      />
                      <Statistic
                        title="Cantidad de Pagos"
                        value={ventasEfectivo.length}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Space>
                  </div>
                  <Table
                    dataSource={ventasEfectivo}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    columns={[
                      {
                        title: 'N° Venta',
                        dataIndex: 'numero_venta',
                        key: 'numero_venta',
                        width: 140,
                        render: (numero: string) => (
                          <Text strong style={{ fontFamily: 'monospace', fontSize: 11 }}>
                            {numero}
                          </Text>
                        ),
                      },
                      {
                        title: 'Fecha',
                        dataIndex: 'fecha_venta',
                        key: 'fecha_venta',
                        width: 100,
                        render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY'),
                      },
                      {
                        title: 'Cliente',
                        dataIndex: 'cliente_nombre',
                        key: 'cliente_nombre',
                        ellipsis: true,
                      },
                      {
                        title: 'Sucursal',
                        dataIndex: 'sucursal',
                        key: 'sucursal',
                        width: 100,
                        render: (sucursal: string) => (
                          <Tag color="blue">{sucursal.toUpperCase()}</Tag>
                        ),
                      },
                      {
                        title: 'Total',
                        dataIndex: 'total',
                        key: 'total',
                        align: 'right',
                        width: 120,
                        render: (total: number) => (
                          <Text strong style={{ color: '#52c41a' }}>
                            {formatearDinero(total)}
                          </Text>
                        ),
                      },
                      {
                        title: 'Acciones',
                        key: 'acciones',
                        align: 'center',
                        width: 80,
                        render: (_, record) => (
                          <Button
                            type="link"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleVerDetalle(record)}
                          />
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: 'transferencia',
              label: (
                <span>
                  <ThunderboltOutlined />
                  {' '}Transferencia ({ventas.filter(v => v.metodo_pago === 'transferencia').length})
                </span>
              ),
              children: (
                <div>
                  {/* Filtros de fecha para transferencia */}
                  <div style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      <Text strong style={{ fontSize: 13, color: '#595959' }}>
                        📅 Filtrar por Fecha
                      </Text>
                      <Space>
                        <DatePicker.RangePicker
                          value={[fechaTransferenciaDesde, fechaTransferenciaHasta]}
                          onChange={(dates) => {
                            setFechaTransferenciaDesde(dates ? dates[0] : null);
                            setFechaTransferenciaHasta(dates ? dates[1] : null);
                          }}
                          format="DD/MM/YYYY"
                          placeholder={['Desde', 'Hasta']}
                          style={{ width: 280 }}
                        />
                        <Button
                          type="primary"
                          icon={<CalendarOutlined />}
                          onClick={() => aplicarFiltrosTransferencia(true)}
                          style={{ background: '#faad14', borderColor: '#faad14' }}
                        >
                          Filtrar
                        </Button>
                        <Button
                          onClick={() => {
                            setFechaTransferenciaDesde(fechaDesde);
                            setFechaTransferenciaHasta(fechaHasta);
                            aplicarFiltrosTransferencia(false);
                          }}
                        >
                          Restablecer
                        </Button>
                      </Space>
                    </Space>
                  </div>
                  
                  {/* Estadísticas */}
                  <div style={{ marginBottom: 16 }}>
                    <Space size="large">
                      <Statistic
                        title="Total en Transferencia"
                        value={formatearDinero(
                          ventasTransferencia.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
                        )}
                        valueStyle={{ color: '#faad14' }}
                      />
                      <Statistic
                        title="Cantidad de Pagos"
                        value={ventasTransferencia.length}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Space>
                  </div>
                  <Table
                    dataSource={ventasTransferencia}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    columns={[
                      {
                        title: 'N° Venta',
                        dataIndex: 'numero_venta',
                        key: 'numero_venta',
                        width: 140,
                        render: (numero: string) => (
                          <Text strong style={{ fontFamily: 'monospace', fontSize: 11 }}>
                            {numero}
                          </Text>
                        ),
                      },
                      {
                        title: 'Fecha',
                        dataIndex: 'fecha_venta',
                        key: 'fecha_venta',
                        width: 100,
                        render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY'),
                      },
                      {
                        title: 'Cliente',
                        dataIndex: 'cliente_nombre',
                        key: 'cliente_nombre',
                        ellipsis: true,
                      },
                      {
                        title: 'Sucursal',
                        dataIndex: 'sucursal',
                        key: 'sucursal',
                        width: 100,
                        render: (sucursal: string) => (
                          <Tag color="blue">{sucursal.toUpperCase()}</Tag>
                        ),
                      },
                      {
                        title: 'Total',
                        dataIndex: 'total',
                        key: 'total',
                        align: 'right',
                        width: 120,
                        render: (total: number) => (
                          <Text strong style={{ color: '#faad14' }}>
                            {formatearDinero(total)}
                          </Text>
                        ),
                      },
                      {
                        title: 'Acciones',
                        key: 'acciones',
                        align: 'center',
                        width: 80,
                        render: (_, record) => (
                          <Button
                            type="link"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleVerDetalle(record)}
                          />
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: 'cuenta_corriente',
              label: (
                <span>
                  <CreditCardOutlined />
                  {' '}Cuenta Corriente ({ventas.filter(v => v.metodo_pago === 'cuenta_corriente').length})
                </span>
              ),
              children: (
                <div>
                  {/* Filtros de fecha para cuenta corriente */}
                  <div style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      <Text strong style={{ fontSize: 13, color: '#595959' }}>
                        📅 Filtrar por Fecha
                      </Text>
                      <Space>
                        <DatePicker.RangePicker
                          value={[fechaCuentaCorrienteDesde, fechaCuentaCorrienteHasta]}
                          onChange={(dates) => {
                            setFechaCuentaCorrienteDesde(dates ? dates[0] : null);
                            setFechaCuentaCorrienteHasta(dates ? dates[1] : null);
                          }}
                          format="DD/MM/YYYY"
                          placeholder={['Desde', 'Hasta']}
                          style={{ width: 280 }}
                        />
                        <Button
                          type="primary"
                          icon={<CalendarOutlined />}
                          onClick={() => aplicarFiltrosCuentaCorriente(true)}
                          style={{ background: '#722ed1', borderColor: '#722ed1' }}
                        >
                          Filtrar
                        </Button>
                        <Button
                          onClick={() => {
                            setFechaCuentaCorrienteDesde(fechaDesde);
                            setFechaCuentaCorrienteHasta(fechaHasta);
                            aplicarFiltrosCuentaCorriente(false);
                          }}
                        >
                          Restablecer
                        </Button>
                      </Space>
                    </Space>
                  </div>
                  
                  {/* Estadísticas */}
                  <div style={{ marginBottom: 16 }}>
                    <Space size="large">
                      <Statistic
                        title="Total en Cuenta Corriente"
                        value={formatearDinero(
                          ventasCuentaCorriente.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
                        )}
                        valueStyle={{ color: '#722ed1' }}
                      />
                      <Statistic
                        title="Cantidad de Pagos"
                        value={ventasCuentaCorriente.length}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Space>
                  </div>
                  <Table
                    dataSource={ventasCuentaCorriente}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    columns={[
                      {
                        title: 'N° Venta',
                        dataIndex: 'numero_venta',
                        key: 'numero_venta',
                        width: 140,
                        render: (numero: string) => (
                          <Text strong style={{ fontFamily: 'monospace', fontSize: 11 }}>
                            {numero}
                          </Text>
                        ),
                      },
                      {
                        title: 'Fecha',
                        dataIndex: 'fecha_venta',
                        key: 'fecha_venta',
                        width: 100,
                        render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY'),
                      },
                      {
                        title: 'Cliente',
                        dataIndex: 'cliente_nombre',
                        key: 'cliente_nombre',
                        ellipsis: true,
                      },
                      {
                        title: 'Sucursal',
                        dataIndex: 'sucursal',
                        key: 'sucursal',
                        width: 100,
                        render: (sucursal: string) => (
                          <Tag color="blue">{sucursal.toUpperCase()}</Tag>
                        ),
                      },
                      {
                        title: 'Estado',
                        dataIndex: 'estado_pago',
                        key: 'estado_pago',
                        width: 100,
                        render: (estado: string) => (
                          <Tag color={estado === 'pagado' ? 'success' : 'warning'}>
                            {estado.toUpperCase()}
                          </Tag>
                        ),
                      },
                      {
                        title: 'Total',
                        dataIndex: 'total',
                        key: 'total',
                        align: 'right',
                        width: 120,
                        render: (total: number) => (
                          <Text strong style={{ color: '#722ed1' }}>
                            {formatearDinero(total)}
                          </Text>
                        ),
                      },
                      {
                        title: 'Acciones',
                        key: 'acciones',
                        align: 'center',
                        width: 80,
                        render: (_, record) => (
                          <Button
                            type="link"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleVerDetalle(record)}
                          />
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: 'gastos',
              label: (
                <span>
                  <DollarOutlined style={{ transform: 'rotate(180deg)' }} />
                  {' '}Gastos ({gastos.length})
                </span>
              ),
              children: (
                <div>
                  {loadingGastos ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <Text>Cargando gastos...</Text>
                    </div>
                  ) : (
                    <>
                      {/* Filtros para gastos */}
                      <div style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 8 }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                          <Text strong style={{ fontSize: 13, color: '#595959' }}>
                            🔍 Filtros de Búsqueda
                          </Text>
                          
                          {/* Filtro por concepto */}
                          <div>
                            <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>
                              Concepto:
                            </Text>
                            <Select
                              value={conceptoGastos}
                              onChange={setConceptoGastos}
                              style={{ width: 200 }}
                              placeholder="Seleccionar concepto"
                            >
                              <Select.Option value="todos">Todos</Select.Option>
                              <Select.Option value="Gasolina">⛽ Gasolina</Select.Option>
                              <Select.Option value="Papelería">📄 Papelería</Select.Option>
                              <Select.Option value="Flete">🚚 Flete</Select.Option>
                              <Select.Option value="Otro">❓ Otro</Select.Option>
                            </Select>
                          </div>
                          
                          {/* Filtro por fecha */}
                          <div>
                            <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>
                              Rango de Fechas:
                            </Text>
                            <Space>
                              <DatePicker.RangePicker
                                value={[fechaGastosDesde, fechaGastosHasta]}
                                onChange={(dates) => {
                                  setFechaGastosDesde(dates ? dates[0] : null);
                                  setFechaGastosHasta(dates ? dates[1] : null);
                                }}
                                format="DD/MM/YYYY"
                                placeholder={['Desde', 'Hasta']}
                                style={{ width: 280 }}
                              />
                              <Button
                                type="primary"
                                icon={<CalendarOutlined />}
                                onClick={() => cargarGastos(true)}
                                loading={loadingGastos}
                                style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }}
                              >
                                Filtrar
                              </Button>
                              <Button
                                onClick={() => {
                                  setFechaGastosDesde(fechaDesde);
                                  setFechaGastosHasta(fechaHasta);
                                  setConceptoGastos('todos');
                                  cargarGastos(false);
                                }}
                                disabled={loadingGastos}
                              >
                                Restablecer
                              </Button>
                            </Space>
                          </div>
                        </Space>
                      </div>
                      
                      {/* Estadísticas */}
                      <div style={{ marginBottom: 16 }}>
                        <Space size="large">
                          <Statistic
                            title="Total en Gastos"
                            value={formatearDinero(
                              gastos.reduce((sum, g) => sum + (Number(g.monto) || 0), 0)
                            )}
                            valueStyle={{ color: '#ff4d4f' }}
                          />
                          <Statistic
                            title="Cantidad de Gastos"
                            value={gastos.length}
                            valueStyle={{ color: '#1890ff' }}
                          />
                        </Space>
                      </div>
                      <Table
                        dataSource={gastos}
                        rowKey="id"
                        size="small"
                        pagination={{ pageSize: 10, showSizeChanger: false }}
                        columns={[
                          {
                            title: 'Fecha',
                            dataIndex: 'created_at',
                            key: 'created_at',
                            width: 100,
                            render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY'),
                          },
                          {
                            title: 'Concepto',
                            dataIndex: 'concepto',
                            key: 'concepto',
                            ellipsis: true,
                          },
                          {
                            title: 'Sucursal',
                            dataIndex: 'sucursal',
                            key: 'sucursal',
                            width: 100,
                            render: (sucursal: string) => (
                              <Tag color="orange">{sucursal?.toUpperCase()}</Tag>
                            ),
                          },
                          {
                            title: 'Usuario',
                            dataIndex: 'usuario_email',
                            key: 'usuario_email',
                            width: 150,
                            ellipsis: true,
                          },
                          {
                            title: 'Monto',
                            dataIndex: 'monto',
                            key: 'monto',
                            align: 'right',
                            width: 120,
                            render: (monto: number) => (
                              <Text strong style={{ color: '#ff4d4f' }}>
                                {formatearDinero(Math.abs(monto))}
                              </Text>
                            ),
                          },
                        ]}
                      />
                    </>
                  )}
                </div>
              ),
            },
            {
              key: 'envios',
              label: (
                <span>
                  <BankOutlined style={{ color: '#fa8c16' }} />
                  {' '}Envío de dinero ({envios.length})
                </span>
              ),
              children: (
                <div>
                  {loadingEnvios ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <Text>Cargando envíos...</Text>
                    </div>
                  ) : (
                    <>
                      {/* Filtros de fecha para envíos */}
                      <div style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 8 }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                          <Text strong style={{ fontSize: 13, color: '#595959' }}>
                            📅 Filtrar por Fecha
                          </Text>
                          <Space>
                            <DatePicker.RangePicker
                              value={[fechaEnviosDesde, fechaEnviosHasta]}
                              onChange={(dates) => {
                                setFechaEnviosDesde(dates ? dates[0] : null);
                                setFechaEnviosHasta(dates ? dates[1] : null);
                              }}
                              format="DD/MM/YYYY"
                              placeholder={['Desde', 'Hasta']}
                              style={{ width: 280 }}
                            />
                            <Button
                              type="primary"
                              icon={<CalendarOutlined />}
                              onClick={() => cargarEnvios(true)}
                              loading={loadingEnvios}
                              style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
                            >
                              Filtrar
                            </Button>
                            <Button
                              onClick={() => {
                                setFechaEnviosDesde(fechaDesde);
                                setFechaEnviosHasta(fechaHasta);
                                cargarEnvios(false);
                              }}
                              disabled={loadingEnvios}
                            >
                              Restablecer
                            </Button>
                          </Space>
                        </Space>
                      </div>
                      
                      {/* Estadísticas */}
                      <div style={{ marginBottom: 16 }}>
                        <Space size="large">
                          <Statistic
                            title="Total en Envíos"
                            value={formatearDinero(
                              envios.reduce((sum, e) => sum + (Math.abs(Number(e.monto)) || 0), 0)
                            )}
                            valueStyle={{ color: '#fa8c16' }}
                          />
                          <Statistic
                            title="Cantidad de Envíos"
                            value={envios.length}
                            valueStyle={{ color: '#1890ff' }}
                          />
                        </Space>
                      </div>
                      <Table
                        dataSource={envios}
                        rowKey="id"
                        size="small"
                        pagination={{ pageSize: 10, showSizeChanger: false }}
                        columns={[
                          {
                            title: 'Fecha',
                            dataIndex: 'created_at',
                            key: 'created_at',
                            width: 100,
                            render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY'),
                          },
                          {
                            title: 'Concepto',
                            dataIndex: 'concepto',
                            key: 'concepto',
                            ellipsis: true,
                          },
                          {
                            title: 'Sucursal',
                            dataIndex: 'sucursal',
                            key: 'sucursal',
                            width: 100,
                            render: (sucursal: string) => (
                              <Tag color="orange">{sucursal?.toUpperCase()}</Tag>
                            ),
                          },
                          {
                            title: 'Usuario',
                            dataIndex: 'usuario_email',
                            key: 'usuario_email',
                            width: 150,
                            ellipsis: true,
                          },
                          {
                            title: 'Monto',
                            dataIndex: 'monto',
                            key: 'monto',
                            align: 'right',
                            width: 120,
                            render: (monto: number) => (
                              <Text strong style={{ color: '#fa8c16' }}>
                                {formatearDinero(Math.abs(monto))}
                              </Text>
                            ),
                          },
                        ]}
                      />
                    </>
                  )}
                </div>
              ),
            },
            {
              key: 'comisiones',
              label: (
                <span>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  {' '}Comisiones ({comisiones.length})
                </span>
              ),
              children: (
                <div>
                  {loadingComisiones ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <Text>Cargando comisiones...</Text>
                    </div>
                  ) : (
                  <>
                    {/* Filtros de fecha para comisiones */}
                    <div style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 8 }}>
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <Text strong style={{ fontSize: 13, color: '#595959' }}>
                          📅 Filtrar por Fecha
                        </Text>
                        <Space>
                          <DatePicker.RangePicker
                            value={[fechaComisionesDesde, fechaComisionesHasta]}
                            onChange={(dates) => {
                              setFechaComisionesDesde(dates ? dates[0] : null);
                              setFechaComisionesHasta(dates ? dates[1] : null);
                            }}
                            format="DD/MM/YYYY"
                            placeholder={['Desde', 'Hasta']}
                            style={{ width: 280 }}
                          />
                          <Button
                            type="primary"
                            icon={<CalendarOutlined />}
                            onClick={() => cargarComisiones(true)}
                            loading={loadingComisiones}
                            style={{ background: '#52c41a', borderColor: '#52c41a' }}
                          >
                            Filtrar
                          </Button>
                          <Button
                            onClick={() => {
                              setFechaComisionesDesde(fechaDesde);
                              setFechaComisionesHasta(fechaHasta);
                              cargarComisiones(false);
                            }}
                            disabled={loadingComisiones}
                          >
                            Restablecer
                          </Button>
                        </Space>
                      </Space>
                    </div>
                    
                    {/* Estadísticas */}
                    <div style={{ marginBottom: 16 }}>
                      <Space size="large">
                        <Statistic
                          title="Total en Comisiones"
                          value={formatearDinero(
                            comisiones.reduce((sum, c) => sum + (Number(c.monto) || 0), 0)
                          )}
                          valueStyle={{ color: '#52c41a' }}
                        />
                        <Statistic
                          title="Cantidad de Registros"
                          value={comisiones.length}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Space>
                    </div>
                    <Table
                      dataSource={comisiones}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 10, showSizeChanger: false }}
                      columns={[
                        {
                          title: 'Fecha',
                          dataIndex: 'fecha',
                          key: 'fecha',
                          width: 100,
                          render: (fecha: string) => (
                            <Text>{dayjs(fecha).format('DD/MM/YYYY')}</Text>
                          ),
                        },
                        {
                          title: 'Comisionista',
                          key: 'comisionista',
                          render: (record: any) => (
                            <Text strong>
                              {record.vendedor_nombre} {record.vendedor_apellido}
                            </Text>
                          ),
                        },
                        {
                          title: 'Sucursal',
                          dataIndex: 'sucursal',
                          key: 'sucursal',
                          width: 100,
                          render: (sucursal: string) => (
                            <Tag color="green">{sucursal?.toUpperCase()}</Tag>
                          ),
                        },
                        {
                          title: 'Monto $',
                          dataIndex: 'monto',
                          key: 'monto',
                          align: 'right',
                          width: 120,
                          render: (monto: number) => (
                            <Text strong style={{ color: '#52c41a', fontSize: 14 }}>
                              {formatearDinero(monto)}
                            </Text>
                          ),
                        },
                        {
                          title: 'Notas',
                          dataIndex: 'notas',
                          key: 'notas',
                          ellipsis: true,
                          render: (notas: string) => (
                            <Text type="secondary">{notas || '-'}</Text>
                          ),
                        },
                      ]}
                    />
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default GlobalSales;
