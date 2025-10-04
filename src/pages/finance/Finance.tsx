import React from 'react';
import { Card, Typography, Row, Col, Statistic, Table, Progress, Space, Button } from 'antd';
import { DollarOutlined, TrendingUpOutlined, TrendingDownOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Finance: React.FC = () => {
  const mockTransactions = [
    {
      key: '1',
      date: '2024-01-15',
      type: 'income',
      description: 'Venta - VTA-001',
      amount: 450.00,
      category: 'Ventas'
    },
    {
      key: '2',
      date: '2024-01-15',
      type: 'expense',
      description: 'Compra de inventario',
      amount: -1200.00,
      category: 'Inventario'
    },
    {
      key: '3',
      date: '2024-01-14',
      type: 'income',
      description: 'Venta - VTA-002',
      amount: 280.50,
      category: 'Ventas'
    },
    {
      key: '4',
      date: '2024-01-14',
      type: 'expense',
      description: 'Pago de servicios',
      amount: -350.00,
      category: 'Gastos Operativos'
    }
  ];

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Categoría',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ 
          color: amount > 0 ? '#52c41a' : '#ff4d4f',
          fontWeight: 500
        }}>
          {amount > 0 ? '+' : ''}${Math.abs(amount).toFixed(2)}
        </span>
      )
    }
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <DollarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          Gestión Financiera
        </Title>
        <Text type="secondary">
          Control de ingresos, gastos y análisis financiero
        </Text>
      </div>

      {/* Métricas principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover-lift">
            <Statistic 
              title="Ingresos del Mes" 
              value={15420.50} 
              prefix="$" 
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              suffix={<TrendingUpOutlined style={{ color: '#3f8600' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover-lift">
            <Statistic 
              title="Gastos del Mes" 
              value={8750.00} 
              prefix="$" 
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              suffix={<TrendingDownOutlined style={{ color: '#cf1322' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover-lift">
            <Statistic 
              title="Ganancia Neta" 
              value={6670.50} 
              prefix="$" 
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover-lift">
            <Statistic 
              title="Margen de Ganancia" 
              value={43.3} 
              suffix="%" 
              precision={1}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Análisis por categorías */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Distribución de Gastos" className="hover-lift">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Inventario</Text>
                  <Text strong>$4,200 (48%)</Text>
                </div>
                <Progress percent={48} strokeColor="#1890ff" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Gastos Operativos</Text>
                  <Text strong>$2,800 (32%)</Text>
                </div>
                <Progress percent={32} strokeColor="#52c41a" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Marketing</Text>
                  <Text strong>$1,200 (14%)</Text>
                </div>
                <Progress percent={14} strokeColor="#faad14" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Otros</Text>
                  <Text strong>$550 (6%)</Text>
                </div>
                <Progress percent={6} strokeColor="#f5222d" />
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Resumen Mensual" className="hover-lift">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#52c41a' }}>+43.3%</div>
                <Text type="secondary">Crecimiento vs mes anterior</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>127</div>
                  <Text type="secondary">Transacciones</Text>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#722ed1' }}>$121.42</div>
                  <Text type="secondary">Ticket Promedio</Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Historial de transacciones */}
      <Card 
        title="Historial de Transacciones" 
        className="hover-lift"
        extra={
          <Space>
            <Button icon={<FileTextOutlined />}>
              Generar Reporte
            </Button>
            <Button type="primary" icon={<DownloadOutlined />}>
              Exportar
            </Button>
          </Space>
        }
      >
        <Table 
          columns={columns} 
          dataSource={mockTransactions} 
          pagination={{ pageSize: 10 }}
          scroll={{ x: 600 }}
        />
      </Card>
    </div>
  );
};

export default Finance;