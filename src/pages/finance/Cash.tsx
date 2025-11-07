/**
 * Página de Gestión de Caja
 * Muestra el efectivo recaudado y permite envíos de dinero
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  Tag,
  DatePicker,
  Space,
  Alert,
  Spin,
  message as antMessage,
  Tooltip,
  Typography,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DollarOutlined,
  SendOutlined,
  EditOutlined,
  HistoryOutlined,
  FilterOutlined,
  ClearOutlined,
  ShopOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
  ToolOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { cajaService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

interface Caja {
  id: number;
  sucursal: string;
  monto_actual: number;
  updated_at: string;
  ultimos_movimientos?: UltimoMovimiento[];
}

interface UltimoMovimiento {
  id: number;
  tipo_movimiento: string;
  monto: number;
  concepto: string;
  created_at: string;
}

interface Movimiento {
  id: number;
  sucursal: string;
  tipo_movimiento: string;
  tipo_movimiento_texto: string;
  monto: number;
  monto_anterior: number;
  monto_nuevo: number;
  concepto: string;
  numero_venta?: string;
  usuario_email?: string;
  created_at: string;
}

const Cash: React.FC = () => {
  const { usuario } = useAuth();
  const esAdmin = usuario?.esAdmin || false;
  
  // Estado para el modal de detalle de movimiento
  const [modalDetalleMovVisible, setModalDetalleMovVisible] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<Movimiento | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  
  // Función para extraer sucursal del email
  const obtenerSucursalDelUsuario = (): string | null => {
    if (!usuario?.email) return null;
    
    const email = usuario.email.toLowerCase();
    
    // Mapeo de emails a sucursales
    if (email.startsWith('pando@')) return 'pando';
    if (email.startsWith('maldonado@')) return 'maldonado';
    if (email.startsWith('rivera@')) return 'rivera';
    if (email.startsWith('melo@')) return 'melo';
    if (email.startsWith('paysandu@')) return 'paysandu';
    if (email.startsWith('salto@')) return 'salto';
    if (email.startsWith('tacuarembo@')) return 'tacuarembo';
    if (email.startsWith('rionegro@')) return 'rionegro';
    if (email.startsWith('soriano@')) return 'soriano';
    if (email.startsWith('sanisidro@')) return 'sanisidro';
    
    return null;
  };
  
  const sucursalUsuario = obtenerSucursalDelUsuario();
  
  // Estados
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalEnvioVisible, setModalEnvioVisible] = useState(false);
  const [modalAjusteVisible, setModalAjusteVisible] = useState(false);
  const [modalHistorialVisible, setModalHistorialVisible] = useState(false);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('');
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  
  // Filtros historial
  const [filtroFechas, setFiltroFechas] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [filtroSucursal, setFiltroSucursal] = useState<string>('todas');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  
  // Formularios
  const [formEnvio] = Form.useForm();
  const [formAjuste] = Form.useForm();

  // Cargar cajas al montar
  useEffect(() => {
    cargarCajas();
  }, []);
  
  // Establecer filtro de sucursal automáticamente para usuarios no-admin
  useEffect(() => {
    if (!esAdmin && sucursalUsuario && cajas.length > 0) {
      setFiltroSucursal(sucursalUsuario);
    }
  }, [esAdmin, sucursalUsuario, cajas]);

  const cargarCajas = async () => {
    try {
      setLoading(true);
      const data = await cajaService.obtenerTodasLasCajas();
      
      // Si no es admin, filtrar solo su sucursal
      if (!esAdmin && sucursalUsuario) {
        const cajasFiltradas = data.filter(
          caja => caja.sucursal.toLowerCase() === sucursalUsuario.toLowerCase()
        );
        setCajas(cajasFiltradas);
      } else {
        // Admin ve todas las cajas
        setCajas(data);
      }
    } catch (error) {
      console.error('Error al cargar cajas:', error);
      antMessage.error('Error al cargar información de cajas');
    } finally {
      setLoading(false);
    }
  };

  const cargarMovimientos = async () => {
    try {
      setLoadingMovimientos(true);
      
      const filtros: any = {};
      
      if (filtroFechas && filtroFechas.length === 2) {
        filtros.fecha_desde = filtroFechas[0].format('YYYY-MM-DD');
        filtros.fecha_hasta = filtroFechas[1].format('YYYY-MM-DD');
      }
      
      if (filtroSucursal && filtroSucursal !== 'todas') {
        filtros.sucursal = filtroSucursal;
      }
      
      if (filtroTipo && filtroTipo !== 'todos') {
        filtros.tipo_movimiento = filtroTipo;
      }
      
      const data = await cajaService.obtenerMovimientos(filtros);
      setMovimientos(data);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      antMessage.error('Error al cargar historial de movimientos');
    } finally {
      setLoadingMovimientos(false);
    }
  };

  /**
   * Cargar detalle completo de un movimiento
   */
  const verDetalleMovimiento = async (movimientoId: number, sucursal: string) => {
    try {
      setLoadingDetalle(true);
      setModalDetalleMovVisible(true);
      
      // Obtener todos los movimientos de esa sucursal y buscar el específico
      const filtros = { sucursal };
      const data = await cajaService.obtenerMovimientos(filtros);
      
      const movimiento = data.find((m: Movimiento) => m.id === movimientoId);
      
      if (movimiento) {
        setMovimientoSeleccionado(movimiento);
      } else {
        antMessage.error('No se pudo cargar el detalle del movimiento');
        setModalDetalleMovVisible(false);
      }
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      antMessage.error('Error al cargar detalle del movimiento');
      setModalDetalleMovVisible(false);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleEnviarDinero = async (values: any) => {
    try {
      await cajaService.registrarEnvio({
        sucursal: values.sucursal,
        monto: values.monto,
        concepto: values.concepto,
        usuario_id: usuario?.id || 0,
        usuario_email: usuario?.email || '',
      });
      
      antMessage.success('💸 Envío registrado exitosamente');
      setModalEnvioVisible(false);
      formEnvio.resetFields();
      cargarCajas();
    } catch (error: any) {
      console.error('Error al enviar dinero:', error);
      antMessage.error(error.response?.data?.message || 'Error al registrar envío');
    }
  };

  const handleAjustarCaja = async (values: any) => {
    try {
      await cajaService.ajustarCaja(sucursalSeleccionada, {
        monto_nuevo: values.monto_nuevo,
        concepto: values.concepto,
        usuario_id: usuario?.id || 0,
        usuario_email: usuario?.email || '',
      });
      
      antMessage.success('✅ Caja ajustada exitosamente');
      setModalAjusteVisible(false);
      formAjuste.resetFields();
      setSucursalSeleccionada('');
      cargarCajas();
    } catch (error: any) {
      console.error('Error al ajustar caja:', error);
      antMessage.error(error.response?.data?.message || 'Error al ajustar caja');
    }
  };

  const abrirModalEnvio = () => {
    // Pre-seleccionar sucursal del usuario si no es admin
    if (!esAdmin && sucursalUsuario) {
      formEnvio.setFieldsValue({
        sucursal: sucursalUsuario,
      });
    }
    setModalEnvioVisible(true);
  };

  const abrirModalAjuste = (caja: Caja) => {
    setSucursalSeleccionada(caja.sucursal);
    formAjuste.setFieldsValue({
      monto_nuevo: caja.monto_actual,
      concepto: '',
    });
    setModalAjusteVisible(true);
  };

  const abrirModalHistorial = () => {
    setModalHistorialVisible(true);
    cargarMovimientos();
  };

  const limpiarFiltros = () => {
    setFiltroFechas([dayjs().startOf('month'), dayjs().endOf('month')]);
    setFiltroSucursal('todas');
    setFiltroTipo('todos');
  };
  
  // Función para obtener configuración de tipo de movimiento
  const getTipoMovimientoConfig = (tipo: string): { color: string; icon: React.ReactNode; texto: string } => {
    const config: Record<string, { color: string; icon: React.ReactNode; texto: string }> = {
      ingreso_venta: { 
        color: '#52c41a', 
        icon: <ArrowUpOutlined />, 
        texto: 'Ingreso por Venta' 
      },
      ingreso_cuenta_corriente: { 
        color: '#1890ff', 
        icon: <ArrowUpOutlined />, 
        texto: 'Ingreso por Pago CC' 
      },
      envio: { 
        color: '#fa8c16', 
        icon: <ArrowDownOutlined />, 
        texto: 'Envío de Dinero' 
      },
      gasto: { 
        color: '#f5222d', 
        icon: <ArrowDownOutlined />, 
        texto: 'Gasto en Efectivo' 
      },
      ajuste_manual: { 
        color: '#722ed1', 
        icon: <ToolOutlined />, 
        texto: 'Ajuste Manual' 
      },
      pago_comision: { 
        color: '#ff4d4f', 
        icon: <SwapOutlined />, 
        texto: 'Pago de Comisión' 
      },
    };
    
    return config[tipo] || { 
      color: '#8c8c8c', 
      icon: <SwapOutlined />, 
      texto: 'Movimiento' 
    };
  };

  // Columnas de la tabla de movimientos
  const columnsMovimientos: ColumnsType<Movimiento> = [
    {
      title: 'FECHA',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'SUCURSAL',
      dataIndex: 'sucursal',
      key: 'sucursal',
      width: 120,
      render: (sucursal: string) => (
        <Tag color="blue" icon={<ShopOutlined />}>
          {sucursal.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'TIPO',
      dataIndex: 'tipo_movimiento',
      key: 'tipo_movimiento',
      width: 180,
      render: (tipo: string, record: Movimiento) => {
        const config: Record<string, { color: string; icon: React.ReactNode }> = {
          ingreso_venta: { color: 'green', icon: <ArrowUpOutlined /> },
          ingreso_cuenta_corriente: { color: 'cyan', icon: <ArrowUpOutlined /> },
          envio: { color: 'orange', icon: <ArrowDownOutlined /> },
          ajuste_manual: { color: 'purple', icon: <ToolOutlined /> },
        };
        
        const { color, icon } = config[tipo] || { color: 'default', icon: <SwapOutlined /> };
        
        return (
          <Tag color={color} icon={icon}>
            {record.tipo_movimiento_texto}
          </Tag>
        );
      },
    },
    {
      title: 'CONCEPTO',
      dataIndex: 'concepto',
      key: 'concepto',
      ellipsis: true,
    },
    {
      title: 'MONTO',
      dataIndex: 'monto',
      key: 'monto',
      width: 120,
      align: 'right',
      render: (monto: number) => (
        <Text strong style={{ color: monto > 0 ? '#52c41a' : '#ff4d4f' }}>
          {monto > 0 ? '+' : ''}${Number(monto).toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => Number(a.monto) - Number(b.monto),
    },
    {
      title: 'SALDO NUEVO',
      dataIndex: 'monto_nuevo',
      key: 'monto_nuevo',
      width: 120,
      align: 'right',
      render: (monto: number) => (
        <Text strong>${Number(monto).toFixed(2)}</Text>
      ),
    },
    {
      title: 'USUARIO',
      dataIndex: 'usuario_email',
      key: 'usuario_email',
      width: 150,
      ellipsis: true,
      render: (email: string) => email || 'Sistema',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '24px' }}>
        <Col flex="auto">
          <Title level={2} style={{ margin: 0 }}>
            🏦 Gestión de Caja
        </Title>
        <Text type="secondary">
            Control de efectivo por sucursal
        </Text>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={abrirModalEnvio}
              size="large"
            >
              Enviar Dinero
            </Button>
            <Button
              icon={<HistoryOutlined />}
              onClick={abrirModalHistorial}
              size="large"
            >
              Historial
            </Button>
            <Tooltip title="Actualizar">
              <Button
                icon={<ReloadOutlined />}
                onClick={cargarCajas}
                loading={loading}
                size="large"
              />
            </Tooltip>
          </Space>
        </Col>
      </Row>

      {/* Alerta informativa */}
      <Alert
        message="💡 Información"
        description="Los ingresos de efectivo desde ventas POS y pagos de cuenta corriente se registran automáticamente."
        type="info"
        showIcon
        closable
        style={{ marginBottom: '24px' }}
      />

      {/* Grid de cajas por sucursal */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: '#666' }}>Cargando cajas...</div>
        </div>
      ) : (
        <Row gutter={[16, 16]} justify={cajas.length === 1 ? 'center' : 'start'}>
          {cajas.map((caja) => (
            <Col 
              key={caja.id} 
              xs={24} 
              sm={cajas.length === 1 ? 24 : 12} 
              md={cajas.length === 1 ? 16 : 8} 
              lg={cajas.length === 1 ? 12 : 6} 
              xl={cajas.length === 1 ? 8 : 4}
            >
              <Card
                hoverable
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                styles={{
                  body: {
                    padding: cajas.length === 1 ? '40px' : '20px',
                  },
                }}
              >
                <Space 
                  direction="vertical" 
                  size={cajas.length === 1 ? 'large' : 'small'} 
                  style={{ width: '100%' }}
                >
                  <Tag 
                    color="blue" 
                    icon={<ShopOutlined />} 
                    style={{ 
                      margin: 0,
                      fontSize: cajas.length === 1 ? '18px' : '12px',
                      padding: cajas.length === 1 ? '8px 16px' : '4px 8px',
                    }}
                  >
                    {caja.sucursal.toUpperCase()}
                  </Tag>
                  
                  <Statistic
                    value={caja.monto_actual}
                    precision={2}
                    prefix={<DollarOutlined />}
                    valueStyle={{
                      fontSize: cajas.length === 1 ? '48px' : '24px',
                      fontWeight: 'bold',
                      color: Number(caja.monto_actual) > 0 ? '#52c41a' : '#8c8c8c',
                    }}
                  />
                  
                  <Text 
                    type="secondary" 
                    style={{ fontSize: cajas.length === 1 ? '14px' : '11px' }}
                  >
                    Actualizado: {dayjs(caja.updated_at).format('DD/MM HH:mm')}
                  </Text>
                  
                  {/* Últimos 3 movimientos */}
                  {caja.ultimos_movimientos && caja.ultimos_movimientos.length > 0 && (
                    <div style={{ 
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #f0f0f0',
                    }}>
                      <Text 
                        strong 
                        style={{ 
                          fontSize: '11px', 
                          color: '#8c8c8c',
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        📋 Últimos 3 movimientos:
                      </Text>
                      
                      {caja.ultimos_movimientos.map((mov, index) => {
                        const config = getTipoMovimientoConfig(mov.tipo_movimiento);
                        return (
                          <div 
                            key={mov.id}
                            style={{
                              marginBottom: index < caja.ultimos_movimientos!.length - 1 ? '8px' : 0,
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span style={{ color: config.color }}>
                              {config.icon}
                            </span>
                            <Text 
                              style={{ 
                                fontSize: '11px',
                                color: mov.monto > 0 ? '#52c41a' : '#ff4d4f',
                                fontWeight: 500,
                                minWidth: '60px',
                              }}
                            >
                              {mov.monto > 0 ? '+' : ''}${Math.abs(mov.monto).toFixed(0)}
                            </Text>
                            <Tooltip title={mov.concepto}>
                              <Text 
                                ellipsis 
                                style={{ 
                                  fontSize: '10px',
                                  color: '#595959',
                                  flex: 1,
                                }}
                              >
                                {mov.concepto.length > 25 
                                  ? `${mov.concepto.substring(0, 25)}...` 
                                  : mov.concepto}
                              </Text>
                            </Tooltip>
                            <Button
                              type="link"
                              size="small"
                              onClick={() => verDetalleMovimiento(mov.id, caja.sucursal)}
                              style={{ 
                                padding: '0 4px',
                                height: 'auto',
                                fontSize: '10px',
                                minWidth: 'auto',
                              }}
                            >
                              Ver
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {esAdmin && (
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => abrirModalAjuste(caja)}
                      size={cajas.length === 1 ? 'middle' : 'small'}
                      style={{ 
                        padding: 0, 
                        height: 'auto',
                        fontSize: cajas.length === 1 ? '16px' : '14px',
                        marginTop: '8px',
                      }}
                    >
                      Ajustar
                    </Button>
                  )}
                  </Space>
                </Card>
              </Col>
          ))}
        </Row>
      )}

      {/* Modal de Envío de Dinero */}
      <Modal
        title={<Space><SendOutlined /> Enviar Dinero</Space>}
        open={modalEnvioVisible}
        onOk={() => formEnvio.submit()}
        onCancel={() => {
          setModalEnvioVisible(false);
          formEnvio.resetFields();
        }}
        okText="Enviar"
        cancelText="Cancelar"
        width={500}
      >
        <Form
          form={formEnvio}
          layout="vertical"
          onFinish={handleEnviarDinero}
        >
          <Form.Item
            name="sucursal"
            label="Sucursal"
            rules={[{ required: true, message: 'Selecciona una sucursal' }]}
          >
            <Select
              placeholder="Selecciona sucursal"
              disabled={!esAdmin}
            >
              {cajas.map((c) => (
                <Option key={c.sucursal} value={c.sucursal}>
                  {c.sucursal.toUpperCase()} - Disponible: ${Number(c.monto_actual).toFixed(2)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="monto"
            label="Monto a Enviar"
            rules={[
              { required: true, message: 'Ingresa el monto' },
              { type: 'number', min: 0.01, message: 'El monto debe ser mayor a 0' },
            ]}
          >
            <InputNumber
              prefix={<DollarOutlined />}
              placeholder="0.00"
              style={{ width: '100%' }}
              precision={2}
              step={100}
            />
          </Form.Item>

          <Form.Item
            name="concepto"
            label="Concepto"
            rules={[{ required: true, message: 'Describe el concepto del envío' }]}
          >
            <TextArea
              placeholder="Ej: Envío a banco, pago de proveedor, etc."
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Ajuste Manual (Solo Admin) */}
      <Modal
        title={<Space><ToolOutlined /> Ajustar Caja - {sucursalSeleccionada.toUpperCase()}</Space>}
        open={modalAjusteVisible}
        onOk={() => formAjuste.submit()}
        onCancel={() => {
          setModalAjusteVisible(false);
          formAjuste.resetFields();
          setSucursalSeleccionada('');
        }}
        okText="Guardar"
        cancelText="Cancelar"
        width={500}
      >
        <Alert
          message="⚠️ Ajuste Manual de Caja"
          description="Este ajuste modificará directamente el saldo de la caja. Úsalo solo para correcciones o ajustes necesarios."
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        
        <Form
          form={formAjuste}
          layout="vertical"
          onFinish={handleAjustarCaja}
        >
          <Form.Item
            name="monto_nuevo"
            label="Nuevo Monto"
            rules={[
              { required: true, message: 'Ingresa el nuevo monto' },
              { type: 'number', min: 0, message: 'El monto no puede ser negativo' },
            ]}
          >
            <InputNumber
              prefix={<DollarOutlined />}
              placeholder="0.00"
              style={{ width: '100%' }}
              precision={2}
              step={100}
            />
          </Form.Item>

          <Form.Item
            name="concepto"
            label="Concepto / Motivo"
            rules={[{ required: true, message: 'Describe el motivo del ajuste' }]}
          >
            <TextArea
              placeholder="Ej: Corrección de error, ajuste de inventario, etc."
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Historial */}
      <Modal
        title={<Space><HistoryOutlined /> Historial de Movimientos</Space>}
        open={modalHistorialVisible}
        onOk={() => setModalHistorialVisible(false)}
        onCancel={() => setModalHistorialVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalHistorialVisible(false)}>
            Cerrar
          </Button>,
        ]}
        width={1200}
        styles={{
          body: {
            maxHeight: '70vh',
            overflowY: 'auto',
          },
        }}
      >
      {/* Filtros */}
        <Card size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
              <Text strong>Rango de Fechas:</Text>
              <RangePicker
                value={filtroFechas}
                onChange={(dates) => setFiltroFechas(dates)}
                format="DD/MM/YYYY"
                style={{ width: '100%', marginTop: '4px' }}
              />
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Text strong>Sucursal:</Text>
              <Select
                value={filtroSucursal}
                onChange={setFiltroSucursal}
                style={{ width: '100%', marginTop: '4px' }}
                disabled={!esAdmin} // Solo admin puede cambiar
              >
                {esAdmin && <Option value="todas">Todas las Sucursales</Option>}
                {cajas.map((c) => (
                  <Option key={c.sucursal} value={c.sucursal}>
                    {c.sucursal.toUpperCase()}
                  </Option>
                ))}
              </Select>
          </Col>
            
          <Col xs={24} sm={12} md={8}>
              <Text strong>Tipo de Movimiento:</Text>
              <Select
                value={filtroTipo}
                onChange={setFiltroTipo}
                style={{ width: '100%', marginTop: '4px' }}
              >
                <Option value="todos">Todos</Option>
                <Option value="ingreso_venta">Ingreso por Venta</Option>
                <Option value="ingreso_cuenta_corriente">Ingreso por Pago CC</Option>
                <Option value="envio">Envío</Option>
                <Option value="ajuste_manual">Ajuste Manual</Option>
              </Select>
          </Col>
        </Row>
          
          <Divider style={{ margin: '12px 0' }} />
          
          <Space>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={cargarMovimientos}
              loading={loadingMovimientos}
            >
              Buscar
            </Button>
            <Button icon={<ClearOutlined />} onClick={limpiarFiltros}>
              Limpiar
            </Button>
          </Space>
      </Card>

        {/* Tabla de movimientos */}
        <Table
          columns={columnsMovimientos}
          dataSource={movimientos}
          rowKey="id"
          loading={loadingMovimientos}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} movimientos`,
          }}
          scroll={{ x: 1000 }}
          size="small"
        />
      </Modal>

      {/* Modal de Detalle de Movimiento */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            <Text strong>Detalle del Movimiento</Text>
          </Space>
        }
        open={modalDetalleMovVisible}
        onCancel={() => {
          setModalDetalleMovVisible(false);
          setMovimientoSeleccionado(null);
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setModalDetalleMovVisible(false);
              setMovimientoSeleccionado(null);
            }}
          >
            Cerrar
          </Button>,
        ]}
        width={600}
      >
        {loadingDetalle ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px', color: '#666' }}>
              Cargando detalle...
            </div>
          </div>
        ) : movimientoSeleccionado ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Información principal */}
            <Card size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Sucursal
                  </Text>
                  <div>
                    <Tag color="blue" icon={<ShopOutlined />}>
                      {movimientoSeleccionado.sucursal.toUpperCase()}
                    </Tag>
                  </div>
                </Col>
                
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Fecha y Hora
                  </Text>
                  <div>
                    <Text strong>
                      {dayjs(movimientoSeleccionado.created_at).format('DD/MM/YYYY HH:mm:ss')}
                    </Text>
                  </div>
                </Col>

                <Col span={24}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Tipo de Movimiento
                  </Text>
                  <div>
                    {(() => {
                      const config = getTipoMovimientoConfig(movimientoSeleccionado.tipo_movimiento);
                      return (
                        <Tag 
                          icon={config.icon} 
                          style={{ 
                            backgroundColor: config.color + '20',
                            color: config.color,
                            borderColor: config.color,
                            fontSize: '13px',
                            padding: '4px 12px',
                          }}
                        >
                          {config.texto}
                        </Tag>
                      );
                    })()}
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Montos */}
            <Card size="small" title="💰 Información de Montos">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic
                    title="Saldo Anterior"
                    value={movimientoSeleccionado.monto_anterior}
                    precision={2}
                    prefix="$"
                    valueStyle={{ fontSize: '18px' }}
                  />
                </Col>
                
                <Col span={8}>
                  <Statistic
                    title="Movimiento"
                    value={Math.abs(movimientoSeleccionado.monto)}
                    precision={2}
                    prefix={movimientoSeleccionado.monto > 0 ? '+$' : '-$'}
                    valueStyle={{ 
                      fontSize: '18px',
                      color: movimientoSeleccionado.monto > 0 ? '#52c41a' : '#ff4d4f',
                    }}
                  />
                </Col>
                
                <Col span={8}>
                  <Statistic
                    title="Saldo Nuevo"
                    value={movimientoSeleccionado.monto_nuevo}
                    precision={2}
                    prefix="$"
                    valueStyle={{ fontSize: '18px', fontWeight: 'bold' }}
                  />
                </Col>
              </Row>
            </Card>

            {/* Concepto */}
            <Card size="small" title="📝 Concepto">
              <Text>{movimientoSeleccionado.concepto}</Text>
            </Card>

            {/* Información adicional */}
            {(movimientoSeleccionado.numero_venta || movimientoSeleccionado.usuario_email) && (
              <Card size="small" title="ℹ️ Información Adicional">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {movimientoSeleccionado.numero_venta && (
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Número de Venta:
                      </Text>
                      <div>
                        <Tag color="green">{movimientoSeleccionado.numero_venta}</Tag>
                      </div>
                    </div>
                  )}
                  
                  {movimientoSeleccionado.usuario_email && (
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Usuario:
                      </Text>
                      <div>
                        <Text>{movimientoSeleccionado.usuario_email}</Text>
                      </div>
                    </div>
                  )}
                </Space>
              </Card>
            )}
          </Space>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">No se pudo cargar el detalle</Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Cash;
