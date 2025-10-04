import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Badge, List, Avatar } from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ShopOutlined,
  RollbackOutlined,
  SwapOutlined,
  SendOutlined,
  InboxOutlined,
  TeamOutlined,
  FileTextOutlined,
  HistoryOutlined,
  LineChartOutlined,
  CreditCardOutlined,
  BankOutlined,
  CalculatorOutlined,
  GiftOutlined,
  UsergroupAddOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  HomeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ModuleCard from '../../components/ModuleCard';
import { moduleInfo } from '../../utils/menuItems';
import { mediaQueries } from '../../utils/theme';
import './Dashboard.css';

const { Title, Text } = Typography;



interface MetricCardProps {
  title: string;
  value: string | number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  trend,
  color,
}) => {
  return (
    <Card
      style={{
        borderRadius: '12px',
        border: 'none',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      }}
      bodyStyle={{ padding: '20px' }}
    >
      <Statistic
        title={
          <Text style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
            {title}
          </Text>
        }
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{
          fontSize: '24px',
          fontWeight: 600,
          color: color,
        }}
      />
      {trend && (
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {trend.isPositive ? (
            <ArrowUpOutlined style={{ color: '#10b981', fontSize: '12px' }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#ef4444', fontSize: '12px' }} />
          )}
          <Text
            style={{
              fontSize: '12px',
              color: trend.isPositive ? '#10b981' : '#ef4444',
              fontWeight: 500,
            }}
          >
            {Math.abs(trend.value)}% vs mes anterior
          </Text>
        </div>
      )}
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  // Métricas del dashboard
  const metrics = [
    {
      title: 'Ventas del Día',
      value: '$12,450',
      color: '#10b981',
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: 'Productos en Stock',
      value: '1,234',
      color: '#3b82f6',
      trend: { value: 3.2, isPositive: false },
    },
    {
      title: 'Clientes Activos',
      value: '856',
      color: '#8b5cf6',
      trend: { value: 8.1, isPositive: true },
    },
    {
      title: 'Pedidos Pendientes',
      value: '23',
      color: '#f59e0b',
    },
  ];

  // Configuración del grid de módulos (4x4 + 1 = 17 módulos)
  const dashboardModules = [
    // Fila 1
    [
      moduleInfo.pos,
      moduleInfo.returns,
      moduleInfo.transfer,
      moduleInfo.money,
    ],
    // Fila 2
    [
      moduleInfo.inventory,
      moduleInfo.expenses,
      moduleInfo.payroll,
      moduleInfo.inventoryLog,
    ],
    // Fila 3
    [
      moduleInfo.sales,
      moduleInfo.accounts,
      moduleInfo.banks,
      moduleInfo.cash,
    ],
    // Fila 4
    [
      moduleInfo.products,
      moduleInfo.customers,
      moduleInfo.sellers,
      moduleInfo.branches,
    ],
    // Fila 5
    [
      moduleInfo.priceList,
      null,
      null,
      null,
    ],
  ];

  return (
    <div style={{ padding: '0' }}>
      {/* Header del Dashboard */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
          Bienvenido al Sistema Zarpar
        </Title>
        <Text style={{ fontSize: '16px', color: '#6b7280' }}>
          Gestiona tu negocio de manera integral desde un solo lugar
        </Text>
      </div>

      {/* Métricas principales */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        {metrics.map((metric, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <MetricCard {...metric} />
          </Col>
        ))}
      </Row>

      {/* Grid de módulos */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={3} style={{ margin: '0 0 24px 0', color: '#1f2937' }}>
          Módulos del Sistema
        </Title>
        
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          {dashboardModules.map((row, rowIndex) => (
            row.map((module, colIndex) => (
              module ? (
                <Col 
                  xs={12} 
                  sm={12} 
                  md={6} 
                  lg={6} 
                  xl={6}
                  key={`${rowIndex}-${colIndex}`}
                >
                  <ModuleCard
                    title={module.title}
                    description={module.description}
                    icon={module.icon}
                    gradient={module.gradient}
                    color={module.color}
                    path={module.path}
                    onClick={() => handleModuleClick(module.path)}
                  />
                </Col>
              ) : (
                <Col 
                  xs={0} 
                  sm={0} 
                  md={6} 
                  lg={6} 
                  xl={6}
                  key={`empty-${rowIndex}-${colIndex}`}
                >
                </Col>
              )
            ))
          )).flat()}
        </Row>
      </div>

      {/* Sección de accesos rápidos */}
      <Card
        title="Accesos Rápidos"
        style={{
          borderRadius: '12px',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong style={{ color: '#1f2937' }}>Ventas Recientes</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#6b7280' }}>Venta #001234</Text>
                <Badge status="success" text="$450.00" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#6b7280' }}>Venta #001235</Text>
                <Badge status="success" text="$320.50" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#6b7280' }}>Venta #001236</Text>
                <Badge status="success" text="$180.25" />
              </div>
            </Space>
          </Col>
          
          <Col xs={24} sm={8}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong style={{ color: '#1f2937' }}>Stock Bajo</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#6b7280' }}>Producto A</Text>
                <Badge status="warning" text="5 unidades" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#6b7280' }}>Producto B</Text>
                <Badge status="error" text="2 unidades" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#6b7280' }}>Producto C</Text>
                <Badge status="warning" text="8 unidades" />
              </div>
            </Space>
          </Col>
          
          <Col xs={24} sm={8}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong style={{ color: '#1f2937' }}>Tareas Pendientes</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#6b7280' }}>Revisar inventario</Text>
                <Badge status="processing" text="Pendiente" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#6b7280' }}>Actualizar precios</Text>
                <Badge status="processing" text="Pendiente" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#6b7280' }}>Cerrar caja</Text>
                <Badge status="default" text="Programado" />
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;