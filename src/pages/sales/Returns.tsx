import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Table,
  Button,
  Tag,
  Input,
  Select,
  Row,
  Col,
  Checkbox,
  notification
} from 'antd';
import {
  SearchOutlined,
  MailOutlined,
  UndoOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface SaleItem {
  key: string;
  id: string;
  estado: 'En Garantía' | 'Sin Garantía' | 'Devuelto';
  fechaVenta: string;
  cliente: string;
  formaPago: 'Cuenta Corriente' | 'Contado';
  total: number;
  items: string;
  sucursal: string;
  email?: string;
}

const Returns: React.FC = () => {
  const [clientSearch, setClientSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [emailSearch, setEmailSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Datos mock de ventas
  const salesData: SaleItem[] = [
    {
      key: '1',
      id: 'VTA-001',
      estado: 'En Garantía',
      fechaVenta: '2024-01-15 10:30:00',
      cliente: 'Juan Pérez',
      formaPago: 'Cuenta Corriente',
      total: 450.00,
      items: 'Pantalla Samsung A54',
      sucursal: 'Montevideo',
      email: 'juan@email.com'
    },
    {
      key: '2',
      id: 'VTA-002',
      estado: 'En Garantía',
      fechaVenta: '2024-01-14 15:45:00',
      cliente: 'María García',
      formaPago: 'Contado',
      total: 280.50,
      items: 'Batería iPhone 12',
      sucursal: 'Punta del Este',
      email: 'maria@email.com'
    },
    {
      key: '3',
      id: 'VTA-003',
      estado: 'Sin Garantía',
      fechaVenta: '2023-10-20 09:15:00',
      cliente: 'Carlos López',
      formaPago: 'Cuenta Corriente',
      total: 1250.00,
      items: 'Pantalla iPhone 13 Pro',
      sucursal: 'Montevideo'
    }
  ];

  // Filtrar datos - mostrar solo productos en garantía
  const filteredData = useMemo(() => {
    return salesData.filter(item => {
      const matchesClient = clientSearch === '' || 
        item.cliente.toLowerCase().includes(clientSearch.toLowerCase());
      
      const matchesBranch = selectedBranch === 'all' || item.sucursal === selectedBranch;
      
      const matchesEmail = emailSearch === '' || 
        (item.email && item.email.toLowerCase().includes(emailSearch.toLowerCase()));
      
      // Solo mostrar productos en garantía
      const isInWarranty = item.estado === 'En Garantía';
      
      return matchesClient && matchesBranch && matchesEmail && isInWarranty;
    });
  }, [salesData, clientSearch, selectedBranch, emailSearch]);

  // Manejar selección de items
  const handleSelectItem = (key: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, key]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== key));
    }
  };

  // Procesar devolución
  const handleProcessReturn = () => {
    if (selectedItems.length === 0) {
      notification.warning({
        message: 'Selección requerida',
        description: 'Debe seleccionar al menos un item para procesar la devolución.'
      });
      return;
    }

    notification.success({
      message: 'Devolución procesada',
      description: `Se procesaron ${selectedItems.length} devoluciones exitosamente.`
    });

    setSelectedItems([]);
  };

  // Columnas de la tabla
  const columns = [
    {
      title: '',
      key: 'select',
      render: (_: any, record: SaleItem) => (
        <Checkbox
          checked={selectedItems.includes(record.key)}
          onChange={(e) => handleSelectItem(record.key, e.target.checked)}
        />
      )
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => (
        <Tag color={estado === 'En Garantía' ? 'green' : estado === 'Devuelto' ? 'default' : 'red'}>
          {estado}
        </Tag>
      )
    },
    {
      title: 'Fecha Venta',
      dataIndex: 'fechaVenta',
      key: 'fechaVenta'
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente'
    },
    {
      title: 'Forma de Pago',
      dataIndex: 'formaPago',
      key: 'formaPago',
      render: (formaPago: string) => (
        <Tag color={formaPago === 'Cuenta Corriente' ? 'gold' : 'blue'}>
          {formaPago}
        </Tag>
      )
    },
    {
      title: 'TOTAL',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          ${total.toFixed(2)}
        </Text>
      )
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items'
    },
    {
      title: 'Sucursal',
      dataIndex: 'sucursal',
      key: 'sucursal'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Gestión de Devoluciones</Title>
      
      {/* Filtros */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input
               placeholder="Buscar cliente..."
               prefix={<SearchOutlined />}
               value={clientSearch}
               onChange={(e) => setClientSearch(e.target.value)}
             />
          </Col>
          <Col span={8}>
            <Select
              placeholder="Seleccionar sucursal"
              style={{ width: '100%' }}
              value={selectedBranch}
              onChange={setSelectedBranch}
              allowClear
            >
              <Option value="Maldonado">Maldonado</Option>
              <Option value="Montevideo">Montevideo</Option>
              <Option value="Punta del Este">Punta del Este</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Input
               placeholder="Buscar por email..."
               prefix={<MailOutlined />}
               value={emailSearch}
               onChange={(e) => setEmailSearch(e.target.value)}
             />
          </Col>
        </Row>
      </Card>

      {/* Acciones */}
      <Card style={{ marginBottom: '16px' }}>
        <Button
          type="primary"
          onClick={handleProcessReturn}
          disabled={selectedItems.length === 0}
          icon={<UndoOutlined />}
        >
          Procesar Devolución ({selectedItems.length})
        </Button>
      </Card>

      {/* Tabla */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} items`
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default Returns;