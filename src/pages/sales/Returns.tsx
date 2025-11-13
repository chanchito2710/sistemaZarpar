/**
 * Página de Devoluciones y Reemplazos
 * Maneja garantías, devoluciones y stock de fallas
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  DatePicker,
  Select,
  Tag,
  Modal,
  Form,
  InputNumber,
  Input,
  Radio,
  message,
  Drawer,
  Typography,
  Row,
  Col,
  Statistic,
  Badge,
  Alert,
  Tooltip,
} from 'antd';
import {
  UndoOutlined,
  SwapOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  EyeOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { devolucionesService, vendedoresService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import dayjs, { Dayjs } from 'dayjs';
import './Returns.css';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface ProductoVendido {
  detalle_id: number;
  venta_id: number;
  numero_venta: string;
  sucursal: string;
  cliente_id: number;
  cliente_nombre: string;
  fecha_venta: string;
  metodo_pago: string;
  producto_id: number;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  tipo_producto: string;
  marca: string;
  dias_desde_venta: number;
  estado_garantia: 'vigente' | 'vencida';
  tipo_devolucion?: 'devolucion' | 'reemplazo' | null;
  metodo_devolucion?: 'cuenta_corriente' | 'saldo_favor' | null;
  fecha_devolucion?: string | null;
}

interface SaldoFavor {
  id: number;
  sucursal: string;
  cliente_id: number;
  cliente_nombre: string;
  saldo_actual: number;
  updated_at: string;
}

const Returns: React.FC = () => {
  const { usuario } = useAuth();
  const esAdmin = usuario?.esAdmin || false;
  const sucursalUsuario = usuario?.sucursal?.toLowerCase() || '';
  
  const [loading, setLoading] = useState(false);
  const [productosVendidos, setProductosVendidos] = useState<ProductoVendido[]>([]);
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [sucursal, setSucursal] = useState<string>(esAdmin ? 'todas' : sucursalUsuario);
  const [fechaRango, setFechaRango] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  
  // Modal Devolución
  const [modalDevolucionVisible, setModalDevolucionVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoVendido | null>(null);
  const [formDevolucion] = Form.useForm();
  const [procesandoDevolucion, setProcesandoDevolucion] = useState(false);
  
  // Modal Reemplazo
  const [modalReemplazoVisible, setModalReemplazoVisible] = useState(false);
  const [formReemplazo] = Form.useForm();
  const [procesandoReemplazo, setProcesandoReemplazo] = useState(false);
  
  // Drawer Saldos a Favor
  const [drawerSaldosVisible, setDrawerSaldosVisible] = useState(false);
  const [saldosFavor, setSaldosFavor] = useState<SaldoFavor[]>([]);
  const [loadingSaldos, setLoadingSaldos] = useState(false);

  // Modal Historial de Reemplazos
  const [modalHistorialVisible, setModalHistorialVisible] = useState(false);
  const [productoHistorial, setProductoHistorial] = useState<ProductoVendido | null>(null);
  const [historialReemplazos, setHistorialReemplazos] = useState<any[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Cargar sucursales disponibles al montar el componente
  useEffect(() => {
    const cargarSucursales = async () => {
      try {
        const sucursalesData = await vendedoresService.obtenerSucursales();
        setSucursales(sucursalesData);
      } catch (error) {
        console.error('Error al cargar sucursales:', error);
      }
    };
    cargarSucursales();
  }, []);

  useEffect(() => {
    cargarProductosVendidos();
  }, [sucursal, fechaRango]);


  const cargarProductosVendidos = async () => {
    setLoading(true);
    try {
      const filtros: any = {
        sucursal: sucursal
      };
      
      if (fechaRango && fechaRango[0] && fechaRango[1]) {
        filtros.fecha_desde = fechaRango[0].format('YYYY-MM-DD');
        filtros.fecha_hasta = fechaRango[1].format('YYYY-MM-DD');
      }
      
      const data = await devolucionesService.obtenerProductosVendidos(filtros);
      setProductosVendidos(data);
    } catch (error) {
      message.error('Error al cargar productos vendidos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalDevolucion = (producto: ProductoVendido) => {
    if (producto.estado_garantia === 'vencida') {
      Modal.warning({
        title: '⚠️ Garantía vencida',
        content: `Este producto fue vendido hace ${producto.dias_desde_venta} días. La garantía de 90 días ha expirado.`,
      });
      return;
    }
    
    setProductoSeleccionado(producto);
    formDevolucion.setFieldsValue({
      monto_devuelto: producto.precio_unitario,
      metodo_devolucion: 'cuenta_corriente',
    });
    setModalDevolucionVisible(true);
  };

  const abrirModalReemplazo = (producto: ProductoVendido) => {
    if (producto.estado_garantia === 'vencida') {
      Modal.warning({
        title: '⚠️ Garantía vencida',
        content: `Este producto fue vendido hace ${producto.dias_desde_venta} días. La garantía de 90 días ha expirado.`,
      });
      return;
    }
    
    setProductoSeleccionado(producto);
    formReemplazo.setFieldsValue({
      cantidad: 1,
    });
    setModalReemplazoVisible(true);
  };

  const procesarDevolucion = async (values: any) => {
    if (!productoSeleccionado) return;
    
    setProcesandoDevolucion(true);
    try {
      const data = {
        detalle_id: productoSeleccionado.detalle_id,
        venta_id: productoSeleccionado.venta_id,
        numero_venta: productoSeleccionado.numero_venta,
        sucursal: productoSeleccionado.sucursal,
        producto_id: productoSeleccionado.producto_id,
        producto_nombre: productoSeleccionado.nombre_producto,
        cliente_id: productoSeleccionado.cliente_id,
        cliente_nombre: productoSeleccionado.cliente_nombre,
        metodo_devolucion: values.metodo_devolucion,
        monto_devuelto: values.monto_devuelto,
        observaciones: values.observaciones,
        tipo_stock: values.tipo_stock, // Nuevo campo
        procesado_por: usuario?.email,
        fecha_venta: productoSeleccionado.fecha_venta,
      };
      
      await devolucionesService.procesarDevolucion(data);
      
      // Mensaje personalizado según el tipo de stock
      let mensajeExito = '';
      if (values.metodo_devolucion === 'cuenta_corriente') {
        mensajeExito = '✅ Devolución procesada - Crédito agregado a cuenta corriente del cliente';
      } else {
        mensajeExito = '✅ Devolución procesada - Efectivo devuelto y descontado de caja';
      }
      
      if (values.tipo_stock === 'principal') {
        mensajeExito += ' | Producto devuelto a Stock Principal';
      } else {
        mensajeExito += ' | Producto enviado a Stock de Mermas (Fallas)';
      }
      
      message.success(mensajeExito);
      
      setModalDevolucionVisible(false);
      formDevolucion.resetFields();
      cargarProductosVendidos();
    } catch (error) {
      message.error('Error al procesar devolución');
      console.error(error);
    } finally {
      setProcesandoDevolucion(false);
    }
  };

  const procesarReemplazo = async (values: any) => {
    if (!productoSeleccionado) return;
    
    setProcesandoReemplazo(true);
    try {
      const data = {
        detalle_id: productoSeleccionado.detalle_id,
        venta_id: productoSeleccionado.venta_id,
        numero_venta: productoSeleccionado.numero_venta,
        sucursal: productoSeleccionado.sucursal,
        producto_id: productoSeleccionado.producto_id,
        producto_nombre: productoSeleccionado.nombre_producto,
        cliente_id: productoSeleccionado.cliente_id,
        cliente_nombre: productoSeleccionado.cliente_nombre,
        cantidad: values.cantidad,
        observaciones: values.observaciones,
        procesado_por: usuario?.email,
        fecha_venta: productoSeleccionado.fecha_venta,
      };
      
      await devolucionesService.procesarReemplazo(data);
      
      message.success('✅ Reemplazo procesado - Stock de fallas actualizado');
      
      setModalReemplazoVisible(false);
      formReemplazo.resetFields();
      cargarProductosVendidos();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al procesar reemplazo');
      console.error(error);
    } finally {
      setProcesandoReemplazo(false);
    }
  };

  const cargarSaldosFavor = async () => {
    setLoadingSaldos(true);
    try {
      const data = await devolucionesService.obtenerSaldosFavor(sucursal);
      setSaldosFavor(data);
    } catch (error) {
      message.error('Error al cargar saldos a favor');
      console.error(error);
    } finally {
      setLoadingSaldos(false);
    }
  };

  const abrirDrawerSaldos = () => {
    setDrawerSaldosVisible(true);
    cargarSaldosFavor();
  };

  const cargarHistorialReemplazos = async (detalleId: number) => {
    setLoadingHistorial(true);
    try {
      const data = await devolucionesService.obtenerHistorialReemplazos(detalleId);
      setHistorialReemplazos(data);
    } catch (error) {
      message.error('Error al cargar historial de reemplazos');
      console.error(error);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const abrirModalHistorial = (producto: ProductoVendido) => {
    setProductoHistorial(producto);
    setModalHistorialVisible(true);
    cargarHistorialReemplazos(producto.detalle_id);
  };

  const columns = [
    {
      title: 'Fecha Venta',
      dataIndex: 'fecha_venta',
      key: 'fecha_venta',
      responsive: ['md'] as any,
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY'),
      sorter: (a: ProductoVendido, b: ProductoVendido) => 
        new Date(a.fecha_venta).getTime() - new Date(b.fecha_venta).getTime(),
    },
    {
      title: 'N° Venta',
      dataIndex: 'numero_venta',
      key: 'numero_venta',
      responsive: ['sm'] as any,
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente_nombre',
      key: 'cliente_nombre',
    },
    {
      title: 'Producto',
      dataIndex: 'nombre_producto',
      key: 'nombre_producto',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_producto',
      key: 'tipo_producto',
      responsive: ['lg'] as any,
      render: (tipo: string) => <Tag color="blue">{tipo}</Tag>,
    },
    {
      title: 'Marca',
      dataIndex: 'marca',
      key: 'marca',
      responsive: ['lg'] as any,
    },
    {
      title: 'Precio',
      dataIndex: 'precio_unitario',
      key: 'precio_unitario',
      responsive: ['md'] as any,
      render: (precio: number) => `$${precio.toLocaleString('es-UY')}`,
    },
    {
      title: 'Garantía',
      key: 'garantia',
      render: (_: any, record: ProductoVendido) => {
        const diasRestantes = 90 - record.dias_desde_venta;
        const fueDevuelto = record.tipo_devolucion === 'devolucion';
        const fueReemplazado = record.tipo_devolucion === 'reemplazo';
        
        return (
          <Space direction="vertical" size={2}>
            {record.estado_garantia === 'vigente' ? (
              <Tooltip title={`${diasRestantes} días restantes`}>
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Vigente
                </Tag>
              </Tooltip>
            ) : (
              <Tag color="error" icon={<WarningOutlined />}>
                Vencida
              </Tag>
            )}
            
            {fueDevuelto && (
              <Tag color={record.metodo_devolucion === 'cuenta_corriente' ? 'blue' : 'orange'} style={{ fontSize: 10, marginTop: 4 }}>
                {record.metodo_devolucion === 'cuenta_corriente' 
                  ? `💳 Devuelto en C.C. (${new Date(record.fecha_devolucion).toLocaleDateString('es-UY')})` 
                  : `💰 Devuelto en efectivo (${new Date(record.fecha_devolucion).toLocaleDateString('es-UY')})`}
              </Tag>
            )}
            
            {fueReemplazado && (
              <Tag 
                color="purple" 
                icon={<EyeOutlined />}
                style={{ fontSize: 10, marginTop: 4, cursor: 'pointer' }}
                onClick={() => abrirModalHistorial(record)}
              >
                Producto reemplazado
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: ProductoVendido) => {
        const fueDevuelto = record.tipo_devolucion === 'devolucion';
        const fueReemplazado = record.tipo_devolucion === 'reemplazo';
        
        // Botón "Devolver" se deshabilita si: garantía vencida O fue devuelto
        const devolverDeshabilitado = record.estado_garantia === 'vencida' || fueDevuelto;
        
        // Botón "Reemplazar" se deshabilita si: garantía vencida O fue devuelto
        // Los productos pueden reemplazarse múltiples veces mientras esté vigente la garantía, pero NO si fue devuelto
        const reemplazarDeshabilitado = record.estado_garantia === 'vencida' || fueDevuelto;
        
        return (
          <Space size="small">
            <Tooltip title={
              fueDevuelto 
                ? "Este producto ya fue devuelto" 
                : record.estado_garantia === 'vencida' 
                  ? "Garantía vencida" 
                  : "Devolver dinero"
            }>
              <Button
                type="primary"
                icon={<UndoOutlined />}
                size="small"
                onClick={() => abrirModalDevolucion(record)}
                disabled={devolverDeshabilitado}
              >
                Devolver
              </Button>
            </Tooltip>
            <Tooltip title={
              record.estado_garantia === 'vencida' 
                ? "Garantía vencida" 
                : fueDevuelto
                  ? "No se puede reemplazar un producto ya devuelto"
                  : fueReemplazado 
                    ? "Producto ya reemplazado - Puede reemplazarse nuevamente mientras esté vigente la garantía"
                    : "Reemplazar producto"
            }>
              <Button
                type="default"
                icon={<SwapOutlined />}
                size="small"
                onClick={() => abrirModalReemplazo(record)}
                disabled={reemplazarDeshabilitado}
              >
                Reemplazar
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="returns-container">
      <div style={{ marginBottom: '12px' }}>
        <Title level={3} style={{ marginBottom: '4px' }}>🔄 Devoluciones y Reemplazos</Title>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Gestión de garantías, devoluciones y stock de fallas
        </Text>
      </div>

      <Alert
        message="📝 Política de Garantía"
        description="Todos los productos vendidos tienen 90 días de garantía desde la fecha de venta. Después de este período, no se aceptan devoluciones ni reemplazos."
        type="info"
        showIcon
        className="returns-alert"
      />

      <Row gutter={[12, 12]} className="returns-statistics">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Productos con Garantía"
              value={productosVendidos.filter(p => p.estado_garantia === 'vigente').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Garantías Vencidas"
              value={productosVendidos.filter(p => p.estado_garantia === 'vencida').length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="returns-card-clickable" onClick={abrirDrawerSaldos}>
            <Statistic
              title="Saldos a Favor"
              value="Ver"
              prefix={<FileExcelOutlined />}
              valueStyle={{ color: '#faad14', fontSize: '18px' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Productos Vendidos"
        extra={
          <Space wrap>
            <Select
              value={sucursal}
              onChange={setSucursal}
              style={{ width: 150 }}
              disabled={!esAdmin}
              placeholder="Sucursal"
            >
              {esAdmin && <Option value="todas">Todas</Option>}
              {sucursales.map(suc => (
                <Option key={suc} value={suc}>
                  {suc.toUpperCase()}
                </Option>
              ))}
            </Select>
            <RangePicker
              value={fechaRango}
              onChange={(dates) => setFechaRango(dates)}
              format="DD/MM/YYYY"
              placeholder={['Desde', 'Hasta']}
              style={{ width: 250 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={cargarProductosVendidos}
              loading={loading}
            >
              Actualizar
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={productosVendidos}
          rowKey="detalle_id"
          loading={loading}
          pagination={{
            pageSize: 50,
            showTotal: (total) => `Total: ${total} productos`,
            showSizeChanger: true,
            pageSizeOptions: ['20', '50', '100'],
          }}
        />
      </Card>

      {/* Modal Devolución */}
      <Modal
        title="💸 Procesar Devolución"
        open={modalDevolucionVisible}
        onCancel={() => setModalDevolucionVisible(false)}
        footer={null}
        width={600}
      >
        {productoSeleccionado && (
          <>
            <Alert
              message="Información del Producto"
              description={
                <div>
                  <p><strong>Producto:</strong> {productoSeleccionado.nombre_producto}</p>
                  <p><strong>Cliente:</strong> {productoSeleccionado.cliente_nombre}</p>
                  <p><strong>Venta:</strong> {productoSeleccionado.numero_venta}</p>
                  <p><strong>Precio:</strong> ${productoSeleccionado.precio_unitario.toLocaleString('es-UY')}</p>
                </div>
              }
              type="info"
              showIcon
              className="returns-modal-alert"
            />

            <Form
              form={formDevolucion}
              layout="vertical"
              onFinish={procesarDevolucion}
            >
              <Form.Item
                label="Método de Devolución"
                name="metodo_devolucion"
                rules={[{ required: true, message: 'Selecciona el método' }]}
              >
                <Radio.Group>
                  <Radio value="cuenta_corriente">
                    💳 A Cuenta Corriente (si existe)
                  </Radio>
                  <Radio value="saldo_favor">
                    💰 Devolver efectivo
                  </Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="Monto a Devolver"
                name="monto_devuelto"
                rules={[{ required: true, message: 'Ingresa el monto' }]}
              >
                <InputNumber
                  min={0}
                  max={productoSeleccionado.precio_unitario}
                  style={{ width: '100%' }}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>

              <Form.Item
                label="Observaciones"
                name="observaciones"
              >
                <TextArea rows={3} placeholder="Motivo de la devolución (opcional)" />
              </Form.Item>

              <Form.Item
                label="📦 Destino del Producto Devuelto"
                name="tipo_stock"
                rules={[{ required: true, message: 'Selecciona el destino del producto' }]}
              >
                <Radio.Group style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio 
                      value="principal" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '12px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '8px',
                        marginBottom: '8px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#52c41a' }}>
                          ✅ Devolver a Stock Principal
                        </div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          El producto está en buen estado y puede revenderse
                        </div>
                      </div>
                    </Radio>
                    <Radio 
                      value="mermas" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '12px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '8px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                          ❌ Enviar a Stock de Mermas (Fallas)
                        </div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          El producto tiene defectos o daños y no puede revenderse
                        </div>
                      </div>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button onClick={() => setModalDevolucionVisible(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={procesandoDevolucion}
                    icon={<UndoOutlined />}
                  >
                    Procesar Devolución
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* Modal Reemplazo */}
      <Modal
        title="🔄 Procesar Reemplazo"
        open={modalReemplazoVisible}
        onCancel={() => setModalReemplazoVisible(false)}
        footer={null}
        width={600}
      >
        {productoSeleccionado && (
          <>
            <Alert
              message="Información del Producto"
              description={
                <div>
                  <p><strong>Producto:</strong> {productoSeleccionado.nombre_producto}</p>
                  <p><strong>Cliente:</strong> {productoSeleccionado.cliente_nombre}</p>
                  <p><strong>Venta:</strong> {productoSeleccionado.numero_venta}</p>
                  <p><strong>Sucursal:</strong> {productoSeleccionado.sucursal.toUpperCase()}</p>
                </div>
              }
              type="warning"
              showIcon
              className="returns-modal-alert"
            />

            <Alert
              message="⚠️ Importante"
              description="El reemplazo descontará del stock actual y sumará al stock de fallas."
              type="info"
              showIcon
              className="returns-modal-alert"
            />

            <Form
              form={formReemplazo}
              layout="vertical"
              onFinish={procesarReemplazo}
            >
              <Form.Item
                label="Cantidad a Reemplazar"
                name="cantidad"
                rules={[{ required: true, message: 'Ingresa la cantidad' }]}
              >
                <InputNumber
                  min={1}
                  max={productoSeleccionado.cantidad}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="Observaciones"
                name="observaciones"
              >
                <TextArea rows={3} placeholder="Motivo del reemplazo (opcional)" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button onClick={() => setModalReemplazoVisible(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={procesandoReemplazo}
                    icon={<SwapOutlined />}
                  >
                    Procesar Reemplazo
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* Drawer Saldos a Favor */}
      <Drawer
        title="💰 Saldos a Favor de Clientes"
        placement="right"
        width={720}
        open={drawerSaldosVisible}
        onClose={() => setDrawerSaldosVisible(false)}
      >
        <Table
          dataSource={saldosFavor}
          loading={loadingSaldos}
          rowKey="id"
          columns={[
            { title: 'Cliente', dataIndex: 'cliente_nombre', key: 'cliente_nombre', width: 250 },
            { title: 'Sucursal', dataIndex: 'sucursal', key: 'sucursal', width: 100, render: (suc) => suc.toUpperCase() },
            { 
              title: 'Saldo a Favor', 
              dataIndex: 'saldo_actual', 
              key: 'saldo_actual', 
              width: 150,
              render: (saldo) => <Text strong style={{ color: '#52c41a' }}>${saldo.toLocaleString('es-UY')}</Text>
            },
            {
              title: 'Última Actualización',
              dataIndex: 'updated_at',
              key: 'updated_at',
              width: 150,
              render: (fecha) => dayjs(fecha).format('DD/MM/YYYY HH:mm')
            },
          ]}
          pagination={{ pageSize: 20 }}
        />
      </Drawer>

      {/* Modal: Historial de Reemplazos */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: '#722ed1' }} />
            <span>📜 Historial de Reemplazos</span>
          </Space>
        }
        open={modalHistorialVisible}
        onCancel={() => {
          setModalHistorialVisible(false);
          setProductoHistorial(null);
          setHistorialReemplazos([]);
        }}
        footer={[
          <Button key="close" onClick={() => setModalHistorialVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {productoHistorial && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Info del Producto */}
            <Card size="small">
              <Space direction="vertical" size={4}>
                <Text strong style={{ fontSize: 16 }}>
                  {productoHistorial.nombre_producto}
                </Text>
                <Space size="large">
                  <Text type="secondary">
                    <strong>Cliente:</strong> {productoHistorial.cliente_nombre}
                  </Text>
                  <Text type="secondary">
                    <strong>Venta:</strong> {productoHistorial.numero_venta}
                  </Text>
                  <Text type="secondary">
                    <strong>Sucursal:</strong> {productoHistorial.sucursal.toUpperCase()}
                  </Text>
                </Space>
              </Space>
            </Card>

            {/* Tabla de Historial */}
            <Table
              dataSource={historialReemplazos}
              loading={loadingHistorial}
              rowKey="id"
              pagination={false}
              size="middle"
              locale={{
                emptyText: 'No hay reemplazos registrados para este producto'
              }}
              columns={[
                {
                  title: '#',
                  key: 'numero',
                  width: 60,
                  align: 'center' as const,
                  render: (_: any, __: any, index: number) => (
                    <Tag color="purple" style={{ fontSize: 14, padding: '4px 12px' }}>
                      {historialReemplazos.length - index}
                    </Tag>
                  )
                },
                {
                  title: 'FECHA',
                  dataIndex: 'fecha_proceso',
                  key: 'fecha_proceso',
                  width: 180,
                  render: (fecha: string) => (
                    <Space>
                      <CalendarOutlined style={{ color: '#722ed1', fontSize: 16 }} />
                      <Text strong>{dayjs(fecha).format('DD/MM/YYYY HH:mm')}</Text>
                    </Space>
                  )
                },
                {
                  title: 'CANTIDAD',
                  dataIndex: 'cantidad_reemplazada',
                  key: 'cantidad_reemplazada',
                  width: 120,
                  align: 'center' as const,
                  render: (cantidad: number) => (
                    <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                      {cantidad} {cantidad === 1 ? 'unidad' : 'unidades'}
                    </Tag>
                  )
                },
                {
                  title: 'PROCESADO POR',
                  dataIndex: 'procesado_por',
                  key: 'procesado_por',
                  render: (email: string) => (
                    <Space>
                      <UserOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                      <Text>{email || 'Sistema'}</Text>
                    </Space>
                  )
                },
                {
                  title: 'OBSERVACIONES',
                  dataIndex: 'observaciones',
                  key: 'observaciones',
                  ellipsis: true,
                  render: (obs: string) => (
                    obs ? (
                      <Tooltip title={obs}>
                        <Text type="secondary" italic>{obs}</Text>
                      </Tooltip>
                    ) : (
                      <Text type="secondary" style={{ opacity: 0.5 }}>—</Text>
                    )
                  )
                }
              ]}
            />

            {/* Resumen */}
            {historialReemplazos.length > 0 && (
              <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <Space>
                  <InfoCircleOutlined style={{ color: '#52c41a' }} />
                  <Text>
                    Este producto ha sido reemplazado <Text strong>{historialReemplazos.length}</Text> {historialReemplazos.length === 1 ? 'vez' : 'veces'}
                  </Text>
                </Space>
              </Card>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default Returns;
