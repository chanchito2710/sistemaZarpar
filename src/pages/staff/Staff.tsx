import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Statistic, Row, Col, Input, Select, Tabs, Modal, Form, message, Popconfirm } from 'antd';
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
  EnvironmentOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { BRANCHES, SELLERS, getBranchById, getSellersByBranch, getBranchOptions, getSellerOptions } from '../../data/branches';
import type { Branch, User } from '../../types';
import { vendedoresService, type Vendedor } from '../../services/api';

const { TabPane } = Tabs;
const { Option } = Select;

interface BranchFormData {
  name: string;
  address: string;
  phone: string;
}

interface SellerFormData {
  name: string;
  email: string;
  role: 'manager' | 'seller' | 'cashier';
  branchId: string;
}

const Staff: React.FC = () => {
  // Estados para sucursales
  const [branches, setBranches] = useState<Branch[]>(BRANCHES);
  const [branchSearchText, setBranchSearchText] = useState('');
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm] = Form.useForm();

  // Estados para vendedores
  const [sellers, setSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sellerSearchText, setSellerSearchText] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string | undefined>(undefined);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string | undefined>(undefined);
  const [sellerModalVisible, setSellerModalVisible] = useState(false);
  const [editingSeller, setEditingSeller] = useState<User | null>(null);
  const [sellerForm] = Form.useForm();

  /**
   * 🔄 Convertir Vendedor (API) a User (Frontend)
   */
  const vendedorToUser = (vendedor: Vendedor): User => {
    // Mapear cargo a role
    const cargoToRole = (cargo: string): 'admin' | 'manager' | 'seller' | 'cashier' => {
      const cargoLower = cargo.toLowerCase();
      if (cargoLower.includes('gerente') || cargoLower.includes('manager')) return 'manager';
      if (cargoLower.includes('cajero') || cargoLower.includes('cashier')) return 'cashier';
      if (cargoLower.includes('admin')) return 'admin';
      return 'seller';
    };

    return {
      id: vendedor.id.toString(),
      name: vendedor.nombre,
      email: vendedor.email || '',
      role: cargoToRole(vendedor.cargo),
      branchId: vendedor.sucursal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  /**
   * 🔄 Cargar vendedores desde la API
   */
  useEffect(() => {
    cargarVendedores();
  }, []);

  const cargarVendedores = async () => {
    try {
      setLoading(true);
      const vendedores = await vendedoresService.obtenerTodos();
      const usuarios = vendedores.map(vendedorToUser);
      setSellers(usuarios);
    } catch (error) {
      console.error('Error al cargar vendedores:', error);
      message.error('Error al cargar vendedores');
    } finally {
      setLoading(false);
    }
  };

  // Filtros para sucursales
  const filteredBranches = branches.filter(branch => 
    branch.name.toLowerCase().includes(branchSearchText.toLowerCase()) ||
    branch.address.toLowerCase().includes(branchSearchText.toLowerCase())
  );

  // Filtros para vendedores
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(sellerSearchText.toLowerCase()) ||
                         seller.email.toLowerCase().includes(sellerSearchText.toLowerCase());
    const matchesBranch = !selectedBranchFilter || seller.branchId === selectedBranchFilter;
    const matchesRole = !selectedRoleFilter || seller.role === selectedRoleFilter;
    
    return matchesSearch && matchesBranch && matchesRole;
  });

  // Funciones para sucursales
  const handleAddBranch = () => {
    setEditingBranch(null);
    branchForm.resetFields();
    setBranchModalVisible(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    branchForm.setFieldsValue({
      name: branch.name,
      address: branch.address,
      phone: branch.phone
    });
    setBranchModalVisible(true);
  };

  const handleBranchSubmit = async () => {
    try {
      const values = await branchForm.validateFields();
      
      if (editingBranch) {
        // Editar sucursal existente
        setBranches(prev => prev.map(branch => 
          branch.id === editingBranch.id 
            ? { ...branch, ...values, updatedAt: new Date().toISOString() }
            : branch
        ));
        message.success('Sucursal actualizada correctamente');
      } else {
        // Agregar nueva sucursal
        const newBranch: Branch = {
          id: `B${Date.now()}`,
          ...values,
          active: true,
          createdAt: new Date().toISOString()
        };
        setBranches(prev => [...prev, newBranch]);
        message.success('Sucursal agregada correctamente');
      }
      
      setBranchModalVisible(false);
      branchForm.resetFields();
    } catch (error) {
      console.error('Error al guardar sucursal:', error);
    }
  };

  const handleDeleteBranch = (branchId: string) => {
    const branchSellers = getSellersByBranch(branchId);
    if (branchSellers.length > 0) {
      message.error('No se puede eliminar una sucursal que tiene vendedores asignados');
      return;
    }
    
    setBranches(prev => prev.filter(branch => branch.id !== branchId));
    message.success('Sucursal eliminada correctamente');
  };

  // Funciones para vendedores
  const handleAddSeller = () => {
    setEditingSeller(null);
    sellerForm.resetFields();
    setSellerModalVisible(true);
  };

  const handleEditSeller = (seller: User) => {
    setEditingSeller(seller);
    sellerForm.setFieldsValue({
      name: seller.name,
      email: seller.email,
      role: seller.role,
      branchId: seller.branchId
    });
    setSellerModalVisible(true);
  };

  const handleSellerSubmit = async () => {
    try {
      const values = await sellerForm.validateFields();
      
      if (editingSeller) {
        // Editar vendedor existente
        setSellers(prev => prev.map(seller => 
          seller.id === editingSeller.id 
            ? { ...seller, ...values, updatedAt: new Date().toISOString() }
            : seller
        ));
        message.success('Vendedor actualizado correctamente');
      } else {
        // Agregar nuevo vendedor
        const newSeller: User = {
          id: `U${Date.now()}`,
          ...values,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setSellers(prev => [...prev, newSeller]);
        message.success('Vendedor agregado correctamente');
      }
      
      setSellerModalVisible(false);
      sellerForm.resetFields();
    } catch (error) {
      console.error('Error al guardar vendedor:', error);
    }
  };

  const handleDeleteSeller = async (sellerId: string) => {
    try {
      setLoading(true);
      await vendedoresService.eliminar(Number(sellerId));
      message.success('✅ Vendedor desactivado exitosamente');
      // Recargar la lista de vendedores
      await cargarVendedores();
    } catch (error) {
      console.error('Error al eliminar vendedor:', error);
      message.error('❌ Error al desactivar el vendedor');
    } finally {
      setLoading(false);
    }
  };

  // Utilidades
  const getRoleText = (role: string) => {
    switch (role) {
      case 'manager': return 'Gerente';
      case 'seller': return 'Vendedor';
      case 'cashier': return 'Cajero';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'gold';
      case 'seller': return 'blue';
      case 'cashier': return 'green';
      default: return 'default';
    }
  };

  // Columnas para tabla de sucursales
  const branchColumns: ColumnsType<Branch> = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Dirección',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => (
        <Space>
          <EnvironmentOutlined />
          {address}
        </Space>
      ),
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <Space>
          <PhoneOutlined />
          {phone}
        </Space>
      ),
    },
    {
      title: 'Vendedores',
      key: 'sellers',
      render: (_, record) => {
        const branchSellers = getSellersByBranch(record.id);
        return (
          <Tag color="blue">
            {branchSellers.length} vendedor{branchSellers.length !== 1 ? 'es' : ''}
          </Tag>
        );
      },
    },
    {
      title: 'Estado',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Activa' : 'Inactiva'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditBranch(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Estás seguro de eliminar esta sucursal?"
            onConfirm={() => handleDeleteBranch(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Columnas para tabla de vendedores
  const sellerColumns: ColumnsType<User> = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Space>
          <MailOutlined />
          {email}
        </Space>
      ),
    },
    {
      title: 'Cargo',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      ),
    },
    {
      title: 'Sucursal',
      dataIndex: 'branchId',
      key: 'branchId',
      render: (branchId: string) => {
        const branch = getBranchById(branchId);
        return branch ? branch.name : 'Sin asignar';
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditSeller(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Desactivar este vendedor?"
            description="El vendedor será desactivado pero no se eliminará de la base de datos. Podrá reactivarse después."
            onConfirm={() => handleDeleteSeller(record.id)}
            okText="Sí, desactivar"
            cancelText="Cancelar"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Desactivar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Estadísticas
  const totalBranches = branches.length;
  const activeBranches = branches.filter(branch => branch.active).length;
  const totalSellers = sellers.length;
  const managerCount = sellers.filter(seller => seller.role === 'manager').length;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Gestión de Sucursales y Vendedores</h1>
        <p style={{ color: '#666', margin: '8px 0 0 0' }}>Administra las sucursales y su personal de ventas</p>
      </div>

      {/* Estadísticas */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Sucursales"
              value={totalBranches}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sucursales Activas"
              value={activeBranches}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Vendedores"
              value={totalSellers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Gerentes"
              value={managerCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs para Sucursales y Vendedores */}
      <Tabs defaultActiveKey="branches">
        <TabPane tab="Sucursales" key="branches">
          {/* Filtros y búsqueda para sucursales */}
          <Card style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={16}>
                <Input
                  placeholder="Buscar por nombre o dirección..."
                  prefix={<SearchOutlined />}
                  value={branchSearchText}
                  onChange={(e) => setBranchSearchText(e.target.value)}
                />
              </Col>
              <Col span={8}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddBranch} style={{ width: '100%' }}>
                  Nueva Sucursal
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Tabla de sucursales */}
          <Card title="Lista de Sucursales">
            <Table
              columns={branchColumns}
              dataSource={filteredBranches}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} sucursales`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Vendedores" key="sellers">
          {/* Filtros y búsqueda para vendedores */}
          <Card style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Input
                  placeholder="Buscar por nombre o email..."
                  prefix={<SearchOutlined />}
                  value={sellerSearchText}
                  onChange={(e) => setSellerSearchText(e.target.value)}
                />
              </Col>
              <Col span={5}>
                <Select
                  placeholder="Filtrar por sucursal"
                  style={{ width: '100%' }}
                  allowClear
                  value={selectedBranchFilter}
                  onChange={setSelectedBranchFilter}
                >
                  {getBranchOptions().map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={5}>
                <Select
                  placeholder="Filtrar por cargo"
                  style={{ width: '100%' }}
                  allowClear
                  value={selectedRoleFilter}
                  onChange={setSelectedRoleFilter}
                >
                  <Option value="manager">Gerente</Option>
                  <Option value="seller">Vendedor</Option>
                  <Option value="cashier">Cajero</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSeller} style={{ width: '100%' }}>
                  Nuevo Vendedor
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Tabla de vendedores */}
          <Card title="Lista de Vendedores">
            <Table
              columns={sellerColumns}
              dataSource={filteredSellers}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} vendedores`,
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Modal para agregar/editar sucursal */}
      <Modal
        title={editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
        open={branchModalVisible}
        onOk={handleBranchSubmit}
        onCancel={() => {
          setBranchModalVisible(false);
          branchForm.resetFields();
        }}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={branchForm} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre de la Sucursal"
            rules={[{ required: true, message: 'Por favor ingresa el nombre de la sucursal' }]}
          >
            <Input placeholder="Ej: Sucursal Centro" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Dirección"
            rules={[{ required: true, message: 'Por favor ingresa la dirección' }]}
          >
            <Input placeholder="Ej: Av. Principal 123" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Teléfono"
            rules={[{ required: true, message: 'Por favor ingresa el teléfono' }]}
          >
            <Input placeholder="Ej: 099-123-456" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para agregar/editar vendedor */}
      <Modal
        title={editingSeller ? 'Editar Vendedor' : 'Nuevo Vendedor'}
        open={sellerModalVisible}
        onOk={handleSellerSubmit}
        onCancel={() => {
          setSellerModalVisible(false);
          sellerForm.resetFields();
        }}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={sellerForm} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre Completo"
            rules={[{ required: true, message: 'Por favor ingresa el nombre completo' }]}
          >
            <Input placeholder="Ej: Juan Pérez" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor ingresa el email' },
              { type: 'email', message: 'Por favor ingresa un email válido' }
            ]}
          >
            <Input placeholder="Ej: juan.perez@empresa.com" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Cargo"
            rules={[{ required: true, message: 'Por favor selecciona el cargo' }]}
          >
            <Select placeholder="Selecciona el cargo">
              <Option value="manager">Gerente</Option>
              <Option value="seller">Vendedor</Option>
              <Option value="cashier">Cajero</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="branchId"
            label="Sucursal"
            rules={[{ required: true, message: 'Por favor selecciona la sucursal' }]}
          >
            <Select placeholder="Selecciona la sucursal">
              {getBranchOptions().map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Staff;