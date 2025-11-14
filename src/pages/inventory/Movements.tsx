/**
 * Página de Movimientos de Inventarios
 * Muestra el historial completo de cambios en el stock
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
  Typography,
  Empty,
  Tooltip,
  Input,
  Alert,
  Statistic,
} from 'antd';
import {
  ReloadOutlined,
  CalendarOutlined,
  ShopOutlined,
  HistoryOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UndoOutlined,
  SwapOutlined,
  EditOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

// URL de la API - detecta automáticamente el entorno
const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
    ? '/api' 
    : 'http://localhost:3456/api');

/**
 * Interface para un movimiento de stock
 */
interface MovimientoStock {
  id: number;
  sucursal: string;
  producto_id: number;
  producto_nombre: string;
  cliente_id: number | null;
  cliente_nombre: string | null;
  stock_anterior: number;
  stock_nuevo: number;
  stock_fallas_anterior: number;
  stock_fallas_nuevo: number;
  tipo_movimiento: string;
  referencia: string | null;
  usuario_email: string;
  observaciones: string | null;
  created_at: string;
  stock_actual: number;
  stock_fallas_actual: number;
}

/**
 * Obtener configuración de colores e iconos según el tipo de movimiento
 */
const getTipoMovimientoConfig = (tipo: string) => {
  const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    venta: {
      color: 'blue',
      icon: <ShoppingCartOutlined />,
      label: 'Venta',
    },
    devolucion_stock_principal: {
      color: 'green',
      icon: <UndoOutlined />,
      label: 'Devolución (Stock)',
    },
    devolucion_stock_fallas: {
      color: 'orange',
      icon: <UndoOutlined />,
      label: 'Devolución (Fallas)',
    },
    reemplazo: {
      color: 'purple',
      icon: <SwapOutlined />,
      label: 'Reemplazo',
    },
    ajuste_manual: {
      color: 'cyan',
      icon: <EditOutlined />,
      label: 'Ajuste Manual',
    },
    transferencia_entrada: {
      color: 'geekblue',
      icon: <ArrowUpOutlined />,
      label: 'Transferencia Entrada',
    },
    transferencia_salida: {
      color: 'magenta',
      icon: <ArrowDownOutlined />,
      label: 'Transferencia Salida',
    },
  };

  return configs[tipo] || { color: 'default', icon: <HistoryOutlined />, label: tipo };
};

/**
 * Componente Principal
 */
