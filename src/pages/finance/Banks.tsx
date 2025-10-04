import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Table,
  Space,
  Button,
  Select,
  DatePicker,
  Tag,
  Progress,
  Divider,
  Avatar,
  Tooltip
} from 'antd';
import {
  BankOutlined,
  DollarOutlined,
  TrendingUpOutlined,
  SendOutlined,
  FilterOutlined,
  DownloadOutlined,
  FileTextOutlined,
  CalendarOutlined,
  HomeOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { BRANCHES } from '../../data/branches';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Interfaces TypeScript
interface Transfer {
  id: string;
  fromBranch: string;
  amount: number;
  timestamp: Date;
  status: 'completed' | 'pending';
  reference?: string;
  description?: string;
}

interface BranchStats {
  branchName: string;
  totalSent: number;
  transferCount: number;
  averageAmount: number;
  lastTransfer: Date;
}

// Datos mock expandidos basados en MoneyTransfer.tsx
const mockTransfers: Transfer[] = [
  {
    id: '1',
    fromBranch: 'Casa Matriz',
    amount: 15000,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'completed',
    reference: 'TRF-001',
    description: 'Transferencia operativa mensual'
  },
  {
    id: '2',
    fromBranch: 'Maldonado',
    amount: 8500,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    status: 'completed',
    reference: 'TRF-002',
    description: 'Envío de recaudación diaria'
  },
  {
    id: '3',
    fromBranch: 'Salto',
    amount: 12000,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'completed',
    reference: 'TRF-003',
    description: 'Transferencia de cierre semanal'
  },
  {
    id: '4',
    fromBranch: 'Paysandú',
    amount: 6750,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'completed',
    reference: 'TRF-004',
    description: 'Envío de fondos operativos'
  },
  {
    id: '5',
    fromBranch: 'Tacuarembó',
    amount: 9200,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'completed',
    reference: 'TRF-005',
    description: 'Transferencia de inventario'
  },
  {
    id: '6',
    fromBranch: 'Pando',
    amount: 4500,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    status: 'completed',
    reference: 'TRF-006',
    description: 'Envío de recaudación'
  },
  {
    id: '7',
    fromBranch: 'Casa Matriz',
    amount: 18500,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'completed',
    reference: 'TRF-007',
    description: 'Transferencia especial'
  },
  {
    id: '8',
    fromBranch: 'Maldonado',
    amount: 11200,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    status: 'completed',
    reference: 'TRF-008',
    description: 'Envío quincenal'
  },
  {
    id: '9',
    fromBranch: 'Salto',
    amount: 7800,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'completed',
    reference: 'TRF-009',
    description: 'Transferencia de gastos'
  },
  {
    id: '10',
    fromBranch: 'Paysandú',
    amount: 13400,
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    status: 'completed',
    reference: 'TRF-010',
    description: 'Envío de utilidades'
  }
];

const branches = [
  'Todas las Sucursales',
  ...BRANCHES.map(branch => branch.name)
];

const Banks: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<string>('Todas las Sucursales');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [transfers] = useState<Transfer[]>(mockTransfers);

  // Filtrar transferencias
  const filteredTransfers = useMemo(() => {
    let filtered = transfers;

    // Filtrar por sucursal
    if (selectedBranch !== 'Todas las Sucursales') {
      filtered = filtered.filter(transfer => transfer.fromBranch === selectedBranch);
    }

    // Filtrar por rango de fechas
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      filtered = filtered.filter(transfer => 
        transfer.timestamp >= startDate && transfer.timestamp <= endDate
      );
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [transfers, selectedBranch, dateRange]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalAmount = filteredTransfers.reduce((sum, transfer) => sum + transfer.amount, 0);
    const transferCount = filteredTransfers.length;
    const averageAmount = transferCount > 0 ? totalAmount / transferCount : 0;
    
    // Estadísticas por sucursal
    const branchStats: BranchStats[] = [];
    const branchGroups = filteredTransfers.reduce((groups, transfer) => {
      const branch = transfer.fromBranch;
      if (!groups[branch]) {
        groups[branch] = [];
      }
      groups[branch].push(transfer);
      return groups;
    }, {} as Record<string, Transfer[]>);

    Object.entries(branchGroups).forEach(([branchName, branchTransfers]) => {
      const branchTotal = branchTransfers.reduce((sum, t) => sum + t.amount, 0);
      const branchAverage = branchTotal / branchTransfers.length;
      const lastTransfer = branchTransfers.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
      
      branchStats.push({
        branchName,
        totalSent: branchTotal,
        transferCount: branchTransfers.length,
        averageAmount: branchAverage,
        lastTransfer: lastTransfer.timestamp
      });
    });

    return {
      totalAmount,
      transferCount,
      averageAmount,
      branchStats: branchStats.sort((a, b) => b.totalSent - a.totalSent)
    };
  }, [filteredTransfers]);

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
  const columns = [
    {
      title: 'Referencia',
      dataIndex: 'reference',
      key: 'reference',
      render: (reference: string) => (
        <Text strong style={{ color: '#1890ff' }}>{reference}</Text>
      )
    },
    {
      title: 'Sucursal Origen',
      dataIndex: 'fromBranch',
      key: 'fromBranch',
      render: (branch: string) => (
        <Space>
          <Avatar size="small" icon={<HomeOutlined />} style={{ backgroundColor: '#52c41a' }} />
          <Text>{branch}</Text>
        </Space>
      )
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
          {formatCurrency(amount)}
        </Text>
      ),
      sorter: (a: Transfer, b: Transfer) => a.amount - b.amount
    },
    {
      title: 'Fecha y Hora',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: Date) => (
        <Space direction="vertical" size={0}>
          <Text>{formatDate(timestamp)}</Text>
        </Space>
      ),
      sorter: (a: Transfer, b: Transfer) => a.timestamp.getTime() - b.timestamp.getTime()
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status === 'completed' ? 'Completado' : 'Pendiente'}
        </Tag>
      )
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <Tooltip title={description}>
          <Text ellipsis style={{ maxWidth: 200 }}>{description}</Text>
        </Tooltip>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Title level={2}>
          <BankOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          Gestión Bancaria
        </Title>
        <Text type="secondary">
          Detalle completo de transferencias de dinero entre sucursales
        </Text>
      </div>

      {/* Filtros */}
      <Card style={{ marginBottom: '24px' }} className="hover-lift">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Space>
              <FilterOutlined style={{ color: '#1890ff' }} />
              <Text strong>Filtros:</Text>
            </Space>
          </Col>
          <Col xs={24} sm={8}>
            <Select
              style={{ width: '100%' }}
              value={selectedBranch}
              onChange={setSelectedBranch}
              placeholder="Seleccionar sucursal"
            >
              {branches.map(branch => (
                <Option key={branch} value={branch}>
                  <Space>
                    <HomeOutlined />
                    {branch}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={setDateRange}
              placeholder={['Fecha inicio', 'Fecha fin']}
              format="DD/MM/YYYY"
            />
          </Col>
        </Row>
      </Card>

      {/* Estadísticas Principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card className="hover-lift">
            <Statistic
              title="Total Enviado"
              value={stats.totalAmount}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="hover-lift">
            <Statistic
              title="Número de Transferencias"
              value={stats.transferCount}
              prefix={<SendOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="hover-lift">
            <Statistic
              title="Promedio por Transferencia"
              value={stats.averageAmount}
              prefix={<BarChartOutlined style={{ color: '#722ed1' }} />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Estadísticas por Sucursal */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="Resumen por Sucursal" className="hover-lift">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {stats.branchStats.map((branchStat, index) => {
                const maxAmount = Math.max(...stats.branchStats.map(s => s.totalSent));
                const percentage = (branchStat.totalSent / maxAmount) * 100;
                
                return (
                  <div key={branchStat.branchName}>
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Space>
                          <Avatar 
                            size="small" 
                            icon={<HomeOutlined />} 
                            style={{ backgroundColor: index === 0 ? '#52c41a' : '#1890ff' }}
                          />
                          <Text strong>{branchStat.branchName}</Text>
                        </Space>
                      </Col>
                      <Col>
                        <Space>
                          <Text type="secondary">{branchStat.transferCount} transferencias</Text>
                          <Text strong style={{ color: '#52c41a' }}>
                            {formatCurrency(branchStat.totalSent)}
                          </Text>
                        </Space>
                      </Col>
                    </Row>
                    <Progress 
                      percent={percentage} 
                      strokeColor={index === 0 ? '#52c41a' : '#1890ff'}
                      showInfo={false}
                      style={{ marginTop: '8px' }}
                    />
                    <Row justify="space-between" style={{ marginTop: '4px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Promedio: {formatCurrency(branchStat.averageAmount)}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Última: {formatDate(branchStat.lastTransfer)}
                      </Text>
                    </Row>
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Análisis de Flujo" className="hover-lift">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#52c41a' }}>
                  {stats.branchStats.length}
                </div>
                <Text type="secondary">Sucursales Activas</Text>
              </div>
              
              <Divider />
              
              <div>
                <Text strong>Sucursal Más Activa:</Text>
                <br />
                <Text style={{ color: '#1890ff' }}>
                  {stats.branchStats[0]?.branchName || 'N/A'}
                </Text>
              </div>
              
              <div>
                <Text strong>Mayor Transferencia:</Text>
                <br />
                <Text style={{ color: '#52c41a' }}>
                  {formatCurrency(Math.max(...filteredTransfers.map(t => t.amount)))}
                </Text>
              </div>
              
              <div>
                <Text strong>Actividad Reciente:</Text>
                <br />
                <Text type="secondary">
                  {filteredTransfers.length > 0 ? 
                    `Última transferencia hace ${Math.floor((Date.now() - filteredTransfers[0].timestamp.getTime()) / (1000 * 60 * 60))} horas` :
                    'Sin actividad reciente'
                  }
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Tabla de Transferencias */}
      <Card 
        title={
          <Space>
            <SendOutlined style={{ color: '#1890ff' }} />
            <span>Historial Detallado de Transferencias</span>
            <Tag color="blue">{filteredTransfers.length} registros</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<FileTextOutlined />}>
              Generar Reporte
            </Button>
            <Button type="primary" icon={<DownloadOutlined />}>
              Exportar Excel
            </Button>
          </Space>
        }
        className="hover-lift"
      >
        <Table
          columns={columns}
          dataSource={filteredTransfers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} transferencias`
          }}
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Banks;