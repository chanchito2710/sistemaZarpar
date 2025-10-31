/**
 * Página de Gestión de Personal - SOLO ADMINISTRADORES
 * Permite crear vendedores, gerentes, administradores y sucursales
 * Incluye creación automática de tablas clientes_[sucursal]
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Statistic,
  Row,
  Col,
  Input,
  Select,
  Tabs,
  Modal,
  Form,
  App,
  Popconfirm,
  Alert,
  Spin,
  Badge,
  Divider,
  Typography
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
  CrownOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456/api';

/**
 * Interfaz para Vendedor
 */
interface Vendedor {
  id: number;
  nombre: string;
  cargo: string;
  sucursal: string;
  telefono?: string;
  email: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interfaz para Sucursal
 */
interface Sucursal {
  sucursal: string;
  total_vendedores: number;
}

/**
 * Interfaz para formulario de vendedor
 */
interface VendedorFormData {
  nombre: string;
  cargo: string;
  sucursal: string;
  telefono?: string;
  email: string;
  password: string;
}

/**
 * Interfaz para formulario de sucursal
 */
interface SucursalFormData {
  nombre: string;
  direccion?: string;
  telefono?: string;
  ciudad?: string;
}

const StaffSellers: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { message: messageApi } = App.useApp();

  // Estados para vendedores
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [vendedoresLoading, setVendedoresLoading] = useState(false);
  const [vendedorSearchText, setVendedorSearchText] = useState('');
  const [vendedorModalVisible, setVendedorModalVisible] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null);
  const [vendedorForm] = Form.useForm();

  // Estados para sucursales
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalesLoading, setSucursalesLoading] = useState(false);
  const [sucursalModalVisible, setSucursalModalVisible] = useState(false);
  const [sucursalForm] = Form.useForm();

  // Filtros
  const [selectedSucursalFilter, setSelectedSucursalFilter] = useState<string | undefined>(undefined);
  const [selectedCargoFilter, setSelectedCargoFilter] = useState<string | undefined>(undefined);

  /**
   * Verificar que el usuario sea administrador
   */
  useEffect(() => {
    // Verificar que el usuario esté cargado y sea administrador
    if (!usuario) {
      return; // Esperar a que se cargue el usuario
    }
    
    if (!usuario.esAdmin && usuario.email !== 'admin@zarparuy.com') {
      messageApi.error('⛔ Acceso denegado. Solo administradores pueden acceder a esta página.');
      navigate('/');
    }
  }, [usuario, navigate, messageApi]);

  /**
   * Cargar datos iniciales
   */
  useEffect(() => {
    cargarVendedores();
    cargarSucursales();
  }, []);

  /**
   * Cargar todos los vendedores
   */
  const cargarVendedores = async () => {
    try {
      console.log('🔄 Cargando vendedores...');
      setVendedoresLoading(true);
      const response = await axios.get(`${API_URL}/vendedores`);
      
      console.log('📥 Respuesta recibida:', response.data);
      
      if (response.data.success) {
        console.log('✅ Total vendedores:', response.data.data.length);
        console.log('📋 Vendedores:', response.data.data.map((v: Vendedor) => ({
          id: v.id,
          nombre: v.nombre,
          cargo: v.cargo,
          sucursal: v.sucursal,
          email: v.email
        })));
        
        setVendedores(response.data.data);
        messageApi.success(`✅ ${response.data.data.length} vendedores cargados`);
      }
    } catch (error: any) {
      console.error('❌ Error al cargar vendedores:', error);
      messageApi.error('Error al cargar vendedores');
    } finally {
      setVendedoresLoading(false);
    }
  };

  /**
   * Cargar sucursales
   */
  const cargarSucursales = async () => {
    try {
      setSucursalesLoading(true);
      const response = await axios.get(`${API_URL}/sucursales`);
      
      if (response.data.success) {
        setSucursales(response.data.data);
      }
    } catch (error: any) {
      console.error('❌ Error al cargar sucursales:', error);
      messageApi.error('Error al cargar sucursales');
    } finally {
      setSucursalesLoading(false);
    }
  };

  /**
   * Crear o actualizar vendedor
   */
  const handleVendedorSubmit = async () => {
    try {
      const values = await vendedorForm.validateFields();
      
      const token = localStorage.getItem('token');
      if (!token) {
        messageApi.error('No hay sesión activa');
        return;
      }

      console.log('📤 Enviando datos:', values);

      if (editingVendedor) {
        // Actualizar vendedor existente
        const response = await axios.put(
          `${API_URL}/vendedores/${editingVendedor.id}`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('✅ Respuesta actualización:', response.data);
        messageApi.success('✅ Vendedor actualizado exitosamente');
      } else {
        // Crear nuevo vendedor
        const response = await axios.post(
          `${API_URL}/vendedores`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('✅ Respuesta creación:', response.data);
        messageApi.success('✅ Vendedor creado exitosamente');
      }

      // Cerrar modal y limpiar
      setVendedorModalVisible(false);
      vendedorForm.resetFields();
      setEditingVendedor(null);
      
      // Limpiar TODOS los filtros
      setVendedorSearchText('');
      setSelectedSucursalFilter(undefined);
      setSelectedCargoFilter(undefined);
      
      // Esperar un momento y recargar
      setTimeout(async () => {
        console.log('🔄 Recargando vendedores...');
        await cargarVendedores();
        await cargarSucursales();
        console.log('✅ Recarga completada');
      }, 500);

    } catch (error: any) {
      console.error('❌ Error al guardar vendedor:', error);
      console.error('❌ Detalles:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Error al guardar vendedor';
      messageApi.error(errorMsg);
    }
  };

  /**
   * Eliminar vendedor
   */
  const handleEliminarVendedor = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        messageApi.error('No hay sesión activa');
        return;
      }

      const response = await axios.delete(`${API_URL}/vendedores/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Verificar si fue eliminado permanentemente o solo desactivado
      if (response.data.data?.eliminado_permanentemente) {
        messageApi.success({
          content: '🗑️ Vendedor eliminado permanentemente de la base de datos',
          duration: 5
        });
      } else if (response.data.data?.desactivado) {
        messageApi.warning({
          content: response.data.message || '⚠️ El vendedor tiene datos relacionados y fue desactivado en vez de eliminarse',
          duration: 8
        });
      } else {
        messageApi.success('✅ Vendedor eliminado exitosamente');
      }

      await cargarVendedores();
      await cargarSucursales();
    } catch (error: any) {
      console.error('❌ Error al eliminar vendedor:', error);
      const errorMsg = error.response?.data?.message || 'Error al eliminar vendedor';
      messageApi.error(errorMsg);
    }
  };

  /**
   * Crear nueva sucursal
   */
  const handleSucursalSubmit = async () => {
    try {
      const values = await sucursalForm.validateFields();
      
      const token = localStorage.getItem('token');
      if (!token) {
        messageApi.error('No hay sesión activa');
        return;
      }

      console.log('📤 Creando nueva sucursal:', values);

      const response = await axios.post(
        `${API_URL}/sucursales`,
        values,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const nuevaSucursal = response.data.data.nombre;
        
        messageApi.success(
          `✅ Sucursal "${nuevaSucursal}" creada exitosamente con tabla de clientes`,
          5
        );
        
        console.log('✅ Sucursal creada:', response.data.data);

        // Cerrar modal y limpiar formulario
        setSucursalModalVisible(false);
        sucursalForm.resetFields();
        
        // Recargar sucursales
        await cargarSucursales();
        
        // Seleccionar automáticamente la nueva sucursal en el formulario de vendedor
        vendedorForm.setFieldsValue({ sucursal: nuevaSucursal });
        
        console.log(`✅ Sucursal "${nuevaSucursal}" seleccionada automáticamente en el formulario`);
      }
    } catch (error: any) {
      console.error('❌ Error al crear sucursal:', error);
      const errorMsg = error.response?.data?.message || 'Error al crear sucursal';
      messageApi.error(errorMsg);
    }
  };

  /**
   * Abrir modal para nuevo vendedor
   */
  const handleNuevoVendedor = () => {
    setEditingVendedor(null);
    vendedorForm.resetFields();
    setVendedorModalVisible(true);
  };

  /**
   * Abrir modal para editar vendedor
   */
  const handleEditarVendedor = (vendedor: Vendedor) => {
    setEditingVendedor(vendedor);
    vendedorForm.setFieldsValue({
      nombre: vendedor.nombre,
      cargo: vendedor.cargo,
      sucursal: vendedor.sucursal,
      telefono: vendedor.telefono,
      email: vendedor.email,
    });
    setVendedorModalVisible(true);
  };

  /**
   * Obtener texto del cargo
   */
  const getCargoTexto = (cargo: string): string => {
    const cargoLower = cargo.toLowerCase();
    if (cargoLower.includes('admin')) return 'Administrador';
    if (cargoLower.includes('gerente')) return 'Gerente';
    if (cargoLower.includes('vendedor')) return 'Vendedor';
    return cargo;
  };

  /**
   * Obtener color del cargo
   */
  const getCargoColor = (cargo: string): string => {
    const cargoLower = cargo.toLowerCase();
    if (cargoLower.includes('admin')) return 'red';
    if (cargoLower.includes('gerente')) return 'gold';
    if (cargoLower.includes('vendedor')) return 'blue';
    return 'default';
  };

  /**
   * Obtener icono del cargo
   */
  const getCargoIcono = (cargo: string): React.ReactNode => {
    const cargoLower = cargo.toLowerCase();
    if (cargoLower.includes('admin')) return <CrownOutlined />;
    if (cargoLower.includes('gerente')) return <SafetyOutlined />;
    if (cargoLower.includes('vendedor')) return <UserOutlined />;
    return <UserOutlined />;
  };

  /**
   * Filtrar vendedores
   */
  const vendedoresFiltrados = vendedores.filter((vendedor) => {
    const matchesSearch = 
      vendedor.nombre.toLowerCase().includes(vendedorSearchText.toLowerCase()) ||
      vendedor.email.toLowerCase().includes(vendedorSearchText.toLowerCase());
    
    const matchesSucursal = !selectedSucursalFilter || vendedor.sucursal === selectedSucursalFilter;
    const matchesCargo = !selectedCargoFilter || vendedor.cargo.toLowerCase().includes(selectedCargoFilter.toLowerCase());

    return matchesSearch && matchesSucursal && matchesCargo;
  });

  /**
   * Columnas de la tabla de vendedores
   */
  const columnasVendedores: ColumnsType<Vendedor> = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      render: (nombre: string) => <Text strong>{nombre}</Text>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Space>
          <MailOutlined />
          <Text copyable>{email}</Text>
        </Space>
      ),
    },
    {
      title: 'Cargo',
      dataIndex: 'cargo',
      key: 'cargo',
      render: (cargo: string) => (
        <Tag color={getCargoColor(cargo)} icon={getCargoIcono(cargo)}>
          {getCargoTexto(cargo)}
        </Tag>
      ),
    },
    {
      title: 'Sucursal',
      dataIndex: 'sucursal',
      key: 'sucursal',
      render: (sucursal: string) => (
        <Tag color="green">
          <ShopOutlined /> {sucursal.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
      render: (telefono?: string) => 
        telefono ? (
          <Space>
            <PhoneOutlined />
            {telefono}
          </Space>
        ) : <Text type="secondary">-</Text>
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo: boolean) => (
        <Tag color={activo ? 'success' : 'error'} icon={activo ? <CheckCircleOutlined /> : <WarningOutlined />}>
          {activo ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditarVendedor(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title={
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff4d4f' }}>
                ⚠️ ¡ELIMINAR PERMANENTEMENTE!
              </span>
            }
            description={
              <div style={{ maxWidth: '350px' }}>
                <p style={{ margin: '8px 0', fontWeight: 'bold' }}>
                  ¿Estás seguro de eliminar a <strong>"{record.nombre}"</strong>?
                </p>
                <Alert
                  message="ADVERTENCIA: Esta acción es IRREVERSIBLE"
                  description="El vendedor será BORRADO PERMANENTEMENTE de la base de datos y NO se podrá recuperar."
                  type="error"
                  showIcon
                  style={{ marginTop: 8 }}
                />
              </div>
            }
            onConfirm={() => handleEliminarVendedor(record.id)}
            okText="🗑️ SÍ, ELIMINAR PERMANENTEMENTE"
            cancelText="❌ Cancelar"
            okButtonProps={{ 
              danger: true,
              size: 'large',
              style: { fontWeight: 'bold' }
            }}
            cancelButtonProps={{
              size: 'large'
            }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /**
   * Estadísticas
   */
  const totalVendedores = vendedores.length;
  const totalAdministradores = vendedores.filter(v => v.cargo.toLowerCase().includes('admin')).length;
  const totalGerentes = vendedores.filter(v => v.cargo.toLowerCase().includes('gerente')).length;
  const totalSucursales = sucursales.length;

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                <CrownOutlined /> Gestión de Personal - ADMINISTRADOR
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                Administra vendedores, gerentes, administradores y sucursales del sistema
              </Paragraph>
            </Space>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                cargarVendedores();
                cargarSucursales();
              }}
              size="large"
              style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'white', color: 'white' }}
            >
              Actualizar
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Alerta de seguridad */}
      <Alert
        message="⚠️ Área Restringida - Solo Administradores"
        description="Esta página solo es accesible para usuarios con rol de Administrador. Los cambios aquí realizados afectan todo el sistema."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Vendedores"
              value={totalVendedores}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Administradores"
              value={totalAdministradores}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Gerentes"
              value={totalGerentes}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sucursales"
              value={totalSucursales}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs 
        defaultActiveKey="vendedores" 
        size="large"
        items={[
          {
            key: 'vendedores',
            label: (
              <span>
                <TeamOutlined />
                Vendedores
                <Badge count={totalVendedores} style={{ marginLeft: 8 }} />
              </span>
            ),
            children: (
              <>
                {/* Filtros y búsqueda */}
                <Card style={{ marginBottom: 16 }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Input
                        placeholder="Buscar por nombre o email..."
                        prefix={<SearchOutlined />}
                        value={vendedorSearchText}
                        onChange={(e) => setVendedorSearchText(e.target.value)}
                        allowClear
                        size="large"
                      />
                    </Col>
                    <Col xs={24} sm={12} md={5}>
                      <Select
                        placeholder="Filtrar por sucursal"
                        style={{ width: '100%' }}
                        allowClear
                        value={selectedSucursalFilter}
                        onChange={setSelectedSucursalFilter}
                        size="large"
                      >
                        {sucursales.map((s) => (
                          <Option key={s.sucursal} value={s.sucursal}>
                            {s.sucursal.toUpperCase()} ({s.total_vendedores})
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col xs={24} sm={12} md={5}>
                      <Select
                        placeholder="Filtrar por cargo"
                        style={{ width: '100%' }}
                        allowClear
                        value={selectedCargoFilter}
                        onChange={setSelectedCargoFilter}
                        size="large"
                      >
                        <Option value="admin">Administrador</Option>
                        <Option value="gerente">Gerente</Option>
                        <Option value="vendedor">Vendedor</Option>
                      </Select>
                    </Col>
                    <Col xs={24} md={6}>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleNuevoVendedor}
                        block
                        size="large"
                      >
                        Nuevo Personal
                      </Button>
                    </Col>
                  </Row>
                </Card>

                {/* Tabla */}
                <Card>
                  <Spin spinning={vendedoresLoading}>
                    <Table
                      columns={columnasVendedores}
                      dataSource={vendedoresFiltrados}
                      rowKey="id"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} vendedores`,
                      }}
                      scroll={{ x: 1200 }}
                    />
                  </Spin>
                </Card>
              </>
            ),
          },
          {
            key: 'sucursales',
            label: (
              <span>
                <ShopOutlined />
                Sucursales
                <Badge count={totalSucursales} style={{ marginLeft: 8 }} />
              </span>
            ),
            children: (
              <>
                <Card style={{ marginBottom: 16 }}>
                  <Row gutter={16} align="middle">
                    <Col flex="auto">
                      <Alert
                        message="📌 Información Importante"
                        description="Al crear una nueva sucursal, se creará automáticamente una tabla 'clientes_[nombre_sucursal]' en la base de datos."
                        type="info"
                        showIcon
                      />
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setSucursalModalVisible(true)}
                        size="large"
                      >
                        Nueva Sucursal
                      </Button>
                    </Col>
                  </Row>
                </Card>

                <Row gutter={[16, 16]}>
                  {sucursalesLoading ? (
                    <Col span={24}>
                      <Card>
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                          <Spin size="large" />
                          <p style={{ marginTop: 16, color: '#666' }}>Cargando sucursales...</p>
                        </div>
                      </Card>
                    </Col>
                  ) : (
                    sucursales.map((sucursal) => (
                      <Col xs={24} sm={12} lg={8} key={sucursal.sucursal}>
                        <Card
                          hoverable
                          actions={[
                            <Text type="secondary" key="vendedores">
                              <TeamOutlined /> {sucursal.total_vendedores} vendedor{sucursal.total_vendedores !== 1 ? 'es' : ''}
                            </Text>,
                            <Text type="secondary" key="tabla">
                              📊 clientes_{sucursal.sucursal}
                            </Text>,
                          ]}
                        >
                          <Card.Meta
                            avatar={<ShopOutlined style={{ fontSize: 32, color: '#1890ff' }} />}
                            title={<Title level={4}>{sucursal.sucursal.toUpperCase()}</Title>}
                            description={
                              <Space direction="vertical">
                                <Tag color="success">Activa</Tag>
                                <Text type="secondary">Tabla de clientes creada</Text>
                              </Space>
                            }
                          />
                        </Card>
                      </Col>
                    ))
                  )}
                </Row>
              </>
            ),
          },
        ]}
      />

      {/* Modal: Crear/Editar Vendedor */}
      <Modal
        title={
          <Space>
            {editingVendedor ? <EditOutlined /> : <PlusOutlined />}
            {editingVendedor ? 'Editar Personal' : 'Nuevo Personal'}
          </Space>
        }
        open={vendedorModalVisible}
        onOk={handleVendedorSubmit}
        onCancel={() => {
          setVendedorModalVisible(false);
          vendedorForm.resetFields();
        }}
        okText="Guardar"
        cancelText="Cancelar"
        width={600}
      >
        <Divider />
        <Form form={vendedorForm} layout="vertical">
          <Form.Item
            name="nombre"
            label="Nombre Completo"
            rules={[{ required: true, message: 'Por favor ingresa el nombre completo' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ej: Juan Pérez" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cargo"
                label="Cargo"
                rules={[{ required: true, message: 'Por favor selecciona el cargo' }]}
              >
                <Select placeholder="Selecciona el cargo" size="large">
                  <Option value="Administrador">
                    <CrownOutlined /> Administrador
                  </Option>
                  <Option value="Gerente">
                    <SafetyOutlined /> Gerente
                  </Option>
                  <Option value="Vendedor">
                    <UserOutlined /> Vendedor
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sucursal"
                label="Sucursal"
                rules={[{ required: true, message: 'Por favor selecciona o crea una sucursal' }]}
              >
                <Select
                  placeholder="Selecciona sucursal"
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          // NO cerrar el modal de vendedor, solo abrir el de sucursal
                          setSucursalModalVisible(true);
                        }}
                        block
                      >
                        Crear Nueva Sucursal
                      </Button>
                    </>
                  )}
                >
                  {sucursales.map((s) => (
                    <Option key={s.sucursal} value={s.sucursal}>
                      {s.sucursal.toUpperCase()}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor ingresa el email' },
              { type: 'email', message: 'Por favor ingresa un email válido' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Ej: juan@zarparuy.com" size="large" />
          </Form.Item>

          <Form.Item
            name="telefono"
            label="Teléfono (Opcional)"
          >
            <Input prefix={<PhoneOutlined />} placeholder="Ej: 099-123-456" size="large" />
          </Form.Item>

          {!editingVendedor && (
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[
                { required: true, message: 'Por favor ingresa una contraseña' },
                { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mínimo 6 caracteres" size="large" />
            </Form.Item>
          )}

          {editingVendedor && (
            <Alert
              message="Nota: Para cambiar la contraseña, el usuario debe contactar al administrador."
              type="info"
              showIcon
            />
          )}
        </Form>
      </Modal>

      {/* Modal: Nueva Sucursal */}
      <Modal
        title={
          <Space>
            <PlusOutlined />
            Nueva Sucursal
          </Space>
        }
        open={sucursalModalVisible}
        onOk={handleSucursalSubmit}
        onCancel={() => {
          setSucursalModalVisible(false);
          sucursalForm.resetFields();
        }}
        okText="Crear Sucursal"
        cancelText="Cancelar"
        width={500}
      >
        <Alert
          message="🔔 Creación Automática de Tabla"
          description="Al crear esta sucursal, se creará automáticamente una tabla 'clientes_[nombre]' en la base de datos para gestionar los clientes de esta sucursal."
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Divider />
        <Form form={sucursalForm} layout="vertical">
          <Form.Item
            name="nombre"
            label="Nombre de la Sucursal"
            rules={[
              { required: true, message: 'Por favor ingresa el nombre' },
              { pattern: /^[a-záéíóúñ]+$/i, message: 'Solo letras sin espacios ni caracteres especiales' },
            ]}
            extra="Solo letras, sin espacios (Ej: pando, salto, melo)"
          >
            <Input
              prefix={<ShopOutlined />}
              placeholder="Ej: minas"
              size="large"
              onChange={(e) => sucursalForm.setFieldsValue({ nombre: e.target.value.toLowerCase() })}
            />
          </Form.Item>

          <Form.Item name="direccion" label="Dirección (Opcional)">
            <Input placeholder="Ej: Av. Principal 123" size="large" />
          </Form.Item>

          <Form.Item name="telefono" label="Teléfono (Opcional)">
            <Input prefix={<PhoneOutlined />} placeholder="Ej: 099-123-456" size="large" />
          </Form.Item>

          <Form.Item name="ciudad" label="Ciudad (Opcional)">
            <Input placeholder="Ej: Montevideo" size="large" />
          </Form.Item>

          <Alert
            message="📋 Vista Previa"
            description={
              <div>
                <Text>Nombre Tabla: <Text code>clientes_{sucursalForm.getFieldValue('nombre') || 'nombre'}</Text></Text>
              </div>
            }
            type="info"
            showIcon
          />
        </Form>
      </Modal>
    </div>
  );
};

export default StaffSellers;

