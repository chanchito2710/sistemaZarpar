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
  InputNumber,
  Divider,
  Tag,
  notification,
  DatePicker
} from 'antd';
import {
  DollarOutlined,
  UserOutlined,
  FileTextOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  BarChartOutlined,
  FilterOutlined,
  ClearOutlined,
  TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { SELLERS, getBranchById } from '../../data/branches';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Sueldo {
  id: string;
  empleado: string;
  monto: number;
  descripcion: string;
  fecha: string;
  hora: string;
}

const Payroll: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Estados para filtros
  const [filtroFechas, setFiltroFechas] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [filtroEmpleado, setFiltroEmpleado] = useState<string | undefined>('Todos');
  const [sueldos, setSueldos] = useState<Sueldo[]>([
    {
      id: '1',
      empleado: 'Juan Pérez',
      monto: 45000,
      descripcion: 'Sueldo mensual enero - Gerente de sucursal',
      fecha: '2024-01-31',
      hora: '17:00'
    },
    {
      id: '2',
      empleado: 'María González',
      monto: 38000,
      descripcion: 'Sueldo mensual enero - Supervisora de operaciones',
      fecha: '2024-01-31',
      hora: '17:00'
    },
    {
      id: '3',
      empleado: 'Carlos Rodríguez',
      monto: 32000,
      descripcion: 'Sueldo mensual enero - Conductor',
      fecha: '2024-01-31',
      hora: '17:00'
    },
    {
      id: '4',
      empleado: 'Ana Martínez',
      monto: 28000,
      descripcion: 'Sueldo mensual enero - Administrativa',
      fecha: '2024-01-31',
      hora: '17:00'
    },
    {
      id: '5',
      empleado: 'Luis Fernández',
      monto: 35000,
      descripcion: 'Sueldo mensual enero - Técnico especializado',
      fecha: '2024-01-31',
      hora: '17:00'
    },
    {
      id: '6',
      empleado: 'Carmen Silva',
      monto: 30000,
      descripcion: 'Sueldo mensual enero - Vendedora',
      fecha: '2024-01-31',
      hora: '17:00'
    },
    {
      id: '7',
      empleado: 'Roberto López',
      monto: 42000,
      descripcion: 'Sueldo mensual enero + horas extra - Supervisor',
      fecha: '2024-01-30',
      hora: '18:30'
    },
    {
      id: '8',
      empleado: 'Patricia Díaz',
      monto: 26000,
      descripcion: 'Sueldo mensual enero - Recepcionista',
      fecha: '2024-01-30',
      hora: '16:45'
    },
    {
      id: '9',
      empleado: 'Miguel Torres',
      monto: 39000,
      descripcion: 'Sueldo mensual enero - Encargado de almacén',
      fecha: '2024-01-29',
      hora: '17:15'
    },
    {
      id: '10',
      empleado: 'Elena Vargas',
      monto: 33000,
      descripcion: 'Sueldo mensual enero - Contadora',
      fecha: '2024-01-29',
      hora: '17:00'
    },
    {
      id: '11',
      empleado: 'Diego Morales',
      monto: 29000,
      descripcion: 'Sueldo mensual enero - Operario',
      fecha: '2024-01-28',
      hora: '16:30'
    },
    {
      id: '12',
      empleado: 'Sofía Herrera',
      monto: 31000,
      descripcion: 'Sueldo mensual enero - Asistente administrativa',
      fecha: '2024-01-28',
      hora: '17:00'
    }
  ]);

  // Obtener empleados desde la configuración centralizada
  const empleados = SELLERS.map(seller => {
    const branch = getBranchById(seller.branchId);
    return {
      name: `${seller.firstName} ${seller.lastName}`,
      branch: branch?.name || 'Sin asignar',
      role: seller.role
    };
  });
  
  const empleadosNames = empleados.map(emp => emp.name);

  const mostrarNotificacionExito = () => {
    notification.success({
      message: 'Sueldo Registrado',
      description: 'El sueldo ha sido registrado exitosamente en el sistema.',
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
      
      const nuevoSueldo: Sueldo = {
        id: Date.now().toString(),
        empleado: values.empleado,
        monto: values.monto,
        descripcion: values.descripcion,
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };

      // Agregar sueldo a la lista
      setSueldos(prev => [nuevoSueldo, ...prev]);

      // Mostrar notificación de éxito
      mostrarNotificacionExito();

      // Resetear formulario
      form.resetFields();
      
    } catch (error) {
      message.error('Error al registrar el sueldo');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Sueldo> = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 100,
      render: (fecha: string, record: Sueldo) => (
        <div>
          <div>{fecha}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.hora}</Text>
        </div>
      )
    },
    {
      title: 'Empleado',
      dataIndex: 'empleado',
      key: 'empleado',
      width: 150,
      render: (empleado: string) => (
        <Tag color="blue" icon={<UserOutlined />}>
          {empleado}
        </Tag>
      )
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      ellipsis: true,
      render: (descripcion: string) => (
        <div>
          <div>{descripcion}</div>
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
        <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
          ${monto.toLocaleString()}
        </Text>
      )
    }
  ];

  // Función para filtrar sueldos
  const sueldosFiltrados = useMemo(() => {
    return sueldos.filter(sueldo => {
      // Filtro por fechas
      if (filtroFechas && filtroFechas.length === 2) {
        const fechaSueldo = dayjs(sueldo.fecha);
        const fechaInicio = dayjs(filtroFechas[0]);
        const fechaFin = dayjs(filtroFechas[1]);
        
        if (!fechaSueldo.isBetween(fechaInicio, fechaFin, 'day', '[]')) {
          return false;
        }
      }
      
      // Filtro por empleado - "Todos" significa mostrar todos
      if (filtroEmpleado && filtroEmpleado !== 'Todos' && sueldo.empleado !== filtroEmpleado) {
        return false;
      }
      
      return true;
    });
  }, [sueldos, filtroFechas, filtroEmpleado]);

  const calcularTotalPorEmpleado = (sueldosParaCalcular: Sueldo[]) => {
    const totales: { [key: string]: number } = {};
    sueldosParaCalcular.forEach(sueldo => {
      totales[sueldo.empleado] = (totales[sueldo.empleado] || 0) + sueldo.monto;
    });
    return totales;
  };

  const totalesPorEmpleado = calcularTotalPorEmpleado(sueldosFiltrados);
  const totalGeneral = sueldosFiltrados.reduce((sum, sueldo) => sum + sueldo.monto, 0);
  
  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroFechas(null);
    setFiltroEmpleado('Todos');
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TeamOutlined style={{ color: '#1890ff' }} />
          Control de Sueldos
        </Title>
        <Text type="secondary">Registra y controla los sueldos de los empleados</Text>
      </div>

      {/* Estadísticas Generales */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Sueldos Pagados"
              value={totalGeneral}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `$${value?.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Empleados con Sueldos"
              value={Object.keys(totalesPorEmpleado).length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Registros Totales"
              value={sueldosFiltrados.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros Avanzados */}
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
              <Col xs={24} sm={12} md={12}>
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
              
              <Col xs={24} sm={12} md={12}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Empleado:</span>
                  <Select
                    value={filtroEmpleado}
                    onChange={setFiltroEmpleado}
                    placeholder="Todos"
                    defaultValue="Todos"
                    style={{ width: '100%' }}
                    allowClear
                  >
                    <Option key="todos" value="Todos">
                      <Space>
                        <UserOutlined />
                        Todos
                      </Space>
                    </Option>
                    {empleados.map(empleado => (
                      <Option key={empleado} value={empleado}>
                        <Space>
                          <UserOutlined />
                          {empleado}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Col>
            </Row>
            
            <Row style={{ marginTop: '16px' }} justify="space-between" align="middle">
              <Col>
                <Space>
                  <span style={{ fontSize: '13px', color: '#666' }}>
                    Mostrando {sueldosFiltrados.length} de {sueldos.length} registros
                  </span>
                  {(filtroFechas || (filtroEmpleado && filtroEmpleado !== 'Todos')) && (
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
                  disabled={!filtroFechas && (!filtroEmpleado || filtroEmpleado === 'Todos')}
                  size="small"
                >
                  Limpiar Filtros
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Formulario de Registro */}
        <Col xs={24} lg={10}>
          <Card 
            title={
              <Space>
                <DollarOutlined />
                Registrar Sueldo
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
            >
              <Form.Item
                name="empleado"
                label="Empleado"
                rules={[{ required: true, message: 'Selecciona un empleado' }]}
              >
                <Select
                  placeholder="Selecciona un empleado"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {empleadosNames.map(empleado => (
                    <Option key={empleado} value={empleado}>
                      <Space>
                        <UserOutlined />
                        {empleado}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="monto"
                label="Monto del Sueldo"
                rules={[
                  { required: true, message: 'Ingresa el monto del sueldo' },
                  { type: 'number', min: 1, message: 'El monto debe ser mayor a 0' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Ingresa el monto"
                  prefix="$"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  min={1}
                />
              </Form.Item>

              <Form.Item
                name="descripcion"
                label="Descripción"
                rules={[{ required: true, message: 'Ingresa una descripción' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="Ej: Sueldo mensual enero, horas extra, bonificación, etc."
                  maxLength={200}
                  showCount
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SendOutlined />}
                  block
                  size="large"
                >
                  {loading ? 'Registrando...' : 'Registrar Sueldo'}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Totales por Empleado */}
          <Card 
            title="Totales por Empleado" 
            style={{ marginTop: '16px' }}
            size="small"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {Object.entries(totalesPorEmpleado)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([empleado, total]) => (
                <div key={empleado} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>{empleado}</Text>
                  <Text strong style={{ color: '#52c41a' }}>
                    ${total.toLocaleString()}
                  </Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Tabla de Sueldos Recientes */}
        <Col xs={24} lg={14}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                Sueldos Recientes
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={sueldosFiltrados}
              rowKey="id"
              pagination={{
                pageSize: 8,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} de ${total} sueldos${sueldos.length !== sueldosFiltrados.length ? ` (${sueldos.length} total)` : ''}`
              }}
              scroll={{ x: 800 }}
              size="small"
            />
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

export default Payroll;