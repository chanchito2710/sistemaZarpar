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
} from '@ant-design/icons';
import { devolucionesService } from '../../services/api';
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
}

interface StockFalla {
  producto_id: number;
  nombre: string;
  marca: string;
  tipo: string;
  sucursal: string;
  stock_fallas: number;
  stock_actual: number;
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
  const { usuario, esAdmin, sucursalUsuario } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [productosVendidos, setProductosVendidos] = useState<ProductoVendido[]>([]);
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
  
  // Drawer Stock Fallas
  const [drawerFallasVisible, setDrawerFallasVisible] = useState(false);
  const [stockFallas, setStockFallas] = useState<StockFalla[]>([]);
  const [loadingFallas, setLoadingFallas] = useState(false);
  
  // Drawer Saldos a Favor
  const [drawerSaldosVisible, setDrawerSaldosVisible] = useState(false);
  const [saldosFavor, setSaldosFavor] = useState<SaldoFavor[]>([]);
  const [loadingSaldos, setLoadingSaldos] = useState(false);

  useEffect(() => {
    cargarProductosVendidos();
  }, [sucursal, fechaRango]);

  // Recargar stock de fallas cuando cambia la sucursal (solo si el drawer está abierto)
  useEffect(() => {
    if (drawerFallasVisible) {
      cargarStockFallas();
    }
  }, [sucursal]);

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
        procesado_por: usuario?.email,
        fecha_venta: productoSeleccionado.fecha_venta,
      };
      
      await devolucionesService.procesarDevolucion(data);
      
      message.success(
        values.metodo_devolucion === 'cuenta_corriente'
          ? '✅ Devolución procesada - Monto agregado a cuenta corriente'
          : '✅ Devolución procesada - Saldo a favor creado'
      );
      
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

  const cargarStockFallas = async () => {
    setLoadingFallas(true);
    try {
      // Si es admin, usar la sucursal seleccionada; si no, usar la del usuario
      const sucursalFiltro = esAdmin ? sucursal : sucursalUsuario;
      const data = await devolucionesService.obtenerStockFallas(sucursalFiltro);
      setStockFallas(data);
    } catch (error) {
      message.error('Error al cargar stock de fallas');
      console.error(error);
    } finally {
      setLoadingFallas(false);
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

  const abrirDrawerFallas = () => {
    setDrawerFallasVisible(true);
    cargarStockFallas();
  };

  const abrirDrawerSaldos = () => {
    setDrawerSaldosVisible(true);
    cargarSaldosFavor();
  };

  const columns = [
    {
      title: 'Fecha Venta',
      dataIndex: 'fecha_venta',
      key: 'fecha_venta',
      width: 110,
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY'),
      sorter: (a: ProductoVendido, b: ProductoVendido) => 
        new Date(a.fecha_venta).getTime() - new Date(b.fecha_venta).getTime(),
    },
    {
      title: 'N° Venta',
      dataIndex: 'numero_venta',
      key: 'numero_venta',
      width: 140,
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente_nombre',
      key: 'cliente_nombre',
      width: 180,
    },
    {
      title: 'Producto',
      dataIndex: 'nombre_producto',
      key: 'nombre_producto',
      width: 200,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_producto',
      key: 'tipo_producto',
      width: 100,
      render: (tipo: string) => <Tag color="blue">{tipo}</Tag>,
    },
    {
      title: 'Marca',
      dataIndex: 'marca',
      key: 'marca',
      width: 100,
    },
    {
      title: 'Precio',
      dataIndex: 'precio_unitario',
      key: 'precio_unitario',
      width: 100,
      render: (precio: number) => `$${precio.toLocaleString('es-UY')}`,
    },
    {
      title: 'Garantía',
      key: 'garantia',
      width: 120,
      render: (_: any, record: ProductoVendido) => {
        const diasRestantes = 90 - record.dias_desde_venta;
        return record.estado_garantia === 'vigente' ? (
          <Tooltip title={`${diasRestantes} días restantes`}>
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Vigente
            </Tag>
          </Tooltip>
        ) : (
          <Tag color="error" icon={<WarningOutlined />}>
            Vencida
          </Tag>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right' as const,
      width: 180,
      render: (_: any, record: ProductoVendido) => (
        <Space size="small">
          <Tooltip title="Devolver dinero">
            <Button
              type="primary"
              icon={<UndoOutlined />}
              size="small"
              onClick={() => abrirModalDevolucion(record)}
              disabled={record.estado_garantia === 'vencida'}
            >
              Devolver
            </Button>
          </Tooltip>
          <Tooltip title="Reemplazar producto">
            <Button
              type="default"
              icon={<SwapOutlined />}
              size="small"
              onClick={() => abrirModalReemplazo(record)}
              disabled={record.estado_garantia === 'vencida'}
            >
              Reemplazar
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="returns-container">
      <Title level={2}>🔄 Devoluciones y Reemplazos</Title>
      <Text type="secondary">
        Gestión de garantías, devoluciones y stock de fallas
      </Text>

      <Alert
        message="📝 Política de Garantía"
        description="Todos los productos vendidos tienen 90 días de garantía desde la fecha de venta. Después de este período, no se aceptan devoluciones ni reemplazos."
        type="info"
        showIcon
        className="returns-alert"
        style={{ marginTop: '16px' }}
      />

      <Row gutter={[16, 16]} className="returns-statistics">
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
          <Card className="returns-card-clickable" onClick={abrirDrawerFallas}>
            <Statistic
              title="Stock de Fallas"
              value="Ver"
              prefix={<FileExcelOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '18px' }}
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
          <Space>
            {esAdmin && (
              <Select
                value={sucursal}
                onChange={setSucursal}
                style={{ width: 150 }}
              >
                <Option value="todas">Todas las Sucursales</Option>
                <Option value="pando">Pando</Option>
                <Option value="maldonado">Maldonado</Option>
                <Option value="rivera">Rivera</Option>
                {/* Agregar más sucursales dinámicamente */}
              </Select>
            )}
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
          scroll={{ x: 1400 }}
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
                    💰 Saldo a Favor (para futuras compras)
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

      {/* Drawer Stock Fallas */}
      <Drawer
        title="📦 Stock de Fallas - Todos los Productos"
        placement="right"
        width={900}
        open={drawerFallasVisible}
        onClose={() => setDrawerFallasVisible(false)}
      >
        <Alert
          message={esAdmin ? "💡 Información" : `📍 Sucursal: ${(sucursalUsuario || sucursal || '').toUpperCase()}`}
          description={esAdmin 
            ? "Los productos con fallas aparecen primero. Los productos sin fallas (0) se muestran al final de la lista. Cambia la sucursal en el selector principal para ver otras sucursales."
            : "Mostrando todos los productos de tu sucursal. Los productos con fallas aparecen primero."
          }
          type="info"
          showIcon
          className="returns-alert"
        />
        <Table
          dataSource={stockFallas}
          loading={loadingFallas}
          rowKey="producto_id"
          rowClassName={(record) => record.stock_fallas > 0 ? 'row-with-fallas' : ''}
          columns={[
            { 
              title: 'Producto', 
              dataIndex: 'nombre', 
              key: 'nombre', 
              width: 220,
              render: (nombre, record) => (
                <Text strong={record.stock_fallas > 0} type={record.stock_fallas > 0 ? 'danger' : undefined}>
                  {nombre}
                </Text>
              ),
              sorter: (a, b) => (a.nombre || '').localeCompare(b.nombre || ''),
              sortDirections: ['ascend', 'descend'],
            },
            { 
              title: 'Tipo', 
              dataIndex: 'tipo', 
              key: 'tipo', 
              width: 120, 
              render: (tipo) => <Tag color="orange">{tipo}</Tag>,
              sorter: (a, b) => (a.tipo || '').localeCompare(b.tipo || ''),
              sortDirections: ['ascend', 'descend'],
            },
            { 
              title: 'Marca', 
              dataIndex: 'marca', 
              key: 'marca', 
              width: 120,
              sorter: (a, b) => (a.marca || '').localeCompare(b.marca || ''),
              sortDirections: ['ascend', 'descend'],
            },
            { 
              title: 'Sucursal', 
              dataIndex: 'sucursal', 
              key: 'sucursal', 
              width: 100, 
              render: (suc) => <Tag color={esAdmin ? 'blue' : 'default'}>{suc.toUpperCase()}</Tag>,
              sorter: esAdmin ? (a, b) => a.sucursal.localeCompare(b.sucursal) : undefined,
              sortDirections: ['ascend', 'descend'],
            },
            { 
              title: 'Stock Fallas', 
              dataIndex: 'stock_fallas', 
              key: 'stock_fallas', 
              width: 120,
              align: 'center' as const,
              render: (fallas) => {
                if (fallas > 0) {
                  return (
                    <Badge 
                      count={fallas} 
                      style={{ backgroundColor: '#ff4d4f', fontWeight: 'bold', fontSize: '14px' }} 
                      showZero={false}
                    />
                  );
                }
                return <Text type="secondary">0</Text>;
              },
              sorter: (a, b) => (a.stock_fallas || 0) - (b.stock_fallas || 0),
              sortDirections: ['ascend', 'descend'],
              defaultSortOrder: 'descend' as const,
            },
            { 
              title: 'Stock Actual', 
              dataIndex: 'stock_actual', 
              key: 'stock_actual', 
              width: 100,
              align: 'center' as const,
              render: (stock) => <Text>{stock}</Text>,
              sorter: (a, b) => (a.stock_actual || 0) - (b.stock_actual || 0),
              sortDirections: ['ascend', 'descend'],
            },
          ]}
          pagination={{ 
            pageSize: 50,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`,
            showSizeChanger: true,
            pageSizeOptions: ['20', '50', '100', '200']
          }}
        />
      </Drawer>

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
    </div>
  );
};

export default Returns;
