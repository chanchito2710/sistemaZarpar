import React, { useState } from 'react';
import { Card, Typography, Table, Button, Space, Tag, Avatar, Input, Modal, Form, Select, Divider, Collapse } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, PhoneOutlined, MailOutlined, SearchOutlined, BankOutlined } from '@ant-design/icons';
import { BRANCHES } from '../../data/branches';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface Customer {
  key: string;
  id: string;
  nombre: string;
  apellido: string;
  razonSocial?: string;
  rut?: string;
  email: string;
  direccion: string;
  nombreFantasia?: string;
  branchId: string;
  phone: string;
  totalPurchases: number;
  lastPurchase: string;
  status: string;
  type: string;
}

const Customers: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState<Customer[]>([
    {
      key: '1',
      id: 'CLI-001',
      nombre: 'Juan Carlos',
      apellido: 'Pérez',
      razonSocial: 'Pérez Comercial S.A.',
      rut: '12345678901',
      email: 'juan.perez@email.com',
      direccion: 'Av. 18 de Julio 1500, Montevideo',
      nombreFantasia: 'Comercial Pérez',
      branchId: '1',
      phone: '+1 234-567-8901',
      totalPurchases: 2450.00,
      lastPurchase: '2024-01-15',
      status: 'active',
      type: 'premium'
    },
    {
      key: '2',
      id: 'CLI-002',
      nombre: 'María Elena',
      apellido: 'García',
      email: 'maria.garcia@email.com',
      direccion: 'Calle Rivera 234, Maldonado',
      branchId: '2',
      phone: '+1 234-567-8902',
      totalPurchases: 890.50,
      lastPurchase: '2024-01-10',
      status: 'active',
      type: 'regular'
    },
    {
      key: '3',
      id: 'CLI-003',
      nombre: 'Carlos Alberto',
      apellido: 'López',
      razonSocial: 'López & Asociados',
      rut: '98765432109',
      email: 'carlos.lopez@email.com',
      direccion: 'Av. Artigas 567, Paysandú',
      nombreFantasia: 'López Asociados',
      branchId: '3',
      phone: '+1 234-567-8903',
      totalPurchases: 5200.00,
      lastPurchase: '2024-01-14',
      status: 'active',
      type: 'vip'
    }
  ]);

  const handleAddCustomer = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newCustomer: Customer = {
        key: `${customers.length + 1}`,
        id: `CLI-${String(customers.length + 1).padStart(3, '0')}`,
        nombre: values.nombre,
        apellido: values.apellido,
        razonSocial: values.razonSocial,
        rut: values.rut,
        email: values.email,
        direccion: values.direccion,
        nombreFantasia: values.nombreFantasia,
        branchId: values.branchId,
        phone: values.phone || '+1 000-000-0000',
        totalPurchases: 0,
        lastPurchase: new Date().toISOString().split('T')[0],
        status: 'active',
        type: 'regular'
      };
      
      setCustomers([...customers, newCustomer]);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error al validar el formulario:', error);
    }
  };

  const getBranchName = (branchId: string) => {
    const branch = BRANCHES.find(b => b.id === branchId);
    return branch ? branch.name : 'Sin sucursal';
  };

  const getCustomersByBranch = () => {
    const customersByBranch: { [key: string]: Customer[] } = {};
    
    customers.forEach(customer => {
      const branchName = getBranchName(customer.branchId);
      if (!customersByBranch[branchName]) {
        customersByBranch[branchName] = [];
      }
      customersByBranch[branchName].push(customer);
    });
    
    return customersByBranch;
  };

  const columns = [
    {
      title: 'Cliente',
      key: 'customer',
      render: (record: Customer) => (
        <Space>
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: record.type === 'vip' ? '#722ed1' : 
                              record.type === 'premium' ? '#fa8c16' : '#1890ff' 
            }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{`${record.nombre} ${record.apellido}`}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>ID: {record.id}</Text>
            {record.nombreFantasia && (
              <div><Text type="secondary" style={{ fontSize: 11 }}>{record.nombreFantasia}</Text></div>
            )}
          </div>
        </Space>
      )
    },
    {
      title: 'Contacto',
      key: 'contact',
      render: (record: Customer) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <MailOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            <Text style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <PhoneOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            <Text style={{ fontSize: 12 }}>{record.phone}</Text>
          </div>
          <div>
            <BankOutlined style={{ marginRight: 4, color: '#fa8c16' }} />
            <Text style={{ fontSize: 12 }}>{record.direccion}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const config = {
          vip: { color: 'purple', text: 'VIP' },
          premium: { color: 'orange', text: 'Premium' },
          regular: { color: 'blue', text: 'Regular' }
        };
        return <Tag color={config[type as keyof typeof config].color}>{config[type as keyof typeof config].text}</Tag>;
      }
    },
    {
      title: 'Total Compras',
      dataIndex: 'totalPurchases',
      key: 'totalPurchases',
      render: (total: number) => `$${total.toFixed(2)}`,
      sorter: (a: any, b: any) => a.totalPurchases - b.totalPurchases
    },
    {
      title: 'Última Compra',
      dataIndex: 'lastPurchase',
      key: 'lastPurchase',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Activo' : 'Inactivo'}
        </Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="text" icon={<EditOutlined />} size="small" />
          <Button type="text" icon={<UserOutlined />} size="small" />
        </Space>
      )
    }
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <UserOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
          Gestión de Clientes
        </Title>
        <Text type="secondary">
          Administra la base de datos de clientes y su historial
        </Text>
      </div>

      <Card 
        title="Base de Clientes" 
        className="hover-lift"
        extra={
          <Space>
            <Search 
              placeholder="Buscar clientes..." 
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCustomer}>
              Nuevo Cliente
            </Button>
          </Space>
        }
      >
        <Collapse defaultActiveKey={Object.keys(getCustomersByBranch())}>
          {Object.entries(getCustomersByBranch()).map(([branchName, branchCustomers]) => (
            <Panel 
              key={branchName} 
              header={
                <Space>
                  <BankOutlined style={{ color: '#1890ff' }} />
                  <Text strong>{branchName}</Text>
                  <Tag color="blue">{branchCustomers.length} clientes</Tag>
                </Space>
              }
            >
              <Table 
                columns={columns} 
                dataSource={branchCustomers} 
                pagination={false}
                scroll={{ x: 1000 }}
                size="small"
              />
            </Panel>
          ))}
        </Collapse>
      </Card>

      <Modal
        title="Agregar Nuevo Cliente"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText="Guardar Cliente"
        cancelText="Cancelar"
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="Nombre"
              name="nombre"
              rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
            >
              <Input placeholder="Ingrese el nombre" />
            </Form.Item>

            <Form.Item
              label="Apellido"
              name="apellido"
              rules={[{ required: true, message: 'Por favor ingrese el apellido' }]}
            >
              <Input placeholder="Ingrese el apellido" />
            </Form.Item>
          </div>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Por favor ingrese el email' },
              { type: 'email', message: 'Por favor ingrese un email válido' }
            ]}
          >
            <Input placeholder="Ingrese el email" />
          </Form.Item>

          <Form.Item
            label="Dirección"
            name="direccion"
            rules={[{ required: true, message: 'Por favor ingrese la dirección' }]}
          >
            <Input placeholder="Ingrese la dirección" />
          </Form.Item>

          <Form.Item
            label="Sucursal"
            name="branchId"
            rules={[{ required: true, message: 'Por favor seleccione una sucursal' }]}
          >
            <Select placeholder="Seleccione una sucursal">
              {BRANCHES.filter(branch => branch.active).map(branch => (
                <Option key={branch.id} value={branch.id}>
                  {branch.name} - {branch.address}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider orientation="left">Información Opcional</Divider>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="Razón Social"
              name="razonSocial"
            >
              <Input placeholder="Ingrese la razón social" />
            </Form.Item>

            <Form.Item
              label="RUT"
              name="rut"
            >
              <Input placeholder="Ingrese el RUT" />
            </Form.Item>
          </div>

          <Form.Item
            label="Nombre de Fantasía"
            name="nombreFantasia"
          >
            <Input placeholder="Ingrese el nombre de fantasía" />
          </Form.Item>

          <Form.Item
            label="Teléfono"
            name="phone"
          >
            <Input placeholder="Ingrese el teléfono" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;