const Movements: React.FC = () => {
  const { usuario } = useAuth();
  const esAdmin = usuario?.esAdmin || false;
  const sucursalUsuario = usuario?.sucursal?.toLowerCase() || 'pando';

  // Estados para filtros
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(null);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>(esAdmin ? 'todas' : sucursalUsuario);
  const [tipoMovimiento, setTipoMovimiento] = useState<string>('todos');
  const [productoNombre, setProductoNombre] = useState<string>('');

  // Estados de datos
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  /**
   * Cargar sucursales al montar
   */
  useEffect(() => {
    cargarSucursales();
    cargarMovimientos();
  }, []);

  /**
   * Cargar sucursales desde la API
   */
   const cargarSucursales = async () => {
     setLoadingSucursales(true);
     try {
       const token = localStorage.getItem('token');
       const response = await fetch(`${API_URL}/sucursales`, {
         headers: {
           'Authorization': `Bearer ${token}`,
         },
       });
      const data = await response.json();
      
      if (data.success) {
        // Extraer solo los nombres de las sucursales (data.data es array de objetos)
        const nombresSucursales = data.data.map((s: any) => s.sucursal || s);
        
        // Si es admin, agregar "todas" al inicio
        if (esAdmin) {
          setSucursales(['todas', ...nombresSucursales]);
        } else {
          // Usuario normal solo ve su sucursal
          setSucursales([sucursalUsuario]);
        }
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      message.error('Error al cargar sucursales');
    } finally {
      setLoadingSucursales(false);
    }
  };

  /**
   * Cargar movimientos con filtros
   */
  const cargarMovimientos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      console.log('======================================');
      console.log('🌐 FRONTEND: Iniciando carga de movimientos');
      console.log('🔑 Token:', token ? 'Presente' : 'FALTA');
      
      // Construir query params
      const params = new URLSearchParams();
      
      if (sucursalSeleccionada && sucursalSeleccionada !== 'todas') {
        params.append('sucursal', sucursalSeleccionada);
      }
      
      if (fechaDesde) {
        params.append('fecha_desde', fechaDesde.format('YYYY-MM-DD'));
      }
      
      if (fechaHasta) {
        params.append('fecha_hasta', fechaHasta.format('YYYY-MM-DD'));
      }
      
      if (tipoMovimiento && tipoMovimiento !== 'todos') {
        params.append('tipo_movimiento', tipoMovimiento);
      }
      
      if (productoNombre) {
        params.append('producto_nombre', productoNombre);
      }

      params.append('limit', '200'); // Aumentar límite a 200

       console.log('📡 Filtros aplicados:', Object.fromEntries(params));

       const url = `${API_URL}/historial-stock?${params.toString()}`;
       console.log('🌐 URL completa:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📥 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        console.error('❌ Error en respuesta:', response.status, response.statusText);
        throw new Error('Error al cargar movimientos');
      }

      const data = await response.json();
      
      console.log('📊 Datos recibidos:', {
        success: data.success,
        total: data.total,
        movimientos: data.data?.length || 0,
        primeros3: data.data?.slice(0, 3)
      });
      
      if (data.success) {
        setMovimientos(data.data || []);
        console.log(`✅ ${data.data?.length || 0} movimientos cargados en state`);
        console.log('======================================');
      } else {
        console.error('❌ Success false:', data.message);
        throw new Error(data.message || 'Error al cargar movimientos');
      }
    } catch (error) {
      console.error('❌ Error al cargar movimientos:', error);
      message.error('Error al cargar el historial de movimientos');
    } finally {
      setLoading(false);
    }
  };

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
   * Limpiar todos los filtros
   */
  const limpiarFiltros = () => {
    setFechaDesde(null);
    setFechaHasta(null);
    setSucursalSeleccionada(esAdmin ? 'todas' : sucursalUsuario);
    setTipoMovimiento('todos');
    setProductoNombre('');
  };

  /**
   * Calcular estadísticas
   */
  const totalMovimientos = movimientos.length;
  const totalVentas = movimientos.filter(m => m.tipo_movimiento === 'venta').length;
  const totalDevoluciones = movimientos.filter(m => 
    m.tipo_movimiento.includes('devolucion')
  ).length;
  const totalReemplazos = movimientos.filter(m => m.tipo_movimiento === 'reemplazo').length;

  /**
   * Columnas de la tabla
   */
  const columns: ColumnsType<MovimientoStock> = [
    {
      title: 'Fecha',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (fecha: string) => (
        <Text style={{ fontSize: 11 }}>
          {dayjs(fecha).format('DD/MM/YYYY HH:mm')}
        </Text>
      ),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
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
    },
    {
      title: 'Producto',
      dataIndex: 'producto_nombre',
      key: 'producto_nombre',
      width: 180,
      ellipsis: true,
      render: (nombre: string) => (
        <Tooltip title={nombre}>
          <Text style={{ fontSize: 11 }}>{nombre}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente_nombre',
      key: 'cliente_nombre',
      width: 140,
      ellipsis: true,
      render: (nombre: string | null) => (
        nombre ? (
          <Tooltip title={nombre}>
            <Text style={{ fontSize: 11, color: '#52c41a' }}>{nombre}</Text>
          </Tooltip>
        ) : (
          <Text style={{ fontSize: 11, color: '#999' }}>-</Text>
        )
      ),
    },
    {
      title: 'Stock Anterior',
      dataIndex: 'stock_anterior',
      key: 'stock_anterior',
      width: 100,
      align: 'center',
      render: (stock: number) => (
        <Tag color="default" style={{ fontSize: 11 }}>
          {stock}
        </Tag>
      ),
    },
    {
      title: 'Stock Actual',
      dataIndex: 'stock_actual',
      key: 'stock_actual',
      width: 100,
      align: 'center',
      render: (stock: number) => (
        <Tag color="blue" style={{ fontSize: 11, fontWeight: 'bold' }}>
          📦 {stock}
        </Tag>
      ),
    },
    {
      title: 'Fallas Anterior',
      dataIndex: 'stock_fallas_anterior',
      key: 'stock_fallas_anterior',
      width: 100,
      align: 'center',
      render: (stock: number) => (
        <Tag color="orange" style={{ fontSize: 11 }}>
          {stock}
        </Tag>
      ),
    },
    {
      title: 'Fallas Actual',
      dataIndex: 'stock_fallas_actual',
      key: 'stock_fallas_actual',
      width: 110,
      align: 'center',
      render: (stock: number) => (
        <Tag color="volcano" style={{ fontSize: 11, fontWeight: 'bold' }}>
          ⚠️ {stock}
        </Tag>
      ),
    },
    {
      title: 'Razón',
      dataIndex: 'tipo_movimiento',
      key: 'tipo_movimiento',
      width: 160,
      render: (tipo: string) => {
        const config = getTipoMovimientoConfig(tipo);
        return (
          <Tag
            icon={config.icon}
            color={config.color}
            style={{ fontSize: 10 }}
          >
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Referencia',
      dataIndex: 'referencia',
      key: 'referencia',
      width: 120,
      ellipsis: true,
      render: (ref: string | null) => (
        ref ? (
          <Tooltip title={ref}>
            <Text style={{ fontSize: 11, fontFamily: 'monospace' }}>{ref}</Text>
          </Tooltip>
        ) : (
          <Text style={{ fontSize: 11, color: '#999' }}>-</Text>
        )
      ),
    },
    {
      title: 'Usuario',
      dataIndex: 'usuario_email',
      key: 'usuario_email',
      width: 140,
      ellipsis: true,
      render: (email: string) => (
        <Tooltip title={email}>
          <Text style={{ fontSize: 11, color: '#666' }}>
            {email.split('@')[0]}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Observaciones',
      dataIndex: 'observaciones',
      key: 'observaciones',
      width: 200,
      ellipsis: true,
      render: (obs: string | null) => (
        obs ? (
          <Tooltip title={obs}>
            <Text style={{ fontSize: 11, color: '#666' }}>{obs}</Text>
          </Tooltip>
        ) : (
          <Text style={{ fontSize: 11, color: '#999' }}>-</Text>
        )
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f7fa', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <Card
        style={{
          marginBottom: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: 'white' }}>
              <HistoryOutlined /> Movimientos de Inventarios
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
              Historial completo de cambios en el stock de productos
            </Text>
          </div>
        </div>
      </Card>

      {/* Alert para usuarios normales */}
      {!esAdmin && (
        <Alert
          message="Acceso Restringido"
          description="Solo puedes ver movimientos de tu sucursal asignada."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Estadísticas */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Movimientos"
              value={totalMovimientos}
              prefix={<HistoryOutlined />}
              valueStyle={{ color: '#667eea', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Ventas"
              value={totalVentas}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Devoluciones"
              value={totalDevoluciones}
              prefix={<UndoOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Reemplazos"
              value={totalReemplazos}
              prefix={<SwapOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: 24 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 11 }}>
                  <ShopOutlined /> Sucursal
                </Text>
                <Select
                  value={sucursalSeleccionada}
                  onChange={setSucursalSeleccionada}
                  style={{ width: '100%' }}
                  disabled={!esAdmin}
                  loading={loadingSucursales}
                >
                  {esAdmin && <Option value="todas">📊 Todas las Sucursales</Option>}
                  {sucursales.filter(s => s !== 'todas').map((sucursal) => (
                    <Option key={sucursal} value={sucursal}>
                      {sucursal.toUpperCase()}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 11 }}>
                  <HistoryOutlined /> Tipo de Movimiento
                </Text>
                <Select
                  value={tipoMovimiento}
                  onChange={setTipoMovimiento}
                  style={{ width: '100%' }}
                >
                  <Option value="todos">Todos</Option>
                  <Option value="venta">Venta</Option>
                  <Option value="devolucion_stock_principal">Devolución (Stock)</Option>
                  <Option value="devolucion_stock_fallas">Devolución (Fallas)</Option>
                  <Option value="reemplazo">Reemplazo</Option>
                  <Option value="ajuste_manual">Ajuste Manual</Option>
                  <Option value="transferencia_entrada">Transferencia Entrada</Option>
                  <Option value="transferencia_salida">Transferencia Salida</Option>
                </Select>
              </Space>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 11 }}>
                  <CalendarOutlined /> Rango de Fechas
                </Text>
                <RangePicker
                  value={[fechaDesde, fechaHasta]}
                  onChange={handleRangeFechasChange}
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  placeholder={['Desde', 'Hasta']}
                />
              </Space>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 11 }}>
                  <SearchOutlined /> Buscar Producto
                </Text>
                <Input
                  placeholder="Nombre del producto..."
                  value={productoNombre}
                  onChange={(e) => setProductoNombre(e.target.value)}
                  prefix={<SearchOutlined />}
                />
              </Space>
            </Col>
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={12}>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={cargarMovimientos}
                loading={loading}
                block
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                }}
              >
                Buscar
              </Button>
            </Col>
            <Col xs={12}>
              <Button
                onClick={limpiarFiltros}
                block
              >
                Limpiar Filtros
              </Button>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Tabla */}
      <Card>
        {!loading && movimientos.length === 0 ? (
          <Empty description="No hay movimientos registrados con los filtros aplicados" />
        ) : (
          <Table
            columns={columns}
            dataSource={movimientos}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 25,
              showSizeChanger: true,
              showQuickJumper: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total}`,
              pageSizeOptions: ['25', '50', '100', '200'],
            }}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>
    </div>
  );
};

export default Movements;
