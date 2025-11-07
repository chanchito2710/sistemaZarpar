/**
 * Página de Registro de Gastos
 * Permite registrar gastos en efectivo que se descuentan de la caja
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message as antMessage,
  Space,
  Typography,
  Row,
  Col,
  Alert,
  Table,
  Tag,
  Statistic,
  Divider,
  Spin,
  DatePicker,
} from 'antd';
import {
  DollarOutlined,
  FileTextOutlined,
  FileProtectOutlined,
  TruckOutlined,
  QuestionCircleOutlined,
  PlusCircleOutlined,
  CalendarOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456/api';

interface Gasto {
  id: number;
  sucursal: string;
  monto: number;
  motivo: string;
  notas?: string;
  usuario_email: string;
  created_at: string;
}

const Expenses: React.FC = () => {
  const { usuario } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [gastosRecientes, setGastosRecientes] = useState<Gasto[]>([]);
  const [loadingGastos, setLoadingGastos] = useState(false);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string>('');
  const [saldoCaja, setSaldoCaja] = useState<number | null>(null);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('');
  
  // Filtros de fecha para gastos
  const [fechaDesdeGastos, setFechaDesdeGastos] = useState<Dayjs | null>(null);
  const [fechaHastaGastos, setFechaHastaGastos] = useState<Dayjs | null>(null);

  const esAdmin = usuario?.esAdmin || false;
  const sucursalUsuario = obtenerSucursalDelUsuario();

  // Función para extraer sucursal del email
  function obtenerSucursalDelUsuario(): string {
    if (!usuario?.email) return 'pando';

    const email = usuario.email.toLowerCase();

    if (email.startsWith('pando@')) return 'pando';
    if (email.startsWith('maldonado@')) return 'maldonado';
    if (email.startsWith('rivera@')) return 'rivera';
    if (email.startsWith('melo@')) return 'melo';
    if (email.startsWith('paysandu@')) return 'paysandu';
    if (email.startsWith('salto@')) return 'salto';
    if (email.startsWith('tacuarembo@')) return 'tacuarembo';

    return 'pando';
  }

  useEffect(() => {
    // Establecer sucursal por defecto
    const sucursalInicial = esAdmin ? '' : sucursalUsuario;
    
    if (!esAdmin) {
      form.setFieldsValue({ sucursal: sucursalUsuario });
      setSucursalSeleccionada(sucursalUsuario);
      cargarSaldoCaja(sucursalUsuario);
    }

    cargarGastosRecientes();
  }, []);

  // Efecto para cargar saldo cuando cambia la sucursal seleccionada
  useEffect(() => {
    if (sucursalSeleccionada) {
      cargarSaldoCaja(sucursalSeleccionada);
    }
  }, [sucursalSeleccionada]);

  const cargarSaldoCaja = async (sucursal: string) => {
    if (!sucursal) return;
    
    setLoadingSaldo(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/caja/${sucursal}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data.success) {
        setSaldoCaja(data.data.monto_actual);
      }
    } catch (error) {
      console.error('Error al cargar saldo de caja:', error);
      setSaldoCaja(null);
    } finally {
      setLoadingSaldo(false);
    }
  };

  const cargarGastosRecientes = async (desde?: Dayjs | null, hasta?: Dayjs | null) => {
    setLoadingGastos(true);
    try {
      const token = localStorage.getItem('token');
      
      // Construir URL con parámetros de fecha si existen
      let url = `${API_URL}/caja/movimientos/historial?tipo_movimiento=gasto&limite=50`;
      
      if (desde) {
        url += `&fechaDesde=${desde.format('YYYY-MM-DD')}`;
      }
      
      if (hasta) {
        url += `&fechaHasta=${hasta.format('YYYY-MM-DD')}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data.success) {
        setGastosRecientes(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar gastos recientes:', error);
    } finally {
      setLoadingGastos(false);
    }
  };
  
  const handleFiltrarGastos = () => {
    cargarGastosRecientes(fechaDesdeGastos, fechaHastaGastos);
  };
  
  const handleLimpiarFiltros = () => {
    setFechaDesdeGastos(null);
    setFechaHastaGastos(null);
    cargarGastosRecientes(null, null);
  };

  const handleRegistrarGasto = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/caja/gasto`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sucursal: values.sucursal,
          monto: values.monto,
          motivo: values.motivo,
          notas: values.notas || null,
          usuario_id: usuario?.id || 0,
          usuario_email: usuario?.email || '',
        }),
      });

      const data = await response.json();

      if (data.success) {
        antMessage.success(`💸 ${data.message}`);
        
        // Recargar saldo de caja
        if (sucursalSeleccionada) {
          cargarSaldoCaja(sucursalSeleccionada);
        }
        
        form.resetFields();

        // Restablecer sucursal si no es admin
        if (!esAdmin) {
          form.setFieldsValue({ sucursal: sucursalUsuario });
          setSucursalSeleccionada(sucursalUsuario);
        } else {
          setSucursalSeleccionada('');
          setSaldoCaja(null);
        }

        setMotivoSeleccionado('');
        cargarGastosRecientes();
      } else {
        antMessage.error(data.message || 'Error al registrar gasto');
      }
    } catch (error: any) {
      console.error('Error al registrar gasto:', error);
      antMessage.error(error.message || 'Error al registrar gasto');
    } finally {
      setLoading(false);
    }
  };

  const motivos = [
    { value: 'Gasolina', label: 'Gasolina', icon: <span style={{ fontSize: '16px' }}>⛽</span> },
    { value: 'Papelería', label: 'Papelería', icon: <FileProtectOutlined /> },
    { value: 'Flete', label: 'Flete', icon: <TruckOutlined /> },
    { value: 'Otro', label: 'Otro', icon: <QuestionCircleOutlined /> },
  ];

  const columnas = [
    {
      title: 'Fecha',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (fecha: string) => (
        <Text style={{ fontSize: 12 }}>
          {dayjs(fecha).format('DD/MM/YYYY HH:mm')}
        </Text>
      ),
      width: 130,
      fixed: 'left' as const,
    },
    {
      title: 'Sucursal',
      dataIndex: 'sucursal',
      key: 'sucursal',
      render: (sucursal: string) => (
        <Tag color="blue" style={{ fontSize: 11 }}>
          {sucursal.toUpperCase()}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      render: (monto: number) => (
        <Text strong style={{ color: '#ff4d4f', fontSize: 13 }}>
          -${Math.abs(monto).toFixed(2)}
        </Text>
      ),
      width: 100,
      align: 'right' as const,
    },
    {
      title: 'Concepto',
      dataIndex: 'concepto',
      key: 'concepto',
      ellipsis: true,
      render: (concepto: string) => (
        <Text ellipsis style={{ fontSize: 12 }}>
          {concepto}
        </Text>
      ),
    },
    {
      title: 'Usuario',
      dataIndex: 'usuario_email',
      key: 'usuario_email',
      render: (email: string) => (
        <Text type="secondary" style={{ fontSize: 11 }}>
          {email}
        </Text>
      ),
      width: 180,
      ellipsis: true,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row align="middle" justify="space-between" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            💸 Registro de Gastos
          </Title>
          <Text type="secondary">Registra gastos en efectivo de tu sucursal</Text>
        </Col>
      </Row>

      {/* Alert informativo */}
      <Alert
        message="💡 Información"
        description="Los gastos registrados se descontarán automáticamente del efectivo disponible en la caja de tu sucursal."
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      {/* Saldo disponible en caja */}
      {sucursalSeleccionada && (
        <Card
          style={{
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
          }}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Text style={{ color: 'white', fontSize: '16px', fontWeight: 500 }}>
                💰 Efectivo Disponible en Caja ({sucursalSeleccionada.toUpperCase()})
              </Text>
            </Col>
            <Col>
              <Spin spinning={loadingSaldo}>
                <Statistic
                  value={saldoCaja !== null ? saldoCaja : 0}
                  precision={2}
                  prefix="$"
                  valueStyle={{
                    color: 'white',
                    fontSize: '32px',
                    fontWeight: 'bold',
                  }}
                />
              </Spin>
            </Col>
          </Row>
        </Card>
      )}

      <Row gutter={[24, 24]}>
        {/* Formulario de registro */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <PlusCircleOutlined />
                <Text strong>Registrar Nuevo Gasto</Text>
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleRegistrarGasto}
              initialValues={{
                sucursal: esAdmin ? undefined : sucursalUsuario,
              }}
            >
              {/* Sucursal */}
              <Form.Item
                label="Sucursal"
                name="sucursal"
                rules={[{ required: true, message: 'Selecciona la sucursal' }]}
              >
                <Select
                  placeholder="Selecciona la sucursal"
                  disabled={!esAdmin}
                  size="large"
                  onChange={(value) => setSucursalSeleccionada(value)}
                >
                  <Option value="pando">PANDO</Option>
                  <Option value="maldonado">MALDONADO</Option>
                  <Option value="rivera">RIVERA</Option>
                  <Option value="melo">MELO</Option>
                  <Option value="paysandu">PAYSANDÚ</Option>
                  <Option value="salto">SALTO</Option>
                  <Option value="tacuarembo">TACUAREMBÓ</Option>
                </Select>
              </Form.Item>

              {/* Monto */}
              <Form.Item
                label="Monto ($)"
                name="monto"
                rules={[
                  { required: true, message: 'Ingresa el monto' },
                  { type: 'number', min: 0.01, message: 'El monto debe ser mayor a 0' },
                ]}
              >
                <InputNumber
                  prefix={<DollarOutlined />}
                  placeholder="0.00"
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                  precision={2}
                  size="large"
                />
              </Form.Item>

              {/* Motivo */}
              <Form.Item
                label="Motivo del Gasto"
                name="motivo"
                rules={[{ required: true, message: 'Selecciona el motivo' }]}
              >
                <Select
                  placeholder="Selecciona el motivo"
                  size="large"
                  onChange={(value) => setMotivoSeleccionado(value)}
                >
                  {motivos.map((motivo) => (
                    <Option key={motivo.value} value={motivo.value}>
                      <Space>
                        {motivo.icon}
                        {motivo.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Notas */}
              <Form.Item
                label="Notas (Opcional)"
                name="notas"
                rules={[
                  {
                    required: motivoSeleccionado === 'Otro',
                    message: 'Las notas son obligatorias si el motivo es "Otro"',
                  },
                ]}
              >
                <TextArea
                  placeholder={
                    motivoSeleccionado === 'Otro'
                      ? 'Especifica el motivo del gasto...'
                      : 'Agrega detalles adicionales (opcional)...'
                  }
                  rows={4}
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              {motivoSeleccionado === 'Otro' && (
                <Alert
                  message="⚠️ Atención"
                  description="Has seleccionado 'Otro'. Debes especificar el motivo en las notas."
                  type="warning"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}

              {/* Botón */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                  icon={<FileTextOutlined />}
                >
                  💸 Registrar Gasto
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Gastos recientes */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <Text strong>Gastos Recientes</Text>
              </Space>
            }
            extra={
              <Button 
                onClick={handleLimpiarFiltros} 
                size="small"
                icon={<ReloadOutlined />}
              >
                Actualizar
              </Button>
            }
          >
            {/* Filtros de fecha */}
            <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
              <Row gutter={[8, 8]} align="middle">
                <Col xs={24} sm={14}>
                  <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Filtrar por rango de fechas:
                    </Text>
                    <RangePicker
                      value={[fechaDesdeGastos, fechaHastaGastos]}
                      onChange={(dates) => {
                        setFechaDesdeGastos(dates ? dates[0] : null);
                        setFechaHastaGastos(dates ? dates[1] : null);
                      }}
                      format="DD/MM/YYYY"
                      placeholder={['Fecha desde', 'Fecha hasta']}
                      style={{ width: '100%' }}
                      size="small"
                    />
                  </Space>
                </Col>
                <Col xs={24} sm={10}>
                  <Space size="small" style={{ marginTop: 16 }}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<CalendarOutlined />}
                      onClick={handleFiltrarGastos}
                      loading={loadingGastos}
                    >
                      Filtrar
                    </Button>
                    <Button
                      size="small"
                      onClick={handleLimpiarFiltros}
                      disabled={!fechaDesdeGastos && !fechaHastaGastos}
                    >
                      Limpiar
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Space>
            
            <Table
              dataSource={gastosRecientes}
              columns={columnas}
              rowKey="id"
              loading={loadingGastos}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total: ${total} gastos`,
              }}
              size="small"
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Expenses;
