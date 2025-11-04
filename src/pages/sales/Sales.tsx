/**
 * Página de Historial de Ventas
 * Muestra todas las ventas realizadas desde el POS con filtros dinámicos
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Statistic,
  Row,
  Col,
  DatePicker,
  Select,
  Tag,
  message,
  Spin,
  Modal,
  Descriptions,
  Typography,
  Alert
} from 'antd';
import {
  SearchOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  DollarOutlined,
  ReloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  BankOutlined,
  UserOutlined,
  ShopOutlined,
  BarChartOutlined,
  RightOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { ventasService, type Venta, vendedoresService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

/**
 * Interfaz para sucursales
 */
interface Sucursal {
  sucursal: string;
}

/**
 * Componente principal
 */
const Sales: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados para filtros
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(null);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('todas');
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<string>('todos');
  const [estadoPagoSeleccionado, setEstadoPagoSeleccionado] = useState<string>('todos');

  // Estados de datos
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  // Estado de modal de detalle
  const [modalVisible, setModalVisible] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  /**
   * Cargar sucursales al montar el componente
   */
  useEffect(() => {
    cargarSucursales();
  }, []);

  /**
   * Cargar ventas al montar el componente
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
      setSucursales(sucursalesData.map((s: string) => ({ sucursal: s })));
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      message.error('Error al cargar sucursales');
    } finally {
      setLoadingSucursales(false);
    }
  };

  /**
   * Cargar ventas con los filtros aplicados
   */
  const cargarVentas = async () => {
    setLoading(true);
    try {
      const filtros: any = {};

      // Aplicar filtros
      if (sucursalSeleccionada && sucursalSeleccionada !== 'todas') {
        filtros.sucursal = sucursalSeleccionada;
      }

      if (fechaDesde) {
        filtros.fecha_desde = fechaDesde.format('YYYY-MM-DD');
      }

      if (fechaHasta) {
        filtros.fecha_hasta = fechaHasta.format('YYYY-MM-DD');
      }

      if (metodoPagoSeleccionado && metodoPagoSeleccionado !== 'todos') {
        filtros.metodo_pago = metodoPagoSeleccionado;
      }

      if (estadoPagoSeleccionado && estadoPagoSeleccionado !== 'todos') {
        filtros.estado_pago = estadoPagoSeleccionado;
      }

      console.log('🔍 Filtros aplicados:', filtros);

      const ventasData = await ventasService.obtenerHistorial(filtros);
      
      console.log('✅ Ventas cargadas:', ventasData.length);
      setVentas(ventasData);

      if (ventasData.length === 0) {
        message.info('No se encontraron ventas con los filtros aplicados');
      } else {
        message.success(`${ventasData.length} ventas cargadas`);
      }
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      message.error('Error al cargar el historial de ventas');
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
   * Ver detalle de una venta
   */
  const verDetalleVenta = async (venta: Venta) => {
    try {
      const detalleCompleto = await ventasService.obtenerDetalle(venta.id);
      setVentaSeleccionada(detalleCompleto);
      setModalVisible(true);
    } catch (error) {
      console.error('Error al obtener detalle:', error);
      message.error('Error al cargar el detalle de la venta');
    }
  };

  /**
   * Calcular estadísticas
   */
  const totalVentas = ventas.length;
  const totalIngresos = ventas.reduce((sum, venta) => sum + Number(venta.total), 0);
  const totalDescuentos = ventas.reduce((sum, venta) => sum + Number(venta.descuento), 0);
  const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0;

  // Contar ventas por método de pago
  const ventasPorMetodo = ventas.reduce((acc, venta) => {
    acc[venta.metodo_pago] = (acc[venta.metodo_pago] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  /**
   * Formatear método de pago para mostrar
   */
  const formatearMetodoPago = (metodo: string): React.ReactNode => {
    const estilos: Record<string, { color: string; text: string }> = {
      'efectivo': { color: 'green', text: 'Efectivo' },
      'transferencia': { color: 'blue', text: 'Transfer.' },
      'cuenta_corriente': { color: 'orange', text: 'C. Cte.' }
    };

    const estilo = estilos[metodo] || { color: 'default', text: metodo };

    return (
      <Tag color={estilo.color} style={{ fontSize: 11, padding: '0 4px', margin: 0 }}>
        {estilo.text}
      </Tag>
    );
  };

  /**
   * Formatear estado de pago para mostrar
   */
  const formatearEstadoPago = (estado: string): React.ReactNode => {
    const estilos: Record<string, { color: string; text: string }> = {
      'pagado': { color: 'success', text: '✅' },
      'pendiente': { color: 'warning', text: '⏳' },
      'parcial': { color: 'processing', text: '🔄' }
    };

    const estilo = estilos[estado] || { color: 'default', text: estado };

    return (
      <Tag color={estilo.color} style={{ fontSize: 11, padding: '2px 6px', margin: 0 }}>
        {estilo.text}
      </Tag>
    );
  };

  /**
   * Columnas de la tabla
   */
  const columns: ColumnsType<Venta> = [
    {
      title: 'N° Venta',
      dataIndex: 'numero_venta',
      key: 'numero_venta',
      width: 130,
      render: (text: string) => <Text strong style={{ fontSize: 12 }}>{text}</Text>,
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_venta',
      key: 'fecha_venta',
      width: 140,
      render: (fecha: string) => {
        const fechaFormateada = dayjs(fecha).format('DD/MM/YY HH:mm');
        return <Text style={{ fontSize: 12 }}>{fechaFormateada}</Text>;
      },
      sorter: (a, b) => dayjs(a.fecha_venta).unix() - dayjs(b.fecha_venta).unix(),
    },
    {
      title: 'Sucursal',
      dataIndex: 'sucursal',
      key: 'sucursal',
      width: 90,
      render: (sucursal: string) => (
        <Tag color="blue" style={{ fontSize: 11, padding: '0 4px' }}>
          {sucursal.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente_nombre',
      key: 'cliente_nombre',
      width: 150,
      ellipsis: true,
      render: (nombre: string) => (
        <Text style={{ fontSize: 12 }} ellipsis={{ tooltip: nombre }}>
          {nombre}
        </Text>
      ),
    },
    {
      title: 'Vendedor',
      dataIndex: 'vendedor_nombre',
      key: 'vendedor_nombre',
      width: 140,
      ellipsis: true,
      render: (nombre: string) => (
        <Text style={{ fontSize: 12 }} ellipsis={{ tooltip: nombre }}>
          {nombre}
        </Text>
      ),
    },
    {
      title: 'Método',
      dataIndex: 'metodo_pago',
      key: 'metodo_pago',
      width: 110,
      render: (metodo: string) => formatearMetodoPago(metodo),
    },
    {
      title: 'Estado',
      dataIndex: 'estado_pago',
      key: 'estado_pago',
      width: 90,
      render: (estado: string) => formatearEstadoPago(estado),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 100,
      align: 'right',
      render: (total: number) => (
        <Text strong style={{ color: '#52c41a', fontSize: 13 }}>
          ${Number(total).toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => Number(a.total) - Number(b.total),
    },
    {
      title: '',
      key: 'acciones',
      width: 70,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => verDetalleVenta(record)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>📊 Historial de Ventas</Title>
        <Text type="secondary">
          Consulta todas las ventas realizadas desde el punto de venta
        </Text>
      </div>

      {/* Filtros */}
      <Card style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            {/* Filtro de Fechas */}
            <Col xs={24} sm={12} lg={8}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                📅 Rango de Fechas
              </Text>
            <RangePicker 
                style={{ width: '100%' }}
                placeholder={['Fecha Desde', 'Fecha Hasta']}
                format="DD/MM/YYYY"
                value={[fechaDesde, fechaHasta]}
                onChange={handleRangeFechasChange}
              />
            </Col>

            {/* Filtro de Sucursal */}
            <Col xs={24} sm={12} lg={4}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                🏢 Sucursal
              </Text>
            <Select
                style={{ width: '100%' }}
                placeholder="Seleccionar"
                value={sucursalSeleccionada}
                onChange={setSucursalSeleccionada}
                loading={loadingSucursales}
              >
                <Option value="todas">Todas</Option>
                {sucursales.map(suc => (
                  <Option key={suc.sucursal} value={suc.sucursal}>
                    {suc.sucursal.toUpperCase()}
                </Option>
              ))}
            </Select>
            </Col>

            {/* Filtro de Método de Pago */}
            <Col xs={24} sm={12} lg={5}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                💳 Método de Pago
              </Text>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccionar"
                value={metodoPagoSeleccionado}
                onChange={setMetodoPagoSeleccionado}
              >
                <Option value="todos">Todos</Option>
                <Option value="efectivo">Efectivo</Option>
                <Option value="transferencia">Transferencia</Option>
                <Option value="cuenta_corriente">Cuenta Corriente</Option>
              </Select>
            </Col>

            {/* Filtro de Estado */}
            <Col xs={24} sm={12} lg={4}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                ✅ Estado
              </Text>
            <Select
                style={{ width: '100%' }}
                placeholder="Seleccionar"
                value={estadoPagoSeleccionado}
                onChange={setEstadoPagoSeleccionado}
              >
                <Option value="todos">Todos</Option>
                <Option value="pagado">Pagado</Option>
                <Option value="pendiente">Pendiente</Option>
                <Option value="parcial">Parcial</Option>
            </Select>
            </Col>

            {/* Botón Buscar */}
            <Col xs={24} sm={12} lg={3}>
              <Text strong style={{ display: 'block', marginBottom: 8, visibility: 'hidden' }}>
                -
              </Text>
            <Button 
                type="primary"
                icon={<SearchOutlined />}
                onClick={cargarVentas}
                loading={loading}
                style={{ width: '100%' }}
              >
                Buscar
            </Button>
            </Col>
          </Row>

          {/* Botones de Acción */}
          <Row gutter={[16, 16]}>
            <Col>
            <Button 
                icon={<ReloadOutlined />}
                onClick={cargarVentas}
                loading={loading}
              >
                Actualizar
              </Button>
            </Col>
            <Col>
              <Button icon={<FileExcelOutlined />} style={{ color: '#52c41a' }}>
                Exportar Excel
              </Button>
            </Col>
            <Col>
              <Button icon={<FilePdfOutlined />} style={{ color: '#ff4d4f' }}>
                Exportar PDF
            </Button>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Botón SUPER LLAMATIVO de Ventas Globales */}
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '16px',
          border: '3px solid #1890ff',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        }}
        styles={{ body: { padding: '24px' } }}
        onClick={() => navigate('/global-sales')}
        hoverable
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(102, 126, 234, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
        }}
      >
        <Row align="middle" gutter={24}>
          <Col>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
              }}
            >
              <BarChartOutlined
                style={{
                  fontSize: 48,
                  color: '#ffffff',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                }}
              />
            </div>
          </Col>
          <Col flex="auto">
            <Title
              level={3}
              style={{
                margin: '0 0 8px 0',
                color: '#ffffff',
                fontWeight: 700,
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              📊 VENTAS GLOBALES - Historial Diario
            </Title>
            <Text
              style={{
                fontSize: 16,
                color: '#ffffff',
                fontWeight: 500,
                textShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}
            >
              🔥 ¡Consulta el resumen histórico completo! Filtra por fecha, sucursal y descarga reportes
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<RightOutlined />}
              style={{
                height: 56,
                fontSize: 18,
                fontWeight: 600,
                borderRadius: 12,
                background: '#ffffff',
                color: '#667eea',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                padding: '0 32px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
            >
              VER AHORA
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Ventas"
              value={totalVentas}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ingresos Totales"
              value={totalIngresos}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Descuentos Aplicados"
              value={totalDescuentos}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Promedio por Venta"
              value={promedioVenta}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Resumen por Método de Pago */}
      {totalVentas > 0 && (
        <Card style={{ marginBottom: '24px' }} title="📊 Resumen por Método de Pago">
          <Row gutter={[16, 16]}>
            {Object.entries(ventasPorMetodo).map(([metodo, cantidad]) => (
              <Col key={metodo} xs={24} sm={8}>
                <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
                  {formatearMetodoPago(metodo)}
                  <div style={{ marginTop: '8px' }}>
                    <Text strong style={{ fontSize: 18 }}>{cantidad}</Text>
                    <Text type="secondary"> ventas</Text>
                  </div>
                </div>
              </Col>
            ))}
        </Row>
      </Card>
      )}

      {/* Tabla de Ventas */}
      <Card title={`Historial de Ventas (${totalVentas} registros)`}>
        {totalVentas === 0 && !loading && (
          <Alert
            message="No hay ventas para mostrar"
            description="No se encontraron ventas con los filtros aplicados. Intenta cambiar los filtros o realiza ventas desde el punto de venta."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Table
          columns={columns}
          dataSource={ventas}
          rowKey="id"
          loading={loading}
          size="small"
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} ventas`,
          }}
        />
      </Card>

      {/* Modal de Detalle de Venta */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Detalle de Venta - {ventaSeleccionada?.numero_venta}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setVentaSeleccionada(null);
        }}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Cerrar
          </Button>,
        ]}
        width={800}
      >
        {ventaSeleccionada && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Información General */}
            <Card title="Información General" size="small">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="N° Venta">
                  <Text strong>{ventaSeleccionada.numero_venta}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Fecha">
                  {dayjs(ventaSeleccionada.fecha_venta).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Sucursal">
                  {ventaSeleccionada.sucursal.toUpperCase()}
                </Descriptions.Item>
                <Descriptions.Item label="Cliente">
                  {ventaSeleccionada.cliente_nombre}
                </Descriptions.Item>
                <Descriptions.Item label="Vendedor">
                  {ventaSeleccionada.vendedor_nombre}
                </Descriptions.Item>
                <Descriptions.Item label="Método de Pago">
                  {formatearMetodoPago(ventaSeleccionada.metodo_pago)}
                </Descriptions.Item>
                <Descriptions.Item label="Estado">
                  {formatearEstadoPago(ventaSeleccionada.estado_pago)}
                </Descriptions.Item>
                <Descriptions.Item label="Saldo Pendiente">
                  <Text type={Number(ventaSeleccionada.saldo_pendiente) > 0 ? 'danger' : 'success'}>
                    ${Number(ventaSeleccionada.saldo_pendiente).toFixed(2)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Productos */}
            {(ventaSeleccionada as any).productos && (ventaSeleccionada as any).productos.length > 0 && (
              <Card title="Productos" size="small">
                <Table
                  dataSource={(ventaSeleccionada as any).productos}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: 'Producto',
                      dataIndex: 'producto_nombre',
                      key: 'producto_nombre',
                    },
                    {
                      title: 'Cantidad',
                      dataIndex: 'cantidad',
                      key: 'cantidad',
                      align: 'center',
                    },
                    {
                      title: 'Precio Unit.',
                      dataIndex: 'precio_unitario',
                      key: 'precio_unitario',
                      align: 'right',
                      render: (precio: number) => `$${Number(precio).toFixed(2)}`,
                    },
                    {
                      title: 'Subtotal',
                      dataIndex: 'subtotal',
                      key: 'subtotal',
                      align: 'right',
                      render: (subtotal: number) => (
                        <Text strong>${Number(subtotal).toFixed(2)}</Text>
                      ),
                    },
                  ]}
                />
              </Card>
            )}

            {/* Totales */}
            <Card title="Totales" size="small">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Subtotal">
                  ${Number(ventaSeleccionada.subtotal).toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="Descuento">
                  <Text type="success">-${Number(ventaSeleccionada.descuento).toFixed(2)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Total">
                  <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                    ${Number(ventaSeleccionada.total).toFixed(2)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Observaciones */}
            {ventaSeleccionada.observaciones && (
              <Alert
                message="Observaciones"
                description={ventaSeleccionada.observaciones}
                type="info"
                showIcon
              />
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default Sales;
