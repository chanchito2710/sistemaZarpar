import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Select,
  Form,
  Modal,
  Input,
  message,
  Spin
} from 'antd';
import {
  ShopOutlined,
  UserOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { vendedoresService, clientesService, type Cliente, type Vendedor } from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * UTILIDADES PARA NOMBRES DE SUCURSALES
 */

/**
 * Formatear nombre de sucursal para mostrar: capitaliza cada palabra
 * "rionegro" → "Rio Negro"
 * "cerrolargo" → "Cerro Largo"
 */
const formatearNombreSucursal = (nombre: string): string => {
  const normalizado = nombre.toLowerCase().trim();
  
  // Lista de sucursales conocidas con espacios
  const sucursalesConEspacios: { [key: string]: string } = {
    'rionegro': 'Rio Negro',
    'cerrolargo': 'Cerro Largo',
    'treintaytres': 'Treinta Y Tres',
    'floresdalsur': 'Flores Dal Sur',
    // Agregar más según necesites
  };
  
  // Si está en la lista, usar el formato conocido
  if (sucursalesConEspacios[normalizado]) {
    return sucursalesConEspacios[normalizado];
  }
  
  // Si no, capitalizar la primera letra
  return normalizado.charAt(0).toUpperCase() + normalizado.slice(1);
};

const POS: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth(); // Obtener usuario logueado
  const [form] = Form.useForm();
  const [clientForm] = Form.useForm();
  
  // Estados para las selecciones
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  const [selectedClient, setSelectedClient] = useState<number | undefined>(undefined);
  const [selectedSeller, setSelectedSeller] = useState<number | undefined>(undefined);
  
  // Estados para los datos de la API
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  
  // Estados de carga
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingVendedores, setLoadingVendedores] = useState(false);
  const [creatingCliente, setCreatingCliente] = useState(false);
  
  // Modal
  const [isClientModalVisible, setIsClientModalVisible] = useState(false);

  const isFormComplete = selectedBranch && selectedClient && selectedSeller;

  /**
   * Efecto inicial: cargar sucursales y auto-seleccionar según usuario
   */
  useEffect(() => {
    cargarSucursalesIniciales();
  }, []);

  /**
   * Efecto: cuando se carga el usuario y las sucursales, auto-seleccionar
   */
  useEffect(() => {
    if (usuario && sucursales.length > 0) {
      // Si NO es admin, auto-seleccionar su sucursal
      if (!usuario.esAdmin) {
        const sucursalUsuario = usuario.sucursal?.toLowerCase();
        if (sucursalUsuario && sucursales.includes(sucursalUsuario)) {
          setSelectedBranch(sucursalUsuario);
        }
      }
    }
  }, [usuario, sucursales]);

  /**
   * Efecto: cargar vendedores y clientes cuando se selecciona una sucursal
   */
  useEffect(() => {
    if (selectedBranch) {
      // IMPORTANTE: Limpiar arrays ANTES de cargar nuevos datos
      // Esto previene que se muestren datos de la sucursal anterior
      setClientes([]);
      setVendedores([]);
      
      // Resetear selecciones
      setSelectedClient(undefined);
      setSelectedSeller(undefined);
      
      // Cargar nuevos datos
      cargarVendedores(selectedBranch);
      cargarClientes(selectedBranch);
    } else {
      setVendedores([]);
      setClientes([]);
      setSelectedSeller(undefined);
      setSelectedClient(undefined);
    }
  }, [selectedBranch]);

  /**
   * Efecto: auto-seleccionar vendedor SOLO para usuarios no-admin en su propia sucursal
   */
  useEffect(() => {
    // Solo auto-seleccionar si:
    // 1. Hay vendedores cargados
    // 2. Hay un usuario logueado
    // 3. El usuario NO es admin
    // 4. La sucursal seleccionada coincide con la del usuario
    if (
      vendedores.length > 0 && 
      usuario && 
      !usuario.esAdmin && 
      selectedBranch
    ) {
      // Verificar que la sucursal seleccionada sea la del usuario
      const sucursalUsuario = usuario.sucursal?.toLowerCase();
      const sucursalSeleccionada = selectedBranch.toLowerCase();
      
      if (sucursalUsuario === sucursalSeleccionada) {
        // Buscar el vendedor que coincida con el email del usuario
        const vendedorUsuario = vendedores.find(v => 
          v.email?.toLowerCase() === usuario.email?.toLowerCase()
        );
        
        if (vendedorUsuario) {
          setSelectedSeller(vendedorUsuario.id);
        } else {
          console.warn('[POS] Vendedor del usuario no encontrado en la lista de vendedores');
          setSelectedSeller(undefined);
        }
      } else {
        // Si la sucursal seleccionada no coincide con la del usuario, resetear
        setSelectedSeller(undefined);
      }
    }
  }, [vendedores, usuario, selectedBranch]);

  /**
   * Cargar sucursales desde la base de datos
   */
  const cargarSucursalesIniciales = async () => {
    setLoadingSucursales(true);
    try {
      const sucursalesData = await vendedoresService.obtenerSucursales();
      setSucursales(sucursalesData);
    } catch (error) {
      message.error('Error al cargar sucursales');
      console.error(error);
    } finally {
      setLoadingSucursales(false);
    }
  };

  /**
   * Cargar vendedores de una sucursal
   */
  const cargarVendedores = async (sucursal: string) => {
    setLoadingVendedores(true);
    try {
      const vendedoresData = await vendedoresService.obtenerPorSucursal(sucursal);
      setVendedores(vendedoresData);
    } catch (error) {
      message.error('Error al cargar vendedores');
      console.error(error);
    } finally {
      setLoadingVendedores(false);
    }
  };

  /**
   * Cargar clientes de una sucursal
   */
  const cargarClientes = async (sucursal: string) => {
    setLoadingClientes(true);
    try {
      const clientesData = await clientesService.obtenerPorSucursal(sucursal);
      setClientes(clientesData);
    } catch (error) {
      message.error('Error al cargar clientes');
      console.error(error);
    } finally {
      setLoadingClientes(false);
    }
  };

  /**
   * Manejar navegación al siguiente paso
   */
  const handleNext = () => {
    if (isFormComplete) {
      // Obtener los datos completos de los seleccionados
      const cliente = clientes.find(c => c.id === selectedClient);
      const vendedor = vendedores.find(v => v.id === selectedSeller);
      
      // Capitalizar primera letra de la sucursal para mostrar
      const sucursalCapitalizada = selectedBranch 
        ? selectedBranch.charAt(0).toUpperCase() + selectedBranch.slice(1).toLowerCase()
        : selectedBranch;
      
      // Navegar a la página del carrito con los datos seleccionados
      navigate('/pos/cart', {
        state: {
          sucursal: selectedBranch,
          clienteId: selectedClient,
          clienteNombre: `${cliente?.nombre} ${cliente?.apellido}`,
          vendedorId: selectedSeller,
          vendedorNombre: vendedor?.nombre
        }
      });
    }
  };

  const handleAddClient = () => {
    setIsClientModalVisible(true);
  };

  /**
   * Cerrar modal de nuevo cliente
   */
  const handleClientModalCancel = () => {
    setIsClientModalVisible(false);
    clientForm.resetFields();
  };

  /**
   * Crear nuevo cliente en la base de datos
   */
  const handleClientModalOk = async () => {
    if (!selectedBranch) {
      message.error('Primero selecciona una sucursal');
      return;
    }

    try {
      setCreatingCliente(true);
      const values = await clientForm.validateFields();
      
      // Preparar datos del cliente para la API
      const nuevoClienteData = {
        nombre: values.firstName,
        apellido: values.lastName,
        email: values.email,
        direccion: values.address,
        telefono: values.telefono,
        razon_social: values.companyName || undefined,
        rut: values.rut || undefined,
        nombre_fantasia: values.fantasyName || undefined,
        vendedor_id: selectedSeller || undefined
      };
      
      // Crear cliente en la API
      const nuevoCliente = await clientesService.crear(selectedBranch, nuevoClienteData);
      
      // Agregar el nuevo cliente a la lista local
      setClientes(prev => [...prev, nuevoCliente]);
      
      // Seleccionar automáticamente el nuevo cliente
      setSelectedClient(nuevoCliente.id);
      
      message.success('Cliente creado exitosamente');
      setIsClientModalVisible(false);
      clientForm.resetFields();
    } catch (error) {
      console.error('Error al crear cliente:', error);
      message.error('Error al crear el cliente. Por favor intenta nuevamente.');
    } finally {
      setCreatingCliente(false);
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflowX: 'hidden'
    }}>
      <div style={{ maxWidth: '800px', width: '100%', overflowX: 'hidden' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={1} style={{ color: 'white', marginBottom: '8px', fontSize: '2.5rem' }}>
            Control de Stock y Facturación
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
            Selecciona los datos necesarios para continuar
          </Text>
        </div>

        {/* Main Card */}
        <Card 
          style={{ 
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: 'none'
          }}
        >
          <Form form={form} layout="vertical" size="large">
            <Row gutter={[16, 16]}>
              {/* Sucursal */}
              <Col xs={24} md={8}>
                <Card 
                  hoverable
                  style={{ 
                    textAlign: 'center',
                    borderRadius: '12px',
                    border: selectedBranch ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    background: selectedBranch ? '#f0f8ff' : 'white'
                  }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <ShopOutlined 
                      style={{ 
                        fontSize: '48px', 
                        color: selectedBranch ? '#1890ff' : '#8c8c8c'
                      }} 
                    />
                    <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                      Sucursal
                    </Title>
                    <Select
                      placeholder="Seleccionar sucursal"
                      style={{ width: '100%' }}
                      value={selectedBranch}
                      onChange={setSelectedBranch}
                      size="large"
                      loading={loadingSucursales}
                      disabled={!usuario?.esAdmin && !!selectedBranch}
                    >
                      {sucursales.map(sucursal => (
                        <Option key={sucursal} value={sucursal.toLowerCase()}>
                          {formatearNombreSucursal(sucursal)}
                        </Option>
                      ))}
                    </Select>
                  </Space>
                </Card>
              </Col>

              {/* Cliente */}
              <Col xs={24} md={8}>
                <Card 
                  hoverable
                  style={{ 
                    textAlign: 'center',
                    borderRadius: '12px',
                    border: selectedClient ? '2px solid #52c41a' : '1px solid #d9d9d9',
                    background: selectedClient ? '#f6ffed' : 'white'
                  }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <UserOutlined 
                      style={{ 
                        fontSize: '48px', 
                        color: selectedClient ? '#52c41a' : '#8c8c8c'
                      }} 
                    />
                    <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                      Cliente
                    </Title>
                    <Select
                      key={`clientes-${selectedBranch}`}
                      placeholder={!selectedBranch ? "Primero selecciona una sucursal" : "Seleccionar cliente"}
                      style={{ width: '100%' }}
                      value={selectedClient}
                      onChange={setSelectedClient}
                      size="large"
                      showSearch
                      disabled={!selectedBranch || loadingClientes}
                      loading={loadingClientes}
                      filterOption={(input, option) => {
                        const label = option?.children as unknown as string;
                        return label.toLowerCase().includes(input.toLowerCase());
                      }}
                      notFoundContent={loadingClientes ? <Spin size="small" /> : "No hay clientes disponibles"}
                    >
                      {clientes.map(cliente => (
                        <Option key={cliente.id} value={cliente.id}>
                          {`${cliente.nombre} ${cliente.apellido}`}
                          {cliente.nombre_fantasia && ` - ${cliente.nombre_fantasia}`}
                        </Option>
                      ))}
                    </Select>
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={handleAddClient}
                      style={{
                        width: '100%',
                        marginTop: '8px',
                        borderColor: '#52c41a',
                        color: '#52c41a'
                      }}
                    >
                      Nuevo Cliente
                    </Button>
                  </Space>
                </Card>
              </Col>

              {/* Vendedor */}
              <Col xs={24} md={8}>
                <Card 
                  hoverable
                  style={{ 
                    textAlign: 'center',
                    borderRadius: '12px',
                    border: selectedSeller ? '2px solid #fa8c16' : '1px solid #d9d9d9',
                    background: selectedSeller ? '#fff7e6' : 'white'
                  }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <TeamOutlined 
                      style={{ 
                        fontSize: '48px', 
                        color: selectedSeller ? '#fa8c16' : '#8c8c8c'
                      }} 
                    />
                    <Title level={4} style={{ margin: 0, color: '#fa8c16' }}>
                      Vendedor
                    </Title>
                    <Select
                      key={`vendedores-${selectedBranch}`}
                      placeholder={!selectedBranch ? "Primero selecciona una sucursal" : "Seleccionar vendedor"}
                      style={{ width: '100%' }}
                      value={selectedSeller}
                      onChange={setSelectedSeller}
                      size="large"
                      disabled={!selectedBranch || loadingVendedores || (!usuario?.esAdmin && !!selectedSeller)}
                      loading={loadingVendedores}
                      notFoundContent={loadingVendedores ? <Spin size="small" /> : "No hay vendedores disponibles"}
                    >
                      {vendedores.map(vendedor => (
                        <Option key={vendedor.id} value={vendedor.id}>
                          {vendedor.nombre} - {vendedor.cargo}
                        </Option>
                      ))}
                    </Select>
                    {!usuario?.esAdmin && selectedSeller && (
                      <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                        Auto-seleccionado según tu usuario
                      </Text>
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Next Button */}
            <Row justify="center" style={{ marginTop: '40px' }}>
              <Col>
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={handleNext}
                  disabled={!isFormComplete}
                  style={{
                    height: '56px',
                    padding: '0 48px',
                    fontSize: '18px',
                    borderRadius: '28px',
                    background: isFormComplete 
                      ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' 
                      : undefined,
                    border: 'none',
                    boxShadow: isFormComplete 
                      ? '0 8px 16px rgba(24, 144, 255, 0.3)' 
                      : undefined
                  }}
                >
                  Siguiente
                </Button>
              </Col>
            </Row>

            {/* Status indicator */}
            {!isFormComplete && (
              <Row justify="center" style={{ marginTop: '16px' }}>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Completa todos los campos para continuar
                </Text>
              </Row>
            )}
          </Form>
        </Card>

        {/* Modal para agregar nuevo cliente */}
        <Modal
          title="Agregar Nuevo Cliente"
          open={isClientModalVisible}
          onOk={handleClientModalOk}
          onCancel={handleClientModalCancel}
          width={600}
          okText="Agregar Cliente"
          cancelText="Cancelar"
          confirmLoading={creatingCliente}
          okButtonProps={{ disabled: creatingCliente }}
        >
          <Form
            form={clientForm}
            layout="vertical"
            requiredMark={false}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Nombre"
                  name="firstName"
                  rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
                >
                  <Input placeholder="Ingresa el nombre" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Apellido"
                  name="lastName"
                  rules={[{ required: true, message: 'Por favor ingresa el apellido' }]}
                >
                  <Input placeholder="Ingresa el apellido" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Por favor ingresa el email' },
                    { type: 'email', message: 'Por favor ingresa un email válido' }
                  ]}
                >
                  <Input placeholder="Ingresa el email" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Teléfono"
                  name="telefono"
                  rules={[
                    { required: true, message: 'Por favor ingresa el teléfono' },
                    { min: 8, message: 'El teléfono debe tener al menos 8 dígitos' },
                    { max: 20, message: 'El teléfono no puede tener más de 20 caracteres' }
                  ]}
                >
                  <Input placeholder="Ingresa el teléfono" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Dirección"
              name="address"
              rules={[{ required: true, message: 'Por favor ingresa la dirección' }]}
            >
              <Input placeholder="Ingresa la dirección" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Razón Social (Opcional)"
                  name="companyName"
                >
                  <Input placeholder="Ingresa la razón social" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="RUT (Opcional)"
                  name="rut"
                >
                  <Input placeholder="Ingresa el RUT" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Nombre de Fantasía (Opcional)"
              name="fantasyName"
            >
              <Input placeholder="Ingresa el nombre de fantasía" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default POS;