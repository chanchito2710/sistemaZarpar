import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  DatePicker,
  Select,
  Space,
  Tag,
  Statistic,
  Alert,
  Divider
} from 'antd';
import {
  DollarOutlined,
  HistoryOutlined,
  BankOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FilterOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Interfaces TypeScript
interface Branch {
  id: string;
  name: string;
  initialBalance: number;
  location: string;
}

interface Transfer {
  id: string;
  fromBranch: string;
  toBranch?: string;
  amount: number;
  timestamp: Date;
  status: 'completed' | 'pending';
  type: 'outgoing' | 'incoming';
  reference: string;
}

interface CashBalance {
  branchId: string;
  branchName: string;
  location: string;
  initialBalance: number;
  totalOutgoing: number;
  totalIncoming: number;
  currentBalance: number;
  lastTransferDate?: Date;
}

import { BRANCHES } from '../../data/branches';

// Datos mock - Sucursales con balances iniciales
const mockBranches: Branch[] = BRANCHES.map(branch => ({
  id: branch.id,
  name: branch.name,
  initialBalance: Math.floor(Math.random() * 100000) + 30000, // Balance aleatorio entre 30k y 130k
  location: branch.address.split(',')[1]?.trim() || branch.name
}));

// Datos mock - Transferencias expandidas
const mockTransfers: Transfer[] = [
  {
    id: '1',
    fromBranch: 'Casa Matriz',
    toBranch: 'Banco Central',
    amount: 15000,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'completed',
    type: 'outgoing',
    reference: 'TRF-001'
  },
  {
    id: '2',
    fromBranch: 'Maldonado',
    toBranch: 'Banco Central',
    amount: 8500,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    status: 'completed',
    type: 'outgoing',
    reference: 'TRF-002'
  },
  {
    id: '3',
    fromBranch: 'Salto',
    toBranch: 'Banco Central',
    amount: 12000,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'completed',
    type: 'outgoing',
    reference: 'TRF-003'
  },
  {
    id: '4',
    fromBranch: 'Paysandú',
    toBranch: 'Banco Central',
    amount: 6500,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'completed',
    type: 'outgoing',
    reference: 'TRF-004'
  },
  {
    id: '5',
    fromBranch: 'Tacuarembó',
    toBranch: 'Banco Central',
    amount: 4200,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'completed',
    type: 'outgoing',
    reference: 'TRF-005'
  },
  {
    id: '6',
    fromBranch: 'Pando',
    toBranch: 'Banco Central',
    amount: 3500,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'completed',
    type: 'outgoing',
    reference: 'TRF-006'
  },
  {
    id: '7',
    fromBranch: 'Casa Matriz',
    toBranch: 'Banco Central',
    amount: 22000,
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: 'completed',
    type: 'outgoing',
    reference: 'TRF-007'
  },
  {
    id: '8',
    fromBranch: 'Maldonado',
    toBranch: 'Banco Central',
    amount: 11500,
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    status: 'completed',
    type: 'outgoing',
    reference: 'TRF-008'
  }
];

const Cash: React.FC = () => {
  const [branches] = useState<Branch[]>(mockBranches);
  const [allTransfers] = useState<Transfer[]>(mockTransfers);
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>(mockTransfers);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [cashBalances, setCashBalances] = useState<CashBalance[]>([]);

  // Calcular saldos de efectivo
  const calculateCashBalances = (transfers: Transfer[]) => {
    const balances: CashBalance[] = branches.map(branch => {
      const branchTransfers = transfers.filter(t => t.fromBranch === branch.name);
      const totalOutgoing = branchTransfers.reduce((sum, t) => sum + t.amount, 0);
      const totalIncoming = 0; // Por ahora solo transferencias salientes
      const currentBalance = branch.initialBalance - totalOutgoing + totalIncoming;
      const lastTransfer = branchTransfers.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

      return {
        branchId: branch.id,
        branchName: branch.name,
        location: branch.location,
        initialBalance: branch.initialBalance,
        totalOutgoing,
        totalIncoming,
        currentBalance,
        lastTransferDate: lastTransfer?.timestamp
      };
    });

    setCashBalances(balances);
  };

  // Filtrar transferencias
  const filterTransfers = () => {
    let filtered = allTransfers;

    // Filtro por sucursal
    if (selectedBranch !== 'all') {
      const branchName = branches.find(b => b.id === selectedBranch)?.name;
      if (branchName) {
        filtered = filtered.filter(t => t.fromBranch === branchName);
      }
    }

    // Filtro por fecha
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      filtered = filtered.filter(t => t.timestamp >= startDate && t.timestamp <= endDate);
    }

    setFilteredTransfers(filtered);
    calculateCashBalances(filtered);
  };

  // Efectos
  useEffect(() => {
    filterTransfers();
  }, [selectedBranch, dateRange]);

  useEffect(() => {
    calculateCashBalances(allTransfers);
  }, []);

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU'
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Columnas de la tabla
  const columns: ColumnsType<Transfer> = [
    {
      title: 'Fecha',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: Date) => formatDate(date),
      sorter: (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Sucursal Origen',
      dataIndex: 'fromBranch',
      key: 'fromBranch',
      render: (branch: string) => (
        <Space>
          <BankOutlined />
          <Text strong>{branch}</Text>
        </Space>
      )
    },
    {
      title: 'Destino',
      dataIndex: 'toBranch',
      key: 'toBranch',
      render: (branch: string) => (
        <Tag color="blue">{branch || 'Banco Central'}</Tag>
      )
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong style={{ color: '#ff4d4f' }}>
          -{formatCurrency(amount)}
        </Text>
      ),
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'outgoing' ? 'red' : 'green'} icon={<ArrowDownOutlined />}>
          {type === 'outgoing' ? 'Salida' : 'Entrada'}
        </Tag>
      )
    },
    {
      title: 'Referencia',
      dataIndex: 'reference',
      key: 'reference',
      render: (ref: string) => <Text code>{ref}</Text>
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'success' : 'processing'}>
          {status === 'completed' ? 'Completado' : 'Pendiente'}
        </Tag>
      )
    }
  ];

  // Estadísticas generales
  const totalCash = cashBalances.reduce((sum, b) => sum + b.currentBalance, 0);
  const totalOutgoing = cashBalances.reduce((sum, b) => sum + b.totalOutgoing, 0);
  const totalInitial = cashBalances.reduce((sum, b) => sum + b.initialBalance, 0);
  const averageBalance = cashBalances.length > 0 ? totalCash / cashBalances.length : 0;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <DollarOutlined /> Control de Caja
        </Title>
        <Text type="secondary">
          Monitoreo del efectivo disponible por sucursal y bitácora de movimientos
        </Text>
      </div>

      {/* Estadísticas Generales */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Efectivo Total"
              value={totalCash}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Transferido"
              value={totalOutgoing}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Saldo Inicial Total"
              value={totalInitial}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Promedio por Sucursal"
              value={averageBalance}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Dashboard de Efectivo por Sucursal */}
      <Card title={<><BankOutlined /> Efectivo por Sucursal</>} style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          {cashBalances.map(balance => {
            const isLowBalance = balance.currentBalance < balance.initialBalance * 0.3;
            const isVeryLowBalance = balance.currentBalance < balance.initialBalance * 0.1;
            
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={balance.branchId}>
                <Card
                  size="small"
                  title={balance.branchName}
                  extra={<Tag color="blue">{balance.location}</Tag>}
                  style={{
                    borderColor: isVeryLowBalance ? '#ff4d4f' : isLowBalance ? '#faad14' : '#52c41a'
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text type="secondary">Saldo Inicial:</Text>
                      <br />
                      <Text>{formatCurrency(balance.initialBalance)}</Text>
                    </div>
                    
                    <div>
                      <Text type="secondary">Transferido:</Text>
                      <br />
                      <Text style={{ color: '#ff4d4f' }}>-{formatCurrency(balance.totalOutgoing)}</Text>
                    </div>
                    
                    <Divider style={{ margin: '8px 0' }} />
                    
                    <div>
                      <Text type="secondary">Efectivo Actual:</Text>
                      <br />
                      <Text 
                        strong 
                        style={{ 
                          fontSize: '16px',
                          color: isVeryLowBalance ? '#ff4d4f' : isLowBalance ? '#faad14' : '#52c41a'
                        }}
                      >
                        {formatCurrency(balance.currentBalance)}
                      </Text>
                    </div>
                    
                    {balance.lastTransferDate && (
                      <div>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          Última transferencia: {formatDate(balance.lastTransferDate)}
                        </Text>
                      </div>
                    )}
                    
                    {isVeryLowBalance && (
                      <Alert
                        message="Efectivo crítico"
                        type="error"
                        showIcon
                      />
                    )}
                    {isLowBalance && !isVeryLowBalance && (
                      <Alert
                        message="Efectivo bajo"
                        type="warning"
                        showIcon
                      />
                    )}
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* Filtros */}
      <Card title={<><FilterOutlined /> Filtros</>} style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>Sucursal:</Text>
              <Select
                style={{ width: '100%' }}
                value={selectedBranch}
                onChange={setSelectedBranch}
                placeholder="Seleccionar sucursal"
              >
                <Option value="all">Todas las sucursales</Option>
                {branches.map(branch => (
                  <Option key={branch.id} value={branch.id}>
                    {branch.name} - {branch.location}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>Rango de Fechas:</Text>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
                placeholder={['Fecha inicio', 'Fecha fin']}
                suffixIcon={<CalendarOutlined />}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>Resultados:</Text>
              <Text strong style={{ fontSize: '16px' }}>
                {filteredTransfers.length} movimientos
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Bitácora de Movimientos */}
      <Card title={<><HistoryOutlined /> Bitácora de Movimientos</>}>
        <Table
          columns={columns}
          dataSource={filteredTransfers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} movimientos`
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default Cash;