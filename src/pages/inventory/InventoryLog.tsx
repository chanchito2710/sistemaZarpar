import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Row,
  Col,
  DatePicker,
  Tooltip,
  Badge,
  Statistic,
  message,
  Divider
} from 'antd';
import {
  HistoryOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  UserOutlined,
  ShopOutlined,
  InboxOutlined,
  SwapOutlined,
  PlusOutlined,
  MinusOutlined,
  ToolOutlined,
  UndoOutlined,
  SafetyOutlined,
  SyncOutlined,
  FileExcelOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { InventoryMovement, Product, User, Branch } from '../../types';
import { BRANCHES } from '../../data/branches';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Interfaz extendida para mostrar más información
interface InventoryMovementDisplay extends InventoryMovement {
  productName: string;
  branchName: string;
  userName: string;
  userRole: string;
  reason: string;
  stockAfter: number;
}

const InventoryLog: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('todos');
  const [selectedMovementType, setSelectedMovementType] = useState<string>('todos');
  const [selectedUser, setSelectedUser] = useState<string>('todos');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [sortedInfo, setSortedInfo] = useState<any>({});

  // Datos de prueba realistas
  const movementsData: InventoryMovementDisplay[] = [
    {
      id: '1',
      productId: 'prod-1',
      productName: 'Pantalla iPhone 14',
      branchId: 'branch-1',
      branchName: 'Maldonado',
      userId: 'user-1',
      userName: 'Carlos Rodríguez',
      userRole: 'Vendedor',
      movementType: 'out',
      quantity: -2,
      reference: 'Venta #VT-2024-001',
      reason: 'Venta',
      createdAt: '2024-01-15T10:30:00Z',
      stockAfter: 13
    },
    {
      id: '2',
      productId: 'prod-2',
      productName: 'Batería Samsung A54',
      branchId: 'branch-2',
      branchName: 'Pando',
      userId: 'user-2',
      userName: 'Ana García',
      userRole: 'Técnico',
      movementType: 'out',
      quantity: -1,
      reference: 'Reparación #RP-2024-045',
      reason: 'Venta',
      createdAt: '2024-01-15T11:15:00Z',
      stockAfter: 19
    },
    {
      id: '3',
      productId: 'prod-1',
      productName: 'Pantalla iPhone 14',
      branchId: 'branch-1',
      branchName: 'Maldonado',
      userId: 'admin-1',
      userName: 'Sistema Admin',
      userRole: 'Administrador',
      movementType: 'in',
      quantity: 10,
      reference: 'Compra #CP-2024-012',
      reason: 'Compra de mercadería',
      createdAt: '2024-01-14T14:20:00Z',
      stockAfter: 15
    },
    {
      id: '4',
      productId: 'prod-3',
      productName: 'Carcasa Xiaomi Redmi Note 12',
      branchId: 'branch-3',
      branchName: 'Melo',
      userId: 'user-3',
      userName: 'Luis Martínez',
      userRole: 'Vendedor',
      movementType: 'out',
      quantity: -1,
      reference: 'Devolución #DV-2024-008',
      reason: 'Devolución por defecto',
      createdAt: '2024-01-14T16:45:00Z',
      stockAfter: 24
    },
    {
      id: '5',
      productId: 'prod-4',
      productName: 'Flex iPhone 13 Pro',
      branchId: 'branch-2',
      branchName: 'Pando',
      userId: 'admin-1',
      userName: 'Sistema Admin',
      userRole: 'Administrador',
      movementType: 'adjustment',
      quantity: -3,
      reference: 'Ajuste #AJ-2024-003',
      reason: 'Ajuste por inventario físico',
      createdAt: '2024-01-13T09:00:00Z',
      stockAfter: 7
    },
    {
      id: '6',
      productId: 'prod-5',
      productName: 'Batería iPhone 14',
      branchId: 'branch-4',
      branchName: 'Paysandú',
      userId: 'user-4',
      userName: 'María López',
      userRole: 'Técnico',
      movementType: 'out',
      quantity: -2,
      reference: 'Reparación #RP-2024-046',
      reason: 'Garantía caso #G-2024-012',
      createdAt: '2024-01-13T13:30:00Z',
      stockAfter: 18
    },
    {
      id: '7',
      productId: 'prod-6',
      productName: 'Pantalla Samsung S23',
      branchId: 'branch-5',
      branchName: 'Salto',
      userId: 'user-5',
      userName: 'Pedro Fernández',
      userRole: 'Vendedor',
      movementType: 'transfer',
      quantity: -5,
      reference: 'Transferencia #TR-2024-007',
      reason: 'Envío a sucursal Rivera',
      createdAt: '2024-01-12T15:00:00Z',
      stockAfter: 13
    },
    {
      id: '8',
      productId: 'prod-6',
      productName: 'Pantalla Samsung S23',
      branchId: 'branch-6',
      branchName: 'Rivera',
      userId: 'user-5',
      userName: 'Pedro Fernández',
      userRole: 'Vendedor',
      movementType: 'transfer',
      quantity: 5,
      reference: 'Transferencia #TR-2024-007',
      reason: 'Recepción desde Salto',
      createdAt: '2024-01-12T15:05:00Z',
      stockAfter: 8
    },
    {
      id: '9',
      productId: 'prod-7',
      productName: 'Cargador Samsung A34',
      branchId: 'branch-2',
      branchName: 'Pando',
      userId: 'user-6',
      userName: 'Sofia Ramírez',
      userRole: 'Vendedor',
      movementType: 'out',
      quantity: -3,
      reference: 'Venta #VT-2024-002',
      reason: 'Venta al cliente',
      createdAt: '2024-01-12T11:20:00Z',
      stockAfter: 19
    },
    {
      id: '10',
      productId: 'prod-8',
      productName: 'Hidrogel Samsung A14',
      branchId: 'branch-1',
      branchName: 'Maldonado',
      userId: 'admin-1',
      userName: 'Sistema Admin',
      userRole: 'Administrador',
      movementType: 'in',
      quantity: 20,
      reference: 'Compra #CP-2024-013',
      reason: 'Compra mayorista',
      createdAt: '2024-01-11T10:00:00Z',
      stockAfter: 35
    },
    {
      id: '11',
      productId: 'prod-9',
      productName: 'Tapa Trasera iPhone 14 Pro',
      branchId: 'branch-3',
      branchName: 'Melo',
      userId: 'user-7',
      userName: 'Diego Torres',
      userRole: 'Técnico',
      movementType: 'out',
      quantity: -1,
      reference: 'Reparación #RP-2024-047',
      reason: 'Reparación técnica',
      createdAt: '2024-01-11T14:45:00Z',
      stockAfter: 7
    },
    {
      id: '12',
      productId: 'prod-10',
      productName: 'Pin de Carga Xiaomi Poco X5',
      branchId: 'branch-6',
      branchName: 'Rivera',
      userId: 'user-8',
      userName: 'Valentina Silva',
      userRole: 'Técnico',
      movementType: 'out',
      quantity: -2,
      reference: 'Reparación #RP-2024-048',
      reason: 'Garantía caso #G-2024-015',
      createdAt: '2024-01-10T16:30:00Z',
      stockAfter: 10
    },
    {
      id: '13',
      productId: 'prod-11',
      productName: 'Herramientas Reparación',
      branchId: 'branch-4',
      branchName: 'Paysandú',
      userId: 'admin-1',
      userName: 'Sistema Admin',
      userRole: 'Administrador',
      movementType: 'adjustment',
      quantity: 5,
      reference: 'Ajuste #AJ-2024-004',
      reason: 'Reposición de herramientas',
      createdAt: '2024-01-10T08:15:00Z',
      stockAfter: 50
    },
    {
      id: '14',
      productId: 'prod-12',
      productName: 'Batería Huawei P40',
      branchId: 'branch-5',
      branchName: 'Salto',
      userId: 'user-9',
      userName: 'Roberto Méndez',
      userRole: 'Vendedor',
      movementType: 'out',
      quantity: -1,
      reference: 'Devolución #DV-2024-009',
      reason: 'Devolución por cliente insatisfecho',
      createdAt: '2024-01-09T12:00:00Z',
      stockAfter: 14
    },
    {
      id: '15',
      productId: 'prod-13',
      productName: 'Pantalla TCL 20 Pro',
      branchId: 'branch-3',
      branchName: 'Melo',
      userId: 'user-10',
      userName: 'Camila Vega',
      userRole: 'Vendedor',
      movementType: 'out',
      quantity: -2,
      reference: 'Venta #VT-2024-003',
      reason: 'Venta directa',
      createdAt: '2024-01-08T09:30:00Z',
      stockAfter: 5
    }
  ];

  // Filtrar datos
  const filteredData = useMemo(() => {
    return movementsData.filter(movement => {
      const matchesSearch = searchText === '' || 
        movement.productName.toLowerCase().includes(searchText.toLowerCase()) ||
        movement.reference.toLowerCase().includes(searchText.toLowerCase()) ||
        movement.reason.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesBranch = selectedBranch === 'todos' || movement.branchName === selectedBranch;
      const matchesMovementType = selectedMovementType === 'todos' || movement.movementType === selectedMovementType;
      const matchesUser = selectedUser === 'todos' || movement.userName === selectedUser;
      
      let matchesDate = true;
      if (dateRange) {
        const movementDate = dayjs(movement.createdAt);
        matchesDate = movementDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
      }
      
      return matchesSearch && matchesBranch && matchesMovementType && matchesUser && matchesDate;
    });
  }, [movementsData, searchText, selectedBranch, selectedMovementType, selectedUser, dateRange]);

  // Calcular estadísticas
  const statistics = useMemo(() => {
    const totalMovements = filteredData.length;
    const inMovements = filteredData.filter(m => m.quantity > 0).length;
    const outMovements = filteredData.filter(m => m.quantity < 0).length;
    
    const productCounts = filteredData.reduce((acc, movement) => {
      acc[movement.productName] = (acc[movement.productName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostActiveProduct = Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    const branchCounts = filteredData.reduce((acc, movement) => {
      acc[movement.branchName] = (acc[movement.branchName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostActiveBranch = Object.entries(branchCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      totalMovements,
      inMovements,
      outMovements,
      mostActiveProduct: mostActiveProduct ? mostActiveProduct[0] : 'N/A',
      mostActiveBranch: mostActiveBranch ? mostActiveBranch[0] : 'N/A'
    };
  }, [filteredData]);

  // Obtener listas únicas para filtros
  const uniqueBranches = BRANCHES.map(branch => branch.name);
  const uniqueUsers = [...new Set(movementsData.map(m => m.userName))];

  // Función para exportar a CSV
  const exportToCSV = () => {
    const headers = [
      'Fecha/Hora',
      'Producto',
      'Sucursal',
      'Usuario',
      'Rol',
      'Tipo de Movimiento',
      'Cantidad',
      'Referencia',
      'Motivo',
      'Stock Después'
    ];
    
    const csvData = filteredData.map(movement => [
      dayjs(movement.createdAt).format('DD/MM/YYYY HH:mm'),
      movement.productName,
      movement.branchName,
      movement.userName,
      movement.userRole,
      getMovementTypeText(movement.movementType),
      movement.quantity,
      movement.reference,
      movement.reason,
      movement.stockAfter
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bitacora_inventario_${dayjs().format('YYYY-MM-DD')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('Archivo CSV descargado exitosamente');
  };

  // Función para obtener el texto del tipo de movimiento
  const getMovementTypeText = (type: string) => {
    const types: Record<string, string> = {
      'in': 'Entrada',
      'out': 'Salida',
      'transfer': 'Transferencia',
      'adjustment': 'Ajuste'
    };
    return types[type] || type;
  };

  // Función para obtener el color del tipo de movimiento
  const getMovementTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'in': 'green',
      'out': 'red',
      'transfer': 'blue',
      'adjustment': 'orange'
    };
    return colors[type] || 'default';
  };

  // Función para obtener el icono del tipo de movimiento
  const getMovementTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'in': <PlusOutlined />,
      'out': <MinusOutlined />,
      'transfer': <SwapOutlined />,
      'adjustment': <ToolOutlined />
    };
    return icons[type] || <InboxOutlined />;
  };

  // Configuración de columnas de la tabla
  const columns: ColumnsType<InventoryMovementDisplay> = [
    {
      title: 'Fecha/Hora',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date: string) => (
        <div>
          <div>{dayjs(date).format('DD/MM/YYYY')}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(date).format('HH:mm')}
          </Text>
        </div>
      )
    },
    {
      title: 'Producto',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
      sorter: (a, b) => a.productName.localeCompare(b.productName),
      render: (name: string) => (
        <Tooltip title={name}>
          <Text strong style={{ color: '#1890ff' }}>{name}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Sucursal',
      dataIndex: 'branchName',
      key: 'branchName',
      width: 120,
      sorter: (a, b) => a.branchName.localeCompare(b.branchName),
      render: (branch: string) => (
        <Tag color="blue" icon={<ShopOutlined />}>
          {branch}
        </Tag>
      )
    },
    {
      title: 'Usuario',
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
      sorter: (a, b) => a.userName.localeCompare(b.userName),
      render: (name: string, record) => (
        <div>
          <div>
            <UserOutlined style={{ marginRight: 4 }} />
            <Text strong>{name}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.userRole}
          </Text>
        </div>
      )
    },
    {
      title: 'Tipo',
      dataIndex: 'movementType',
      key: 'movementType',
      width: 120,
      sorter: (a, b) => a.movementType.localeCompare(b.movementType),
      render: (type: string) => (
        <Tag 
          color={getMovementTypeColor(type)} 
          icon={getMovementTypeIcon(type)}
        >
          {getMovementTypeText(type)}
        </Tag>
      )
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity: number) => (
        <Badge 
          count={Math.abs(quantity)} 
          style={{ 
            backgroundColor: quantity > 0 ? '#52c41a' : '#ff4d4f',
            color: 'white'
          }}
          showZero
        />
      )
    },
    {
      title: 'Referencia',
      dataIndex: 'reference',
      key: 'reference',
      width: 150,
      render: (reference: string) => (
        <Text code style={{ fontSize: '12px' }}>{reference}</Text>
      )
    },
    {
      title: 'Motivo',
      dataIndex: 'reason',
      key: 'reason',
      width: 180,
      render: (reason: string) => (
        <Tooltip title={reason}>
          <Text ellipsis style={{ maxWidth: 160 }}>{reason}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Stock Después',
      dataIndex: 'stockAfter',
      key: 'stockAfter',
      width: 120,
      sorter: (a, b) => a.stockAfter - b.stockAfter,
      render: (stock: number) => (
        <Badge 
          count={stock} 
          style={{ 
            backgroundColor: stock > 10 ? '#52c41a' : stock > 5 ? '#faad14' : '#ff4d4f',
            color: 'white'
          }}
          showZero
        />
      )
    }
  ];

  return (
    <div className="fade-in">
      {/* Encabezado */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          <HistoryOutlined style={{ marginRight: 8 }} />
          Bitácora de Inventario
        </Title>
        <Text type="secondary">
          Registro detallado de todos los movimientos de stock del sistema
        </Text>
      </div>

      {/* Tarjetas de estadísticas */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover-lift">
            <Statistic
              title="Total Movimientos"
              value={statistics.totalMovements}
              prefix={<HistoryOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover-lift">
            <Statistic
              title="Entradas"
              value={statistics.inMovements}
              prefix={<PlusOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover-lift">
            <Statistic
              title="Salidas"
              value={statistics.outMovements}
              prefix={<MinusOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover-lift">
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Producto Más Activo</Text>
              <div style={{ marginTop: 8 }}>
                <Text strong style={{ color: '#722ed1' }}>
                  {statistics.mostActiveProduct}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="hover-lift" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Buscar producto, referencia o motivo..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Sucursal"
              value={selectedBranch}
              onChange={setSelectedBranch}
              style={{ width: '100%' }}
            >
              <Option value="todos">Todas las Sucursales</Option>
              {uniqueBranches.map(branch => (
                <Option key={branch} value={branch}>{branch}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Tipo de Movimiento"
              value={selectedMovementType}
              onChange={setSelectedMovementType}
              style={{ width: '100%' }}
            >
              <Option value="todos">Todos los Tipos</Option>
              <Option value="in">Entrada</Option>
              <Option value="out">Salida</Option>
              <Option value="transfer">Transferencia</Option>
              <Option value="adjustment">Ajuste</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Usuario"
              value={selectedUser}
              onChange={setSelectedUser}
              style={{ width: '100%' }}
            >
              <Option value="todos">Todos los Usuarios</Option>
              {uniqueUsers.map(user => (
                <Option key={user} value={user}>{user}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <RangePicker
              placeholder={['Fecha inicio', 'Fecha fin']}
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </Col>
        </Row>
        
        <Divider style={{ margin: '16px 0' }} />
        
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Text type="secondary">
                Mostrando {filteredData.length} de {movementsData.length} movimientos
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<FileExcelOutlined />} 
                onClick={exportToCSV}
                type="primary"
                ghost
              >
                Exportar CSV
              </Button>
              <Button 
                icon={<FilterOutlined />} 
                onClick={() => {
                  setSearchText('');
                  setSelectedBranch('todos');
                  setSelectedMovementType('todos');
                  setSelectedUser('todos');
                  setDateRange(null);
                }}
              >
                Limpiar Filtros
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabla de movimientos */}
      <Card className="hover-lift">
        <Table<InventoryMovementDisplay>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} movimientos`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1200 }}
          size="small"
          onChange={(pagination, filters, sorter) => {
            setSortedInfo(sorter);
          }}
          rowClassName={(record) => {
            if (record.movementType === 'adjustment') return 'adjustment-row';
            if (record.quantity > 0) return 'positive-movement';
            if (record.quantity < 0) return 'negative-movement';
            return '';
          }}
        />
      </Card>

      <style>{`
        .adjustment-row {
          background-color: #fff7e6 !important;
        }
        .positive-movement {
          background-color: #f6ffed !important;
        }
        .negative-movement {
          background-color: #fff2f0 !important;
        }
        .hover-lift {
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default InventoryLog;