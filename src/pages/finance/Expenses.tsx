import React, { useState, useMemo } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Table,
  Typography,
  Row,
  Col,
  Statistic,
  Space,
  message,
  Modal,
  InputNumber,
  Divider,
  Tag,
  notification,
  DatePicker
} from 'antd';
import {
  DollarOutlined,
  ShopOutlined,
  FileTextOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  BarChartOutlined,
  FilterOutlined,
  ClearOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { BRANCHES } from '../../data/branches';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Gasto {
  id: string;
  sucursal: string;
  monto: number;
  detalle: string;
  categoria: string;
  detalleOtro?: string;
  fecha: string;
  hora: string;
}

interface CajaSucursal {
  sucursal: string;
  saldo: number;
}

const Expenses: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mostrarTextareaOtro, setMostrarTextareaOtro] = useState(false);
  
  // Estados para filtros
  const [filtroFechas, setFiltroFechas] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [filtroSucursal, setFiltroSucursal] = useState<string | undefined>('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string | undefined>('Todos');
  const [gastos, setGastos] = useState<Gasto[]>([
    {
      id: '1',
      sucursal: 'Casa Central',
      monto: 15000,
      detalle: 'Compra de cemento y ladrillos',
      categoria: 'Materiales de construcción',
      fecha: '2024-01-15',
      hora: '10:30'
    },
    {
      id: '2',
      sucursal: 'Paysandú',
      monto: 8500,
      detalle: 'Envío de productos a cliente',
      categoria: 'Encomiendas',
      fecha: '2024-01-15',
      hora: '14:20'
    },
    {
      id: '3',
      sucursal: 'Salto',
      monto: 12300,
      detalle: 'Combustible para vehículos de reparto',
      categoria: 'Nafta',
      fecha: '2024-01-14',
      hora: '09:15'
    },
    {
      id: '4',
      sucursal: 'Rivera',
      monto: 4500,
      detalle: 'Papelería y útiles de oficina',
      categoria: 'Materiales de oficina',
      fecha: '2024-01-13',
      hora: '16:45'
    },
    {
      id: '5',
      sucursal: 'Tacuarembó',
      monto: 25000,
      detalle: 'Pago con tarjeta de crédito',
      categoria: 'Tarjeta',
      fecha: '2024-01-12',
      hora: '11:30'
    },
    {
      id: '6',
      sucursal: 'Pando',
      monto: 7800,
      detalle: 'Reparación de equipos',
      categoria: 'Otro',
      detalleOtro: 'Arreglo de computadora y impresora de la oficina',
      fecha: '2024-01-11',
      hora: '14:00'
    },
    {
      id: '7',
      sucursal: 'Melo',
      monto: 18500,
      detalle: 'Arena y piedra para construcción',
      categoria: 'Materiales de construcción',
      fecha: '2024-01-10',
      hora: '08:20'
    },
    {
      id: '8',
      sucursal: 'Casa Central',
      monto: 6200,
      detalle: 'Envío urgente a Montevideo',
      categoria: 'Encomiendas',
      fecha: '2024-01-09',
      hora: '13:15'
    },
    {
      id: '9',
      sucursal: 'Paysandú',
      monto: 9800,
      detalle: 'Gasoil para camiones',
      categoria: 'Nafta',
      fecha: '2024-01-08',
      hora: '07:45'
    },
    {
      id: '10',
      sucursal: 'Salto',
      monto: 3400,
      detalle: 'Limpieza y mantenimiento',
      categoria: 'Otro',
      detalleOtro: 'Productos de limpieza y servicio de mantenimiento mensual',
      fecha: '2024-01-07',
      hora: '15:30'
    },
    {
      id: '11',
      sucursal: 'Rivera',
      monto: 22000,
      detalle: 'Hierro y varillas de construcción',
      categoria: 'Materiales de construcción',
      fecha: '2024-01-06',
      hora: '10:00'
    },
    {
      id: '12',
      sucursal: 'Tacuarembó',
      monto: 5600,
      detalle: 'Tóner y cartuchos para impresoras',
      categoria: 'Materiales de oficina',
      fecha: '2024-01-05',
      hora: '12:20'
    }
  ]);

  const [cajasSucursales, setCajasSucursales] = useState<CajaSucursal[]>([
    { sucursal: 'Casa Central', saldo: 250000 },
    { sucursal: 'Paysandú', saldo: 180000 },
    { sucursal: 'Salto', saldo: 165000 },
    { sucursal: 'Rivera', saldo: 142000 },
    { sucursal: 'Tacuarembó', saldo: 198000 },
    { sucursal: 'Pando', saldo: 175000 },
    { sucursal: 'Melo', saldo: 156000 }
  ]);

  const categorias = [
    'Materiales de construcción',
    'Encomiendas',
    'Tarjeta',
    'Nafta',
    'Materiales de oficina',
    'Otro'
  ];

  const sucursales = BRANCHES.map(branch => branch.name);

  const handleCategoriaChange = (value: string) => {
    setMostrarTextareaOtro(value === 'Otro');
    if (value !== 'Otro') {
      form.setFieldsValue({ detalleOtro: undefined });
    }
  };

  const mostrarNotificacionExito = () => {
    notification.success({
      message: 'Gasto Procesado',
      description: 'El gasto ha sido registrado exitosamente y descontado de la caja.',
      icon: <DollarOutlined style={{ color: '#52c41a' }} />,
      placement: 'topRight',
      duration: 4,
      style: {
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        border: '1px solid #52c41a20'
      }
    });
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const nuevoGasto: Gasto = {
        id: Date.now().toString(),
        sucursal: values.sucursal,
        monto: values.monto,
        detalle: values.detalle,
        categoria: values.categoria,
        detalleOtro: values.detalleOtro,
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };

      // Agregar gasto a la lista
      setGastos(prev => [nuevoGasto, ...prev]);

      // Descontar de la caja de la sucursal
      setCajasSucursales(prev => 
        prev.map(caja => 
          caja.sucursal === values.sucursal 
            ? { ...caja, saldo: caja.saldo - values.monto }
            : caja
        )
      );

      // Mostrar notificación de éxito
      mostrarNotificacionExito();

      // Resetear formulario
      form.resetFields();
      setMostrarTextareaOtro(false);
      
    } catch (error) {
      message.error('Error al procesar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Gasto> = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 100,
      render: (fecha: string, record: Gasto) => (
        <div>
          <div>{fecha}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.hora}</Text>
        </div>
      )
    },
    {
      title: 'Sucursal',
      dataIndex: 'sucursal',
      key: 'sucursal',
      width: 120,
      render: (sucursal: string) => (
        <Tag color="blue" icon={<ShopOutlined />}>
          {sucursal}
        </Tag>
      )
    },
    {
      title: 'Categoría',
      dataIndex: 'categoria',
      key: 'categoria',
      width: 150,
      render: (categoria: string) => {
        const colores: { [key: string]: string } = {
          'Materiales de construcción': 'orange',
          'Encomiendas': 'green',
          'Tarjeta': 'purple',
          'Nafta': 'red',
          'Materiales de oficina': 'cyan',
          'Otro': 'default'
        };
        return <Tag color={colores[categoria]}>{categoria}</Tag>;
      }
    },
    {
      title: 'Detalle',
      dataIndex: 'detalle',
      key: 'detalle',
      ellipsis: true,
      render: (detalle: string, record: Gasto) => (
        <div>
          <div>{detalle}</div>
          {record.detalleOtro && (
            <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
              {record.detalleOtro}
            </Text>
          )}
        </div>
      )
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      width: 120,
      align: 'right',
      render: (monto: number) => (
        <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
          ${monto.toLocaleString()}
        </Text>
      )
    }
  ];

  // Función para filtrar gastos
  const gastosFiltrados = useMemo(() => {
    return gastos.filter(gasto => {
      // Filtro por fechas
      if (filtroFechas && filtroFechas.length === 2) {
        const fechaGasto = dayjs(gasto.fecha);
        const fechaInicio = dayjs(filtroFechas[0]);
        const fechaFin = dayjs(filtroFechas[1]);
        
        if (!fechaGasto.isBetween(fechaInicio, fechaFin, 'day', '[]')) {
          return false;
        }
      }
      
      // Filtro por sucursal - "Todos" significa mostrar todas
      if (filtroSucursal && filtroSucursal !== 'Todos' && gasto.sucursal !== filtroSucursal) {
        return false;
      }
      
      // Filtro por categoría - "Todos" significa mostrar todas
      if (filtroCategoria && filtroCategoria !== 'Todos' && gasto.categoria !== filtroCategoria) {
        return false;
      }
      
      return true;
    });
  }, [gastos, filtroFechas, filtroSucursal, filtroCategoria]);

  const calcularTotalPorCategoria = (gastosParaCalcular: Gasto[]) => {
    const totales: { [key: string]: number } = {};
    gastosParaCalcular.forEach(gasto => {
      totales[gasto.categoria] = (totales[gasto.categoria] || 0) + gasto.monto;
    });
    return totales;
  };

  const totalesPorCategoria = calcularTotalPorCategoria(gastosFiltrados);
  const totalGeneral = gastosFiltrados.reduce((sum, gasto) => sum + gasto.monto, 0);
  const saldoTotalCajas = cajasSucursales.reduce((sum, caja) => sum + caja.saldo, 0);
  
  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroFechas(null);
    setFiltroSucursal('Todos');
    setFiltroCategoria('Todos');
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <DollarOutlined style={{ color: '#1890ff' }} />
          Control de Gastos
        </Title>
        <Text type="secondary">Registra y controla los gastos de cada sucursal</Text>
      </div>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={filtroFechas || filtroSucursal || filtroCategoria ? "Total Filtrado" : "Total Gastado Hoy"}
              value={totalGeneral}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#f5222d' }}
              formatter={(value) => `$${value?.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Gastos Mostrados"
              value={gastosFiltrados.length}
              suffix={gastos.length !== gastosFiltrados.length ? `/ ${gastos.length}` : ''}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Saldo Total Cajas"
              value={saldoTotalCajas}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `$${value?.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Sucursales Activas"
              value={sucursales.length}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Formulario de Gastos */}
        <Col xs={24} lg={10}>
          <Card 
            title={
              <Space>
                <SendOutlined />
                Registrar Nuevo Gasto
              </Space>
            }
            style={{ height: 'fit-content' }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
            >
              <Form.Item
                name="sucursal"
                label="Sucursal"
                rules={[{ required: true, message: 'Selecciona una sucursal' }]}
              >
                <Select
                  placeholder="Selecciona la sucursal"
                  size="large"
                  suffixIcon={<ShopOutlined />}
                >
                  {sucursales.map(sucursal => (
                    <Option key={sucursal} value={sucursal}>
                      {sucursal}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="monto"
                label="Monto del Gasto"
                rules={[
                  { required: true, message: 'Ingresa el monto' },
                  { type: 'number', min: 1, message: 'El monto debe ser mayor a 0' }
                ]}
              >
                <InputNumber
                  placeholder="Ingresa el monto"
                  size="large"
                  style={{ width: '100%' }}
                  prefix={<DollarOutlined />}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item
                name="detalle"
                label="Detalle del Gasto"
                rules={[{ required: true, message: 'Describe el gasto' }]}
              >
                <Input
                  placeholder="Describe en qué se gastó el dinero"
                  size="large"
                  prefix={<FileTextOutlined />}
                />
              </Form.Item>

              <Form.Item
                name="categoria"
                label="Categoría"
                rules={[{ required: true, message: 'Selecciona una categoría' }]}
              >
                <Select
                  placeholder="Selecciona la categoría del gasto"
                  size="large"
                  onChange={handleCategoriaChange}
                >
                  {categorias.map(categoria => (
                    <Option key={categoria} value={categoria}>
                      {categoria}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {mostrarTextareaOtro && (
                <Form.Item
                  name="detalleOtro"
                  label="Detalle Adicional"
                  rules={[{ required: true, message: 'Especifica el detalle del gasto' }]}
                  style={{
                    animation: 'fadeIn 0.3s ease-in-out'
                  }}
                >
                  <TextArea
                    placeholder="Especifica en qué se gastó el dinero..."
                    rows={3}
                    size="large"
                  />
                </Form.Item>
              )}

              <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  icon={<SendOutlined />}
                  style={{
                    height: '48px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                  }}
                >
                  {loading ? 'Procesando...' : 'Registrar Gasto'}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Totales por Categoría */}
          <Card 
            title="Totales por Categoría" 
            style={{ marginTop: '16px' }}
            size="small"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {Object.entries(totalesPorCategoria).map(([categoria, total]) => (
                <div key={categoria} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>{categoria}</Text>
                  <Text strong style={{ color: '#f5222d' }}>
                    ${total.toLocaleString()}
                  </Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Tabla de Gastos Recientes */}
        <Col xs={24} lg={14}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                Gastos Recientes
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={gastosFiltrados}
              rowKey="id"
              pagination={{
                pageSize: 8,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} de ${total} gastos${gastos.length !== gastosFiltrados.length ? ` (${gastos.length} total)` : ''}`
              }}
              scroll={{ x: 800 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros Avanzados - Nueva sección completa */}
      <Row style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <FilterOutlined />
                Filtros de Búsqueda
              </Space>
            }
            size="small"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8} md={8}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Rango de Fechas:</span>
                  <DatePicker.RangePicker
                    value={filtroFechas}
                    onChange={(dates) => setFiltroFechas(dates)}
                    placeholder={['Fecha inicio', 'Fecha fin']}
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    allowClear
                  />
                </Space>
              </Col>
              
              <Col xs={24} sm={8} md={8}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Sucursal:</span>
                  <Select
                    value={filtroSucursal}
                    onChange={setFiltroSucursal}
                    placeholder="Todos"
                    defaultValue="Todos"
                    style={{ width: '100%' }}
                    allowClear
                  >
                    <Option key="todos" value="Todos">
                      <Space>
                        <ShopOutlined />
                        Todos
                      </Space>
                    </Option>
                    {sucursales.map(sucursal => (
                      <Option key={sucursal} value={sucursal}>
                        <Space>
                          <ShopOutlined />
                          {sucursal}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Col>
              
              <Col xs={24} sm={8} md={8}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Categoría:</span>
                  <Select
                    value={filtroCategoria}
                    onChange={setFiltroCategoria}
                    placeholder="Todos"
                    defaultValue="Todos"
                    style={{ width: '100%' }}
                    allowClear
                  >
                    <Option key="todos" value="Todos">
                      <Tag color="blue" style={{ margin: 0 }}>
                        Todos
                      </Tag>
                    </Option>
                    {categorias.map(categoria => {
                      const colores: { [key: string]: string } = {
                        'Materiales de construcción': 'orange',
                        'Encomiendas': 'green',
                        'Tarjeta': 'purple',
                        'Nafta': 'red',
                        'Materiales de oficina': 'cyan',
                        'Otro': 'default'
                      };
                      return (
                        <Option key={categoria} value={categoria}>
                          <Tag color={colores[categoria]} style={{ margin: 0 }}>
                            {categoria}
                          </Tag>
                        </Option>
                      );
                    })}
                  </Select>
                </Space>
              </Col>
            </Row>
            
            <Row style={{ marginTop: '16px' }} justify="space-between" align="middle">
              <Col>
                <Space>
                  <span style={{ fontSize: '13px', color: '#666' }}>
                    Mostrando {gastosFiltrados.length} de {gastos.length} gastos
                  </span>
                  {(filtroFechas || (filtroSucursal && filtroSucursal !== 'Todos') || (filtroCategoria && filtroCategoria !== 'Todos')) && (
                    <Tag color="blue" style={{ margin: 0 }}>
                      Filtros activos
                    </Tag>
                  )}
                </Space>
              </Col>
              <Col>
                <Button
                  icon={<ClearOutlined />}
                  onClick={limpiarFiltros}
                  disabled={!filtroFechas && (!filtroSucursal || filtroSucursal === 'Todos') && (!filtroCategoria || filtroCategoria === 'Todos')}
                  size="small"
                >
                  Limpiar Filtros
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .ant-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transition: box-shadow 0.3s ease;
        }
        
        .ant-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default Expenses;