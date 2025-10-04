import React, { useState } from 'react';
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
  message
} from 'antd';
import {
  ShopOutlined,
  UserOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { BRANCHES, SELLERS } from '../../data/branches';

const { Title, Text } = Typography;
const { Option } = Select;



const POS: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [clientForm] = Form.useForm();
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  const [selectedClient, setSelectedClient] = useState<string | undefined>(undefined);
  const [selectedSeller, setSelectedSeller] = useState<string | undefined>(undefined);
  const [isClientModalVisible, setIsClientModalVisible] = useState(false);
  const [clientsList, setClientsList] = useState([
    { value: 'cliente-1', label: 'Juan Pérez' },
    { value: 'cliente-2', label: 'María García' },
    { value: 'cliente-3', label: 'Carlos López' },
    { value: 'cliente-4', label: 'Ana Martínez' },
    { value: 'cliente-5', label: 'Luis Rodríguez' }
  ]);

  // Datos dinámicos desde configuración centralizada
  const branches = BRANCHES.filter(branch => branch.active).map(branch => ({
    value: branch.id,
    label: branch.name
  }));

  const clients = clientsList;

  const sellers = SELLERS.map(seller => ({
    value: seller.id,
    label: `${seller.firstName} ${seller.lastName}`
  }));

  const isFormComplete = selectedBranch && selectedClient && selectedSeller;

  const handleNext = () => {
    if (isFormComplete) {
      // Obtener los labels de los valores seleccionados
      const selectedBranchLabel = branches.find(b => b.value === selectedBranch)?.label || selectedBranch;
      const selectedClientLabel = clients.find(c => c.value === selectedClient)?.label || selectedClient;
      const selectedSellerLabel = sellers.find(s => s.value === selectedSeller)?.label || selectedSeller;
      
      // Navegar a la página de productos con los datos seleccionados
      navigate('/products', {
        state: {
          branch: selectedBranchLabel,
          client: selectedClientLabel,
          seller: selectedSellerLabel
        }
      });
    }
  };

  const handleAddClient = () => {
    setIsClientModalVisible(true);
  };

  const handleClientModalCancel = () => {
    setIsClientModalVisible(false);
    clientForm.resetFields();
  };

  const handleClientModalOk = async () => {
    try {
      const values = await clientForm.validateFields();
      
      // Generar un ID único para el nuevo cliente
      const newClientId = `cliente-${Date.now()}`;
      const newClientLabel = `${values.firstName} ${values.lastName}`;
      
      // Agregar el nuevo cliente a la lista
      const newClient = {
        value: newClientId,
        label: newClientLabel
      };
      
      setClientsList(prev => [...prev, newClient]);
      setSelectedClient(newClientId);
      
      message.success('Cliente agregado exitosamente');
      setIsClientModalVisible(false);
      clientForm.resetFields();
    } catch (error) {
       console.error('Error al validar el formulario:', error);
     }
   };

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
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
            <Row gutter={[24, 24]}>
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
                    >
                      {branches.map(branch => (
                        <Option key={branch.value} value={branch.value}>
                          {branch.label}
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
                      placeholder="Seleccionar cliente"
                      style={{ width: '100%' }}
                      value={selectedClient}
                      onChange={setSelectedClient}
                      size="large"
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {clients.map(client => (
                        <Option key={client.value} value={client.value}>
                          {client.label}
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
                      placeholder="Seleccionar vendedor"
                      style={{ width: '100%' }}
                      value={selectedSeller}
                      onChange={setSelectedSeller}
                      size="large"
                    >
                      {sellers.map(seller => (
                        <Option key={seller.value} value={seller.value}>
                          {seller.label}
                        </Option>
                      ))}
                    </Select>
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
                  label="Sucursal"
                  name="branch"
                  rules={[{ required: true, message: 'Por favor selecciona una sucursal' }]}
                >
                  <Select placeholder="Seleccionar sucursal">
                    {BRANCHES.filter(branch => branch.active).map(branch => (
                      <Option key={branch.id} value={branch.id}>
                        {branch.name}
                      </Option>
                    ))}
                  </Select>
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